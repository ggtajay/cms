import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdCalendarToday, MdSearch, MdCheckCircle, MdCancel, MdAccessTime } from 'react-icons/md'

const AttendanceHistory = () => {
  const [attendanceData, setAttendanceData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [filters, setFilters] = useState({
    date: '',
    subject: '',
    course: '',
    semester: ''
  })
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  const fetchAttendanceHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/attendance', config)
      setAttendanceData(res.data)
      setFilteredData(res.data)
    } catch (error) {
      toast.error('Failed to fetch attendance history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendanceHistory()
  }, [])

  useEffect(() => {
    let result = attendanceData
    
    if (filters.date) {
      result = result.filter(a => 
        new Date(a.date).toDateString() === new Date(filters.date).toDateString()
      )
    }
    if (filters.subject) {
      result = result.filter(a => 
        a.subject.toLowerCase().includes(filters.subject.toLowerCase())
      )
    }
    if (filters.course) {
      result = result.filter(a => 
        a.course.toLowerCase().includes(filters.course.toLowerCase())
      )
    }
    if (filters.semester) {
      result = result.filter(a => a.semester === parseInt(filters.semester))
    }
    
    setFilteredData(result)
  }, [filters, attendanceData])

  const onFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const clearFilters = () => {
    setFilters({ date: '', subject: '', course: '', semester: '' })
  }

  // Group by date and subject
  const groupedData = filteredData.reduce((acc, record) => {
    const key = `${new Date(record.date).toLocaleDateString()}-${record.subject}`
    if (!acc[key]) {
      acc[key] = {
        date: record.date,
        subject: record.subject,
        course: record.course,
        semester: record.semester,
        records: []
      }
    }
    acc[key].records.push(record)
    return acc
  }, {})

  const groupedArray = Object.values(groupedData).sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  )

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Attendance History</h1>
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
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={onFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={filters.subject}
                  onChange={onFilterChange}
                  placeholder="Search subject..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <input
                  type="text"
                  name="course"
                  value={filters.course}
                  onChange={onFilterChange}
                  placeholder="Search course..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                <select
                  name="semester"
                  value={filters.semester}
                  onChange={onFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">All</option>
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <option key={sem} value={sem}>Sem {sem}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 text-sm font-medium hover:underline"
            >
              Clear Filters
            </button>
          </div>

          {/* Attendance Records */}
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading history...</div>
          ) : groupedArray.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <MdCalendarToday size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-400">No attendance records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedArray.map((group, index) => {
                const presentCount = group.records.filter(r => r.status === 'present').length
                const absentCount = group.records.filter(r => r.status === 'absent').length
                const lateCount = group.records.filter(r => r.status === 'late').length
                const total = group.records.length
                const percentage = ((presentCount / total) * 100).toFixed(1)

                return (
                  <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-bold">{group.subject}</h3>
                          <p className="text-sm opacity-90">
                            {new Date(group.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-xs opacity-75 mt-1">
                            {group.course} - Semester {group.semester}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold">{percentage}%</p>
                          <p className="text-xs opacity-75">Attendance</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <MdCheckCircle className="text-green-600" size={20} />
                            <span className="text-2xl font-bold text-green-600">{presentCount}</span>
                          </div>
                          <p className="text-xs text-gray-500">Present</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <MdCancel className="text-red-600" size={20} />
                            <span className="text-2xl font-bold text-red-600">{absentCount}</span>
                          </div>
                          <p className="text-xs text-gray-500">Absent</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <MdAccessTime className="text-orange-600" size={20} />
                            <span className="text-2xl font-bold text-orange-600">{lateCount}</span>
                          </div>
                          <p className="text-xs text-gray-500">Late</p>
                        </div>
                      </div>

                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:underline">
                          View Student Details ({total} students)
                        </summary>
                        <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                          {group.records.map((record, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm border-b pb-2">
                              <div>
                                <p className="font-medium text-gray-800">{record.student?.name}</p>
                                <p className="text-xs text-gray-500">{record.student?.rollNumber}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                record.status === 'present'
                                  ? 'bg-green-100 text-green-700'
                                  : record.status === 'late'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {record.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AttendanceHistory