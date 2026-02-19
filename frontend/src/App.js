import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import SuperAdminDashboard from './pages/superadmin/Dashboard'
import CreateAdmin from './pages/superadmin/CreateAdmin'
import AdminDashboard from './pages/admin/Dashboard'
import AllUsers from './pages/superadmin/AllUsers'
import AddStudent from './pages/admin/AddStudent'
import StudentDashboard from './pages/student/Dashboard'
import AllStudents from './pages/admin/AllStudents'
import ViewStudent from './pages/admin/ViewStudent'
import EditStudent from './pages/admin/EditStudent'
import TeacherDashboard from './pages/teacher/Dashboard'
import MarkAttendance from './pages/teacher/MarkAttendance'
import StudentAttendance from './pages/student/Attendance'
import AddFaculty from './pages/admin/AddFaculty'
import AllFaculty from './pages/admin/AllFaculty'
import CollectFee from './pages/admin/CollectFee'
import CreateFee from './pages/admin/CreateFee'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (!token) {
    return <Navigate to="/login" />
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/login" />
  }

  return children
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

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
    path="/teacher/dashboard"
    element={
     <ProtectedRoute allowedRole="teacher">
      <TeacherDashboard />
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

{/* Default Route */}
  <Route path="/" element={<Navigate to="/login" />} />
  <Route path="*" element={<Navigate to="/login" />} />
  </Routes>
  </Router>
  )
}

export default App