const mongoose = require('mongoose')

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  section: {
    type: String,
    default: 'A'
  },
  dueDate: {
    type: Date,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    filename: String,
    url: String
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    content: {
      type: String
    },
    attachments: [{
      filename: String,
      url: String
    }],
    marksObtained: {
      type: Number,
      default: null
    },
    feedback: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['submitted', 'graded', 'late'],
      default: 'submitted'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Assignment', assignmentSchema)