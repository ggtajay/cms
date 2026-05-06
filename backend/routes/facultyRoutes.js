const express = require('express')
const router = express.Router()
const {
  getFaculty,
  getSingleFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  uploadFacultyDocuments,
  recordIdCardDownload,
  resendCredentials
} = require('../controllers/facultyController')
const { protect, authorize } = require('../middleware/authMiddleware')
const { uploadProfileImage, uploadDocuments } = require('../middleware/uploadMiddleware')

// @route   GET /api/faculty
// @route   POST /api/faculty
router
  .route('/')
  .get(protect, authorize('superadmin', 'admin'), getFaculty)
  .post(
    protect,
    authorize('superadmin', 'admin'),
    uploadProfileImage.single('profileImage'),
    createFaculty
  )

// @route   GET /api/faculty/:id
// @route   PUT /api/faculty/:id
// @route   DELETE /api/faculty/:id
router
  .route('/:id')
  .get(protect, getSingleFaculty)
  .put(
    protect,
    authorize('superadmin', 'admin'),
    uploadProfileImage.single('profileImage'),
    updateFaculty
  )
  .delete(protect, authorize('superadmin', 'admin'), deleteFaculty)

// POST /api/faculty/:id/documents
router.post(
  '/:id/documents',
  protect,
  uploadDocuments.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'degreeCertificate', maxCount: 1 },
    { name: 'idProof', maxCount: 1 },
    { name: 'experienceLetter', maxCount: 1 },
  ]),
  uploadFacultyDocuments
)

// POST /api/faculty/:id/id-card-download
router.post('/:id/id-card-download', protect, authorize('teacher'), recordIdCardDownload)

// POST /api/faculty/:id/resend-credentials
router.post('/:id/resend-credentials', protect, authorize('superadmin', 'admin'), resendCredentials)

module.exports = router
