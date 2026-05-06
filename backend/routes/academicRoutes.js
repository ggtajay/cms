const express = require('express')
const router = express.Router()
const {
  getDepartments,
  getCoursesByDepartment,
  getBranches,
} = require('../controllers/academicController')
const { protect } = require('../middleware/authMiddleware')

// GET /api/academic/departments/:deptId/courses/:courseId/branches
router.get('/departments/:deptId/courses/:courseId/branches', protect, getBranches)

// GET /api/academic/departments/:deptId/courses
router.get('/departments/:deptId/courses', protect, getCoursesByDepartment)

// GET /api/academic/departments
router.get('/departments', protect, getDepartments)

module.exports = router
