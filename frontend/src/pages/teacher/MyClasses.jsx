import React from 'react'
import Sidebar from '../../components/Sidebar'
import { MdSchedule, MdClass, MdPeople } from 'react-icons/md'

const MyClasses = () => {
  const user = JSON.parse(localStorage.getItem('user'))

  // Sample timetable data (in production, fetch from backend)
  const timetable = [
    { day: 'Monday', slots: [
      { time: '9:00-10:00', subject: 'Data Structures', class: 'BTech Sem 3 A', room: 'Lab 1' },
      { time: '11:00-12:00', subject: 'Algorithms', class: 'BTech Sem 5 A', room: 'Room 201' },
      { time: '2:00-3:00', subject: 'Database Systems', class: 'BTech Sem 3 B', room: 'Room 105' }
    ]},
    { day: 'Tuesday', slots: [
      { time: '10:00-11:00', subject: 'Data Structures', class: 'BTech Sem 3 A', room: 'Room 202' },
      { time: '1:00-2:00', subject: 'Algorithms', class: 'BTech Sem 5 A', room: 'Room 203' }
    ]},
    { day: 'Wednesday', slots: [
      { time: '9:00-10:00', subject: 'Database Systems', class: 'BTech Sem 3 B', room: 'Lab 2' },
      { time: '12:00-1:00', subject: 'Data Structures', class: 'BTech Sem 3 A', room: 'Room 201' }
    ]},
    { day: 'Thursday', slots: [
      { time: '11:00-12:00', subject: 'Algorithms', class: 'BTech Sem 5 A', room: 'Room 201' },
      { time: '2:00-3:00', subject: 'Data Structures', class: 'BTech Sem 3 A', room: 'Lab 1' }
    ]},
    { day: 'Friday', slots: [
      { time: '10:00-11:00', subject: 'Database Systems', class: 'BTech Sem 3 B', room: 'Room 105' },
      { time: '1:00-2:00', subject: 'Algorithms', class: 'BTech Sem 5 A', room: 'Room 203' }
    ]}
  ]

  const myClasses = [
    { name: 'BTech Sem 3 A', subject: 'Data Structures', students: 45, schedule: 'Mon, Wed, Thu' },
    { name: 'BTech Sem 5 A', subject: 'Algorithms', students: 38, schedule: 'Mon, Tue, Thu, Fri' },
    { name: 'BTech Sem 3 B', subject: 'Database Systems', students: 42, schedule: 'Mon, Wed, Fri' }
  ]

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const todaySchedule = timetable.find(t => t.day === today)

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">My Classes & Timetable</h1>
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

        <div className="p-6">
          {/* Today's Schedule */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 mb-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Today's Schedule - {today}</h2>
            {todaySchedule && todaySchedule.slots.length > 0 ? (
              <div className="space-y-3 mt-4">
                {todaySchedule.slots.map((slot, index) => (
                  <div key={index} className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg">{slot.subject}</p>
                        <p className="text-sm opacity-90">{slot.class}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{slot.time}</p>
                        <p className="text-sm opacity-90">{slot.room}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white opacity-75 mt-4">No classes scheduled for today</p>
            )}
          </div>

          {/* My Classes */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MdClass className="text-blue-600" />
              My Classes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {myClasses.map((cls, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <MdClass className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{cls.subject}</h4>
                      <p className="text-sm text-gray-500">{cls.name}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Students:</span>
                      <span className="font-medium">{cls.students}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Schedule:</span>
                      <span className="font-medium text-xs">{cls.schedule}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Timetable */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MdSchedule className="text-blue-600" />
              Weekly Timetable
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Day</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Schedule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {timetable.map((day) => (
                    <tr key={day.day} className={`hover:bg-gray-50 ${day.day === today ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-4">
                        <p className="font-bold text-gray-800">{day.day}</p>
                        {day.day === today && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Today</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {day.slots.length > 0 ? (
                          <div className="space-y-2">
                            {day.slots.map((slot, index) => (
                              <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                                <div>
                                  <p className="font-medium text-gray-800">{slot.subject}</p>
                                  <p className="text-xs text-gray-500">{slot.class}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-700">{slot.time}</p>
                                  <p className="text-xs text-gray-500">{slot.room}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">No classes</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyClasses