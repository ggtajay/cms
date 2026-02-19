import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdAttachMoney, MdWarning } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

const FeeDueList = () => {
  const [dueList, setDueList] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  useEffect(() => {
    const fetchDueList = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/fees/due-list', config)
        setDueList(res.data)
      } catch (error) {
        toast.error('Failed to fetch due list')
      } finally {
        setLoading(false)
      }
    }
    fetchDueList()
  }, [])

  const totalDue = dueList.reduce((sum, fee) => sum + fee.dueAmount, 0)

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Fee Due List</h1>
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
          {/* Summary Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-4 rounded-xl">
                  <MdWarning size={32} className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Outstanding</p>
                  <p className="text-3xl font-bold text-red-600">₹{totalDue.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Students with Dues</p>
                <p className="text-3xl font-bold text-gray-800">{dueList.length}</p>
              </div>
            </div>
          </div>

          {/* Due List Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <MdAttachMoney className="text-red-600" />
                Pending & Partial Payments
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : dueList.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MdAttachMoney size={48} className="mx-auto mb-3 opacity-30" />
                <p>No pending dues! 🎉</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Course</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Paid</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Due</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dueList.map((fee, index) => {
                      const isOverdue = new Date(fee.dueDate) < new Date()
                      return (
                        <tr key={fee._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {fee.student?.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {fee.student?.rollNumber}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {fee.student?.course} - Sem {fee.student?.semester}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                            {fee.feeType}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">
                            ₹{fee.totalAmount}
                          </td>
                          <td className="px-6 py-4 text-sm text-green-600 font-medium">
                            ₹{fee.paidAmount}
                          </td>
                          <td className="px-6 py-4 text-sm text-red-600 font-bold">
                            ₹{fee.dueAmount}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                              {new Date(fee.dueDate).toLocaleDateString()}
                            </span>
                            {isOverdue && (
                              <p className="text-xs text-red-500">Overdue!</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              fee.status === 'partial'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {fee.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
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

export default FeeDueList