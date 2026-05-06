const Faculty = require('../models/Faculty')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')
const { generateFacultyId } = require('../utils/idGenerator')
const { generatePassword } = require('../utils/passwordGenerator')
const { sendCredentials } = require('../utils/mailer')
const { sendSMS } = require('../utils/sms')

const getProfileImagePath = (file) =>
  file ? file.path : ''

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normalizeSubjects = (subjects) => {
  if (Array.isArray(subjects)) return subjects
  if (typeof subjects === 'string' && subjects.trim()) {
    try {
      return JSON.parse(subjects)
    } catch {
      return subjects.split(',').map((s) => s.trim()).filter(Boolean)
    }
  }
  return []
}

const normalizeEmergencyContact = (emergencyContact) => {
  if (!emergencyContact) return { name: '', phone: '', relation: '' }
  if (typeof emergencyContact === 'string') {
    try { return JSON.parse(emergencyContact) } catch { return { name: '', phone: '', relation: '' } }
  }
  return emergencyContact
}

const calcCompletion = (faculty) => {
  const fields = [
    faculty.name,
    faculty.email,
    faculty.phone,
    faculty.dateOfBirth,
    faculty.gender,
    faculty.address,
    faculty.designation,
    faculty.department,
    faculty.qualification,
    faculty.subjects?.length > 0,
    faculty.documents?.photo,
    faculty.documents?.degreeCertificate,
    faculty.documents?.idProof,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

// @desc    Get all faculty
// @route   GET /api/faculty
// @access  Private (admin, superadmin)
const getFaculty = asyncHandler(async (req, res) => {
  const { department, designation, status } = req.query
  const filter = {}
  if (department) filter.department = department
  if (designation) filter.designation = designation
  if (status) filter.employmentStatus = status

  const faculty = await Faculty.find(filter)
    .populate('user', 'isActive email')
    .sort({ createdAt: -1 })
  res.json(faculty)
})

// @desc    Get single faculty
// @route   GET /api/faculty/:id
// @access  Private
const getSingleFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id)
    .populate('user', '-password')
    .populate('department', 'name code')
  if (!faculty) {
    res.status(404)
    throw new Error('Faculty not found')
  }
  res.json(faculty)
})

// @desc    Create new faculty (auto-generates ID & password, sends credentials email)
// @route   POST /api/faculty
// @access  Private (admin, superadmin)
const createFaculty = asyncHandler(async (req, res) => {
  const {
    name, email, phone, dateOfBirth, gender, address,
    designation, department, qualification, specialization,
    experience, subjects, salary, emergencyContact,
  } = req.body
  const profileImage = getProfileImagePath(req.file)
  const normalizedSubjects = normalizeSubjects(subjects)
  const normalizedEmergencyContact = normalizeEmergencyContact(emergencyContact)

  // ── Duplicate check ──────────────────────────────────────────────────────────
  // ── Verify OTP Session ────────────────────────────────────────────────────
  if (!email || !phone) {
    res.status(400)
    throw new Error('Email and phone are required for verification')
  }

  const OtpSession = require('../models/OtpSession')
  const session = await OtpSession.findOne({ email: email.toLowerCase().trim(), mobile: phone.trim() })
  if (!session || !session.isVerified) {
    res.status(400)
    throw new Error('Please verify email and mobile via OTP first')
  }

  // ── Duplicate check ──────────────────────────────────────────────────────────
  const emailExists = await User.findOne({ email: email.toLowerCase().trim() })
  if (emailExists) {
    res.status(400)
    throw new Error('A user already exists with this email address')
  }

  // ── Auto-generate ID & password ──────────────────────────────────────────────
  const facultyId = await generateFacultyId()
  const jwt = require('jsonwebtoken')
  const token = jwt.sign({ id: facultyId, role: 'teacher' }, process.env.JWT_SECRET, { expiresIn: '24h' })
  const setPasswordUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/set-password?token=${token}`
  const tempPassword = require('crypto').randomBytes(16).toString('hex')

  // ── Create linked User account ───────────────────────────────────────────────
  const user = await User.create({
    userId: facultyId,
    name,
    email,
    phone,
    dateOfBirth,
    gender,
    address,
    profileImage,
    password: tempPassword,
    role: 'teacher',
    isFirstLogin: true
  })

  // ── Create Faculty record ────────────────────────────────────────────────────
  const faculty = await Faculty.create({
    facultyId,
    employeeId: facultyId,   // keep employeeId in sync
    name,
    email,
    phone,
    dateOfBirth,
    gender,
    address,
    profileImage,
    designation,
    department,
    qualification,
    specialization: specialization || '',
    experience: parseInt(experience) || 0,
    subjects: normalizedSubjects,
    salary: parseInt(salary) || 0,
    emergencyContact: normalizedEmergencyContact,
    joiningYear: new Date().getFullYear(),
    user: user._id,
  })

  faculty.profileCompletion = calcCompletion(faculty)
  await faculty.save()

  // ── Send credentials email ────────────────────────────────────────────────────
  const loginUrl = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/login`
    : 'http://localhost:3000/login'

  const emailResult = await sendCredentials({
    to: user.email,
    name: user.name,
    userId: faculty.facultyId,
    role: 'teacher',
    setPasswordUrl
  })

  let smsSent = false
  if (user.phone) {
    const message = `Welcome to CMS, ${user.name}! A link to reset your password has been sent to your email.`
    smsSent = await sendSMS(user.phone, message)
  }

  if (emailResult?.success) {
    res.json({ message: 'Credentials sent successfully', emailSent: true, smsSent })
  } else {
    res.status(500)
    throw new Error(emailResult?.error || 'Failed to send email credentials')
  }
})
// @desc    Update faculty
// @route   PUT /api/faculty/:id
// @access  Private (admin, superadmin)
const updateFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id)
  if (!faculty) {
    res.status(404)
    throw new Error('Faculty not found')
  }

  const profileImage = getProfileImagePath(req.file)

  // Protect auto-generated fields
  const { facultyId: _fid, employeeId: _eid, user: _u, ...safeBody } = req.body

  Object.assign(faculty, safeBody)

  if (req.body.subjects !== undefined) faculty.subjects = normalizeSubjects(req.body.subjects)
  if (req.body.emergencyContact !== undefined) faculty.emergencyContact = normalizeEmergencyContact(req.body.emergencyContact)
  if (profileImage) faculty.profileImage = profileImage

  faculty.profileCompletion = calcCompletion(faculty)
  await faculty.save()

  if (faculty.user) {
    await User.findByIdAndUpdate(faculty.user, {
      name: faculty.name,
      email: faculty.email,
      phone: faculty.phone,
      dateOfBirth: faculty.dateOfBirth,
      gender: faculty.gender,
      address: faculty.address,
      profileImage: faculty.profileImage,
    })
  }

  res.json({ message: 'Faculty updated successfully', faculty })
})

