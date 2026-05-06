import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MdLibraryBooks, MdBook, MdAttachMoney, MdNotifications, MdArrowForward, MdAdd } from 'react-icons/md'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'

const LibrarianDashboard = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const getGreeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  }

  const stats = [
    { label: 'Total Books',     value: '—', sub: 'In inventory',    icon: <MdLibraryBooks size={22} className="text-white" />, gradient: 'linear-gradient(135deg,#4f46e5,#6366f1)', path: '/librarian/books' },
    { label: 'Issued Books',    value: '—', sub: 'Currently out',   icon: <MdBook size={22} className="text-white" />,         gradient: 'linear-gradient(135deg,#0369a1,#38bdf8)', path: '/librarian/issue' },
    { label: 'Pending Fines',   value: '—', sub: 'To be collected', icon: <MdAttachMoney size={22} className="text-white" />,  gradient: 'linear-gradient(135deg,#d97706,#f59e0b)', path: '/librarian/fines/pending' },
    { label: 'Overdue',         value: '—', sub: 'Books overdue',   icon: <MdNotifications size={22} className="text-white" />, gradient: 'linear-gradient(135deg,#be123c,#f43f5e)', path: '/librarian/history' },
  ]

  const quickActions = [
    { label: 'Add Book',       icon: <MdAdd size={20} />,            path: '/librarian/books/add',     gradient: 'linear-gradient(135deg,#4f46e5,#6366f1)' },
    { label: 'Issue Book',     icon: <MdBook size={20} />,           path: '/librarian/issue',          gradient: 'linear-gradient(135deg,#0369a1,#38bdf8)' },
    { label: 'Return Book',    icon: <MdLibraryBooks size={20} />,   path: '/librarian/return',         gradient: 'linear-gradient(135deg,#059669,#10b981)' },
    { label: 'Collect Fine',   icon: <MdAttachMoney size={20} />,    path: '/librarian/fines/collect',  gradient: 'linear-gradient(135deg,#d97706,#f59e0b)' },
  ]

  return (
    <div className="cms-layout">
      <Sidebar />
      <div className="cms-main">
        <Topbar
          title="Library Dashboard"
          subtitle={today}
          actions={
            <button onClick={() => navigate('/librarian/books/add')} className="cms-btn-primary hidden sm:flex">
              <MdAdd size={17} /> Add Book
            </button>
          }
        />

        <main className="cms-content">
          <div className="cms-welcome-banner animate-fade-in">
            <div className="relative z-10">
              <p className="text-indigo-300 text-sm font-medium mb-1">{getGreeting()}, {user?.name?.split(' ')[0]} 👋</p>
              <h2 className="text-2xl font-bold text-white mb-1">Library Management</h2>
              <p className="text-indigo-200 text-sm">Manage books, issues, returns, and fines.</p>
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
              <h3 className="cms-section-title mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map(a => (
                  <button key={a.label} onClick={() => navigate(a.path)} className="cms-action-card" style={{ background: a.gradient }}>
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">{a.icon}</div>
                    <span>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="cms-card p-5">
              <h3 className="cms-section-title mb-4">Library Menu</h3>
              <div className="space-y-2">
                {[
                  { label: 'All Books',       path: '/librarian/books' },
                  { label: 'Issue History',   path: '/librarian/history' },
                  { label: 'Pending Fines',   path: '/librarian/fines/pending' },
                  { label: 'Notices',         path: '/librarian/notices' },
                ].map(r => (
                  <button key={r.label} onClick={() => navigate(r.path)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-brand-50 text-sm text-slate-600 hover:text-brand-700 transition-colors group">
                    <span>{r.label}</span>
                    <MdArrowForward size={15} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default LibrarianDashboard
