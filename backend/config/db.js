const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
    return true
  } catch (error) {
    console.error(`Error: ${error.message}`)
    console.error('MongoDB connection failed. Continuing startup for debugging; database-backed APIs may fail until DB is reachable.')
    return false
  }
}

module.exports = connectDB