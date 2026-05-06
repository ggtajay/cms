import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import Sidebar from './Sidebar'

const ParentPortal = ({ title, subtitle, mode }) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadChildren = async () => {
      try {
        const res = await axios.get('/api/students/linked-children', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setChildren(res.data.children || [])
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load linked children')
      } finally {
        setLoading(false)
      }
    }

    loadChildren()
  }, [token])

  const renderDetails = (child) => {
    if (mode === 'profile') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
          <div><strong>Course:</strong> {child.course}</div>
          <div><strong>Department:</strong> {child.department}</div>
          <div><strong>Semester:</strong> {child.semester}</div>
          <div><strong>Section:</strong> {child.section}</div>
          <div><strong>Roll Number:</strong> {child.rollNumber}</div>
          <div><strong>Admission Status:</strong> {child.admissionStatus}</div>
        </div>
      )
    }

    if (mode === 'attendance') {
      return (
        <div className="text-sm text-slate-700 space-y-2">
          <p><strong>Total Records:</strong> {child.attendanceSummary.total}</p>
          <p><strong>Present:</strong> {child.attendanceSummary.present}</p>
          <p><strong>Attendance Percentage:</strong> {child.attendanceSummary.percentage}%</p>
        </div>
      )
    }

    if (mode === 'fees') {
      return (
        <div className="text-sm text-slate-700 space-y-2">
          <p><strong>Total Fees:</strong> Rs. {child.feeSummary.total}</p>
          <p><strong>Total Paid:</strong> Rs. {child.feeSummary.paid}</p>
          <p><strong>Total Due:</strong> Rs. {child.feeSummary.due}</p>
          <p><strong>Student Fee Status:</strong> {child.feeStatus}</p>
        </div>
      )
    }

    if (mode === 'results') {
      return (
        <div className="text-sm text-slate-600">
          Result publishing is not connected yet, but this page is ready for the exam module.
        </div>
      )
    }

    return (
      <div className="text-sm text-slate-700 space-y-2">
        <p><strong>Course:</strong> {child.course}</p>
        <p><strong>Attendance:</strong> {child.attendanceSummary.percentage}%</p>
        <p><strong>Fee Due:</strong> Rs. {child.feeSummary.due}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <p className="text-sm text-slate-500">Signed in as</p>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{user?.name}</h2>
            <p className="text-sm text-slate-600 mt-1">{user?.email}</p>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
              Loading linked children...
            </div>
          ) : children.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
              No child is currently linked to this parent account. Link by matching parent email or phone.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {children.map((child) => (
                <div key={child._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{child.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {child.rollNumber} • Semester {child.semester}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {child.course}
                    </span>
                  </div>

                  <div className="mt-5">
                    {renderDetails(child)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ParentPortal
