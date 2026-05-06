/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import { MdVisibility, MdVisibilityOff, MdPerson, MdLock, MdArrowForward, MdDashboard } from 'react-icons/md'
import Logo from '../../components/Logo'

const Login = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [focused, setFocused] = useState(null)

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async e => {
    e.preventDefault()
    if (!form.identifier.trim()) { toast.error('Enter your User ID or Email'); return }
    if (!form.password.trim()) { toast.error('Enter your password'); return }
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', { identifier: form.identifier, password: form.password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('user', JSON.stringify(res.data))
      toast.success(`Welcome, ${res.data.name}`)
      const routes = {
        superadmin: '/superadmin/dashboard', admin: '/admin/dashboard',
        teacher: '/teacher/dashboard', student: '/student/dashboard',
        accountant: '/accountant/dashboard', librarian: '/librarian/dashboard', parent: '/parent/dashboard',
      }
      setTimeout(() => navigate(routes[res.data.role] || '/'), 700)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Incorrect credentials')
    } finally { setLoading(false) }
  }

  const inpStyle = name => ({
    width: '100%', padding: '13px 16px 13px 44px', fontSize: '14.5px',
    fontFamily: 'Inter,sans-serif', color: 'var(--pub-text)', boxSizing: 'border-box',
    background: '#ffffff',
    border: `1.5px solid ${focused === name ? 'var(--color-brand)' : '#e2e8f0'}`,
    borderRadius: '12px', outline: 'none',
    boxShadow: focused === name ? '0 0 0 3px var(--color-brand-light)' : '0 1px 2px rgba(0,0,0,0.02)',
    transition: 'all 0.2s',
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)' }}>
      <Toaster position="top-center" toastOptions={{ style: { fontFamily: 'Inter,sans-serif', borderRadius: '10px' } }} />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px', position: 'relative'
      }}>
        
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Card */}
        <div style={{ width: '100%', maxWidth: '440px', background: 'rgba(255,255,255,0.85)', borderRadius: '24px', border: '1px solid #ffffff', backdropFilter: 'blur(20px)', padding: '48px 44px', boxShadow: '0 24px 80px rgba(15,23,42,0.08)', position: 'relative', zIndex: 1 }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <Logo width="60px" height="60px" />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '8px' }}>Welcome back</h2>
            <p style={{ fontSize: '14.5px', color: '#64748b' }}>Enter your credentials to access your portal</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit}>
            {/* Identifier */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>User ID or Email</label>
              <div style={{ position: 'relative' }}>
                <MdPerson size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: focused === 'id' ? 'var(--color-brand)' : '#94a3b8', transition: 'color 0.2s' }} />
                <input type="text" name="identifier" value={form.identifier} onChange={onChange} placeholder="e.g. STU260001" autoComplete="username"
                  style={inpStyle('id')} onFocus={() => setFocused('id')} onBlur={() => setFocused(null)} />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <MdLock size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: focused === 'pw' ? 'var(--color-brand)' : '#94a3b8', transition: 'color 0.2s' }} />
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={onChange} placeholder="••••••••" autoComplete="current-password"
                  style={{ ...inpStyle('pw'), paddingRight: '44px' }} onFocus={() => setFocused('pw')} onBlur={() => setFocused(null)} />
                <button type="button" onClick={() => setShowPass(p => !p)} tabIndex={-1} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand)'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                  {showPass ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: '12px', fontFamily: 'Inter,sans-serif',
              fontSize: '15px', fontWeight: 800, letterSpacing: '0.02em',
              background: loading ? 'var(--color-brand-light)' : 'linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))',
              color: '#ffffff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(79,70,229,0.25)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.3)' } }}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.25)' } }}>
              {loading ? (
                <><svg style={{ animation: 'spin .9s linear infinite' }} width="18" height="18" fill="none" viewBox="0 0 24 24"><circle opacity=".25" cx="12" cy="12" r="10" stroke="#ffffff" strokeWidth="4" /><path opacity=".75" fill="#ffffff" d="M4 12a8 8 0 018-8v8z" /></svg>Signing in</>
              ) : (<>Sign In to Dashboard <MdArrowForward size={18} /></>)}
            </button>
          </form>

          <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '13.5px', fontWeight: 600, fontFamily: 'Inter,sans-serif', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand)'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              ← Return to Home
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder { color: #94a3b8 !important; font-weight: 500; }
      `}</style>
    </div>
  )
}

export default Login

