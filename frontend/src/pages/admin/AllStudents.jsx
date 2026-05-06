import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdPeople, MdSearch, MdEdit, MdDelete, MdVisibility, MdPersonAdd, MdFilterList } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

const AllStudents = () => {
  const [students,     setStudents]     = useState([])
  const [filtered,     setFiltered]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const token    = localStorage.getItem('token')
  const navigate = useNavigate()
  const config   = { headers: { Authorization: `Bearer ${token}` } }

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students', config)
      setStudents(res.data)
      setFiltered(res.data)
    } catch {
      toast.error('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStudents() }, []) // eslint-disable-line

  useEffect(() => {
    let result = students
    if (search) {
      result = result.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNumber?.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (courseFilter !== 'all') result = result.filter(s => s.course === courseFilter)
    setFiltered(result)
  }, [search, courseFilter, students])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return
    try {
      await axios.delete(`/api/students/${id}`, config)
      toast.success('Student deleted')
      fetchStudents()
    } catch {
      toast.error('Failed to delete student')
    }
  }

  const courses = ['all', ...new Set(students.map(s => s.course).filter(Boolean))]

  const statusBadge = (status) => {
    if (status === 'active')    return <span className="cms-badge-green"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{status}</span>
    if (status === 'graduated') return <span className="cms-badge-blue"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />{status}</span>
    return <span className="cms-badge-red"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{status || 'unknown'}</span>
  }

  return (
    <div className="cms-layout">
      <Sidebar />
      <Toaster position="top-right" toastOptions={{ className: 'font-sans text-sm' }} />

      <div className="cms-main">
        <Topbar
          title="All Students"
          subtitle={`${filtered.length} students found`}
          actions={
            <button onClick={() => navigate('/admin/students/add')} className="cms-btn-primary">
              <MdPersonAdd size={17} /> Add Student
            </button>
          }
        />

        <main className="cms-content">

          {/* ── Search & Filter ─────────────────────────────── */}
          <div className="cms-card p-4 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 flex items-center gap-2.5 bg-[#fafbff] border border-[#e8edf5] rounded-xl px-4 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <MdSearch size={18} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search by name, email or roll number…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 text-sm outline-none bg-transparent text-slate-700 placeholder-slate-400"
                />
              </div>

              {/* Course filter */}
              <div className="flex items-center gap-2 bg-[#fafbff] border border-[#e8edf5] rounded-xl px-3 py-2.5">
                <MdFilterList size={17} className="text-slate-400" />
                <select
                  value={courseFilter}
                  onChange={e => setCourseFilter(e.target.value)}
                  className="text-sm outline-none bg-transparent text-slate-600"
                >
                  {courses.map(c => (
                    <option key={c} value={c}>{c === 'all' ? 'All Courses' : c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Table ───────────────────────────────────────── */}
          <div className="cms-card overflow-hidden animate-fade-in">
            {/* Table header bar */}
            <div className="px-5 py-4 border-b border-[#e8edf5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
                  <MdPeople size={18} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Students</p>
                  <p className="text-xs text-slate-400">{filtered.length} records</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-8 space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="skeleton h-12 rounded-xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                  <MdPeople size={32} className="text-brand-300" />
                </div>
                <p className="text-slate-500 font-medium">No students found</p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filter</p>
                <button onClick={() => navigate('/admin/students/add')} className="cms-btn-primary mt-4">
                  <MdPersonAdd size={16} /> Add Student
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="cms-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student</th>
                      <th>Roll No</th>
                      <th>Course</th>
                      <th>Department</th>
                      <th>Semester</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((student, index) => (
                      <tr key={student._id}>
                        <td className="text-slate-400 text-xs font-medium">{index + 1}</td>
                        <td>
                          <div className="flex items-center gap-3">
                            {student.profileImage ? (
                              <img src={student.profileImage} alt={student.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-brand-100" />
                            ) : (
                              <div className="cms-avatar w-9 h-9 text-sm flex-shrink-0">
                                {student.name?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">{student.name}</p>
                              <p className="text-xs text-slate-400">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td><span className="font-mono text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg">{student.rollNumber}</span></td>
                        <td className="text-slate-600">{student.course}</td>
                        <td className="text-slate-600">{student.department}</td>
                        <td><span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">Sem {student.semester}</span></td>
                        <td>{statusBadge(student.admissionStatus)}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => navigate(`/admin/students/view/${student._id}`)}
                              title="View"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-600 hover:bg-brand-50 transition-colors"
                            >
                              <MdVisibility size={17} />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/students/edit/${student._id}`)}
                              title="Edit"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <MdEdit size={17} />
                            </button>
                            <button
                              onClick={() => handleDelete(student._id, student.name)}
                              title="Delete"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <MdDelete size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AllStudents