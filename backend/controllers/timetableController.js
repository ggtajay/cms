const asyncHandler = require('express-async-handler')
const Timetable = require('../models/Timetable')
const Faculty = require('../models/Faculty')

// ─────────────────────────────────────────────
//  @desc    Get all timetable entries (admin)
//           OR teacher's own entries (teacher)
//  @route   GET /api/timetable
//  @access  Private (admin, superadmin, teacher)
// ─────────────────────────────────────────────
const getTimetable = asyncHandler(async (req, res) => {
  const { role, _id: userId } = req.user

  let filter = {}

  if (role === 'teacher') {
    // Teachers only see their own slots
    filter.teacher = userId
  } else if (req.query.teacher) {
    // Admin can filter by a specific teacher
    filter.teacher = req.query.teacher
  }

  // Additional filters for admin
  if (req.query.course) filter.course = req.query.course
  if (req.query.semester) filter.semester = parseInt(req.query.semester)
  if (req.query.section) filter.section = req.query.section
  if (req.query.day) filter.day = req.query.day

  const entries = await Timetable.find(filter)
    .populate('teacher', 'name email')
    .sort({ day: 1, timeSlot: 1 })

  res.json(entries)
})

// ─────────────────────────────────────────────
//  @desc    Get student's own timetable entries
//  @route   GET /api/timetable/student
//  @access  Private (student)
// ─────────────────────────────────────────────
const getStudentTimetable = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user

  // Fetch the student profile to get course, semester, section
  const StudentModel = require('../models/Student')
  const student = await StudentModel.findOne({ user: userId })

  if (!student) {
    res.status(404)
    throw new Error('Student profile not found')
  }

  const entries = await Timetable.find({
    course: student.course,
    semester: student.semester,
    section: student.section || 'A'
  })
    .populate('teacher', 'name email')
    .sort({ day: 1, timeSlot: 1 })

  res.json(entries)
})

// ─────────────────────────────────────────────
//  @desc    Get one timetable entry by ID
//  @route   GET /api/timetable/:id
//  @access  Private (admin, superadmin)
// ─────────────────────────────────────────────
const getTimetableById = asyncHandler(async (req, res) => {
  const entry = await Timetable.findById(req.params.id).populate(
    'teacher',
    'name email'
  )

  if (!entry) {
    res.status(404)
    throw new Error('Timetable entry not found')
  }

  res.json(entry)
})

// ─────────────────────────────────────────────
//  @desc    Create a new timetable entry
//  @route   POST /api/timetable
//  @access  Private (admin, superadmin)
// ─────────────────────────────────────────────
const createTimetableEntry = asyncHandler(async (req, res) => {
  const { teacher, subject, course, branch, semester, section, room, day, timeSlot } =
    req.body

  if (!teacher || !subject || !course || !branch || !semester || !day || !timeSlot) {
    res.status(400)
    throw new Error(
      'Please provide teacher, subject, course, branch, semester, day and timeSlot'
    )
  }

  // Validate day & timeSlot against allowed values
  if (!Timetable.schema.path('day').enumValues.includes(day)) {
    res.status(400)
    throw new Error(`Invalid day. Allowed: ${Timetable.schema.path('day').enumValues.join(', ')}`)
  }
  if (!Timetable.schema.path('timeSlot').enumValues.includes(timeSlot)) {
    res.status(400)
    throw new Error(`Invalid time slot.`)
  }

  // Check teacher exists
  const facultyExists = await Faculty.findOne({ user: teacher })
  if (!facultyExists) {
    res.status(404)
    throw new Error('Teacher (faculty record) not found')
  }

  try {
    const entry = await Timetable.create({
      teacher,
      subject,
      course,
      branch,
      semester: parseInt(semester),
      section: section || 'A',
      room: room || '',
      day,
      timeSlot,
      createdBy: req.user._id,
    })

    const populated = await entry.populate('teacher', 'name email')
    res.status(201).json(populated)
  } catch (err) {
    if (err.code === 11000) {
      // Unique index violation — double booking
      const key = Object.keys(err.keyPattern || {})[0]
      if (key && key.includes('teacher')) {
        res.status(409)
        throw new Error(
          `This teacher is already scheduled on ${day} at ${timeSlot}`
        )
      }
      res.status(409)
      throw new Error(
        `This class (${course} Sem ${semester} ${section || 'A'}) already has a slot on ${day} at ${timeSlot}`
      )
    }
    throw err
  }
})

// ─────────────────────────────────────────────
//  @desc    Update a timetable entry
//  @route   PUT /api/timetable/:id
//  @access  Private (admin, superadmin)
// ─────────────────────────────────────────────
const updateTimetableEntry = asyncHandler(async (req, res) => {
  const entry = await Timetable.findById(req.params.id)

  if (!entry) {
    res.status(404)
    throw new Error('Timetable entry not found')
  }

  const { teacher, subject, course, semester, section, room, day, timeSlot } =
    req.body

  entry.teacher = teacher ?? entry.teacher
  entry.subject = subject ?? entry.subject
  entry.course = course ?? entry.course
  entry.semester = semester != null ? parseInt(semester) : entry.semester
  entry.section = section ?? entry.section
  entry.room = room !== undefined ? room : entry.room
  entry.day = day ?? entry.day
  entry.timeSlot = timeSlot ?? entry.timeSlot

  try {
    await entry.save()
    const populated = await entry.populate('teacher', 'name email')
    res.json(populated)
  } catch (err) {
    if (err.code === 11000) {
      res.status(409)
      throw new Error('Scheduling conflict: that slot is already taken')
    }
    throw err
  }
})

// ─────────────────────────────────────────────
//  @desc    Delete a timetable entry
//  @route   DELETE /api/timetable/:id
//  @access  Private (admin, superadmin)
// ─────────────────────────────────────────────
const deleteTimetableEntry = asyncHandler(async (req, res) => {
  const entry = await Timetable.findById(req.params.id)

  if (!entry) {
    res.status(404)
    throw new Error('Timetable entry not found')
  }

  await entry.deleteOne()
  res.json({ message: 'Timetable entry deleted successfully' })
})

// ─────────────────────────────────────────────
//  @desc    Get allowed days & time slots (for dropdowns)
//  @route   GET /api/timetable/meta
//  @access  Private
// ─────────────────────────────────────────────
const getTimetableMeta = asyncHandler(async (req, res) => {
  res.json({
    days: Timetable.schema.path('day').enumValues,
    timeSlots: Timetable.schema.path('timeSlot').enumValues,
  })
})

module.exports = {
  getTimetable,
  getStudentTimetable,
  getTimetableById,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getTimetableMeta,
}
