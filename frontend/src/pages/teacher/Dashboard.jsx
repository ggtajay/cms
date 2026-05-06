import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  MdCalendarToday, MdAssignment, MdBook,
  MdArrowForward, MdAdd, MdCheckCircle, MdTrendingUp,
  MdArrowUpward, MdPeople, MdSpeed, MdStorage,
} from 'react-icons/md'

const TeacherDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  const [stats, setStats] = useState({ assignmentsCount: 0, pendingGrading: 0 })
  const [loading, setLoading] = useState(true)

  const config = { headers: { Authorization: `Bearer ${token}` } }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const getGreeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/assignments', config)
        const assignments = res.data || []
        const pending = assignments.reduce((acc, a) => acc + (a.submissions || []).filter(s => s.status !== 'graded').length, 0)
        setStats({ assignmentsCount: assignments.length, pendingGrading: pending })
      } catch (_) { }
      finally { setLoading(false) }
    }
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const statCards = [
    {
      title: 'Classes Today',
      value: '—',
      sub: 'Check timetable',
      icon: MdCalendarToday,
      color: 'from-violet-500 to-indigo-600',
      lightColor: 'bg-indigo-50 text-indigo-600',
      path: '/teacher/classes',
      trend: 'Today'
    },
    {
      title: 'Total Assignments',
      value: loading ? '—' : stats.assignmentsCount.toLocaleString(),
      sub: 'All assignments',
      icon: MdAssignment,
      color: 'from-amber-500 to-orange-600',
      lightColor: 'bg-amber-50 text-amber-600',
      path: '/teacher/assignments',
      trend: 'Created'
    },
    {
      title: 'Pending Grading',
      value: loading ? '—' : stats.pendingGrading.toLocaleString(),
      sub: 'Needs your review',
      icon: MdTrendingUp,
      color: 'from-rose-500 to-pink-600',
      lightColor: 'bg-rose-50 text-rose-600',
      path: '/teacher/assignments',
      trend: 'Pending'
    },
    {
      title: 'Attendance',
      value: '→',
      sub: 'Mark or view history',
      icon: MdCheckCircle,
      color: 'from-emerald-500 to-teal-600',
      lightColor: 'bg-emerald-50 text-emerald-600',
      path: '/teacher/attendance/mark',
      trend: 'Ready'
    },
  ]

  const quickActions = [
    {
      label: 'Mark Attendance',
      desc: 'Record class attendance',
      icon: MdCalendarToday,
      path: '/teacher/attendance/mark',
      color: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      label: 'Create Assignment',
      desc: 'Post new assignment',
      icon: MdAdd,
      path: '/teacher/assignments/create',
      color: 'bg-slate-700 hover:bg-slate-800'
    },
    {
      label: 'View Classes',
      desc: 'My subjects & schedule',
      icon: MdBook,
      path: '/teacher/classes',
      color: 'bg-slate-700 hover:bg-slate-800'
    },
    {
      label: 'Attendance History',
      desc: 'Past records & reports',
      icon: MdCheckCircle,
      path: '/teacher/attendance/history',
      color: 'bg-slate-700 hover:bg-slate-800'
    },
  ]

  const sidebarMetrics = [
    { label: 'Assignments', value: loading ? '—' : `${stats.assignmentsCount} total`, icon: MdAssignment },
    { label: 'Grading Queue', value: loading ? '—' : `${stats.pendingGrading} pending`, icon: MdSpeed },
    { label: 'Status', value: 'Active', icon: MdStorage },
  ]

  return (
    <div className="cms-layout bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="cms-main flex-1 flex flex-col min-h-screen">
        <Topbar
          title="Teacher Dashboard"
          subtitle={today}
          actions={
            <button
              onClick={() => navigate('/teacher/assignments/create')}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            >
              <MdAdd size={18} />
              New Assignment
            </button>
          }
        />

        <main className="cms-content p-6 lg:p-8 space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-violet-900 p-8 text-white shadow-xl">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-violet-500/20 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-5 hidden lg:block">
              <MdBook size={160} />
            </div>
            <div className="relative z-10 max-w-2xl">
              <p className="text-violet-300 text-sm font-medium tracking-wide uppercase mb-2">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Teacher'}
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">
                Teacher Dashboard
              </h1>
              <p className="text-slate-400 text-sm lg:text-base leading-relaxed max-w-lg">
                Manage your classes, assignments, and student attendance all in one place. Have a productive day!
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.title}
                  onClick={() => navigate(stat.path)}
                  className="group relative bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-slate-200/60 hover:border-violet-200 transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.lightColor} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon size={22} />
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      <MdArrowUpward size={12} />
                      {stat.trend}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm font-semibold text-slate-700 mb-0.5">{stat.title}</p>
                    <p className="text-xs text-slate-500">{stat.sub}</p>
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>
              )
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/60 shadow-sm p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
                <p className="text-sm text-slate-500 mt-0.5">Your most-used teaching tools</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.label}
                      onClick={() => navigate(action.path)}
                      className={`group flex items-center gap-4 p-4 rounded-xl ${action.color} text-white transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-left`}
                    >
                      <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm transition-transform duration-200 group-hover:scale-110 group-hover:bg-white/30">
                        <Icon size={22} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{action.label}</p>
                        <p className="text-xs text-white/80 mt-0.5">{action.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Assignment Overview */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-700 mb-4">Assignment Overview</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-xl font-bold text-slate-900">{loading ? '—' : stats.assignmentsCount}</p>
                    <p className="text-xs text-slate-500 mt-1">Total Created</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-xl">
                    <p className="text-xl font-bold text-amber-700">{loading ? '—' : stats.pendingGrading}</p>
                    <p className="text-xs text-slate-500 mt-1">Pending Grading</p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-xl">
                    <p className="text-xl font-bold text-emerald-700">
                      {loading ? '—' : stats.assignmentsCount - stats.pendingGrading}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Fully Graded</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6">
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-slate-900">Your Profile</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Account at a glance</p>
                </div>
                <div className="flex flex-col items-center text-center gap-4">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-100 shadow-md" />
                  ) : (
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900 text-base">{user?.name}</p>
                    <p className="text-xs text-slate-500 capitalize mt-0.5">{user?.role}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {sidebarMetrics.map((metric) => {
                    const Icon = metric.icon
                    return (
                      <div key={metric.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-white rounded-lg shadow-sm text-indigo-600">
                            <Icon size={14} />
                          </div>
                          <p className="text-xs font-medium text-slate-600">{metric.label}</p>
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{metric.value}</span>
                      </div>
                    )
                  })}
                </div>
                <button
                  onClick={() => navigate('/teacher/profile')}
                  className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all duration-200 active:scale-[0.98]"
                >
                  View Full Profile
                  <MdArrowForward size={16} />
                </button>
              </div>

              {/* Academic Year Widget */}
              <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <MdPeople size={20} />
                  </div>
                  <span className="text-sm font-medium text-violet-100">Academic Year</span>
                </div>
                <p className="text-2xl font-bold mb-1">2025 — 2026</p>
                <p className="text-sm text-violet-200">Current active session</p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-violet-200">Semester</span>
                    <span className="font-semibold">2nd (Summer)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default TeacherDashboard