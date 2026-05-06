import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdPersonAdd, MdCheckCircle, MdContentCopy, MdCheck } from 'react-icons/md'

/* ── Stepper ─────────────────────────────────────────────── */
const steps = ['Personal Info', 'Academic Info', 'Parent Info']

const Stepper = ({ step }) => (
  <div className="flex items-center mb-8">
    {steps.map((label, i) => {
      const state = i + 1 < step ? 'done' : i + 1 === step ? 'active' : 'inactive'
      return (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-1">
            <div className={`cms-step-circle ${state}`}>
              {state === 'done' ? <MdCheck size={18} /> : i + 1}
            </div>
            <span className={`text-[11px] font-semibold whitespace-nowrap ${state === 'active' ? 'text-brand-600' : state === 'done' ? 'text-emerald-600' : 'text-slate-400'}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`cms-step-line ${i + 1 < step ? 'done' : 'inactive'}`} />
          )}
        </React.Fragment>
      )
    })}
  </div>
)

/* ── Field wrapper ───────────────────────────────────────── */
const Field = ({ label, children, span2 }) => (
  <div className={span2 ? 'md:col-span-2' : ''}>
    <label className="cms-label">{label}</label>
    {children}
  </div>
)

const AddStudent = () => {
  const [step, setStep] = useState(1)

  const [departments, setDepartments] = useState([])
  const [courses,     setCourses]     = useState([])
  const [branches,    setBranches]    = useState([])

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', dateOfBirth: '', gender: 'male',
    address: '', bloodGroup: '', category: '', aadhaar: '',
    department: '', course: '', branch: '', semester: 1, section: 'A',
    parentName: '', parentPhone: '', parentEmail: '', parentRelation: 'Parent',
  })

  const [profileImage, setProfileImage] = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [credentials,  setCredentials]  = useState(null)

  const token  = localStorage.getItem('token')
  const config = { headers: { Authorization: `Bearer ${token}` } }

  // Fetch departments
  useEffect(() => {
    axios.get('/api/academic/departments', config)
      .then(r => setDepartments(r.data))
      .catch(() => toast.error('Failed to load departments'))
  }, []) // eslint-disable-line

  // Fetch courses on dept change
  useEffect(() => {
    if (!formData.department) { setCourses([]); setFormData(p => ({ ...p, course: '', branch: '', semester: 1 })); return }
    axios.get(`/api/academic/departments/${formData.department}/courses`, config)
      .then(r => setCourses(r.data))
      .catch(() => toast.error('Failed to load courses'))
  }, [formData.department]) // eslint-disable-line

  // Fetch branches on course change
  useEffect(() => {
    if (!formData.department || !formData.course) { setBranches([]); setFormData(p => ({ ...p, branch: '', semester: 1 })); return }
    axios.get(`/api/academic/departments/${formData.department}/courses/${formData.course}/branches`, config)
      .then(r => { setBranches(r.data); if (r.data.length === 1) setFormData(p => ({ ...p, branch: r.data[0]._id })) })
      .catch(() => toast.error('Failed to load branches'))
  }, [formData.course]) // eslint-disable-line

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const submitData = new FormData()
      Object.entries(formData).forEach(([k, v]) => submitData.append(k, v))
      if (profileImage) submitData.append('profileImage', profileImage)
      const res = await axios.post('/api/students', submitData, config)
      toast.success(res.data.message)
      setCredentials(res.data.credentials)
      setFormData({
        name: '', email: '', phone: '', dateOfBirth: '', gender: 'male',
        address: '', bloodGroup: '', category: '', aadhaar: '',
        department: '', course: '', branch: '', semester: 1, section: 'A',
        parentName: '', parentPhone: '', parentEmail: '', parentRelation: 'Parent',
      })
      setProfileImage(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add student')
    } finally {
      setLoading(false)
    }
  }

  const closeCredentials = () => { setCredentials(null); setStep(1) }

  const copy = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!') }

  const selectedCourse  = courses.find(c => c._id === formData.course)
  const totalSemesters  = selectedCourse?.totalSemesters || 8

  const inputCls    = 'cms-input'
  const selectCls   = `${inputCls} bg-white`
  const disabledCls = `${inputCls} bg-slate-50 cursor-not-allowed opacity-60`

  return (
    <div className="cms-layout">
      <Sidebar />
      <Toaster position="top-right" toastOptions={{ className: 'font-sans text-sm' }} />

      <div className="cms-main">
        <Topbar title="Add New Student" subtitle="Fill in the details to enrol a student" />

        <main className="cms-content">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="cms-card p-8 relative">

              {/* Stepper */}
              <Stepper step={step} />

              <form onSubmit={onSubmit}>

                {/* ── STEP 1: Personal Info ──────────────────── */}
                {step === 1 && (
                  <div className="animate-fade-in">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e8edf5]">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4f46e5,#3b82f6)' }}>
                        <MdPersonAdd size={18} className="text-white" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">Personal Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Full Name *"><input type="text" name="name" value={formData.name} onChange={onChange} required placeholder="Enter full name" className={inputCls} /></Field>
                      <Field label="Email Address *"><input type="email" name="email" value={formData.email} onChange={onChange} required placeholder="student@example.com" className={inputCls} /></Field>
                      <Field label="Phone Number *"><input type="tel" name="phone" value={formData.phone} onChange={onChange} required placeholder="+91 1234567890" className={inputCls} /></Field>
                      <Field label="Date of Birth *"><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={onChange} required className={inputCls} /></Field>
                      <Field label="Gender *">
                        <select name="gender" value={formData.gender} onChange={onChange} className={selectCls}>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </Field>
                      <Field label="Blood Group">
                        <select name="bloodGroup" value={formData.bloodGroup} onChange={onChange} className={selectCls}>
                          <option value="">Select…</option>
                          {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                      </Field>
                      <Field label="Category">
                        <select name="category" value={formData.category} onChange={onChange} className={selectCls}>
                          <option value="">Select…</option>
                          {['General','OBC','SC','ST','EWS'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </Field>
                      <Field label="Aadhaar Number"><input type="text" name="aadhaar" value={formData.aadhaar} onChange={onChange} placeholder="12-digit Aadhaar" className={inputCls} /></Field>
                      <Field label="Address *" span2><textarea name="address" value={formData.address} onChange={onChange} required rows={2} placeholder="Enter full address" className={`${inputCls} resize-none`} /></Field>
                      <Field label="Profile Photo" span2>
                        <input type="file" accept="image/*" onChange={e => setProfileImage(e.target.files[0] || null)}
                          className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition-all cursor-pointer" />
                      </Field>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Academic Info ──────────────────── */}
                {step === 2 && (
                  <div className="animate-fade-in">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e8edf5]">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0369a1,#38bdf8)' }}>
                        <MdPersonAdd size={18} className="text-white" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">Academic Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Department *">
                        <select name="department" value={formData.department} onChange={onChange} required className={selectCls}>
                          <option value="">Select Department</option>
                          {departments.map(d => <option key={d._id} value={d._id}>{d.name} ({d.code})</option>)}
                        </select>
                      </Field>
                      <Field label="Course *">
                        <select name="course" value={formData.course} onChange={onChange} required disabled={!formData.department} className={formData.department ? selectCls : disabledCls}>
                          <option value="">Select Course</option>
                          {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
                        </select>
                      </Field>
                      <Field label="Branch *">
                        <select name="branch" value={formData.branch} onChange={onChange} required disabled={!formData.course} className={formData.course ? selectCls : disabledCls}>
                          <option value="">Select Branch</option>
                          {branches.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}
                        </select>
                      </Field>
                      <Field label="Semester *">
                        <select name="semester" value={formData.semester} onChange={onChange} disabled={!formData.course} className={formData.course ? selectCls : disabledCls}>
                          {Array.from({ length: totalSemesters }, (_, i) => i + 1).map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Section">
                        <input type="text" name="section" value={formData.section} onChange={onChange} placeholder="e.g. A, B, C" className={inputCls} />
                      </Field>
                    </div>
                    <div className="mt-6 p-4 rounded-2xl bg-brand-50 border border-brand-100">
                      <p className="text-sm text-brand-700 font-medium">
                        🔐 Student ID and password will be auto-generated after submission.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Parent Info ────────────────────── */}
                {step === 3 && (
                  <div className="animate-fade-in">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e8edf5]">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
                        <MdPersonAdd size={18} className="text-white" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">Parent / Guardian Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Parent / Guardian Name *"><input type="text" name="parentName" value={formData.parentName} onChange={onChange} required placeholder="Enter parent name" className={inputCls} /></Field>
                      <Field label="Parent Phone *"><input type="tel" name="parentPhone" value={formData.parentPhone} onChange={onChange} required placeholder="+91 1234567890" className={inputCls} /></Field>
                      <Field label="Parent Email"><input type="email" name="parentEmail" value={formData.parentEmail} onChange={onChange} placeholder="parent@example.com" className={inputCls} /></Field>
                      <Field label="Relation"><input type="text" name="parentRelation" value={formData.parentRelation} onChange={onChange} placeholder="e.g. Father, Mother" className={inputCls} /></Field>
                    </div>
                  </div>
                )}

                {/* ── Navigation ───────────────────────────── */}
                <div className="flex justify-between mt-8 pt-5 border-t border-[#e8edf5]">
                  {step > 1 ? (
                    <button type="button" onClick={() => setStep(s => s - 1)} className="cms-btn-ghost border border-[#e8edf5]">
                      ← Back
                    </button>
                  ) : <div />}

                  {step < 3 ? (
                    <button type="button" onClick={() => setStep(s => s + 1)} className="cms-btn-primary">
                      Next Step →
                    </button>
                  ) : (
                    <button type="submit" disabled={loading} className="cms-btn-primary disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                          Submitting…
                        </span>
                      ) : '✓ Submit Admission'}
                    </button>
                  )}
                </div>
              </form>

              {/* ── Credentials Modal ─────────────────────── */}
              {credentials && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl p-6">
                  <div className="bg-white rounded-2xl shadow-2xl border border-[#e8edf5] p-8 max-w-md w-full text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-emerald-50">
                      <MdCheckCircle size={36} className="text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">Admission Successful!</h3>
                    <p className="text-sm text-slate-400 mb-6">Student ID has been generated.</p>

                    <div className="bg-[#fafbff] rounded-2xl p-4 text-left mb-5 border border-[#e8edf5] space-y-3">
                      {[
                        { label: 'User ID / Roll Number', value: credentials.userId },
                        { label: 'Password',              value: credentials.password },
                      ].map(row => (
                        <div key={row.label}>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{row.label}</p>
                          <div className="flex items-center justify-between bg-white border border-[#e8edf5] rounded-xl px-3 py-2">
                            <span className="font-mono font-bold text-slate-800 text-sm">{row.value}</span>
                            <button onClick={() => copy(row.value)} className="text-slate-400 hover:text-brand-600 transition-colors">
                              <MdContentCopy size={17} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5 mb-5 text-sm">
                      {credentials.emailSent
                        ? <p className="text-emerald-600 font-medium">✓ Credentials sent to student's email</p>
                        : <p className="text-red-500 font-medium">⚠️ Email failed — please resend from student list</p>
                      }
                      {credentials.smsSent
                        ? <p className="text-emerald-600 font-medium">✓ Credentials sent via SMS</p>
                        : <p className="text-slate-400">ℹ️ SMS delivery skipped / mock</p>
                      }
                    </div>

                    <button onClick={closeCredentials} className="cms-btn-primary w-full justify-center py-3">
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AddStudent
