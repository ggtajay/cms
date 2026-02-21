import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdCake,
  MdLocationOn,
  MdSchool,
  MdBook
} from 'react-icons/md'

const MyProfile = () => {
  const [faculty, setFaculty] = useState(null)
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        // Get current user's details
        const userRes = await axios.get('http://localhost:5000/api/auth/me', config)
        
        // Find faculty record by email
        const facultyRes = await axios.get('http://localhost:5000/api/faculty', config)
        const myFaculty = facultyRes.data.find(f => f.email === userRes.data.email)
        
        if (myFaculty) {
          setFaculty(myFaculty)
        } else {
          toast.error('Faculty record not found')
        }
      } catch (error) {
        toast.error('Failed to fetch profile')
      } finally {
        setLoading(false)
      }
    }
    fetchMyProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!faculty) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-400">Faculty profile not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
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
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-600 w-24 h-24 rounded-full flex items-center justify-center">
                <span className="text-white text-4xl font-bold">
                  {faculty.name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">{faculty.name}</h2>
                <p className="text-gray-500 text-lg">{faculty.designation}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {faculty.employeeId}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {faculty.department}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
                <MdPerson className="text-blue-600" />
                Personal Information
              </h3>
              <div className="space-y-4">
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
                Professional Details
              </h3>
              <div className="space-y-4">
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
            <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">
                Subjects I Teach
              </h3>
              {faculty.subjects && faculty.subjects.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {faculty.subjects.map((subject, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No subjects assigned</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyProfile