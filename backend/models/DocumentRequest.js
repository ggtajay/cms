const mongoose = require('mongoose')

const documentRequestSchema = new mongoose.Schema(
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
    documentType: {
      type: String,
      enum: [
        'bonafide_certificate',
        'transcript',
        'migration_certificate',
        'course_completion_certificate',
        'noc',
        'duplicate_id_card',
        'duplicate_certificate',
        'cgpa_conversion_certificate'
      ],
      required: true
    },
    purpose: {
      type: String,
      required: true,
      trim: true
    },
    note: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['submitted', 'in_review', 'approved', 'rejected', 'completed'],
      default: 'submitted'
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

module.exports = mongoose.model('DocumentRequest', documentRequestSchema)
