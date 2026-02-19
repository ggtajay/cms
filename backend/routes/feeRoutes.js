const express = require('express')
const router = express.Router()
const {
  createFee,
  collectFee,
  getAllFees,
  getStudentFees,
  getMyFees,
  getDueList,
  getCollectionReport,
  deleteFee
} = require('../controllers/feeController')
const { protect, authorize } = require('../middleware/authMiddleware')

// @route   POST /api/fees
router.post(
  '/',
  protect,
  authorize('superadmin', 'admin', 'accountant'),
  createFee
)

// @route   POST /api/fees/:id/pay
router.post(
  '/:id/pay',
  protect,
  authorize('superadmin', 'admin', 'accountant'),
  collectFee
)

// @route   GET /api/fees
router.get(
  '/',
  protect,
  authorize('superadmin', 'admin', 'accountant'),
  getAllFees
)

// @route   GET /api/fees/my-fees
router.get(
  '/my-fees',
  protect,
  authorize('student'),
  getMyFees
)

// @route   GET /api/fees/due-list
router.get(
  '/due-list',
  protect,
  authorize('superadmin', 'admin', 'accountant'),
  getDueList
)

// @route   GET /api/fees/reports/collection
router.get(
  '/reports/collection',
  protect,
  authorize('superadmin', 'admin', 'accountant'),
  getCollectionReport
)

// @route   GET /api/fees/student/:id
router.get(
  '/student/:id',
  protect,
  getStudentFees
)

// @route   DELETE /api/fees/:id
router.delete(
  '/:id',
  protect,
  authorize('superadmin', 'admin'),
  deleteFee
)

module.exports = router