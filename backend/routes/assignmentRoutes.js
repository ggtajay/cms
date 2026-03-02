const express = require('express')
const router = express.Router()
const {
  createAssignment,
  getAssignments,
  getAssignment,
  getMyAssignments,
  submitAssignment,
  gradeSubmission,
  updateAssignment,
  deleteAssignment
} = require('../controllers/assignmentController')
const { protect, authorize } = require('../middleware/authMiddleware')

// @route   POST /api/assignments
router.post(
  '/',
  protect,
  authorize('superadmin', 'admin', 'teacher'),
  createAssignment
)

// @route   GET /api/assignments
router.get(
  '/',
  protect,
  authorize('superadmin', 'admin', 'teacher'),
  getAssignments
)

// @route   GET /api/assignments/my-assignments
router.get(
  '/my-assignments',
  protect,
  authorize('student'),
  getMyAssignments
)

// @route   POST /api/assignments/:id/submit
router.post(
  '/:id/submit',
  protect,
  authorize('student'),
  submitAssignment
)

// @route   PUT /api/assignments/:id/grade/:submissionId
router.put(
  '/:id/grade/:submissionId',
  protect,
  authorize('superadmin', 'admin', 'teacher'),
  gradeSubmission
)

// @route   GET /api/assignments/:id
// @route   PUT /api/assignments/:id
// @route   DELETE /api/assignments/:id
router
  .route('/:id')
  .get(protect, getAssignment)
  .put(protect, authorize('superadmin', 'admin', 'teacher'), updateAssignment)
  .delete(protect, authorize('superadmin', 'admin', 'teacher'), deleteAssignment)

module.exports = router