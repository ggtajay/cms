const mongoose = require('mongoose')

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'academic', 'exam', 'holiday', 'event', 'urgent'],
    default: 'general'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'faculty', 'staff'],
    default: 'all'
  },
  isImportant: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    filename: String,
    url: String
  }]
}, {
  timestamps: true
})

module.exports = mongoose.model('Notice', noticeSchema)