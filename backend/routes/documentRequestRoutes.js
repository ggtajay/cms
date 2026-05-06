const express = require('express')
const router = express.Router()
const {
  createDocumentRequest,
  getMyDocumentRequests,
  getDocumentRequests,
  getDocumentRequestById,
  updateDocumentRequest
} = require('../controllers/documentRequestController')
const { protect, authorize } = require('../middleware/authMiddleware')

router
  .route('/')
  .post(protect, createDocumentRequest)
  .get(protect, authorize('admin', 'superadmin'), getDocumentRequests)

router.get('/me', protect, getMyDocumentRequests)

router
  .route('/:id')
  .get(protect, getDocumentRequestById)
  .put(protect, authorize('admin', 'superadmin'), updateDocumentRequest)

module.exports = router
