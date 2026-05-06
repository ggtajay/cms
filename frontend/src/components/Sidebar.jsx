import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  MdDashboard, MdPeople, MdSchool, MdSettings, MdLogout, MdMenu,
  MdBook, MdAssignment, MdExpandMore, MdExpandLess, MdBarChart,
  MdNotifications, MdClass, MdAttachMoney, MdLibraryBooks,
  MdDirectionsBus, MdHotel, MdCalendarToday, MdGrade, MdFeedback,
  MdAccountBalanceWallet, MdSchedule, MdAccountCircle, MdChevronLeft,
  MdReport,
} from 'react-icons/md'

/* ─── Menu Config ─────────────────────────────────────────────── */
const menuConfig = {
  superadmin: [
    { title: 'Dashboard',       icon: <MdDashboard size={20} />,    path: '/superadmin/dashboard' },
    { title: 'User Management', icon: <MdPeople size={20} />,       subItems: [
        { title: 'All Users',    path: '/superadmin/users' },
        { title: 'Create User',  path: '/superadmin/users/create-admin' },
        { title: 'Students',     path: '/admin/students' },
        { title: 'Faculty',      path: '/admin/faculty' },
    ]},
    { title: 'Notices',         icon: <MdNotifications size={20} />, path: '/superadmin/notices' },
    { title: 'Settings',        icon: <MdSettings size={20} />,     path: '/superadmin/settings' },
  ],

  admin: [
    { title: 'Dashboard',          icon: <MdDashboard size={20} />,     path: '/admin/dashboard' },
    { title: 'Student Management', icon: <MdPeople size={20} />,        subItems: [
        { title: 'All Students', path: '/admin/students' },
        { title: 'Add Student',  path: '/admin/students/add' },
    ]},
    { title: 'Faculty Management', icon: <MdSchool size={20} />,        subItems: [
        { title: 'All Faculty', path: '/admin/faculty' },
        { title: 'Add Faculty', path: '/admin/faculty/add' },
    ]},
    { title: 'Academic',           icon: <MdClass size={20} />,         subItems: [
        { title: 'Timetable Management', path: '/admin/timetable' },
    ]},
    { title: 'Fee Management',     icon: <MdAttachMoney size={20} />,   subItems: [
        { title: 'Fee Structure', path: '/admin/fees/structure' },
        { title: 'Collect Fee',   path: '/admin/fees/collect' },
        { title: 'Due List',      path: '/admin/fees/due' },
    ]},
    { title: 'Transport',          icon: <MdDirectionsBus size={20} />, subItems: [
        { title: 'Transport Management', path: '/admin/transport' },
    ]},
    { title: 'Hostel',             icon: <MdHotel size={20} />,         subItems: [
        { title: 'Hostel Management', path: '/admin/hostel' },
    ]},
    { title: 'Notices',            icon: <MdNotifications size={20} />, path: '/admin/notices' },
    { title: 'Helpdesk',           icon: <MdFeedback size={20} />,      path: '/admin/helpdesk' },
    { title: 'Documents',          icon: <MdBook size={20} />,          path: '/admin/document-requests' },
    { title: 'Complaints',         icon: <MdReport size={20} />,        path: '/admin/complaints' },
    { title: 'Applications',       icon: <MdPeople size={20} />,        path: '/admin/applications' },
    { title: 'Reports',            icon: <MdBarChart size={20} />,      path: '/admin/reports' },
    { title: 'Settings',           icon: <MdSettings size={20} />,      path: '/admin/settings' },
  ],

  teacher: [
    { title: 'Dashboard',      icon: <MdDashboard size={20} />,    path: '/teacher/dashboard' },
    { title: 'Attendance',     icon: <MdCalendarToday size={20} />, subItems: [
        { title: 'Mark Attendance',     path: '/teacher/attendance/mark' },
        { title: 'Attendance History',  path: '/teacher/attendance/history' },
    ]},
    { title: 'Assignments',    icon: <MdAssignment size={20} />,   subItems: [
        { title: 'Create Assignment', path: '/teacher/assignments/create' },
        { title: 'Assignments',       path: '/teacher/assignments' },
    ]},
    { title: 'Marks & Results', icon: <MdGrade size={20} />,       subItems: [
        { title: 'Enter Marks', path: '/teacher/marks' },
    ]},
    { title: 'Timetable',      icon: <MdSchedule size={20} />,     path: '/teacher/classes' },
    { title: 'My Profile',     icon: <MdAccountCircle size={20} />, path: '/teacher/profile' },
    { title: 'Notices',        icon: <MdNotifications size={20} />, path: '/teacher/notices' },
    { title: 'Feedback',       icon: <MdFeedback size={20} />,     path: '/teacher/feedback' },
    { title: 'Helpdesk',       icon: <MdFeedback size={20} />,     path: '/teacher/helpdesk' },
    { title: 'Complaints',     icon: <MdReport size={20} />,       path: '/teacher/complaints' },
    { title: 'Settings',       icon: <MdSettings size={20} />,     path: '/teacher/settings' },
  ],

  student: [
    { title: 'Dashboard',     icon: <MdDashboard size={20} />,    path: '/student/dashboard' },
    { title: 'My Profile',    icon: <MdPeople size={20} />,       path: '/student/profile' },
    { title: 'Attendance',    icon: <MdCalendarToday size={20} />, path: '/student/attendance' },
    { title: 'Results & Marks', icon: <MdGrade size={20} />,      subItems: [] },
    { title: 'Assignments',   icon: <MdAssignment size={20} />,   path: '/student/assignments' },
    { title: 'Fee Status',    icon: <MdAttachMoney size={20} />,  path: '/student/fees' },
    { title: 'Notices',       icon: <MdNotifications size={20} />, path: '/student/notices' },
    { title: 'Feedback',      icon: <MdFeedback size={20} />,     path: '/student/feedback' },
    { title: 'Helpdesk',      icon: <MdFeedback size={20} />,     path: '/student/helpdesk' },
    { title: 'Documents',     icon: <MdBook size={20} />,         path: '/student/documents' },
    { title: 'Complaints',    icon: <MdReport size={20} />,       path: '/student/complaints' },
    { title: 'Settings',      icon: <MdSettings size={20} />,    path: '/student/settings' },
  ],

  accountant: [
    { title: 'Dashboard',     icon: <MdDashboard size={20} />,          path: '/accountant/dashboard' },
    { title: 'Fee Collection', icon: <MdAttachMoney size={20} />,       subItems: [
        { title: 'Collect Fee',      path: '/accountant/fees/collect' },
        { title: 'Search Student',   path: '/accountant/fees/search' },
    ]},
    { title: 'Fee Reports',    icon: <MdBarChart size={20} />,           subItems: [
        { title: 'Daily Collection', path: '/accountant/reports/daily' },
        { title: 'Monthly Report',   path: '/accountant/reports/monthly' },
        { title: 'Due List',         path: '/accountant/reports/due' },
    ]},
    { title: 'Salary',         icon: <MdAccountBalanceWallet size={20} />, subItems: [
        { title: 'Process Salary', path: '/accountant/salary/process' },
        { title: 'Salary Slips',   path: '/accountant/salary/slips' },
    ]},
    { title: 'Notices',        icon: <MdNotifications size={20} />,     path: '/accountant/notices' },
    { title: 'Settings',       icon: <MdSettings size={20} />,          path: '/accountant/settings' },
  ],

  librarian: [
    { title: 'Dashboard',      icon: <MdDashboard size={20} />,    path: '/librarian/dashboard' },
    { title: 'Book Inventory', icon: <MdLibraryBooks size={20} />, subItems: [
        { title: 'All Books', path: '/librarian/books' },
        { title: 'Add Book',  path: '/librarian/books/add' },
    ]},
    { title: 'Issue & Return', icon: <MdBook size={20} />,         subItems: [
        { title: 'Issue Book',  path: '/librarian/issue' },
        { title: 'Return Book', path: '/librarian/return' },
        { title: 'History',     path: '/librarian/history' },
    ]},
    { title: 'Fine Management', icon: <MdAttachMoney size={20} />, subItems: [
        { title: 'Pending Fines', path: '/librarian/fines/pending' },
        { title: 'Collect Fine',  path: '/librarian/fines/collect' },
    ]},
    { title: 'Notices',        icon: <MdNotifications size={20} />, path: '/librarian/notices' },
    { title: 'Settings',       icon: <MdSettings size={20} />,      path: '/librarian/settings' },
  ],

  parent: [
    { title: 'Dashboard',      icon: <MdDashboard size={20} />,    path: '/parent/dashboard' },
    { title: "Child's Profile", icon: <MdPeople size={20} />,      path: '/parent/profile' },
    { title: 'Attendance',     icon: <MdCalendarToday size={20} />, path: '/parent/attendance' },
    { title: 'Results',        icon: <MdGrade size={20} />,        path: '/parent/results' },
    { title: 'Fee Status',     icon: <MdAttachMoney size={20} />,  path: '/parent/fees' },
    { title: 'Notices',        icon: <MdNotifications size={20} />, path: '/parent/notices' },
    { title: 'Feedback',       icon: <MdFeedback size={20} />,     path: '/parent/feedback' },
    { title: 'Settings',       icon: <MdSettings size={20} />,     path: '/parent/settings' },
  ],
}

