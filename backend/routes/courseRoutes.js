const express = require('express')
const router = express.Router()
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  addDepartment,
  removeDepartment,
  deleteCourse,
} = require('../controllers/courseController')
const { protect, authorize } = require('../middleware/authMiddleware')

// GET  /api/courses/public — no auth required (for public Programs page)
router.get('/public', getCourses)

// GET  /api/courses       — all authenticated users (for dropdowns)
// POST /api/courses       — admin, superadmin only
router
  .route('/')
  .get(protect, getCourses)
  .post(protect, authorize('admin', 'superadmin'), createCourse)

// GET /api/courses/:id
// PUT /api/courses/:id
// DELETE /api/courses/:id
router
  .route('/:id')
  .get(protect, getCourse)
  .put(protect, authorize('admin', 'superadmin'), updateCourse)
  .delete(protect, authorize('superadmin'), deleteCourse)

// POST   /api/courses/:id/departments
// DELETE /api/courses/:id/departments/:dept
router.post('/:id/departments', protect, authorize('admin', 'superadmin'), addDepartment)
router.delete('/:id/departments/:dept', protect, authorize('admin', 'superadmin'), removeDepartment)

module.exports = router
