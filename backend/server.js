const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')

// Load env vars FIRST before anything else
dotenv.config()

const connectDB = require('./config/db')

// Connect to database
connectDB()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/students', require('./routes/studentRoutes'))
app.use('/api/attendance', require('./routes/attendanceRoutes'))
app.use('/api/faculty', require('./routes/facultyRoutes'))
app.use('/api/fees', require('./routes/feeRoutes'))

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

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
