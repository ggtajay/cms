const Notice = require('../models/Notice')
const asyncHandler = require('express-async-handler')

// @desc    Create new notice
// @route   POST /api/notices
// @access  Private (admin, superadmin)
const createNotice = asyncHandler(async (req, res) => {
  const { title, content, category, targetAudience, isImportant } = req.body

  const notice = await Notice.create({
    title,
    content,
    category,
    targetAudience,
    isImportant,
    postedBy: req.user.id
  })

  const populatedNotice = await Notice.findById(notice._id).populate('postedBy', 'name role')

  res.status(201).json({
    message: 'Notice created successfully',
    notice: populatedNotice
  })
})

// @desc    Get all notices
// @route   GET /api/notices
// @access  Private
const getNotices = asyncHandler(async (req, res) => {
  const { category, targetAudience } = req.query

  let filter = { isActive: true }
  
  if (category) filter.category = category
  if (targetAudience) filter.targetAudience = { $in: [targetAudience, 'all'] }

  const notices = await Notice.find(filter)
    .populate('postedBy', 'name role')
    .sort({ isImportant: -1, createdAt: -1 })

  res.json(notices)
})

// @desc    Get single notice
// @route   GET /api/notices/:id
// @access  Private
const getNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id).populate('postedBy', 'name role')

  if (!notice) {
    res.status(404)
    throw new Error('Notice not found')
  }

  res.json(notice)
})

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Private (admin, superadmin)
const updateNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id)

  if (!notice) {
    res.status(404)
    throw new Error('Notice not found')
  }

  const updatedNotice = await Notice.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).populate('postedBy', 'name role')

  res.json({
    message: 'Notice updated successfully',
    notice: updatedNotice
  })
})

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private (admin, superadmin)
const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id)

  if (!notice) {
    res.status(404)
    throw new Error('Notice not found')
  }

  await Notice.findByIdAndDelete(req.params.id)
  res.json({ message: 'Notice deleted successfully' })
})

module.exports = {
  createNotice,
  getNotices,
  getNotice,
  updateNotice,
  deleteNotice
}