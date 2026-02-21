const Transport = require('../models/Transport')
const asyncHandler = require('express-async-handler')

// @desc    Create transport route
// @route   POST /api/transport
// @access  Private (admin, superadmin)
const createRoute = asyncHandler(async (req, res) => {
  const { routeName, routeNumber, vehicleNumber, driverName, driverPhone, stops, capacity } = req.body

  const routeExists = await Transport.findOne({ routeNumber })
  if (routeExists) {
    res.status(400)
    throw new Error('Route number already exists')
  }

  const route = await Transport.create({
    routeName,
    routeNumber,
    vehicleNumber,
    driverName,
    driverPhone,
    stops,
    capacity
  })

  res.status(201).json({
    message: 'Transport route created successfully',
    route
  })
})

// @desc    Get all routes
// @route   GET /api/transport
// @access  Private
const getRoutes = asyncHandler(async (req, res) => {
  const routes = await Transport.find({})
    .populate('studentsAssigned', 'name rollNumber course')
    .sort({ createdAt: -1 })
  
  res.json(routes)
})

// @desc    Get single route
// @route   GET /api/transport/:id
// @access  Private
const getRoute = asyncHandler(async (req, res) => {
  const route = await Transport.findById(req.params.id)
    .populate('studentsAssigned', 'name rollNumber email phone course')

  if (!route) {
    res.status(404)
    throw new Error('Route not found')
  }

  res.json(route)
})

// @desc    Update route
// @route   PUT /api/transport/:id
// @access  Private (admin, superadmin)
const updateRoute = asyncHandler(async (req, res) => {
  const route = await Transport.findById(req.params.id)

  if (!route) {
    res.status(404)
    throw new Error('Route not found')
  }

  const updatedRoute = await Transport.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).populate('studentsAssigned', 'name rollNumber')

  res.json({
    message: 'Route updated successfully',
    route: updatedRoute
  })
})

// @desc    Assign student to route
// @route   POST /api/transport/:id/assign
// @access  Private (admin, superadmin)
const assignStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.body
  const route = await Transport.findById(req.params.id)

  if (!route) {
    res.status(404)
    throw new Error('Route not found')
  }

  if (route.studentsAssigned.includes(studentId)) {
    res.status(400)
    throw new Error('Student already assigned to this route')
  }

  if (route.studentsAssigned.length >= route.capacity) {
    res.status(400)
    throw new Error('Route is at full capacity')
  }

  route.studentsAssigned.push(studentId)
  await route.save()

  res.json({
    message: 'Student assigned successfully',
    route
  })
})

// @desc    Remove student from route
// @route   DELETE /api/transport/:id/remove/:studentId
// @access  Private (admin, superadmin)
const removeStudent = asyncHandler(async (req, res) => {
  const route = await Transport.findById(req.params.id)

  if (!route) {
    res.status(404)
    throw new Error('Route not found')
  }

  route.studentsAssigned = route.studentsAssigned.filter(
    s => s.toString() !== req.params.studentId
  )
  await route.save()

  res.json({
    message: 'Student removed successfully',
    route
  })
})

// @desc    Delete route
// @route   DELETE /api/transport/:id
// @access  Private (admin, superadmin)
const deleteRoute = asyncHandler(async (req, res) => {
  const route = await Transport.findById(req.params.id)

  if (!route) {
    res.status(404)
    throw new Error('Route not found')
  }

  await Transport.findByIdAndDelete(req.params.id)
  res.json({ message: 'Route deleted successfully' })
})

module.exports = {
  createRoute,
  getRoutes,
  getRoute,
  updateRoute,
  assignStudent,
  removeStudent,
  deleteRoute
}