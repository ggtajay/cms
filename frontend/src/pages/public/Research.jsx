import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicNavbar from '../../components/public/PublicNavbar'
import PublicFooter from '../../components/public/PublicFooter'
import ThemeToggle from '../../components/ThemeToggle'
import { MdScience, MdGroups, MdLibraryBooks, MdArrowForward, MdStar, MdPublic } from 'react-icons/md'

/* ─── DATA ─── */
const RESEARCH_AREAS = [
  { icon: MdScience, title: 'Tropical Biotechnology', desc: 'Pioneering research into Amazonian flora and fauna for medical and agricultural breakthroughs.', color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { icon: MdPublic, title: 'Environmental Science', desc: 'Studying climate change, rainforest preservation, and sustainable development in tropical ecosystems.', color: '#3b82f6', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { icon: MdGroups, title: 'AI & Data Science', desc: 'Applied machine learning for smart campus systems, predictive analytics, and real-world problem solving.', color: 'var(--color-brand)', bg: 'bg-brand-500/10', border: 'border-brand-500/30' },
  { icon: MdLibraryBooks, title: 'Humanities & Social Studies', desc: 'Interdisciplinary research on indigenous cultures, governance, and regional socioeconomics.', color: '#8b5cf6', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { icon: MdStar, title: 'Materials Science', desc: 'Engineering next-gen materials from renewable tropical resources for industrial applications.', color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { icon: MdScience, title: 'Health & Medicine', desc: 'Clinical and epidemiological research addressing tropical diseases and community healthcare.', color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30' },
]

const PUBLICATIONS = [
  { title: 'Novel Antimicrobial Peptides from Amazonian Amphibians', authors: 'Dr. Meera Krishnan, Prof. Rajiv Tomar', journal: 'Nature Biotechnology', year: '2025', tag: 'High Impact' },
  { title: 'AI-Driven Deforestation Detection Using Satellite Imagery', authors: 'Dr. Sunita Verma, Mr. Ankit Bose', journal: 'IEEE Transactions on Geoscience', year: '2025', tag: 'Featured' },
  { title: 'Climate Resilience Strategies for Tropical Agriculture', authors: 'Prof. Aryan Singhania, Dr. Priya Nair', journal: 'Global Environmental Change', year: '2024', tag: 'Open Access' },
  { title: 'Blockchain-Based Land Registry for Indigenous Communities', authors: 'Dr. Meera Krishnan', journal: 'Journal of Information Technology', year: '2024', tag: 'Award Winner' },
]

const STATS = [
  { value: 200, suffix: '+', label: 'Research Papers Published' },
  { value: 45, suffix: '+', label: 'Active Research Projects' },
  { value: 12, suffix: '', label: 'Research Centers' },
  { value: 8, suffix: 'Cr+', label: 'Research Funding (₹)' },
]

/* ─── HOOKS ─── */
function useScrollReveal(delay = 0) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(36px)'
    el.style.transition = `opacity 700ms cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform 700ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`
    el.style.willChange = 'opacity, transform'
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
        el.style.willChange = 'auto'
        obs.unobserve(el)
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])
  return ref
}

function useCountUp(end) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const done = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true
        const steps = 60, inc = end / steps
        let cur = 0
        const t = setInterval(() => {
          cur += inc
          if (cur >= end) { setCount(end); clearInterval(t) }
          else setCount(Math.floor(cur))
        }, 2000 / steps)
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [end])
  return [count, ref]
}

/* ─── SUB-COMPONENTS ─── */
function StatItem({ value, suffix, label }) {
  const [count, ref] = useCountUp(value)
  return (
    <div ref={ref} className="text-center group">
      <p className="text-3xl md:text-4xl font-black text-[var(--color-brand)] group-hover:scale-110 transition-transform duration-300">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 tracking-wider uppercase font-semibold">{label}</p>
    </div>
  )
}

