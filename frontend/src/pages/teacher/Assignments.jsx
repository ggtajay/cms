/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdAssignment, MdAdd, MdDelete, MdVisibility, MdSearch, MdFilterList } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

const statusBadge = (isOverdue) =>
  isOverdue
    ? 'bg-red-100 text-red-700'
    : 'bg-emerald-100 text-emerald-700'

const Assignments = () => {
  const [assignments, setAssignments] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | active | overdue
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()

  const config = { headers: { Authorization: `Bearer ${token}` } }

  const fetchAssignments = async () => {
    try {
      const res = await axios.get('/api/assignments', config)
      setAssignments(res.data)
      setFiltered(res.data)
    } catch {
      toast.error('Failed to fetch assignments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, [])

  useEffect(() => {
    let result = assignments
    const now = new Date()

    if (filter === 'active') result = result.filter((a) => new Date(a.dueDate) >= now)
    if (filter === 'overdue') result = result.filter((a) => new Date(a.dueDate) < now)

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subject?.toLowerCase().includes(q) ||
          a.course?.toLowerCase().includes(q)
      )
    }

    setFiltered(result)
  }, [search, filter, assignments])

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete assignment "${title}"? This cannot be undone.`)) return
    try {
      await axios.delete(`/api/assignments/${id}`, config)
      toast.success('Assignment deleted')
      fetchAssignments()
    } catch {
      toast.error('Failed to delete assignment')
    }
  }

  const totalSubmissions = assignments.reduce((acc, a) => acc + (a.submissions?.length || 0), 0)
  const pendingGrading = assignments.reduce(
    (acc, a) => acc + (a.submissions || []).filter((s) => s.status !== 'graded').length,
    0
  )

  const FilterBtn = ({ value, label }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
        filter === value
          ? 'bg-blue-600 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-slate-800">My Assignments</h1>
            <p className="text-xs text-slate-400 mt-0.5">{assignments.length} total assignments</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/teacher/assignments/create')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <MdAdd size={18} /> Create Assignment
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">

          {/* Summary Row */}
          {!loading && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total', value: assignments.length, color: 'text-slate-800', bg: 'bg-white' },
                { label: 'Active', value: assignments.filter((a) => new Date(a.dueDate) >= new Date()).length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Overdue', value: assignments.filter((a) => new Date(a.dueDate) < new Date()).length, color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Pending Grading', value: pendingGrading, color: 'text-amber-600', bg: 'bg-amber-50' },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-xl border border-slate-100 p-4 shadow-sm`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Search & Filter */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, subject, course…"
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            <div className="flex items-center gap-2">
              <MdFilterList size={16} className="text-slate-400" />
              <FilterBtn value="all" label="All" />
              <FilterBtn value="active" label="Active" />
              <FilterBtn value="overdue" label="Overdue" />
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdAssignment size={28} className="text-slate-300" />
              </div>
              <p className="text-slate-600 font-medium">
                {search || filter !== 'all' ? 'No matching assignments' : 'No assignments yet'}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {search || filter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first assignment to get started'}
              </p>
              {!search && filter === 'all' && (
                <button
                  onClick={() => navigate('/teacher/assignments/create')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  + Create Assignment
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((assignment) => {
                const totalSubs = assignment.submissions?.length || 0
                const graded = assignment.submissions?.filter((s) => s.status === 'graded').length || 0
                const isOverdue = new Date(assignment.dueDate) < new Date()
                const gradedPct = totalSubs > 0 ? Math.round((graded / totalSubs) * 100) : 0

                return (
                  <div
                    key={assignment._id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                  >
                    {/* Card Header */}
                    <div className="p-5 pb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MdAssignment size={20} className="text-violet-600" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge(isOverdue)}`}>
                            {isOverdue ? 'Overdue' : 'Active'}
                          </span>
                          <button
                            onClick={() => handleDelete(assignment._id, assignment.title)}
                            className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Delete assignment"
                          >
                            <MdDelete size={18} />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-800 line-clamp-2 leading-snug">
                        {assignment.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{assignment.description}</p>
                    </div>

                    {/* Meta */}
                    <div className="px-5 py-3 mt-2 grid grid-cols-2 gap-y-1.5 border-t border-slate-50">
                      {[
                        { label: 'Subject', value: assignment.subject },
                        { label: 'Class', value: `${assignment.course} · Sem ${assignment.semester}` },
                        { label: 'Due', value: new Date(assignment.dueDate).toLocaleDateString(), red: isOverdue },
                        { label: 'Max Marks', value: assignment.totalMarks },
                      ].map((m) => (
                        <div key={m.label}>
                          <p className="text-xs text-slate-400">{m.label}</p>
                          <p className={`text-xs font-semibold ${m.red ? 'text-red-600' : 'text-slate-700'}`}>
                            {m.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Submissions */}
                    <div className="px-5 pb-4 mt-auto">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Grading Progress</span>
                        <span className="font-semibold text-slate-700">{graded}/{totalSubs}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${gradedPct}%` }}
                        />
                      </div>
                      <button
                        onClick={() => navigate(`/teacher/assignments/view/${assignment._id}`)}
                        className="w-full mt-3 flex items-center justify-center gap-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-200 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
                      >
                        <MdVisibility size={16} />
                        View Submissions ({totalSubs})
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Assignments