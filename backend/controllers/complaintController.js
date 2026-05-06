const Complaint = require('../models/Complaint')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')
const { sendNotification } = require('../utils/mailer')
const path = require('path')
const fs = require('fs')

// ── Helpers ────────────────────────────────────────────────────────────────────

// Strip raisedBy identity from a complaint object for anonymous display
const sanitizeAnonymous = (doc) => {
  const obj = doc.toObject ? doc.toObject() : { ...doc }
  if (obj.isAnonymous) {
    obj.raisedBy = { _id: null, name: 'Anonymous', email: null }
  }
  return obj
}

// Notify all admins + superadmins via email (non-blocking)
const notifyAdmins = async (subject, text) => {
  try {
    const admins = await User.find({
      role: { $in: ['admin', 'superadmin'] },
      isActive: true,
    }).select('email name')

    const promises = admins.map((admin) =>
      sendNotification({
        to: admin.email,
        subject,
        text,
        html: `<div style="font-family:Arial,sans-serif;padding:20px;"><p>${text.replace(/\n/g, '<br/>')}</p></div>`,
      })
    )
    await Promise.allSettled(promises)
  } catch (err) {
    console.error('[Complaints] notifyAdmins error:', err.message)
  }
}

// Notify a specific user by their userId reference
const notifyUser = async (userId, subject, text) => {
  try {
    const user = await User.findById(userId).select('email name')
    if (!user) return
    await sendNotification({
      to: user.email,
      subject,
      text,
      html: `<div style="font-family:Arial,sans-serif;padding:20px;"><p>Dear <strong>${user.name}</strong>,</p><p>${text}</p><p>— CMS Grievance Cell</p></div>`,
    })
  } catch (err) {
    console.error('[Complaints] notifyUser error:', err.message)
  }
}

// ── Controllers ────────────────────────────────────────────────────────────────

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (student, teacher)
const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, isAnonymous } = req.body

  if (!title || !description || !category) {
    res.status(400)
    throw new Error('title, description and category are required')
  }

  const validCategories = ['ACADEMIC', 'MANAGEMENT', 'RAGGING', 'TECHNICAL', 'INFRASTRUCTURE', 'OTHER']
  if (!validCategories.includes(category)) {
    res.status(400)
    throw new Error(`category must be one of: ${validCategories.join(', ')}`)
  }

  // ── Spam prevention: max 5 complaints per user per day ────────────────────
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const todayCount = await Complaint.countDocuments({
    raisedBy: req.user._id,
    createdAt: { $gte: startOfDay },
  })
  if (todayCount >= 5) {
    res.status(429)
    throw new Error('You have reached the daily limit of 5 complaints. Please try again tomorrow.')
  }

  // ── RAGGING auto-escalates to HIGH priority ───────────────────────────────
  const priority = category === 'RAGGING' ? 'HIGH' : (req.body.priority || 'MEDIUM')

  // ── Handle uploaded attachments ───────────────────────────────────────────
  const attachments = (req.files || []).map(
    (f) => `/uploads/complaints/${f.filename}`
  )

  const complaint = await Complaint.create({
    title: title.trim(),
    description: description.trim(),
    category,
    priority,
    isAnonymous: isAnonymous === true || isAnonymous === 'true',
    raisedBy: req.user._id,
    role: req.user.role,
    attachments,
  })

  // ── Notify admins asynchronously ──────────────────────────────────────────
  const displayName = complaint.isAnonymous ? 'Anonymous User' : req.user.name
  const urgencyTag = category === 'RAGGING' ? '[⚠️ RAGGING — HIGH PRIORITY] ' : ''
  notifyAdmins(
    `${urgencyTag}New Complaint: ${title}`,
    `A new ${category} complaint has been submitted.\n\nFrom: ${displayName}\nTitle: ${title}\nPriority: ${priority}\n\nPlease log in to the CMS Admin Panel to review and respond.`
  )

  res.status(201).json({
    message: 'Complaint submitted successfully',
    complaintId: complaint._id,
    priority,
  })
})

// @desc    Get logged-in user's own complaints
// @route   GET /api/complaints/my
// @access  Private (student, teacher)
const getMyComplaints = asyncHandler(async (req, res) => {
  const { status, category } = req.query
  const filter = { raisedBy: req.user._id }
  if (status) filter.status = status
  if (category) filter.category = category

  const complaints = await Complaint.find(filter)
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })

  res.json(complaints)
})

