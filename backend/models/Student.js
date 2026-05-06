const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
  // ── System IDs ──────────────────────────────────────────────────────────────
  studentId: {
    type: String,
    unique: true,
    sparse: true,  // allows null during migration
    trim: true,
  },
  rollNumber: {
    // Kept as alias of studentId for backward compatibility
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },

  // ── Personal Info ───────────────────────────────────────────────────────────
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
    default: '',
  },
  category: {
    type: String,
    enum: ['General', 'OBC', 'SC', 'ST', 'EWS', ''],
    default: '',
  },
  aadhaar: {
    type: String,
    default: '',
    trim: true,
  },
  profileImage: {
    type: String,
    default: '',
  },

  // ── Academic Info ────────────────────────────────────────────────────────────
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  section: {
    type: String,
    default: 'A',
  },
  admissionDate: {
    type: Date,
    default: Date.now,
  },
  admissionYear: {
    type: Number,
    default: () => new Date().getFullYear(),
  },
  admissionStatus: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'suspended'],
    default: 'active',
  },

  // ── Parent / Guardian Info ───────────────────────────────────────────────────
  parentName: {
    type: String,
    required: true,
  },
  parentPhone: {
    type: String,
    required: true,
  },
  parentEmail: {
    type: String,
    default: '',
  },
  parentRelation: {
    type: String,
    default: 'Parent',
  },

  // ── Fee Info ─────────────────────────────────────────────────────────────────
  feeStatus: {
    type: String,
    enum: ['paid', 'pending', 'partial'],
    default: 'pending',
  },

  // ── Documents (uploaded file paths) ─────────────────────────────────────────
  documents: {
    photo: { type: String, default: '' },
    marksheet10th: { type: String, default: '' },
    marksheet12th: { type: String, default: '' },
    casteCertificate: { type: String, default: '' },
    bonafideCertificate: { type: String, default: '' },
    aadhaarDocument: { type: String, default: '' },
    otherDocuments: [{ type: String }],
  },

  // ── Profile Completion ───────────────────────────────────────────────────────
  profileCompletion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },

  // ── ID Card Tracking ─────────────────────────────────────────────────────────
  idCardDownloaded: {
    type: Boolean,
    default: false,
  },
  idCardDownloadCount: {
    type: Number,
    default: 0,
  },

  // ── Linked User Account ──────────────────────────────────────────────────────
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
})

// ── Profile completion calculator ────────────────────────────────────────────
studentSchema.methods.calculateProfileCompletion = function () {
  const fields = [
    this.name,
    this.email,
    this.phone,
    this.dateOfBirth,
    this.gender,
    this.address,
    this.bloodGroup,
    this.category,
    this.parentName,
    this.parentPhone,
    this.course,
    this.department,
    this.documents?.photo,
    this.documents?.marksheet10th,
    this.documents?.marksheet12th,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

module.exports = mongoose.model('Student', studentSchema)