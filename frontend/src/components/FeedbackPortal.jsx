import React, { useState } from 'react'
import axios from 'axios'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import toast, { Toaster } from 'react-hot-toast'
import { MdStar, MdSend, MdFeedback, MdCheckCircle } from 'react-icons/md'

export default function FeedbackPortal({ role, categories, title = 'Feedback Portal' }) {
  const [form, setForm] = useState({ category: '', rating: 0, comments: '' })
  const [hoverRating, setHoverRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.category) { toast.error('Please select a category'); return }
    if (form.rating === 0) { toast.error('Please provide a rating'); return }
    if (!form.comments.trim()) { toast.error('Please provide your comments'); return }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/feedback', form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSubmitted(true)
      toast.success('Feedback submitted successfully!')
    } catch (err) {
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cms-layout">
      <Toaster position="top-center" />
      <Sidebar />
      <div className="cms-main">
        <Topbar title={title} subtitle="Help us improve your experience" />
        <main className="cms-content">
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="cms-card" style={{ padding: '40px', textAlign: submitted ? 'center' : 'left' }}>
              
              {submitted ? (
                <div style={{ padding: '20px 0' }}>
                  <MdCheckCircle size={64} color="#10b981" style={{ margin: '0 auto 20px' }} />
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '10px' }}>Thank You!</h2>
                  <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
                    Your feedback has been received. We appreciate your time in helping us improve the university experience.
                  </p>
                  <button onClick={() => { setSubmitted(false); setForm({ category: '', rating: 0, comments: '' }) }} className="cms-btn-secondary" style={{ padding: '12px 24px', margin: '0 auto', display: 'flex' }}>
                    Submit Another Feedback
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}>
                      <MdFeedback size={24} color="#ffffff" />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '4px' }}>Share your thoughts</h2>
                      <p style={{ color: '#64748b', fontSize: '13.5px' }}>Your input drives our continuous improvement.</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label className="cms-label">Feedback Category *</label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        value={form.category} 
                        onChange={e => setForm({ ...form, category: e.target.value })}
                        style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '14.5px', outline: 'none', appearance: 'none', fontFamily: 'Inter,sans-serif', cursor: 'pointer' }}
                      >
                        <option value="" disabled>Select a category...</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}>▼</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label className="cms-label">How would you rate this? *</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star} type="button"
                          onClick={() => setForm({ ...form, rating: star })}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', transition: 'transform 0.15s' }}
                          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <MdStar size={36} color={(hoverRating || form.rating) >= star ? 'var(--color-brand)' : 'var(--color-border)'} style={{ filter: (hoverRating || form.rating) >= star ? 'drop-shadow(0 2px 8px rgba(79,70,229,0.4))' : 'none', transition: 'all 0.2s' }} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '32px' }}>
                    <label className="cms-label">Detailed Comments *</label>
                    <textarea 
                      value={form.comments} 
                      onChange={e => setForm({ ...form, comments: e.target.value })}
                      placeholder="Please provide specific details..."
                      rows={5}
                      style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1.5px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '14.5px', outline: 'none', fontFamily: 'Inter,sans-serif', resize: 'vertical' }}
                      onFocus={e => e.target.style.borderColor = 'var(--color-brand)'}
                      onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                    />
                  </div>

                  <button type="submit" disabled={loading} className="cms-btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
                    {loading ? 'Submitting...' : <><MdSend size={18} /> Submit Feedback</>}
                  </button>
                </form>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
