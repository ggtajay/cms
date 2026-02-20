import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import { MdPeople, MdCalendarToday, MdGrade, MdAttachMoney } from 'react-icons/md'

const ParentDashboard = () => {
  const [studentData, setStudentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user'))

  // For now, we'll hardcode a student ID - in production this would come from parent-student linking
  const studentId = 'STUDENT_ID_HERE' // This should be linked in the parent's profile

  useEffect(() => {
    // Fetch child's basic info
    // In production, fetch parent's linked children from backend
    setLoading(false)
  }, [])

  const stats = [
    {
      title: "Child's Attendance",
      value: 'N/A',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      icon: <MdCalendarToday size={28} className="text-blue-600" />
    },
    {
      title: 'Overall Grade',
      value: 'N/A',
      color: 'text-green-600',
      bg: 'bg-green-50',
      icon: <MdGrade size={28} className="text-green-600" />
    },
    {
      title: 'Fee Status',
      value: 'Pending',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      icon: <MdAttachMoney size={28} className="text-orange-600" />
    }
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Parent Dashboard</h1>
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
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome, {user?.name}! 👋
            </h2>
            <p className="text-gray-500 mt-1">
              Track your child's academic progress
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-4"
              >
                <div className={`${stat.bg} p-3 rounded-xl`}>
                  {stat.icon}
                </div>
                <div>
                  <h3 className={`text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">{stat.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Your Child's Information
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">
                <strong>Note:</strong> Parent-student linking feature will be available soon. 
                Once linked, you'll be able to view your child's complete academic details, 
                attendance, fee status, and results from this dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ParentDashboard