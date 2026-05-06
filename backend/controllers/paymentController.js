const Razorpay = require('razorpay')
const crypto = require('crypto')
const asyncHandler = require('express-async-handler')
const Student = require('../models/Student')
const Faculty = require('../models/Faculty')
const Application = require('../models/Application')

// ─── Razorpay instance (lazy init so missing keys don't crash startup) ────────
let razorpayInstance = null
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || process.env.KEY_SECRET
const sendDebugLog = (hypothesisId, location, message, data = {}) => {
  // #region agent log
  fetch('http://127.0.0.1:7933/ingest/beab5d74-2c64-4e0b-9e7d-4886ce253ad4', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f4ed93' },
    body: JSON.stringify({
      sessionId: 'f4ed93',
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      runId: 'pre-fix',
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion
}
sendDebugLog('H3', 'backend/controllers/paymentController.js:module', 'Payment controller module loaded', {
  hasKeyId: Boolean(RAZORPAY_KEY_ID),
  hasKeySecret: Boolean(RAZORPAY_KEY_SECRET),
})

const getRazorpay = () => {
  if (!razorpayInstance) {
    sendDebugLog('H3', 'backend/controllers/paymentController.js:getRazorpay', 'Razorpay key availability check', {
      hasKeyId: Boolean(RAZORPAY_KEY_ID),
      hasKeySecret: Boolean(RAZORPAY_KEY_SECRET),
    })
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay keys not configured. Add RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET (or KEY_ID/KEY_SECRET) to .env')
    }
    razorpayInstance = new Razorpay({
      key_id:     RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    })
  }
  return razorpayInstance
}

const ID_CARD_AMOUNT = 5000 // ₹50 in paise (Razorpay uses paise)

// @desc    Create Razorpay order for ID card re-download
// @route   POST /api/payment/id-card/create-order
// @access  Private (student or teacher — themselves)
const createIdCardOrder = asyncHandler(async (req, res) => {
  const { userType } = req.body // 'student' | 'teacher'

  // Verify the user hasn't already gotten a free download
  let profileRecord
  if (userType === 'student') {
    profileRecord = await Student.findOne({ user: req.user._id })
  } else if (userType === 'teacher') {
    profileRecord = await Faculty.findOne({ user: req.user._id })
  }

  if (!profileRecord) {
    res.status(404)
    throw new Error('Profile not found')
  }

  if (!profileRecord.idCardDownloaded) {
    // Still eligible for free download — frontend should handle this
    return res.json({ free: true, message: 'Your first download is free! No payment needed.' })
  }

  const razorpay = getRazorpay()

  const order = await razorpay.orders.create({
    amount: ID_CARD_AMOUNT,
    currency: 'INR',
    receipt: `idcard_${req.user._id}_${Date.now()}`,
    notes: {
      userId:   req.user._id.toString(),
      userType,
      purpose:  'ID Card Re-Download',
    },
  })

  res.json({
    orderId:  order.id,
    amount:   order.amount,
    currency: order.currency,
    keyId:    RAZORPAY_KEY_ID,
    free:     false,
  })
})

// @desc    Verify Razorpay payment and record download
// @route   POST /api/payment/id-card/verify
// @access  Private (student or teacher — themselves)
const verifyIdCardPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userType,
  } = req.body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400)
    throw new Error('Payment verification data is incomplete')
  }

  // ── Signature Verification ────────────────────────────────────────────────────
  const generatedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (generatedSignature !== razorpay_signature) {
    res.status(400)
    throw new Error('Payment verification failed — invalid signature')
  }

  // ── Update download count ─────────────────────────────────────────────────────
  let profileRecord
  if (userType === 'student') {
    profileRecord = await Student.findOne({ user: req.user._id })
  } else {
    profileRecord = await Faculty.findOne({ user: req.user._id })
  }

  if (!profileRecord) {
    res.status(404)
    throw new Error('Profile not found')
  }

  profileRecord.idCardDownloaded    = true
  profileRecord.idCardDownloadCount = (profileRecord.idCardDownloadCount || 0) + 1
  await profileRecord.save()

  res.json({
    message: 'Payment verified successfully. You can now download your ID card.',
    paymentId: razorpay_payment_id,
    downloadCount: profileRecord.idCardDownloadCount,
  })
})

