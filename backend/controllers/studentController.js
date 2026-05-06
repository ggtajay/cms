const Student = require('../models/Student')
const User = require('../models/User')
const Attendance = require('../models/Attendance')
const Fee = require('../models/Fee')
const asyncHandler = require('express-async-handler')
const { generateStudentId } = require('../utils/idGenerator')
const { generatePassword } = require('../utils/passwordGenerator')
const { sendCredentials } = require('../utils/mailer')
const { sendSMS } = require('../utils/sms')

const getProfileImagePath = (file) =>
  file ? `/uploads/profiles/${file.filename}` : ''

// ─── Calculate profile completion ─────────────────────────────────────────────
const calcCompletion = (student) => {
  const fields = [
    student.name,
    student.email,
    student.phone,
    student.dateOfBirth,
    student.gender,
    student.address,
    student.bloodGroup,
    student.category,
    student.parentName,
    student.parentPhone,
    student.course,
    student.department,
    student.documents?.photo,
    student.documents?.marksheet10th,
    student.documents?.marksheet12th,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

// @desc    Get all students
// @route   GET /api/students
// @access  Private (admin, superadmin, accountant)
const getStudents = asyncHandler(async (req, res) => {
  const { course, department, semester, section, status } = req.query
  const filter = {}
  if (course) filter.course = course
  if (department) filter.department = department
  if (semester) filter.semester = parseInt(semester)
  if (section) filter.section = section
  if (status) filter.admissionStatus = status

  const students = await Student.find(filter)
    .populate('user', 'isActive email')
    .sort({ createdAt: -1 })
  res.json(students)
})

// @desc    Get children linked to current parent
// @route   GET /api/students/linked-children
// @access  Private (parent)
const getLinkedChildren = asyncHandler(async (req, res) => {
  const email = req.user.email?.trim().toLowerCase()
  const phone = req.user.phone?.trim()

  const filters = []
  if (email) filters.push({ parentEmail: email })
  if (phone) filters.push({ parentPhone: phone })

  if (filters.length === 0) return res.json({ children: [] })

  const children = await Student.find({ $or: filters }).sort({ createdAt: -1 })

  const enrichedChildren = await Promise.all(
    children.map(async (student) => {
      const attendance = await Attendance.find({ student: student._id })
      const fees = await Fee.find({ student: student._id })
      const presentCount = attendance.filter((i) => i.status === 'present').length
      const attendancePercentage = attendance.length
        ? ((presentCount / attendance.length) * 100).toFixed(2)
        : '0.00'
      const feeSummary = {
        total: fees.reduce((s, f) => s + f.totalAmount, 0),
        paid:  fees.reduce((s, f) => s + f.paidAmount, 0),
        due:   fees.reduce((s, f) => s + f.dueAmount, 0),
      }
      return {
        ...student.toObject(),
        attendanceSummary: { total: attendance.length, present: presentCount, percentage: attendancePercentage },
        feeSummary,
      }
    })
  )

  res.json({ children: enrichedChildren })
})

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('user', '-password')
    .populate('department', 'name code')
    .populate('course', 'name code')
    .populate('branch', 'name code')
  if (!student) {
    res.status(404)
    throw new Error('Student not found')
  }
  res.json(student)
})

