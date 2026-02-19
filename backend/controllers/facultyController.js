const Faculty = require('../models/Faculty')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

// @desc    Get all faculty
// @route   GET /api/faculty
// @access  Private (admin, superadmin)
const getFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.find({}).sort({ createdAt: -1 })
  res.json(faculty)
})

// @desc    Get single faculty
// @route   GET /api/faculty/:id
// @access  Private
const getSingleFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id).populate('user', '-password')
  
  if (!faculty) {
    res.status(404)
    throw new Error('Faculty not found')
  }
  
  res.json(faculty)
})

// @desc    Create new faculty
// @route   POST /api/faculty
// @access  Private (admin, superadmin)
const createFaculty = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    dateOfBirth,
    gender,
    address,
    employeeId,
    designation,
    department,
    qualification,
    specialization,
    experience,
    subjects,
    salary,
    emergencyContact
  } = req.body

  // Check if faculty already exists
  const facultyExists = await Faculty.findOne({ $or: [{ email }, { employeeId }] })
  if (facultyExists) {
    res.status(400)
    throw new Error('Faculty already exists with this email or employee ID')
  }

  // Create user account for faculty
  const user = await User.create({
    name,
    email,
    password: employeeId, // Default password is employee ID
    role: 'teacher'
  })

  // Create faculty
  const faculty = await Faculty.create({
    name,
    email,
    phone,
    dateOfBirth,
    gender,
    address,
    employeeId,
    designation,
    department,
    qualification,
    specialization,
    experience,
    subjects,
    salary,
    emergencyContact,
    user: user._id
  })

  if (faculty) {
    res.status(201).json({
      message: 'Faculty created successfully',
      faculty
    })
  } else {
    res.status(400)
    throw new Error('Invalid faculty data')
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

  const updatedFaculty = await Faculty.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )

  res.json({
    message: 'Faculty updated successfully',
    faculty: updatedFaculty
  })
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

  // Delete linked user account
  if (faculty.user) {
    await User.findByIdAndDelete(faculty.user)
  }

  await Faculty.findByIdAndDelete(req.params.id)

  res.json({ message: 'Faculty deleted successfully' })
})

module.exports = {
  getFaculty,
  getSingleFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty
}