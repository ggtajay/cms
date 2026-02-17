const User = require('../models/User')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  })
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Check if user exists
  const user = await User.findOne({ email })

  if (!user) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password)

  if (!isMatch) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  // Check if user is active
  if (!user.isActive) {
    res.status(401)
    throw new Error('Your account has been deactivated')
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, user.role)
  })
})

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password')
  res.json(user)
})

module.exports = { loginUser, getMe }