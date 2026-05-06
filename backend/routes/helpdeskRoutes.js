const express = require('express')
const router = express.Router()
const {
  createTicket,
  getMyTickets,
  getTickets,
  getTicketById,
  updateTicket
} = require('../controllers/helpdeskController')
const { protect, authorize } = require('../middleware/authMiddleware')

router
  .route('/')
  .post(protect, createTicket)
  .get(protect, authorize('admin', 'superadmin'), getTickets)

router.get('/me', protect, getMyTickets)

router
  .route('/:id')
  .get(protect, getTicketById)
  .put(protect, authorize('admin', 'superadmin'), updateTicket)

module.exports = router