// @desc    Upload faculty documents
// @route   POST /api/faculty/:id/documents
// @access  Private (teacher owns, admin manages)
const uploadFacultyDocuments = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id)
  if (!faculty) {
    res.status(404)
    throw new Error('Faculty not found')
  }

  const files = req.files || {}
  const updates = {}

  const docFields = ['photo', 'degreeCertificate', 'idProof', 'experienceLetter']
  docFields.forEach((field) => {
    if (files[field]?.[0]) {
      updates[`documents.${field}`] = files[field][0].path
    }
  })

  if (Object.keys(updates).length === 0) {
    res.status(400)
    throw new Error('No files uploaded')
  }

  const updated = await Faculty.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true })
  updated.profileCompletion = calcCompletion(updated)
  await updated.save()

  res.json({ message: 'Documents uploaded successfully', faculty: updated })
})

// @desc    Delete faculty
// @route   DELETE /api/faculty/:id
// @access  Private (admin, superadmin)
const deleteFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id)
  if (!faculty) {
    res.status(404)
    throw new Error('Faculty not found')
  }
  if (faculty.user) {
    await User.findByIdAndDelete(faculty.user)
  }
  await Faculty.findByIdAndDelete(req.params.id)
  res.json({ message: 'Faculty deleted successfully' })
})

// @desc    Record ID card download
// @route   POST /api/faculty/:id/id-card-download
// @access  Private (teacher owns)
const recordIdCardDownload = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id)
  if (!faculty) {
    res.status(404)
    throw new Error('Faculty not found')
  }

  const isFree = !faculty.idCardDownloaded

  if (!isFree && !req.body.paymentId) {
    res.status(402)
    throw new Error('Payment required for re-download. Please complete payment first.')
  }

  faculty.idCardDownloaded    = true
  faculty.idCardDownloadCount = (faculty.idCardDownloadCount || 0) + 1
  await faculty.save()

  res.json({
    message: isFree ? 'First download — free!' : 'Paid download recorded successfully',
    downloadCount: faculty.idCardDownloadCount,
    free: isFree,
  })
})

// @desc    Resend login credentials (generates new password)
// @route   POST /api/faculty/:id/resend-credentials
// @access  Private (admin, superadmin)
const resendCredentials = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id).populate('user')
  if (!faculty || !faculty.user) {
    res.status(404)
    throw new Error('Faculty or associated user not found')
  }

  const jwt = require('jsonwebtoken')
  const token = jwt.sign({ id: faculty.facultyId, role: 'teacher' }, process.env.JWT_SECRET, { expiresIn: '24h' })
  const setPasswordUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/set-password?token=${token}`
  const user = faculty.user

  const emailResult = await sendCredentials({
    to: user.email,
    name: user.name,
    userId: faculty.facultyId,
    role: 'teacher',
    setPasswordUrl
  })

  let smsSent = false
  if (user.phone) {
    const message = `Welcome to CMS, ${user.name}! A link to reset your password has been sent to your email.`
    smsSent = await sendSMS(user.phone, message)
  }

  if (emailResult?.success) {
    res.json({ message: 'Credentials sent successfully', emailSent: true, smsSent })
  } else {
    res.status(500)
    throw new Error(emailResult?.error || 'Failed to send email credentials')
  }
})
module.exports = {
  getFaculty,
  getSingleFaculty,
  createFaculty,
  updateFaculty,
  uploadFacultyDocuments,
  deleteFaculty,
  recordIdCardDownload,
  resendCredentials,
}
