/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import ThemeToggle from './ThemeToggle'
import {
  MdPerson, MdLock, MdNotifications, MdPalette, MdInfo,
  MdSave, MdVisibility, MdVisibilityOff, MdEdit,
} from 'react-icons/md'

const TABS = [
  { id: 'profile', label: 'Profile', icon: <MdPerson size={18} /> },
  { id: 'password', label: 'Password', icon: <MdLock size={18} /> },
  { id: 'notifications', label: 'Notifications', icon: <MdNotifications size={18} /> },
  { id: 'appearance', label: 'Appearance', icon: <MdPalette size={18} /> },
  { id: 'account', label: 'Account Info', icon: <MdInfo size={18} /> },
]

const Toggle = ({ checked, onChange, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--color-border)' }}>
    <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>{label}</span>
    <button onClick={() => onChange(!checked)} style={{
      width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.25s',
      background: checked ? 'linear-gradient(135deg,#4f46e5,#6366f1)' : '#e2e8f0',
    }}>
      <span style={{ position: 'absolute', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', top: '3px', left: checked ? '23px' : '3px', transition: 'left 0.25s', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
    </button>
  </div>
)

const inpCls = { className: 'cms-input' }

export default function Settings({ dashboardPath }) {
  const user = JSON.parse(localStorage.getItem('user')) || {}
  const token = localStorage.getItem('token')
  const config = { headers: { Authorization: `Bearer ${token}` } }

  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState({ name: user.name || '', phone: user.phone || '', address: user.address || '' })
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' })
  const [showPwd, setShowPwd] = useState({ current: false, newPwd: false, confirm: false })
  const [notifs, setNotifs] = useState({ email: true, assignments: true, fees: true, notices: true, complaints: false })
  const [saving, setSaving] = useState(false)

  const dark = document.documentElement.getAttribute('data-theme') === 'dark'

  const saveProfile = async () => {
    if (!profile.name.trim()) { toast.error('Name cannot be empty'); return }
    setSaving(true)
    try {
      await axios.put('/api/settings/profile', profile, config)
      const updated = { ...user, ...profile }
      localStorage.setItem('user', JSON.stringify(updated))
      toast.success('Profile updated successfully!')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update profile')
    } finally { setSaving(false) }
  }

  const savePassword = async () => {
    if (!pwd.current || !pwd.newPwd || !pwd.confirm) { toast.error('Fill all password fields'); return }
    if (pwd.newPwd.length < 8) { toast.error('New password must be at least 8 characters'); return }
    if (pwd.newPwd !== pwd.confirm) { toast.error('New passwords do not match'); return }
    setSaving(true)
    try {
      await axios.put('/api/settings/password', { currentPassword: pwd.current, newPassword: pwd.newPwd }, config)
      toast.success('Password changed successfully!')
      setPwd({ current: '', newPwd: '', confirm: '' })
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to change password')
    } finally { setSaving(false) }
  }

  const pwdInp = (key, placeholder) => (
    <div style={{ position: 'relative', marginBottom: '16px' }}>
      <label className="cms-label">{placeholder}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={showPwd[key] ? 'text' : 'password'}
          className="cms-input"
          value={pwd[key]}
          onChange={e => setPwd({ ...pwd, [key]: e.target.value })}
          placeholder={placeholder}
          style={{ paddingRight: '44px' }}
        />
        <button type="button" onClick={() => setShowPwd({ ...showPwd, [key]: !showPwd[key] })} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
          {showPwd[key] ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
        </button>
      </div>
    </div>
  )

  return (
    <div className="cms-layout">
      <Sidebar />
      <div className="cms-main">
        <Topbar title="Settings" subtitle="Manage your account preferences" />
        <main className="cms-content">
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'start' }} className="settings-grid">

            {/* Tab Nav */}
            <div className="cms-card" style={{ padding: '12px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 12px 6px' }}>Settings</p>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px',
                  background: tab === t.id ? 'linear-gradient(135deg,rgba(79,70,229,.12),rgba(59,130,246,.08))' : 'transparent',
                  border: tab === t.id ? '1px solid rgba(79,70,229,.2)' : '1px solid transparent',
                  color: tab === t.id ? '#4f46e5' : '#64748b', fontWeight: tab === t.id ? 700 : 500,
                  fontSize: '13.5px', cursor: 'pointer', fontFamily: 'Inter,sans-serif', marginBottom: '2px', transition: 'all 0.15s', textAlign: 'left',
                }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="cms-card" style={{ padding: '32px' }}>

              {/* ── Profile ─────────────────────────────────── */}
              {tab === 'profile' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '6px' }}>Profile Settings</h3>
                  <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '28px' }}>Update your display name and contact information.</p>

                  {/* Avatar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', padding: '20px', background: 'var(--color-bg)', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '22px', flexShrink: 0 }}>
                        {(user.name || '?').charAt(0)}
                      </div>
                    )}
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>{user.name}</p>
                      <p style={{ fontSize: '12.5px', color: '#94a3b8' }}>{user.email}</p>
                      <p style={{ fontSize: '12px', color: '#4f46e5', fontWeight: 600, marginTop: '4px', textTransform: 'capitalize' }}>{user.role}</p>
                    </div>
                    <button style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: 'none', border: '1.5px solid var(--color-border)', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter,sans-serif', color: '#64748b' }}>
                      <MdEdit size={15} /> Change Photo
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div>
                      <label className="cms-label">Full Name</label>
                      <input className="cms-input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Your full name" />
                    </div>
                    <div>
                      <label className="cms-label">Phone Number</label>
                      <input className="cms-input" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <label className="cms-label">Address</label>
                      <textarea className="cms-input" rows={3} value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} placeholder="Your address" style={{ resize: 'vertical' }} />
                    </div>
                  </div>

                  <button onClick={saveProfile} disabled={saving} className="cms-btn-primary" style={{ marginTop: '24px' }}>
                    <MdSave size={16} /> {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              )}

              {/* ── Password ─────────────────────────────────── */}
              {tab === 'password' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '6px' }}>Change Password</h3>
                  <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '28px' }}>Use a strong password with at least 8 characters.</p>
                  {pwdInp('current', 'Current Password')}
                  {pwdInp('newPwd', 'New Password')}
                  {pwdInp('confirm', 'Confirm New Password')}
                  {pwd.newPwd && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ height: '6px', borderRadius: '3px', background: '#e2e8f0', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: pwd.newPwd.length < 6 ? '25%' : pwd.newPwd.length < 10 ? '60%' : '100%', background: pwd.newPwd.length < 6 ? '#ef4444' : pwd.newPwd.length < 10 ? '#f59e0b' : '#10b981', borderRadius: '3px', transition: 'all 0.3s' }} />
                      </div>
                      <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                        Password strength: {pwd.newPwd.length < 6 ? '🔴 Weak' : pwd.newPwd.length < 10 ? '🟡 Medium' : '🟢 Strong'}
                      </p>
                    </div>
                  )}
                  <button onClick={savePassword} disabled={saving} className="cms-btn-primary">
                    <MdLock size={16} /> {saving ? 'Changing…' : 'Change Password'}
                  </button>
                </div>
              )}

              {/* ── Notifications ─────────────────────────────── */}
              {tab === 'notifications' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '6px' }}>Notification Preferences</h3>
                  <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '28px' }}>Choose which notifications you'd like to receive.</p>
                  <Toggle checked={notifs.email} onChange={v => setNotifs({ ...notifs, email: v })} label="Email Notifications" />
                  <Toggle checked={notifs.assignments} onChange={v => setNotifs({ ...notifs, assignments: v })} label="Assignment Alerts" />
                  <Toggle checked={notifs.fees} onChange={v => setNotifs({ ...notifs, fees: v })} label="Fee Reminders" />
                  <Toggle checked={notifs.notices} onChange={v => setNotifs({ ...notifs, notices: v })} label="Notice Board Updates" />
                  <Toggle checked={notifs.complaints} onChange={v => setNotifs({ ...notifs, complaints: v })} label="Complaint Status Updates" />
                  <button onClick={() => toast.success('Notification preferences saved!')} className="cms-btn-primary" style={{ marginTop: '24px' }}>
                    <MdSave size={16} /> Save Preferences
                  </button>
                </div>
              )}

              {/* ── Appearance ─────────────────────────────────── */}
              {tab === 'appearance' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '6px' }}>Appearance</h3>
                  <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '28px' }}>Customize how the portal looks for you.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {[
                      { label: 'Light Mode', value: 'light', bg: '#f8fafc', text: '#0f172a', preview: 'bg-white' },
                      { label: 'Dark Mode', value: 'dark', bg: '#080e1c', text: '#e8f4fd', preview: 'bg-slate-900' },
                    ].map(m => {
                      const isActive = document.documentElement.getAttribute('data-theme') === m.value
                      return (
                        <button key={m.value} onClick={() => {
                          document.documentElement.setAttribute('data-theme', m.value)
                          localStorage.setItem('theme', m.value)
                          toast.success(`${m.label} activated`)
                        }} style={{
                          padding: '20px', borderRadius: '16px', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter,sans-serif',
                          background: m.bg, color: m.text,
                          border: isActive ? '2px solid #4f46e5' : '2px solid var(--color-border)',
                          boxShadow: isActive ? '0 0 0 4px rgba(79,70,229,0.15)' : 'none',
                          transition: 'all 0.2s',
                        }}>
                          <div style={{ height: '48px', borderRadius: '8px', background: m.value === 'light' ? '#e2e8f0' : '#1e293b', marginBottom: '12px' }} />
                          <p style={{ fontWeight: 700, fontSize: '14px' }}>{m.label}</p>
                          {isActive && <span style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 700 }}>✓ Active</span>}
                        </button>
                      )
                    })}
                  </div>
                  <p style={{ marginTop: '20px', fontSize: '13px', color: '#94a3b8' }}>💡 You can also use the floating button at the bottom-right corner to toggle themes instantly.</p>
                </div>
              )}

              {/* ── Account Info ─────────────────────────────────── */}
              {tab === 'account' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '6px' }}>Account Information</h3>
                  <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '28px' }}>Read-only account details managed by the system.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { label: 'User ID', value: user.userId || user._id?.slice(-8).toUpperCase() || 'N/A' },
                      { label: 'Full Name', value: user.name || 'N/A' },
                      { label: 'Email Address', value: user.email || 'N/A' },
                      { label: 'Role', value: (user.role || 'N/A').toUpperCase() },
                      { label: 'Department', value: user.department?.name || user.department || 'N/A' },
                      { label: 'Account Created', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A' },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--color-bg)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{row.label}</span>
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text)' }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '24px', padding: '16px 18px', borderRadius: '12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <p style={{ fontSize: '13px', color: '#ef4444', fontWeight: 600, marginBottom: '8px' }}>⚠️ Need to update your email or User ID?</p>
                    <p style={{ fontSize: '12.5px', color: '#94a3b8' }}>Contact the system administrator at admin@universityofpandora.edu</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
      <ThemeToggle />
      <style>{`
        @media (max-width: 768px) { .settings-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
