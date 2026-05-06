import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdSchool, MdCheckCircle, MdContentCopy, MdCheck } from 'react-icons/md'

/* ── Stepper ─────────────────────────────────────────────── */
const steps = ['Personal Info', 'Professional Info', 'Other Details']

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

const Field = ({ label, children, span2, span3 }) => (
  <div className={span2 ? 'md:col-span-2' : span3 ? 'md:col-span-3' : ''}>
    <label className="cms-label">{label}</label>
    {children}
  </div>
)

const AddFaculty = () => {
  const [step, setStep] = useState(1)
  const [departments, setDepartments] = useState([])

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', dateOfBirth: '', gender: 'male', address: '',
    designation: 'Assistant Professor', department: '', qualification: '',
    specialization: '', experience: 0, salary: 0,
    emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
    subjects: '',
  })

  const [profileImage, setProfileImage] = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [credentials,  setCredentials]  = useState(null)

  const token  = localStorage.getItem('token')
  const config = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    axios.get('/api/academic/departments', config)
      .then(r => setDepartments(r.data))
      .catch(() => toast.error('Failed to load departments'))
  }, []) // eslint-disable-line

  const onChange    = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
  const onFileChange = (e) => setProfileImage(e.target.files[0] || null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { emergencyContactName, emergencyContactPhone, emergencyContactRelation, subjects, ...rest } = formData
      const submitData = new FormData()
      Object.entries(rest).forEach(([k, v]) => submitData.append(k, v))
      submitData.append('subjects', JSON.stringify(subjects.split(',').map(s => s.trim()).filter(Boolean)))
      submitData.append('emergencyContact', JSON.stringify({ name: emergencyContactName, phone: emergencyContactPhone, relation: emergencyContactRelation }))
      if (profileImage) submitData.append('profileImage', profileImage)
      const res = await axios.post('/api/faculty', submitData, config)
      toast.success(res.data.message)
      setCredentials(res.data.credentials)
      setFormData({
        name: '', email: '', phone: '', dateOfBirth: '', gender: 'male', address: '',
        designation: 'Assistant Professor', department: '', qualification: '',
        specialization: '', experience: 0, salary: 0,
        emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '', subjects: '',
      })
      setProfileImage(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add faculty')
    } finally {
      setLoading(false)
    }
  }

  const closeCredentials = () => { setCredentials(null); setStep(1) }
  const copy = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!') }

  const inputCls  = 'cms-input'
  const selectCls = `${inputCls} bg-white`

  return (
    <div className="cms-layout">
      <Sidebar />
      <Toaster position="top-right" toastOptions={{ className: 'font-sans text-sm' }} />

      <div className="cms-main">
        <Topbar title="Add New Faculty" subtitle="Register a new faculty member" />

        <main className="cms-content">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="cms-card p-8 relative">

              <Stepper step={step} />

              <form onSubmit={onSubmit}>

                {/* STEP 1: Personal Info */}
                {step === 1 && (
                  <div className="animate-fade-in">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e8edf5]">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4f46e5,#3b82f6)' }}>
                        <MdSchool size={18} className="text-white" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">Personal Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Full Name *"><input type="text" name="name" value={formData.name} onChange={onChange} required placeholder="Enter full name" className={inputCls} /></Field>
                      <Field label="Email Address *"><input type="email" name="email" value={formData.email} onChange={onChange} required placeholder="faculty@example.com" className={inputCls} /></Field>
                      <Field label="Phone Number *"><input type="tel" name="phone" value={formData.phone} onChange={onChange} required placeholder="+91 1234567890" className={inputCls} /></Field>
                      <Field label="Date of Birth *"><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={onChange} required className={inputCls} /></Field>
                      <Field label="Gender *">
                        <select name="gender" value={formData.gender} onChange={onChange} className={selectCls}>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </Field>
                      <Field label="Address *" span2><textarea name="address" value={formData.address} onChange={onChange} required rows={2} placeholder="Enter full address" className={`${inputCls} resize-none`} /></Field>
                      <Field label="Profile Photo" span2>
                        <input type="file" accept="image/*" onChange={onFileChange}
                          className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition-all cursor-pointer" />
                      </Field>
                    </div>
                  </div>
                )}

                {/* STEP 2: Professional Info */}
                {step === 2 && (
                  <div className="animate-fade-in">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e8edf5]">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0369a1,#38bdf8)' }}>
                        <MdSchool size={18} className="text-white" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">Professional Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Designation *">
                        <select name="designation" value={formData.designation} onChange={onChange} required className={selectCls}>
                          {['Professor','Associate Professor','Assistant Professor','Lecturer','HOD','Lab Assistant'].map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Department *">
                        <select name="department" value={formData.department} onChange={onChange} required className={selectCls}>
                          <option value="">Select Department</option>
                          {departments.map(d => <option key={d._id} value={d._id}>{d.name} ({d.code})</option>)}
                        </select>
                      </Field>
                      <Field label="Qualification *"><input type="text" name="qualification" value={formData.qualification} onChange={onChange} required placeholder="e.g. PhD, M.Tech" className={inputCls} /></Field>
                      <Field label="Specialization"><input type="text" name="specialization" value={formData.specialization} onChange={onChange} placeholder="e.g. AI, Machine Learning" className={inputCls} /></Field>
                      <Field label="Experience (Years) *"><input type="number" name="experience" value={formData.experience} onChange={onChange} required min="0" className={inputCls} /></Field>
                      <Field label="Monthly Salary (₹)"><input type="number" name="salary" value={formData.salary} onChange={onChange} min="0" className={inputCls} /></Field>
                    </div>
                    <div className="mt-6 p-4 rounded-2xl bg-brand-50 border border-brand-100">
                      <p className="text-sm text-brand-700 font-medium">🔐 Faculty ID will be auto-generated after submission.</p>
                    </div>
                  </div>
                )}

                {/* STEP 3: Other Details */}
                {step === 3 && (
                  <div className="animate-fade-in">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e8edf5]">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
                        <MdSchool size={18} className="text-white" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">Subjects & Emergency Contact</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 mb-6">
                      <Field label="Teaching Subjects (comma-separated)">
                        <input type="text" name="subjects" value={formData.subjects} onChange={onChange} placeholder="Data Structures, Algorithms, DBMS" className={inputCls} />
                      </Field>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Emergency Contact</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Field label="Name"><input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={onChange} placeholder="Contact name" className={inputCls} /></Field>
                      <Field label="Phone"><input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={onChange} placeholder="Contact phone" className={inputCls} /></Field>
                      <Field label="Relation"><input type="text" name="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={onChange} placeholder="Relation" className={inputCls} /></Field>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-5 border-t border-[#e8edf5]">
                  {step > 1 ? (
                    <button type="button" onClick={() => setStep(s => s - 1)} className="cms-btn-ghost border border-[#e8edf5]">← Back</button>
                  ) : <div />}
                  {step < 3 ? (
                    <button type="button" onClick={() => setStep(s => s + 1)} className="cms-btn-primary">Next Step →</button>
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
                      ) : '✓ Register Faculty'}
                    </button>
                  )}
                </div>
              </form>

              {/* Credentials Modal */}
              {credentials && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl p-6">
                  <div className="bg-white rounded-2xl shadow-2xl border border-[#e8edf5] p-8 max-w-md w-full text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                      <MdCheckCircle size={36} className="text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">Registration Successful!</h3>
                    <p className="text-sm text-slate-400 mb-6">Faculty ID has been generated.</p>

                    <div className="bg-[#fafbff] rounded-2xl p-4 text-left mb-5 border border-[#e8edf5] space-y-3">
                      {[
                        { label: 'Faculty ID', value: credentials.userId },
                        { label: 'Password',   value: credentials.password },
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

                    <div className="mb-5 text-sm">
                      {credentials.emailSent
                        ? <p className="text-emerald-600 font-medium">✓ Credentials sent to faculty's email</p>
                        : <p className="text-red-500 font-medium">⚠️ Email failed — please resend from faculty list</p>
                      }
                    </div>

                    <button onClick={closeCredentials} className="cms-btn-primary w-full justify-center py-3">Done</button>
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

export default AddFaculty
