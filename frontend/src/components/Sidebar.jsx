import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  MdDashboard,
  MdPeople,
  MdSchool,
  MdSettings,
  MdLogout,
  MdMenu,
  MdClose,
  MdBook,
  MdAssignment,
  MdExpandMore,
  MdExpandLess,
  MdBarChart,
  MdNotifications,
  MdClass,
  MdAttachMoney,
  MdLibraryBooks,
  MdDirectionsBus,
  MdHotel,
  MdPersonAdd,
  MdCalendarToday,
  MdGrade,
  MdFeedback,
  MdAccountBalanceWallet,
} from 'react-icons/md'

// Menu items per role
const menuConfig = {
  superadmin: [
    {
      title: 'Dashboard',
      icon: <MdDashboard size={20} />,
      path: '/superadmin/dashboard'
    },
    {
      title: 'User Management',
      icon: <MdPeople size={20} />,
      subItems: [
        { title: 'All Users', path: '/superadmin/users' },
        { title: 'Create User', path: '/superadmin/users/create-admin' },
        { title: 'Roles & Permissions', path: '/superadmin/users/roles' },
      ]
    },
    {
      title: 'College Setup',
      icon: <MdSchool size={20} />,
      subItems: [
        { title: 'College Profile', path: '/superadmin/college/profile' },
        { title: 'Branding', path: '/superadmin/college/branding' },
        { title: 'Academic Year', path: '/superadmin/college/academic-year' },
      ]
    },
    {
      title: 'Academic Setup',
      icon: <MdClass size={20} />,
      subItems: [
        { title: 'Departments', path: '/superadmin/academic/departments' },
        { title: 'Courses', path: '/superadmin/academic/courses' },
        { title: 'Subjects', path: '/superadmin/academic/subjects' },
      ]
    },
    {
      title: 'Reports',
      icon: <MdBarChart size={20} />,
      subItems: [
        { title: 'Global Analytics', path: '/superadmin/reports/analytics' },
        { title: 'Activity Logs', path: '/superadmin/reports/logs' },
      ]
    },
    {
      title: 'Notices',
      icon: <MdNotifications size={20} />,
      path: '/superadmin/notices'
    },
    {
      title: 'Settings',
      icon: <MdSettings size={20} />,
      path: '/superadmin/settings'
    },
  ],

  admin: [
    {
      title: 'Dashboard',
      icon: <MdDashboard size={20} />,
      path: '/admin/dashboard'
    },
    {
      title: 'Student Management',
      icon: <MdPeople size={20} />,
      subItems: [
        { title: 'All Students', path: '/admin/students' },
        { title: 'Add Student', path: '/admin/students/add' },
        { title: 'Admissions', path: '/admin/students/admissions' },
      ]
    },
    {
      title: 'Faculty Management',
      icon: <MdSchool size={20} />,
      subItems: [
        { title: 'All Faculty', path: '/admin/faculty' },
        { title: 'Add Faculty', path: '/admin/faculty/add' },
      ]
    },
    {
      title: 'Academic',
      icon: <MdClass size={20} />,
      subItems: [
        { title: 'Classes & Sections', path: '/admin/academic/classes' },
        { title: 'Timetable', path: '/admin/academic/timetable' },
        { title: 'Syllabus', path: '/admin/academic/syllabus' },
      ]
    },
    {
      title: 'Fee Management',
      icon: <MdAttachMoney size={20} />,
      subItems: [
        { title: 'Fee Structure', path: '/admin/fees/structure' },
        { title: 'Collect Fee', path: '/admin/fees/collect' },
        { title: 'Due List', path: '/admin/fees/due' },
      ]
    },
    {
      title: 'Transport',
      icon: <MdDirectionsBus size={20} />,
      subItems: [
        { title: 'Routes', path: '/admin/transport/routes' },
        { title: 'Vehicles', path: '/admin/transport/vehicles' },
      ]
    },
    {
      title: 'Hostel',
      icon: <MdHotel size={20} />,
      subItems: [
        { title: 'Rooms', path: '/admin/hostel/rooms' },
        { title: 'Allotments', path: '/admin/hostel/allotments' },
      ]
    },
    {
      title: 'Notices',
      icon: <MdNotifications size={20} />,
      path: '/admin/notices'
    },
    {
      title: 'Reports',
      icon: <MdBarChart size={20} />,
      path: '/admin/reports'
    },
  ],

  teacher: [
    {
      title: 'Dashboard',
      icon: <MdDashboard size={20} />,
      path: '/teacher/dashboard'
    },
    {
      title: 'Attendance',
      icon: <MdCalendarToday size={20} />,
      subItems: [
        { title: 'Mark Attendance', path: '/teacher/attendance/mark' },
        { title: 'Attendance History', path: '/teacher/attendance/history' },
      ]
    },
    {
      title: 'Assignments',
      icon: <MdAssignment size={20} />,
      subItems: [
        { title: 'Create Assignment', path: '/teacher/assignments/create' },
        { title: 'View Submissions', path: '/teacher/assignments/submissions' },
      ]
    },
    {
      title: 'Marks & Results',
      icon: <MdGrade size={20} />,
      subItems: [
        { title: 'Enter Marks', path: '/teacher/marks/enter' },
        { title: 'View Results', path: '/teacher/marks/results' },
      ]
    },
    {
      title: 'Lesson Plans',
      icon: <MdBook size={20} />,
      path: '/teacher/lesson-plans'
    },
    {
      title: 'Timetable',
      icon: <MdCalendarToday size={20} />,
      path: '/teacher/timetable'
    },
    {
      title: 'Notices',
      icon: <MdNotifications size={20} />,
      path: '/teacher/notices'
    },
    {
      title: 'Feedback',
      icon: <MdFeedback size={20} />,
      path: '/teacher/feedback'
    },
  ],

  student: [
    {
      title: 'Dashboard',
      icon: <MdDashboard size={20} />,
      path: '/student/dashboard'
    },
    {
      title: 'My Profile',
      icon: <MdPeople size={20} />,
      path: '/student/profile'
    },
    {
      title: 'Attendance',
      icon: <MdCalendarToday size={20} />,
      path: '/student/attendance'
    },
    {
      title: 'Results & Marks',
      icon: <MdGrade size={20} />,
      subItems: [
        { title: 'Exam Results', path: '/student/results' },
        { title: 'Internal Marks', path: '/student/marks' },
      ]
    },
    {
      title: 'Assignments',
      icon: <MdAssignment size={20} />,
      subItems: [
        { title: 'View Assignments', path: '/student/assignments' },
        { title: 'Submit Assignment', path: '/student/assignments/submit' },
      ]
    },
    {
      title: 'Fee Status',
      icon: <MdAttachMoney size={20} />,
      path: '/student/fees'
    },
    {
      title: 'Timetable',
      icon: <MdCalendarToday size={20} />,
      path: '/student/timetable'
    },
    {
      title: 'Library',
      icon: <MdLibraryBooks size={20} />,
      path: '/student/library'
    },
    {
      title: 'Notices',
      icon: <MdNotifications size={20} />,
      path: '/student/notices'
    },
    {
      title: 'Feedback',
      icon: <MdFeedback size={20} />,
      path: '/student/feedback'
    },
  ],

  accountant: [
    {
      title: 'Dashboard',
      icon: <MdDashboard size={20} />,
      path: '/accountant/dashboard'
    },
    {
      title: 'Fee Collection',
      icon: <MdAttachMoney size={20} />,
      subItems: [
        { title: 'Collect Fee', path: '/accountant/fees/collect' },
        { title: 'Search Student', path: '/accountant/fees/search' },
      ]
    },
    {
      title: 'Fee Reports',
      icon: <MdBarChart size={20} />,
      subItems: [
        { title: 'Daily Collection', path: '/accountant/reports/daily' },
        { title: 'Monthly Report', path: '/accountant/reports/monthly' },
        { title: 'Due List', path: '/accountant/reports/due' },
      ]
    },
    {
      title: 'Salary',
      icon: <MdAccountBalanceWallet size={20} />,
      subItems: [
        { title: 'Process Salary', path: '/accountant/salary/process' },
        { title: 'Salary Slips', path: '/accountant/salary/slips' },
      ]
    },
    {
      title: 'Notices',
      icon: <MdNotifications size={20} />,
      path: '/accountant/notices'
    },
  ],

  librarian: [
    {
      title: 'Dashboard',
      icon: <MdDashboard size={20} />,
      path: '/librarian/dashboard'
    },
    {
      title: 'Book Inventory',
      icon: <MdLibraryBooks size={20} />,
      subItems: [
        { title: 'All Books', path: '/librarian/books' },
        { title: 'Add Book', path: '/librarian/books/add' },
      ]
    },
    {
      title: 'Issue & Return',
      icon: <MdBook size={20} />,
      subItems: [
        { title: 'Issue Book', path: '/librarian/issue' },
        { title: 'Return Book', path: '/librarian/return' },
        { title: 'History', path: '/librarian/history' },
      ]
    },
    {
      title: 'Fine Management',
      icon: <MdAttachMoney size={20} />,
      subItems: [
        { title: 'Pending Fines', path: '/librarian/fines/pending' },
        { title: 'Collect Fine', path: '/librarian/fines/collect' },
      ]
    },
    {
      title: 'Notices',
      icon: <MdNotifications size={20} />,
      path: '/librarian/notices'
    },
  ],

  parent: [
    {
      title: 'Dashboard',
      icon: <MdDashboard size={20} />,
      path: '/parent/dashboard'
    },
    {
      title: "Child's Profile",
      icon: <MdPeople size={20} />,
      path: '/parent/profile'
    },
    {
      title: 'Attendance',
      icon: <MdCalendarToday size={20} />,
      path: '/parent/attendance'
    },
    {
      title: 'Results',
      icon: <MdGrade size={20} />,
      path: '/parent/results'
    },
    {
      title: 'Fee Status',
      icon: <MdAttachMoney size={20} />,
      path: '/parent/fees'
    },
    {
      title: 'Notices',
      icon: <MdNotifications size={20} />,
      path: '/parent/notices'
    },
    {
      title: 'Feedback',
      icon: <MdFeedback size={20} />,
      path: '/parent/feedback'
    },
  ],
}

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(true)
  const [openDropdowns, setOpenDropdowns] = useState({})
  const user = JSON.parse(localStorage.getItem('user'))
  const role = localStorage.getItem('role')

  // Get menu items based on role
  const menuItems = menuConfig[role] || []

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const toggleDropdown = (title) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  const isActive = (path) => location.pathname === path

  const isParentActive = (subItems) =>
    subItems?.some((item) => location.pathname === item.path)

  return (
    <div
      className={`${
        isOpen ? 'w-64' : 'w-16'
      } bg-blue-900 min-h-screen transition-all duration-300 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-700">
        {isOpen && (
          <span className="text-white font-bold text-lg">CMS Portal</span>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:text-blue-300"
        >
          {isOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
        </button>
      </div>

      {/* User Info */}
      {isOpen && (
        <div className="p-4 border-b border-blue-700">
          <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center mb-2">
            <span className="text-white font-bold text-lg">
              {user?.name?.charAt(0)}
            </span>
          </div>
          <p className="text-white font-medium text-sm">{user?.name}</p>
          <p className="text-blue-300 text-xs capitalize">{role}</p>
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 p-2 mt-2 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.title}>
            <button
              onClick={() => {
                if (item.subItems) {
                  if (isOpen) toggleDropdown(item.title)
                } else {
                  navigate(item.path)
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg mb-1 transition-all duration-200
                ${
                  isActive(item.path) || isParentActive(item.subItems)
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-200 hover:bg-blue-700 hover:text-white'
                }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {isOpen && (
                  <span className="text-sm font-medium">{item.title}</span>
                )}
              </div>
              {isOpen && item.subItems && (
                <span>
                  {openDropdowns[item.title] ? (
                    <MdExpandLess size={18} />
                  ) : (
                    <MdExpandMore size={18} />
                  )}
                </span>
              )}
            </button>

            {/* Sub Items */}
            {isOpen && item.subItems && openDropdowns[item.title] && (
              <div className="ml-4 mb-1">
                {item.subItems.map((sub) => (
                  <button
                    key={sub.path}
                    onClick={() => navigate(sub.path)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg mb-1 text-sm transition-all duration-200
                      ${
                        isActive(sub.path)
                          ? 'bg-blue-500 text-white'
                          : 'text-blue-300 hover:bg-blue-700 hover:text-white'
                      }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {sub.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-blue-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-blue-200 hover:bg-red-600 hover:text-white transition-all duration-200"
        >
          <MdLogout size={20} />
          {isOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar