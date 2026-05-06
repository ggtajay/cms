/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdCalendarMonth } from 'react-icons/md'

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  const config = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await axios.get('/api/timetable/student', config)
        setTimetable(res.data)
      } catch (error) {
        toast.error('Failed to fetch your timetable')
      } finally {
        setLoading(false)
      }
    }
    fetchTimetable()
  }, [])

  // Group by day for the grid view
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const timeSlots = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00', 
    '12:00-13:00', '13:00-14:00', '14:00-15:00', 
    '15:00-16:00', '16:00-17:00'
  ]

  const getSlot = (day, time) => {
    return timetable.find((t) => t.day === day && t.timeSlot === time)
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MdCalendarMonth className="text-blue-600" /> My Class Schedule
          </h1>
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 w-9 h-9 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{user?.name?.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
            
            {loading ? (
              <div className="text-center p-10 text-gray-500">Loading schedule...</div>
            ) : timetable.length === 0 ? (
              <div className="text-center p-12 text-gray-500">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MdCalendarMonth size={24} className="text-gray-400" />
                </div>
                <p>No classes scheduled for you currently.</p>
              </div>
            ) : (
              <table className="min-w-full text-center border-collapse">
                <thead>
                  <tr>
                    <th className="border p-3 bg-gray-50 text-gray-600 font-semibold w-24">Time / Day</th>
                    {days.map((day) => (
                      <th key={day} className="border p-3 bg-gray-50 text-gray-600 font-semibold min-w-[140px]">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time) => (
                    <tr key={time} className="hover:bg-gray-50/50">
                      <td className="border p-3 font-semibold text-gray-600 whitespace-nowrap">{time}</td>
                      {days.map((day) => {
                        const slot = getSlot(day, time)
                        return (
                          <td key={`${day}-${time}`} className={`border p-2 ${slot ? 'bg-blue-50/50' : ''}`}>
                            {slot ? (
                              <div className="flex flex-col items-center justify-center h-full">
                                <span className="font-bold text-blue-700 block text-sm">{slot.subject}</span>
                                <span className="text-xs text-gray-600 mt-1 block">Room: {slot.room || 'TBA'}</span>
                                <span className="text-[10px] text-gray-500 mt-1 block px-2 py-0.5 bg-blue-100 rounded-full">
                                  {slot.teacher?.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-300 text-xs">-</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentTimetable
