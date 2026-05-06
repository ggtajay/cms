const express = require('express')
const router = express.Router()
const {
  loginUser,
  getMe,
  getMyProfile,
  updateMyProfile,
  updateMyPassword,
  setPassword,
  registerUser,
  getAllUsers,
  getTeachers,
  toggleUserStatus,
  deleteUser,
} = require('../controllers/authController')
const { protect, authorize } = require('../middleware/authMiddleware')
const { uploadProfileImage } = require('../middleware/uploadMiddleware')

// @route   POST /api/auth/login
router.post('/login', loginUser)

// @route   POST /api/auth/set-password
router.post('/set-password', setPassword)

// @route   GET /api/auth/me
router.get('/me', protect, getMe)

// @route   GET /api/auth/me/profile
router.get('/me/profile', protect, getMyProfile)

// @route   PUT /api/auth/me/profile
router.put(
  '/me/profile',
  protect,
  uploadProfileImage.single('profileImage'),
  updateMyProfile
)

// @route   PUT /api/auth/me/password
router.put('/me/password', protect, updateMyPassword)

// @route   POST /api/auth/register
router.post(
  '/register',
  protect,
  authorize('superadmin', 'admin'),
  uploadProfileImage.single('profileImage'),
  registerUser
)

// @route   GET /api/auth/users
router.get(
  '/users',
  protect,
  authorize('superadmin'),
  getAllUsers
)

// @route   PUT /api/auth/users/:id/toggle
router.put(
  '/users/:id/toggle',
  protect,
  authorize('superadmin'),
  toggleUserStatus
)

// @route   GET /api/auth/teachers  — teacher list for dropdowns (admin accessible)
router.get(
  '/teachers',
  protect,
  authorize('superadmin', 'admin'),
  getTeachers
)

// @route   DELETE /api/auth/users/:id
router.delete(
  '/users/:id',
  protect,
  authorize('superadmin'),
  deleteUser
)

module.exports = router
