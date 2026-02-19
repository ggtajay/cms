import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdCalendarToday, MdCheckCircle, MdCancel, MdAccessTime } from 'react-icons/md'

const MarkAttendance = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    subject: '',
    course: '',
    semester: 1,
    section: 'A'
  })
  const [attendance, setAttendance] = useState({})
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  const fetchStudents = async () => {
    if (!formData.course || !formData.semester) return
    
    setLoading(true)
    try {
      const res = await axios.get(
        'http://localhost:5000/api/students',
        config
      )
      
      // Filter by course, semester, section
      const filtered = res.data.filter(
        s => s.course === formData.course && 
             s.semester === parseInt(formData.semester) &&
             s.section === formData.section &&
             s.admissionStatus === 'active'
      )
      
      setStudents(filtered)
      
      // Initialize all as present by default
      const initialAttendance = {}
      filtered.forEach(s => {
        initialAttendance[s._id] = 'present'
      })
      setAttendance(initialAttendance)
    } catch (error) {
      toast.error('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (formData.course && formData.semester) {
      fetchStudents()
    }
  }, [formData.course, formData.semester, formData.section])

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const toggleStatus = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status })
  }

  const markAllPresent = () => {
    const allPresent = {}
    students.forEach(s => {
      allPresent[s._id] = 'present'
    })
    setAttendance(allPresent)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.subject) {
      toast.error('Please enter subject name')
      return
    }

    if (students.length === 0) {
      toast.error('No students found for this class')
      return
    }

    setSaving(true)
    try {
      const attendanceData = {
        date: formData.date,
        subject: formData.subject,
        course: formData.course,
        semester: parseInt(formData.semester),
        section: formData.section,
        students: students.map(s => ({
          studentId: s._id,
          status: attendance[s._id]
        }))
      }

      await axios.post(
        'http://localhost:5000/api/attendance/mark',
        attendanceData,
        config
      )

      toast.success('Attendance marked successfully!')
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        subject: '',
        course: '',
        semester: 1,
        section: 'A'
      })
      setStudents([])
      setAttendance({})
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance')
    } finally {
      setSaving(false)
    }
  }

  const presentCount = Object.values(attendance).filter(s => s === 'present').length
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length
  const lateCount = Object.values(attendance).filter(s => s === 'late').length

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Mark Attendance</h1>
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 w-9 h-9 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {user?.name?.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <form onSubmit={onSubmit}>
            {/* Class Selection */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MdCalendarToday className="text-blue-600" />
                Select Class Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={onChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Course *
                  </label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={onChange}
                    required
                    placeholder="e.g., B.Tech, BCA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Semester *
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Sem {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Section *
                  </label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={onChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={onChange}
                    required
                    placeholder="e.g., Mathematics"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Students List */}
            {students.length > 0 && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
                    <MdCheckCircle size={32} className="text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                      <p className="text-sm text-gray-500">Present</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
                    <MdCancel size={32} className="text-red-600" />
                    <div>
                      <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                      <p className="text-sm text-gray-500">Absent</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
                    <MdAccessTime size={32} className="text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{lateCount}</p>
                      <p className="text-sm text-gray-500">Late</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">
                      Students ({students.length})
                    </h3>
                    <button
                      type="button"
                      onClick={markAllPresent}
                      className="text-sm bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition"
                    >
                      Mark All Present
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Student</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Roll No</th>
                          <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {students.map((student, index) => (
                          <tr key={student._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">
                                    {student.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-800">
                                    {student.name}
                                  </p>
                                  <p className="text-xs text-gray-500">{student.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-600">
                              {student.rollNumber}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleStatus(student._id, 'present')}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    attendance[student._id] === 'present'
                                      ? 'bg-green-600 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  Present
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleStatus(student._id, 'absent')}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    attendance[student._id] === 'absent'
                                      ? 'bg-red-600 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  Absent
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleStatus(student._id, 'late')}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    attendance[student._id] === 'late'
                                      ? 'bg-orange-600 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  Late
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-6 border-t">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                    >
                      {saving ? 'Saving Attendance...' : 'Submit Attendance'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {!loading && students.length === 0 && formData.course && formData.subject && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-400">No students found for this class</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default MarkAttendance