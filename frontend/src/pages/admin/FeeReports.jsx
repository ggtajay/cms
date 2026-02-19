import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdBarChart, MdAttachMoney, MdReceipt } from 'react-icons/md'

const FeeReports = () => {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  const fetchReport = async () => {
    setLoading(true)
    try {
      const params = dateRange.startDate && dateRange.endDate
        ? `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
        : ''
      
      const res = await axios.get(
        `http://localhost:5000/api/fees/reports/collection${params}`,
        config
      )
      setReportData(res.data)
    } catch (error) {
      toast.error('Failed to fetch report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  const onChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value })
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Fee Collection Reports</h1>
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
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Date Range Filter</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={onChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={onChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <button
                onClick={fetchReport}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Generate Report'}
              </button>
            </div>
          </div>

          {/* Summary */}
          {reportData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <MdAttachMoney size={32} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Collection</p>
                      <p className="text-3xl font-bold text-green-600">
                        ₹{reportData.totalCollection.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <MdReceipt size={32} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Transactions</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {reportData.count}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-3 rounded-xl">
                      <MdBarChart size={32} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Average Payment</p>
                      <p className="text-3xl font-bold text-purple-600">
                        ₹{reportData.count > 0 
                          ? Math.round(reportData.totalCollection / reportData.count).toLocaleString()
                          : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-bold text-gray-800">Payment Transactions</h3>
                </div>

                {reportData.payments.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <MdReceipt size={48} className="mx-auto mb-3 opacity-30" />
                    <p>No transactions in this period</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Student</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Mode</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {reportData.payments.map((payment, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(payment.paymentDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-800">
                                  {payment.student?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {payment.student?.rollNumber}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                              {payment.feeType}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-green-600">
                              ₹{payment.amount}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 uppercase">
                              {payment.paymentMode}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {payment.transactionId || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default FeeReports