/* ─── Role label colours ──────────────────────────────────────── */
const roleBadge = {
  superadmin: 'bg-purple-500/20 text-purple-200',
  admin:      'bg-blue-500/20 text-blue-200',
  teacher:    'bg-emerald-500/20 text-emerald-200',
  student:    'bg-cyan-500/20 text-cyan-200',
  accountant: 'bg-amber-500/20 text-amber-200',
  librarian:  'bg-rose-500/20 text-rose-200',
  parent:     'bg-indigo-500/20 text-indigo-200',
}

/* ─── Component ───────────────────────────────────────────────── */
const Sidebar = () => {
  const navigate   = useNavigate()
  const location   = useLocation()
  const [isOpen, setIsOpen] = useState(true)
  const [openDropdowns, setOpenDropdowns] = useState({})

  const user = JSON.parse(localStorage.getItem('user'))
  const role = localStorage.getItem('role')
  const menuItems = menuConfig[role] || []

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const toggleDropdown = (title) => {
    setOpenDropdowns(prev => ({ ...prev, [title]: !prev[title] }))
  }

  const isActive       = (path)      => location.pathname === path
  const isParentActive = (subItems)  => subItems?.some(i => location.pathname === i.path)

  const initials = (name = '') =>
    name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'

  return (
    <aside
      className={`${isOpen ? 'w-64' : 'w-[68px]'} flex-shrink-0 flex flex-col min-h-screen transition-all duration-300 ease-in-out relative`}
      style={{
        background: 'linear-gradient(180deg, #1e1b4b 0%, #1e3a8a 55%, #075985 100%)',
        boxShadow: '4px 0 24px rgba(30,27,75,.25)',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className={`flex items-center h-16 px-4 border-b border-white/10 flex-shrink-0 ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen && (
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Logo circle */}
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#818cf8,#38bdf8)' }}>
              <span className="text-white font-black text-sm">U</span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate">University</p>
              <p className="text-indigo-300 text-[10px] leading-tight">Student Portal</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-indigo-300 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          {isOpen ? <MdChevronLeft size={20} /> : <MdMenu size={20} />}
        </button>
      </div>

      {/* ── User Card ──────────────────────────────────────────── */}
      {isOpen ? (
        <div className="mx-3 mt-3 mb-1 p-3 rounded-xl bg-white/8 border border-white/10 flex items-center gap-3">
          {user?.profileImage ? (
            <img src={user.profileImage} alt={user?.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20" />
          ) : (
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#818cf8,#38bdf8)' }}>
              {initials(user?.name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold leading-tight truncate">{user?.name || 'User'}</p>
            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${roleBadge[role] || 'bg-white/10 text-white/70'}`}>
              {role}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex justify-center mt-3 mb-1">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg,#818cf8,#38bdf8)' }}>
            {initials(user?.name)}
          </div>
        </div>
      )}

      {/* ── Nav ────────────────────────────────────────────────── */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const active      = isActive(item.path) || isParentActive(item.subItems)
          const hasSubItems = item.subItems && item.subItems.length > 0
          const isExpanded  = openDropdowns[item.title]

          return (
            <div key={item.title}>
              <button
                title={!isOpen ? item.title : undefined}
                onClick={() => {
                  if (hasSubItems) {
                    if (isOpen) toggleDropdown(item.title)
                  } else if (item.path) {
                    navigate(item.path)
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-200 relative group
                  ${active
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-indigo-200 hover:bg-white/8 hover:text-white'
                  }`}
              >
                {/* Active left accent bar */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-cyan-400" />
                )}

                <span className={`flex-shrink-0 ${active ? 'text-cyan-300' : ''}`}>
                  {item.icon}
                </span>

                {isOpen && (
                  <>
                    <span className="flex-1 text-sm font-medium text-left leading-tight">{item.title}</span>
                    {hasSubItems && (
                      <span className="text-indigo-400">
                        {isExpanded ? <MdExpandLess size={17} /> : <MdExpandMore size={17} />}
                      </span>
                    )}
                  </>
                )}
              </button>

              {/* Sub items */}
              {isOpen && hasSubItems && isExpanded && (
                <div className="ml-4 mb-1 border-l border-white/10 pl-3">
                  {item.subItems.map((sub) => (
                    <button
                      key={sub.path}
                      onClick={() => navigate(sub.path)}
                      className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg mb-0.5 text-sm transition-all duration-200
                        ${isActive(sub.path)
                          ? 'bg-cyan-500/20 text-cyan-200 font-semibold'
                          : 'text-indigo-300 hover:bg-white/8 hover:text-white'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive(sub.path) ? 'bg-cyan-400' : 'bg-indigo-400'}`} />
                      {sub.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* ── Logout ─────────────────────────────────────────────── */}
      <div className="px-2 pb-4 pt-2 border-t border-white/10">
        <button
          onClick={handleLogout}
          title={!isOpen ? 'Logout' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-indigo-300 hover:bg-red-500/15 hover:text-red-300 transition-all duration-200 group"
        >
          <MdLogout size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
          {isOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
