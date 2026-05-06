const express = require('express')
const router = express.Router()
const {
  createIdCardOrder,
  verifyIdCardPayment,
  recordFreeDownload,
  createAppFeeOrder,
  verifyAppFeePayment,
} = require('../controllers/paymentController')
const { protect } = require('../middleware/authMiddleware')

// POST /api/payment/id-card/create-order
router.post('/id-card/create-order', protect, createIdCardOrder)

// POST /api/payment/id-card/verify
router.post('/id-card/verify', protect, verifyIdCardPayment)

// POST /api/payment/id-card/free-download
router.post('/id-card/free-download', protect, recordFreeDownload)

// Mock Payment for Applications
router.post('/initiate', (req, res) => {
  // Mock initiate
  res.json({ success: true, transactionId: 'txn_' + Date.now(), amount: req.body.amount || 5000 })
})

router.post('/success', (req, res) => {
  // Mock success
  res.json({ success: true, paymentId: 'pay_' + Date.now(), status: 'paid' })
})

// ── Application Fee (₹50) — public, secured by Razorpay signature verification ──
router.post('/app-fee/create-order', createAppFeeOrder)
router.post('/app-fee/verify', verifyAppFeePayment)

module.exports = router
