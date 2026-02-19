import React from 'react'
import Sidebar from '../../components/Sidebar'
import {
  MdCalendarToday,
  MdPeople,
  MdAssignment,
  MdBook,
} from 'react-icons/md'

const stats = [
  {
    title: 'Classes Today',
    value: '0',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: <MdCalendarToday size={28} className="text-blue-600" />
  },
  {
    title: 'Total Students',
    value: '0',
    color: 'text-green-600',
    bg: 'bg-green-50',
    icon: <MdPeople size={28} className="text-green-600" />
  },
  {
    title: 'Pending Assignments',
    value: '0',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    icon: <MdAssignment size={28} className="text-orange-600" />
  },
  {
    title: 'Subjects',
    value: '0',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    icon: <MdBook size={28} className="text-purple-600" />
  },
]

const TeacherDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'))

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">
            Teacher Dashboard
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
              Here's your teaching overview
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Today's Schedule
              </h3>
              <div className="text-center py-8 text-gray-400">
                <MdCalendarToday size={48} className="mx-auto mb-3 opacity-30" />
                <p>No classes scheduled today</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Recent Activity
              </h3>
              <div className="text-center py-8 text-gray-400">
                <MdAssignment size={48} className="mx-auto mb-3 opacity-30" />
                <p>No recent activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard