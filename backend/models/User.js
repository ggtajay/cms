const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        'superadmin',
        'admin',
        'teacher',
        'student',
        'parent',
        'accountant',
        'librarian',
      ],
      default: 'student',
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

// Encrypt password before saving.
// IMPORTANT: async pre-hooks in Mongoose must NOT call next() — just return.
// Calling next() inside an async pre-hook throws "next is not a function"
// in modern Mongoose versions and also causes the hook body to run twice.
userSchema.pre('save', async function () {
  // Only hash when password field has actually changed
  if (!this.isModified('password')) {
    return
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Match entered password against stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
