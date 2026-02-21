const express = require('express')
const router = express.Router()
const {
  createRoute,
  getRoutes,
  getRoute,
  updateRoute,
  assignStudent,
  removeStudent,
  deleteRoute
} = require('../controllers/transportController')
const { protect, authorize } = require('../middleware/authMiddleware')

// @route   POST /api/transport
// @route   GET /api/transport
router
  .route('/')
  .post(protect, authorize('superadmin', 'admin'), createRoute)
  .get(protect, getRoutes)

// @route   POST /api/transport/:id/assign
router.post(
  '/:id/assign',
  protect,
  authorize('superadmin', 'admin'),
  assignStudent
)

// @route   DELETE /api/transport/:id/remove/:studentId
router.delete(
  '/:id/remove/:studentId',
  protect,
  authorize('superadmin', 'admin'),
  removeStudent
)

// @route   GET /api/transport/:id
// @route   PUT /api/transport/:id
// @route   DELETE /api/transport/:id
router
  .route('/:id')
  .get(protect, getRoute)
  .put(protect, authorize('superadmin', 'admin'), updateRoute)
  .delete(protect, authorize('superadmin', 'admin'), deleteRoute)

module.exports = router