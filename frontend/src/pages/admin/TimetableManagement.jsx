/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdSearch,
  MdFilterList,
  MdSchedule,
  MdClose,
  MdRefresh,
  MdPeople,
  MdLocationOn,
  MdAccessTime,
} from 'react-icons/md'

// ─── Constants ───────────────────────────────────────────────────────────────

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const EMPTY_FORM = {
  teacher: '',
  subject: '',
  course: '',
  semester: 1,
  section: 'A',
  room: '',
  day: 'Monday',
  timeSlot: '9:00-10:00',
}

// ─── Slot Card ────────────────────────────────────────────────────────────────

const SlotCard = ({ slot, onEdit, onDelete }) => {
  const isOverride = false
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 group">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
          {slot.timeSlot}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(slot)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Edit"
          >
            <MdEdit size={15} />
          </button>
          <button
            onClick={() => onDelete(slot)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
            title="Delete"
          >
            <MdDelete size={15} />
          </button>
        </div>
      </div>

      <p className="font-bold text-slate-800 text-sm leading-snug">{slot.subject}</p>
      <p className="text-xs text-slate-500 mt-0.5">
        {slot.course} Sem {slot.semester}
        {slot.section ? ` · ${slot.section}` : ''}
      </p>

      <div className="mt-2 pt-2 border-t border-slate-50 flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-violet-400 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{slot.teacher?.name?.charAt(0)}</span>
        </div>
        <span className="text-xs text-slate-600 font-medium truncate">{slot.teacher?.name}</span>
      </div>
      {slot.room && (
        <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
          <MdLocationOn size={11} /> {slot.room}
        </div>
      )}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const TimetableModal = ({ mode, form, onChange, onClose, onSave, saving, teachers, meta }) => {
  const title = mode === 'create' ? 'Add Timetable Slot' : 'Edit Timetable Slot'

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Fill in all required fields *</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <MdClose size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Teacher */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Teacher *
            </label>
            <select
              name="teacher"
              value={form.teacher}
              onChange={onChange}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">Select a teacher…</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={onChange}
              placeholder="e.g. Data Structures"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Course + Semester + Section */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Course *
              </label>
              <input
                type="text"
                name="course"
                value={form.course}
                onChange={onChange}
                placeholder="BTech"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Sem *
              </label>
              <select
                name="semester"
                value={form.semester}
                onChange={onChange}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Section
              </label>
              <input
                type="text"
                name="section"
                value={form.section}
                onChange={onChange}
                placeholder="A"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* Day + Time Slot */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Day *
              </label>
              <select
                name="day"
                value={form.day}
                onChange={onChange}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                {(meta.days || DAY_ORDER).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Time Slot *
              </label>
              <select
                name="timeSlot"
                value={form.timeSlot}
                onChange={onChange}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                {(meta.timeSlots || []).map((ts) => (
                  <option key={ts} value={ts}>
                    {ts}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Room (optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Room / Lab (optional)
            </label>
            <input
              type="text"
              name="room"
              value={form.room}
              onChange={onChange}
              placeholder="e.g. Lab 1, Room 201"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            {saving ? (
              <><MdRefresh size={16} className="animate-spin" /> Saving…</>
            ) : (
              <><MdSchedule size={16} /> {mode === 'create' ? 'Add Slot' : 'Save Changes'}</>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdminTimetable = () => {
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')
  const config = { headers: { Authorization: `Bearer ${token}` } }

  const [slots, setSlots] = useState([])
  const [teachers, setTeachers] = useState([])
  const [meta, setMeta] = useState({ days: DAY_ORDER, timeSlots: [] })
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Filters
  const [filterTeacher, setFilterTeacher] = useState('')
  const [filterCourse, setFilterCourse] = useState('')
  const [filterSemester, setFilterSemester] = useState('')
  const [filterDay, setFilterDay] = useState('')
  const [search, setSearch] = useState('')

  // ── Data Fetching ──────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterTeacher) params.set('teacher', filterTeacher)
      if (filterCourse) params.set('course', filterCourse)
      if (filterSemester) params.set('semester', filterSemester)
      if (filterDay) params.set('day', filterDay)

      const [slotsRes, teachersRes, metaRes] = await Promise.all([
        axios.get(`/api/timetable?${params}`, config),
        axios.get('/api/auth/teachers', config),
        axios.get('/api/timetable/meta', config),
      ])

      setSlots(slotsRes.data)
      setTeachers(teachersRes.data)
      setMeta(metaRes.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load timetable data')
    } finally {
      setLoading(false)
    }
  }, [filterTeacher, filterCourse, filterSemester, filterDay])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // ── Form Handling ──────────────────────────────────────────────────────────

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, day: meta.days?.[0] || 'Monday', timeSlot: meta.timeSlots?.[0] || '9:00-10:00' })
    setModalMode('create')
    setEditTarget(null)
    setShowModal(true)
  }

  const openEdit = (slot) => {
    setForm({
      teacher: slot.teacher?._id || slot.teacher,
      subject: slot.subject,
      course: slot.course,
      semester: slot.semester,
      section: slot.section || 'A',
      room: slot.room || '',
      day: slot.day,
      timeSlot: slot.timeSlot,
    })
    setModalMode('edit')
    setEditTarget(slot)
    setShowModal(true)
  }

  const onFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const saveSlot = async () => {
    if (!form.teacher || !form.subject || !form.course || !form.day || !form.timeSlot) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      if (modalMode === 'create') {
        await axios.post('/api/timetable', form, config)
        toast.success('Timetable slot added!')
      } else {
        await axios.put(`/api/timetable/${editTarget._id}`, form, config)
        toast.success('Slot updated!')
      }
      setShowModal(false)
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save slot')
    } finally {
      setSaving(false)
    }
  }

  const deleteSlot = async (slot) => {
    if (
      !window.confirm(
        `Delete slot: ${slot.subject} on ${slot.day} at ${slot.timeSlot}?`
      )
    )
      return
    try {
      await axios.delete(`/api/timetable/${slot._id}`, config)
      toast.success('Slot deleted')
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  // ── Derived State ──────────────────────────────────────────────────────────

  const filtered = slots.filter((s) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      s.subject?.toLowerCase().includes(q) ||
      s.course?.toLowerCase().includes(q) ||
      s.teacher?.name?.toLowerCase().includes(q)
    )
  })

  // Group by day
  const byDay = DAY_ORDER.reduce((acc, day) => {
    const daySlots = filtered.filter((s) => s.day === day)
    if (daySlots.length > 0) acc[day] = daySlots.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
    return acc
  }, {})

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Timetable Management</h1>
            <p className="text-xs text-slate-400 mt-0.5">{slots.length} total slots across all teachers</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAll}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              title="Refresh"
            >
              <MdRefresh size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <MdAdd size={18} /> Add Slot
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">

          {/* Summary Stats */}
          {!loading && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Slots', value: slots.length, color: 'text-slate-800', bg: 'bg-white' },
                { label: 'Teachers Scheduled', value: [...new Set(slots.map((s) => s.teacher?._id))].length, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Active Days', value: Object.keys(byDay).length, color: 'text-violet-600', bg: 'bg-violet-50' },
                { label: 'Unique Subjects', value: [...new Set(slots.map((s) => s.subject))].length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-2xl border border-slate-100 p-4 shadow-sm`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <MdFilterList size={16} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filters</span>
              {(filterTeacher || filterCourse || filterSemester || filterDay || search) && (
                <button
                  onClick={() => {
                    setFilterTeacher('')
                    setFilterCourse('')
                    setFilterSemester('')
                    setFilterDay('')
                    setSearch('')
                  }}
                  className="ml-auto text-xs text-blue-600 font-semibold hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative lg:col-span-2">
                <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search subject, course, teacher…"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <select
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">All Teachers</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Sem {s}
                  </option>
                ))}
              </select>
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">All Days</option>
                {DAY_ORDER.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-slate-100" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filtered.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdSchedule size={36} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">No Timetable Slots Yet</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto mb-5">
                {search ? 'No slots match your search.' : 'Start adding timetable slots for teachers and classes.'}
              </p>
              {!search && (
                <button
                  onClick={openCreate}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  + Add First Slot
                </button>
              )}
            </div>
          )}

          {/* Timetable Grid by Day */}
          {!loading && filtered.length > 0 && (
            <div className="space-y-5">
              {DAY_ORDER.map((day) => {
                const daySlots = byDay[day]
                if (!daySlots) return null
                const isToday = day === today
                return (
                  <div key={day} className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${isToday ? 'border-blue-300' : 'border-slate-100'}`}>
                    <div className={`px-5 py-3.5 flex items-center gap-3 border-b ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                      <span className={`font-bold text-sm ${isToday ? 'text-blue-700' : 'text-slate-700'}`}>{day}</span>
                      {isToday && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                          Today
                        </span>
                      )}
                      <span className="ml-auto text-xs text-slate-400">
                        {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {daySlots.map((slot) => (
                        <SlotCard
                          key={slot._id}
                          slot={slot}
                          onEdit={openEdit}
                          onDelete={deleteSlot}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <TimetableModal
          mode={modalMode}
          form={form}
          onChange={onFormChange}
          onClose={() => setShowModal(false)}
          onSave={saveSlot}
          saving={saving}
          teachers={teachers}
          meta={meta}
        />
      )}
    </div>
  )
}

export default AdminTimetable
