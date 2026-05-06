import React, { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicNavbar from '../../components/public/PublicNavbar'
import PublicFooter from '../../components/public/PublicFooter'
import ThemeToggle from '../../components/ThemeToggle'
import { MdVerified, MdStars, MdGroups, MdScience, MdArrowForward } from 'react-icons/md'

/* ─── DATA ─── */
const TIMELINE = [
  { year: '2001', title: 'The Inception', description: 'University of Pandora founded by the Pandora Educational Trust with a vision to redefine holistic education and research.' },
  { year: '2005', title: 'First Graduating Class', description: 'Our first batch of B.Tech students graduated with honors, and the institution proudly received NAAC A+ accreditation.' },
  { year: '2010', title: 'Global Horizons', description: 'Postgraduate & PhD programs launched alongside groundbreaking international research collaborations with top global tech institutes.' },
  { year: '2016', title: 'Scale & Reach', description: 'New state-of-the-art research center inaugurated, and we crossed the monumental 5,000+ active student enrollment milestone.' },
  { year: '2020', title: 'Digital Campus', description: 'Complete digital transformation. The Smart Campus initiative rolled out with AI-driven academic tracking and smart hostel facilities.' },
  { year: '2025', title: 'Industry Integration', description: 'Strategic Amazon Research Institute partnership established, boasting over 12,000 enrolled students globally.' },
]

const LEADERSHIP = [
  { name: 'Prof. Aryan Singhania', role: 'Chancellor', photo: '/leader_aryan_singhania.png', color: 'var(--color-brand)', quote: 'Shaping tomorrow\'s leaders through excellence and innovation.' },
  { name: 'Dr. Meera Krishnan', role: 'Vice Chancellor', photo: '/leader_meera_krishnan.png', color: '#3b82f6', quote: 'Every student deserves a world-class education experience.' },
  { name: 'Prof. Rajiv Tomar', role: 'Dean of Academics', photo: '/leader_rajiv_tomar.png', color: '#10b981', quote: 'Academic rigor and industry relevance go hand in hand.' },
  { name: 'Dr. Sunita Verma', role: 'Director of Research', photo: '/leader_sunita_verma.png', color: '#8b5cf6', quote: 'Our research bridges Amazonian nature and modern science.' },
  { name: 'Mr. Ankit Bose', role: 'Registrar', photo: '/leader_ankit_bose.png', color: '#ef4444', quote: 'Seamless administration empowers academic excellence.' },
  { name: 'Dr. Priya Nair', role: 'Dean of Student Affairs', photo: '/leader_priya_nair.png', color: '#0ea5e9', quote: 'Student well-being is the foundation of everything we do.' },
]

const VALUES = [
  { icon: MdVerified, title: 'Integrity', desc: 'We uphold the highest standards of academic honesty and ethical conduct in all we do.', color: 'var(--color-brand)' },
  { icon: MdScience, title: 'Innovation', desc: 'We foster a culture of curiosity, research, and creative problem-solving.', color: '#3b82f6' },
  { icon: MdGroups, title: 'Inclusivity', desc: 'We celebrate diversity and ensure every student feels welcome and valued.', color: '#10b981' },
  { icon: MdStars, title: 'Excellence', desc: 'We pursue the highest quality in teaching, research, and student outcomes.', color: '#8b5cf6' },
]

/* ─── ANIMATION HOOK ─── */
function useScrollReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.classList.add('opacity-0', 'translate-y-10')
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease'

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove('opacity-0', 'translate-y-10')
          observer.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}

/* ─── STAT COUNTER ─── */
function StatCounter({ value, label, suffix = '' }) {
  const [count, setCount] = React.useState(0)
  const ref = useRef(null)
  const animated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true
        const duration = 2000
        const steps = 60
        const increment = value / steps
        let current = 0
        const timer = setInterval(() => {
          current += increment
          if (current >= value) {
            setCount(value)
            clearInterval(timer)
          } else {
            setCount(Math.floor(current))
          }
        }, duration / steps)
      }
    }, { threshold: 0.5 })

    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref} className="text-center p-5">
      <div className="text-4xl md:text-5xl font-black text-[var(--color-brand)] leading-none">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-widest">
        {label}
      </div>
    </div>
  )
}

