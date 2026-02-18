const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
  // Personal Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  address: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: ''
  },

  // Academic Info
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  course: {
    type: String,
    required: true
  },
  department: {
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
  admissionDate: {
    type: Date,
    default: Date.now
  },
  admissionStatus: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'suspended'],
    default: 'active'
  },

  // Parent/Guardian Info
  parentName: {
    type: String,
    required: true
  },
  parentPhone: {
    type: String,
    required: true
  },
  parentEmail: {
    type: String,
    default: ''
  },
  parentRelation: {
    type: String,
    default: 'Parent'
  },

  // Fee Info
  feeStatus: {
    type: String,
    enum: ['paid', 'pending', 'partial'],
    default: 'pending'
  },

  // Linked User Account
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Student', studentSchema)