const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    uppercase: true,
  },
  type: {
    type: String,
    enum: ['UG', 'PG', 'Diploma', 'Certificate', 'PhD'],
    required: true,
  },
  duration: {
    // Duration in years
    type: Number,
    required: true,
    min: 1,
    max: 6,
  },
  totalSemesters: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  description: {
    type: String,
    default: '',
  },
  departments: [{
    type: String,
    trim: true,
  }],
  // deliveryMode distinguishes online vs on-campus programs.
  // Separate from 'type' (UG/PG/etc.) to avoid schema collision.
  deliveryMode: {
    type: String,
    enum: ['ONLINE', 'REGULAR', 'BOTH'],
    default: 'BOTH',
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
})

module.exports = mongoose.model('Course', courseSchema)
