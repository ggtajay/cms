const mongoose = require('mongoose')

const TIME_SLOTS = [
  '8:00-9:00',
  '9:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-1:00',
  '1:00-2:00',
  '2:00-3:00',
  '3:00-4:00',
  '4:00-5:00',
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const timetableSchema = new mongoose.Schema(
  {
    // Which teacher teaches this slot
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Subject being taught
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    // Course / program name, e.g. "BTech", "BCA"
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    // Branch specialization
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    // Semester number
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    // Section, e.g. "A", "B"
    section: {
      type: String,
      required: true,
      trim: true,
      default: 'A',
    },
    // Room / lab
    room: {
      type: String,
      trim: true,
      default: '',
    },
    // Day of week
    day: {
      type: String,
      required: true,
      enum: DAYS,
    },
    // Time slot string, e.g. "9:00-10:00"
    timeSlot: {
      type: String,
      required: true,
      enum: TIME_SLOTS,
    },
    // Created by admin
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

// Prevent double-booking the same teacher in the same day+time slot
timetableSchema.index(
  { teacher: 1, day: 1, timeSlot: 1 },
  { unique: true, name: 'unique_teacher_slot' }
)

// Prevent double-booking the same class in the same day+time slot
timetableSchema.index(
  { course: 1, branch: 1, semester: 1, section: 1, day: 1, timeSlot: 1 },
  { unique: true, name: 'unique_class_slot' }
)

timetableSchema.statics.TIME_SLOTS = TIME_SLOTS
timetableSchema.statics.DAYS = DAYS

module.exports = mongoose.model('Timetable', timetableSchema)
