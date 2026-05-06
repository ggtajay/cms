import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'

// ── Constants ──────────────────────────────────────────────────────────────────
const CATEGORIES = ['ACADEMIC', 'MANAGEMENT', 'RAGGING', 'TECHNICAL', 'INFRASTRUCTURE', 'OTHER']
const STATUSES   = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

const STATUS_CONFIG = {
  PENDING:     { label: 'Pending',     bg: 'bg-amber-100',  text: 'text-amber-800',  dot: 'bg-amber-400' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500'  },
  RESOLVED:    { label: 'Resolved',    bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500' },
  REJECTED:    { label: 'Rejected',    bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500'   },
}

const PRIORITY_CONFIG = {
  LOW:    { label: 'Low',    bg: 'bg-gray-100',   text: 'text-gray-700'   },
  MEDIUM: { label: 'Medium', bg: 'bg-orange-100', text: 'text-orange-800' },
  HIGH:   { label: 'High',   bg: 'bg-red-100',    text: 'text-red-800'    },
}

const CATEGORY_ICONS = {
  ACADEMIC: '📚', MANAGEMENT: '🏛️', RAGGING: '🚨',
  TECHNICAL: '💻', INFRASTRUCTURE: '🏗️', OTHER: '📋',
}

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

const PriorityBadge = ({ priority }) => {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {priority === 'HIGH' ? '🔴 ' : priority === 'MEDIUM' ? '🟠 ' : '🟢 '}{cfg.label}
    </span>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminComplaintManagement() {
  const token = localStorage.getItem('token')
  const config = { headers: { Authorization: `Bearer ${token}` } }

  const [complaints, setComplaints] = useState([])
  const [stats, setStats]           = useState({})
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)
  const [staffList, setStaffList]   = useState([])
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast]           = useState('')

  // Filters
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', escalated: '' })
  const [page, setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Action panel state
  const [responseText, setResponseText] = useState('')
  const [assignTo, setAssignTo]         = useState('')
  const [newStatus, setNewStatus]       = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500) }

  const fetchComplaints = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15, ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)) }
      const { data } = await axios.get('/api/complaints', { ...config, params })
      setComplaints(data.complaints)
      setTotalPages(data.pages)
    } catch { /* silent */ }
    finally { setLoading(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page])

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/complaints/stats', config)
      setStats(data)
    } catch { /* silent */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchStaff = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/auth/users', config)
      setStaffList(data.filter(u => ['admin', 'teacher'].includes(u.role)))
    } catch { /* silent */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { fetchComplaints(); fetchStats(); fetchStaff() }, [fetchComplaints, fetchStats, fetchStaff])

  const openDetail = (c) => {
    setSelected(c)
    setResponseText(c.response || '')
    setAssignTo(c.assignedTo?._id || '')
    setNewStatus(c.status || '')
  }

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === selected.status) return
    setActionLoading(true)
    try {
      await axios.put(`/api/complaints/${selected._id}/status`, { status: newStatus }, config)
      showToast(`Status updated to ${newStatus}`)
      fetchComplaints(); fetchStats()
      setSelected(prev => ({ ...prev, status: newStatus }))
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status')
    } finally { setActionLoading(false) }
  }

  const handleRespond = async () => {
    if (!responseText.trim()) return
    setActionLoading(true)
    try {
      await axios.put(`/api/complaints/${selected._id}/respond`, { response: responseText }, config)
      showToast('Response sent successfully')
      fetchComplaints()
      setSelected(prev => ({ ...prev, response: responseText }))
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send response')
    } finally { setActionLoading(false) }
  }

  const handleAssign = async () => {
    if (!assignTo) return
    setActionLoading(true)
    try {
      await axios.put(`/api/complaints/${selected._id}/assign`, { assignedTo: assignTo }, config)
      showToast('Complaint assigned successfully')
      fetchComplaints()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign complaint')
    } finally { setActionLoading(false) }
  }

  const handleEscalate = async () => {
    setActionLoading(true)
    try {
      const { data } = await axios.post('/api/complaints/escalate', {}, config)
      showToast(data.message)
      fetchComplaints(); fetchStats()
    } catch {
      showToast('Escalation failed')
    } finally { setActionLoading(false) }
  }

  return (
    <div className="cms-layout">
      <Sidebar />
      <div className="cms-main">
        <Topbar
          title="Complaint Management"
          subtitle="Review, respond and resolve student & teacher grievances"
          actions={
            <button onClick={handleEscalate} disabled={actionLoading}
              className="cms-btn-secondary text-xs hidden sm:flex">
              ⚡ Run Escalation Check
            </button>
          }
        />

        <main className="cms-content">

          {/* ── Toast ───────────────────────────────────────────────── */}
          <AnimatePresence>
            {toast && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium">
                {toast}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Stats Row ───────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-5 animate-fade-in">
            {[
              { label: 'Total',      value: stats.total,      color: 'bg-slate-100 text-slate-700' },
              { label: 'Pending',    value: stats.pending,    color: 'bg-amber-100 text-amber-700' },
              { label: 'In Progress',value: stats.inProgress, color: 'bg-blue-100 text-blue-700' },
              { label: 'Resolved',   value: stats.resolved,   color: 'bg-green-100 text-green-700' },
              { label: 'Rejected',   value: stats.rejected,   color: 'bg-red-100 text-red-700' },
              { label: 'Ragging',    value: stats.ragging,    color: 'bg-red-200 text-red-900 font-bold' },
              { label: 'Escalated',  value: stats.escalated,  color: 'bg-purple-100 text-purple-800' },
            ].map(s => (
              <div key={s.label} className={`cms-card p-3 flex justify-between items-center ${s.color}`}>
                <span className="text-xs font-semibold">{s.label}</span>
                <span className="text-xl font-extrabold">{s.value ?? '—'}</span>
              </div>
            ))}
          </div>

          {/* ── Filters ─────────────────────────────────────────────── */}
          <div className="cms-card p-4 mb-4 animate-fade-in">
            <div className="flex flex-wrap gap-3 items-end">
              {[
                { key: 'status',    label: 'Status',    options: STATUSES },
                { key: 'category',  label: 'Category',  options: CATEGORIES },
                { key: 'priority',  label: 'Priority',  options: PRIORITIES },
              ].map(({ key, label, options }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                  <select value={filters[key]}
                    onChange={e => { setFilters(p => ({ ...p, [key]: e.target.value })); setPage(1) }}
                    className="p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 min-w-[120px]">
                    <option value="">All</option>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Escalated</label>
                <select value={filters.escalated}
                  onChange={e => { setFilters(p => ({ ...p, escalated: e.target.value })); setPage(1) }}
                  className="p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 min-w-[120px]">
                  <option value="">All</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <button onClick={() => { setFilters({ status: '', category: '', priority: '', escalated: '' }); setPage(1) }}
                className="cms-btn-secondary text-xs">
                Reset Filters
              </button>
            </div>
          </div>

          {/* ── Table ───────────────────────────────────────────────── */}
          <div className="cms-card animate-fade-in overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-14">
                <div className="w-9 h-9 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : complaints.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-center">
                <span className="text-5xl mb-4">📭</span>
                <p className="text-slate-500 font-medium">No complaints match your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Complaint', 'Category', 'Raised By', 'Priority', 'Status', 'Date', 'Action'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {complaints.map(c => (
                      <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 max-w-[220px]">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{CATEGORY_ICONS[c.category]}</span>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 truncate max-w-[160px]">{c.title}</p>
                              <div className="flex gap-1 mt-0.5">
                                {c.isAnonymous && <span className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded font-medium">🕶️ Anon</span>}
                                {c.escalated && <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded font-bold">⚡ Esc.</span>}
                                {c.attachments?.length > 0 && <span className="text-[10px] bg-slate-100 text-slate-500 px-1 rounded">📎 {c.attachments.length}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">{c.category}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-700">
                            {c.isAnonymous ? 'Anonymous' : (c.raisedBy?.name || '—')}
                          </p>
                          {!c.isAnonymous && (
                            <p className="text-xs text-slate-400 capitalize">{c.raisedBy?.role}</p>
                          )}
                        </td>
                        <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                        <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {new Date(c.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => openDetail(c)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold hover:underline">
                            Review →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 p-4 border-t border-slate-200">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="cms-btn-secondary text-xs disabled:opacity-40">← Prev</button>
                <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="cms-btn-secondary text-xs disabled:opacity-40">Next →</button>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* ── Review Panel Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-start justify-end">
            <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative bg-white h-full w-full max-w-lg shadow-2xl overflow-y-auto flex flex-col">

              {/* Panel Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{CATEGORY_ICONS[selected.category]}</span>
                  <h3 className="font-bold text-slate-800 text-sm leading-tight max-w-[280px] truncate">
                    {selected.title}
                  </h3>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">✕</button>
              </div>

              <div className="flex-1 p-5 space-y-5 overflow-y-auto">

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={selected.status} />
                  <PriorityBadge priority={selected.priority} />
                  {selected.isAnonymous && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-semibold">🕶️ Anonymous</span>
                  )}
                  {selected.escalated && (
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-bold">⚡ Escalated</span>
                  )}
                </div>

                {/* Metadata grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Raised By', selected.isAnonymous ? 'Anonymous' : (selected.raisedBy?.name || '—')],
                    ['Role', selected.raisedBy?.role || '—'],
                    ['Category', selected.category],
                    ['Submitted', new Date(selected.createdAt).toLocaleDateString('en-IN')],
                    ['Assigned To', selected.assignedTo?.name || 'Unassigned'],
                    ['Resolved At', selected.resolvedAt ? new Date(selected.resolvedAt).toLocaleDateString('en-IN') : '—'],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">{label}</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5 capitalize">{val}</p>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase mb-2">Description</p>
                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selected.description}
                  </div>
                </div>

                {/* Attachments */}
                {selected.attachments?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase mb-2">Attachments ({selected.attachments.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.attachments.map((url, i) => {
                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
                        return isImage ? (
                          <a key={i} href={url} target="_blank" rel="noreferrer">
                            <img src={url} alt={`Attachment ${i + 1}`}
                              className="h-20 w-20 object-cover rounded-lg border border-slate-200 hover:opacity-80 transition-opacity" />
                          </a>
                        ) : (
                          <a key={i} href={url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-sm text-slate-700 hover:bg-slate-200">
                            📎 File {i + 1}
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-5 space-y-5">

                  {/* Update Status */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Update Status</label>
                    <div className="flex gap-2">
                      <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                        className="flex-1 p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400">
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={handleUpdateStatus} disabled={actionLoading || newStatus === selected.status}
                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Assign */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Assign To Staff</label>
                    <div className="flex gap-2">
                      <select value={assignTo} onChange={e => setAssignTo(e.target.value)}
                        className="flex-1 p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400">
                        <option value="">Select staff...</option>
                        {staffList.map(s => (
                          <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
                        ))}
                      </select>
                      <button onClick={handleAssign} disabled={actionLoading || !assignTo}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                        Assign
                      </button>
                    </div>
                  </div>

                  {/* Response Editor */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                      Admin Response {selected.response ? '(Edit)' : '(Add)'}
                    </label>
                    <textarea value={responseText} onChange={e => setResponseText(e.target.value)}
                      rows={5} placeholder="Write your official response to this complaint..."
                      className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 resize-none" />
                    <button onClick={handleRespond} disabled={actionLoading || !responseText.trim()}
                      className="mt-2 w-full py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                      {actionLoading ? (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      ) : null}
                      Send Response & Notify User
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
