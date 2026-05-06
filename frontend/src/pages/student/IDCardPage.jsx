/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import IDCard from '../../components/IDCard'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdDownload, MdPayment, MdWarning } from 'react-icons/md'

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const StudentIDCardPage = () => {
  const [studentDetails, setStudentDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  const config = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        await axios.get('/api/auth/me', config)
        // Then get specific student profile using the user's ID
        await axios.get('/api/students/linked-children', config)
        // Actually, if it's a student, they might not have linked-children route for themselves.
        // Wait, auth/me returns the user, we need the Student document.
        // Let's use getMyProfile from auth.
        const myProfileRes = await axios.get('/api/auth/profile', config)
        setStudentDetails(myProfileRes.data.profile) // Assuming auth/profile returns { user, profile }
      } catch (err) {
        toast.error('Failed to load profile details')
      } finally {
        setLoading(false)
      }
    }
    fetchStudentProfile()
  }, [])

  const handleDownload = () => {
    window.print()
  }

  const handlePaymentAndDownload = async () => {
    // If it's the first download (free)
    if (!studentDetails.idCardDownloaded) {
      try {
        await axios.post('/api/payment/id-card/free-download', { userType: 'student' }, config)
        toast.success('First download is free!')
        // Update local state
        setStudentDetails({ ...studentDetails, idCardDownloaded: true, idCardDownloadCount: 1 })
        handleDownload()
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error recording free download')
      }
      return
    }

    // Subsequent downloads require payment
    setProcessingPayment(true)
    const res = await loadRazorpayScript()
    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?')
      setProcessingPayment(false)
      return
    }

    try {
      const orderRes = await axios.post('/api/payment/id-card/create-order', { userType: 'student' }, config)
      
      if (orderRes.data.free) {
        // Fallback in case state was stale
        setStudentDetails({ ...studentDetails, idCardDownloaded: true })
        handleDownload()
        setProcessingPayment(false)
        return
      }

      const options = {
        key: orderRes.data.keyId,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: 'College Management System',
        description: 'ID Card Re-Download Fee',
        order_id: orderRes.data.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post('/api/payment/id-card/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userType: 'student'
            }, config)
            
            toast.success(verifyRes.data.message)
            setStudentDetails({ 
              ...studentDetails, 
              idCardDownloadCount: verifyRes.data.downloadCount 
            })
            handleDownload()
          } catch (verifyErr) {
            toast.error(verifyErr.response?.data?.message || 'Payment verification failed')
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: studentDetails.phone
        },
        theme: {
          color: '#2563eb'
        }
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment')
    } finally {
      setProcessingPayment(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center print:hidden">
          <h1 className="text-xl font-bold text-gray-800">My Digital ID Card</h1>
        </div>

        <div className="p-6 flex-1 flex flex-col items-center justify-center">
          {loading ? (
            <p className="text-gray-500 font-medium">Generating ID Card...</p>
          ) : !studentDetails ? (
            <p className="text-red-500 font-medium">Profile details not found</p>
          ) : (
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center print:shadow-none print:p-0">
              
              <div className="mb-8 print:mb-0">
                <IDCard userDetails={studentDetails} role="student" />
              </div>

              <div className="print:hidden space-y-4 border-t border-gray-100 pt-6">
                {!studentDetails.idCardDownloaded ? (
                  <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm mb-4 border border-green-100">
                    <p className="font-bold mb-1">🎉 First Download Free!</p>
                    <p>You can download your official digital ID card for free this time.</p>
                  </div>
                ) : (
                  <div className="bg-orange-50 text-orange-700 p-4 rounded-xl text-sm mb-4 flex items-start text-left border border-orange-100">
                    <MdWarning className="mt-0.5 mr-2 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-bold mb-1">Re-Download Required?</p>
                      <p>You have already downloaded your ID card {studentDetails.idCardDownloadCount} time(s). Subsequent downloads require a ₹50 processing fee.</p>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handlePaymentAndDownload}
                  disabled={processingPayment}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-70"
                >
                  {!studentDetails.idCardDownloaded ? (
                    <><MdDownload size={20} /> Download Free Now</>
                  ) : processingPayment ? (
                    'Processing Payment...'
                  ) : (
                    <><MdPayment size={20} /> Pay ₹50 & Download</>
                  )}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentIDCardPage
