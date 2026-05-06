const OtpSession = require('../models/OtpSession')
const User = require('../models/User')
const Student = require('../models/Student')
const Faculty = require('../models/Faculty')
const asyncHandler = require('express-async-handler')
const crypto = require('crypto')
const { sendOtpEmail } = require('../utils/mailer')
const { sendOtpSms } = require('../utils/sms')

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString()
}

const checkDuplicates = async (email, mobile) => {
  if (email) {
    const emailExists = await User.findOne({ email: email.toLowerCase().trim() })
    if (emailExists) throw new Error('Email already registered')
  }
  if (mobile) {
    const mobileExists = await User.findOne({ phone: mobile.trim() }) || 
                         await Student.findOne({ phone: mobile.trim() }) ||
                         await Faculty.findOne({ phone: mobile.trim() })
    if (mobileExists) throw new Error('Mobile number already registered')
  }
}

// @desc    Send Email OTP
// @route   POST /api/otp/send-email-otp
// @access  Public
const sendEmailOtp = asyncHandler(async (req, res) => {
  const { email, mobile } = req.body
  if (!email || !mobile) {
    res.status(400)
    throw new Error('Please provide email and mobile')
  }

  await checkDuplicates(email, mobile)

  let session = await OtpSession.findOne({ email: email.toLowerCase().trim(), mobile: mobile.trim() })
  if (!session) {
    session = new OtpSession({ email: email.toLowerCase().trim(), mobile: mobile.trim() })
  }

  const otp = generateOTP()
  session.emailOtp = otp
  session.isEmailVerified = false
  session.createdAt = Date.now() // Reset TTL
  await session.save()

  const result = await sendOtpEmail({ to: session.email, otp })
  if (!result.success) {
    res.status(500)
    throw new Error('Failed to send OTP email')
  }

  res.json({ message: 'Email OTP sent successfully' })
})

// @desc    Verify Email OTP
// @route   POST /api/otp/verify-email-otp
// @access  Public
const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, mobile, otp } = req.body
  if (!email || !mobile || !otp) {
    res.status(400)
    throw new Error('Please provide email, mobile and OTP')
  }

  const session = await OtpSession.findOne({ email: email.toLowerCase().trim(), mobile: mobile.trim() })
  if (!session) {
    res.status(400)
    throw new Error('OTP session expired or not found. Please request a new OTP.')
  }

  if (session.emailOtp !== otp) {
    res.status(400)
    throw new Error('Invalid OTP')
  }

  session.isEmailVerified = true
  session.emailOtp = undefined // clear
  session.createdAt = Date.now() // extend TTL
  await session.save()

  res.json({ message: 'Email verified successfully', isEmailVerified: true })
})

// @desc    Send Mobile OTP
// @route   POST /api/otp/send-mobile-otp
// @access  Public
const sendMobileOtp = asyncHandler(async (req, res) => {
  const { email, mobile } = req.body
  if (!email || !mobile) {
    res.status(400)
    throw new Error('Please provide email and mobile')
  }

  await checkDuplicates(null, mobile)

  let session = await OtpSession.findOne({ email: email.toLowerCase().trim(), mobile: mobile.trim() })
  if (!session) {
    session = new OtpSession({ email: email.toLowerCase().trim(), mobile: mobile.trim() })
  }

  const otp = generateOTP()
  session.mobileOtp = otp
  session.isMobileVerified = false
  session.createdAt = Date.now()
  await session.save()

  const result = await sendOtpSms(session.mobile, otp)
  if (!result) {
    // SMS failed — fall back to sending the OTP via email so user is not blocked
    console.warn('[OTP] SMS failed, falling back to email OTP delivery')
    const emailResult = await sendOtpEmail({ to: session.email, otp })
    if (!emailResult.success) {
      res.status(500)
      throw new Error('Failed to send OTP via both SMS and email')
    }
    return res.json({
      message: 'Mobile OTP sent to your registered email (SMS unavailable)',
      deliveredVia: 'email',
    })
  }

  res.json({ message: 'Mobile OTP sent successfully', deliveredVia: 'sms' })
})

// @desc    Verify Mobile OTP
// @route   POST /api/otp/verify-mobile-otp
// @access  Public
const verifyMobileOtp = asyncHandler(async (req, res) => {
  const { email, mobile, otp } = req.body
  if (!email || !mobile || !otp) {
    res.status(400)
    throw new Error('Please provide email, mobile and OTP')
  }

  const session = await OtpSession.findOne({ email: email.toLowerCase().trim(), mobile: mobile.trim() })
  if (!session) {
    res.status(400)
    throw new Error('OTP session expired or not found. Please request a new OTP.')
  }

  if (session.mobileOtp !== otp) {
    res.status(400)
    throw new Error('Invalid OTP')
  }

  session.isMobileVerified = true
  session.mobileOtp = undefined
  session.createdAt = Date.now()
  await session.save()

  res.json({ message: 'Mobile verified successfully', isMobileVerified: true })
})

module.exports = { sendEmailOtp, verifyEmailOtp, sendMobileOtp, verifyMobileOtp }
