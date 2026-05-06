import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  MdPeople, MdSchool, MdBook, MdAttachMoney, MdArrowForward,
  MdPersonAdd, MdBarChart, MdNotifications, MdTrendingUp,
  MdArrowUpward, MdCheckCircle, MdSpeed, MdStorage,
} from 'react-icons/md'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalStudents: 0, totalFaculty: 0, totalCourses: 0, feeCollected: 0 })
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')
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
        const [studRes, facRes, courRes] = await Promise.all([
          axios.get('/api/students', config),
          axios.get('/api/faculty', config),
          axios.get('/api/courses', config),
        ])
        const paid = studRes.data.filter(s => s.feeStatus === 'paid' || s.feeStatus === 'partial')
        setStats({
          totalStudents: studRes.data.length,
          totalFaculty: facRes.data.length,
          totalCourses: courRes.data.length,
          feeCollected: paid.length,
        })
      } catch (e) {
        console.error('Stats error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const statCards = [
    {
      label: 'Total Students',
      value: loading ? '—' : stats.totalStudents.toLocaleString(),
      sub: 'Enrolled this year',
      icon: MdPeople,
      color: 'from-violet-500 to-indigo-600',
      lightColor: 'bg-indigo-50 text-indigo-600',
      path: '/admin/students',
      trend: 'Enrolled'
    },
    {
      label: 'Total Faculty',
      value: loading ? '—' : stats.totalFaculty.toLocaleString(),
      sub: 'Active teachers',
      icon: MdSchool,
      color: 'from-sky-500 to-cyan-600',
      lightColor: 'bg-sky-50 text-sky-600',
      path: '/admin/faculty',
      trend: 'Active'
    },
    {
      label: 'Total Courses',
      value: loading ? '—' : stats.totalCourses.toLocaleString(),
      sub: 'Academic programs',
      icon: MdBook,
      color: 'from-amber-500 to-orange-600',
      lightColor: 'bg-amber-50 text-amber-600',
      path: '/admin/courses',
      trend: 'Running'
    },
    {
      label: 'Fee Cleared',
      value: loading ? '—' : stats.feeCollected.toLocaleString(),
      sub: 'Paid or partial',
      icon: MdAttachMoney,
      color: 'from-emerald-500 to-teal-600',
      lightColor: 'bg-emerald-50 text-emerald-600',
      path: '/admin/fees/due',
      trend: 'Collected'
    },
  ]

  const quickActions = [
    {
      label: 'Add Student',
      desc: 'Enroll a new student',
      icon: MdPersonAdd,
      path: '/admin/students/add',
      color: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      label: 'Add Faculty',
      desc: 'Register new teacher',
      icon: MdSchool,
      path: '/admin/faculty/add',
      color: 'bg-slate-700 hover:bg-slate-800'
    },
    {
      label: 'Notices',
      desc: 'Post announcements',
      icon: MdNotifications,
      path: '/admin/notices',
      color: 'bg-slate-700 hover:bg-slate-800'
    },
    {
      label: 'Reports',
      desc: 'Analytics & insights',
      icon: MdBarChart,
      path: '/admin/reports',
      color: 'bg-slate-700 hover:bg-slate-800'
    },
  ]

  const systemMetrics = [
    { label: 'Fee Collection', value: loading ? '—' : `${stats.feeCollected} paid`, icon: MdCheckCircle },
    { label: 'Faculty Load', value: 'Normal', icon: MdSpeed },
    { label: 'Database', value: 'Connected', icon: MdStorage },
  ]

  return (
    <div className="cms-layout bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="cms-main flex-1 flex flex-col min-h-screen">
        <Topbar
          title="Admin Dashboard"
          subtitle={today}
          actions={
            <button
              onClick={() => navigate('/admin/students/add')}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            >
              <MdPersonAdd size={18} />
              Add Student
            </button>
          }
        />

        <main className="cms-content p-6 lg:p-8 space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 text-white shadow-xl">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-5 hidden lg:block">
              <MdTrendingUp size={160} />
            </div>
            <div className="relative z-10 max-w-2xl">
              <p className="text-indigo-300 text-sm font-medium tracking-wide uppercase mb-2">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Admin'}
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-slate-400 text-sm lg:text-base leading-relaxed max-w-lg">
                Manage students, faculty, fees, and academic operations. Here's your college at a glance.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  onClick={() => navigate(stat.path)}
                  className="group relative bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-slate-200/60 hover:border-indigo-200 transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
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
                    <p className="text-sm font-semibold text-slate-700 mb-0.5">{stat.label}</p>
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
                <p className="text-sm text-slate-500 mt-0.5">Frequently used management tools</p>
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

              {/* College Summary */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-700 mb-4">College Summary</h4>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Students', value: loading ? '—' : stats.totalStudents, path: '/admin/students' },
                    { label: 'Faculty', value: loading ? '—' : stats.totalFaculty, path: '/admin/faculty' },
                    { label: 'Courses', value: loading ? '—' : stats.totalCourses, path: '/admin/courses' },
                    { label: 'Fee Cleared', value: loading ? '—' : stats.feeCollected, path: '/admin/fees/due' },
                  ].map(row => (
                    <div
                      key={row.label}
                      onClick={() => navigate(row.path)}
                      className="text-center p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-100 border border-transparent transition-all duration-200"
                    >
                      <p className="text-xl font-bold text-slate-900">{row.value}</p>
                      <p className="text-xs text-slate-500 mt-1">{row.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* System Status */}
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6">
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-slate-900">System Status</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Live platform metrics</p>
                </div>
                <div className="space-y-3">
                  {systemMetrics.map((metric) => {
                    const Icon = metric.icon
                    return (
                      <div
                        key={metric.label}
                        className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600">
                            <Icon size={16} />
                          </div>
                          <p className="text-sm font-medium text-slate-700">{metric.label}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {metric.value}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <button
                  onClick={() => navigate('/admin/students')}
                  className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all duration-200 active:scale-[0.98]"
                >
                  View All Students
                  <MdArrowForward size={16} />
                </button>
              </div>

              {/* Academic Year Widget */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <MdSchool size={20} />
                  </div>
                  <span className="text-sm font-medium text-indigo-100">Academic Year</span>
                </div>
                <p className="text-2xl font-bold mb-1">2025 — 2026</p>
                <p className="text-sm text-indigo-200">Current active session</p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-200">Semester</span>
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

export default AdminDashboard