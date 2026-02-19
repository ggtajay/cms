import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdAttachMoney, MdCheckCircle, MdWarning, MdReceipt } from 'react-icons/md'

const FeeStatus = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/fees/my-fees', config)
        setData(res.data)
      } catch (error) {
        toast.error('Failed to fetch fee details')
      } finally {
        setLoading(false)
      }
    }
    fetchFees()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading fee details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Fee Status</h1>
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <MdAttachMoney size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Fees</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{data?.summary?.totalFees || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-3 rounded-xl">
                  <MdCheckCircle size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Paid Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{data?.summary?.totalPaid || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-red-100 p-3 rounded-xl">
                  <MdWarning size={24} className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Amount</p>
                  <p className="text-2xl font-bold text-red-600">
                    ₹{data?.summary?.totalDue || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Records */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MdReceipt className="text-blue-600" />
              Fee Records
            </h3>

            {!data?.fees || data.fees.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MdAttachMoney size={48} className="mx-auto mb-3 opacity-30" />
                <p>No fee records yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.fees.map((fee) => (
                  <div key={fee._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-800 capitalize">
                          {fee.feeType} Fee
                        </h4>
                        <p className="text-sm text-gray-500">
                          Academic Year: {fee.academicYear}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        fee.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : fee.status === 'partial'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {fee.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="font-bold text-gray-800">₹{fee.totalAmount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Paid</p>
                        <p className="font-bold text-green-600">₹{fee.paidAmount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Due</p>
                        <p className="font-bold text-red-600">₹{fee.dueAmount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Due Date</p>
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(fee.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {fee.paymentHistory.length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Payment History
                        </p>
                        <div className="space-y-2">
                          {fee.paymentHistory.map((payment, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded"
                            >
                              <div>
                                <p className="font-medium text-gray-800">₹{payment.amount}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(payment.paymentDate).toLocaleDateString()} • {payment.paymentMode}
                                </p>
                              </div>
                              {payment.transactionId && (
                                <p className="text-xs text-gray-500">
                                  Txn: {payment.transactionId}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeeStatus