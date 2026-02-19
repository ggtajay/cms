const Attendance = require('../models/Attendance')
const Student = require('../models/Student')
const asyncHandler = require('express-async-handler')

// @desc    Mark attendance for multiple students
// @route   POST /api/attendance/mark
// @access  Private (teacher, admin, superadmin)
const markAttendance = asyncHandler(async (req, res) => {
  const { date, subject, course, semester, section, students } = req.body
  
  // students is an array like: [{ studentId: "...", status: "present" }, ...]
  
  if (!students || students.length === 0) {
    res.status(400)
    throw new Error('No students provided')
  }

  const attendanceRecords = []
  const errors = []

  for (const item of students) {
    try {
      // Check if attendance already exists
      const existing = await Attendance.findOne({
        student: item.studentId,
        date: new Date(date),
        subject
      })

      if (existing) {
        // Update existing
        existing.status = item.status
        existing.markedBy = req.user.id
        await existing.save()
        attendanceRecords.push(existing)
      } else {
        // Create new
        const attendance = await Attendance.create({
          student: item.studentId,
          date: new Date(date),
          status: item.status,
          subject,
          course,
          semester,
          section,
          markedBy: req.user.id
        })
        attendanceRecords.push(attendance)
      }
    } catch (error) {
      errors.push({ studentId: item.studentId, error: error.message })
    }
  }

  res.status(201).json({
    message: 'Attendance marked successfully',
    count: attendanceRecords.length,
    records: attendanceRecords,
    errors: errors.length > 0 ? errors : undefined
  })
})

// @desc    Get attendance by filters
// @route   GET /api/attendance
// @access  Private
const getAttendance = asyncHandler(async (req, res) => {
  const { date, subject, course, semester, section, studentId } = req.query
  
  let filter = {}
  
  if (date) filter.date = new Date(date)
  if (subject) filter.subject = subject
  if (course) filter.course = course
  if (semester) filter.semester = semester
  if (section) filter.section = section
  if (studentId) filter.student = studentId

  const attendance = await Attendance.find(filter)
    .populate('student', 'name rollNumber email')
    .populate('markedBy', 'name')
    .sort({ date: -1 })

  res.json(attendance)
})

// @desc    Get student's own attendance
// @route   GET /api/attendance/my-attendance
// @access  Private (student)
const getMyAttendance = asyncHandler(async (req, res) => {
  // Find student record linked to this user
  const student = await Student.findOne({ user: req.user.id })
  
  if (!student) {
    res.status(404)
    throw new Error('Student record not found')
  }

  const attendance = await Attendance.find({ student: student._id })
    .populate('markedBy', 'name')
    .sort({ date: -1 })

  // Calculate subject-wise stats
  const subjects = [...new Set(attendance.map(a => a.subject))]
  const stats = subjects.map(subject => {
    const subjectAttendance = attendance.filter(a => a.subject === subject)
    const total = subjectAttendance.length
    const present = subjectAttendance.filter(a => a.status === 'present').length
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0

    return {
      subject,
      total,
      present,
      absent: subjectAttendance.filter(a => a.status === 'absent').length,
      late: subjectAttendance.filter(a => a.status === 'late').length,
      percentage
    }
  })

  res.json({
    attendance,
    stats,
    overall: {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      percentage: attendance.length > 0 
        ? ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(2) 
        : 0
    }
  })
})

// @desc    Get attendance stats for a student
// @route   GET /api/attendance/student/:id
// @access  Private (teacher, admin, superadmin)
const getStudentAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find({ student: req.params.id })
    .populate('markedBy', 'name')
    .sort({ date: -1 })

  const subjects = [...new Set(attendance.map(a => a.subject))]
  const stats = subjects.map(subject => {
    const subjectAttendance = attendance.filter(a => a.subject === subject)
    const total = subjectAttendance.length
    const present = subjectAttendance.filter(a => a.status === 'present').length
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0

    return {
      subject,
      total,
      present,
      absent: subjectAttendance.filter(a => a.status === 'absent').length,
      late: subjectAttendance.filter(a => a.status === 'late').length,
      percentage
    }
  })

  res.json({
    attendance,
    stats,
    overall: {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      percentage: attendance.length > 0 
        ? ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(2) 
        : 0
    }
  })
})

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (teacher, admin, superadmin)
const deleteAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id)

  if (!attendance) {
    res.status(404)
    throw new Error('Attendance record not found')
  }

  await Attendance.findByIdAndDelete(req.params.id)
  res.json({ message: 'Attendance deleted successfully' })
})

module.exports = {
  markAttendance,
  getAttendance,
  getMyAttendance,
  getStudentAttendance,
  deleteAttendance
}