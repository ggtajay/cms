const mongoose = require('mongoose')

const facultySchema = new mongoose.Schema({
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

  // Professional Info
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  designation: {
    type: String,
    required: true,
    enum: [
      'Professor',
      'Associate Professor',
      'Assistant Professor',
      'Lecturer',
      'HOD',
      'Lab Assistant'
    ]
  },
  department: {
    type: String,
    required: true
  },
  qualification: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    default: ''
  },
  experience: {
    type: Number,
    default: 0
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  employmentStatus: {
    type: String,
    enum: ['active', 'inactive', 'retired', 'resigned'],
    default: 'active'
  },

  // Subjects Teaching
  subjects: [{
    type: String
  }],

  // Salary Info
  salary: {
    type: Number,
    default: 0
  },

  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    relation: {
      type: String,
      default: ''
    }
  },

  // Linked User Account
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Faculty', facultySchema)