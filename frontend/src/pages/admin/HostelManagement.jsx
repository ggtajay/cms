import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdHotel, MdAdd, MdEdit, MdDelete, MdMeetingRoom } from 'react-icons/md'

const HostelManagement = () => {
  const [hostels, setHostels] = useState([])
  const [showHostelModal, setShowHostelModal] = useState(false)
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [selectedHostel, setSelectedHostel] = useState(null)
  const [hostelForm, setHostelForm] = useState({
    hostelName: '',
    hostelType: 'boys',
    totalRooms: '',
    wardenName: '',
    wardenPhone: '',
    address: '',
    facilities: '',
    feePerMonth: ''
  })
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    floor: '',
    capacity: '',
    roomType: 'double',
    facilities: ''
  })
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  const fetchHostels = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/hostels', config)
      setHostels(res.data)
    } catch (error) {
      toast.error('Failed to fetch hostels')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHostels()
  }, [])

  const onHostelChange = (e) => {
    setHostelForm({ ...hostelForm, [e.target.name]: e.target.value })
  }

  const onRoomChange = (e) => {
    setRoomForm({ ...roomForm, [e.target.name]: e.target.value })
  }

  const handleCreateHostel = async (e) => {
    e.preventDefault()
    try {
      const facilitiesArray = hostelForm.facilities.split(',').map(f => f.trim()).filter(f => f)
      await axios.post('http://localhost:5000/api/hostels', {
        ...hostelForm,
        facilities: facilitiesArray
      }, config)
      toast.success('Hostel created successfully')
      setShowHostelModal(false)
      setHostelForm({
        hostelName: '',
        hostelType: 'boys',
        totalRooms: '',
        wardenName: '',
        wardenPhone: '',
        address: '',
        facilities: '',
        feePerMonth: ''
      })
      fetchHostels()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create hostel')
    }
  }

  const handleAddRoom = async (e) => {
    e.preventDefault()
    try {
      const facilitiesArray = roomForm.facilities.split(',').map(f => f.trim()).filter(f => f)
      await axios.post(
        `http://localhost:5000/api/hostels/${selectedHostel._id}/rooms`,
        { ...roomForm, facilities: facilitiesArray },
        config
      )
      toast.success('Room added successfully')
      setShowRoomModal(false)
      setRoomForm({
        roomNumber: '',
        floor: '',
        capacity: '',
        roomType: 'double',
        facilities: ''
      })
      fetchHostels()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add room')
    }
  }

  const handleDeleteHostel = async (id, name) => {
    if (window.confirm(`Delete hostel ${name}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/hostels/${id}`, config)
        toast.success('Hostel deleted successfully')
        fetchHostels()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete hostel')
      }
    }
  }

  const handleDeleteRoom = async (hostelId, roomId, roomNumber) => {
    if (window.confirm(`Delete room ${roomNumber}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/hostels/${hostelId}/rooms/${roomId}`, config)
        toast.success('Room deleted successfully')
        fetchHostels()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete room')
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Hostel Management</h1>
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
            <h3 className="font-bold text-gray-800">Hostels ({hostels.length})</h3>
            <button
              onClick={() => setShowHostelModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
            >
              <MdAdd size={20} />
              Add Hostel
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading hostels...</div>
          ) : hostels.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <MdHotel size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-400">No hostels found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {hostels.map((hostel) => (
                <div key={hostel._id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-4 rounded-lg">
                        <MdHotel className="text-blue-600" size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{hostel.hostelName}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            hostel.hostelType === 'boys' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                          }`}>
                            {hostel.hostelType === 'boys' ? "Boys' Hostel" : "Girls' Hostel"}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            hostel.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {hostel.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteHostel(hostel._id, hostel.hostelName)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <MdDelete size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Warden</p>
                      <p className="font-medium text-gray-800">{hostel.wardenName}</p>
                      <p className="text-xs text-gray-500">{hostel.wardenPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Rooms</p>
                      <p className="font-medium text-gray-800">{hostel.totalRooms}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Rooms Created</p>
                      <p className="font-medium text-blue-600">{hostel.rooms?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fee/Month</p>
                      <p className="font-medium text-green-600">₹{hostel.feePerMonth}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-gray-800">Rooms ({hostel.rooms?.length || 0})</h4>
                      <button
                        onClick={() => {
                          setSelectedHostel(hostel)
                          setShowRoomModal(true)
                        }}
                        className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
                      >
                        <MdAdd size={16} />
                        Add Room
                      </button>
                    </div>

                    {hostel.rooms && hostel.rooms.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {hostel.rooms.map((room) => (
                          <div key={room._id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-bold text-gray-800">Room {room.roomNumber}</p>
                                <p className="text-xs text-gray-500">Floor {room.floor}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteRoom(hostel._id, room._id, room.roomNumber)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <MdDelete size={16} />
                              </button>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Type:</span>
                                <span className="font-medium capitalize">{room.roomType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Capacity:</span>
                                <span className="font-medium">{room.capacity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Occupied:</span>
                                <span className={`font-medium ${
                                  room.studentsAssigned?.length >= room.capacity ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {room.studentsAssigned?.length || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm text-center py-4">No rooms added yet</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hostel Modal */}
      {showHostelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Add New Hostel</h3>
              <form onSubmit={handleCreateHostel}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hostel Name *</label>
                    <input
                      type="text"
                      name="hostelName"
                      value={hostelForm.hostelName}
                      onChange={onHostelChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hostel Type *</label>
                    <select
                      name="hostelType"
                      value={hostelForm.hostelType}
                      onChange={onHostelChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="boys">Boys</option>
                      <option value="girls">Girls</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Rooms *</label>
                    <input
                      type="number"
                      name="totalRooms"
                      value={hostelForm.totalRooms}
                      onChange={onHostelChange}
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fee/Month (₹) *</label>
                    <input
                      type="number"
                      name="feePerMonth"
                      value={hostelForm.feePerMonth}
                      onChange={onHostelChange}
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Warden Name *</label>
                    <input
                      type="text"
                      name="wardenName"
                      value={hostelForm.wardenName}
                      onChange={onHostelChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Warden Phone *</label>
                    <input
                      type="tel"
                      name="wardenPhone"
                      value={hostelForm.wardenPhone}
                      onChange={onHostelChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <textarea
                      name="address"
                      value={hostelForm.address}
                      onChange={onHostelChange}
                      required
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facilities (comma-separated)</label>
                    <input
                      type="text"
                      name="facilities"
                      value={hostelForm.facilities}
                      onChange={onHostelChange}
                      placeholder="WiFi, Gym, Mess, Library"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Create Hostel
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowHostelModal(false)}
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

      {/* Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Add Room to {selectedHostel?.hostelName}</h3>
              <form onSubmit={handleAddRoom}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room Number *</label>
                    <input
                      type="text"
                      name="roomNumber"
                      value={roomForm.roomNumber}
                      onChange={onRoomChange}
                      required
                      placeholder="101"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Floor *</label>
                    <input
                      type="number"
                      name="floor"
                      value={roomForm.floor}
                      onChange={onRoomChange}
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room Type *</label>
                    <select
                      name="roomType"
                      value={roomForm.roomType}
                      onChange={onRoomChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="triple">Triple</option>
                      <option value="quadruple">Quadruple</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacity *</label>
                    <input
                      type="number"
                      name="capacity"
                      value={roomForm.capacity}
                      onChange={onRoomChange}
                      required
                      min="1"
                      max="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facilities (comma-separated)</label>
                    <input
                      type="text"
                      name="facilities"
                      value={roomForm.facilities}
                      onChange={onRoomChange}
                      placeholder="AC, Attached Bath, Balcony"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Add Room
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRoomModal(false)}
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

export default HostelManagement