import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MdCalendarToday, MdGrade, MdAttachMoney, MdPeople, MdArrowForward, MdNotifications } from 'react-icons/md'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'

const ParentDashboard = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const getGreeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  }

  const stats = [
    { label: "Child's Attendance", value: '—',  sub: 'This semester',  icon: <MdCalendarToday size={22} className="text-white" />, gradient: 'linear-gradient(135deg,#4f46e5,#6366f1)', path: '/parent/attendance' },
    { label: 'Latest Result',      value: '—',  sub: 'Academic grade', icon: <MdGrade size={22} className="text-white" />,         gradient: 'linear-gradient(135deg,#059669,#10b981)', path: '/parent/results' },
    { label: 'Fee Status',         value: '—',  sub: 'Current dues',   icon: <MdAttachMoney size={22} className="text-white" />,   gradient: 'linear-gradient(135deg,#d97706,#f59e0b)', path: '/parent/fees' },
    { label: 'Notices',            value: '—',  sub: 'Unread',         icon: <MdNotifications size={22} className="text-white" />, gradient: 'linear-gradient(135deg,#7c3aed,#a855f7)', path: '/parent/notices' },
  ]

  const quickLinks = [
    { label: "Child's Profile", icon: <MdPeople size={20} />,         path: '/parent/profile',    gradient: 'linear-gradient(135deg,#4f46e5,#6366f1)' },
    { label: 'Attendance',      icon: <MdCalendarToday size={20} />,  path: '/parent/attendance', gradient: 'linear-gradient(135deg,#0369a1,#38bdf8)' },
    { label: 'Results',         icon: <MdGrade size={20} />,          path: '/parent/results',    gradient: 'linear-gradient(135deg,#059669,#10b981)' },
    { label: 'Fee Status',      icon: <MdAttachMoney size={20} />,    path: '/parent/fees',       gradient: 'linear-gradient(135deg,#d97706,#f59e0b)' },
  ]

  return (
    <div className="cms-layout">
      <Sidebar />
      <div className="cms-main">
        <Topbar title="Parent Dashboard" subtitle={today} />

        <main className="cms-content">
          <div className="cms-welcome-banner animate-fade-in">
            <div className="relative z-10">
              <p className="text-indigo-300 text-sm font-medium mb-1">{getGreeting()}, {user?.name?.split(' ')[0]} 👋</p>
              <h2 className="text-2xl font-bold text-white mb-1">Parent Portal</h2>
              <p className="text-indigo-200 text-sm">Stay updated on your child's academic progress.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            {stats.map(s => (
              <div key={s.label} className="cms-card p-5 flex items-center gap-4 cursor-pointer hover:-translate-y-0.5" onClick={() => navigate(s.path)}>
                <div className="cms-stat-icon flex-shrink-0" style={{ background: s.gradient }}>{s.icon}</div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-800">{s.value}</p>
                  <p className="text-sm font-medium text-slate-600">{s.label}</p>
                  <p className="text-xs text-slate-400">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
            <div className="cms-card p-5 lg:col-span-2">
              <h3 className="cms-section-title mb-4">Quick Access</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickLinks.map(l => (
                  <button key={l.label} onClick={() => navigate(l.path)} className="cms-action-card" style={{ background: l.gradient }}>
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">{l.icon}</div>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="cms-card p-5">
              <h3 className="cms-section-title mb-4">My Account</h3>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ background: 'linear-gradient(135deg,#4f46e5,#38bdf8)' }}>
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <button onClick={() => navigate('/parent/notices')} className="cms-btn-secondary w-full justify-center">
                  View Notices <MdArrowForward size={15} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ParentDashboard
