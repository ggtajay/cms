import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import {
  MdSchedule,
  MdLocationOn,
  MdAccessTime,
  MdBook,
  MdRefresh,
  MdCalendarToday,
} from 'react-icons/md'

// Day order for sorting
const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Color palette — each subject gets a consistent hue
const PALETTE = [
  'from-blue-500 to-blue-600',
  'from-violet-500 to-violet-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-cyan-500 to-cyan-600',
  'from-indigo-500 to-indigo-600',
  'from-pink-500 to-pink-600',
]

const subjectColor = (() => {
  const map = {}
  let idx = 0
  return (subject) => {
    if (!map[subject]) {
      map[subject] = PALETTE[idx % PALETTE.length]
      idx++
    }
    return map[subject]
  }
})()

const MyTimetable = () => {
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('week') // 'week' | 'list'

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  const fetchTimetable = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const res = await axios.get('/api/timetable', config)
      setSlots(res.data)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load timetable'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchTimetable()
  }, [fetchTimetable])

  // Group by day (sorted)
  const byDay = DAY_ORDER.reduce((acc, day) => {
    const daySlots = slots
      .filter((s) => s.day === day)
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
    if (daySlots.length > 0) acc[day] = daySlots
    return acc
  }, {})

  const todaySlots = byDay[today] || []

  // Summary stats
  const uniqueSubjects = [...new Set(slots.map((s) => s.subject))]
  const totalClasses = slots.length
  const activeDays = Object.keys(byDay).length

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-slate-800">My Timetable</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  view === 'week'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Week View
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  view === 'list'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                List View
              </button>
            </div>
            <button
              onClick={fetchTimetable}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              title="Refresh"
            >
              <MdRefresh size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">

          {/* Error state */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={fetchTimetable}
                className="text-sm text-red-600 font-semibold hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-slate-100" />
                ))}
              </div>
              {[1, 2].map((i) => (
                <div key={i} className="h-36 bg-white rounded-2xl animate-pulse border border-slate-100" />
              ))}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Total Slots/Week',
                    value: totalClasses,
                    icon: <MdCalendarToday size={20} />,
                    bg: 'bg-blue-50',
                    icon_color: 'text-blue-600',
                  },
                  {
                    label: 'Active Days',
                    value: activeDays,
                    icon: <MdSchedule size={20} />,
                    bg: 'bg-violet-50',
                    icon_color: 'text-violet-600',
                  },
                  {
                    label: 'Subjects',
                    value: uniqueSubjects.length,
                    icon: <MdBook size={20} />,
                    bg: 'bg-emerald-50',
                    icon_color: 'text-emerald-600',
                  },
                ].map((s) => (
                  <div key={s.label} className={`${s.bg} rounded-2xl border border-slate-100 p-5`}>
                    <div className={`${s.icon_color} mb-2`}>{s.icon}</div>
                    <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {slots.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MdSchedule size={36} className="text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">
                    No Timetable Assigned Yet
                  </h3>
                  <p className="text-sm text-slate-400 max-w-sm mx-auto">
                    Your timetable has not been set up by the admin. Please contact
                    your Academic Coordinator or Admin.
                  </p>
                </div>
              )}

              {/* Today's Banner */}
              {slots.length > 0 && (
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-violet-700 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <MdCalendarToday size={16} className="opacity-80" />
                    <span className="text-sm font-semibold opacity-80">Today — {today}</span>
                  </div>
                  {todaySlots.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {todaySlots.map((slot) => (
                        <div
                          key={slot._id}
                          className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                        >
                          <p className="font-bold text-base">{slot.subject}</p>
                          <p className="text-xs opacity-80 mt-0.5">
                            {slot.course} Sem {slot.semester}
                            {slot.section ? ` · ${slot.section}` : ''}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs opacity-80">
                            <span className="flex items-center gap-1">
                              <MdAccessTime size={12} /> {slot.timeSlot}
                            </span>
                            {slot.room && (
                              <span className="flex items-center gap-1">
                                <MdLocationOn size={12} /> {slot.room}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/70 text-sm">
                      No classes scheduled for today — enjoy your free day! 🎉
                    </p>
                  )}
                </div>
              )}

              {/* Week View */}
              {slots.length > 0 && view === 'week' && (
                <div className="space-y-4">
                  {DAY_ORDER.map((day) => {
                    const daySlots = byDay[day]
                    if (!daySlots) return null
                    const isToday = day === today
                    return (
                      <div
                        key={day}
                        className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
                          isToday ? 'border-blue-300' : 'border-slate-100'
                        }`}
                      >
                        <div
                          className={`px-5 py-3 flex items-center gap-3 ${
                            isToday ? 'bg-blue-50' : 'bg-slate-50'
                          }`}
                        >
                          <span
                            className={`font-bold text-sm ${
                              isToday ? 'text-blue-700' : 'text-slate-700'
                            }`}
                          >
                            {day}
                          </span>
                          {isToday && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                              Today
                            </span>
                          )}
                          <span className="ml-auto text-xs text-slate-400">
                            {daySlots.length} class{daySlots.length !== 1 ? 'es' : ''}
                          </span>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {daySlots.map((slot) => (
                            <div
                              key={slot._id}
                              className={`bg-gradient-to-r ${subjectColor(slot.subject)} text-white rounded-xl p-4 shadow-sm`}
                            >
                              <p className="font-bold text-sm">{slot.subject}</p>
                              <p className="text-xs opacity-80 mt-0.5">
                                {slot.course} Sem {slot.semester}
                                {slot.section ? ` · ${slot.section}` : ''}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs opacity-80">
                                <MdAccessTime size={12} /> {slot.timeSlot}
                              </div>
                              {slot.room && (
                                <div className="flex items-center gap-1 mt-0.5 text-xs opacity-80">
                                  <MdLocationOn size={12} /> {slot.room}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* List View */}
              {slots.length > 0 && view === 'list' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                        <th className="text-left px-5 py-3 font-semibold">Day</th>
                        <th className="text-left px-5 py-3 font-semibold">Time</th>
                        <th className="text-left px-5 py-3 font-semibold">Subject</th>
                        <th className="text-left px-5 py-3 font-semibold">Class</th>
                        <th className="text-left px-5 py-3 font-semibold">Room</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[...slots]
                        .sort(
                          (a, b) =>
                            DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) ||
                            a.timeSlot.localeCompare(b.timeSlot)
                        )
                        .map((slot) => {
                          const isToday = slot.day === today
                          return (
                            <tr
                              key={slot._id}
                              className={`transition-colors ${
                                isToday ? 'bg-blue-50/40' : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-semibold text-sm ${
                                      isToday ? 'text-blue-700' : 'text-slate-700'
                                    }`}
                                  >
                                    {slot.day}
                                  </span>
                                  {isToday && (
                                    <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-medium">
                                      Today
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                  {slot.timeSlot}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${subjectColor(slot.subject)} flex-shrink-0`}
                                  />
                                  <span className="font-semibold text-slate-800">{slot.subject}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-slate-600 text-xs">
                                {slot.course} Sem {slot.semester}
                                {slot.section ? ` · ${slot.section}` : ''}
                              </td>
                              <td className="px-5 py-3.5 text-slate-500 text-xs">
                                {slot.room || '—'}
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default MyTimetable