import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import {
  MdOutlineSupportAgent,
  MdSearch,
  MdSend,
  MdTaskAlt
} from 'react-icons/md'
import Sidebar from './Sidebar'

const categoryOptions = [
  { value: 'academic_issue', label: 'Academic Issue' },
  { value: 'attendance_issue', label: 'Attendance Issue' },
  { value: 'fee_issue', label: 'Fee Issue' },
  { value: 'hostel_complaint', label: 'Hostel Complaint' },
  { value: 'transport_complaint', label: 'Transport Complaint' },
  { value: 'account_issue', label: 'Account / Login Issue' },
  { value: 'profile_correction', label: 'Profile Correction' },
  { value: 'examination_issue', label: 'Examination Issue' },
  { value: 'document_issue', label: 'Document Issue' },
  { value: 'general_complaint', label: 'General Complaint' }
]

const statusStyles = {
  open: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

const priorityStyles = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-violet-100 text-violet-800',
  high: 'bg-rose-100 text-rose-800'
}

const initialForm = {
  category: 'general_complaint',
  subject: '',
  description: '',
  priority: 'medium'
}

const formatLabel = (value) =>
  value
    ?.replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()) || ''

const HelpdeskPortal = ({
  title,
  subtitle,
  adminView = false
}) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [savingTicketId, setSavingTicketId] = useState('')
  const [formData, setFormData] = useState(initialForm)
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    requesterRole: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [adminForm, setAdminForm] = useState({
    status: 'open',
    priority: 'medium',
    adminRemark: ''
  })

  const config = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` }
    }),
    [token]
  )

  const loadTickets = useCallback(async () => {
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
        const res = await axios.get(`/api/helpdesk${query ? `?${query}` : ''}`, config)
        setTickets(res.data)
      } else {
        const res = await axios.get('/api/helpdesk/me', config)
        setTickets(res.data)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [adminView, config, filters])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  const visibleTickets = tickets.filter((ticket) => {
    if (!searchTerm.trim()) {
      return true
    }

    const query = searchTerm.toLowerCase()
    return (
      ticket.subject.toLowerCase().includes(query) ||
      ticket.description.toLowerCase().includes(query) ||
      ticket.requesterName?.toLowerCase().includes(query)
    )
  })

  const onSubmitTicket = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await axios.post('/api/helpdesk', formData, config)
      toast.success(res.data.message)
      setFormData(initialForm)
      await loadTickets()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const openTicket = (ticket) => {
    setSelectedTicket(ticket)
    setAdminForm({
      status: ticket.status,
      priority: ticket.priority,
      adminRemark: ticket.adminRemark || ''
    })
  }

  const saveAdminUpdate = async (e) => {
    e.preventDefault()

    if (!selectedTicket) {
      return
    }

    setSavingTicketId(selectedTicket._id)

    try {
      const res = await axios.put(
        `/api/helpdesk/${selectedTicket._id}`,
        adminForm,
        config
      )

      toast.success(res.data.message)
      setSelectedTicket(res.data.ticket)
      await loadTickets()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update ticket')
    } finally {
      setSavingTicketId('')
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
              onSubmit={onSubmitTicket}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <MdOutlineSupportAgent size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Raise a Ticket</h2>
                  <p className="text-sm text-slate-500">
                    Share the issue clearly and the admin team can respond faster.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label>
                  <span className="block text-sm font-medium text-slate-700 mb-2">Category</span>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="block text-sm font-medium text-slate-700 mb-2">Priority</span>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label className="md:col-span-2">
                  <span className="block text-sm font-medium text-slate-700 mb-2">Subject</span>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300"
                    placeholder="Write a short subject for your issue"
                    required
                  />
                </label>
                <label className="md:col-span-2">
                  <span className="block text-sm font-medium text-slate-700 mb-2">Description</span>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows="5"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300"
                    placeholder="Explain the issue, when it happened, and what you need help with"
                    required
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
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
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
                      {adminView ? 'All Helpdesk Tickets' : 'My Tickets'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {adminView
                        ? 'Monitor incoming issues and update their resolution status.'
                        : 'Track progress and admin remarks for your requests.'}
                    </p>
                  </div>
                  <div className="relative w-full lg:w-72">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300"
                      placeholder="Search tickets"
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
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                      className="px-4 py-3 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="">All Categories</option>
                      {categoryOptions.map((option) => (
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
                      <option value="accountant">Accountant</option>
                      <option value="librarian">Librarian</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
                    Loading tickets...
                  </div>
                ) : visibleTickets.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
                    <MdTaskAlt size={42} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-700 font-semibold">No tickets found</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {adminView
                        ? 'Try adjusting the filters or search term.'
                        : 'Raise your first support ticket from the form above.'}
                    </p>
                  </div>
                ) : (
                  visibleTickets.map((ticket) => (
                    <button
                      key={ticket._id}
                      onClick={() => openTicket(ticket)}
                      className={`w-full text-left bg-white rounded-2xl shadow-sm border p-5 transition ${
                        selectedTicket?._id === ticket._id
                          ? 'border-slate-900 ring-2 ring-slate-200'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[ticket.status]}`}>
                              {formatLabel(ticket.status)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityStyles[ticket.priority]}`}>
                              {formatLabel(ticket.priority)}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                              {categoryOptions.find((option) => option.value === ticket.category)?.label || formatLabel(ticket.category)}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mt-3">{ticket.subject}</h3>
                          <p className="text-sm text-slate-600 mt-2 line-clamp-2">{ticket.description}</p>
                        </div>
                        <div className="text-sm text-slate-500 md:text-right">
                          {adminView && (
                            <p className="font-medium text-slate-700">{ticket.requesterName}</p>
                          )}
                          <p>{new Date(ticket.createdAt).toLocaleString()}</p>
                          {adminView && (
                            <p className="capitalize mt-1">{ticket.requesterRole}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {selectedTicket && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 h-fit">
                <h2 className="text-lg font-bold text-slate-900">{selectedTicket.subject}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Created on {new Date(selectedTicket.createdAt).toLocaleString()}
                </p>

                <div className="mt-5 space-y-4 text-sm">
                  <div>
                    <p className="text-slate-500">Category</p>
                    <p className="font-medium text-slate-800">
                      {categoryOptions.find((option) => option.value === selectedTicket.category)?.label || formatLabel(selectedTicket.category)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Description</p>
                    <p className="text-slate-700 leading-6">{selectedTicket.description}</p>
                  </div>
                  {adminView && (
                    <>
                      <div>
                        <p className="text-slate-500">Requester</p>
                        <p className="font-medium text-slate-800">
                          {selectedTicket.requesterName} ({selectedTicket.requesterEmail})
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Handled By</p>
                        <p className="font-medium text-slate-800">
                          {selectedTicket.handledBy?.name || 'Not assigned yet'}
                        </p>
                      </div>
                    </>
                  )}
                  {!adminView && selectedTicket.adminRemark && (
                    <div>
                      <p className="text-slate-500">Admin Remark</p>
                      <p className="text-slate-700 leading-6">{selectedTicket.adminRemark}</p>
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
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="block text-sm font-medium text-slate-700 mb-2">Priority</span>
                      <select
                        value={adminForm.priority}
                        onChange={(e) => setAdminForm((prev) => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="block text-sm font-medium text-slate-700 mb-2">Admin Remark</span>
                      <textarea
                        value={adminForm.adminRemark}
                        onChange={(e) => setAdminForm((prev) => ({ ...prev, adminRemark: e.target.value }))}
                        rows="5"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300"
                        placeholder="Add resolution notes or next steps"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={savingTicketId === selectedTicket._id}
                      className="w-full px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50"
                    >
                      {savingTicketId === selectedTicket._id ? 'Saving...' : 'Save Update'}
                    </button>
                  </form>
                ) : (
                  <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
                      Current Status
                    </p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[selectedTicket.status]}`}>
                      {formatLabel(selectedTicket.status)}
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

export default HelpdeskPortal
