const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const {
  sendEmailOtp,
  verifyEmailOtp,
  sendMobileOtp,
  verifyMobileOtp,
} = require('../controllers/otpController')

// Max 3 OTP requests per 10 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message: { message: 'Too many OTP requests from this IP, please try again after 10 minutes' },
})

router.post('/send-email-otp', otpLimiter, sendEmailOtp)
router.post('/verify-email-otp', verifyEmailOtp)
router.post('/send-mobile-otp', otpLimiter, sendMobileOtp)
router.post('/verify-mobile-otp', verifyMobileOtp)

module.exports = router
