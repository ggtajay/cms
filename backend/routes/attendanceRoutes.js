const express = require('express')
const router = express.Router()
const {
  markAttendance,
  getAttendance,
  getMyAttendance,
  getStudentAttendance,
  deleteAttendance
} = require('../controllers/attendanceController')
const { protect, authorize } = require('../middleware/authMiddleware')

// @route   POST /api/attendance/mark
router.post(
  '/mark',
  protect,
  authorize('superadmin', 'admin', 'teacher'),
  markAttendance
)

// @route   GET /api/attendance
router.get(
  '/',
  protect,
  authorize('superadmin', 'admin', 'teacher'),
  getAttendance
)

// @route   GET /api/attendance/my-attendance
router.get(
  '/my-attendance',
  protect,
  authorize('student'),
  getMyAttendance
)

// @route   GET /api/attendance/student/:id
router.get(
  '/student/:id',
  protect,
  authorize('superadmin', 'admin', 'teacher'),
  getStudentAttendance
)

// @route   DELETE /api/attendance/:id
router.delete(
  '/:id',
  protect,
  authorize('superadmin', 'admin', 'teacher'),
  deleteAttendance
)

module.exports = router