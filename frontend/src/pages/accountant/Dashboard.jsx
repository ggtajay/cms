import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { MdAttachMoney, MdBarChart, MdPeople, MdAccountBalanceWallet, MdArrowForward, MdSearch } from 'react-icons/md'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'

const AccountantDashboard = () => {
  const navigate = useNavigate()
  const user  = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')
  const config = { headers: { Authorization: `Bearer ${token}` } }

  const [collected, setCollected] = useState(0)
  const [loading,   setLoading]   = useState(true)

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const getGreeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('/api/fees/collected', config)
        setCollected(res.data?.total || 0)
      } catch (_) {}
      finally { setLoading(false) }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = [
    { label: 'Fee Collected',   value: loading ? '…' : `₹${collected.toLocaleString()}`, sub: 'Total received',    icon: <MdAttachMoney size={22} className="text-white" />,       gradient: 'linear-gradient(135deg,#059669,#10b981)', path: '/accountant/reports/daily' },
    { label: 'Due Payments',    value: '—',  sub: 'Pending dues',       icon: <MdBarChart size={22} className="text-white" />,            gradient: 'linear-gradient(135deg,#d97706,#f59e0b)', path: '/accountant/reports/due' },
    { label: 'Salary Slips',    value: '—',  sub: 'Processed this month', icon: <MdAccountBalanceWallet size={22} className="text-white" />, gradient: 'linear-gradient(135deg,#7c3aed,#a855f7)', path: '/accountant/salary/slips' },
    { label: 'Students',        value: '—',  sub: 'With fee records',   icon: <MdPeople size={22} className="text-white" />,               gradient: 'linear-gradient(135deg,#4f46e5,#6366f1)', path: '/accountant/fees/search' },
  ]

  const quickActions = [
    { label: 'Collect Fee',     icon: <MdAttachMoney size={20} />,         path: '/accountant/fees/collect',    gradient: 'linear-gradient(135deg,#059669,#10b981)' },
    { label: 'Search Student',  icon: <MdSearch size={20} />,              path: '/accountant/fees/search',     gradient: 'linear-gradient(135deg,#4f46e5,#6366f1)' },
    { label: 'Daily Report',    icon: <MdBarChart size={20} />,            path: '/accountant/reports/daily',   gradient: 'linear-gradient(135deg,#0369a1,#38bdf8)' },
    { label: 'Process Salary',  icon: <MdAccountBalanceWallet size={20} />, path: '/accountant/salary/process', gradient: 'linear-gradient(135deg,#7c3aed,#a855f7)' },
  ]

  return (
    <div className="cms-layout">
      <Sidebar />
      <div className="cms-main">
        <Topbar
          title="Accountant Dashboard"
          subtitle={today}
          actions={
            <button onClick={() => navigate('/accountant/fees/collect')} className="cms-btn-primary hidden sm:flex">
              <MdAttachMoney size={17} /> Collect Fee
            </button>
          }
        />

        <main className="cms-content">
          <div className="cms-welcome-banner animate-fade-in">
            <div className="relative z-10">
              <p className="text-indigo-300 text-sm font-medium mb-1">{getGreeting()}, {user?.name?.split(' ')[0]} 👋</p>
              <h2 className="text-2xl font-bold text-white mb-1">Finance Overview</h2>
              <p className="text-indigo-200 text-sm">Manage fee collection, reports, and salary processing.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            {stats.map(s => (
              <div key={s.label} className="cms-card p-5 flex items-center gap-4 cursor-pointer hover:-translate-y-0.5" onClick={() => navigate(s.path)}>
                <div className="cms-stat-icon flex-shrink-0" style={{ background: s.gradient }}>{s.icon}</div>
                <div>
                  <p className="text-xl font-extrabold text-slate-800">{s.value}</p>
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
              <h3 className="cms-section-title mb-4">Reports</h3>
              <div className="space-y-2">
                {[
                  { label: 'Daily Collection', path: '/accountant/reports/daily' },
                  { label: 'Monthly Report',   path: '/accountant/reports/monthly' },
                  { label: 'Due List',         path: '/accountant/reports/due' },
                  { label: 'Salary Slips',     path: '/accountant/salary/slips' },
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

export default AccountantDashboard