// @desc    Create new student (auto-generates ID & password, sends credentials email)
// @route   POST /api/students
// @access  Private (admin, superadmin)
const createStudent = asyncHandler(async (req, res) => {
  const {
    name, email, phone, dateOfBirth, gender, address,
    course, department, branch, semester, section,
    parentName, parentPhone, parentEmail, parentRelation,
    bloodGroup, category, aadhaar,
  } = req.body
  const profileImage = getProfileImagePath(req.file)

  // ── Duplicate check ──────────────────────────────────────────────────────────
  const emailExists = await User.findOne({ email: email?.toLowerCase()?.trim() })
  if (emailExists) {
    res.status(400)
    throw new Error('A user already exists with this email address')
  }

  // ── Auto-generate ID & password ──────────────────────────────────────────────
  const studentId = await generateStudentId()
  const password  = generatePassword()

  // ── Create linked User account ───────────────────────────────────────────────
  const user = await User.create({
    userId: studentId,
    name,
    email,
    phone,
    dateOfBirth,
    gender,
    address,
    profileImage,
    password,
    role: 'student',
    isFirstLogin: true,
  })

  // ── Create Student record ────────────────────────────────────────────────────
  const student = await Student.create({
    studentId,
    rollNumber: studentId,   // keep rollNumber in sync
    name,
    email,
    phone,
    dateOfBirth,
    gender,
    address,
    bloodGroup: bloodGroup || '',
    category: category || '',
    aadhaar: aadhaar || '',
    profileImage,
    course,
    department,
    branch,
    semester: parseInt(semester) || 1,
    section: section || 'A',
    admissionYear: new Date().getFullYear(),
    parentName,
    parentPhone,
    parentEmail: parentEmail || '',
    parentRelation: parentRelation || 'Parent',
    user: user._id,
  })

  // Update profile completion
  student.profileCompletion = calcCompletion(student)
  await student.save()

  // ── Send credentials email (non-blocking) ────────────────────────────────────
  const loginUrl = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/login`
    : 'http://localhost:3000/login'

  const emailResult = await sendCredentials({
    to: email,
    name,
    userId: studentId,
    tempPassword: password,
    role: 'student',
    loginUrl,
  })

  // ── Send SMS credentials (non-blocking) ──────────────────────────────────────
  let smsSent = false
  if (phone) {
    const message = `Welcome to CMS, ${name}! Your Login ID is ${studentId} and Password is ${password}. Please login at ${loginUrl}`
    smsSent = await sendSMS(phone, message)
  }

  res.status(201).json({
    message: 'Student created successfully',
    student,
    credentials: {
      userId: studentId,
      password,
      emailSent: emailResult?.success === true,
      smsSent: smsSent,
    },
  })
})

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (admin, superadmin)
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
  if (!student) {
    res.status(404)
    throw new Error('Student not found')
  }

  const profileImage = getProfileImagePath(req.file)

  // Protect auto-generated fields from being overwritten
  const { studentId: _sid, rollNumber: _rn, user: _u, ...safeBody } = req.body

  Object.assign(student, safeBody)
  if (profileImage) student.profileImage = profileImage

  student.profileCompletion = calcCompletion(student)
  await student.save()

  // Sync shared fields to User account
  if (student.user) {
    await User.findByIdAndUpdate(student.user, {
      name: student.name,
      email: student.email,
      phone: student.phone,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      address: student.address,
      profileImage: student.profileImage,
    })
  }

  res.json({ message: 'Student updated successfully', student })
})

// @desc    Upload student documents
// @route   POST /api/students/:id/documents
// @access  Private (student owns, admin manages)
const uploadStudentDocuments = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
  if (!student) {
    res.status(404)
    throw new Error('Student not found')
  }

  // req.files is keyed by field name when using .fields()
  const files = req.files || {}
  const updates = {}

  const docFields = [
    'photo', 'marksheet10th', 'marksheet12th',
    'casteCertificate', 'bonafideCertificate', 'aadhaarDocument',
  ]

  docFields.forEach((field) => {
    if (files[field]?.[0]) {
      updates[`documents.${field}`] = `/uploads/documents/${files[field][0].filename}`
    }
  })

  if (Object.keys(updates).length === 0) {
    res.status(400)
    throw new Error('No files uploaded')
  }

  const updated = await Student.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true }
  )
  updated.profileCompletion = calcCompletion(updated)
  await updated.save()

  res.json({ message: 'Documents uploaded successfully', student: updated })
})

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (admin, superadmin)
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
  if (!student) {
    res.status(404)
    throw new Error('Student not found')
  }
  if (student.user) {
    await User.findByIdAndDelete(student.user)
  }
  await Student.findByIdAndDelete(req.params.id)
  res.json({ message: 'Student deleted successfully' })
})

// @desc    Record ID card download (free first, paid after)
// @route   POST /api/students/:id/id-card-download
// @access  Private (student owns)
const recordIdCardDownload = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
  if (!student) {
    res.status(404)
    throw new Error('Student not found')
  }

  const isFree = !student.idCardDownloaded

  if (!isFree) {
    // Verify payment — paymentId must be passed in body
    if (!req.body.paymentId) {
      res.status(402)
      throw new Error('Payment required for re-download. Please complete payment first.')
    }
  }

  student.idCardDownloaded    = true
  student.idCardDownloadCount = (student.idCardDownloadCount || 0) + 1
  await student.save()

  res.json({
    message: isFree ? 'First download — free!' : 'Paid download recorded successfully',
    downloadCount: student.idCardDownloadCount,
    free: isFree,
  })
})

// @desc    Resend login credentials (generates new password)
// @route   POST /api/students/:id/resend-credentials
// @access  Private (admin, superadmin)
const resendCredentials = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate('user')
  if (!student || !student.user) {
    res.status(404)
    throw new Error('Student or associated user not found')
  }

  const password = generatePassword()
  const user = student.user
  user.password = password
  await user.save()

  const loginUrl = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/login`
    : 'http://localhost:3000/login'

  const emailResult = await sendCredentials({
    to: user.email,
    name: user.name,
    userId: student.studentId,
    tempPassword: password,
    role: 'student',
    loginUrl,
  })

  let smsSent = false
  if (user.phone) {
    const message = `Welcome to CMS, ${user.name}! Your Login ID is ${student.studentId} and Password is ${password}. Please login at ${loginUrl}`
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
  getStudents,
  getLinkedChildren,
  getStudent,
  createStudent,
  updateStudent,
  uploadStudentDocuments,
  deleteStudent,
  recordIdCardDownload,
  resendCredentials,
}