// @desc    Get all complaints (admin view, with filters)
// @route   GET /api/complaints
// @access  Private (admin, superadmin)
const getAllComplaints = asyncHandler(async (req, res) => {
  const { status, category, priority, escalated, page = 1, limit = 20 } = req.query
  const filter = {}
  if (status)    filter.status    = status
  if (category)  filter.category  = category
  if (priority)  filter.priority  = priority
  if (escalated !== undefined) filter.escalated = escalated === 'true'

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .populate('raisedBy', 'name email role userId')
      .populate('assignedTo', 'name email userId')
      .sort({ priority: -1, createdAt: -1 }) // HIGH first, then newest
      .skip(skip)
      .limit(parseInt(limit)),
    Complaint.countDocuments(filter),
  ])

  // Sanitize anonymous complaints
  const sanitized = complaints.map(sanitizeAnonymous)

  res.json({
    complaints: sanitized,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
  })
})

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (admin, superadmin)
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']

  if (!validStatuses.includes(status)) {
    res.status(400)
    throw new Error(`status must be one of: ${validStatuses.join(', ')}`)
  }

  const complaint = await Complaint.findById(req.params.id)
  if (!complaint) {
    res.status(404)
    throw new Error('Complaint not found')
  }

  const oldStatus = complaint.status
  complaint.status = status
  if (status === 'RESOLVED') {
    complaint.resolvedAt = new Date()
  }
  await complaint.save()

  // ── Notify the complainant ─────────────────────────────────────────────────
  const statusMessages = {
    IN_PROGRESS: 'Your complaint is now being reviewed by our team.',
    RESOLVED: 'Your complaint has been resolved. We hope your issue has been addressed satisfactorily.',
    REJECTED: 'Your complaint has been reviewed and could not be processed at this time.',
    PENDING: 'Your complaint status has been updated.',
  }
  notifyUser(
    complaint.raisedBy,
    `Complaint Update: ${complaint.title}`,
    `Your complaint "${complaint.title}" has been updated.\n\nStatus: ${oldStatus} → ${status}\n\n${statusMessages[status]}`
  )

  res.json({ message: `Status updated to ${status}`, status })
})

// @desc    Add admin response to a complaint
// @route   PUT /api/complaints/:id/respond
// @access  Private (admin, superadmin)
const respondToComplaint = asyncHandler(async (req, res) => {
  const { response } = req.body

  if (!response || !response.trim()) {
    res.status(400)
    throw new Error('Response text is required')
  }

  const complaint = await Complaint.findById(req.params.id)
  if (!complaint) {
    res.status(404)
    throw new Error('Complaint not found')
  }

  complaint.response = response.trim()
  // Auto-move to IN_PROGRESS when admin responds (if still PENDING)
  if (complaint.status === 'PENDING') {
    complaint.status = 'IN_PROGRESS'
  }
  await complaint.save()

  // Notify complainant about the response
  notifyUser(
    complaint.raisedBy,
    `Response to your complaint: ${complaint.title}`,
    `The admin has responded to your complaint.\n\nComplaint: ${complaint.title}\n\nResponse:\n${response}\n\nPlease log in to view the full details.`
  )

  res.json({ message: 'Response added successfully' })
})

// @desc    Assign complaint to a staff member
// @route   PUT /api/complaints/:id/assign
// @access  Private (admin, superadmin)
const assignComplaint = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body

  if (!assignedTo) {
    res.status(400)
    throw new Error('assignedTo (userId) is required')
  }

  const staff = await User.findById(assignedTo)
  if (!staff) {
    res.status(404)
    throw new Error('Assigned user not found')
  }

  const complaint = await Complaint.findById(req.params.id)
  if (!complaint) {
    res.status(404)
    throw new Error('Complaint not found')
  }

  complaint.assignedTo = assignedTo
  if (complaint.status === 'PENDING') {
    complaint.status = 'IN_PROGRESS'
  }
  await complaint.save()

  res.json({ message: `Complaint assigned to ${staff.name}` })
})

// @desc    Get complaint stats for admin dashboard
// @route   GET /api/complaints/stats
// @access  Private (admin, superadmin)
const getComplaintStats = asyncHandler(async (req, res) => {
  const [total, pending, inProgress, resolved, rejected, ragging, escalated] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: 'PENDING' }),
    Complaint.countDocuments({ status: 'IN_PROGRESS' }),
    Complaint.countDocuments({ status: 'RESOLVED' }),
    Complaint.countDocuments({ status: 'REJECTED' }),
    Complaint.countDocuments({ category: 'RAGGING' }),
    Complaint.countDocuments({ escalated: true }),
  ])

  res.json({ total, pending, inProgress, resolved, rejected, ragging, escalated })
})

// @desc    Run escalation job (called by cron or manually)
// @route   POST /api/complaints/escalate (internal/admin)
// @access  Private (superadmin)
const runEscalation = asyncHandler(async (req, res) => {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

  const toEscalate = await Complaint.find({
    status: { $in: ['PENDING', 'IN_PROGRESS'] },
    createdAt: { $lte: threeDaysAgo },
    escalated: false,
  })

  let escalated = 0
  for (const complaint of toEscalate) {
    complaint.escalated  = true
    complaint.escalatedAt = new Date()
    complaint.priority   = 'HIGH'
    await complaint.save()
    escalated++
  }

  if (escalated > 0) {
    notifyAdmins(
      `[Auto-Escalation] ${escalated} complaint(s) escalated`,
      `${escalated} unresolved complaint(s) have been automatically escalated to HIGH priority after 3 days.\n\nPlease log in to the Admin Panel to review them immediately.`
    )
  }

  res.json({ message: `Escalated ${escalated} complaint(s)` })
})

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateStatus,
  respondToComplaint,
  assignComplaint,
  getComplaintStats,
  runEscalation,
}
