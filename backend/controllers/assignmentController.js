const Assignment = require('../models/Assignment')
const Student = require('../models/Student')
const asyncHandler = require('express-async-handler')

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private (teacher, admin, superadmin)
const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, subject, course, semester, section, dueDate, totalMarks } = req.body

  const assignment = await Assignment.create({
    title,
    description,
    subject,
    course,
    semester,
    section,
    dueDate,
    totalMarks,
    createdBy: req.user.id
  })

  const populatedAssignment = await Assignment.findById(assignment._id)
    .populate('createdBy', 'name email')

  res.status(201).json({
    message: 'Assignment created successfully',
    assignment: populatedAssignment
  })
})

// @desc    Get all assignments (for teachers/admin)
// @route   GET /api/assignments
// @access  Private (teacher, admin, superadmin)
const getAssignments = asyncHandler(async (req, res) => {
  const { course, semester, subject } = req.query

  let filter = {}
  if (course) filter.course = course
  if (semester) filter.semester = semester
  if (subject) filter.subject = subject

  const assignments = await Assignment.find(filter)
    .populate('createdBy', 'name')
    .populate('submissions.student', 'name rollNumber email')
    .sort({ createdAt: -1 })

  res.json(assignments)
})

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('submissions.student', 'name rollNumber email course semester')

  if (!assignment) {
    res.status(404)
    throw new Error('Assignment not found')
  }

  res.json(assignment)
})

// @desc    Get my assignments (for students)
// @route   GET /api/assignments/my-assignments
// @access  Private (student)
const getMyAssignments = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user.id })

  if (!student) {
    res.status(404)
    throw new Error('Student record not found')
  }

  const assignments = await Assignment.find({
    course: student.course,
    semester: student.semester,
    section: student.section,
    isActive: true
  })
    .populate('createdBy', 'name')
    .sort({ dueDate: 1 })

  // Add submission status for each assignment
  const assignmentsWithStatus = assignments.map(assignment => {
    const submission = assignment.submissions.find(
      sub => sub.student.toString() === student._id.toString()
    )
    
    return {
      ...assignment.toObject(),
      mySubmission: submission || null,
      isSubmitted: !!submission
    }
  })

  res.json(assignmentsWithStatus)
})

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (student)
const submitAssignment = asyncHandler(async (req, res) => {
  const { content } = req.body
  const assignment = await Assignment.findById(req.params.id)

  if (!assignment) {
    res.status(404)
    throw new Error('Assignment not found')
  }

  const student = await Student.findOne({ user: req.user.id })
  if (!student) {
    res.status(404)
    throw new Error('Student record not found')
  }

  // Check if already submitted
  const existingSubmission = assignment.submissions.find(
    sub => sub.student.toString() === student._id.toString()
  )

  if (existingSubmission) {
    res.status(400)
    throw new Error('Assignment already submitted')
  }

  // Check if late
  const isLate = new Date() > new Date(assignment.dueDate)

  assignment.submissions.push({
    student: student._id,
    content,
    status: isLate ? 'late' : 'submitted'
  })

  await assignment.save()

  res.json({
    message: 'Assignment submitted successfully',
    submission: assignment.submissions[assignment.submissions.length - 1]
  })
})

// @desc    Grade assignment submission
// @route   PUT /api/assignments/:id/grade/:submissionId
// @access  Private (teacher, admin, superadmin)
const gradeSubmission = asyncHandler(async (req, res) => {
  const { marksObtained, feedback } = req.body
  const assignment = await Assignment.findById(req.params.id)

  if (!assignment) {
    res.status(404)
    throw new Error('Assignment not found')
  }

  const submission = assignment.submissions.id(req.params.submissionId)
  if (!submission) {
    res.status(404)
    throw new Error('Submission not found')
  }

  if (marksObtained > assignment.totalMarks) {
    res.status(400)
    throw new Error('Marks obtained cannot exceed total marks')
  }

  submission.marksObtained = marksObtained
  submission.feedback = feedback || ''
  submission.status = 'graded'

  await assignment.save()

  res.json({
    message: 'Submission graded successfully',
    submission
  })
})

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (teacher, admin, superadmin)
const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)

  if (!assignment) {
    res.status(404)
    throw new Error('Assignment not found')
  }

  const updatedAssignment = await Assignment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).populate('createdBy', 'name')

  res.json({
    message: 'Assignment updated successfully',
    assignment: updatedAssignment
  })
})

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (teacher, admin, superadmin)
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)

  if (!assignment) {
    res.status(404)
    throw new Error('Assignment not found')
  }

  await Assignment.findByIdAndDelete(req.params.id)
  res.json({ message: 'Assignment deleted successfully' })
})

module.exports = {
  createAssignment,
  getAssignments,
  getAssignment,
  getMyAssignments,
  submitAssignment,
  gradeSubmission,
  updateAssignment,
  deleteAssignment
}