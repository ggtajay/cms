const express = require('express')
const router = express.Router()
const { loginUser, getMe } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

// @route   POST /api/auth/login
router.post('/login', loginUser)

// @route   GET /api/auth/me
router.get('/me', protect, getMe)

module.exports = router