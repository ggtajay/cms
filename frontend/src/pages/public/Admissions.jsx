import React, { useEffect, useRef, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicNavbar from '../../components/public/PublicNavbar'
import PublicFooter from '../../components/public/PublicFooter'
import ThemeToggle from '../../components/ThemeToggle'
import { MdCheckCircle, MdArrowForward, MdCalendarToday, MdHelpOutline } from 'react-icons/md'

/* ═══════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════ */
const STEPS = [
  { n: '01', title: 'Check Eligibility', desc: 'Review eligibility criteria for your desired program before starting.' },
  { n: '02', title: 'Fill Application Form', desc: 'Complete the online form with accurate academic and personal details.' },
  { n: '03', title: 'Upload Documents', desc: 'Submit scanned copies of mark sheets, ID proof, and photograph.' },
  { n: '04', title: 'Pay Application Fee', desc: 'Pay the non-refundable fee of ₹500 via our secure portal.' },
  { n: '05', title: 'Receive Confirmation', desc: 'Get an email with your Application ID to track status.' },
  { n: '06', title: 'Attend Counseling', desc: 'Attend merit-based counseling or entrance test as scheduled.' },
]

const DATES = [
  { event: 'Application Portal Opens', date: 'Mar 1, 2026', status: 'done' },
  { event: 'Last Date to Apply', date: 'Jun 30, 2026', status: 'active' },
  { event: 'Entrance Test (UoP-CET)', date: 'Jul 15, 2026', status: 'upcoming' },
  { event: 'Merit List Declaration', date: 'Jul 25, 2026', status: 'upcoming' },
  { event: 'Counseling Round 1', date: 'Aug 1–7, 2026', status: 'upcoming' },
  { event: 'Classes Commence', date: 'Sep 1, 2026', status: 'upcoming' },
]

const DOCS = ['Class 10 Mark Sheet', 'Class 12 Mark Sheet', 'Transfer Certificate', 'Migration Certificate', 'Character Certificate', 'Passport-size Photos (4)', 'Aadhaar Card / Passport', 'Category Certificate (if applicable)']

/* ═══════════════════════════════════════════════
   ANIMATION HOOKS
   ═══════════════════════════════════════════════ */
function useScrollReveal(options = {}) {
  const ref = useRef(null)
  const { threshold = 0.1, delay = 0, duration = 600 } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.style.opacity = '0'
    el.style.transform = 'translateY(30px)'
    el.style.transition = `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`
    el.style.willChange = 'opacity, transform'

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          el.style.willChange = 'auto'
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, delay, duration])

  return ref
}

