const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    // Unified phone field (mobile kept as alias for backward compatibility)
    phone: {
      type: String,
      default: '',
    },
    mobile: {
      type: String,
      default: '',
    },
    // mode: whether this is an online or regular (on-campus) admission
    mode: {
      type: String,
      enum: ['online', 'regular'],
      required: true,
      default: 'regular',
    },
    // kept for backward compat — mirrors mode
    type: {
      type: String,
      enum: ['online', 'regular'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    // ── Application Fee ────────────────────────────────────────────────────────
    // Toggled to true ONLY by backend after verifying Razorpay signature,
    // OR by staff for walk-in with offline payment.
    applicationFeePaid: {
      type: Boolean,
      default: false,
    },
    // Razorpay payment_id stored for audit
    appFeePaymentId: {
      type: String,
      default: '',
    },
    // paymentStatus mirrors applicationFeePaid for legacy references
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    // ── Walk-in ────────────────────────────────────────────────────────────────
    isWalkIn: {
      type: Boolean,
      default: false,
    },
    createdByStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // ── Profile ────────────────────────────────────────────────────────────────
    address: {
      type: String,
      default: '',
    },
    qualification: {
      type: String,
      default: '',
    },
    documents: {
      photo: { type: String, default: '' },
      previousMarksheet: { type: String, default: '' },
      idProof: { type: String, default: '' },
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
)

// ── DB-level duplicate prevention ──────────────────────────────────────────────
// Prevents the same email from applying to the same course more than once.
// Rejected applications are allowed to re-apply — handled at controller level
// by checking status before inserting.
applicationSchema.index(
  { email: 1, course: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'approved'] } },
  }
)

module.exports = mongoose.model('Application', applicationSchema)
