import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'

const AccountantSearchStudent = () => {
  const token = localStorage.getItem('token')
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [selectedStudentFees, setSelectedStudentFees] = useState([])

  useEffect(() => {
    const loadStudents = async () => {
      const res = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudents(res.data)
    }

    loadStudents()
  }, [token])

  const filteredStudents = students.filter((student) =>
    [student.name, student.rollNumber, student.email]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const viewFees = async (studentId) => {
    const res = await axios.get(`/api/fees/student/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setSelectedStudentFees(res.data)
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-900">Search Student Fees</h1>
          <p className="text-sm text-slate-500 mt-1">
            Look up a student and review their fee records before collecting payment.
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 mb-5"
              placeholder="Search by name, roll number or email"
            />
            <div className="space-y-3">
              {filteredStudents.map((student) => (
                <button
                  key={student._id}
                  onClick={() => viewFees(student._id)}
                  className="w-full text-left border border-slate-200 rounded-2xl p-4 hover:border-slate-300"
                >
                  <h3 className="font-semibold text-slate-900">{student.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {student.rollNumber} • {student.course} • Semester {student.semester}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900">Fee Records</h2>
            <div className="mt-4 space-y-3">
              {selectedStudentFees.length === 0 ? (
                <p className="text-sm text-slate-500">Select a student to see fee records.</p>
              ) : (
                selectedStudentFees.map((fee) => (
                  <div key={fee._id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="font-semibold text-slate-900 capitalize">{fee.feeType}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Paid: Rs. {fee.paidAmount} / Rs. {fee.totalAmount}
                    </p>
                    <p className="text-sm text-slate-600">Due: Rs. {fee.dueAmount}</p>
                    <p className="text-xs text-slate-500 mt-2 capitalize">{fee.status}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountantSearchStudent
