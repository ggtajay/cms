const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { protect: auth } = require('../middleware/authMiddleware')
const User = require('../models/User')

// GET /api/settings/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/settings/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' })
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name: name.trim(), phone: phone || '', address: address || '' } },
      { new: true, select: '-password' }
    )
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ message: 'Profile updated successfully', user })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/settings/password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both passwords are required' })
    if (newPassword.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters' })
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    const match = await bcrypt.compare(currentPassword, user.password)
    if (!match) return res.status(400).json({ message: 'Current password is incorrect' })
    const hashed = await bcrypt.hash(newPassword, 12)
    await User.findByIdAndUpdate(req.user.id, { password: hashed })
    res.json({ message: 'Password changed successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
