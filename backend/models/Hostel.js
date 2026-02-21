const mongoose = require('mongoose')

const hostelSchema = new mongoose.Schema({
  hostelName: {
    type: String,
    required: true,
    trim: true
  },
  hostelType: {
    type: String,
    enum: ['boys', 'girls'],
    required: true
  },
  totalRooms: {
    type: Number,
    required: true
  },
  wardenName: {
    type: String,
    required: true
  },
  wardenPhone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  rooms: [{
    roomNumber: {
      type: String,
      required: true
    },
    floor: {
      type: Number,
      required: true
    },
    capacity: {
      type: Number,
      required: true
    },
    roomType: {
      type: String,
      enum: ['single', 'double', 'triple', 'quadruple'],
      required: true
    },
    studentsAssigned: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    }],
    facilities: {
      type: [String],
      default: []
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  facilities: {
    type: [String],
    default: []
  },
  feePerMonth: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Hostel', hostelSchema)