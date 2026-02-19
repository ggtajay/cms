import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  MdPeople,
  MdSchool,
  MdBook,
  MdAttachMoney,
} from 'react-icons/md'
import Sidebar from '../../components/Sidebar'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    feeCollected: 0
  })
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all students
        const studentsRes = await axios.get('http://localhost:5000/api/students', config)
        
        // Fetch all faculty
        const facultyRes = await axios.get('http://localhost:5000/api/faculty', config)
        
        // Get unique courses from students
        const courses = [...new Set(studentsRes.data.map(s => s.course))]
        
        // Calculate fee collected (count students with paid/partial status)
        const paidStudents = studentsRes.data.filter(s => 
          s.feeStatus === 'paid' || s.feeStatus === 'partial'
        )
        
        setStats({
          totalStudents: studentsRes.data.length,
          totalFaculty: facultyRes.data.length,
          totalCourses: courses.length,
          feeCollected: paidStudents.length
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statsCards = [
    {
      title: 'Total Students',
      value: loading ? '...' : stats.totalStudents,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      icon: <MdPeople size={28} className="text-blue-600" />
    },
    {
      title: 'Total Faculty',
      value: loading ? '...' : stats.totalFaculty,
      color: 'text-green-600',
      bg: 'bg-green-50',
      icon: <MdSchool size={28} className="text-green-600" />
    },
    {
      title: 'Total Courses',
      value: loading ? '...' : stats.totalCourses,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      icon: <MdBook size={28} className="text-purple-600" />
    },
    {
      title: 'Fee Paid',
      value: loading ? '...' : `${stats.feeCollected} students`,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      icon: <MdAttachMoney size={28} className="text-orange-600" />
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">
            Admin Dashboard
          </h1>
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
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome back, {user?.name}! 👋
            </h2>
            <p className="text-gray-500 mt-1">
              Here's what's happening in your college today.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat) => (
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

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Recent Activity
            </h3>
            <div className="text-center py-8 text-gray-400">
              <MdPeople size={48} className="mx-auto mb-3 opacity-30" />
              <p>No recent activity yet</p>
              <p className="text-sm mt-1">
                Start by adding students and faculty
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard