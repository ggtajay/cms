const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/authMiddleware')
const {
  applyRegular,
  applyOnline,
  trackApplication,
  getApplications,
  approveApplication,
  rejectApplication,
  updateApplicationStatus,
  createWalkInApplication,
} = require('../controllers/applicationController')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Ensure upload directory exists
const documentsDir = path.join(__dirname, '..', 'uploads', 'documents')
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true })
}

// Storage config for documents
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, documentsDir)
  },
  filename(req, file, cb) {
    cb(null, `app-${Date.now()}${path.extname(file.originalname)}`)
  },
})
const upload = multer({ storage })

// ── Public Routes ──────────────────────────────────────────────────────────────
router.post(
  '/apply-regular',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'previousMarksheet', maxCount: 1 },
    { name: 'idProof', maxCount: 1 },
  ]),
  applyRegular
)
router.post('/apply-online', applyOnline)
router.get('/track/:id', trackApplication)

// ── Admin Routes ───────────────────────────────────────────────────────────────
router.get('/', protect, authorize('admin', 'superadmin'), getApplications)

// Approve / Reject (dedicated endpoints)
router.put('/:id/approve', protect, authorize('admin', 'superadmin'), approveApplication)
router.put('/:id/reject', protect, authorize('admin', 'superadmin'), rejectApplication)

// Unified status endpoint (fixes the admin-panel bug that calls /status)
router.put('/:id/status', protect, authorize('admin', 'superadmin'), updateApplicationStatus)

// Walk-in admission by staff
router.post('/walk-in', protect, authorize('admin', 'superadmin'), createWalkInApplication)

module.exports = router
