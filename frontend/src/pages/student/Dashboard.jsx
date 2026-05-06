import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  MdCalendarToday, MdGrade, MdAttachMoney, MdAssignment,
  MdArrowForward, MdCheckCircle, MdArrowUpward, MdBook,
  MdPerson, MdSpeed, MdStorage,
} from 'react-icons/md'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'

const StudentDashboard = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')
  const config = { headers: { Authorization: `Bearer ${token}` } }

  const [assignCount, setAssignCount] = useState(0)
  const [feeStatus, setFeeStatus] = useState('—')
  const [loading, setLoading] = useState(true)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const getGreeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  }

  useEffect(() => {
    const load = async () => {
      try {
        const [asgRes, feeRes] = await Promise.allSettled([
          axios.get('/api/assignments/student', config),
          axios.get('/api/fees/student', config),
        ])
        if (asgRes.status === 'fulfilled') setAssignCount(asgRes.value.data?.length ?? 0)
        if (feeRes.status === 'fulfilled') setFeeStatus(feeRes.value.data?.status ?? 'Pending')
      } catch (_) { }
      finally { setLoading(false) }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const statCards = [
    {
      label: 'Attendance',
      value: '0%',
      sub: 'This semester',
      icon: MdCalendarToday,
      color: 'from-violet-500 to-indigo-600',
      lightColor: 'bg-indigo-50 text-indigo-600',
      path: '/student/attendance',
      trend: 'Semester'
    },
    {
      label: 'Overall Grade',
      value: 'N/A',
      sub: 'Latest result',
      icon: MdGrade,
      color: 'from-sky-500 to-cyan-600',
      lightColor: 'bg-sky-50 text-sky-600',
      path: '/student/profile',
      trend: 'Current'
    },
    {
      label: 'Fee Status',
      value: loading ? '—' : feeStatus,
      sub: 'Current semester',
      icon: MdAttachMoney,
      color: 'from-emerald-500 to-teal-600',
      lightColor: 'bg-emerald-50 text-emerald-600',
      path: '/student/fees',
      trend: 'Live'
    },
    {
      label: 'Assignments',
      value: loading ? '—' : assignCount.toLocaleString(),
      sub: 'Total assigned',
      icon: MdAssignment,
      color: 'from-amber-500 to-orange-600',
      lightColor: 'bg-amber-50 text-amber-600',
      path: '/student/assignments',
      trend: 'Active'
    },
  ]

  const quickLinks = [
    {
      label: 'My Attendance',
      desc: 'View your attendance records',
      icon: MdCalendarToday,
      path: '/student/attendance',
      color: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      label: 'Assignments',
      desc: 'View & submit assignments',
      icon: MdAssignment,
      path: '/student/assignments',
      color: 'bg-slate-700 hover:bg-slate-800'
    },
    {
      label: 'Fee Status',
      desc: 'Check payment status',
      icon: MdAttachMoney,
      path: '/student/fees',
      color: 'bg-slate-700 hover:bg-slate-800'
    },
    {
      label: 'My Profile',
      desc: 'View & edit your profile',
      icon: MdPerson,
      path: '/student/profile',
      color: 'bg-slate-700 hover:bg-slate-800'
    },
  ]

  const sidebarInfo = [
    { label: 'Assignments', value: loading ? '—' : `${assignCount} total`, icon: MdBook },
    { label: 'Fee', value: loading ? '—' : feeStatus, icon: MdSpeed },
    { label: 'Status', value: 'Active', icon: MdStorage },
  ]

  return (
    <div className="cms-layout bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="cms-main flex-1 flex flex-col min-h-screen">
        <Topbar
          title="Student Dashboard"
          subtitle={today}
        />

        <main className="cms-content p-6 lg:p-8 space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-8 text-white shadow-xl">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-sky-500/20 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-5 hidden lg:block">
              <MdBook size={160} />
            </div>
            <div className="relative z-10 max-w-2xl">
              <p className="text-sky-300 text-sm font-medium tracking-wide uppercase mb-2">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'}
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">
                Welcome back!
              </h1>
              <p className="text-slate-400 text-sm lg:text-base leading-relaxed max-w-lg">
                Track your attendance, assignments, fees, and academic progress — all in one place.
              </p>
              <span className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-sm border border-white/10">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Active Student
              </span>
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
                  className="group relative bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-slate-200/60 hover:border-sky-200 transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
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
            {/* Quick Links */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/60 shadow-sm p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Quick Links</h3>
                <p className="text-sm text-slate-500 mt-0.5">Jump to your most-used sections</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <button
                      key={link.label}
                      onClick={() => navigate(link.path)}
                      className={`group flex items-center gap-4 p-4 rounded-xl ${link.color} text-white transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-left`}
                    >
                      <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm transition-transform duration-200 group-hover:scale-110 group-hover:bg-white/30">
                        <Icon size={22} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{link.label}</p>
                        <p className="text-xs text-white/80 mt-0.5">{link.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Academic Overview */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-700 mb-4">Academic Overview</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-xl font-bold text-slate-900">0%</p>
                    <p className="text-xs text-slate-500 mt-1">Attendance</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-xl font-bold text-slate-900">{loading ? '—' : assignCount}</p>
                    <p className="text-xs text-slate-500 mt-1">Assignments</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-xl font-bold text-slate-900 capitalize">{loading ? '—' : feeStatus}</p>
                    <p className="text-xs text-slate-500 mt-1">Fee Status</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6">
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-slate-900">My Profile</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Your account details</p>
                </div>
                <div className="flex flex-col items-center text-center gap-4">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-20 h-20 rounded-full object-cover ring-4 ring-sky-100 shadow-md" />
                  ) : (
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold bg-gradient-to-br from-sky-500 to-indigo-600 shadow-md">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900 text-base">{user?.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                    {user?.rollNumber && (
                      <p className="text-xs font-semibold text-indigo-600 mt-1 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
                        {user.rollNumber}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {sidebarInfo.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-white rounded-lg shadow-sm text-sky-600">
                            <Icon size={14} />
                          </div>
                          <p className="text-xs font-medium text-slate-600">{item.label}</p>
                        </div>
                        <span className="text-xs font-semibold text-slate-700 capitalize">{item.value}</span>
                      </div>
                    )
                  })}
                </div>
                <button
                  onClick={() => navigate('/student/profile')}
                  className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all duration-200 active:scale-[0.98]"
                >
                  View Full Profile
                  <MdArrowForward size={16} />
                </button>
              </div>

              {/* Academic Year Widget */}
              <div className="bg-gradient-to-br from-sky-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <MdCheckCircle size={20} />
                  </div>
                  <span className="text-sm font-medium text-sky-100">Academic Year</span>
                </div>
                <p className="text-2xl font-bold mb-1">2025 — 2026</p>
                <p className="text-sm text-sky-200">Current active session</p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-sky-200">Semester</span>
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

export default StudentDashboard