import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import LandingPage from './pages/LandingPage'
import Login from './pages/auth/Login'
import SuperAdminDashboard from './pages/superadmin/Dashboard'
import CreateAdmin from './pages/superadmin/CreateAdmin'
import AdminDashboard from './pages/admin/Dashboard'
import AllUsers from './pages/superadmin/AllUsers'
import AddStudent from './pages/admin/AddStudent'
import AccountantDashboard from './pages/accountant/Dashboard'
import AccountantSearchStudent from './pages/accountant/SearchStudent'
import AccountantSalaryProcess from './pages/accountant/SalaryProcess'
import AccountantSalarySlips from './pages/accountant/SalarySlips'
import StudentDashboard from './pages/student/Dashboard'
import StudentProfile from './pages/student/MyProfile'
import StudentFeedback from './pages/student/Feedback'
import AllStudents from './pages/admin/AllStudents'
import ViewStudent from './pages/admin/ViewStudent'
import EditStudent from './pages/admin/EditStudent'
import LibrarianDashboard from './pages/librarian/Dashboard'
import LibrarianAllBooks from './pages/librarian/AllBooks'
import LibrarianAddBook from './pages/librarian/AddBook'
import LibrarianIssueBook from './pages/librarian/IssueBook'
import LibrarianReturnBook from './pages/librarian/ReturnBook'
import LibrarianHistory from './pages/librarian/History'
import LibrarianPendingFines from './pages/librarian/PendingFines'
import LibrarianCollectFine from './pages/librarian/CollectFine'
import TeacherDashboard from './pages/teacher/Dashboard'
import TeacherFeedback from './pages/teacher/Feedback'
import MarkAttendance from './pages/teacher/MarkAttendance'
import StudentAttendance from './pages/student/Attendance'
import AddFaculty from './pages/admin/AddFaculty'
import AllFaculty from './pages/admin/AllFaculty'
import CollectFee from './pages/admin/CollectFee'
import CreateFee from './pages/admin/CreateFee'
import FeeDueList from './pages/admin/FeeDueList'
import FeeReports from './pages/admin/FeeReports'
import AdminHelpdesk from './pages/admin/Helpdesk'
import AdminDocumentRequests from './pages/admin/DocumentRequests'
import FeeStatus from './pages/student/FeeStatus'
import StudentHelpdesk from './pages/student/Helpdesk'
import StudentDocumentRequests from './pages/student/DocumentRequests'
import CreateNotice from './pages/admin/CreateNotice'
import Notices from './pages/admin/Notices'
import Applications from './pages/admin/Applications'
import WalkInAdmission from './pages/admin/WalkInAdmission'
import ParentDashboard from './pages/parent/Dashboard'
import ParentProfile from './pages/parent/Profile'
import ParentAttendance from './pages/parent/Attendance'
import ParentResults from './pages/parent/Results'
import ParentFees from './pages/parent/Fees'
import ParentFeedback from './pages/parent/Feedback'
import ViewFaculty from './pages/admin/ViewFaculty'
import EditFaculty from './pages/admin/EditFaculty'
import TeacherProfile from './pages/teacher/MyProfile'
import TransportManagement from './pages/admin/TransportManagement'
import HostelManagement from './pages/admin/HostelManagement'
import AttendanceHistory from './pages/teacher/AttendanceHistory'
import TeacherAssignments from './pages/teacher/Assignments'
import CreateAssignment from './pages/teacher/CreateAssignment'
import TeacherHelpdesk from './pages/teacher/Helpdesk'
import MyAssignments from './pages/student/MyAssignments'
import ViewAssignment from './pages/teacher/ViewAssignment'
import EnterMarks from './pages/teacher/EnterMarks'
import MyClasses from './pages/teacher/MyClasses'
import TimetableManagement from './pages/admin/TimetableManagement'
import CourseManagement from './pages/admin/CourseManagement'
import StudentIDCardPage from './pages/student/IDCardPage'
import TeacherIDCardPage from './pages/teacher/IDCardPage'
import StudentTimetable from './pages/student/Timetable'
import Onboarding from './pages/auth/Onboarding'
import StudentComplaints from './pages/student/Complaints'
import TeacherComplaints from './pages/teacher/Complaints'
import AdminComplaintManagement from './pages/admin/ComplaintManagement'

// Apply Portal & Auth Routes
import ApplyLanding from './pages/apply/ApplyLanding'
import RegularApplication from './pages/apply/RegularApplication'
import OnlineApplication from './pages/apply/OnlineApplication'
import TrackApplication from './pages/apply/TrackApplication'
import SetPassword from './pages/auth/SetPassword'

// Public Pages
import AboutPage from './pages/public/About'
import ProgramsPage from './pages/public/Programs'
import AdmissionsPage from './pages/public/Admissions'
import CampusLifePage from './pages/public/CampusLife'
import ContactPage from './pages/public/Contact'
import ResearchPage from './pages/public/Research'

// Settings Pages
import StudentSettings from './pages/student/Settings'
import TeacherSettings from './pages/teacher/Settings'
import AdminSettings from './pages/admin/Settings'
import SuperAdminSettings from './pages/superadmin/Settings'
import AccountantSettings from './pages/accountant/Settings'
import LibrarianSettings from './pages/librarian/Settings'
import ParentSettings from './pages/parent/Settings'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const user = JSON.parse(localStorage.getItem('user')) || {}
  const sendDebugLog = (hypothesisId, location, message, data = {}) => {
    // #region agent log
    fetch('http://127.0.0.1:7933/ingest/beab5d74-2c64-4e0b-9e7d-4886ce253ad4', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f4ed93' },
      body: JSON.stringify({
        sessionId: 'f4ed93',
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        runId: 'pre-fix',
        hypothesisId,
        location,
        message,
        data,
        timestamp: Date.now()
      })
    }).catch(() => {})
    // #endregion
  }

  sendDebugLog('H9', 'frontend/src/App.js:ProtectedRoute', 'ProtectedRoute evaluated', {
    path: window.location.pathname,
    hasToken: Boolean(token),
    role: role || null,
    profileCompletion: typeof user.profileCompletion === 'number' ? user.profileCompletion : null,
    allowedRole: allowedRole || null
  })

  if (!token) {
    sendDebugLog('H9', 'frontend/src/App.js:ProtectedRoute', 'Redirecting to login due to missing token', {
      path: window.location.pathname
    })
    return <Navigate to="/login" />
  }

  if (allowedRole && role !== allowedRole && role !== 'superadmin') {
    sendDebugLog('H9', 'frontend/src/App.js:ProtectedRoute', 'Redirecting to login due to role mismatch', {
      path: window.location.pathname,
      role: role || null,
      allowedRole
    })
    return <Navigate to="/login" />
  }

  // Intercept for First Login Onboarding
  if ((role === 'student' || role === 'teacher') && user.profileCompletion !== undefined && user.profileCompletion < 100) {
    // Only allow them to be on the onboarding route or profile route
    if (window.location.pathname !== '/onboarding') {
      sendDebugLog('H9', 'frontend/src/App.js:ProtectedRoute', 'Redirecting to onboarding due to incomplete profile', {
        path: window.location.pathname,
        role,
        profileCompletion: user.profileCompletion
      })
      return <Navigate to="/onboarding" />
    }
  }

  sendDebugLog('H9', 'frontend/src/App.js:ProtectedRoute', 'ProtectedRoute passed', {
    path: window.location.pathname
  })
  return children
}

function App() {
  return (
    <Router>
      {/* ScrollToTop resets window scroll position on every route change */}
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/set-password" element={<SetPassword />} />
        
        {/* Application Portal Routes */}
        <Route path="/apply" element={<ApplyLanding />} />
        <Route path="/apply/regular" element={<RegularApplication />} />
        <Route path="/apply/online" element={<OnlineApplication />} />
        <Route path="/apply/track" element={<TrackApplication />} />
        {/* Onboarding Route */}
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } 
        />

        {/* Super Admin Routes */}
        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute allowedRole="superadmin">
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/users/create-admin"
          element={
            <ProtectedRoute allowedRole="superadmin">
              <CreateAdmin />
            </ProtectedRoute>
          }
        />

        {/* All Pages Routes */}
        <Route
          path="/superadmin/users"
          element={
            <ProtectedRoute allowedRole="superadmin">
              <AllUsers />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute allowedRole="admin">
              <CourseManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute allowedRole="admin">
              <Applications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/applications/walk-in"
          element={
            <ProtectedRoute allowedRole="admin">
              <WalkInAdmission />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminComplaintManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/dashboard"
          element={
            <ProtectedRoute allowedRole="accountant">
              <AccountantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/dashboard"
          element={
            <ProtectedRoute allowedRole="librarian">
              <LibrarianDashboard />
            </ProtectedRoute>
          }
        />

        {/* Add Student Routes */}
        <Route
          path="/admin/students/add"
          element={
            <ProtectedRoute allowedRole="admin">
              <AddStudent />
            </ProtectedRoute>
          }
        />

        {/* Student Dashboard Page Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/id-card"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentIDCardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/timetable"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentTimetable />
            </ProtectedRoute>
          }
        />

        {/* Student Assignments Route */}
        <Route
          path="/student/assignments"
          element={
            <ProtectedRoute allowedRole="student">
              <MyAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/helpdesk"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentHelpdesk />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/feedback"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentFeedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/documents"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDocumentRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/complaints"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentComplaints />
            </ProtectedRoute>
          }
        />

        {/* All student Routes */}
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRole="admin">
              <AllStudents />
            </ProtectedRoute>
          }
        />

        {/* View Student Routes */}

        <Route
          path="/admin/students/view/:id"
          element={
            <ProtectedRoute allowedRole="admin">
              <ViewStudent />
            </ProtectedRoute>
          }
        />

        {/* Edit Student Page Routes */}
        <Route
          path="/admin/students/edit/:id"
          element={
            <ProtectedRoute allowedRole="admin">
              <EditStudent />
            </ProtectedRoute>
          }
        />

        {/* Teacher Dashboard Routes */}
        <Route
          path="/teacher/complaints"
          element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Teacher Assignments Routes */}
        <Route
          path="/teacher/assignments"
          element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/assignments/create"
          element={
            <ProtectedRoute allowedRole="teacher">
              <CreateAssignment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/helpdesk"
          element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherHelpdesk />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/feedback"
          element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherFeedback />
            </ProtectedRoute>
          }
        />

        {/* Teacher Attendance Routes */}
        <Route
          path="/teacher/attendance/mark"
          element={
            <ProtectedRoute allowedRole="teacher">
              <MarkAttendance />
            </ProtectedRoute>
          }
        />

        {/* Teacher Timetable / Classes */}
        <Route
          path="/teacher/classes"
          element={
            <ProtectedRoute allowedRole="teacher">
              <MyClasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/timetable"
          element={
            <ProtectedRoute allowedRole="teacher">
              <MyClasses />
            </ProtectedRoute>
          }
        />

        {/* Teacher Profile */}
        <Route
          path="/teacher/profile"
          element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/id-card"
          element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherIDCardPage />
            </ProtectedRoute>
          }
        />

        {/* Teacher Attendance History */}
        <Route
          path="/teacher/attendance/history"
          element={
            <ProtectedRoute allowedRole="teacher">
              <AttendanceHistory />
            </ProtectedRoute>
          }
        />

        {/* Teacher Enter Marks */}
        <Route
          path="/teacher/marks"
          element={
            <ProtectedRoute allowedRole="teacher">
              <EnterMarks />
            </ProtectedRoute>
          }
        />

        {/* Teacher View Assignment Submissions */}
        <Route
          path="/teacher/assignments/view/:id"
          element={
            <ProtectedRoute allowedRole="teacher">
              <ViewAssignment />
            </ProtectedRoute>
          }
        />



        {/* Student Attendance Routes */}
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentAttendance />
            </ProtectedRoute>
          }
        />

        {/* Adding Faculty Routes */}
        <Route
          path="/admin/faculty/add"
          element={
            <ProtectedRoute allowedRole="admin">
              <AddFaculty />
            </ProtectedRoute>
          }
        />

        {/* All Faculty Routes */}
        <Route
          path="/admin/faculty"
          element={
            <ProtectedRoute allowedRole="admin">
              <AllFaculty />
            </ProtectedRoute>
          }
        />

        {/* Fee Collection Routes */}
        <Route
          path="/admin/fees/collect"
          element={
            <ProtectedRoute allowedRole="admin">
              <CollectFee />
            </ProtectedRoute>
          }
        />

        {/* Create Fee Routes */}
        <Route
          path="/admin/fees/structure"
          element={
            <ProtectedRoute allowedRole="admin">
              <CreateFee />
            </ProtectedRoute>
          }
        />

        {/* FEE Reports Route Next 3 */}
        <Route
          path="/admin/fees/due"
          element={
            <ProtectedRoute allowedRole="admin">
              <FeeDueList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRole="admin">
              <FeeReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/helpdesk"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminHelpdesk />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/document-requests"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDocumentRequests />
            </ProtectedRoute>
          }
        />
        {/* Admin Timetable Management */}
        <Route
          path="/admin/timetable"
          element={
            <ProtectedRoute allowedRole="admin">
              <TimetableManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/fees"
          element={
            <ProtectedRoute allowedRole="student">
              <FeeStatus />
            </ProtectedRoute>
          }
        />

        {/* Create Notice Routes */}
        <Route
          path="/admin/notices"
          element={
            <ProtectedRoute allowedRole="admin">
              <Notices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notices/create"
          element={
            <ProtectedRoute allowedRole="admin">
              <CreateNotice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/notices"
          element={
            <ProtectedRoute allowedRole="superadmin">
              <Notices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/notices"
          element={
            <ProtectedRoute allowedRole="teacher">
              <Notices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/notices"
          element={
            <ProtectedRoute allowedRole="student">
              <Notices />
            </ProtectedRoute>
          }
        />

        {/* Parent Page Dashboard */}
        <Route
          path="/parent/dashboard"
          element={
            <ProtectedRoute allowedRole="parent">
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/profile"
          element={
            <ProtectedRoute allowedRole="parent">
              <ParentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/attendance"
          element={
            <ProtectedRoute allowedRole="parent">
              <ParentAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/results"
          element={
            <ProtectedRoute allowedRole="parent">
              <ParentResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/fees"
          element={
            <ProtectedRoute allowedRole="parent">
              <ParentFees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/feedback"
          element={
            <ProtectedRoute allowedRole="parent">
              <ParentFeedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/notices"
          element={
            <ProtectedRoute allowedRole="parent">
              <Notices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/fees/collect"
          element={
            <ProtectedRoute allowedRole="accountant">
              <CollectFee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/fees/search"
          element={
            <ProtectedRoute allowedRole="accountant">
              <AccountantSearchStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/reports/daily"
          element={
            <ProtectedRoute allowedRole="accountant">
              <FeeReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/reports/monthly"
          element={
            <ProtectedRoute allowedRole="accountant">
              <FeeReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/reports/due"
          element={
            <ProtectedRoute allowedRole="accountant">
              <FeeDueList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/salary/process"
          element={
            <ProtectedRoute allowedRole="accountant">
              <AccountantSalaryProcess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/salary/slips"
          element={
            <ProtectedRoute allowedRole="accountant">
              <AccountantSalarySlips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/notices"
          element={
            <ProtectedRoute allowedRole="accountant">
              <Notices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/books"
          element={
            <ProtectedRoute allowedRole="librarian">
              <LibrarianAllBooks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/books/add"
          element={
            <ProtectedRoute allowedRole="librarian">
              <LibrarianAddBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/issue"
          element={
            <ProtectedRoute allowedRole="librarian">
              <LibrarianIssueBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/return"
          element={
            <ProtectedRoute allowedRole="librarian">
              <LibrarianReturnBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/history"
          element={
            <ProtectedRoute allowedRole="librarian">
              <LibrarianHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/fines/pending"
          element={
            <ProtectedRoute allowedRole="librarian">
              <LibrarianPendingFines />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/fines/collect"
          element={
            <ProtectedRoute allowedRole="librarian">
              <LibrarianCollectFine />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/notices"
          element={
            <ProtectedRoute allowedRole="librarian">
              <Notices />
            </ProtectedRoute>
          }
        />

        {/* View Faculty Routes */}

        <Route
          path="/admin/faculty/view/:id"
          element={
            <ProtectedRoute allowedRole="admin">
              <ViewFaculty />
            </ProtectedRoute>
          }
        />

        {/* Edit Faculty Routes */}
        <Route
          path="/admin/faculty/edit/:id"
          element={
            <ProtectedRoute allowedRole="admin">
              <EditFaculty />
            </ProtectedRoute>
          }
        />

        {/* Transport Routes */}
        <Route
          path="/admin/transport"
          element={
            <ProtectedRoute allowedRole="admin">
              <TransportManagement />
            </ProtectedRoute>
          }
        />

        {/* Hostel Management Routes */}
        <Route
          path="/admin/hostel"
          element={
            <ProtectedRoute allowedRole="admin">
              <HostelManagement />
            </ProtectedRoute>
          }
        />

        {/* Public Pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/admissions" element={<AdmissionsPage />} />
        <Route path="/campus-life" element={<CampusLifePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/research" element={<ResearchPage />} />

        {/* Settings Routes */}
        <Route path="/student/settings" element={<ProtectedRoute allowedRole="student"><StudentSettings /></ProtectedRoute>} />
        <Route path="/teacher/settings" element={<ProtectedRoute allowedRole="teacher"><TeacherSettings /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRole="admin"><AdminSettings /></ProtectedRoute>} />
        <Route path="/superadmin/settings" element={<ProtectedRoute allowedRole="superadmin"><SuperAdminSettings /></ProtectedRoute>} />
        <Route path="/accountant/settings" element={<ProtectedRoute allowedRole="accountant"><AccountantSettings /></ProtectedRoute>} />
        <Route path="/librarian/settings" element={<ProtectedRoute allowedRole="librarian"><LibrarianSettings /></ProtectedRoute>} />
        <Route path="/parent/settings" element={<ProtectedRoute allowedRole="parent"><ParentSettings /></ProtectedRoute>} />

        {/* Default Route */}
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
