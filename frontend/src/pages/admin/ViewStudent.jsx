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

const ViewStudent = () => {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/students/${id}`,
          config
        )
        setStudent(res.data)
      } catch (error) {
        toast.error('Failed to fetch student details')
        navigate('/admin/students')
      } finally {
        setLoading(false)
      }
    }
    fetchStudent()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading student details...</p>
        </div>
      </div>
    )
  }

  if (!student) return null

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/students')}
              className="text-gray-600 hover:text-gray-800"
            >
              <MdArrowBack size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Student Details</h1>
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

        {/* Page Content */}
        <div className="p-6">
          {/* Student Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {student.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
                  <p className="text-gray-500">{student.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {student.rollNumber}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      student.admissionStatus === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {student.admissionStatus}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate(`/admin/students/edit/${student._id}`)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <MdEdit size={20} />
                Edit Student
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
                    <p className="text-sm text-gray-800 font-medium">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdPhone className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm text-gray-800 font-medium">{student.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdCake className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="text-sm text-gray-800 font-medium">
                      {new Date(student.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdPerson className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="text-sm text-gray-800 font-medium capitalize">{student.gender}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdLocationOn className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm text-gray-800 font-medium">{student.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
                <MdSchool className="text-blue-600" />
                Academic Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MdBook className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Roll Number</p>
                    <p className="text-sm text-gray-800 font-medium">{student.rollNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdSchool className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Course</p>
                    <p className="text-sm text-gray-800 font-medium">{student.course}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdBook className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="text-sm text-gray-800 font-medium">{student.department}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdSchool className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Semester</p>
                    <p className="text-sm text-gray-800 font-medium">Semester {student.semester}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdBook className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Section</p>
                    <p className="text-sm text-gray-800 font-medium">Section {student.section}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdCake className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Admission Date</p>
                    <p className="text-sm text-gray-800 font-medium">
                      {new Date(student.admissionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
                <MdPeople className="text-blue-600" />
                Parent/Guardian Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MdPerson className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm text-gray-800 font-medium">{student.parentName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdPhone className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm text-gray-800 font-medium">{student.parentPhone}</p>
                  </div>
                </div>
                {student.parentEmail && (
                  <div className="flex items-start gap-3">
                    <MdEmail className="text-gray-400 mt-1" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-800 font-medium">{student.parentEmail}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <MdPeople className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Relation</p>
                    <p className="text-sm text-gray-800 font-medium">{student.parentRelation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">
                Fee Status
              </h3>
              <div className="text-center py-6">
                <span className={`px-4 py-2 rounded-full text-lg font-medium ${
                  student.feeStatus === 'paid'
                    ? 'bg-green-100 text-green-700'
                    : student.feeStatus === 'partial'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {student.feeStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewStudent