import { useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

export default function TrackApplication() {
  const [applicationId, setApplicationId] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async (e) => {
    e.preventDefault()
    if (!applicationId) return
    setLoading(true)
    setError('')
    setData(null)

    try {
      const res = await axios.get(`/api/applications/track/${applicationId}`)
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Application not found. Please check the ID.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center transition-colors duration-300">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Track Application</h2>
          <p className="mt-2 text-gray-600 dark:text-slate-400">Enter your Application ID to check the real-time status.</p>
        </div>

        <form onSubmit={handleTrack} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 mb-8 transition-colors">
          <div className="flex gap-3">
            <input
              type="text"
              required
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value.trim().toUpperCase())}
              placeholder="e.g. APP260001"
              className="flex-1 p-3 border dark:border-slate-700 rounded-xl bg-transparent dark:text-white focus:ring-2 focus:ring-teal-500 uppercase outline-none"
            />
            <button
              type="submit"
              disabled={loading || !applicationId}
              className="py-3 px-6 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
          {error && <p className="mt-3 text-red-600 dark:text-red-400 text-sm">{error}</p>}
        </form>

        <AnimatePresence>
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-800 transition-colors"
            >
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Application ID</p>
                  <p className="text-xl font-bold font-mono text-gray-900 dark:text-white">{data.applicationId}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${getStatusColor(data.status)}`}>
                  {data.status}
                </span>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Applicant Name</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">{data.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Program Applied For</p>
                  <p className="font-medium text-gray-900 dark:text-white">{data.course}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Application Date</p>
                  <p className="text-gray-900 dark:text-white">{new Date(data.appliedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                {data.status === 'approved' && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-400 font-medium mb-1">Action Required</p>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      Your application has been approved! We have sent your Login ID and password reset link to your registered email address.
                    </p>
                  </div>
                )}

                {data.status === 'rejected' && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                    <p className="text-sm text-red-800 dark:text-red-400 font-medium mb-1">Rejection Reason</p>
                    <p className="text-red-700 dark:text-red-300 text-sm">{data.rejectionReason || 'Not eligible'}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
