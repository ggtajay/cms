const mongoose = require('mongoose')

const transportSchema = new mongoose.Schema({
  routeName: {
    type: String,
    required: true,
    trim: true
  },
  routeNumber: {
    type: String,
    required: true,
    unique: true
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  driverName: {
    type: String,
    required: true
  },
  driverPhone: {
    type: String,
    required: true
  },
  stops: [{
    stopName: String,
    timing: String,
    fare: Number
  }],
  capacity: {
    type: Number,
    required: true
  },
  studentsAssigned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Transport', transportSchema)