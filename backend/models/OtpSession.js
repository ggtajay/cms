const mongoose = require('mongoose')

const otpSessionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    emailOtp: {
      type: String,
    },
    mobileOtp: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    // TTL index: The document will be automatically deleted 5 minutes after creation.
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '5m',
    },
  }
)

// Virtual property to check if both are verified
otpSessionSchema.virtual('isVerified').get(function () {
  return this.isEmailVerified && this.isMobileVerified
})

// Ensure virtuals are included when converting to JSON/Object
otpSessionSchema.set('toJSON', { virtuals: true })
otpSessionSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('OtpSession', otpSessionSchema)
