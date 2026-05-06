import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import {
  MdDescription,
  MdSearch,
  MdSend,
  MdTaskAlt
} from 'react-icons/md'
import Sidebar from './Sidebar'

const documentTypeOptions = [
  { value: 'bonafide_certificate', label: 'Bonafide Certificate' },
  { value: 'transcript', label: 'Transcript' },
  { value: 'migration_certificate', label: 'Migration Certificate' },
  { value: 'course_completion_certificate', label: 'Course Completion Certificate' },
  { value: 'noc', label: 'No Objection Certificate (NOC)' },
  { value: 'duplicate_id_card', label: 'Duplicate ID Card' },
  { value: 'duplicate_certificate', label: 'Duplicate Certificate / Degree' },
  { value: 'cgpa_conversion_certificate', label: 'CGPA Conversion Certificate' }
]

const statusStyles = {
  submitted: 'bg-amber-100 text-amber-800',
  in_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-slate-200 text-slate-800'
}

const initialForm = {
  documentType: 'bonafide_certificate',
  purpose: '',
  note: ''
}

const formatLabel = (value) =>
  value
    ?.replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()) || ''

const DocumentRequestPortal = ({
  title,
  subtitle,
  adminView = false
}) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [savingRequestId, setSavingRequestId] = useState('')
  const [formData, setFormData] = useState(initialForm)
  const [filters, setFilters] = useState({
    status: '',
    documentType: '',
    requesterRole: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [adminForm, setAdminForm] = useState({
    status: 'submitted',
    adminRemark: ''
  })

  const config = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` }
    }),
    [token]
  )

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true)

      if (adminView) {
        const params = new URLSearchParams()

        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params.set(key, value)
          }
        })

        const query = params.toString()
        const res = await axios.get(
          `/api/document-requests${query ? `?${query}` : ''}`,
          config
        )
        setRequests(res.data)
      } else {
        const res = await axios.get('/api/document-requests/me', config)
        setRequests(res.data)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load document requests')
    } finally {
      setLoading(false)
    }
  }, [adminView, config, filters])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const visibleRequests = requests.filter((request) => {
    if (!searchTerm.trim()) {
      return true
    }

    const query = searchTerm.toLowerCase()
    return (
      request.purpose.toLowerCase().includes(query) ||
      request.note?.toLowerCase().includes(query) ||
      request.requesterName?.toLowerCase().includes(query)
    )
  })

  const submitRequest = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await axios.post('/api/document-requests', formData, config)
      toast.success(res.data.message)
      setFormData(initialForm)
      await loadRequests()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create document request')
    } finally {
      setSubmitting(false)
    }
  }

  const openRequest = (request) => {
    setSelectedRequest(request)
    setAdminForm({
      status: request.status,
      adminRemark: request.adminRemark || ''
    })
  }

  const saveAdminUpdate = async (e) => {
    e.preventDefault()

    if (!selectedRequest) {
      return
    }

    setSavingRequestId(selectedRequest._id)

    try {
      const res = await axios.put(
        `/api/document-requests/${selectedRequest._id}`,
        adminForm,
        config
      )
      toast.success(res.data.message)
      setSelectedRequest(res.data.request)
      await loadRequests()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update document request')
    } finally {
      setSavingRequestId('')
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user?.name || 'Profile'}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="bg-slate-900 w-10 h-10 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{user?.name?.charAt(0)}</span>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {!adminView && (
            <form
              onSubmit={submitRequest}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <MdDescription size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Request a Document</h2>
                  <p className="text-sm text-slate-500">
                    Submit your request clearly so the admin team can process it without delays.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label>
                  <span className="block text-sm font-medium text-slate-700 mb-2">Document Type</span>
                  <select
                    value={formData.documentType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, documentType: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white"
                  >
                    {documentTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
                  Use the purpose field to mention why you need the document, for example:
                  higher studies, visa, internship, scholarship, or verification.
                </div>
                <label className="md:col-span-2">
                  <span className="block text-sm font-medium text-slate-700 mb-2">Purpose</span>
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={(e) => setFormData((prev) => ({ ...prev, purpose: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300"
                    placeholder="Why do you need this document?"
                    required
                  />
                </label>
                <label className="md:col-span-2">
                  <span className="block text-sm font-medium text-slate-700 mb-2">Additional Note</span>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300"
                    placeholder="Optional details that may help the admin process your request faster"
                  />
                </label>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  <MdSend size={18} />
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className={`space-y-4 ${adminView ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {adminView ? 'All Document Requests' : 'My Document Requests'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {adminView
                        ? 'Review submitted requests, add remarks, and move them through the approval process.'
                        : 'Track status updates and approval remarks for your submitted requests.'}
                    </p>
                  </div>
                  <div className="relative w-full lg:w-72">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300"
                      placeholder="Search requests"
                    />
                  </div>
                </div>

                {adminView && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                      className="px-4 py-3 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="">All Statuses</option>
                      <option value="submitted">Submitted</option>
                      <option value="in_review">In Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                    <select
                      value={filters.documentType}
                      onChange={(e) => setFilters((prev) => ({ ...prev, documentType: e.target.value }))}
                      className="px-4 py-3 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="">All Document Types</option>
                      {documentTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={filters.requesterRole}
                      onChange={(e) => setFilters((prev) => ({ ...prev, requesterRole: e.target.value }))}
                      className="px-4 py-3 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="">All Roles</option>
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="parent">Parent</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
                    Loading document requests...
                  </div>
                ) : visibleRequests.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
                    <MdTaskAlt size={42} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-700 font-semibold">No document requests found</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {adminView
                        ? 'Try adjusting the filters or search term.'
                        : 'Create your first document request from the form above.'}
                    </p>
                  </div>
                ) : (
                  visibleRequests.map((request) => (
                    <button
                      key={request._id}
                      onClick={() => openRequest(request)}
                      className={`w-full text-left bg-white rounded-2xl shadow-sm border p-5 transition ${
                        selectedRequest?._id === request._id
                          ? 'border-slate-900 ring-2 ring-slate-200'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[request.status]}`}>
                              {formatLabel(request.status)}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                              {documentTypeOptions.find((option) => option.value === request.documentType)?.label || formatLabel(request.documentType)}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mt-3">{request.purpose}</h3>
                          <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                            {request.note || 'No additional note provided.'}
                          </p>
                        </div>
                        <div className="text-sm text-slate-500 md:text-right">
                          {adminView && (
                            <p className="font-medium text-slate-700">{request.requesterName}</p>
                          )}
                          <p>{new Date(request.createdAt).toLocaleString()}</p>
                          {adminView && (
                            <p className="capitalize mt-1">{request.requesterRole}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {selectedRequest && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 h-fit">
                <h2 className="text-lg font-bold text-slate-900">
                  {documentTypeOptions.find((option) => option.value === selectedRequest.documentType)?.label || formatLabel(selectedRequest.documentType)}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Submitted on {new Date(selectedRequest.createdAt).toLocaleString()}
                </p>

                <div className="mt-5 space-y-4 text-sm">
                  <div>
                    <p className="text-slate-500">Purpose</p>
                    <p className="font-medium text-slate-800">{selectedRequest.purpose}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Additional Note</p>
                    <p className="text-slate-700 leading-6">
                      {selectedRequest.note || 'No additional note provided.'}
                    </p>
                  </div>
                  {adminView && (
                    <>
                      <div>
                        <p className="text-slate-500">Requester</p>
                        <p className="font-medium text-slate-800">
                          {selectedRequest.requesterName} ({selectedRequest.requesterEmail})
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Handled By</p>
                        <p className="font-medium text-slate-800">
                          {selectedRequest.handledBy?.name || 'Not assigned yet'}
                        </p>
                      </div>
                    </>
                  )}
                  {!adminView && selectedRequest.adminRemark && (
                    <div>
                      <p className="text-slate-500">Admin Remark</p>
                      <p className="text-slate-700 leading-6">{selectedRequest.adminRemark}</p>
                    </div>
                  )}
                </div>

                {adminView ? (
                  <form onSubmit={saveAdminUpdate} className="mt-6 space-y-4">
                    <label className="block">
                      <span className="block text-sm font-medium text-slate-700 mb-2">Status</span>
                      <select
                        value={adminForm.status}
                        onChange={(e) => setAdminForm((prev) => ({ ...prev, status: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="in_review">In Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="block text-sm font-medium text-slate-700 mb-2">Admin Remark</span>
                      <textarea
                        value={adminForm.adminRemark}
                        onChange={(e) => setAdminForm((prev) => ({ ...prev, adminRemark: e.target.value }))}
                        rows="5"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300"
                        placeholder="Add approval notes, rejection reason, or collection instructions"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={savingRequestId === selectedRequest._id}
                      className="w-full px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50"
                    >
                      {savingRequestId === selectedRequest._id ? 'Saving...' : 'Save Update'}
                    </button>
                  </form>
                ) : (
                  <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
                      Current Status
                    </p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[selectedRequest.status]}`}>
                      {formatLabel(selectedRequest.status)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentRequestPortal
