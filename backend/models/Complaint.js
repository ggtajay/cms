const mongoose = require('mongoose')

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      enum: ['ACADEMIC', 'MANAGEMENT', 'RAGGING', 'TECHNICAL', 'INFRASTRUCTURE', 'OTHER'],
      required: true,
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Denormalised role at time of submission (avoids populating user for every check)
    role: {
      type: String,
      enum: ['student', 'teacher'],
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'],
      default: 'PENDING',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Admin response text
    response: {
      type: String,
      default: '',
      maxlength: 5000,
    },
    attachments: [
      {
        type: String, // URL path to uploaded file
      },
    ],
    resolvedAt: {
      type: Date,
      default: null,
    },
    // Escalation tracking
    escalated: {
      type: Boolean,
      default: false,
    },
    escalatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

// ── Auto-escalation index: find unresolved complaints older than 3 days ──────
complaintSchema.index({ status: 1, createdAt: 1, escalated: 1 })
// Index for per-user daily spam check
complaintSchema.index({ raisedBy: 1, createdAt: -1 })

module.exports = mongoose.model('Complaint', complaintSchema)
