import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdDirectionsBus, MdAdd, MdEdit, MdDelete, MdPeople } from 'react-icons/md'

const TransportManagement = () => {
  const [routes, setRoutes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentRoute, setCurrentRoute] = useState(null)
  const [formData, setFormData] = useState({
    routeName: '',
    routeNumber: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    capacity: '',
    stops: [{ stopName: '', timing: '', fare: '' }]
  })
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  const fetchRoutes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/transport', config)
      setRoutes(res.data)
    } catch (error) {
      toast.error('Failed to fetch routes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoutes()
  }, [])

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const onStopChange = (index, field, value) => {
    const newStops = [...formData.stops]
    newStops[index][field] = value
    setFormData({ ...formData, stops: newStops })
  }

  const addStop = () => {
    setFormData({
      ...formData,
      stops: [...formData.stops, { stopName: '', timing: '', fare: '' }]
    })
  }

  const removeStop = (index) => {
    const newStops = formData.stops.filter((_, i) => i !== index)
    setFormData({ ...formData, stops: newStops })
  }

  const handleCreate = () => {
    setEditMode(false)
    setCurrentRoute(null)
    setFormData({
      routeName: '',
      routeNumber: '',
      vehicleNumber: '',
      driverName: '',
      driverPhone: '',
      capacity: '',
      stops: [{ stopName: '', timing: '', fare: '' }]
    })
    setShowModal(true)
  }

  const handleEdit = (route) => {
    setEditMode(true)
    setCurrentRoute(route)
    setFormData({
      routeName: route.routeName,
      routeNumber: route.routeNumber,
      vehicleNumber: route.vehicleNumber,
      driverName: route.driverName,
      driverPhone: route.driverPhone,
      capacity: route.capacity,
      stops: route.stops.length > 0 ? route.stops : [{ stopName: '', timing: '', fare: '' }]
    })
    setShowModal(true)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editMode) {
        await axios.put(
          `http://localhost:5000/api/transport/${currentRoute._id}`,
          formData,
          config
        )
        toast.success('Route updated successfully')
      } else {
        await axios.post('http://localhost:5000/api/transport', formData, config)
        toast.success('Route created successfully')
      }
      setShowModal(false)
      fetchRoutes()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save route')
    }
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete route ${name}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/transport/${id}`, config)
        toast.success('Route deleted successfully')
        fetchRoutes()
      } catch (error) {
        toast.error('Failed to delete route')
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Transport Management</h1>
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 w-9 h-9 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{user?.name?.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Bus Routes ({routes.length})</h3>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
            >
              <MdAdd size={20} />
              Add Route
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading routes...</div>
          ) : routes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <MdDirectionsBus size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-400">No transport routes found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {routes.map((route) => (
                <div key={route._id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <MdDirectionsBus className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{route.routeName}</h4>
                        <p className="text-sm text-gray-500">{route.routeNumber}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      route.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {route.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Vehicle:</span>
                      <span className="font-medium text-gray-800">{route.vehicleNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Driver:</span>
                      <span className="font-medium text-gray-800">{route.driverName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium text-gray-800">{route.driverPhone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Capacity:</span>
                      <span className="font-medium text-gray-800">{route.capacity} seats</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Assigned:</span>
                      <span className="font-medium text-blue-600">
                        {route.studentsAssigned?.length || 0} students
                      </span>
                    </div>
                  </div>

                  {route.stops && route.stops.length > 0 && (
                    <div className="mb-4 pt-4 border-t">
                      <p className="text-xs font-medium text-gray-500 mb-2">STOPS ({route.stops.length})</p>
                      <div className="space-y-1">
                        {route.stops.slice(0, 3).map((stop, idx) => (
                          <div key={idx} className="text-xs text-gray-600 flex justify-between">
                            <span>{stop.stopName}</span>
                            <span className="text-gray-400">{stop.timing}</span>
                          </div>
                        ))}
                        {route.stops.length > 3 && (
                          <p className="text-xs text-blue-600">+{route.stops.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(route)}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-100 transition flex items-center justify-center gap-1"
                    >
                      <MdEdit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(route._id, route.routeName)}
                      className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-medium hover:bg-red-100 transition flex items-center justify-center gap-1"
                    >
                      <MdDelete size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {editMode ? 'Edit Route' : 'Add New Route'}
              </h3>

              <form onSubmit={onSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Route Name *</label>
                    <input
                      type="text"
                      name="routeName"
                      value={formData.routeName}
                      onChange={onChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., North Zone"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Route Number *</label>
                    <input
                      type="text"
                      name="routeNumber"
                      value={formData.routeNumber}
                      onChange={onChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., R-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number *</label>
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={onChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., DL-01-AB-1234"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacity *</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={onChange}
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Driver Name *</label>
                    <input
                      type="text"
                      name="driverName"
                      value={formData.driverName}
                      onChange={onChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Driver name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Driver Phone *</label>
                    <input
                      type="tel"
                      name="driverPhone"
                      value={formData.driverPhone}
                      onChange={onChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+91 1234567890"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Stops</label>
                    <button
                      type="button"
                      onClick={addStop}
                      className="text-blue-600 text-sm font-medium hover:underline"
                    >
                      + Add Stop
                    </button>
                  </div>
                  {formData.stops.map((stop, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                      <input
                        type="text"
                        value={stop.stopName}
                        onChange={(e) => onStopChange(index, 'stopName', e.target.value)}
                        placeholder="Stop name"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={stop.timing}
                        onChange={(e) => onStopChange(index, 'timing', e.target.value)}
                        placeholder="Time (e.g., 7:30 AM)"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={stop.fare}
                          onChange={(e) => onStopChange(index, 'fare', e.target.value)}
                          placeholder="Fare (₹)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formData.stops.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStop(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <MdDelete size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    {editMode ? 'Update Route' : 'Create Route'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransportManagement