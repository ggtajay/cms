const mongoose = require('mongoose')

const helpdeskTicketSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requesterName: {
      type: String,
      required: true,
      trim: true
    },
    requesterEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    requesterRole: {
      type: String,
      enum: [
        'superadmin',
        'admin',
        'teacher',
        'student',
        'parent',
        'accountant',
        'librarian'
      ],
      required: true
    },
    category: {
      type: String,
      enum: [
        'academic_issue',
        'attendance_issue',
        'fee_issue',
        'hostel_complaint',
        'transport_complaint',
        'account_issue',
        'profile_correction',
        'examination_issue',
        'document_issue',
        'general_complaint'
      ],
      required: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'rejected'],
      default: 'open'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    adminRemark: {
      type: String,
      default: '',
      trim: true
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('HelpdeskTicket', helpdeskTicketSchema)
