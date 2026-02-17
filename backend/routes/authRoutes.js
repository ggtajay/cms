const express = require('express')
const router = express.Router()
const {
  loginUser,
  getMe,
  registerUser
} = require('../controllers/authController')
const { protect, authorize } = require('../middleware/authMiddleware')

// @route   POST /api/auth/login
router.post('/login', loginUser)

// @route   GET /api/auth/me
router.get('/me', protect, getMe)

// @route   POST /api/auth/register
router.post(
  '/register',
  protect,
  authorize('superadmin', 'admin'),
  registerUser
)

module.exports = router