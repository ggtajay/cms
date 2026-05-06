import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import toast, { Toaster } from 'react-hot-toast'
import { UserPlusIcon } from '@heroicons/react/24/outline'

export default function WalkInAdmission() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    mode: 'regular',
    address: '',
    qualification: '',
    offlinePaymentCollected: false,
  })

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const config = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get('/api/courses', config)
        setCourses(data.filter((c) => c.isActive))
      } catch {
        toast.error('Failed to load courses')
      }
    }
    fetchCourses()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone || !formData.course || !formData.mode) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post('/api/applications/walk-in', formData, config)
      setResult(data)
      toast.success('Walk-in application created successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create walk-in application')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <UserPlusIcon className="w-6 h-6 text-green-600" />
            <h1 className="text-xl font-bold text-gray-800">Walk-in Admission</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-600 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <div className="p-6 max-w-2xl mx-auto w-full">
          {result ? (
            /* ── Success State ─────────────────────────────────────────────── */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Walk-in Application Created!</h2>
              <p className="text-gray-500 mb-6">The application has been registered and is now pending review.</p>

              <div className="bg-blue-50 rounded-xl p-6 mb-6 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Application ID</span>
                  <span className="font-mono font-bold text-blue-900">{result.applicationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Walk-in</span>
                  <span className="text-sm font-medium text-orange-700">🚶 Yes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Application Fee</span>
                  <span className={`text-sm font-medium ${result.applicationFeePaid ? 'text-green-700' : 'text-red-600'}`}>
                    {result.applicationFeePaid ? '✅ Paid (offline)' : '❌ Not collected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created By</span>
                  <span className="text-sm font-medium text-gray-800">{result.createdByStaff}</span>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setResult(null)
                    setFormData({
                      name: '', email: '', phone: '', course: '', mode: 'regular',
                      address: '', qualification: '', offlinePaymentCollected: false,
                    })
                  }}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                >
                  Add Another
                </button>
                <button
                  onClick={() => navigate('/admin/applications')}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                >
                  View All Applications
                </button>
              </div>
            </div>
          ) : (
            /* ── Form ──────────────────────────────────────────────────────── */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">New Walk-in Application</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Create an application on behalf of a walk-in student. OTP verification is skipped — you are vouching for this applicant.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="As per documents"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="applicant@email.com"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        +91
                      </span>
                      <input
                        type="text"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))
                        }
                        placeholder="10-digit number"
                        className="w-full p-3 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Course + Mode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="course"
                      required
                      value={formData.course}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a course...</option>
                      {courses.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mode <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="mode"
                      required
                      value={formData.mode}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="regular">Regular (On-campus)</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                </div>

                {/* Qualification */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="e.g., 12th Science, B.Sc"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Permanent residential address"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Offline Payment Checkbox */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="offlinePaymentCollected"
                      checked={formData.offlinePaymentCollected}
                      onChange={handleChange}
                      className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        Application fee (₹50) collected offline
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Check this only if the ₹50 application fee has been physically collected. 
                        This is recorded for audit with your staff ID ({user?.userId}).
                      </p>
                    </div>
                  </label>
                </div>

                {/* Audit Note */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600">
                  <span className="font-semibold">Audit Trail:</span> This application will be attributed to{' '}
                  <span className="font-mono text-gray-800">{user?.name} ({user?.userId})</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/applications')}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlusIcon className="w-5 h-5" />
                        Create Walk-in Application
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
