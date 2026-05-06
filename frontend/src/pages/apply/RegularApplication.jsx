import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import OtpVerification from './OtpVerification'

// Load Razorpay script dynamically
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
// 1 – Basic Info
// 2 – OTP Verification
// 3 – Pay ₹50 Application Fee (Razorpay)
// 4 – Upload Documents & Submit
// 5 – Success

export default function RegularApplication() {
  const [courses, setCourses] = useState([])
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [applicationId, setApplicationId] = useState('')
  const [appFeePaymentId, setAppFeePaymentId] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    course: '',
    address: '',
    qualification: '',
  })
  const [files, setFiles] = useState({
    photo: null,
    previousMarksheet: null,
    idProof: null,
  })

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get('/api/courses/public')
        // Show REGULAR and BOTH delivery modes for regular (offline) admission
        setCourses(data.filter(c => c.deliveryMode !== 'ONLINE'))
      } catch (err) {
        console.error('Failed to fetch courses')
      }
    }
    fetchCourses()
  }, [])

  const handleBasicSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.mobile || !formData.course) {
      setError('Please fill all basic details')
      return
    }
    setError('')
    setStep(2)
  }

  // ── Step 3: Pay ₹50 Application Fee via Razorpay ──────────────────────────
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
      // 1. Create order on backend
      const { data: order } = await axios.post('/api/payment/app-fee/create-order', {
        email: formData.email,
        name: formData.name,
      })

      // 2. Open Razorpay modal
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'CMS College',
        description: 'Application Fee — ₹50',
        order_id: order.orderId,
        handler: async (response) => {
          try {
            // 3. Verify on backend — MUST succeed before proceeding
            const { data: verification } = await axios.post('/api/payment/app-fee/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })

            if (verification.verified) {
              setAppFeePaymentId(verification.paymentId)
              setStep(4) // Proceed to document upload
            }
          } catch (verifyErr) {
            setError(verifyErr.response?.data?.message || 'Payment verification failed')
          } finally {
            setLoading(false)
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.mobile,
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: () => {
            setLoading(false)
            setError('Payment was cancelled. Please try again to proceed.')
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

  // ── Step 4: Document Upload & Final Submit ────────────────────────────────
  const handleFinalSubmit = async (e) => {
    e.preventDefault()

    if (!appFeePaymentId) {
      setError('Application fee payment is required. Please go back and complete the payment.')
      return
    }

    if (!files.photo || !files.previousMarksheet || !files.idProof) {
      setError('Please upload all required documents')
      return
    }

    setLoading(true)
    setError('')

    const data = new FormData()
    Object.keys(formData).forEach((key) => data.append(key, formData[key]))
    data.append('appFeePaymentId', appFeePaymentId)
    Object.keys(files).forEach((key) => {
      if (files[key]) data.append(key, files[key])
    })

    try {
      const res = await axios.post('/api/applications/apply-regular', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setApplicationId(res.data.applicationId)
      setStep(5)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  // ── Step indicator ─────────────────────────────────────────────────────────
  const steps = ['Basic Info', 'Verify OTP', 'Pay ₹50', 'Documents', 'Done']

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Regular Admission</h2>
          <p className="mt-2 text-gray-600">Apply for full-time degree programs.</p>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  step > i + 1
                    ? 'bg-green-500 border-green-500 text-white'
                    : step === i + 1
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className="text-xs mt-1 text-gray-500 hidden sm:block">{label}</span>
              {i < steps.length - 1 && (
                <div className={`hidden sm:block absolute h-0.5 w-full top-4 left-1/2 -translate-x-1/2 ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
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
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="As per documents"
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
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
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
                        className="w-full p-3 border rounded-r-xl focus:ring-2 focus:ring-blue-500"
                        placeholder="10-digit number"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                  <select
                    required
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a program...</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.code}) — {c.type}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Continue to Verification →
                </button>
              </form>
            </motion.div>
          )}

          {/* ── Step 2: OTP Verification ───────────────────────────────────────── */}
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
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Application Fee</h3>
              <p className="text-gray-500 mb-1">A one-time non-refundable application fee is required.</p>
              <p className="text-3xl font-extrabold text-blue-700 mb-6">₹50</p>
              <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left text-sm text-blue-800 space-y-1">
                <p>✅ Verified via Razorpay — 100% secure</p>
                <p>✅ Required before document submission</p>
                <p>✅ Payment ID stored for your records</p>
              </div>
              <button
                onClick={handleAppFeePayment}
                disabled={loading}
                className="w-full py-4 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-75 flex items-center justify-center gap-2"
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
                  'Pay ₹50 & Continue'
                )}
              </button>
              <button
                onClick={() => setStep(2)}
                className="mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                ← Go Back
              </button>
            </motion.div>
          )}

          {/* ── Step 4: Document Upload ────────────────────────────────────────── */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
            >
              {/* Fee paid badge */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-600 font-semibold text-sm">✅ Application fee paid</span>
                <span className="text-xs text-gray-400 font-mono ml-auto">{appFeePaymentId}</span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-6">Complete Application</h3>
              <form onSubmit={handleFinalSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification</label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 12th Science, B.Sc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address</label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 h-24"
                    placeholder="Full residential address"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h4>
                  <div className="space-y-4">
                    {[
                      { key: 'photo', label: 'Passport Size Photo', accept: 'image/*' },
                      { key: 'previousMarksheet', label: 'Previous Marksheet', accept: '.pdf,image/*' },
                      { key: 'idProof', label: 'ID Proof (Aadhar/PAN)', accept: '.pdf,image/*' },
                    ].map(({ key, label, accept }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                        <input
                          type="file"
                          accept={accept}
                          required
                          onChange={(e) => setFiles({ ...files, [key]: e.target.files[0] })}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── Step 5: Success ────────────────────────────────────────────────── */}
          {step === 5 && (
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
              <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Application Submitted!</h3>
              <p className="text-gray-600 mb-6 text-lg">Your application is under review. You'll be notified via email.</p>
              <div className="bg-blue-50 rounded-xl p-6 mb-8 inline-block">
                <p className="text-sm text-blue-800 font-medium uppercase tracking-wide mb-1">Your Application ID</p>
                <p className="text-3xl font-bold text-blue-900 tracking-wider font-mono">{applicationId}</p>
              </div>
              <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
                Save this ID to track your application status at any time.
              </p>
              <button
                onClick={() => (window.location.href = '/apply/track')}
                className="py-3 px-8 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Track Status
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
