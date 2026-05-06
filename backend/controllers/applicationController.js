const Application = require('../models/Application')
const OtpSession = require('../models/OtpSession')
const User = require('../models/User')
const Student = require('../models/Student')
const Course = require('../models/Course')
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { generateAppId, generateStudentId } = require('../utils/idGenerator')
const { sendCredentials } = require('../utils/mailer')
const { sendSMS } = require('../utils/sms')

const getProfileImagePath = (file) => (file ? file.path : '')
const getDocPath = (file) => (file ? file.path : '')

// ── Helpers ────────────────────────────────────────────────────────────────────

// Verify OTP session for a given email + mobile pair
const verifySession = async (email, mobile) => {
  const session = await OtpSession.findOne({
    email: email.toLowerCase().trim(),
    mobile: mobile.trim(),
  })
  if (!session || !session.isVerified) {
    throw new Error('Please verify your email and mobile number first')
  }
  return session
}

// Generate a random alphanumeric password
const generateRandomPassword = (len = 12) =>
  crypto.randomBytes(len).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, len)

// Create User + Student profile after approval.
// Sends login credentials via email and SMS.
const createUserAndStudent = async (application) => {
  const studentId = await generateStudentId()
  const plainPassword = generateRandomPassword(12)

  const user = await User.create({
    name: application.name,
    email: application.email,
    phone: application.phone || application.mobile,
    userId: studentId,
    password: plainPassword, // hashed by User pre-save hook
    role: 'student',
    isFirstLogin: true,
    address: application.address || '',
  })

  // Build a minimal Student document.
  // Admin fills in missing details (dob, gender, etc.) via EditStudent.
  const student = new Student({
    studentId,
    rollNumber: studentId,
    name: application.name,
    email: application.email,
    phone: application.phone || application.mobile,
    address: application.address || 'To be updated',
    course: application.course,
    dateOfBirth: new Date('2000-01-01'), // placeholder — admin must update
    gender: 'other',
    parentName: 'To be updated',
    parentPhone: '0000000000',
    semester: 1,
    admissionYear: new Date().getFullYear(),
    user: user._id,
    documents: application.documents || {},
  })
  await student.save({ validateBeforeSave: false })

  // Send credentials (userId + plaintext password so student can log in)
  await sendCredentials({
    to: user.email,
    name: user.name,
    userId: studentId,
    tempPassword: plainPassword,
    role: 'student',
  })

  await sendSMS(
    user.phone || '',
    `Welcome to CMS, ${user.name}! Your Student ID is ${studentId}. Check your email for login credentials.`
  )

  return user
}

// ── Public Endpoints ───────────────────────────────────────────────────────────

// @desc    Apply for Regular Admission
// @route   POST /api/applications/apply-regular
// @access  Public
const applyRegular = asyncHandler(async (req, res) => {
  const { name, email, mobile, phone, course, address, qualification, appFeePaymentId } = req.body

  const phoneNum = phone || mobile

  if (!name || !email || !phoneNum || !course) {
    res.status(400)
    throw new Error('Please provide all required fields: name, email, phone, course')
  }

  // 1. Verify OTP session
  try {
    await verifySession(email, phoneNum)
  } catch (err) {
    res.status(400)
    throw new Error(err.message)
  }

  // 2. Gate on application fee payment — must be verified by backend first
  const feePaid = await Application.findOne({ appFeePaymentId, applicationFeePaid: true }).select('_id applicationFeePaid')
  if (!appFeePaymentId || !feePaid) {
    // Alternative: allow if a temp-verified flag is passed via the payment verify endpoint
    // Check if the payment record is attached directly
    const tempRecord = await Application.findOne({ appFeePaymentId })
    if (!tempRecord || !tempRecord.applicationFeePaid) {
      res.status(402)
      throw new Error('Application fee payment required. Please complete the ₹50 application fee first.')
    }
  }

  // 3. Check existing user
  const userExists = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { phone: phoneNum }],
  })
  if (userExists) {
    res.status(400)
    throw new Error('A user account already exists with this email or phone')
  }

  // 4. Check for duplicate active application (pending/approved)
  const existingApp = await Application.findOne({
    email: email.toLowerCase(),
    course,
    status: { $in: ['pending', 'approved'] },
  })
  if (existingApp) {
    res.status(400)
    throw new Error('You already have an active application for this course')
  }

  // 5. Process uploaded documents
  const files = req.files || {}
  const documents = {
    photo: getProfileImagePath(files['photo']?.[0]),
    previousMarksheet: getDocPath(files['previousMarksheet']?.[0]),
    idProof: getDocPath(files['idProof']?.[0]),
  }

  const appId = await generateAppId()

  const application = await Application.create({
    applicationId: appId,
    name,
    email,
    phone: phoneNum,
    mobile: phoneNum,
    mode: 'regular',
    type: 'regular',
    course,
    address: address || '',
    qualification: qualification || '',
    documents,
    applicationFeePaid: true,
    appFeePaymentId: appFeePaymentId || '',
    paymentStatus: 'paid',
  })

  res.status(201).json({
    message: 'Application submitted successfully. You will be notified of the review outcome.',
    applicationId: appId,
  })
})

