const express = require('express')
const router = express.Router()
const {
  getTimetable,
  getStudentTimetable,
  getTimetableById,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getTimetableMeta,
} = require('../controllers/timetableController')
const { protect, authorize } = require('../middleware/authMiddleware')

// GET /api/timetable/meta  — allowed days & time slots for dropdowns
router.get('/meta', protect, getTimetableMeta)

// GET /api/timetable/student — student's own timetable
router.get('/student', protect, authorize('student'), getStudentTimetable)

// GET    /api/timetable     — admin: all (filterable), teacher: own entries
// POST   /api/timetable     — admin only: create
router
  .route('/')
  .get(protect, authorize('admin', 'superadmin', 'teacher'), getTimetable)
  .post(protect, authorize('admin', 'superadmin'), createTimetableEntry)

// GET    /api/timetable/:id — admin only: get one
// PUT    /api/timetable/:id — admin only: update
// DELETE /api/timetable/:id — admin only: delete
router
  .route('/:id')
  .get(protect, authorize('admin', 'superadmin'), getTimetableById)
  .put(protect, authorize('admin', 'superadmin'), updateTimetableEntry)
  .delete(protect, authorize('admin', 'superadmin'), deleteTimetableEntry)

module.exports = router
