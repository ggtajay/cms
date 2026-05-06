const asyncHandler = require('express-async-handler')
const DocumentRequest = require('../models/DocumentRequest')

// @desc    Create a document request
// @route   POST /api/document-requests
// @access  Private
const createDocumentRequest = asyncHandler(async (req, res) => {
  const { documentType, purpose, note } = req.body

  if (!documentType || !purpose) {
    res.status(400)
    throw new Error('Document type and purpose are required')
  }

  const request = await DocumentRequest.create({
    requester: req.user._id,
    requesterName: req.user.name,
    requesterEmail: req.user.email,
    requesterRole: req.user.role,
    documentType,
    purpose,
    note
  })

  res.status(201).json({
    message: 'Document request created successfully',
    request
  })
})

// @desc    Get current user's document requests
// @route   GET /api/document-requests/me
// @access  Private
const getMyDocumentRequests = asyncHandler(async (req, res) => {
  const requests = await DocumentRequest.find({ requester: req.user._id })
    .sort({ createdAt: -1 })

  res.json(requests)
})

// @desc    Get all document requests for admin/superadmin
// @route   GET /api/document-requests
// @access  Private (admin, superadmin)
const getDocumentRequests = asyncHandler(async (req, res) => {
  const { status, documentType, requesterRole } = req.query
  const filters = {}

  if (status) {
    filters.status = status
  }

  if (documentType) {
    filters.documentType = documentType
  }

  if (requesterRole) {
    filters.requesterRole = requesterRole
  }

  const requests = await DocumentRequest.find(filters)
    .populate('handledBy', 'name email role')
    .sort({ createdAt: -1 })

  res.json(requests)
})

// @desc    Get single document request
// @route   GET /api/document-requests/:id
// @access  Private
const getDocumentRequestById = asyncHandler(async (req, res) => {
  const request = await DocumentRequest.findById(req.params.id)
    .populate('handledBy', 'name email role')

  if (!request) {
    res.status(404)
    throw new Error('Document request not found')
  }

  const isOwner = request.requester.toString() === req.user._id.toString()
  const isAdmin = ['admin', 'superadmin'].includes(req.user.role)

  if (!isOwner && !isAdmin) {
    res.status(403)
    throw new Error('You are not authorized to view this document request')
  }

  res.json(request)
})

// @desc    Update document request status and remark
// @route   PUT /api/document-requests/:id
// @access  Private (admin, superadmin)
const updateDocumentRequest = asyncHandler(async (req, res) => {
  const { status, adminRemark } = req.body
  const request = await DocumentRequest.findById(req.params.id)

  if (!request) {
    res.status(404)
    throw new Error('Document request not found')
  }

  if (status) {
    request.status = status
  }

  if (typeof adminRemark === 'string') {
    request.adminRemark = adminRemark.trim()
  }

  request.handledBy = req.user._id
  request.resolvedAt = ['approved', 'rejected', 'completed'].includes(request.status)
    ? new Date()
    : null

  await request.save()

  const updatedRequest = await DocumentRequest.findById(request._id)
    .populate('handledBy', 'name email role')

  res.json({
    message: 'Document request updated successfully',
    request: updatedRequest
  })
})

module.exports = {
  createDocumentRequest,
  getMyDocumentRequests,
  getDocumentRequests,
  getDocumentRequestById,
  updateDocumentRequest
}
