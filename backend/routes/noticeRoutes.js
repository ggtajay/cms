const express = require('express')
const router = express.Router()
const {
  createNotice,
  getNotices,
  getNotice,
  updateNotice,
  deleteNotice
} = require('../controllers/noticeController')
const { protect, authorize } = require('../middleware/authMiddleware')

// @route   POST /api/notices
router.post(
  '/',
  protect,
  authorize('superadmin', 'admin'),
  createNotice
)

// @route   GET /api/notices
router.get('/', protect, getNotices)

// @route   GET /api/notices/:id
router.get('/:id', protect, getNotice)

// @route   PUT /api/notices/:id
router.put(
  '/:id',
  protect,
  authorize('superadmin', 'admin'),
  updateNotice
)

// @route   DELETE /api/notices/:id
router.delete(
  '/:id',
  protect,
  authorize('superadmin', 'admin'),
  deleteNotice
)

module.exports = router