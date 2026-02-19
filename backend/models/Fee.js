const mongoose = require('mongoose')

const feeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  feeType: {
    type: String,
    enum: ['tuition', 'exam', 'library', 'transport', 'hostel', 'miscellaneous'],
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  dueAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['paid', 'partial', 'pending'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  paymentHistory: [{
    amount: {
      type: Number,
      required: true
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank_transfer', 'cheque'],
      default: 'cash'
    },
    transactionId: {
      type: String,
      default: ''
    },
    remarks: {
      type: String,
      default: ''
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  remarks: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

// Update status based on amounts
feeSchema.pre('save', function(next) {
  if (this.paidAmount >= this.totalAmount) {
    this.status = 'paid'
    this.dueAmount = 0
  } else if (this.paidAmount > 0) {
    this.status = 'partial'
    this.dueAmount = this.totalAmount - this.paidAmount
  } else {
    this.status = 'pending'
    this.dueAmount = this.totalAmount
  }
  next()
})

module.exports = mongoose.model('Fee', feeSchema)