const Hostel = require('../models/Hostel')
const asyncHandler = require('express-async-handler')

// @desc    Create hostel
// @route   POST /api/hostels
// @access  Private (admin, superadmin)
const createHostel = asyncHandler(async (req, res) => {
  const { hostelName, hostelType, totalRooms, wardenName, wardenPhone, address, facilities, feePerMonth } = req.body

  const hostel = await Hostel.create({
    hostelName,
    hostelType,
    totalRooms,
    wardenName,
    wardenPhone,
    address,
    facilities,
    feePerMonth,
    rooms: []
  })

  res.status(201).json({
    message: 'Hostel created successfully',
    hostel
  })
})

// @desc    Get all hostels
// @route   GET /api/hostels
// @access  Private
const getHostels = asyncHandler(async (req, res) => {
  const hostels = await Hostel.find({})
    .populate('rooms.studentsAssigned', 'name rollNumber email phone')
    .sort({ createdAt: -1 })
  
  res.json(hostels)
})

// @desc    Get single hostel
// @route   GET /api/hostels/:id
// @access  Private
const getHostel = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findById(req.params.id)
    .populate('rooms.studentsAssigned', 'name rollNumber email phone course')

  if (!hostel) {
    res.status(404)
    throw new Error('Hostel not found')
  }

  res.json(hostel)
})

// @desc    Update hostel
// @route   PUT /api/hostels/:id
// @access  Private (admin, superadmin)
const updateHostel = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findById(req.params.id)

  if (!hostel) {
    res.status(404)
    throw new Error('Hostel not found')
  }

  const updatedHostel = await Hostel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )

  res.json({
    message: 'Hostel updated successfully',
    hostel: updatedHostel
  })
})

// @desc    Add room to hostel
// @route   POST /api/hostels/:id/rooms
// @access  Private (admin, superadmin)
const addRoom = asyncHandler(async (req, res) => {
  const { roomNumber, floor, capacity, roomType, facilities } = req.body
  const hostel = await Hostel.findById(req.params.id)

  if (!hostel) {
    res.status(404)
    throw new Error('Hostel not found')
  }

  // Check if room number already exists
  const roomExists = hostel.rooms.find(r => r.roomNumber === roomNumber)
  if (roomExists) {
    res.status(400)
    throw new Error('Room number already exists in this hostel')
  }

  hostel.rooms.push({
    roomNumber,
    floor,
    capacity,
    roomType,
    facilities: facilities || [],
    studentsAssigned: []
  })

  await hostel.save()

  res.json({
    message: 'Room added successfully',
    hostel
  })
})

// @desc    Assign student to room
// @route   POST /api/hostels/:id/rooms/:roomId/assign
// @access  Private (admin, superadmin)
const assignStudentToRoom = asyncHandler(async (req, res) => {
  const { studentId } = req.body
  const hostel = await Hostel.findById(req.params.id)

  if (!hostel) {
    res.status(404)
    throw new Error('Hostel not found')
  }

  const room = hostel.rooms.id(req.params.roomId)
  if (!room) {
    res.status(404)
    throw new Error('Room not found')
  }

  if (room.studentsAssigned.includes(studentId)) {
    res.status(400)
    throw new Error('Student already assigned to this room')
  }

  if (room.studentsAssigned.length >= room.capacity) {
    res.status(400)
    throw new Error('Room is at full capacity')
  }

  room.studentsAssigned.push(studentId)
  await hostel.save()

  res.json({
    message: 'Student assigned successfully',
    hostel
  })
})

// @desc    Remove student from room
// @route   DELETE /api/hostels/:id/rooms/:roomId/remove/:studentId
// @access  Private (admin, superadmin)
const removeStudentFromRoom = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findById(req.params.id)

  if (!hostel) {
    res.status(404)
    throw new Error('Hostel not found')
  }

  const room = hostel.rooms.id(req.params.roomId)
  if (!room) {
    res.status(404)
    throw new Error('Room not found')
  }

  room.studentsAssigned = room.studentsAssigned.filter(
    s => s.toString() !== req.params.studentId
  )
  await hostel.save()

  res.json({
    message: 'Student removed successfully',
    hostel
  })
})

// @desc    Delete room
// @route   DELETE /api/hostels/:id/rooms/:roomId
// @access  Private (admin, superadmin)
const deleteRoom = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findById(req.params.id)

  if (!hostel) {
    res.status(404)
    throw new Error('Hostel not found')
  }

  const room = hostel.rooms.id(req.params.roomId)
  if (!room) {
    res.status(404)
    throw new Error('Room not found')
  }

  if (room.studentsAssigned.length > 0) {
    res.status(400)
    throw new Error('Cannot delete room with assigned students')
  }

  hostel.rooms.pull(req.params.roomId)
  await hostel.save()

  res.json({
    message: 'Room deleted successfully',
    hostel
  })
})

// @desc    Delete hostel
// @route   DELETE /api/hostels/:id
// @access  Private (admin, superadmin)
const deleteHostel = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findById(req.params.id)

  if (!hostel) {
    res.status(404)
    throw new Error('Hostel not found')
  }

  // Check if any rooms have students
  const hasStudents = hostel.rooms.some(room => room.studentsAssigned.length > 0)
  if (hasStudents) {
    res.status(400)
    throw new Error('Cannot delete hostel with assigned students')
  }

  await Hostel.findByIdAndDelete(req.params.id)
  res.json({ message: 'Hostel deleted successfully' })
})

module.exports = {
  createHostel,
  getHostels,
  getHostel,
  updateHostel,
  addRoom,
  assignStudentToRoom,
  removeStudentFromRoom,
  deleteRoom,
  deleteHostel
}