function AreaCard({ area, index }) {
  const ref = useScrollReveal(index * 100)
  return (
    <div ref={ref} className={`group bg-white dark:bg-slate-800 rounded-2xl p-7 border ${area.border} dark:border-slate-700 hover:shadow-xl hover:-translate-y-2 transition-all duration-400 cursor-default`}>
      <div className={`w-14 h-14 rounded-xl ${area.bg} dark:bg-opacity-20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`} style={{ color: area.color }}>
        <area.icon size={28} />
      </div>
      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-3">{area.title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{area.desc}</p>
    </div>
  )
}

function PubCard({ pub, index }) {
  const ref = useScrollReveal(index * 80)
  const tagColors = {
    'High Impact': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    'Featured': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    'Open Access': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    'Award Winner': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  }
  return (
    <div ref={ref} className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-[var(--color-brand)] dark:hover:border-[var(--color-brand)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between gap-4 mb-3">
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${tagColors[pub.tag] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{pub.tag}</span>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{pub.year}</span>
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-[var(--color-brand)] transition-colors">{pub.title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{pub.authors}</p>
      <p className="text-xs font-semibold text-[var(--color-brand)] italic">{pub.journal}</p>
    </div>
  )
}

/* ─── MAIN ─── */
export default function Research() {
  const navigate = useNavigate()
  const [heroLoaded, setHeroLoaded] = useState(false)
  useEffect(() => { const t = setTimeout(() => setHeroLoaded(true), 100); return () => clearTimeout(t) }, [])

  const areasHeadRef = useScrollReveal()
  const pubsHeadRef = useScrollReveal()

  return (
    <div className="min-h-screen bg-[var(--pub-bg,#f8fafc)] text-[var(--pub-text,#0f172a)] font-[Inter,system-ui,sans-serif] overflow-x-hidden transition-colors duration-300">
      <PublicNavbar />

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6 text-center bg-gradient-to-br from-[var(--color-brand)] via-[var(--color-brand-dark)] to-[var(--color-brand)] overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-white/[0.06] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-20 w-[400px] h-[400px] rounded-full bg-white/[0.04] blur-3xl pointer-events-none" />
        <div className={`relative z-10 max-w-3xl mx-auto transition-all duration-1000 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block text-xs font-bold text-white/70 tracking-[0.16em] uppercase mb-4">Innovation & Discovery</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Research at <span className="text-white/80">University of Pandora</span>
          </h1>
          <p className="text-lg text-white/75 max-w-2xl mx-auto leading-relaxed mb-8">
            Pioneering interdisciplinary research that solves real-world problems — from tropical ecosystems to artificial intelligence.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-[var(--color-brand)] font-bold hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300"
          >
            Collaborate With Us <MdArrowForward size={20} />
          </button>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => <StatItem key={s.label} value={s.value} suffix={s.suffix} label={s.label} />)}
        </div>
      </section>

      {/* RESEARCH AREAS */}
      <section className="py-24 px-6 bg-[var(--pub-bg,#f8fafc)] dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div ref={areasHeadRef} className="text-center mb-16">
            <span className="inline-block text-xs font-bold text-[var(--color-brand)] tracking-[0.16em] uppercase mb-4">Our Focus</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">Research Areas</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-4 text-lg">Six interdisciplinary pillars driving discovery and innovation.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {RESEARCH_AREAS.map((area, i) => <AreaCard key={area.title} area={area} index={i} />)}
          </div>
        </div>
      </section>

      {/* PUBLICATIONS */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div ref={pubsHeadRef} className="text-center mb-16">
            <span className="inline-block text-xs font-bold text-[var(--color-brand)] tracking-[0.16em] uppercase mb-4">Publications</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">Recent Research</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {PUBLICATIONS.map((pub, i) => <PubCard key={pub.title} pub={pub} index={i} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[var(--pub-bg,#f8fafc)] dark:bg-slate-900 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-5">
            Join Our Research Community
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            PhD positions, post-doctoral fellowships, and collaborative research opportunities are open year-round.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/admissions')} className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-dark)] text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              Apply for PhD <MdArrowForward size={20} />
            </button>
            <button onClick={() => navigate('/contact')} className="inline-flex items-center gap-2 px-10 py-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] dark:hover:text-[var(--color-brand)] hover:-translate-y-0.5 transition-all duration-300">
              Contact Research Office
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />
      <ThemeToggle />
    </div>
  )
}