/* ─── ANIMATED SECTION WRAPPER ─── */
function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useScrollReveal()
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={className}>
      {children}
    </div>
  )
}

/* ─── MAIN COMPONENT ─── */
export default function About() {
  const navigate = useNavigate()
  const handleNavigate = useCallback(() => navigate('/admissions'), [navigate])

  return (
    <div className="min-h-screen bg-[var(--pub-bg,#f8fafc)] text-[var(--pub-text,#0f172a)] font-[Inter,system-ui,sans-serif] overflow-x-hidden">
      <PublicNavbar />

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-24 px-6 text-center bg-gradient-to-br from-[var(--color-brand)] via-[var(--color-brand-dark)] to-[var(--color-brand)] overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-white/[0.06] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-20 w-[400px] h-[400px] rounded-full bg-white/[0.04] blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold text-[var(--color-brand-light)] tracking-[0.16em] uppercase mb-4">
            Who We Are
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            About University of <span className="text-[var(--color-brand-light)]">Pandora</span>
          </h1>
          <p className="text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
            Established in 2001, the University of Pandora has grown from a vision of academic excellence into a globally recognized institution shaping minds for a complex world.
          </p>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCounter value={12000} label="Students Enrolled" suffix="+" />
          <StatCounter value={25} label="Years of Excellence" suffix="+" />
          <StatCounter value={150} label="Global Partners" suffix="+" />
          <StatCounter value={98} label="Placement Rate" suffix="%" />
        </div>
      </section>

      {/* ─── MISSION & VISION ─── */}
      <section className="py-24 px-6 bg-[var(--pub-bg,#f8fafc)]">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold text-[var(--color-brand)] tracking-[0.16em] uppercase mb-4">
                Our Purpose
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">
                Mission, Vision & Values
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-7">
            {[
              { label: 'Our Mission', color: 'var(--color-brand)', text: 'To provide world-class education that empowers students to lead, innovate, and serve society with integrity and compassion, rooted in the pristine environment of the Amazon.' },
              { label: 'Our Vision', color: '#3b82f6', text: 'To be recognized as a globally leading institution for research, innovation, and holistic development — a beacon of knowledge in harmony with nature.' },
              { label: 'Our Values', color: '#10b981', text: 'Integrity, Innovation, Inclusivity, and Excellence form the four pillars of everything we do at the University of Pandora.' },
            ].map((item, i) => (
              <FadeIn key={item.label} delay={i * 150}>
                <div className="group bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200/80 dark:border-slate-700 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div
                    className="w-12 h-1 rounded-full mb-6"
                    style={{ background: item.color }}
                  />
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4">{item.label}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[15px]">
                    {item.text}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TIMELINE ─── */}
      <section className="relative py-28 px-6 bg-[#0B0F19] overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-20">
              <span className="inline-block text-sm font-bold text-indigo-400 tracking-[0.2em] uppercase mb-4">
                Our Journey
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-5">
                History & Milestones
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto text-lg">
                A legacy of excellence, innovation, and continuous growth shaping the leaders of tomorrow.
              </p>
            </div>
          </FadeIn>

          <div className="relative">
            {/* Desktop center line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent" />

            {/* Mobile left line */}
            <div className="md:hidden absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent" />

            {TIMELINE.map((item, i) => {
              const isLeft = i % 2 === 0
              return (
                <FadeIn key={item.year} delay={i * 100}>
                  <div className={`relative flex items-start mb-12 md:mb-16 last:mb-0 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

                    {/* Dot */}
                    <div className="absolute left-6 md:left-1/2 w-4 h-4 rounded-full bg-indigo-400 -translate-x-1/2 mt-6 z-10 shadow-[0_0_20px_rgba(129,140,248,0.6)] border-[3px] border-[#0B0F19] ring-2 ring-indigo-500/40" />

                    {/* Content */}
                    <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12 md:ml-auto'}`}>
                      <div className="group relative">
                        {/* Hover glow */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-0 group-hover:opacity-30 transition duration-500" />

                        <div className="relative p-7 rounded-[2rem] bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1">
                          <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-black text-sm tracking-widest mb-4">
                            {item.year}
                          </span>
                          <h3 className="text-white text-xl font-bold mb-2">
                            {item.title}
                          </h3>
                          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Spacer */}
                    <div className="hidden md:block md:w-1/2" />
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── CORE VALUES ─── */}
      <section className="py-24 px-6 bg-[var(--pub-bg,#f8fafc)]">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold text-[var(--color-brand)] tracking-[0.16em] uppercase mb-4">
                What We Stand For
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">
                Our Core Values
              </h2>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => {
              const Icon = v.icon
              return (
                <FadeIn key={v.title} delay={i * 120}>
                  <div className="group bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-700 text-center hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `${v.color}15`, color: v.color }}
                    >
                      <Icon size={28} />
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-3">{v.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── LEADERSHIP ─── */}
      <section id="departments" className="relative py-24 px-6 bg-[var(--color-brand-dark)] overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-white/[0.03] blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold text-[var(--color-brand-light)] tracking-[0.16em] uppercase mb-4">
                Meet the Team
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
                University Leadership
              </h2>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LEADERSHIP.map((leader, i) => (
              <FadeIn key={leader.name} delay={i * 100}>
                <div className="group relative rounded-2xl p-6 text-center border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] hover:-translate-y-2 transition-all duration-400 overflow-hidden cursor-default">
                  {/* Subtle glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{ boxShadow: `inset 0 0 60px ${leader.color}18` }}
                  />

                  {/* Photo with colored ring */}
                  <div
                    className="relative w-24 h-24 mx-auto mb-5 rounded-full p-[3px] group-hover:scale-105 transition-transform duration-700"
                    style={{ background: `linear-gradient(135deg, ${leader.color}, ${leader.color}80)` }}
                  >
                    <img
                      src={leader.photo}
                      alt={leader.name}
                      className="w-full h-full rounded-full object-cover object-top bg-slate-700"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    {/* Fallback initial */}
                    <div
                      className="w-full h-full rounded-full items-center justify-center text-white text-2xl font-black hidden"
                      style={{ background: leader.color }}
                    >
                      {leader.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                  </div>

                  {/* Name */}
                  <p className="text-white font-bold text-base mb-1 leading-tight">{leader.name}</p>

                  {/* Role badge */}
                  <span
                    className="inline-block text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1 rounded-full mb-4"
                    style={{ background: `${leader.color}25`, color: leader.color, border: `1px solid ${leader.color}40` }}
                  >
                    {leader.role}
                  </span>

                  {/* Quote — slides up on hover */}
                  <p className="text-white/50 text-xs leading-relaxed italic opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-20 transition-all duration-400 overflow-hidden">
                    "{leader.quote}"
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-6 bg-[var(--pub-bg,#f8fafc)] text-center">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-5">
              Ready to be Part of Our Story?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 max-w-xl mx-auto">
              Join over 12,000 students who chose Pandora for their academic journey.
            </p>
            <button
              onClick={handleNavigate}
              className="inline-flex items-center gap-2.5 px-10 py-4 rounded-xl bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-dark)] text-white font-extrabold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              aria-label="Start your admission application"
            >
              Start Your Application
              <MdArrowForward size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </FadeIn>
        </div>
      </section>

      <PublicFooter />
      <ThemeToggle />
    </div>
  )
}