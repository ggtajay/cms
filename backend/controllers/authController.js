const User = require('../models/User')
const Student = require('../models/Student')
const Faculty = require('../models/Faculty')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  })
}

const getProfileImagePath = (file) => {
  return file ? file.path : ''
}

const getProfileForUser = async (user) => {
  if (user.role === 'student') {
    return Student.findOne({ user: user._id })
  }

  if (user.role === 'teacher') {
    return Faculty.findOne({ user: user._id })
  }

  return null
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const identifier = req.body.identifier || req.body.email
  const { password } = req.body

  if (!identifier || !password) {
    res.status(400)
    throw new Error('Please provide identifier and password')
  }

  // Check if user exists
  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase().trim() },
      { userId: identifier.trim() }
    ]
  })

  if (!user) {
    res.status(401)
    throw new Error('Invalid email/userId or password')
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password)

  if (!isMatch) {
    res.status(401)
    throw new Error('Invalid email/userId or password')
  }

  // Check if user is active
  if (!user.isActive) {
    res.status(401)
    throw new Error('Your account has been deactivated')
  }

  // Fetch profile completion status if student or teacher
  let profileCompletion = 100
  if (user.role === 'student' || user.role === 'teacher') {
    const profile = await getProfileForUser(user)
    if (profile && profile.profileCompletion !== undefined) {
      profileCompletion = profile.profileCompletion
    } else {
      profileCompletion = 0
    }
  }

  res.json({
    _id: user._id,
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
    profileCompletion,
    isFirstLogin: user.isFirstLogin,
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

// @desc    Get current user's editable profile
// @route   GET /api/auth/me/profile
// @access  Private
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password')

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const profile = await getProfileForUser(user)

  res.json({ user, profile })
})

// @desc    Update current user's editable profile
// @route   PUT /api/auth/me/profile
// @access  Private
const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const profile = await getProfileForUser(user)
  const profileImage = getProfileImagePath(req.file)
  const {
    name,
    phone,
    address,
    dateOfBirth,
    gender,
    parentName,
    parentPhone,
    parentEmail,
    parentRelation,
    qualification,
    specialization,
    experience,
    emergencyContactName,
    emergencyContactPhone,
    emergencyContactRelation
  } = req.body

  if (typeof name === 'string' && name.trim()) {
    user.name = name.trim()
  }

  if (typeof phone === 'string') {
    user.phone = phone.trim()
  }

  if (typeof address === 'string') {
    user.address = address.trim()
  }

  if (dateOfBirth) {
    user.dateOfBirth = dateOfBirth
  }

  if (typeof gender === 'string' && ['male', 'female', 'other'].includes(gender)) {
    user.gender = gender
  }

  if (profileImage) {
    user.profileImage = profileImage
  }

  await user.save()

  if (profile) {
    // Sync shared fields from User → Profile
    profile.name = user.name
    profile.email = user.email

    // Only overwrite non-empty strings to avoid clearing required fields
    if (typeof user.phone === 'string' && user.phone) {
      profile.phone = user.phone
    }
    if (typeof user.address === 'string' && user.address) {
      profile.address = user.address
    }
    if (user.profileImage) {
      profile.profileImage = user.profileImage
    }
    if (user.dateOfBirth) {
      profile.dateOfBirth = user.dateOfBirth
    }
    if (user.gender && ['male', 'female', 'other'].includes(user.gender)) {
      profile.gender = user.gender
    }

    if (user.role === 'student') {
      if (typeof parentName === 'string') {
        profile.parentName = parentName.trim()
      }
      if (typeof parentPhone === 'string') {
        profile.parentPhone = parentPhone.trim()
      }
      if (typeof parentEmail === 'string') {
        profile.parentEmail = parentEmail.trim()
      }
      if (typeof parentRelation === 'string') {
        profile.parentRelation = parentRelation.trim()
      }
    }

    if (user.role === 'teacher') {
      if (typeof qualification === 'string' && qualification.trim()) {
        profile.qualification = qualification.trim()
      }
      if (typeof specialization === 'string') {
        profile.specialization = specialization.trim()
      }
      if (experience !== undefined && experience !== '') {
        profile.experience = Number(experience)
      }
      profile.emergencyContact = {
        name: typeof emergencyContactName === 'string'
          ? emergencyContactName.trim()
          : profile.emergencyContact?.name || '',
        phone: typeof emergencyContactPhone === 'string'
          ? emergencyContactPhone.trim()
          : profile.emergencyContact?.phone || '',
        relation: typeof emergencyContactRelation === 'string'
          ? emergencyContactRelation.trim()
          : profile.emergencyContact?.relation || ''
      }
    }

    // validateBeforeSave: false — required fields (phone, dob, etc.) may be
    // legitimately absent during a partial profile update. Mongoose schema
    // validation is enforced at creation time by admin; here we do a soft save.
    await profile.save({ validateBeforeSave: false })
  }

  const updatedUser = await User.findById(req.user.id).select('-password')
  const updatedProfile = await getProfileForUser(updatedUser)

  res.json({
    message: 'Profile updated successfully',
    user: updatedUser,
    profile: updatedProfile
  })
})

