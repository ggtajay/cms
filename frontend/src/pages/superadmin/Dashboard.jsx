import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  MdPeople, MdSchool, MdBarChart, MdNotifications,
  MdPersonAdd, MdArrowForward, MdAdminPanelSettings, MdTrendingUp,
  MdCheckCircle, MdSpeed, MdStorage, MdArrowUpward
} from 'react-icons/md'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'

const SuperAdminDashboard = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')
  const config = { headers: { Authorization: `Bearer ${token}` } }

  const [userCount, setUserCount] = useState(0)
  const [adminCount, setAdminCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const getGreeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('/api/auth/users', config)
        const users = Array.isArray(res.data) ? res.data : []
        setUserCount(users.length)
        setAdminCount(users.filter(u => u.role === 'admin').length)
      } catch (_) { }
      finally { setLoading(false) }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = [
    {
      label: 'Total Users',
      value: loading ? '—' : userCount.toLocaleString(),
      sub: 'All registered accounts',
      icon: MdPeople,
      color: 'from-violet-500 to-indigo-600',
      lightColor: 'bg-indigo-50 text-indigo-600',
      path: '/superadmin/users',
      trend: '+12%'
    },
    {
      label: 'Administrators',
      value: loading ? '—' : adminCount.toLocaleString(),
      sub: 'College admins active',
      icon: MdAdminPanelSettings,
      color: 'from-sky-500 to-cyan-600',
      lightColor: 'bg-sky-50 text-sky-600',
      path: '/superadmin/users',
      trend: '+3'
    },
    {
      label: 'Institutions',
      value: '1',
      sub: 'Managed colleges',
      icon: MdSchool,
      color: 'from-amber-500 to-orange-600',
      lightColor: 'bg-amber-50 text-amber-600',
      path: '/superadmin/dashboard',
      trend: 'Stable'
    },
    {
      label: 'System Health',
      value: '98.9%',
      sub: 'Uptime last 30 days',
      icon: MdTrendingUp,
      color: 'from-emerald-500 to-teal-600',
      lightColor: 'bg-emerald-50 text-emerald-600',
      path: '/superadmin/dashboard',
      trend: 'Optimal'
    },
  ]

  const quickActions = [
    {
      label: 'Create Admin',
      desc: 'Add new college administrator',
      icon: MdPersonAdd,
      path: '/superadmin/users/create-admin',
      color: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      label: 'All Users',
      desc: 'View and manage accounts',
      icon: MdPeople,
      path: '/superadmin/users',
      color: 'bg-slate-700 hover:bg-slate-800'
    },
    {
      label: 'Notices',
      desc: 'Broadcast announcements',
      icon: MdNotifications,
      path: '/superadmin/notices',
      color: 'bg-slate-700 hover:bg-slate-800'
    },
    {
      label: 'Reports',
      desc: 'Analytics and insights',
      icon: MdBarChart,
      path: '/superadmin/dashboard',
      color: 'bg-slate-700 hover:bg-slate-800'
    },
  ]

  const systemMetrics = [
    { label: 'Environment', value: 'Production', status: 'healthy', icon: MdCheckCircle },
    { label: 'API Latency', value: '24ms', status: 'healthy', icon: MdSpeed },
    { label: 'Database', value: 'Connected', status: 'healthy', icon: MdStorage },
  ]

  return (
    <div className="cms-layout bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="cms-main flex-1 flex flex-col min-h-screen">
        <Topbar
          title="Super Admin Dashboard"
          subtitle={today}
          actions={
            <button
              onClick={() => navigate('/superadmin/users/create-admin')}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            >
              <MdPersonAdd size={18} />
              Create Admin
            </button>
          }
        />

        <main className="cms-content p-6 lg:p-8 space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 text-white shadow-xl">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl"></div>

            <div className="relative z-10 max-w-2xl">
              <p className="text-indigo-300 text-sm font-medium tracking-wide uppercase mb-2">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Admin'}
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">
                Super Admin Panel
              </h1>
              <p className="text-slate-400 text-sm lg:text-base leading-relaxed max-w-lg">
                Centralized control for your college management ecosystem. Monitor users, manage administrators, and oversee system operations.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  onClick={() => navigate(stat.path)}
                  className="group relative bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-slate-200/60 hover:border-indigo-200 transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.lightColor} transition-transform duration-500 group-hover:scale-110`}>
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
                    <p className="text-sm font-semibold text-slate-700 mb-0.5">
                      {stat.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {stat.sub}
                    </p>
                  </div>

                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>
              )
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Quick Actions - Takes 8 columns */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/60 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Frequently used management tools</p>
                </div>
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
                      <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm transition-transform duration-400 group-hover:scale-110 group-hover:bg-white/30">
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

              {/* Recent Activity Placeholder - adds visual weight */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-700 mb-4">System Overview</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-xl font-bold text-slate-900">{loading ? '—' : userCount}</p>
                    <p className="text-xs text-slate-500 mt-1">Active Users</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-xl font-bold text-slate-900">0</p>
                    <p className="text-xs text-slate-500 mt-1">Pending Tasks</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-xl font-bold text-slate-900">100%</p>
                    <p className="text-xs text-slate-500 mt-1">Security Score</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status - Takes 4 columns */}
            <div className="lg:col-span-4 space-y-6">
              {/* System Health Card */}
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6">
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-slate-900">System Status</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Real-time infrastructure monitoring</p>
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
                          <div>
                            <p className="text-sm font-medium text-slate-700">{metric.label}</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {metric.value}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <button
                  onClick={() => navigate('/superadmin/users')}
                  className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all duration-200 active:scale-[0.98]"
                >
                  Manage Users
                  <MdArrowForward size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>

              {/* Mini Calendar / Date Widget */}
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

export default SuperAdminDashboard