// @desc    Record a free first download
// @route   POST /api/payment/id-card/free-download
// @access  Private (student or teacher — themselves)
const recordFreeDownload = asyncHandler(async (req, res) => {
  const { userType } = req.body

  let profileRecord
  if (userType === 'student') {
    profileRecord = await Student.findOne({ user: req.user._id })
  } else {
    profileRecord = await Faculty.findOne({ user: req.user._id })
  }

  if (!profileRecord) {
    res.status(404)
    throw new Error('Profile not found')
  }

  if (profileRecord.idCardDownloaded) {
    res.status(400)
    throw new Error('Free download already used. Please make a payment for re-download.')
  }

  profileRecord.idCardDownloaded    = true
  profileRecord.idCardDownloadCount = 1
  await profileRecord.save()

  res.json({
    message: 'First download recorded — free!',
    downloadCount: 1,
    free: true,
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Application Fee — ₹50 one-time fee before submitting any admission application
// ─────────────────────────────────────────────────────────────────────────────

const APP_FEE_AMOUNT = 5000 // ₹50 in paise

// @desc    Create Razorpay order for ₹50 application fee
// @route   POST /api/payment/app-fee/create-order
// @access  Public (applicant hasn't logged in yet)
const createAppFeeOrder = asyncHandler(async (req, res) => {
  const razorpay = getRazorpay()

  const { email, name } = req.body
  sendDebugLog('H4', 'backend/controllers/paymentController.js:createAppFeeOrder', 'Create app fee order request received', {
    hasEmail: Boolean(email),
    hasName: Boolean(name),
  })

  if (!email) {
    res.status(400)
    throw new Error('Email is required to create an application fee order')
  }

  const order = await razorpay.orders.create({
    amount: APP_FEE_AMOUNT,
    currency: 'INR',
    receipt: `appfee_${Date.now()}`,
    notes: {
      email,
      name: name || '',
      purpose: 'Application Fee',
    },
  })

  res.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: RAZORPAY_KEY_ID,
  })
})

// @desc    Verify Razorpay payment for application fee
//          Sets applicationFeePaid = true on matching application (if exists)
//          or stores the payment_id as a temp token for use during submission
// @route   POST /api/payment/app-fee/verify
// @access  Public
const verifyAppFeePayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    applicationId, // optional — if application already exists
  } = req.body
  sendDebugLog('H5', 'backend/controllers/paymentController.js:verifyAppFeePayment', 'Verify app fee request received', {
    hasOrderId: Boolean(razorpay_order_id),
    hasPaymentId: Boolean(razorpay_payment_id),
    hasSignature: Boolean(razorpay_signature),
    hasApplicationId: Boolean(applicationId),
  })

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400)
    throw new Error('Payment verification data is incomplete')
  }

  // ── Backend signature verification ───────────────────────────────────────────
  // SECURITY: Only the backend with the key_secret can compute this signature.
  // The frontend cannot forge this — it must pass the raw Razorpay response here.
  const generatedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (generatedSignature !== razorpay_signature) {
    res.status(400)
    throw new Error('Payment verification failed — invalid signature')
  }

  // ── Update application if applicationId provided ──────────────────────────────
  if (applicationId) {
    const updatedApplication = await Application.findOneAndUpdate(
      { applicationId },
      {
        applicationFeePaid: true,
        appFeePaymentId: razorpay_payment_id,
        paymentStatus: 'paid',
      }
    )
    sendDebugLog('H5', 'backend/controllers/paymentController.js:verifyAppFeePayment', 'Application update attempted after payment verify', {
      applicationId,
      updated: Boolean(updatedApplication),
    })
  }

  // Return payment_id so the frontend can attach it to the application submission.
  // The submission controller checks this payment_id on the DB record.
  res.json({
    verified: true,
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
    message: 'Application fee payment verified successfully',
  })
})

module.exports = {
  createIdCardOrder,
  verifyIdCardPayment,
  recordFreeDownload,
  createAppFeeOrder,
  verifyAppFeePayment,
}
