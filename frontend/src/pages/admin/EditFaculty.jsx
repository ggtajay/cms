import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { useParams, useNavigate } from 'react-router-dom'
import { MdEdit, MdArrowBack } from 'react-icons/md'

const EditFaculty = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    address: '',
    employeeId: '',
    designation: 'Assistant Professor',
    department: '',
    qualification: '',
    specialization: '',
    experience: 0,
    subjects: '',
    salary: 0,
    employmentStatus: 'active',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/faculty/${id}`, config)
        const faculty = res.data
        setFormData({
          name: faculty.name,
          email: faculty.email,
          phone: faculty.phone,
          dateOfBirth: faculty.dateOfBirth.split('T')[0],
          gender: faculty.gender,
          address: faculty.address,
          employeeId: faculty.employeeId,
          designation: faculty.designation,
          department: faculty.department,
          qualification: faculty.qualification,
          specialization: faculty.specialization || '',
          experience: faculty.experience,
          subjects: faculty.subjects.join(', '),
          salary: faculty.salary,
          employmentStatus: faculty.employmentStatus,
          emergencyContact: faculty.emergencyContact || { name: '', phone: '', relation: '' }
        })
      } catch (error) {
        toast.error('Failed to fetch faculty details')
        navigate('/admin/faculty')
      } finally {
        setLoading(false)
      }
    }
    fetchFaculty()
  }, [id])

  const onChange = (e) => {
    if (e.target.name.startsWith('emergency_')) {
      const field = e.target.name.replace('emergency_', '')
      setFormData({
        ...formData,
        emergencyContact: {
          ...formData.emergencyContact,
          [field]: e.target.value
        }
      })
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value })
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const subjectsArray = formData.subjects
        .split(',')
        .map(s => s.trim())
        .filter(s => s)

      await axios.put(
        `http://localhost:5000/api/faculty/${id}`,
        { ...formData, subjects: subjectsArray },
        config
      )
      toast.success('Faculty updated successfully')
      setTimeout(() => {
        navigate(`/admin/faculty/view/${id}`)
      }, 1000)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update faculty')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/faculty')}
              className="text-gray-600 hover:text-gray-800"
            >
              <MdArrowBack size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Edit Faculty</h1>
          </div>
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
          <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-xl">
                <MdEdit size={28} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Update Faculty Information</h2>
                <p className="text-gray-500 text-sm">Edit faculty details and save changes</p>
              </div>
            </div>

            <form onSubmit={onSubmit}>
              {/* Personal Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={onChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={onChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={onChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Date of Birth *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={onChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={onChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Address *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={onChange}
                      required
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Employee ID *</label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={onChange}
                      required
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Employee ID cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Designation *</label>
                    <select
                      name="designation"
                      value={formData.designation}
                      onChange={onChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Lecturer">Lecturer</option>
                      <option value="HOD">HOD</option>
                      <option value="Lab Assistant">Lab Assistant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Department *</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={onChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Qualification *</label>
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={onChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Specialization</label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={onChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Experience (Years)</label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={onChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Subjects Teaching (comma-separated)</label>
                    <input
                      type="text"
                      name="subjects"
                      value={formData.subjects}
                      onChange={onChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Employment Status *</label>
                    <select
                      name="employmentStatus"
                      value={formData.employmentStatus}
                      onChange={onChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="retired">Retired</option>
                      <option value="resigned">Resigned</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/faculty/view/${id}`)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditFaculty