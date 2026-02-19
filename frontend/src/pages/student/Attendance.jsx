import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdCalendarToday, MdCheckCircle, MdCancel, MdAccessTime } from 'react-icons/md'

const StudentAttendance = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(
          'http://localhost:5000/api/attendance/my-attendance',
          config
        )
        setData(res.data)
      } catch (error) {
        toast.error('Failed to fetch attendance')
      } finally {
        setLoading(false)
      }
    }
    fetchAttendance()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading attendance...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">My Attendance</h1>
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 w-9 h-9 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {user?.name?.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {/* Overall Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Overall Attendance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MdCalendarToday size={32} className="text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {data?.overall?.percentage || 0}%
                </p>
                <p className="text-sm text-gray-500">Overall</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MdCheckCircle size={32} className="text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {data?.overall?.present || 0}
                </p>
                <p className="text-sm text-gray-500">Present</p>
              </div>
              <div className="text-center">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MdCancel size={32} className="text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-600">
                  {data?.overall?.total - data?.overall?.present || 0}
                </p>
                <p className="text-sm text-gray-500">Absent/Late</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MdCalendarToday size={32} className="text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  {data?.overall?.total || 0}
                </p>
                <p className="text-sm text-gray-500">Total Days</p>
              </div>
            </div>
          </div>

          {/* Subject-wise Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Subject-wise Attendance
            </h3>
            {data?.stats?.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MdCalendarToday size={48} className="mx-auto mb-3 opacity-30" />
                <p>No attendance records yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.stats?.map((stat) => (
                  <div
                    key={stat.subject}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-bold text-gray-800 mb-3">
                      {stat.subject}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Present:</span>
                        <span className="font-medium text-green-600">
                          {stat.present}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Absent:</span>
                        <span className="font-medium text-red-600">
                          {stat.absent}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Late:</span>
                        <span className="font-medium text-orange-600">
                          {stat.late}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total:</span>
                        <span className="font-medium text-gray-800">
                          {stat.total}
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">
                            Percentage:
                          </span>
                          <span
                            className={`text-lg font-bold ${
                              parseFloat(stat.percentage) >= 75
                                ? 'text-green-600'
                                : parseFloat(stat.percentage) >= 60
                                ? 'text-orange-600'
                                : 'text-red-600'
                            }`}
                          >
                            {stat.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Attendance Records */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-bold text-gray-800">Recent Records</h3>
            </div>
            {data?.attendance?.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MdCalendarToday size={48} className="mx-auto mb-3 opacity-30" />
                <p>No attendance records yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Subject
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Marked By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data?.attendance?.slice(0, 20).map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          {record.subject}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              record.status === 'present'
                                ? 'bg-green-100 text-green-700'
                                : record.status === 'late'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {record.markedBy?.name || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentAttendance