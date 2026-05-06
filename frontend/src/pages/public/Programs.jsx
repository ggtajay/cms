import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import PublicNavbar from '../../components/public/PublicNavbar'
import PublicFooter from '../../components/public/PublicFooter'
import ThemeToggle from '../../components/ThemeToggle'
import { MdSearch, MdArrowForward, MdSchool, MdAccessTime, MdMenuBook, MdFilterList, MdClose } from 'react-icons/md'

/* ── School config ──────────────────────────────────────────────────────────── */
const SCHOOLS = [
  { label: 'All Schools', value: 'All' },
  { label: 'Engineering & Technology', value: 'School of Engineering & Technology' },
  { label: 'Management & Liberal Arts', value: 'School of Management & Liberal Arts' },
  { label: 'Basic & Applied Sciences', value: 'School of Basic & Applied Sciences' },
  { label: 'Pharmaceutical Sciences', value: 'School of Pharmaceutical Sciences' },
  { label: 'Legal Studies & Governance', value: 'School of Legal Studies & Governance' },
]

const TYPE_FILTERS = ['All', 'UG', 'PG', 'Diploma', 'PhD']

const SCHOOL_COLORS = {
  'School of Engineering & Technology':    { accent: '#3b82f6', light: '#eff6ff', label: 'Engineering' },
  'School of Management & Liberal Arts':   { accent: '#8b5cf6', light: '#f5f3ff', label: 'Management' },
  'School of Basic & Applied Sciences':    { accent: '#10b981', light: '#ecfdf5', label: 'Sciences' },
  'School of Pharmaceutical Sciences':     { accent: '#f59e0b', light: '#fffbeb', label: 'Pharmacy' },
  'School of Legal Studies & Governance':  { accent: '#ef4444', light: '#fef2f2', label: 'Law' },
}

const TYPE_BADGE = {
  UG:      { bg: '#dbeafe', color: '#1d4ed8', label: 'Undergraduate' },
  PG:      { bg: '#ede9fe', color: '#6d28d9', label: 'Postgraduate' },
  Diploma: { bg: '#d1fae5', color: '#065f46', label: 'Diploma' },
  PhD:     { bg: '#fee2e2', color: '#991b1b', label: 'PhD' },
}

/* ── Eligibility helper based on type ─────────────────────────────────────── */
const getEligibility = (type) => {
  switch (type) {
    case 'UG':      return '10+2 or equivalent ≥ 50%'
    case 'PG':      return 'Relevant Bachelor\'s degree ≥ 50%'
    case 'Diploma': return '10+2 or Graduation (varies)'
    case 'PhD':     return 'Master\'s degree ≥ 55% + entrance'
    default:        return 'See prospectus'
  }
}

