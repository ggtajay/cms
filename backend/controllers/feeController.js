const Fee = require('../models/Fee')
const Student = require('../models/Student')
const asyncHandler = require('express-async-handler')

// @desc    Create fee record for a student
// @route   POST /api/fees
// @access  Private (admin, superadmin, accountant)
const createFee = asyncHandler(async (req, res) => {
  const { studentId, academicYear, feeType, totalAmount, dueDate, remarks } = req.body

  const student = await Student.findById(studentId)
  if (!student) {
    res.status(404)
    throw new Error('Student not found')
  }

  const fee = await Fee.create({
    student: studentId,
    academicYear,
    feeType,
    totalAmount,
    dueAmount: totalAmount,
    dueDate,
    remarks
  })

  res.status(201).json({
    message: 'Fee record created successfully',
    fee
  })
})

// @desc    Collect fee payment
// @route   POST /api/fees/:id/pay
// @access  Private (admin, superadmin, accountant)
const collectFee = asyncHandler(async (req, res) => {
  const { amount, paymentMode, transactionId, remarks } = req.body

  const fee = await Fee.findById(req.params.id).populate('student')
  
  if (!fee) {
    res.status(404)
    throw new Error('Fee record not found')
  }

  if (amount <= 0) {
    res.status(400)
    throw new Error('Payment amount must be greater than 0')
  }

  if (fee.paidAmount + amount > fee.totalAmount) {
    res.status(400)
    throw new Error('Payment amount exceeds due amount')
  }

  // Add to payment history
  fee.paymentHistory.push({
    amount,
    paymentMode,
    transactionId,
    remarks,
    collectedBy: req.user.id
  })

  // Update paid amount
  fee.paidAmount += amount

  await fee.save()

  // Update student fee status
  const student = await Student.findById(fee.student._id)
  if (fee.status === 'paid') {
    student.feeStatus = 'paid'
  } else if (fee.status === 'partial') {
    student.feeStatus = 'partial'
  }
  await student.save()

  res.json({
    message: 'Payment collected successfully',
    fee
  })
})

// @desc    Get all fee records
// @route   GET /api/fees
// @access  Private (admin, superadmin, accountant)
const getAllFees = asyncHandler(async (req, res) => {
  const { status, academicYear } = req.query
  
  let filter = {}
  if (status) filter.status = status
  if (academicYear) filter.academicYear = academicYear

  const fees = await Fee.find(filter)
    .populate('student', 'name rollNumber email course semester')
    .sort({ createdAt: -1 })

  res.json(fees)
})

// @desc    Get fee records for a student
// @route   GET /api/fees/student/:id
// @access  Private
const getStudentFees = asyncHandler(async (req, res) => {
  const fees = await Fee.find({ student: req.params.id })
    .populate('paymentHistory.collectedBy', 'name')
    .sort({ createdAt: -1 })

  res.json(fees)
})

// @desc    Get my fee records (for students)
// @route   GET /api/fees/my-fees
// @access  Private (student)
const getMyFees = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user.id })
  
  if (!student) {
    res.status(404)
    throw new Error('Student record not found')
  }

  const fees = await Fee.find({ student: student._id })
    .populate('paymentHistory.collectedBy', 'name')
    .sort({ createdAt: -1 })

  const summary = {
    totalFees: fees.reduce((sum, f) => sum + f.totalAmount, 0),
    totalPaid: fees.reduce((sum, f) => sum + f.paidAmount, 0),
    totalDue: fees.reduce((sum, f) => sum + f.dueAmount, 0)
  }

  res.json({
    fees,
    summary
  })
})

// @desc    Get fee due list
// @route   GET /api/fees/due-list
// @access  Private (admin, superadmin, accountant)
const getDueList = asyncHandler(async (req, res) => {
  const fees = await Fee.find({ 
    status: { $in: ['pending', 'partial'] }
  })
    .populate('student', 'name rollNumber email phone course semester')
    .sort({ dueDate: 1 })

  res.json(fees)
})

// @desc    Get fee collection report
// @route   GET /api/fees/reports/collection
// @access  Private (admin, superadmin, accountant)
const getCollectionReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query

  const fees = await Fee.find()
    .populate('student', 'name rollNumber course')

  // Filter by date range if provided
  let filteredPayments = []
  fees.forEach(fee => {
    fee.paymentHistory.forEach(payment => {
      const paymentDate = new Date(payment.paymentDate)
      if (startDate && endDate) {
        if (paymentDate >= new Date(startDate) && paymentDate <= new Date(endDate)) {
          filteredPayments.push({
            ...payment.toObject(),
            student: fee.student,
            feeType: fee.feeType
          })
        }
      } else {
        filteredPayments.push({
          ...payment.toObject(),
          student: fee.student,
          feeType: fee.feeType
        })
      }
    })
  })

  const totalCollection = filteredPayments.reduce((sum, p) => sum + p.amount, 0)

  res.json({
    payments: filteredPayments,
    totalCollection,
    count: filteredPayments.length
  })
})

// @desc    Delete fee record
// @route   DELETE /api/fees/:id
// @access  Private (admin, superadmin)
const deleteFee = asyncHandler(async (req, res) => {
  const fee = await Fee.findById(req.params.id)

  if (!fee) {
    res.status(404)
    throw new Error('Fee record not found')
  }

  await Fee.findByIdAndDelete(req.params.id)
  res.json({ message: 'Fee record deleted successfully' })
})

module.exports = {
  createFee,
  collectFee,
  getAllFees,
  getStudentFees,
  getMyFees,
  getDueList,
  getCollectionReport,
  deleteFee
}