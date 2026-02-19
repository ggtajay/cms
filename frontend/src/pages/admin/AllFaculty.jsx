import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdPeople, MdSearch, MdEdit, MdDelete, MdVisibility } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

const AllFaculty = () => {
  const [faculty, setFaculty] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  const fetchFaculty = async () => {
    try {
      const res = await axios.get(
        'http://localhost:5000/api/faculty',
        config
      )
      setFaculty(res.data)
      setFiltered(res.data)
    } catch (error) {
      toast.error('Failed to fetch faculty')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaculty()
  }, [])

  // Search and filter
  useEffect(() => {
    let result = faculty
    if (search) {
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.email.toLowerCase().includes(search.toLowerCase()) ||
          f.employeeId.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (deptFilter !== 'all') {
      result = result.filter((f) => f.department === deptFilter)
    }
    setFiltered(result)
  }, [search, deptFilter, faculty])

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await axios.delete(
          `http://localhost:5000/api/faculty/${id}`,
          config
        )
        toast.success('Faculty deleted successfully')
        fetchFaculty()
      } catch (error) {
        toast.error('Failed to delete faculty')
      }
    }
  }

  // Get unique departments
  const departments = ['all', ...new Set(faculty.map(f => f.department))]

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">All Faculty</h1>
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
                placeholder="Search by name, email or employee ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none text-sm"
              />
            </div>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none bg-white"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>

            <button
              onClick={() => navigate('/admin/faculty/add')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              + Add Faculty
            </button>
          </div>

          {/* Faculty Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <MdPeople size={20} className="text-blue-600" />
                Faculty Members ({filtered.length})
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">
                Loading faculty...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MdPeople size={48} className="mx-auto mb-3 opacity-30" />
                <p>No faculty found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Faculty</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Designation</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Experience</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((member, index) => (
                      <tr key={member._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-600 w-10 h-10 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {member.name}
                              </p>
                              <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                          {member.employeeId}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {member.designation}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {member.department}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {member.experience} yrs
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            member.employmentStatus === 'active'
                              ? 'bg-green-100 text-green-700'
                              : member.employmentStatus === 'retired'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {member.employmentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/admin/faculty/view/${member._id}`)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <MdVisibility size={20} />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/faculty/edit/${member._id}`)}
                              className="text-green-600 hover:text-green-800"
                              title="Edit"
                            >
                              <MdEdit size={20} />
                            </button>
                            <button
                              onClick={() => handleDelete(member._id, member.name)}
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

export default AllFaculty