/* ── Skeleton card ─────────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-7 border border-slate-200 dark:border-slate-700 animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
      <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
    </div>
    <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
    <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="h-14 bg-slate-100 dark:bg-slate-700 rounded-xl" />
      <div className="h-14 bg-slate-100 dark:bg-slate-700 rounded-xl" />
    </div>
    <div className="h-10 bg-slate-100 dark:bg-slate-700 rounded-xl" />
  </div>
)

/* ── Program Card ─────────────────────────────────────────────────────────── */
const ProgramCard = ({ course, navigate }) => {
  const school = course.departments?.[0] || ''
  const config = SCHOOL_COLORS[school] || { accent: '#6366f1', light: '#eef2ff', label: 'General' }
  const badge = TYPE_BADGE[course.type] || TYPE_BADGE.UG

  return (
    <div
      className="group bg-white dark:bg-slate-800 rounded-2xl p-7 border border-slate-200 dark:border-slate-700 hover:border-transparent hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 16px 40px ${config.accent}22` }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: config.light, color: config.accent }}
        >
          {config.label}
        </span>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: badge.bg, color: badge.color }}
        >
          {badge.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1 leading-snug group-hover:text-[var(--color-brand)] transition-colors duration-200">
        {course.name}
      </h3>
      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mb-4">{course.code}</p>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <MdAccessTime size={12} className="text-slate-400" />
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wide">Duration</p>
          </div>
          <p className="font-bold text-slate-800 dark:text-white text-sm">{course.duration} Years</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <MdMenuBook size={12} className="text-slate-400" />
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wide">Semesters</p>
          </div>
          <p className="font-bold text-slate-800 dark:text-white text-sm">{course.totalSemesters} Sem</p>
        </div>
      </div>

      {/* Eligibility */}
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed flex-1">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Eligibility: </span>
        {getEligibility(course.type)}
      </p>

      {/* CTA */}
      <button
        onClick={() => navigate('/apply/online')}
        className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 group-hover:gap-3"
        style={{
          background: config.light,
          color: config.accent,
          border: `1.5px solid ${config.accent}33`,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = config.accent
          e.currentTarget.style.color = '#fff'
          e.currentTarget.style.borderColor = config.accent
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = config.light
          e.currentTarget.style.color = config.accent
          e.currentTarget.style.borderColor = `${config.accent}33`
        }}
      >
        Apply Now <MdArrowForward size={15} />
      </button>
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────────────────────────── */
export default function Programs() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeSchool, setActiveSchool] = useState('All')
  const [activeType, setActiveType] = useState('All')

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('/api/courses/public')
        setCourses(Array.isArray(res.data) ? res.data.filter(c => c.isActive !== false) : [])
      } catch (err) {
        setError('Failed to load programs. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const filtered = courses.filter(c => {
    const matchSchool = activeSchool === 'All' || c.departments?.includes(activeSchool)
    const matchType = activeType === 'All' || c.type === activeType
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    return matchSchool && matchType && matchSearch
  })

  return (
    <div className="min-h-screen bg-[var(--pub-bg,#f8fafc)] text-[var(--pub-text,#0f172a)] font-[Inter,system-ui,sans-serif] overflow-x-hidden transition-colors duration-300">
      <PublicNavbar />

      {/* ═══ HERO ═══ */}
      <section className="relative pt-28 pb-12 px-6 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--color-brand-light), var(--pub-surface))' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--color-brand)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold text-[var(--color-brand)] tracking-[0.16em] uppercase mb-3">
            Academics
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Our <span className="text-[var(--color-brand)]">Programs</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl mx-auto leading-relaxed mb-8">
            {loading ? 'Loading programs...' : `${courses.length}+ programs across Engineering, Management, Sciences, Pharmacy, Law and more.`}
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto relative">
            <MdSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by program name or code..."
              className="w-full pl-11 pr-5 py-4 rounded-2xl border border-[var(--pub-border,#e2e8f0)] bg-white dark:bg-slate-800 text-[var(--pub-text)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] text-sm shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* ═══ FILTER BAR — Level only (School is chosen via Browse by Department below) ═══ */}
      <div className="sticky top-[68px] z-40 bg-[var(--pub-surface,#fff)] dark:bg-slate-900 border-b border-[var(--pub-border,#e2e8f0)] dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3 flex-wrap">

          {/* Active school pill — visible only when a school is selected */}
          {activeSchool !== 'All' && (
            <span className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-xs font-bold bg-[var(--color-brand)] text-white shadow-sm">
              <MdSchool size={13} />
              {SCHOOLS.find(s => s.value === activeSchool)?.label}
              <button
                onClick={() => setActiveSchool('All')}
                className="ml-0.5 w-4 h-4 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center transition-colors"
                title="Clear school filter"
              >
                <MdClose size={11} />
              </button>
            </span>
          )}

          {/* Divider — only when school pill is active */}
          {activeSchool !== 'All' && (
            <span className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
          )}

          {/* Level filter */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <MdFilterList size={14} /> Level
          </div>
          {TYPE_FILTERS.map(t => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                activeType === t
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                  : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-600 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              {t === 'All' ? 'All Levels' : t === 'UG' ? 'Undergraduate' : t === 'PG' ? 'Postgraduate' : t}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ PROGRAMS GRID ═══ */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Result count */}
          {!loading && !error && (
            <p className="text-slate-400 dark:text-slate-500 text-sm mb-6 font-medium">
              {filtered.length === 0
                ? 'No programs match your filters'
                : `Showing ${filtered.length} program${filtered.length !== 1 ? 's' : ''}${activeSchool !== 'All' ? ` in ${SCHOOLS.find(s => s.value === activeSchool)?.label}` : ''}`
              }
            </p>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-20">
              <p className="text-red-500 font-semibold text-lg mb-2">⚠️ {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2.5 rounded-xl bg-[var(--color-brand)] text-white font-semibold text-sm hover:opacity-90 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Programs */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(course => (
                <ProgramCard key={course._id} course={course} navigate={navigate} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <MdSchool size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-bold text-lg">No programs found</p>
              <p className="text-slate-400 text-sm mt-2 mb-6">Try adjusting your filters or search term</p>
              <button
                onClick={() => { setActiveSchool('All'); setActiveType('All'); setSearch('') }}
                className="px-5 py-2.5 rounded-xl bg-[var(--color-brand)] text-white font-semibold text-sm hover:opacity-90 transition"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══ SCHOOL SUMMARY STRIP ═══ */}
      {!loading && !error && courses.length > 0 && (
        <section className="py-12 px-6 bg-[var(--color-brand-light)] dark:bg-slate-800/50 border-t border-[var(--pub-border,#e2e8f0)] dark:border-slate-700">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-xs font-bold text-[var(--color-brand)] tracking-[0.16em] uppercase mb-2 block">Schools</span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Browse by Department
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {SCHOOLS.slice(1).map(school => {
                const cfg = SCHOOL_COLORS[school.value]
                const count = courses.filter(c => c.departments?.includes(school.value)).length
                return (
                  <button
                    key={school.value}
                    onClick={() => { setActiveSchool(school.value); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className="group text-left p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-transparent hover:-translate-y-1 transition-all duration-300"
                    style={{ '--hover-shadow': `0 12px 32px ${cfg.accent}22` }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 12px 32px ${cfg.accent}22` }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '' }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-500 group-hover:scale-110"
                      style={{ background: cfg.light }}>
                      <MdSchool size={20} style={{ color: cfg.accent }} />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{count} Programs</p>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">{school.label}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <PublicFooter />
      <ThemeToggle />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');`}</style>
    </div>
  )
}
