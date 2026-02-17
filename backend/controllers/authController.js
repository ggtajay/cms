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
// @desc    Create new user (admin, teacher, student etc.)
// @route   POST /api/auth/register
// @access  Private (superadmin, admin)
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body

  // Check if user exists
  const userExists = await User.findOne({ email })
  if (userExists) {
    res.status(400)
    throw new Error('User already exists with this email')
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role
  })

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      message: `${role} account created successfully`
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})
module.exports = { loginUser, getMe, registerUser }