const mongoose = require('mongoose')
const dotenv = require('dotenv')
const User = require('./models/User')

dotenv.config()

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB Connected...')

    // Delete existing superadmin
    await User.deleteOne({ email: 'superadmin@cms.com' })

    // Create superadmin
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@cms.com',
      password: 'superadmin123',
      role: 'superadmin',
      isActive: true
    })

    console.log('Super Admin created:', superAdmin.email)
    process.exit()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

seedSuperAdmin()