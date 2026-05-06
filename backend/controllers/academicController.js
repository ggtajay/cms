const asyncHandler = require('express-async-handler')
const Department = require('../models/Department')
const Course = require('../models/Course')
const Branch = require('../models/Branch')

// ─────────────────────────────────────────────
//  @desc    Get all departments
//  @route   GET /api/academic/departments
//  @access  Private
// ─────────────────────────────────────────────
const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true }).sort({ name: 1 })
  res.json(departments)
})

// ─────────────────────────────────────────────
//  @desc    Get courses by department
//  @route   GET /api/academic/departments/:deptId/courses
//  @access  Private
//
//  Strategy: Look up the department by _id to get its name,
//  then query Course.departments[] which stores department names as strings.
//  This works with how courses were seeded (departments: ['School of...']),
//  without needing a populated Branch collection.
// ─────────────────────────────────────────────
const getCoursesByDepartment = asyncHandler(async (req, res) => {
  const { deptId } = req.params

  // First try to find the department by ObjectId to get its name
  let deptName = null
  try {
    const dept = await Department.findById(deptId)
    if (dept) deptName = dept.name
  } catch (_) {
    // deptId might already be a name string, fall through
  }

  let courses = []
  if (deptName) {
    // Query courses where departments array contains this dept name
    courses = await Course.find({
      departments: deptName,
      isActive: true
    }).sort({ name: 1 })
  }

  // Fallback: if no results by name, try the old Branch-based lookup
  if (courses.length === 0) {
    try {
      const branches = await Branch.find({ department: deptId, isActive: true }).populate('course')
      const map = new Map()
      branches.forEach(b => {
        if (b.course && b.course.isActive) map.set(b.course._id.toString(), b.course)
      })
      courses = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
    } catch (_) {}
  }

  res.json(courses)
})

// ─────────────────────────────────────────────
//  @desc    Get branches by department and course
//  @route   GET /api/academic/departments/:deptId/courses/:courseId/branches
//  @access  Private
// ─────────────────────────────────────────────
const getBranches = asyncHandler(async (req, res) => {
  const { deptId, courseId } = req.params

  const branches = await Branch.find({
    department: deptId,
    course: courseId,
    isActive: true
  }).sort({ name: 1 })

  res.json(branches)
})

module.exports = {
  getDepartments,
  getCoursesByDepartment,
  getBranches
}
