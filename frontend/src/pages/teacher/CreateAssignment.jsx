/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdAssignment, MdArrowBack, MdRefresh } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

const CreateAssignment = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    course: '',
    semester: 1,
    section: 'A',
    dueDate: '',
    totalMarks: '',
  })
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()

  const config = { headers: { Authorization: `Bearer ${token}` } }

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()

    // Client-side validation
    if (!formData.dueDate) { toast.error('Due date is required'); return }
    if (new Date(formData.dueDate) <= new Date()) {
      toast.error('Due date must be in the future')
      return
    }
    if (parseInt(formData.totalMarks) < 1) { toast.error('Max marks must be at least 1'); return }

    setLoading(true)
    try {
      await axios.post('/api/assignments', formData, config)
      toast.success('Assignment created successfully!')
      setTimeout(() => navigate('/teacher/assignments'), 900)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create assignment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/teacher/assignments')}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
              aria-label="Go back"
            >
              <MdArrowBack size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Create Assignment</h1>
              <p className="text-xs text-slate-400 mt-0.5">Fill in the details below</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto">
            {/* Hero Card */}
            <div className="bg-gradient-to-r from-violet-600 to-blue-600 rounded-2xl p-6 mb-6 text-white flex items-center gap-4 shadow-lg">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <MdAssignment size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold">New Assignment</h2>
                <p className="text-sm text-violet-200 mt-0.5">
                  Published assignment will be visible to matched students instantly
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">
                  Assignment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={onChange}
                      required
                      placeholder="e.g. Data Structures Assignment 1"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Instructions / Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={onChange}
                      required
                      rows={5}
                      placeholder="Enter detailed assignment instructions, requirements, and guidelines…"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={onChange}
                      required
                      placeholder="e.g. Data Structures"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Course *
                    </label>
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={onChange}
                      required
                      placeholder="e.g. BTech, BCA"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Class Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">
                  Target Class
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Semester *
                    </label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={onChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Section *
                    </label>
                    <input
                      type="text"
                      name="section"
                      value={formData.section}
                      onChange={onChange}
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Max Marks *
                    </label>
                    <input
                      type="number"
                      name="totalMarks"
                      value={formData.totalMarks}
                      onChange={onChange}
                      required
                      min={1}
                      placeholder="e.g. 100"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Due Date */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">
                  Deadline
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Due Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={onChange}
                    required
                    className="w-full sm:w-80 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-none sm:w-56 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
                >
                  {loading ? (
                    <><MdRefresh size={18} className="animate-spin" /> Creating…</>
                  ) : (
                    <><MdAssignment size={18} /> Create Assignment</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/teacher/assignments')}
                  className="px-6 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CreateAssignment