/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import OtpVerification from './OtpVerification'

// Load Razorpay checkout.js dynamically
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

// Steps:
// 1 – Basic Info & Course Select
// 2 – OTP Verification
// 3 – Pay ₹50 Application Fee
// 4 – Pay Course Fee (full amount)
// 5 – Success

export default function OnlineApplication() {
  const [courses, setCourses] = useState([])
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [enrollmentDetails, setEnrollmentDetails] = useState(null)
  const [appFeePaymentId, setAppFeePaymentId] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    course: '',
  })

  // Fetch only ONLINE and BOTH delivery-mode courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get('/api/courses/public')
        setCourses(data.filter((c) => c.deliveryMode === 'ONLINE' || c.deliveryMode === 'BOTH'))
      } catch (err) {
        console.error('Failed to fetch courses')
      }
    }
    fetchCourses()
  }, [])

  const handleBasicSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.mobile || !formData.course) {
      setError('Please fill all details')
      return
    }
    setError('')
    setStep(2)
  }

  // ── Step 3: ₹50 Application Fee ──────────────────────────────────────────
  const handleAppFeePayment = async () => {
    setLoading(true)
    setError('')

    const loaded = await loadRazorpay()
    if (!loaded) {
      setError('Failed to load payment gateway. Check your internet connection.')
      setLoading(false)
      return
    }

    try {
      const { data: order } = await axios.post('/api/payment/app-fee/create-order', {
        email: formData.email,
        name: formData.name,
      })

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'CMS College',
        description: 'Application Fee — ₹50',
        order_id: order.orderId,
        handler: async (response) => {
          try {
            // Verify signature on backend — the ONLY way applicationFeePaid can be set
            const { data: verification } = await axios.post('/api/payment/app-fee/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })

            if (verification.verified) {
              setAppFeePaymentId(verification.paymentId)
              setStep(4) // Proceed to course fee payment
            }
          } catch (verifyErr) {
            setError(verifyErr.response?.data?.message || 'Payment verification failed')
          } finally {
            setLoading(false)
          }
        },
        prefill: { name: formData.name, email: formData.email, contact: formData.mobile },
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: () => {
            setLoading(false)
            setError('Payment cancelled. Please complete the ₹50 fee to continue.')
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not initiate payment. Please try again.')
      setLoading(false)
    }
  }

  // ── Step 4: Course Fee Payment (Razorpay) ─────────────────────────────────
  const handleCourseFeePayment = async () => {
    setLoading(true)
    setError('')

    const loaded = await loadRazorpay()
    if (!loaded) {
      setError('Failed to load payment gateway.')
      setLoading(false)
      return
    }

    try {
      const { data: order } = await axios.post('/api/payment/initiate', { amount: 500000 }) // ₹5000 in paise

      // For the course fee we use the mock initiate endpoint
      // In production, create a real Razorpay order for the course fee amount
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_1234567890',
        amount: 500000, // ₹5000
        currency: 'INR',
        name: 'CMS College',
        description: `Online Course Enrollment Fee`,
        handler: async (response) => {
          try {
            // Submit enrollment with payment status
            const { data: appData } = await axios.post('/api/applications/apply-online', {
              ...formData,
              paymentStatus: 'paid',
              appFeePaymentId,
            })
            setEnrollmentDetails(appData)
            setStep(5)
          } catch (err) {
            setError(err.response?.data?.message || 'Enrollment failed after payment')
          } finally {
            setLoading(false)
          }
        },
        prefill: { name: formData.name, email: formData.email, contact: formData.mobile },
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: () => {
            setLoading(false)
            setError('Course fee payment cancelled.')
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      setError('Could not initiate course fee payment.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Online Enrollment</h2>
          <p className="mt-2 text-gray-600">Instant access to online certification courses.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ── Step 1: Basic Info ─────────────────────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h3>
              <form onSubmit={handleBasicSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                    placeholder="Your legal name"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 font-medium">
                        +91
                      </span>
                      <input
                        type="text"
                        required
                        value={formData.mobile}
                        onChange={(e) =>
                          setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })
                        }
                        className="w-full p-3 border rounded-r-xl focus:ring-2 focus:ring-indigo-500"
                        placeholder="10-digit number"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Online Program</label>
                  <select
                    required
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select an online program...</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.code}) — ₹5,000
                      </option>
                    ))}
                  </select>
                  {courses.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">No online courses available yet. Check back soon.</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Continue to Verification →
                </button>
              </form>
            </motion.div>
          )}

          {/* ── Step 2: OTP ───────────────────────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <OtpVerification
                email={formData.email}
                mobile={formData.mobile}
                onVerified={() => setStep(3)}
                onCancel={() => setStep(1)}
              />
            </motion.div>
          )}

          {/* ── Step 3: ₹50 Application Fee ───────────────────────────────────── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center"
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Application Fee</h3>
              <p className="text-gray-500 mb-1">Required before course fee payment.</p>
              <p className="text-3xl font-extrabold text-indigo-700 mb-6">₹50</p>
              <button
                onClick={handleAppFeePayment}
                disabled={loading}
                className="w-full py-4 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-75 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Opening Payment Gateway...
                  </>
                ) : (
                  'Pay ₹50 Application Fee'
                )}
              </button>
              <button onClick={() => setStep(2)} className="mt-3 text-sm text-gray-500 hover:text-gray-700">
                ← Go Back
              </button>
            </motion.div>
          )}

          {/* ── Step 4: Course Fee ─────────────────────────────────────────────── */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center"
            >
              <div className="flex items-center gap-2 mb-5 p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-600 font-semibold text-sm">✅ Application fee paid</span>
                <span className="text-xs text-gray-400 font-mono ml-auto">{appFeePaymentId}</span>
              </div>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Course Payment</h3>
              <p className="text-gray-500 mb-2">Course Enrollment Fee</p>
              <p className="text-3xl font-extrabold text-gray-900 mb-6">₹5,000</p>
              <button
                onClick={handleCourseFeePayment}
                disabled={loading}
                className="w-full py-4 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-75 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Pay ₹5,000 & Enroll'
                )}
              </button>
            </motion.div>
          )}

          {/* ── Step 5: Success ────────────────────────────────────────────────── */}
          {step === 5 && enrollmentDetails && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-10 rounded-2xl shadow-xl text-center border border-gray-100"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Enrollment Successful!</h3>
              <p className="text-gray-600 mb-6 text-lg">Your student account has been created.</p>
              <div className="bg-indigo-50 rounded-xl p-6 mb-8 inline-block">
                <p className="text-sm text-indigo-800 font-medium uppercase tracking-wide mb-1">Your Login ID</p>
                <p className="text-3xl font-bold text-indigo-900 tracking-wider font-mono">{enrollmentDetails.userId}</p>
              </div>
              <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
                Check your email (<span className="font-medium text-gray-800">{formData.email}</span>) for your
                login password and account details.
              </p>
              <button
                onClick={() => (window.location.href = '/login')}
                className="py-3 px-8 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Go to Login
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