// @desc    Change current user's password
// @route   PUT /api/auth/me/password
// @access  Private
const updateMyPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body
  const user = await User.findById(req.user.id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  if (!currentPassword || !newPassword || !confirmPassword) {
    res.status(400)
    throw new Error('Please provide current password, new password and confirm password')
  }

  const isMatch = await user.matchPassword(currentPassword)

  if (!isMatch) {
    res.status(400)
    throw new Error('Current password is incorrect')
  }

  if (newPassword.length < 6) {
    res.status(400)
    throw new Error('New password must be at least 6 characters long')
  }

  if (newPassword !== confirmPassword) {
    res.status(400)
    throw new Error('New password and confirm password do not match')
  }

  user.password = newPassword
  await user.save()

  res.json({ message: 'Password updated successfully' })
})
// @desc    Set new password from token
// @route   POST /api/auth/set-password
// @access  Public
const setPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body
  if (!token || !password) {
    res.status(400)
    throw new Error('Please provide token and new password')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ userId: decoded.id })
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    user.password = password
    user.isFirstLogin = false
    await user.save()

    res.json({ message: 'Password set successfully. You can now log in.' })
  } catch (error) {
    res.status(400)
    throw new Error('Invalid or expired token')
  }
})

// @desc    Create new user (admin, teacher, student etc.)
// @route   POST /api/auth/register
// @access  Private (superadmin, admin)
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, role, phone, address, dateOfBirth, gender } = req.body

  if (!email) {
    res.status(400)
    throw new Error('Email is required')
  }

  // Check if user exists
  const queryConds = [{ email: email.toLowerCase() }]
  if (phone) queryConds.push({ phone })
  const userExists = await User.findOne({ $or: queryConds })
  if (userExists) {
    res.status(400)
    throw new Error('User already exists with this email or phone')
  }

  const { generateUserId } = require('../utils/idGenerator')
  const newUserId = await generateUserId(role)

  const tempPassword = Math.random().toString(36).slice(-8) + 'A@1'

  // Create user
  const user = await User.create({
    userId: newUserId,
    name,
    email,
    password: tempPassword,
    role,
    phone,
    address,
    dateOfBirth,
    gender,
    isFirstLogin: true,
    profileImage: getProfileImagePath(req.file)
  })

  if (user) {
    const { sendCredentials } = require('../utils/mailer')
    await sendCredentials({
      to: user.email,
      name: user.name,
      userId: newUserId,
      role: user.role,
      tempPassword
    })

    const { sendSMS } = require('../utils/sms')
    await sendSMS(
      user.phone,
      `Welcome to CMS, ${user.name}! Your account has been created. Please check your email for login credentials.`
    )

    res.status(201).json({
      _id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      message: `${role} account created successfully`
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// @desc    Get all users (excludes superadmin — hidden from all listings)
// @route   GET /api/auth/users
// @access  Private (superadmin)
const getAllUsers = asyncHandler(async (req, res) => {
  // SuperAdmin is hidden from all user-listing APIs to prevent accidental exposure
  const users = await User.find({ role: { $ne: 'superadmin' } })
    .select('-password')
    .sort({ createdAt: -1 })
  res.json(users)
})

// @desc    Get all teacher-role users (for dropdowns — timetable, assignments etc.)
// @route   GET /api/auth/teachers
// @access  Private (admin, superadmin)
const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await User
    .find({ role: 'teacher' })
    .select('name email role profileImage')
    .sort({ name: 1 })
  res.json(teachers)
})

// @desc    Toggle user active status
// @route   PUT /api/auth/users/:id/toggle
// @access  Private (superadmin)
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  // Prevent deactivating the superadmin account
  if (user.role === 'superadmin') {
    res.status(403)
    throw new Error('Superadmin account cannot be deactivated.')
  }

  // Prevent users from deactivating themselves
  if (req.user._id.toString() === user._id.toString()) {
    res.status(403)
    throw new Error('You cannot deactivate your own account.')
  }

  user.isActive = !user.isActive
  await user.save()

  res.json({
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
    isActive: user.isActive
  })
})

// @desc    Delete a user account
// @route   DELETE /api/auth/users/:id
// @access  Private (superadmin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  // Superadmin accounts are protected from deletion
  if (user.role === 'superadmin') {
    res.status(403)
    throw new Error('Superadmin account cannot be deleted.')
  }

  // Prevent self-deletion
  if (req.user._id.toString() === user._id.toString()) {
    res.status(403)
    throw new Error('You cannot delete your own account.')
  }

  await User.findByIdAndDelete(req.params.id)

  res.json({ message: 'User deleted successfully.' })
})
module.exports = {
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
}
