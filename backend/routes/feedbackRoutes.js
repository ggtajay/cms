const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const Feedback = require('../models/Feedback')

// POST /api/feedback - Submit new feedback
router.post('/', protect, async (req, res) => {
  try {
    const { category, rating, comments } = req.body

    const feedback = await Feedback.create({
      user: req.user.id,
      role: req.user.role,
      category,
      rating,
      comments
    })

    res.status(201).json({ message: 'Feedback submitted successfully', feedback })
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit feedback', error: error.message })
  }
})

// GET /api/feedback - Admin view all feedback
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized' })
    }
    const feedback = await Feedback.find().populate('user', 'name email').sort({ createdAt: -1 })
    res.json(feedback)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch feedback' })
  }
})

module.exports = router
