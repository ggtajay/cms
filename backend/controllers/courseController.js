const Course = require('../models/Course')
const asyncHandler = require('express-async-handler')

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private (any authenticated user)
const getCourses = asyncHandler(async (req, res) => {
  const { type, isActive } = req.query
  const filter = {}
  if (type) filter.type = type
  if (isActive !== undefined) filter.isActive = isActive === 'true'

  const courses = await Course.find(filter).sort({ name: 1 })
  res.json(courses)
})

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
  if (!course) {
    res.status(404)
    throw new Error('Course not found')
  }
  res.json(course)
})

// @desc    Create course
// @route   POST /api/courses
// @access  Private (admin, superadmin)
const createCourse = asyncHandler(async (req, res) => {
  const { name, code, type, duration, totalSemesters, departments, description } = req.body

  if (!name || !code || !type || !duration || !totalSemesters) {
    res.status(400)
    throw new Error('Please provide name, code, type, duration, and totalSemesters')
  }

  const exists = await Course.findOne({ $or: [{ name }, { code: code.toUpperCase() }] })
  if (exists) {
    res.status(400)
    throw new Error('A course with this name or code already exists')
  }

  const course = await Course.create({
    name,
    code: code.toUpperCase(),
    type,
    duration: parseInt(duration),
    totalSemesters: parseInt(totalSemesters),
    departments: Array.isArray(departments)
      ? departments
      : departments?.split(',').map((d) => d.trim()).filter(Boolean) || [],
    description: description || '',
    createdBy: req.user._id,
  })

  res.status(201).json({ message: 'Course created successfully', course })
})

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (admin, superadmin)
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
  if (!course) {
    res.status(404)
    throw new Error('Course not found')
  }

  const { departments, code, ...rest } = req.body
  Object.assign(course, rest)
  if (code) course.code = code.toUpperCase()
  if (departments !== undefined) {
    course.departments = Array.isArray(departments)
      ? departments
      : departments.split(',').map((d) => d.trim()).filter(Boolean)
  }

  await course.save()
  res.json({ message: 'Course updated successfully', course })
})

// @desc    Add department to course
// @route   POST /api/courses/:id/departments
// @access  Private (admin, superadmin)
const addDepartment = asyncHandler(async (req, res) => {
  const { department } = req.body
  if (!department?.trim()) {
    res.status(400)
    throw new Error('Department name is required')
  }

  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { departments: department.trim() } },
    { new: true }
  )
  if (!course) {
    res.status(404)
    throw new Error('Course not found')
  }

  res.json({ message: 'Department added', course })
})

// @desc    Remove department from course
// @route   DELETE /api/courses/:id/departments/:dept
// @access  Private (admin, superadmin)
const removeDepartment = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { $pull: { departments: decodeURIComponent(req.params.dept) } },
    { new: true }
  )
  if (!course) {
    res.status(404)
    throw new Error('Course not found')
  }
  res.json({ message: 'Department removed', course })
})

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (superadmin only)
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
  if (!course) {
    res.status(404)
    throw new Error('Course not found')
  }
  await Course.findByIdAndDelete(req.params.id)
  res.json({ message: 'Course deleted successfully' })
})

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  addDepartment,
  removeDepartment,
  deleteCourse,
}