function useStaggerReveal(itemCount, baseDelay = 80) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const items = container.children
    Array.from(items).forEach((item, i) => {
      item.style.opacity = '0'
      item.style.transform = 'translateY(25px)'
      item.style.transition = `opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${i * baseDelay}ms, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${i * baseDelay}ms`
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
function StepCard({ step, index }) {
  const ref = useScrollReveal({ delay: index * 80 })

  return (
    <div
      ref={ref}
      className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-[var(--color-brand)] dark:hover:border-[var(--color-brand-light)] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-400"
    >
      {/* Step number watermark */}
      <span className="absolute top-3 right-4 text-5xl font-black text-[var(--color-brand)]/10 dark:text-[var(--color-brand)]/5 leading-none select-none">
        {step.n}
      </span>

      <div className="relative z-10">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-brand)]/10 dark:bg-[var(--color-brand)]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
          <span className="text-[var(--color-brand)] font-black text-sm">{step.n}</span>
        </div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">
          {step.title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          {step.desc}
        </p>
      </div>
    </div>
  )
}

function DateRow({ date, index }) {
  const ref = useScrollReveal({ delay: index * 60 })

  const statusStyles = {
    done: 'bg-emerald-500 text-white border-emerald-500',
    active: 'bg-[var(--color-brand)] text-white border-[var(--color-brand)] shadow-lg shadow-[var(--color-brand)]/30',
    upcoming: 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
  }

  const iconColor = date.status === 'done' ? 'text-emerald-500' : date.status === 'active' ? 'text-white' : 'text-[var(--color-brand)]'

  return (
    <div
      ref={ref}
      className={`flex items-center gap-4 rounded-xl px-5 py-3.5 border transition-all duration-300 hover:-translate-x-1 ${statusStyles[date.status]}`}
    >
      <MdCalendarToday size={18} className={iconColor} />
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm truncate ${date.status === 'active' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
          {date.event}
        </p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${date.status === 'done' ? 'bg-white/20 text-white' :
          date.status === 'active' ? 'bg-white/25 text-white' :
            'bg-[var(--color-brand)]/10 text-[var(--color-brand)]'
        }`}>
        {date.date}
      </span>
    </div>
  )
}

function DocItem({ doc, index }) {
  const ref = useScrollReveal({ delay: index * 50 })

  return (
    <div ref={ref} className="flex items-center gap-3 group">
      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
        <MdCheckCircle size={14} className="text-emerald-500" />
      </div>
      <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{doc}</span>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function Admissions() {
  const navigate = useNavigate()
  const [isHeroLoaded, setIsHeroLoaded] = useState(false)

  const handleNavigate = useCallback((path) => navigate(path), [navigate])

  useEffect(() => {
    const timer = setTimeout(() => setIsHeroLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const stepsRef = useStaggerReveal(STEPS.length, 80)

  return (
    <div className="min-h-screen bg-[var(--pub-bg,#f8fafc)] text-[var(--pub-text,#0f172a)] font-[Inter,system-ui,sans-serif] overflow-x-hidden transition-colors duration-300">
      <PublicNavbar />

      {/* ═══ HERO ═══ */}
      <section className="relative pt-28 pb-12 px-6 text-center bg-gradient-to-br from-[var(--color-brand-light)] via-[var(--pub-surface)] to-[var(--pub-bg)] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--color-brand)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className={`relative z-10 max-w-2xl mx-auto transition-all duration-800 ${isHeroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-block text-xs font-bold text-[var(--color-brand)] tracking-[0.16em] uppercase mb-3">
            Join Us
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
            <span className="text-[var(--color-brand)]">Admissions</span> 2026–27
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-lg mx-auto leading-relaxed mb-6">
            Take the first step toward an extraordinary education. Applications now open for all programs.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => handleNavigate('/apply/online')}
              className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white font-bold text-sm shadow-lg shadow-[var(--color-brand)]/30 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
            >
              Apply Online
              <MdArrowForward size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => handleNavigate('/apply/track')}
              className="px-7 py-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm border-2 border-slate-200 dark:border-slate-700 hover:border-[var(--color-brand)] dark:hover:border-[var(--color-brand-light)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
            >
              Track Application
            </button>
          </div>
        </div>
      </section>

      {/* ═══ HOW TO APPLY ═══ */}
      <section className="py-14 px-6 bg-[var(--pub-bg,#f8fafc)] dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold text-[var(--color-brand)] tracking-[0.16em] uppercase mb-2">
              Process
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              How to Apply
            </h2>
          </div>
          <div ref={stepsRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STEPS.map((step, i) => (
              <StepCard key={step.n} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ IMPORTANT DATES ═══ */}
      <section className="py-14 px-6 bg-[var(--color-brand-light)] dark:bg-slate-800/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold text-[var(--color-brand)] tracking-[0.16em] uppercase mb-2">
              Calendar
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Important Dates
            </h2>
          </div>
          <div className="space-y-2.5">
            {DATES.map((d, i) => (
              <DateRow key={d.event} date={d} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DOCUMENTS + HELP ═══ */}
      <section className="py-14 px-6 bg-[var(--pub-bg,#f8fafc)] dark:bg-slate-900">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-8 items-start">

          {/* Documents */}
          <div className="lg:col-span-3">
            <span className="inline-block text-xs font-bold text-[var(--color-brand)] tracking-[0.16em] uppercase mb-2">
              Checklist
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-6">
              Required Documents
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {DOCS.map((doc, i) => (
                <DocItem key={doc} doc={doc} index={i} />
              ))}
            </div>
          </div>

          {/* Help Card */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-[var(--color-brand-light)] to-[var(--pub-surface)] dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-[var(--color-brand)]/20 dark:border-slate-600">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-brand)]/10 dark:bg-[var(--color-brand)]/20 flex items-center justify-center mb-4">
                <MdHelpOutline size={24} className="text-[var(--color-brand)]" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">
                Need Assistance?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-5">
                Our counselors are available Mon–Sat, 9AM–5PM to guide you.
              </p>
              <div className="space-y-2 mb-5">
                <p className="text-sm font-bold text-[var(--color-brand)]">📞 +91 98765 43210</p>
                <p className="text-sm font-bold text-[var(--color-brand)]">✉ admissions@universityofpandora.edu</p>
              </div>
              <button
                onClick={() => handleNavigate('/contact')}
                className="w-full py-3 rounded-xl bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Contact Admissions Office
              </button>
            </div>
          </div>

        </div>
      </section>

      <PublicFooter />
      <ThemeToggle />
    </div>
  )
}