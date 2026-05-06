const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/User')

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password')

      // Bug fix: Guard against deleted user accounts with valid JWT
      if (!req.user) {
        res.status(401)
        throw new Error('Not authorized, user not found')
      }

      // Bug fix: Block deactivated users from API access mid-session
      if (!req.user.isActive) {
        res.status(403)
        throw new Error('Your account has been deactivated. Please contact admin.')
      }

      next()
    } catch (error) {
      // Only treat JWT errors as auth failures; re-throw everything else
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError' ||
        error.name === 'NotBeforeError'
      ) {
        res.status(401)
        throw new Error('Not authorized, token failed')
      }
      throw error
    }
  }

  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }
})

// Role based access
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401)
      throw new Error('Not authorized')
    }
    if (!roles.includes(req.user.role)) {
      res.status(403)
      throw new Error(
        `Role ${req.user.role} is not authorized to access this route`
      )
    }
    next()
  }
}

module.exports = { protect, authorize }