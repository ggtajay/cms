import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdAttachMoney, MdSearch, MdPerson } from 'react-icons/md'

const CollectFee = () => {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentFees, setStudentFees] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMode: 'cash',
    transactionId: '',
    remarks: ''
  })
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/students', config)
      setStudents(res.data.filter(s => s.admissionStatus === 'active'))
    } catch (error) {
      toast.error('Failed to fetch students')
    }
  }

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student)
    setLoading(true)
    try {
      const res = await axios.get(
        `http://localhost:5000/api/fees/student/${student._id}`,
        config
      )
      setStudentFees(res.data)
    } catch (error) {
      toast.error('Failed to fetch fee records')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (feeId) => {
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      await axios.post(
        `http://localhost:5000/api/fees/${feeId}/pay`,
        {
          amount: parseFloat(paymentData.amount),
          paymentMode: paymentData.paymentMode,
          transactionId: paymentData.transactionId,
          remarks: paymentData.remarks
        },
        config
      )
      toast.success('Payment collected successfully!')
      handleSelectStudent(selectedStudent)
      setPaymentData({
        amount: '',
        paymentMode: 'cash',
        transactionId: '',
        remarks: ''
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to collect payment')
    }
  }

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Collect Fee</h1>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Search */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MdPerson className="text-blue-600" />
                Select Student
              </h3>

              <div className="mb-4">
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
                  <MdSearch size={20} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredStudents.map((student) => (
                  <button
                    key={student._id}
                    onClick={() => handleSelectStudent(student)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selectedStudent?._id === student._id
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <p className="font-medium text-sm text-gray-800">
                      {student.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {student.rollNumber} • {student.course}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Fee Details */}
            <div className="lg:col-span-2">
              {selectedStudent ? (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {selectedStudent.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedStudent.rollNumber} • {selectedStudent.course} - Sem {selectedStudent.semester}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedStudent.feeStatus === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : selectedStudent.feeStatus === 'partial'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedStudent.feeStatus.toUpperCase()}
                    </span>
                  </div>

                  {loading ? (
                    <div className="text-center py-12 text-gray-400">
                      Loading fee records...
                    </div>
                  ) : studentFees.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <MdAttachMoney size={48} className="mx-auto mb-3 opacity-30" />
                      <p>No fee records found</p>
                      <p className="text-sm mt-1">Create a fee record first</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {studentFees.map((fee) => (
                        <div
                          key={fee._id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-gray-800 capitalize">
                                {fee.feeType} Fee
                              </h4>
                              <p className="text-xs text-gray-500">
                                Academic Year: {fee.academicYear}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              fee.status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : fee.status === 'partial'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {fee.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                            <div>
                              <p className="text-gray-500">Total Amount</p>
                              <p className="font-bold text-gray-800">₹{fee.totalAmount}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Paid Amount</p>
                              <p className="font-bold text-green-600">₹{fee.paidAmount}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Due Amount</p>
                              <p className="font-bold text-red-600">₹{fee.dueAmount}</p>
                            </div>
                          </div>

                          {fee.status !== 'paid' && (
                            <div className="pt-3 border-t">
                              <h5 className="font-medium text-sm text-gray-700 mb-3">
                                Collect Payment
                              </h5>
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <input
                                  type="number"
                                  placeholder="Amount"
                                  value={paymentData.amount}
                                  onChange={(e) =>
                                    setPaymentData({ ...paymentData, amount: e.target.value })
                                  }
                                  max={fee.dueAmount}
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <select
                                  value={paymentData.paymentMode}
                                  onChange={(e) =>
                                    setPaymentData({ ...paymentData, paymentMode: e.target.value })
                                  }
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                  <option value="cash">Cash</option>
                                  <option value="card">Card</option>
                                  <option value="upi">UPI</option>
                                  <option value="bank_transfer">Bank Transfer</option>
                                  <option value="cheque">Cheque</option>
                                </select>
                              </div>
                              <input
                                type="text"
                                placeholder="Transaction ID (optional)"
                                value={paymentData.transactionId}
                                onChange={(e) =>
                                  setPaymentData({ ...paymentData, transactionId: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                              />
                              <button
                                onClick={() => handlePayment(fee._id)}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
                              >
                                Collect Payment
                              </button>
                            </div>
                          )}

                          {/* Payment History */}
                          {fee.paymentHistory.length > 0 && (
                            <div className="pt-3 border-t mt-3">
                              <h5 className="font-medium text-sm text-gray-700 mb-2">
                                Payment History
                              </h5>
                              <div className="space-y-2">
                                {fee.paymentHistory.map((payment, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between text-xs bg-gray-50 p-2 rounded"
                                  >
                                    <div>
                                      <p className="font-medium text-gray-800">
                                        ₹{payment.amount}
                                      </p>
                                      <p className="text-gray-500">
                                        {new Date(payment.paymentDate).toLocaleDateString()} • {payment.paymentMode}
                                      </p>
                                    </div>
                                    {payment.transactionId && (
                                      <p className="text-gray-500">
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
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <MdPerson size={64} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-400">Select a student to collect fee</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollectFee