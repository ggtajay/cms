const mongoose = require('mongoose')

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
})

// Ensure branch codes are unique per course (e.g., CSE is unique for B.Tech)
branchSchema.index({ code: 1, course: 1 }, { unique: true })

module.exports = mongoose.model('Branch', branchSchema)
