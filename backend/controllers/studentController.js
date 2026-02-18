const Student = require('../models/Student')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

// @desc    Get all students
// @route   GET /api/students
// @access  Private (admin, superadmin)
const getStudents = asyncHandler(async (req, res) => {
  const students = await Student.find({}).sort({ createdAt: -1 })
  res.json(students)
})

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate('user', '-password')
  
  if (!student) {
    res.status(404)
    throw new Error('Student not found')
  }
  
  res.json(student)
})

// @desc    Create new student
// @route   POST /api/students
// @access  Private (admin, superadmin)
const createStudent = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    dateOfBirth,
    gender,
    address,
    rollNumber,
    course,
    department,
    semester,
    section,
    parentName,
    parentPhone,
    parentEmail,
    parentRelation
  } = req.body

  // Check if student already exists
  const studentExists = await Student.findOne({ $or: [{ email }, { rollNumber }] })
  if (studentExists) {
    res.status(400)
    throw new Error('Student already exists with this email or roll number')
  }

  // Create user account for student
  const user = await User.create({
    name,
    email,
    password: rollNumber, // Default password is roll number
    role: 'student'
  })

  // Create student
  const student = await Student.create({
    name,
    email,
    phone,
    dateOfBirth,
    gender,
    address,
    rollNumber,
    course,
    department,
    semester,
    section,
    parentName,
    parentPhone,
    parentEmail,
    parentRelation,
    user: user._id
  })

  if (student) {
    res.status(201).json({
      message: 'Student created successfully',
      student
    })
  } else {
    res.status(400)
    throw new Error('Invalid student data')
  }
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

  const updatedStudent = await Student.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )

  res.json({
    message: 'Student updated successfully',
    student: updatedStudent
  })
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

  // Delete linked user account
  if (student.user) {
    await User.findByIdAndDelete(student.user)
  }

  await Student.findByIdAndDelete(req.params.id)

  res.json({ message: 'Student deleted successfully' })
})

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent
}