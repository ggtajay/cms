const express = require('express')
const router = express.Router()
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController')
const { protect, authorize } = require('../middleware/authMiddleware')

// @route   GET /api/students
// @route   POST /api/students
router
  .route('/')
  .get(protect, authorize('superadmin', 'admin'), getStudents)
  .post(protect, authorize('superadmin', 'admin'), createStudent)

// @route   GET /api/students/:id
// @route   PUT /api/students/:id
// @route   DELETE /api/students/:id
router
  .route('/:id')
  .get(protect, getStudent)
  .put(protect, authorize('superadmin', 'admin'), updateStudent)
  .delete(protect, authorize('superadmin', 'admin'), deleteStudent)

module.exports = router