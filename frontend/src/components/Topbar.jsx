import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdSearch, MdNotifications, MdKeyboardArrowDown } from 'react-icons/md'

/**
 * Shared Topbar component.
 *
 * Props:
 *  - title      {string}       Page title shown on the left
 *  - subtitle   {string}       Optional subtitle / date
 *  - actions    {ReactNode}    Optional slot for primary action buttons
 *  - notifications {number}   Badge count (default 0)
 */
const Topbar = ({ title, subtitle, actions, notifications = 0 }) => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const role = localStorage.getItem('role')
  const [showSearch, setShowSearch] = useState(false)

  const initials = (name = '') =>
    name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'

  const profilePath = {
    student:  '/student/profile',
    teacher:  '/teacher/profile',
    admin:    '/admin/dashboard',
    superadmin: '/superadmin/dashboard',
    accountant: '/accountant/dashboard',
    librarian:  '/librarian/dashboard',
    parent:     '/parent/dashboard',
  }

  return (
    <header className="cms-topbar">
      {/* ── Left: Title ────────────────────────────────────── */}
      <div>
        <h1 className="text-lg font-bold text-slate-800 leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* ── Right: Actions + Utilities ─────────────────────── */}
      <div className="flex items-center gap-2">

        {/* Extra action slot */}
        {actions}

        {/* Search */}
        <div className={`flex items-center transition-all duration-300 ${showSearch ? 'w-52' : 'w-9'}`}>
          {showSearch ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full">
              <MdSearch size={16} className="text-slate-400 flex-shrink-0" />
              <input
                autoFocus
                placeholder="Search…"
                onBlur={() => setShowSearch(false)}
                className="flex-1 text-sm outline-none bg-transparent text-slate-700 placeholder-slate-400 min-w-0"
              />
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-all duration-200"
            >
              <MdSearch size={20} />
            </button>
          )}
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-all duration-200">
          <MdNotifications size={20} />
          {notifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Profile */}
        <button
          onClick={() => navigate(profilePath[role] || '/')}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
        >
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#3b82f6)' }}>
              {initials(user?.name)}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-slate-700 leading-tight group-hover:text-brand-600 transition-colors">{user?.name}</p>
            <p className="text-[10px] text-slate-400 capitalize">{role}</p>
          </div>
          <MdKeyboardArrowDown size={16} className="text-slate-400 hidden sm:block" />
        </button>
      </div>
    </header>
  )
}

export default Topbar
