const express = require('express')
const router = express.Router()
const {
  getStudents,
  getLinkedChildren,
  getStudent,
  createStudent,
  updateStudent,
  uploadStudentDocuments,
  deleteStudent,
  recordIdCardDownload,
  resendCredentials,
} = require('../controllers/studentController')
const { protect, authorize } = require('../middleware/authMiddleware')
const { uploadProfileImage, uploadDocuments } = require('../middleware/uploadMiddleware')

// GET /api/students
// POST /api/students
router
  .route('/')
  .get(protect, authorize('superadmin', 'admin', 'accountant'), getStudents)
  .post(
    protect,
    authorize('superadmin', 'admin'),
    uploadProfileImage.single('profileImage'),
    createStudent
  )

// GET /api/students/linked-children
router.get(
  '/linked-children',
  protect,
  authorize('parent'),
  getLinkedChildren
)

// GET    /api/students/:id
// PUT    /api/students/:id
// DELETE /api/students/:id
router
  .route('/:id')
  .get(protect, getStudent)
  .put(
    protect,
    authorize('superadmin', 'admin'),
    uploadProfileImage.single('profileImage'),
    updateStudent
  )
  .delete(protect, authorize('superadmin', 'admin'), deleteStudent)

// POST /api/students/:id/documents
router.post(
  '/:id/documents',
  protect,
  uploadDocuments.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'marksheet10th', maxCount: 1 },
    { name: 'marksheet12th', maxCount: 1 },
    { name: 'casteCertificate', maxCount: 1 },
    { name: 'bonafideCertificate', maxCount: 1 },
    { name: 'aadhaarDocument', maxCount: 1 },
  ]),
  uploadStudentDocuments
)

// POST /api/students/:id/id-card-download
router.route('/:id/id-card-download').post(protect, authorize('student'), recordIdCardDownload)
router.route('/:id/resend-credentials').post(protect, authorize('superadmin', 'admin'), resendCredentials)

module.exports = router
