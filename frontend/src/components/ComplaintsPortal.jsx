/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

// ── Constants ──────────────────────────────────────────────────────────────────
const CATEGORIES = ['ACADEMIC', 'MANAGEMENT', 'RAGGING', 'TECHNICAL', 'INFRASTRUCTURE', 'OTHER']
const PRIORITIES  = ['LOW', 'MEDIUM', 'HIGH']

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
  ACADEMIC:       '📚',
  MANAGEMENT:     '🏛️',
  RAGGING:        '🚨',
  TECHNICAL:      '💻',
  INFRASTRUCTURE: '🏗️',
  OTHER:          '📋',
}

// ── Badge components ───────────────────────────────────────────────────────────
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
export default function ComplaintsPortal({ role }) {
  const token = localStorage.getItem('token')
  const config = { headers: { Authorization: `Bearer ${token}` } }

  const [tab, setTab]               = useState('my')        // 'my' | 'new'
  const [complaints, setComplaints] = useState([])
  const [selected, setSelected]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    title:       '',
    description: '',
    category:    '',
    priority:    'MEDIUM',
    isAnonymous: false,
  })
  const [attachments, setAttachments] = useState([])

  const fetchMyComplaints = async () => {
    setLoading(true)
    try {
      const params = filterStatus ? { status: filterStatus } : {}
      const { data } = await axios.get('/api/complaints/my', { ...config, params })
      setComplaints(data)
    } catch {
      setError('Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'my') fetchMyComplaints()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, filterStatus])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // Auto HIGH priority for RAGGING
      ...(name === 'category' && value === 'RAGGING' ? { priority: 'HIGH' } : {}),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.category) {
      setError('Title, description and category are required')
      return
    }
    setSubmitting(true)
    setError('')

    const fd = new FormData()
    Object.keys(form).forEach(k => fd.append(k, form[k]))
    attachments.forEach(f => fd.append('attachments', f))

    try {
      await axios.post('/api/complaints', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      })
      setSuccess('Complaint submitted successfully! Our team will review it shortly.')
      setForm({ title: '', description: '', category: '', priority: 'MEDIUM', isAnonymous: false })
      setAttachments([])
      if (fileRef.current) fileRef.current.value = ''
      setTab('my')
      fetchMyComplaints()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint')
    } finally {
      setSubmitting(false)
    }
  }

  const title = role === 'teacher' ? 'Teacher' : 'Student'

  return (
    <div className="cms-layout">
      <Sidebar />
      <div className="cms-main">
        <Topbar title="Complaints & Grievances" subtitle="Raise and track your complaints" />

        <main className="cms-content">

          {/* ── Header Stats Strip ────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 animate-fade-in">
            {[
              { label: 'Total',       value: complaints.length,                                       color: 'bg-slate-100 text-slate-700' },
              { label: 'Pending',     value: complaints.filter(c => c.status === 'PENDING').length,    color: 'bg-amber-100 text-amber-700' },
              { label: 'In Progress', value: complaints.filter(c => c.status === 'IN_PROGRESS').length, color: 'bg-blue-100 text-blue-700' },
              { label: 'Resolved',    value: complaints.filter(c => c.status === 'RESOLVED').length,   color: 'bg-green-100 text-green-700' },
            ].map(s => (
              <div key={s.label} className={`cms-card p-4 flex justify-between items-center ${s.color}`}>
                <span className="text-sm font-semibold">{s.label}</span>
                <span className="text-2xl font-extrabold">{loading ? '—' : s.value}</span>
              </div>
            ))}
          </div>

          {/* ── Messages ──────────────────────────────────────────────── */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm flex justify-between">
                <span>{error}</span>
                <button onClick={() => setError('')} className="font-bold hover:text-red-900 ml-4">✕</button>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg text-sm flex justify-between">
                <span>{success}</span>
                <button onClick={() => setSuccess('')} className="font-bold hover:text-green-900 ml-4">✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Tabs ──────────────────────────────────────────────────── */}
          <div className="cms-card animate-fade-in">
            <div className="flex border-b border-slate-200">
              {[
                { key: 'my',  label: '📋 My Complaints' },
                { key: 'new', label: '➕ Raise Complaint' },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                    tab === t.key
                      ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              <AnimatePresence mode="wait">

                {/* ── My Complaints List ───────────────────────────────── */}
                {tab === 'my' && (
                  <motion.div key="my" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>

                    {/* Filter bar */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {['', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map(s => (
                        <button key={s || 'all'}
                          onClick={() => setFilterStatus(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            filterStatus === s
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}>
                          {s || 'All'}
                        </button>
                      ))}
                    </div>

                    {loading ? (
                      <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : complaints.length === 0 ? (
                      <div className="flex flex-col items-center py-14 text-center">
                        <span className="text-5xl mb-4">📭</span>
                        <p className="text-slate-500 font-medium">No complaints found</p>
                        <p className="text-slate-400 text-sm mt-1">Click "Raise Complaint" to submit one</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {complaints.map(c => (
                          <div key={c._id}
                            onClick={() => setSelected(c)}
                            className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-all group">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">{CATEGORY_ICONS[c.category]}</span>
                                  <p className="font-semibold text-slate-800 text-sm truncate">{c.title}</p>
                                  {c.escalated && (
                                    <span className="flex-shrink-0 bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded font-bold">
                                      ⚡ Escalated
                                    </span>
                                  )}
                                  {c.isAnonymous && (
                                    <span className="flex-shrink-0 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded font-semibold">
                                      🕶️ Anon
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-500 text-xs line-clamp-1">{c.description}</p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <span className="text-xs text-slate-400">{c.category}</span>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-xs text-slate-400">
                                    {new Date(c.createdAt).toLocaleDateString('en-IN')}
                                  </span>
                                  {c.attachments?.length > 0 && (
                                    <>
                                      <span className="text-slate-300">•</span>
                                      <span className="text-xs text-slate-400">📎 {c.attachments.length} file{c.attachments.length > 1 ? 's' : ''}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 items-end flex-shrink-0">
                                <StatusBadge status={c.status} />
                                <PriorityBadge priority={c.priority} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── New Complaint Form ───────────────────────────────── */}
                {tab === 'new' && (
                  <motion.div key="new" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">

                      {/* Title */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input type="text" name="title" required value={form.title} onChange={handleChange}
                          placeholder="Brief, descriptive title for your complaint"
                          className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent" />
                      </div>

                      {/* Category + Priority */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Category <span className="text-red-500">*</span>
                          </label>
                          <select name="category" required value={form.category} onChange={handleChange}
                            className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400">
                            <option value="">Select category...</option>
                            {CATEGORIES.map(c => (
                              <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                            ))}
                          </select>
                          {form.category === 'RAGGING' && (
                            <p className="text-xs text-red-600 mt-1 font-semibold">
                              🚨 Ragging complaints are automatically set to HIGH priority and escalated immediately.
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Priority</label>
                          <select name="priority" value={form.priority} onChange={handleChange}
                            disabled={form.category === 'RAGGING'}
                            className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-100">
                            {PRIORITIES.map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea name="description" required value={form.description} onChange={handleChange}
                          rows={5} placeholder="Describe your complaint in detail. Include relevant dates, names, and circumstances."
                          className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 resize-none" />
                        <p className="text-xs text-slate-400 mt-1">{form.description.length}/5000 characters</p>
                      </div>

                      {/* Attachments */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                          Attachments <span className="text-slate-400 font-normal">(optional, max 5 files, 5MB each)</span>
                        </label>
                        <input ref={fileRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt"
                          onChange={e => setAttachments(Array.from(e.target.files))}
                          className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                        {attachments.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {attachments.map((f, i) => (
                              <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                                📎 {f.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Anonymous toggle */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" name="isAnonymous" checked={form.isAnonymous} onChange={handleChange}
                            className="mt-0.5 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                          <div>
                            <p className="text-sm font-semibold text-slate-800">Submit anonymously 🕶️</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Your identity will be hidden from admins in the complaint listing. Note: your account is still associated for tracking purposes.
                            </p>
                          </div>
                        </label>
                      </div>

                      <button type="submit" disabled={submitting}
                        className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                        {submitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                            Submitting...
                          </>
                        ) : 'Submit Complaint'}
                      </button>
                    </form>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

        </main>
      </div>

      {/* ── Detail Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CATEGORY_ICONS[selected.category]}</span>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base leading-tight">{selected.title}</h3>
                    <p className="text-xs text-slate-400">{new Date(selected.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">✕</button>
              </div>

              <div className="p-6 space-y-5">
                {/* Status + Priority row */}
                <div className="flex gap-3 flex-wrap">
                  <StatusBadge status={selected.status} />
                  <PriorityBadge priority={selected.priority} />
                  {selected.isAnonymous && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-semibold">🕶️ Anonymous</span>
                  )}
                  {selected.escalated && (
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-bold">⚡ Escalated</span>
                  )}
                </div>

                {/* Category + Resolved */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 uppercase font-semibold">Category</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{selected.category}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 uppercase font-semibold">Resolved At</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {selected.resolvedAt ? new Date(selected.resolvedAt).toLocaleDateString('en-IN') : '—'}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Description</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                </div>

                {/* Assigned to */}
                {selected.assignedTo && (
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <p className="text-xs text-blue-600 uppercase font-semibold">Assigned To</p>
                    <p className="text-sm font-medium text-blue-800 mt-0.5">{selected.assignedTo?.name || '—'}</p>
                  </div>
                )}

                {/* Admin Response */}
                {selected.response ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-xs text-green-700 uppercase font-bold mb-2">✅ Admin Response</p>
                    <p className="text-sm text-green-800 whitespace-pre-wrap">{selected.response}</p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-700">⏳ No response yet. Our team will respond soon.</p>
                  </div>
                )}

                {/* Attachments */}
                {selected.attachments?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Attachments</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.attachments.map((url, i) => {
                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
                        return isImage ? (
                          <a key={i} href={url} target="_blank" rel="noreferrer">
                            <img src={url} alt={`Attachment ${i + 1}`} className="h-20 w-20 object-cover rounded-lg border border-slate-200 hover:opacity-80 transition-opacity" />
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
