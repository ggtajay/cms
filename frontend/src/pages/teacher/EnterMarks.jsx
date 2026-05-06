import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdGrade, MdPeople, MdRefresh, MdInfo } from 'react-icons/md'

const EnterMarks = () => {
  const [students, setStudents] = useState([])
  const [filters, setFilters] = useState({
    course: '',
    semester: '',
    section: 'A',
    subject: '',
    examType: 'midterm',
  })
  const [marks, setMarks] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const config = { headers: { Authorization: `Bearer ${token}` } }

  const fetchStudents = async () => {
    if (!filters.course || !filters.semester) {
      toast.error('Please fill in course and semester')
      return
    }
    setLoading(true)
    setFetched(false)
    try {
      const res = await axios.get('/api/students', config)
      const filtered = res.data.filter(
        (s) =>
          s.course === filters.course &&
          s.semester === parseInt(filters.semester) &&
          s.section === filters.section &&
          s.admissionStatus === 'active'
      )
      setStudents(filtered)
      const marksObj = {}
      filtered.forEach((s) => { marksObj[s._id] = '' })
      setMarks(marksObj)
      setFetched(true)
      if (filtered.length === 0) toast.error('No active students found for this class')
    } catch {
      toast.error('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  const onFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })
  const onMarkChange = (id, value) => setMarks({ ...marks, [id]: value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const marksData = Object.entries(marks)
      .filter(([, mark]) => mark !== '')
      .map(([studentId, mark]) => ({ studentId, marks: parseFloat(mark) }))

    if (marksData.length === 0) {
      toast.error('Please enter at least one mark')
      return
    }

    // Inform user this feature is pending backend
    toast(
      (t) => (
        <div className="flex items-start gap-3">
          <MdInfo size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-800 text-sm">Backend API Required</p>
            <p className="text-xs text-slate-500 mt-0.5">
              A Results endpoint needs to be created on the backend before marks can be saved.
            </p>
          </div>
        </div>
      ),
      { duration: 5000, style: { borderLeft: '4px solid #f59e0b' } }
    )
    console.warn('[EnterMarks] Marks data (not saved — no API):', { ...filters, marksData })
  }

  const enteredCount = Object.values(marks).filter((v) => v !== '').length

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Enter Marks</h1>
            <p className="text-xs text-slate-400 mt-0.5">Select class details to load students</p>
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

        <main className="flex-1 p-6 space-y-6">

          {/* Backend notice */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <MdInfo size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Results API Not Yet Connected</p>
              <p className="text-xs text-amber-700 mt-0.5">
                You can load students and fill in marks, but saving requires a backend
                <code className="bg-amber-100 px-1 rounded ml-1">/api/results</code> endpoint to be implemented first.
              </p>
            </div>
          </div>

          {/* Filters Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <MdGrade size={20} className="text-violet-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Select Class & Exam</h2>
                <p className="text-xs text-slate-400">All fields marked * are required to load students</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { name: 'course', label: 'Course *', type: 'text', placeholder: 'e.g. BTech' },
                { name: 'section', label: 'Section', type: 'text', placeholder: 'e.g. A' },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    name={f.name}
                    value={filters[f.name]}
                    onChange={onFilterChange}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Semester *</label>
                <select
                  name="semester"
                  value={filters.semester}
                  onChange={onFilterChange}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">Select</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Sem {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={filters.subject}
                  onChange={onFilterChange}
                  placeholder="e.g. Mathematics"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Exam Type</label>
                <select
                  name="examType"
                  value={filters.examType}
                  onChange={onFilterChange}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="midterm">Mid Term</option>
                  <option value="final">Final Exam</option>
                  <option value="internal">Internal</option>
                  <option value="practical">Practical</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchStudents}
              disabled={loading}
              className="mt-5 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              {loading ? (
                <><MdRefresh size={18} className="animate-spin" /> Loading…</>
              ) : (
                <><MdPeople size={18} /> Load Students</>
              )}
            </button>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {/* Marks Entry */}
          {!loading && students.length > 0 && (
            <form onSubmit={handleSubmit}>
              {/* Progress */}
              <div className="bg-white rounded-xl border border-slate-100 p-4 mb-4 shadow-sm flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  <span className="font-bold text-slate-800">{enteredCount}</span> of {students.length} marks entered
                </span>
                <div className="flex-1 mx-4 bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-violet-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${students.length > 0 ? (enteredCount / students.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-violet-600">
                  {students.length > 0 ? Math.round((enteredCount / students.length) * 100) : 0}%
                </span>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm">
                    {filters.examType.charAt(0).toUpperCase() + filters.examType.slice(1)} Marks — {filters.subject}
                  </h3>
                  <span className="text-xs text-slate-400">{students.length} students</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                        <th className="text-left px-5 py-3 font-semibold w-10">#</th>
                        <th className="text-left px-5 py-3 font-semibold">Roll No.</th>
                        <th className="text-left px-5 py-3 font-semibold">Student</th>
                        <th className="text-right px-5 py-3 font-semibold">Marks (0–100)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {students.map((student, idx) => {
                        const val = marks[student._id]
                        const hasVal = val !== ''
                        const numVal = parseFloat(val)
                        const isValid = !hasVal || (numVal >= 0 && numVal <= 100)
                        return (
                          <tr key={student._id} className={`transition-colors ${hasVal ? 'bg-violet-50/30' : 'hover:bg-slate-50'}`}>
                            <td className="px-5 py-3 text-slate-400 text-xs">{idx + 1}</td>
                            <td className="px-5 py-3">
                              <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                {student.rollNumber}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs font-bold">{student.name.charAt(0)}</span>
                                </div>
                                <span className="font-medium text-slate-800">{student.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <input
                                type="number"
                                value={val}
                                onChange={(e) => onMarkChange(student._id, e.target.value)}
                                min={0}
                                max={100}
                                step={0.5}
                                placeholder="—"
                                className={`w-24 px-3 py-1.5 border rounded-xl text-sm text-right focus:outline-none focus:ring-2 transition
                                  ${!isValid
                                    ? 'border-red-300 bg-red-50 focus:ring-red-400'
                                    : hasVal
                                    ? 'border-violet-300 bg-violet-50 focus:ring-violet-400'
                                    : 'border-slate-200 focus:ring-blue-500'
                                  }`}
                              />
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
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <MdGrade size={18} /> Save All Marks ({enteredCount} entered)
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-2">
                    ⚠ Saving is currently disabled — backend API required
                  </p>
                </div>
              </div>
            </form>
          )}

          {/* Empty state */}
          {!loading && fetched && students.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdGrade size={28} className="text-slate-300" />
              </div>
              <p className="text-slate-600 font-medium">No students found</p>
              <p className="text-sm text-slate-400 mt-1">Try a different course, semester, or section</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default EnterMarks