// @desc    Apply for Online Course (Razorpay course fee flow)
// @route   POST /api/applications/apply-online
// @access  Public
const applyOnline = asyncHandler(async (req, res) => {
  const { name, email, mobile, phone, course, paymentStatus, appFeePaymentId } = req.body

  const phoneNum = phone || mobile

  if (!name || !email || !phoneNum || !course || paymentStatus !== 'paid') {
    res.status(400)
    throw new Error('Invalid request or course payment not completed')
  }

  try {
    await verifySession(email, phoneNum)
  } catch (err) {
    res.status(400)
    throw new Error(err.message)
  }

  // Gate on application fee
  if (!appFeePaymentId) {
    res.status(402)
    throw new Error('Application fee payment required before enrollment')
  }

  const userExists = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { phone: phoneNum }],
  })
  if (userExists) {
    res.status(400)
    throw new Error('A user account already exists with this email or phone')
  }

  // Duplicate check
  const existingApp = await Application.findOne({
    email: email.toLowerCase(),
    course,
    status: { $in: ['pending', 'approved'] },
  })
  if (existingApp) {
    res.status(400)
    throw new Error('You already have an active application for this course')
  }

  const appId = await generateAppId()

  const application = await Application.create({
    applicationId: appId,
    name,
    email,
    phone: phoneNum,
    mobile: phoneNum,
    mode: 'online',
    type: 'online',
    course,
    status: 'approved', // Auto-approve — course fee already paid
    paymentStatus: 'paid',
    applicationFeePaid: true,
    appFeePaymentId: appFeePaymentId || '',
  })

  // Create user automatically since course fee is paid
  const user = await createUserAndStudent(application)

  res.status(201).json({
    message: 'Enrollment successful! Check your email for login credentials.',
    applicationId: appId,
    userId: user.userId,
  })
})

// @desc    Track Application Status (public — by applicationId)
// @route   GET /api/applications/track/:id
// @access  Public
const trackApplication = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    applicationId: req.params.id,
  }).populate('course', 'name code')

  if (!application) {
    res.status(404)
    throw new Error('Application not found')
  }

  res.json({
    applicationId: application.applicationId,
    name: application.name,
    mode: application.mode || application.type,
    course: application.course?.name,
    status: application.status,
    applicationFeePaid: application.applicationFeePaid,
    isWalkIn: application.isWalkIn,
    appliedAt: application.appliedAt,
    ...(application.status === 'rejected' && {
      rejectionReason: application.rejectionReason,
    }),
  })
})

// ── Admin Endpoints ────────────────────────────────────────────────────────────

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private (Admin/SuperAdmin)
const getApplications = asyncHandler(async (req, res) => {
  const { status, mode } = req.query
  const filter = {}
  if (status) filter.status = status
  if (mode) filter.mode = mode

  const applications = await Application.find(filter)
    .populate('course', 'name code deliveryMode')
    .populate('createdByStaff', 'name userId')
    .sort({ createdAt: -1 })

  res.json(applications)
})

