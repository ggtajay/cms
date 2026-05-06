/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdCalendarToday, MdSearch, MdCheckCircle, MdCancel, MdAccessTime, MdFilterList } from 'react-icons/md'

const statusStyles = {
  present: 'bg-emerald-100 text-emerald-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-amber-100 text-amber-700',
}

const AttendanceHistory = () => {
  const [attendanceData, setAttendanceData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [filters, setFilters] = useState({ date: '', subject: '', course: '', semester: '' })
  const [loading, setLoading] = useState(true)
  const [expandedKeys, setExpandedKeys] = useState(new Set())
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const config = { headers: { Authorization: `Bearer ${token}` } }

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/attendance', config)
      setAttendanceData(res.data)
      setFilteredData(res.data)
    } catch {
      toast.error('Failed to fetch attendance history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHistory() }, [])

  useEffect(() => {
    let result = attendanceData
    if (filters.date) {
      result = result.filter(
        (a) => new Date(a.date).toDateString() === new Date(filters.date).toDateString()
      )
    }
    if (filters.subject) {
      result = result.filter((a) =>
        a.subject.toLowerCase().includes(filters.subject.toLowerCase())
      )
    }
    if (filters.course) {
      result = result.filter((a) =>
        a.course.toLowerCase().includes(filters.course.toLowerCase())
      )
    }
    if (filters.semester) {
      result = result.filter((a) => a.semester === parseInt(filters.semester))
    }
    setFilteredData(result)
  }, [filters, attendanceData])

  const onFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  const clearFilters = () => setFilters({ date: '', subject: '', course: '', semester: '' })

  // Group by date + subject
  const groupedData = filteredData.reduce((acc, record) => {
    const key = `${new Date(record.date).toLocaleDateString()}-${record.subject}`
    if (!acc[key]) {
      acc[key] = {
        date: record.date,
        subject: record.subject,
        course: record.course,
        semester: record.semester,
        records: [],
      }
    }
    acc[key].records.push(record)
    return acc
  }, {})

  const groupedArray = Object.entries(groupedData)
    .map(([key, val]) => ({ key, ...val }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const toggleExpand = (key) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Attendance History</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {loading ? 'Loading…' : `${groupedArray.length} session${groupedArray.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <MdFilterList size={18} className="text-slate-500" />
              <h3 className="text-sm font-bold text-slate-700">Filter Records</h3>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto text-xs text-blue-600 font-semibold hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Date</label>
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={onFilterChange}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Subject</label>
                <div className="relative">
                  <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="subject"
                    value={filters.subject}
                    onChange={onFilterChange}
                    placeholder="Filter by subject…"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Course</label>
                <div className="relative">
                  <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="course"
                    value={filters.course}
                    onChange={onFilterChange}
                    placeholder="Filter by course…"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Semester</label>
                <select
                  name="semester"
                  value={filters.semester}
                  onChange={onFilterChange}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Records */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : groupedArray.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdCalendarToday size={28} className="text-slate-300" />
              </div>
              <p className="text-slate-600 font-medium">No attendance records found</p>
              <p className="text-sm text-slate-400 mt-1">
                {hasFilters ? 'Try adjusting your filters' : 'Start marking attendance to see history here'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedArray.map((group) => {
                const presentCount = group.records.filter((r) => r.status === 'present').length
                const absentCount = group.records.filter((r) => r.status === 'absent').length
                const lateCount = group.records.filter((r) => r.status === 'late').length
                const total = group.records.length
                const pct = total > 0 ? Math.round((presentCount / total) * 100) : 0
                const isExpanded = expandedKeys.has(group.key)

                return (
                  <div key={group.key} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Session Header */}
                    <div
                      className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => toggleExpand(group.key)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MdCalendarToday size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">{group.subject}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(group.date).toLocaleDateString('en-US', {
                              weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                            })} · {group.course} Sem {group.semester}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Mini stats */}
                        <div className="hidden sm:flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                            <MdCheckCircle size={14} /> {presentCount}
                          </span>
                          <span className="flex items-center gap-1 text-red-500 font-semibold">
                            <MdCancel size={14} /> {absentCount}
                          </span>
                          {lateCount > 0 && (
                            <span className="flex items-center gap-1 text-amber-600 font-semibold">
                              <MdAccessTime size={14} /> {lateCount}
                            </span>
                          )}
                        </div>
                        {/* Percentage */}
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            pct >= 75
                              ? 'bg-emerald-100 text-emerald-700'
                              : pct >= 50
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {pct}%
                        </div>
                        <span className="text-slate-300 text-lg">{isExpanded ? '↑' : '↓'}</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="px-5">
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Expanded students */}
                    {isExpanded && (
                      <div className="px-5 py-4 border-t border-slate-100 mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                          {group.records.map((record, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-violet-400 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs font-bold">
                                    {record.student?.name?.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-slate-800">{record.student?.name}</p>
                                  <p className="text-xs text-slate-400">{record.student?.rollNumber}</p>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyles[record.status]}`}
                              >
                                {record.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

export default AttendanceHistory