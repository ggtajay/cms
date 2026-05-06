const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const path = require('path')

// Load env vars FIRST before anything else
dotenv.config()

const connectDB = require('./config/db')

// ── SuperAdmin Auto-Seeder ─────────────────────────────────────────────────────
// Ensures at least one superadmin account exists after every server start.
// Does NOT overwrite an existing superadmin.
const ensureSuperAdmin = async () => {
  try {
    const User = require('./models/User')
    const { generateUserId } = require('./utils/idGenerator')

    const existing = await User.findOne({ role: 'superadmin' })
    if (existing) {
      console.log(`[SuperAdmin] OK — account exists (${existing.email})`)
      return
    }

    // No superadmin found — create one
    const userId = await generateUserId('superadmin')
    const email    = process.env.SUPERADMIN_EMAIL    || 'superadmin@cms.com'
    const password = process.env.SUPERADMIN_PASSWORD || 'Superadmin@123'

    await User.create({
      name: 'System Superadmin',
      userId,
      email,
      password,
      role: 'superadmin',
      phone: '0000000000',
      isActive: true,
      isFirstLogin: false,
    })

    console.log(`[SuperAdmin] Created — email: ${email} | userId: ${userId}`)
    console.log('[SuperAdmin] ⚠️  Change the default password immediately in production!')
  } catch (err) {
    // Non-fatal — log and continue
    console.error('[SuperAdmin] Auto-seed error:', err.message)
  }
}

// Connect to database
connectDB().then(() => ensureSuperAdmin())

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))


// Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/students', require('./routes/studentRoutes'))
app.use('/api/attendance', require('./routes/attendanceRoutes'))
app.use('/api/faculty', require('./routes/facultyRoutes'))
app.use('/api/fees', require('./routes/feeRoutes'))
app.use('/api/notices', require('./routes/noticeRoutes'))
app.use('/api/assignments', require('./routes/assignmentRoutes'))
app.use('/api/hostels', require('./routes/hostelRoutes'))
app.use('/api/transport', require('./routes/transportRoutes'))
app.use('/api/helpdesk', require('./routes/helpdeskRoutes'))
app.use('/api/document-requests', require('./routes/documentRequestRoutes'))
app.use('/api/timetable', require('./routes/timetableRoutes'))
app.use('/api/courses', require('./routes/courseRoutes'))
app.use('/api/payment', require('./routes/paymentRoutes'))
app.use('/api/academic', require('./routes/academicRoutes'))
app.use('/api/otp', require('./routes/otpRoutes'))
app.use('/api/applications', require('./routes/applicationRoutes'))
app.use('/api/complaints',   require('./routes/complaintRoutes'))
app.use('/api/settings',    require('./routes/settingsRoutes'))
app.use('/api/feedback',    require('./routes/feedbackRoutes'))

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'CMS API is running...' })
})

// Error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  })
})


// connect to database

const PORT = process.env.PORT || 5000

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)

  // ── Email SMTP Health Check ─────────────────────────────────────────────────
  const { verifyTransporter } = require('./utils/mailer')
  await verifyTransporter()

  // ── Auto-Escalation Cron (every hour) ──────────────────────────────────────
  // Finds complaints unresolved for 3+ days and bumps them to HIGH priority.
  const escalateComplaintsJob = async () => {
    try {
      const Complaint = require('./models/Complaint')
      const { sendNotification } = require('./utils/mailer')
      const User = require('./models/User')

      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      const toEscalate = await Complaint.find({
        status: { $in: ['PENDING', 'IN_PROGRESS'] },
        createdAt: { $lte: threeDaysAgo },
        escalated: false,
      })

      if (toEscalate.length === 0) return

      await Complaint.updateMany(
        { _id: { $in: toEscalate.map(c => c._id) } },
        { $set: { escalated: true, escalatedAt: new Date(), priority: 'HIGH' } }
      )

      const superadmins = await User.find({ role: 'superadmin', isActive: true }).select('email')
      const promises = superadmins.map(sa =>
        sendNotification({
          to: sa.email,
          subject: `[Auto-Escalation] ${toEscalate.length} complaint(s) need attention`,
          text: `${toEscalate.length} unresolved complaint(s) have been auto-escalated to HIGH priority after 3 days. Please log in to review them.`,
        })
      )
      await Promise.allSettled(promises)
      console.log(`[Escalation] Auto-escalated ${toEscalate.length} complaint(s)`)
    } catch (err) {
      console.error('[Escalation] Cron error:', err.message)
    }
  }

  // Run once at startup, then every hour
  escalateComplaintsJob()
  setInterval(escalateComplaintsJob, 60 * 60 * 1000)
})
