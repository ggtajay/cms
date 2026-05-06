const mongoose = require('mongoose')

const departmentSchema = new mongoose.Schema({
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
  description: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
})

module.exports = mongoose.model('Department', departmentSchema)
