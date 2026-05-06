import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircleIcon, XCircleIcon, EyeIcon, UserPlusIcon } from '@heroicons/react/24/outline'

export default function Applications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)
  const [filter, setFilter] = useState('pending')
  const [actionLoading, setActionLoading] = useState(false)

  const token = localStorage.getItem('token')
  const config = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    fetchApplications()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/applications', config)
      setApplications(res.data)
    } catch (err) {
      setError('Failed to fetch applications. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this application? A user account will be created and credentials emailed.')) return
    setActionLoading(true)
    try {
      const res = await axios.put(`/api/applications/${id}/approve`, {}, config)
      alert(res.data.message)
      fetchApplications()
      setSelectedApp(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve application')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason:')
    if (!reason) return
    setActionLoading(true)
    try {
      await axios.put(`/api/applications/${id}/reject`, { reason }, config)
      fetchApplications()
      setSelectedApp(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject application')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredApps = applications.filter((app) => filter === 'all' || app.status === filter)

  const statusColor = (status) => {
    if (status === 'approved') return 'bg-green-100 text-green-800'
    if (status === 'rejected') return 'bg-red-100 text-red-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const modeColor = (mode) =>
    mode === 'online' ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admissions &amp; Applications</h1>
          <p className="text-sm text-gray-500">Review and manage admission applications</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Walk-in Entry Button */}
          <Link
            to="/admin/applications/walk-in"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <UserPlusIcon className="w-4 h-4" />
            Walk-in Entry
          </Link>
          {/* Status Filters */}
          <div className="flex space-x-2">
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
                {f !== 'all' && (
                  <span className="ml-1 text-xs">
                    ({applications.filter((a) => a.status === f).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">App ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApps.map((app) => (
                <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 font-mono">{app.applicationId}</div>
                    {app.isWalkIn && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                        🚶 Walk-in
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">{app.name}</div>
                    <div className="text-sm text-gray-500">{app.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.course?.name || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${modeColor(app.mode || app.type)}`}>
                      {(app.mode || app.type || '—').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {app.applicationFeePaid ? (
                      <span className="text-green-600 text-sm font-medium">✅ Paid</span>
                    ) : (
                      <span className="text-red-500 text-sm">Unpaid</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.appliedAt || app.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <EyeIcon className="w-5 h-5 mr-1" /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No applications found for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Review Modal ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
                onClick={() => setSelectedApp(null)}
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75" />
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform sm:my-8 sm:align-middle sm:max-w-2xl w-full"
              >
                <div className="bg-white px-6 pt-6 pb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Application Details: <span className="font-mono">{selectedApp.applicationId}</span>
                  </h3>

                  {/* Badges */}
                  <div className="flex gap-2 mb-5">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColor(selectedApp.status)}`}>
                      {selectedApp.status.toUpperCase()}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${modeColor(selectedApp.mode || selectedApp.type)}`}>
                      {(selectedApp.mode || selectedApp.type || '').toUpperCase()}
                    </span>
                    {selectedApp.isWalkIn && (
                      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 text-xs font-semibold rounded-full">
                        🚶 Walk-in
                      </span>
                    )}
                    {selectedApp.applicationFeePaid && (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 text-xs font-semibold rounded-full">
                        ✅ Fee Paid
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      ['Applicant', selectedApp.name],
                      ['Contact', `${selectedApp.email} | ${selectedApp.phone || selectedApp.mobile}`],
                      ['Qualification', selectedApp.qualification || '—'],
                      ['Course', selectedApp.course?.name || '—'],
                      ['Address', selectedApp.address || '—'],
                      ['Applied At', new Date(selectedApp.appliedAt || selectedApp.createdAt).toLocaleString('en-IN')],
                    ].map(([label, val]) => (
                      <div key={label} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{val}</p>
                      </div>
                    ))}
                  </div>

                  {selectedApp.createdByStaff && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-xs text-orange-600 font-semibold uppercase">Walk-in Created By</p>
                      <p className="text-sm text-orange-800">{selectedApp.createdByStaff?.name} ({selectedApp.createdByStaff?.userId})</p>
                    </div>
                  )}

                  {selectedApp.rejectionReason && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-600 font-semibold uppercase">Rejection Reason</p>
                      <p className="text-sm text-red-800">{selectedApp.rejectionReason}</p>
                    </div>
                  )}

                  {/* Documents */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Documents</h4>
                    <div className="flex gap-4 flex-wrap">
                      {selectedApp.documents?.photo && (
                        <a href={selectedApp.documents.photo} target="_blank" rel="noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center">
                          <EyeIcon className="w-4 h-4 mr-1" /> Photo
                        </a>
                      )}
                      {selectedApp.documents?.previousMarksheet && (
                        <a href={selectedApp.documents.previousMarksheet} target="_blank" rel="noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center">
                          <EyeIcon className="w-4 h-4 mr-1" /> Marksheet
                        </a>
                      )}
                      {selectedApp.documents?.idProof && (
                        <a href={selectedApp.documents.idProof} target="_blank" rel="noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center">
                          <EyeIcon className="w-4 h-4 mr-1" /> ID Proof
                        </a>
                      )}
                      {!selectedApp.documents?.photo && !selectedApp.documents?.previousMarksheet && !selectedApp.documents?.idProof && (
                        <p className="text-sm text-gray-400 italic">No documents uploaded</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {selectedApp.status === 'pending' && (
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <button
                        onClick={() => handleReject(selectedApp._id)}
                        disabled={actionLoading}
                        className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                      >
                        <XCircleIcon className="w-5 h-5 mr-1" /> Reject
                      </button>
                      <button
                        onClick={() => handleApprove(selectedApp._id)}
                        disabled={actionLoading}
                        className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <CheckCircleIcon className="w-5 h-5 mr-1" />
                        )}
                        Approve &amp; Enroll
                      </button>
                    </div>
                  )}

                  {selectedApp.status !== 'pending' && (
                    <div className="flex justify-end pt-4 border-t">
                      <button
                        onClick={() => setSelectedApp(null)}
                        className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
