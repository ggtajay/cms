import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdPeople, MdSearch, MdEdit, MdDelete, MdVisibility } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

const AllStudents = () => {
  const [students, setStudents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        'http://localhost:5000/api/students',
        config
      )
      setStudents(res.data)
      setFiltered(res.data)
    } catch (error) {
      toast.error('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  // Search and filter
  useEffect(() => {
    let result = students
    if (search) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase()) ||
          s.rollNumber.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (courseFilter !== 'all') {
      result = result.filter((s) => s.course === courseFilter)
    }
    setFiltered(result)
  }, [search, courseFilter, students])

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await axios.delete(
          `http://localhost:5000/api/students/${id}`,
          config
        )
        toast.success('Student deleted successfully')
        fetchStudents()
      } catch (error) {
        toast.error('Failed to delete student')
      }
    }
  }

  // Get unique courses
  const courses = ['all', ...new Set(students.map(s => s.course))]

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">All Students</h1>
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
          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
              <MdSearch size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or roll number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none text-sm"
              />
            </div>

            {/* Course Filter */}
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none bg-white"
            >
              {courses.map(course => (
                <option key={course} value={course}>
                  {course === 'all' ? 'All Courses' : course}
                </option>
              ))}
            </select>

            <button
              onClick={() => navigate('/admin/students/add')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              + Add Student
            </button>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <MdPeople size={20} className="text-blue-600" />
                Students ({filtered.length})
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">
                Loading students...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MdPeople size={48} className="mx-auto mb-3 opacity-30" />
                <p>No students found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Roll No</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Course</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Semester</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((student, index) => (
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
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                          {student.rollNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {student.course}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {student.department}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Sem {student.semester}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.admissionStatus === 'active'
                              ? 'bg-green-100 text-green-700'
                              : student.admissionStatus === 'graduated'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {student.admissionStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/admin/students/view/${student._id}`)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <MdVisibility size={20} />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/students/edit/${student._id}`)}
                              className="text-green-600 hover:text-green-800"
                              title="Edit"
                            >
                              <MdEdit size={20} />
                            </button>
                            <button
                              onClick={() => handleDelete(student._id, student.name)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <MdDelete size={20} />
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
        </div>
      </div>
    </div>
  )
}

export default AllStudents