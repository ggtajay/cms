const asyncHandler = require('express-async-handler')
const HelpdeskTicket = require('../models/HelpdeskTicket')

// @desc    Create a helpdesk ticket
// @route   POST /api/helpdesk
// @access  Private
const createTicket = asyncHandler(async (req, res) => {
  const { category, subject, description, priority } = req.body

  if (!category || !subject || !description) {
    res.status(400)
    throw new Error('Category, subject and description are required')
  }

  const ticket = await HelpdeskTicket.create({
    requester: req.user._id,
    requesterName: req.user.name,
    requesterEmail: req.user.email,
    requesterRole: req.user.role,
    category,
    subject,
    description,
    priority: priority || 'medium'
  })

  res.status(201).json({
    message: 'Ticket created successfully',
    ticket
  })
})

// @desc    Get current user's tickets
// @route   GET /api/helpdesk/me
// @access  Private
const getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await HelpdeskTicket.find({ requester: req.user._id })
    .sort({ createdAt: -1 })

  res.json(tickets)
})

// @desc    Get all tickets for admin/superadmin
// @route   GET /api/helpdesk
// @access  Private (admin, superadmin)
const getTickets = asyncHandler(async (req, res) => {
  const { status, category, requesterRole } = req.query
  const filters = {}

  if (status) {
    filters.status = status
  }

  if (category) {
    filters.category = category
  }

  if (requesterRole) {
    filters.requesterRole = requesterRole
  }

  const tickets = await HelpdeskTicket.find(filters)
    .populate('handledBy', 'name email role')
    .sort({ createdAt: -1 })

  res.json(tickets)
})

// @desc    Get single ticket
// @route   GET /api/helpdesk/:id
// @access  Private
const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await HelpdeskTicket.findById(req.params.id)
    .populate('handledBy', 'name email role')

  if (!ticket) {
    res.status(404)
    throw new Error('Ticket not found')
  }

  const isOwner = ticket.requester.toString() === req.user._id.toString()
  const isAdmin = ['admin', 'superadmin'].includes(req.user.role)

  if (!isOwner && !isAdmin) {
    res.status(403)
    throw new Error('You are not authorized to view this ticket')
  }

  res.json(ticket)
})

// @desc    Update ticket status and admin remark
// @route   PUT /api/helpdesk/:id
// @access  Private (admin, superadmin)
const updateTicket = asyncHandler(async (req, res) => {
  const { status, priority, adminRemark } = req.body
  const ticket = await HelpdeskTicket.findById(req.params.id)

  if (!ticket) {
    res.status(404)
    throw new Error('Ticket not found')
  }

  if (status) {
    ticket.status = status
  }

  if (priority) {
    ticket.priority = priority
  }

  if (typeof adminRemark === 'string') {
    ticket.adminRemark = adminRemark.trim()
  }

  ticket.handledBy = req.user._id
  ticket.resolvedAt = ['resolved', 'rejected'].includes(ticket.status)
    ? new Date()
    : null

  await ticket.save()

  const updatedTicket = await HelpdeskTicket.findById(ticket._id)
    .populate('handledBy', 'name email role')

  res.json({
    message: 'Ticket updated successfully',
    ticket: updatedTicket
  })
})

module.exports = {
  createTicket,
  getMyTickets,
  getTickets,
  getTicketById,
  updateTicket
}
