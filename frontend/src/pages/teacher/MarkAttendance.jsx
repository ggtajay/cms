import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import {
  MdCalendarToday,
  MdCheckCircle,
  MdCancel,
  MdAccessTime,
  MdPeople,
  MdRefresh,
} from 'react-icons/md'

const StatusBtn = ({ active, color, onClick, label }) => {
  const variants = {
    present: active
      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
      : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600',
    absent: active
      ? 'bg-red-500 text-white shadow-sm shadow-red-200'
      : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600',
    late: active
      ? 'bg-amber-500 text-white shadow-sm shadow-amber-200'
      : 'bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-600',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${variants[color]}`}
    >
      {label}
    </button>
  )
}

const MarkAttendance = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fetched, setFetched] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    subject: '',
    course: '',
    semester: 1,
    section: 'A',
  })
  const [attendance, setAttendance] = useState({})
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const config = { headers: { Authorization: `Bearer ${token}` } }

  const fetchStudents = async () => {
    if (!formData.course || !formData.semester) {
      toast.error('Please fill in course and semester first')
      return
    }
    setLoading(true)
    setFetched(false)
    try {
      const res = await axios.get('/api/students', config)
      const filtered = res.data.filter(
        (s) =>
          s.course === formData.course &&
          s.semester === parseInt(formData.semester) &&
          s.section === formData.section &&
          s.admissionStatus === 'active'
      )
      setStudents(filtered)
      const init = {}
      filtered.forEach((s) => { init[s._id] = 'present' })
      setAttendance(init)
      setFetched(true)
      if (filtered.length === 0) toast.error('No active students found for this class')
    } catch {
      toast.error('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Refetch when course/semester/section change (only if already fetched once)
    if (fetched) fetchStudents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.course, formData.semester, formData.section])

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
  const toggleStatus = (id, status) => setAttendance({ ...attendance, [id]: status })
  const markAllPresent = () => {
    const all = {}
    students.forEach((s) => { all[s._id] = 'present' })
    setAttendance(all)
    toast.success('All marked as Present')
  }
  const markAllAbsent = () => {
    const all = {}
    students.forEach((s) => { all[s._id] = 'absent' })
    setAttendance(all)
    toast('All marked as Absent', { icon: '⚠️' })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!formData.subject.trim()) {
      toast.error('Please enter subject name')
      return
    }
    if (students.length === 0) {
      toast.error('No students to submit attendance for')
      return
    }
    setSaving(true)
    try {
      await axios.post(
        '/api/attendance/mark',
        {
          date: formData.date,
          subject: formData.subject,
          course: formData.course,
          semester: parseInt(formData.semester),
          section: formData.section,
          students: students.map((s) => ({ studentId: s._id, status: attendance[s._id] })),
        },
        config
      )
      toast.success('Attendance submitted successfully!')
      setFormData({
        date: new Date().toISOString().split('T')[0],
        subject: '',
        course: '',
        semester: 1,
        section: 'A',
      })
      setStudents([])
      setAttendance({})
      setFetched(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit attendance')
    } finally {
      setSaving(false)
    }
  }

  const presentCount = Object.values(attendance).filter((s) => s === 'present').length
  const absentCount = Object.values(attendance).filter((s) => s === 'absent').length
  const lateCount = Object.values(attendance).filter((s) => s === 'late').length
  const total = students.length
  const pct = total > 0 ? Math.round((presentCount / total) * 100) : 0

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Mark Attendance</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <form onSubmit={onSubmit}>
            {/* Class Selection Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MdCalendarToday size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Class Details</h2>
                  <p className="text-xs text-slate-400">Select class info to load students</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={onChange}
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Semester *
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={onChange}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                    placeholder="e.g. Mathematics"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={fetchStudents}
                disabled={loading}
                className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <MdRefresh size={18} className="animate-spin" /> Loading Students…
                  </>
                ) : (
                  <>
                    <MdPeople size={18} /> Load Students
                  </>
                )}
              </button>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            )}

            {/* Students List */}
            {!loading && students.length > 0 && (
              <>
                {/* Live Stats Bar */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Total', value: total, icon: <MdPeople size={18} />, style: 'bg-slate-700 text-white' },
                    { label: 'Present', value: presentCount, icon: <MdCheckCircle size={18} />, style: 'bg-emerald-500 text-white' },
                    { label: 'Absent', value: absentCount, icon: <MdCancel size={18} />, style: 'bg-red-500 text-white' },
                    { label: 'Late', value: lateCount, icon: <MdAccessTime size={18} />, style: 'bg-amber-500 text-white' },
                  ].map((s) => (
                    <div key={s.label} className={`${s.style} rounded-xl p-3 flex items-center gap-2 shadow-sm`}>
                      {s.icon}
                      <div>
                        <p className="text-lg font-bold leading-none">{s.value}</p>
                        <p className="text-xs opacity-80">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-xl border border-slate-100 p-4 mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Attendance Rate</span>
                    <span className="font-bold text-slate-700">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-bold text-slate-800 text-sm">
                      Students — {formData.course} Sem {formData.semester}, Section {formData.section}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={markAllPresent}
                        className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition"
                      >
                        All Present
                      </button>
                      <button
                        type="button"
                        onClick={markAllAbsent}
                        className="text-xs bg-red-50 text-red-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
                      >
                        All Absent
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                          <th className="text-left px-5 py-3 font-semibold w-10">#</th>
                          <th className="text-left px-5 py-3 font-semibold">Student</th>
                          <th className="text-left px-5 py-3 font-semibold">Roll No.</th>
                          <th className="text-center px-5 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {students.map((student, idx) => {
                          const status = attendance[student._id]
                          const rowBg =
                            status === 'absent'
                              ? 'bg-red-50/40'
                              : status === 'late'
                              ? 'bg-amber-50/40'
                              : 'hover:bg-slate-50'
                          return (
                            <tr key={student._id} className={`transition-colors ${rowBg}`}>
                              <td className="px-5 py-3.5 text-slate-400">{idx + 1}</td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-400 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs font-bold">
                                      {student.name.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-800 leading-tight">{student.name}</p>
                                    <p className="text-xs text-slate-400">{student.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                  {student.rollNumber}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center justify-center gap-1.5">
                                  <StatusBtn
                                    active={status === 'present'}
                                    color="present"
                                    onClick={() => toggleStatus(student._id, 'present')}
                                    label="Present"
                                  />
                                  <StatusBtn
                                    active={status === 'absent'}
                                    color="absent"
                                    onClick={() => toggleStatus(student._id, 'absent')}
                                    label="Absent"
                                  />
                                  <StatusBtn
                                    active={status === 'late'}
                                    color="late"
                                    onClick={() => toggleStatus(student._id, 'late')}
                                    label="Late"
                                  />
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-5 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <><MdRefresh size={18} className="animate-spin" /> Submitting…</>
                      ) : (
                        <><MdCheckCircle size={18} /> Submit Attendance ({total} students)</>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Empty state */}
            {!loading && fetched && students.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MdPeople size={28} className="text-slate-300" />
                </div>
                <p className="text-slate-600 font-medium">No active students found</p>
                <p className="text-sm text-slate-400 mt-1">
                  Try a different course, semester, or section combination
                </p>
              </div>
            )}
          </form>
        </main>
      </div>
    </div>
  )
}

export default MarkAttendance