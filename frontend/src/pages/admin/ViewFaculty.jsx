import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdCake,
  MdLocationOn,
  MdSchool,
  MdBook,
  MdPeople,
  MdArrowBack,
  MdEdit
} from 'react-icons/md'

const ViewFaculty = () => {
  const [faculty, setFaculty] = useState(null)
  const [loading, setLoading] = useState(true)
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/faculty/${id}`,
          config
        )
        setFaculty(res.data)
      } catch (error) {
        toast.error('Failed to fetch faculty details')
        navigate('/admin/faculty')
      } finally {
        setLoading(false)
      }
    }
    fetchFaculty()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading faculty details...</p>
        </div>
      </div>
    )
  }

  if (!faculty) return null

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/faculty')}
              className="text-gray-600 hover:text-gray-800"
            >
              <MdArrowBack size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Faculty Details</h1>
          </div>
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

        <div className="p-6">
          {/* Faculty Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-green-600 w-20 h-20 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {faculty.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{faculty.name}</h2>
                  <p className="text-gray-500">{faculty.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {faculty.employeeId}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      faculty.employmentStatus === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {faculty.employmentStatus}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate(`/admin/faculty/edit/${faculty._id}`)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <MdEdit size={20} />
                Edit Faculty
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
                <MdPerson className="text-blue-600" />
                Personal Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MdEmail className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-800 font-medium">{faculty.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdPhone className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm text-gray-800 font-medium">{faculty.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdCake className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="text-sm text-gray-800 font-medium">
                      {new Date(faculty.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdPerson className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="text-sm text-gray-800 font-medium capitalize">{faculty.gender}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdLocationOn className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm text-gray-800 font-medium">{faculty.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
                <MdSchool className="text-blue-600" />
                Professional Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MdBook className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Employee ID</p>
                    <p className="text-sm text-gray-800 font-medium">{faculty.employeeId}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdSchool className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Designation</p>
                    <p className="text-sm text-gray-800 font-medium">{faculty.designation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdBook className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="text-sm text-gray-800 font-medium">{faculty.department}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdSchool className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Qualification</p>
                    <p className="text-sm text-gray-800 font-medium">{faculty.qualification}</p>
                  </div>
                </div>
                {faculty.specialization && (
                  <div className="flex items-start gap-3">
                    <MdBook className="text-gray-400 mt-1" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Specialization</p>
                      <p className="text-sm text-gray-800 font-medium">{faculty.specialization}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <MdSchool className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="text-sm text-gray-800 font-medium">{faculty.experience} years</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdCake className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Joining Date</p>
                    <p className="text-sm text-gray-800 font-medium">
                      {new Date(faculty.joiningDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subjects Teaching */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">
                Subjects Teaching
              </h3>
              {faculty.subjects && faculty.subjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {faculty.subjects.map((subject, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No subjects assigned</p>
              )}
            </div>

            {/* Emergency Contact */}
            {faculty.emergencyContact && faculty.emergencyContact.name && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
                  <MdPeople className="text-blue-600" />
                  Emergency Contact
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MdPerson className="text-gray-400 mt-1" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="text-sm text-gray-800 font-medium">
                        {faculty.emergencyContact.name}
                      </p>
                    </div>
                  </div>
                  {faculty.emergencyContact.phone && (
                    <div className="flex items-start gap-3">
                      <MdPhone className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm text-gray-800 font-medium">
                          {faculty.emergencyContact.phone}
                        </p>
                      </div>
                    </div>
                  )}
                  {faculty.emergencyContact.relation && (
                    <div className="flex items-start gap-3">
                      <MdPeople className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">Relation</p>
                        <p className="text-sm text-gray-800 font-medium">
                          {faculty.emergencyContact.relation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewFaculty