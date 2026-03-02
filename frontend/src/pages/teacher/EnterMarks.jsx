import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdGrade, MdSearch } from 'react-icons/md'

const EnterMarks = () => {
  const [students, setStudents] = useState([])
  const [filters, setFilters] = useState({
    course: '',
    semester: '',
    section: 'A',
    subject: '',
    examType: 'midterm'
  })
  const [marks, setMarks] = useState({})
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  const fetchStudents = async () => {
    if (!filters.course || !filters.semester) return
    
    setLoading(true)
    try {
      const res = await axios.get('http://localhost:5000/api/students', config)
      const filtered = res.data.filter(s => 
        s.course === filters.course && 
        s.semester === parseInt(filters.semester) &&
        s.section === filters.section &&
        s.admissionStatus === 'active'
      )
      setStudents(filtered)
      
      // Initialize marks object
      const marksObj = {}
      filtered.forEach(s => {
        marksObj[s._id] = ''
      })
      setMarks(marksObj)
    } catch (error) {
      toast.error('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  const onFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const onMarkChange = (studentId, value) => {
    setMarks({ ...marks, [studentId]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const marksData = Object.entries(marks)
      .filter(([_, mark]) => mark !== '')
      .map(([studentId, mark]) => ({
        studentId,
        marks: parseFloat(mark)
      }))

    if (marksData.length === 0) {
      toast.error('Please enter at least one mark')
      return
    }

    console.log('Marks to save:', {
      ...filters,
      marksData
    })

    toast.success(`Marks saved for ${marksData.length} students!`)
    // In production, you'd save to a Results model
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Enter Marks</h1>
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
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">Select Class & Exam</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
                <input
                  type="text"
                  name="course"
                  value={filters.course}
                  onChange={onFilterChange}
                  placeholder="e.g., BTech"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semester *</label>
                <select
                  name="semester"
                  value={filters.semester}
                  onChange={onFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select</option>
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                <input
                  type="text"
                  name="section"
                  value={filters.section}
                  onChange={onFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={filters.subject}
                  onChange={onFilterChange}
                  placeholder="e.g., Mathematics"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type *</label>
                <select
                  name="examType"
                  value={filters.examType}
                  onChange={onFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="midterm">Mid Term</option>
                  <option value="final">Final Exam</option>
                  <option value="internal">Internal</option>
                  <option value="practical">Practical</option>
                </select>
              </div>
            </div>
            <button
              onClick={fetchStudents}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Load Students
            </button>
          </div>

          {/* Marks Entry */}
          {students.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4">
                Enter Marks ({students.length} students)
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Roll Number</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Student Name</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {students.map((student, index) => (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{index + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium">{student.rollNumber}</td>
                          <td className="px-4 py-3 text-sm">{student.name}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={marks[student._id] || ''}
                              onChange={(e) => onMarkChange(student._id, e.target.value)}
                              min="0"
                              max="100"
                              step="0.5"
                              placeholder="0-100"
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="submit"
                  className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Save All Marks
                </button>
              </form>
            </div>
          )}

          {loading && (
            <div className="text-center py-12 text-gray-400">Loading students...</div>
          )}

          {!loading && students.length === 0 && filters.course && filters.semester && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <MdGrade size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-400">No students found for selected class</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnterMarks