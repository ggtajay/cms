/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import PublicNavbar from '../../components/public/PublicNavbar'
import PublicFooter from '../../components/public/PublicFooter'
import ThemeToggle from '../../components/ThemeToggle'
import { MdLocationOn, MdPhone, MdEmail, MdAccessTime, MdSend, MdCheckCircle } from 'react-icons/md'
import toast, { Toaster } from 'react-hot-toast'

/* ═══════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════ */
const CONTACTS = [
  { icon: MdLocationOn, title: 'Address', lines: ['Pandora Valley Campus,', 'Amazon Forest Region,', 'Pandora – PX 110001'], color: 'text-[var(--color-brand)]', bg: 'bg-[var(--color-brand)]/10', border: 'border-[var(--color-brand)]/20' },
  { icon: MdPhone, title: 'Phone', lines: ['+91 98765 43210', '+91 98765 43211 (Admissions)'], color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { icon: MdEmail, title: 'Email', lines: ['info@universityofpandora.edu', 'admissions@universityofpandora.edu'], color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { icon: MdAccessTime, title: 'Office Hours', lines: ['Mon – Fri: 9:00 AM – 5:00 PM', 'Saturday: 9:00 AM – 1:00 PM'], color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
]

const DEPTS = [
  { dept: 'Admissions Office', email: 'admissions@uop.edu', phone: '+91 98765 43211' },
  { dept: 'Exam & Results', email: 'exams@uop.edu', phone: '+91 98765 43212' },
  { dept: 'Fee & Finance', email: 'finance@uop.edu', phone: '+91 98765 43213' },
  { dept: 'Library', email: 'library@uop.edu', phone: '+91 98765 43214' },
  { dept: 'Hostel Office', email: 'hostel@uop.edu', phone: '+91 98765 43215' },
  { dept: 'Student Welfare', email: 'welfare@uop.edu', phone: '+91 98765 43216' },
]

/* ═══════════════════════════════════════════════
   ANIMATION HOOKS
   ═══════════════════════════════════════════════ */
function useScrollReveal(options = {}) {
  const ref = useRef(null)
  const { threshold = 0.1, delay = 0, duration = 700 } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.style.opacity = '0'
    el.style.transform = 'translateY(40px) scale(0.97)'
    el.style.transition = `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`
    el.style.willChange = 'opacity, transform'

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0) scale(1)'
          el.style.willChange = 'auto'
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, delay, duration])

  return ref
}

function useStaggerReveal(itemCount, baseDelay = 100) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const items = container.children
    Array.from(items).forEach((item, i) => {
      item.style.opacity = '0'
      item.style.transform = 'translateY(30px)'
      item.style.transition = `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${i * baseDelay}ms, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${i * baseDelay}ms`
      item.style.willChange = 'opacity, transform'
    })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          Array.from(items).forEach((item) => {
            item.style.opacity = '1'
            item.style.transform = 'translateY(0)'
            item.style.willChange = 'auto'
          })
          observer.unobserve(container)
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [itemCount, baseDelay])

  return containerRef
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════ */
function ContactCard({ contact, index }) {
  const Icon = contact.icon
  const ref = useScrollReveal({ delay: index * 100 })

  return (
    <div
      ref={ref}
      className={`group bg-white dark:bg-slate-800 rounded-2xl p-7 border ${contact.border} dark:border-slate-700 hover:border-[var(--color-brand)] dark:hover:border-[var(--color-brand-light)] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-default`}
    >
      <div className={`w-12 h-12 rounded-xl ${contact.bg} flex items-center justify-center ${contact.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={22} />
      </div>
      <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white mb-3">
        {contact.title}
      </h3>
      {contact.lines.map((line, i) => (
        <p key={i} className="text-slate-500 dark:text-slate-400 text-[13.5px] leading-relaxed">
          {line}
        </p>
      ))}
    </div>
  )
}

function DeptCard({ dept, index }) {
  const ref = useScrollReveal({ delay: index * 80 })

  return (
    <div
      ref={ref}
      className="group bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:border-[var(--color-brand)] dark:hover:border-[var(--color-brand-light)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default"
    >
      <p className="font-bold text-slate-900 dark:text-white text-[14.5px] mb-2">
        {dept.dept}
      </p>
      <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1.5 mb-1">
        <span className="text-[var(--color-brand)]">✉</span> {dept.email}
      </p>
      <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1.5">
        <span className="text-[var(--color-brand)]">☎</span> {dept.phone}
      </p>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [isHeroLoaded, setIsHeroLoaded] = useState(false)
    // Hero entrance
  useEffect(() => {
    const timer = setTimeout(() => setIsHeroLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Stagger refs
  const contactsRef = useStaggerReveal(CONTACTS.length, 100)
  const deptsRef = useStaggerReveal(DEPTS.length, 80)

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill all required fields')
      return
    }
    setSent(true)
    toast.success('Message sent! We\'ll respond within 24 hours.')
  }, [form])

  const handleReset = useCallback(() => {
    setSent(false)
    setForm({ name: '', email: '', subject: '', message: '' })
  }, [])

  const updateField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const inputClasses = "w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-[var(--color-brand)] dark:focus:border-[var(--color-brand-light)] focus:ring-4 focus:ring-[var(--color-brand)]/10 dark:focus:ring-[var(--color-brand-light)]/10"

  const labelClasses = "block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2"

  return (
    <div className="min-h-screen bg-[var(--pub-bg,#f8fafc)] text-[var(--pub-text,#0f172a)] font-[Inter,system-ui,sans-serif] overflow-x-hidden transition-colors duration-300">
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'dark:bg-slate-800 dark:text-white dark:border dark:border-slate-700',
          duration: 4000,
        }}
      />
      <PublicNavbar />

      {/* ═══════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-16 px-6 text-center bg-gradient-to-br from-[var(--color-brand-light)] via-[var(--pub-surface)] to-[var(--pub-bg)] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-brand)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className={`relative z-10 max-w-2xl mx-auto transition-all duration-1000 ${isHeroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block text-xs font-bold text-[var(--color-brand)] tracking-[0.16em] uppercase mb-4">
            Get in Touch
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
            Contact <span className="text-[var(--color-brand)]">Us</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
            Have questions about admissions, programs, or campus life? We're here to help.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CONTACT CARDS
          ═══════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-[var(--pub-bg,#f8fafc)] dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div ref={contactsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CONTACTS.map((c, i) => (
              <ContactCard key={c.title} contact={c} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FORM + DEPARTMENTS
          ═══════════════════════════════════════════════ */}
      <section className="py-16 px-6 pb-24 bg-[var(--pub-bg,#f8fafc)] dark:bg-slate-900">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-8">

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-none">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8">
                Send us a Message
              </h2>

              {sent ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <MdCheckCircle size={40} className="text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                    Message Sent!
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-8">
                    We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-8 py-3 rounded-xl bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClasses}>Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => updateField('name', e.target.value)}
                        className={inputClasses}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => updateField('email', e.target.value)}
                        className={inputClasses}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={e => updateField('subject', e.target.value)}
                      className={inputClasses}
                      placeholder="What is this about?"
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>Message *</label>
                    <textarea
                      value={form.message}
                      onChange={e => updateField('message', e.target.value)}
                      rows={5}
                      className={`${inputClasses} resize-y`}
                      placeholder="Write your message here..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="group w-full py-4 rounded-xl bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-dark)] text-white font-bold text-base shadow-lg shadow-[var(--color-brand)]/30 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden relative"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <MdSend size={18} className="relative z-10" />
                    <span className="relative z-10">Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Department Directory */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
              Department Directory
            </h2>
            <div ref={deptsRef} className="space-y-3">
              {DEPTS.map((d, i) => (
                <DeptCard key={d.dept} dept={d} index={i} />
              ))}
            </div>
          </div>

        </div>
      </section>

      <PublicFooter />
      <ThemeToggle />
    </div>
  )
}