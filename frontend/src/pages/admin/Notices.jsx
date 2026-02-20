import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdNotifications, MdDelete, MdEdit, MdPushPin } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

const Notices = () => {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  const canManage = ['superadmin', 'admin'].includes(user?.role)

  const fetchNotices = async () => {
    try {
      const params = categoryFilter !== 'all' ? `?category=${categoryFilter}` : ''
      const res = await axios.get(`http://localhost:5000/api/notices${params}`, config)
      setNotices(res.data)
    } catch (error) {
      toast.error('Failed to fetch notices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotices()
  }, [categoryFilter])

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/notices/${id}`, config)
        toast.success('Notice deleted successfully')
        fetchNotices()
      } catch (error) {
        toast.error('Failed to delete notice')
      }
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-gray-100 text-gray-700',
      academic: 'bg-blue-100 text-blue-700',
      exam: 'bg-purple-100 text-purple-700',
      holiday: 'bg-green-100 text-green-700',
      event: 'bg-yellow-100 text-yellow-700',
      urgent: 'bg-red-100 text-red-700'
    }
    return colors[category] || colors.general
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Notices & Announcements</h1>
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
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="academic">Academic</option>
              <option value="exam">Exam</option>
              <option value="holiday">Holiday</option>
              <option value="event">Event</option>
              <option value="urgent">Urgent</option>
            </select>

            {canManage && (
              <button
                onClick={() => navigate('/admin/notices/create')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                + Create Notice
              </button>
            )}
          </div>

          {/* Notices List */}
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading notices...</div>
          ) : notices.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <MdNotifications size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-400">No notices found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notices.map((notice) => (
                <div
                  key={notice._id}
                  className={`bg-white rounded-xl shadow-sm p-6 ${
                    notice.isImportant ? 'border-2 border-red-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {notice.isImportant && (
                          <MdPushPin className="text-red-600" size={20} />
                        )}
                        <h3 className="text-xl font-bold text-gray-800">
                          {notice.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(notice.category)}`}>
                          {notice.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          Target: {notice.targetAudience === 'all' ? 'Everyone' : notice.targetAudience}
                        </span>
                        <span className="text-xs text-gray-500">
                          Posted: {new Date(notice.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          By: {notice.postedBy?.name}
                        </span>
                      </div>
                    </div>
                    {canManage && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(notice._id, notice.title)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <MdDelete size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 whitespace-pre-wrap">{notice.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notices