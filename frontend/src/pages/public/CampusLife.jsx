import React, { useEffect, useRef, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicNavbar from '../../components/public/PublicNavbar'
import PublicFooter from '../../components/public/PublicFooter'
import ThemeToggle from '../../components/ThemeToggle'

/* ─── DATA ─── */
const GALLERY_ITEMS = [
  { src: '/campus_aerial.png',    label: 'Aerial View',       area: 'aerial' },
  { src: '/campus_gate.png',      label: 'Main Gate',          area: 'gate' },
  { src: '/campus_building.png',  label: 'Academic Block',     area: 'building' },
  { src: '/campus_library.png',   label: 'Central Library',    area: 'library' },
  { src: '/campus_cafeteria.png', label: 'Student Cafeteria',  area: 'cafeteria' },
  { src: '/campus_students.png',  label: 'Student Life',       area: 'students' },
  { src: '/campus_lab.png',       label: 'Innovation Lab',     area: 'lab' },
  { src: '/campus_sports.png',    label: 'Sports Complex',     area: 'sports' },
  { src: '/campus_dorm.png',      label: 'Student Residence',  area: 'dorm' },
]

const FACILITIES = [
  { title: 'Central Library', desc: '200,000+ books, 50,000+ e-journals, 24/7 digital access, reading halls for 500+', emoji: '📚', color: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  { title: 'Sports Complex', desc: 'Olympic pool, cricket ground, football field, basketball courts, indoor gymnasium', emoji: '🏅', color: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  { title: 'Student Hostels', desc: 'Separate hostel blocks for boys & girls, mess, Wi-Fi, 24/7 security, laundry', emoji: '🏠', color: 'border-brand-500', bg: 'bg-brand-500/10', text: 'text-brand-600 dark:text-brand-400' },
  { title: 'Innovation Lab', desc: 'State-of-the-art lab with 3D printers, robotics kits, AI/ML workstations', emoji: '🔬', color: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
  { title: 'Cafeteria & Food Court', desc: 'Multi-cuisine food court, healthy meal plans, vegan options, open 6AM–11PM', emoji: '🍽️', color: 'border-red-500', bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
  { title: 'Health Centre', desc: 'On-campus clinic with doctors, nurses, ambulance facility, mental health counselors', emoji: '🏥', color: 'border-sky-500', bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400' },
]

const CLUBS = [
  { name: 'Coding Club', members: 340, emoji: '💻', gradient: 'from-blue-500 to-indigo-600' },
  { name: 'Debate Society', members: 180, emoji: '🎤', gradient: 'from-orange-500 to-red-500' },
  { name: 'Photography Club', members: 220, emoji: '📷', gradient: 'from-purple-500 to-pink-500' },
  { name: 'Music & Arts', members: 290, emoji: '🎵', gradient: 'from-emerald-500 to-teal-600' },
  { name: 'Environment Club', members: 160, emoji: '🌿', gradient: 'from-green-500 to-lime-600' },
  { name: 'Entrepreneurship Cell', members: 210, emoji: '🚀', gradient: 'from-amber-500 to-orange-600' },
  { name: 'Sports Council', members: 500, emoji: '⚽', gradient: 'from-red-500 to-rose-600' },
  { name: 'Cultural Committee', members: 380, emoji: '🎭', gradient: 'from-violet-500 to-purple-600' },
]

const QUICK_STATS = [
  { value: 50, suffix: '+', label: 'Student Clubs' },
  { value: 200, suffix: 'K+', label: 'Books in Library' },
  { value: 15, suffix: '+', label: 'Sports Facilities' },
  { value: 24, suffix: '/7', label: 'Campus Security' },
]

/* ─── ANIMATION HOOKS ─── */
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
      item.style.transition = `opacity 0.6s ease ${i * baseDelay}ms, transform 0.6s ease ${i * baseDelay}ms`
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

function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const hasAnimated = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true
        const steps = 60
        const increment = end / steps
        let current = 0
        const timer = setInterval(() => {
          current += increment
          if (current >= end) {
            setCount(end)
            clearInterval(timer)
          } else {
            setCount(Math.floor(current))
          }
        }, duration / steps)
      }
    }, { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration])
  return [count, ref]
}

/* ─── SUB-COMPONENTS ─── */
function StatCard({ value, suffix, label }) {
  const [count, ref] = useCountUp(value)
  return (
    <div ref={ref} className="text-center group">
      <p className="text-3xl md:text-4xl font-black text-brand-500 dark:text-brand-400 group-hover:scale-110 transition-transform duration-300">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 tracking-wider uppercase font-semibold">
        {label}
      </p>
    </div>
  )
}

function BentoImage({ src, label, style }) {
  const [isHovered, setIsHovered] = useState(false)
  return (
    <div
      style={style}
      className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-shadow duration-500 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={src}
        alt={label}
        loading="lazy"
        className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${isHovered ? 'scale-110' : 'scale-100'}`}
        onError={(e) => { e.target.style.display = 'none' }}
      />
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex items-end p-5 transition-opacity duration-400 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <span className={`text-white font-bold text-base tracking-wide transition-transform duration-400 ${isHovered ? 'translate-y-0' : 'translate-y-3'}`}>
          {label}
        </span>
      </div>
    </div>
  )
}

function FacilityCard({ facility, index }) {
  const ref = useScrollReveal({ delay: index * 100 })
  return (
    <div
      ref={ref}
      className={`group relative bg-white dark:bg-slate-800 rounded-2xl p-7 border-l-4 ${facility.color} shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-default overflow-hidden`}
    >
      <div className={`absolute inset-0 ${facility.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative z-10">
        <div className="text-4xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 inline-block">
          {facility.emoji}
        </div>
        <h3 className={`text-lg font-extrabold text-slate-900 dark:text-white mb-3 group-hover:${facility.text.split(' ')[0]} transition-colors`}>
          {facility.title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          {facility.desc}
        </p>
      </div>
    </div>
  )
}

function ClubCard({ club, index }) {
  const ref = useScrollReveal({ delay: index * 80 })
  return (
    <div
      ref={ref}
      className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-transparent hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-default overflow-hidden text-center"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${club.gradient} opacity-0 group-hover:opacity-[0.08] dark:group-hover:opacity-[0.15] transition-opacity duration-500`} />
      <div className="relative z-10">
        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
          {club.emoji}
        </div>
        <p className="text-slate-900 dark:text-white font-bold text-sm mb-1">
          {club.name}
        </p>
        <p className="text-brand-600 dark:text-brand-400 text-xs font-semibold">
          {club.members.toLocaleString()} members
        </p>
      </div>
    </div>
  )
}

/* ─── MAIN COMPONENT ─── */
export default function CampusLife() {
  const navigate = useNavigate()
  const [isHeroLoaded, setIsHeroLoaded] = useState(false)
  const handleNavigate = useCallback((path) => navigate(path), [navigate])

  useEffect(() => {
    const timer = setTimeout(() => setIsHeroLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const galleryRef = useStaggerReveal(GALLERY_ITEMS.length, 100)
  const facilitiesRef = useStaggerReveal(FACILITIES.length, 100)
  const clubsRef = useStaggerReveal(CLUBS.length, 80)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans overflow-x-hidden transition-colors duration-300">
      <PublicNavbar />

      {/* HERO */}
      <section className="relative h-[55vh] min-h-[400px] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img src="/campus_building.png" alt="Campus Building" className="w-full h-full object-cover animate-ken-burns" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-800/75 to-slate-900/85" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)]" />
        </div>
        <div className="absolute inset-0 opacity-[0.03] z-[1] pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
        />
        <div className={`relative z-10 text-center px-6 pt-16 transition-all duration-1000 ${isHeroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block text-xs font-bold text-brand-400 tracking-[0.16em] uppercase mb-4">
            Experience
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4">
            <span className="block overflow-hidden">
              <span className={`block transition-transform duration-700 delay-200 ${isHeroLoaded ? 'translate-y-0' : 'translate-y-full'}`}>
                Life at
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className={`block text-brand-400 transition-transform duration-700 delay-300 ${isHeroLoaded ? 'translate-y-0' : 'translate-y-full'}`}>
                University of Pandora
              </span>
            </span>
          </h1>
          <p className={`text-lg text-white/75 max-w-xl mx-auto leading-relaxed transition-all duration-700 delay-500 ${isHeroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            A vibrant campus surrounded by the Amazon where learning, community, and adventure come together.
          </p>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-scroll-down" />
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {QUICK_STATS.map(s => (
            <StatCard key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold text-brand-600 dark:text-brand-400 tracking-[0.2em] uppercase mb-4">Gallery</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Campus in Photos</h2>
          </div>

          {/* ─── BENTO GRID — zero empty space ─── */}
          <div
            className="hidden md:grid gap-4"
            style={{
              gridTemplateColumns: '1fr 1fr 1fr',
              gridTemplateRows: '280px 220px 240px',
              gridTemplateAreas:
                '"aerial aerial gate" ' +
                '"building library library" ' +
                '"cafeteria students lab"',
            }}
          >
            <BentoImage src="/campus_aerial.png"    label="Aerial View"      style={{ gridArea: 'aerial' }} />
            <BentoImage src="/campus_gate.png"      label="Main Gate"         style={{ gridArea: 'gate' }} />
            <BentoImage src="/campus_building.png"  label="Academic Block"    style={{ gridArea: 'building' }} />
            <BentoImage src="/campus_library.png"   label="Central Library"   style={{ gridArea: 'library' }} />
            <BentoImage src="/campus_cafeteria.png" label="Student Cafeteria" style={{ gridArea: 'cafeteria' }} />
            <BentoImage src="/campus_students.png"  label="Student Life"      style={{ gridArea: 'students' }} />
            <BentoImage src="/campus_lab.png"       label="Innovation Lab"    style={{ gridArea: 'lab' }} />
          </div>

          {/* Second row bento */}
          <div
            className="hidden md:grid gap-4 mt-4"
            style={{
              gridTemplateColumns: '1fr 1fr 1fr',
              gridTemplateRows: '220px',
              gridTemplateAreas: '"sports sports dorm"',
            }}
          >
            <BentoImage src="/campus_sports.png" label="Sports Complex"    style={{ gridArea: 'sports' }} />
            <BentoImage src="/campus_dorm.png"   label="Student Residence" style={{ gridArea: 'dorm' }} />
          </div>

          {/* Mobile: simple stacked grid */}
          <div className="grid md:hidden grid-cols-2 gap-3">
            {GALLERY_ITEMS.map(img => (
              <div key={img.area} className="relative rounded-xl overflow-hidden aspect-[4/3]">
                <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <span className="text-white text-xs font-bold">{img.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FACILITIES */}
      <section className="py-24 px-6 bg-slate-100 dark:bg-slate-800/50 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold text-brand-600 dark:text-brand-400 tracking-[0.2em] uppercase mb-4">Infrastructure</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">World-Class Facilities</h2>
          </div>
          <div ref={facilitiesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FACILITIES.map((f, i) => (
              <FacilityCard key={f.title} facility={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CLUBS */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold text-brand-600 dark:text-brand-400 tracking-[0.2em] uppercase mb-4">Community</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Student Clubs & Societies</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-lg">50+ clubs across academics, arts, sports, and entrepreneurship.</p>
          </div>
          <div ref={clubsRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {CLUBS.map((c, i) => (
              <ClubCard key={c.name} club={c} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{ backgroundImage: `linear-gradient(to right, var(--color-brand) 1px, transparent 1px), linear-gradient(to bottom, var(--color-brand) 1px, transparent 1px)`, backgroundSize: '60px 60px' }}
        />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            Ready to Experience<br />
            <span className="bg-gradient-to-r from-brand-600 to-blue-500 bg-clip-text text-transparent">Campus Life?</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl leading-relaxed mb-10">Join our vibrant community of learners, creators, and leaders.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => handleNavigate('/apply')} className="group relative inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              Apply Now
            </button>
            <button onClick={() => handleNavigate('/about')} className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 hover:-translate-y-1 active:scale-95 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />
      <ThemeToggle />

      <style>{`
        @keyframes ken-burns { 0% { transform: scale(1) translate(0, 0); } 100% { transform: scale(1.12) translate(-1%, -0.5%); } }
        @keyframes scroll-down { 0%, 100% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(8px); opacity: 0.5; } }
        .animate-ken-burns { animation: ken-burns 18s ease-in-out infinite alternate; }
        .animate-scroll-down { animation: scroll-down 2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .animate-ken-burns, .animate-scroll-down { animation: none; } }
      `}</style>
    </div>
  )
}