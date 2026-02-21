const express = require('express')
const router = express.Router()
const {
  createHostel,
  getHostels,
  getHostel,
  updateHostel,
  addRoom,
  assignStudentToRoom,
  removeStudentFromRoom,
  deleteRoom,
  deleteHostel
} = require('../controllers/hostelController')
const { protect, authorize } = require('../middleware/authMiddleware')

// @route   POST /api/hostels
// @route   GET /api/hostels
router
  .route('/')
  .post(protect, authorize('superadmin', 'admin'), createHostel)
  .get(protect, getHostels)

// @route   POST /api/hostels/:id/rooms
router.post(
  '/:id/rooms',
  protect,
  authorize('superadmin', 'admin'),
  addRoom
)

// @route   POST /api/hostels/:id/rooms/:roomId/assign
router.post(
  '/:id/rooms/:roomId/assign',
  protect,
  authorize('superadmin', 'admin'),
  assignStudentToRoom
)

// @route   DELETE /api/hostels/:id/rooms/:roomId/remove/:studentId
router.delete(
  '/:id/rooms/:roomId/remove/:studentId',
  protect,
  authorize('superadmin', 'admin'),
  removeStudentFromRoom
)

// @route   DELETE /api/hostels/:id/rooms/:roomId
router.delete(
  '/:id/rooms/:roomId',
  protect,
  authorize('superadmin', 'admin'),
  deleteRoom
)

// @route   GET /api/hostels/:id
// @route   PUT /api/hostels/:id
// @route   DELETE /api/hostels/:id
router
  .route('/:id')
  .get(protect, getHostel)
  .put(protect, authorize('superadmin', 'admin'), updateHostel)
  .delete(protect, authorize('superadmin', 'admin'), deleteHostel)

module.exports = router