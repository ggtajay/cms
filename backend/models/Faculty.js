const mongoose = require('mongoose')

const facultySchema = new mongoose.Schema({
  // ── System IDs ──────────────────────────────────────────────────────────────
  facultyId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  // Kept for backward compat — mirrors facultyId
  employeeId: {
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
  profileImage: {
    type: String,
    default: '',
  },

  // ── Professional Info ────────────────────────────────────────────────────────
  designation: {
    type: String,
    required: true,
    enum: [
      'Professor',
      'Associate Professor',
      'Assistant Professor',
      'Lecturer',
      'HOD',
      'Lab Assistant',
    ],
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  qualification: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    default: '',
  },
  experience: {
    type: Number,
    default: 0,
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  joiningYear: {
    type: Number,
    default: () => new Date().getFullYear(),
  },
  employmentStatus: {
    type: String,
    enum: ['active', 'inactive', 'retired', 'resigned'],
    default: 'active',
  },

  // ── Subjects ─────────────────────────────────────────────────────────────────
  subjects: [{
    type: String,
  }],

  // ── Salary Info ──────────────────────────────────────────────────────────────
  salary: {
    type: Number,
    default: 0,
  },

  // ── Emergency Contact ─────────────────────────────────────────────────────────
  emergencyContact: {
    name:     { type: String, default: '' },
    phone:    { type: String, default: '' },
    relation: { type: String, default: '' },
  },

  // ── Documents ────────────────────────────────────────────────────────────────
  documents: {
    photo:              { type: String, default: '' },
    degreeCertificate:  { type: String, default: '' },
    idProof:            { type: String, default: '' },
    experienceLetter:   { type: String, default: '' },
    otherDocuments:     [{ type: String }],
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
facultySchema.methods.calculateProfileCompletion = function () {
  const fields = [
    this.name,
    this.email,
    this.phone,
    this.dateOfBirth,
    this.gender,
    this.address,
    this.designation,
    this.department,
    this.qualification,
    this.subjects?.length > 0,
    this.documents?.photo,
    this.documents?.degreeCertificate,
    this.documents?.idProof,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

module.exports = mongoose.model('Faculty', facultySchema)