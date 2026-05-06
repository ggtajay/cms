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
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const { cloudinary } = require('../config/cloudinary')

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cms/complaints',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf']
  }
})

const upload = multer({
  storage,
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
    const urls = (req.files || []).map((f) => f.path)
    res.json({ urls })
  }
)

// SuperAdmin: trigger manual escalation (also run by cron)
router.post('/escalate', protect, authorize('superadmin'), runEscalation)

module.exports = router
