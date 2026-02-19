const express = require('express')
const router = express.Router()
const {
  getFaculty,
  getSingleFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty
} = require('../controllers/facultyController')
const { protect, authorize } = require('../middleware/authMiddleware')

// @route   GET /api/faculty
// @route   POST /api/faculty
router
  .route('/')
  .get(protect, authorize('superadmin', 'admin'), getFaculty)
  .post(protect, authorize('superadmin', 'admin'), createFaculty)

// @route   GET /api/faculty/:id
// @route   PUT /api/faculty/:id
// @route   DELETE /api/faculty/:id
router
  .route('/:id')
  .get(protect, getSingleFaculty)
  .put(protect, authorize('superadmin', 'admin'), updateFaculty)
  .delete(protect, authorize('superadmin', 'admin'), deleteFaculty)

module.exports = router