// @desc    Approve application — creates user account and sends credentials
// @route   PUT /api/applications/:id/approve
// @access  Private (Admin/SuperAdmin)
const approveApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate('course', 'name')

  if (!application) {
    res.status(404)
    throw new Error('Application not found')
  }

  if (application.status === 'approved') {
    res.status(400)
    throw new Error('Application is already approved')
  }

  if (application.status === 'rejected') {
    res.status(400)
    throw new Error('Cannot approve a rejected application')
  }

  // Prevent duplicate user creation
  const userExists = await User.findOne({
    $or: [
      { email: application.email },
      { phone: application.phone || application.mobile },
    ],
  })
  if (userExists) {
    res.status(400)
    throw new Error('A user account already exists for this applicant')
  }

  application.status = 'approved'
  application.approvedAt = Date.now()
  await application.save()

  // Create User + Student profile — credentials email is sent inside createUserAndStudent()
  const user = await createUserAndStudent(application)

  res.json({
    message: `Application approved. Student account created (${user.userId}) and credentials sent to ${user.email}.`,
    userId: user.userId,
  })
})

// @desc    Reject application
// @route   PUT /api/applications/:id/reject
// @access  Private (Admin/SuperAdmin)
const rejectApplication = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const application = await Application.findById(req.params.id)

  if (!application) {
    res.status(404)
    throw new Error('Application not found')
  }

  if (application.status === 'approved') {
    res.status(400)
    throw new Error('Cannot reject an already approved application')
  }

  application.status = 'rejected'
  application.rejectionReason = reason || 'Not eligible'
  await application.save()

  res.json({ message: 'Application rejected successfully' })
})

// @desc    Unified status update — supports the admin panel /status endpoint
// @route   PUT /api/applications/:id/status
// @access  Private (Admin/SuperAdmin)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body

  if (!['approved', 'rejected'].includes(status)) {
    res.status(400)
    throw new Error('Status must be either "approved" or "rejected"')
  }

  if (status === 'approved') {
    req.params.id = req.params.id
    return approveApplication(req, res)
  }

  req.body.reason = rejectionReason
  return rejectApplication(req, res)
})

// @desc    Walk-in admission by staff/admin — skips OTP, optionally marks fee paid
// @route   POST /api/applications/walk-in
// @access  Private (Admin/SuperAdmin)
const createWalkInApplication = asyncHandler(async (req, res) => {
  const { name, email, phone, mobile, course, mode, offlinePaymentCollected, address, qualification } = req.body

  const phoneNum = phone || mobile

  if (!name || !email || !phoneNum || !course || !mode) {
    res.status(400)
    throw new Error('Please provide: name, email, phone, course, mode')
  }

  if (!['online', 'regular'].includes(mode)) {
    res.status(400)
    throw new Error('mode must be "online" or "regular"')
  }

  // Check existing user
  const userExists = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { phone: phoneNum }],
  })
  if (userExists) {
    res.status(400)
    throw new Error('A user account already exists with this email or phone')
  }

  // Duplicate active application check
  const existingApp = await Application.findOne({
    email: email.toLowerCase(),
    course,
    status: { $in: ['pending', 'approved'] },
  })
  if (existingApp) {
    res.status(400)
    throw new Error('An active application already exists for this email + course combination')
  }

  // Staff vouches for offline payment collection
  const feePaid = offlinePaymentCollected === true || offlinePaymentCollected === 'true'

  const appId = await generateAppId()

  const application = await Application.create({
    applicationId: appId,
    name,
    email,
    phone: phoneNum,
    mobile: phoneNum,
    mode,
    type: mode,
    course,
    address: address || '',
    qualification: qualification || '',
    applicationFeePaid: feePaid,
    paymentStatus: feePaid ? 'paid' : 'pending',
    isWalkIn: true,
    createdByStaff: req.user._id, // audit trail
  })

  res.status(201).json({
    message: `Walk-in application created successfully${feePaid ? ' (application fee marked as paid)' : ''}`,
    applicationId: appId,
    isWalkIn: true,
    applicationFeePaid: feePaid,
    createdByStaff: req.user.name,
  })
})

module.exports = {
  applyRegular,
  applyOnline,
  trackApplication,
  getApplications,
  approveApplication,
  rejectApplication,
  updateApplicationStatus,
  createWalkInApplication,
}
