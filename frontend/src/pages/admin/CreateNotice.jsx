import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdNotifications } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

const CreateNotice = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    targetAudience: 'all',
    isImportant: false
  })
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  const onChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('http://localhost:5000/api/notices', formData, config)
      toast.success('Notice created successfully!')
      setTimeout(() => {
        navigate('/admin/notices')
      }, 1000)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create notice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Create Notice</h1>
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
          <div className="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-xl">
                <MdNotifications size={28} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">New Notice</h2>
                <p className="text-gray-500 text-sm">Create an announcement for the college</p>
              </div>
            </div>

            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notice title"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={onChange}
                  required
                  rows="8"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notice content..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="exam">Exam</option>
                    <option value="holiday">Holiday</option>
                    <option value="event">Event</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Target Audience *
                  </label>
                  <select
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">All</option>
                    <option value="students">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                    <option value="staff">Staff Only</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isImportant"
                    checked={formData.isImportant}
                    onChange={onChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Mark as Important (will appear at the top)
                  </span>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Notice'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/notices')}
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

export default CreateNotice