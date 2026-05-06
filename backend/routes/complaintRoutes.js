const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { protect, authorize } = require('../middleware/authMiddleware')
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateStatus,
  respondToComplaint,
  assignComplaint,
  getComplaintStats,
  runEscalation,
} = require('../controllers/complaintController')

// ── Upload config for complaint attachments ───────────────────────────────────
const uploadsDir = path.join(__dirname, '..', 'uploads', 'complaints')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir)
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname)
    cb(null, `complaint-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|txt/
  const extName = allowed.test(path.extname(file.originalname).toLowerCase())
  const mimeType = allowed.test(file.mimetype)
  if (extName || mimeType) {
    cb(null, true)
  } else {
    cb(new Error('Only images, PDFs, and documents are allowed'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
})

// ── Routes ────────────────────────────────────────────────────────────────────

// Student / Teacher: create complaint with optional attachments
router.post(
  '/',
  protect,
  authorize('student', 'teacher'),
  upload.array('attachments', 5),
  createComplaint
)

// Student / Teacher: view their own complaints
router.get('/my', protect, authorize('student', 'teacher'), getMyComplaints)

// Admin: stats dashboard widget
router.get('/stats', protect, authorize('admin', 'superadmin'), getComplaintStats)

// Admin: all complaints (with ?status=&category=&priority=&page=&limit=)
router.get('/', protect, authorize('admin', 'superadmin'), getAllComplaints)

// Admin: update status
router.put('/:id/status', protect, authorize('admin', 'superadmin'), updateStatus)

// Admin: respond
router.put('/:id/respond', protect, authorize('admin', 'superadmin'), respondToComplaint)

// Admin: assign to staff
router.put('/:id/assign', protect, authorize('admin', 'superadmin'), assignComplaint)

// Attachment upload endpoint (standalone — returns URLs for use in form)
router.post(
  '/upload',
  protect,
  authorize('student', 'teacher'),
  upload.array('attachments', 5),
  (req, res) => {
    const urls = (req.files || []).map((f) => `/uploads/complaints/${f.filename}`)
    res.json({ urls })
  }
)

// SuperAdmin: trigger manual escalation (also run by cron)
router.post('/escalate', protect, authorize('superadmin'), runEscalation)

module.exports = router
