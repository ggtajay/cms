import React, { useEffect, useRef, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicNavbar from '../components/public/PublicNavbar'
import PublicFooter from '../components/public/PublicFooter'
import ThemeToggle from '../components/ThemeToggle'
import {
  MdArrowForward, MdPlayCircle, MdStar, MdSchool,
  MdPeople, MdScience, MdLibraryBooks, MdSportsBasketball,
  MdApartment, MdCalendarToday, MdArrowRightAlt,
} from 'react-icons/md'

/* ═══════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════ */
const ANNOUNCEMENTS = [
  '📢 Admissions Open for 2026–27 Batch — Apply before June 30',
  '🏆 UoP ranked #1 University in the Pandora Valley Region',
  '📅 Annual Cultural Fest "Pandorix 2026" — March 15 to 18',
  '🎓 Convocation Ceremony scheduled for April 20, 2026',
  '🔬 New Research Center for Tropical Biotechnology inaugurated',
]

const STATS = [
  { value: 12000, suffix: '+', label: 'Students' },
  { value: 800, suffix: '+', label: 'Faculty Members' },
  { value: 60, suffix: '+', label: 'Programs' },
  { value: 25, suffix: '', label: 'Years of Excellence' },
  { value: 95, suffix: '%', label: 'Placement Rate' },
]

const PROGRAMS = [
  { title: 'B.Tech Engineering', desc: '4-year program across 8 specializations', icon: MdScience, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  { title: 'MBA / Management', desc: 'Industry-aligned 2-year postgraduate program', icon: MdApartment, color: 'text-brand-500', bg: 'bg-brand-50', border: 'border-brand-200' },
  { title: 'BSc Life Sciences', desc: 'Research-focused undergraduate degree', icon: MdLibraryBooks, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { title: 'BBA Business', desc: '3-year global business administration', icon: MdPeople, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
  { title: 'Sports Sciences', desc: 'Unique program blending fitness & analytics', icon: MdSportsBasketball, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  { title: 'PhD Programs', desc: 'Doctoral research in 20+ disciplines', icon: MdSchool, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200' },
]

const TESTIMONIALS = [
  { name: 'Arjun Mehta', role: 'B.Tech CSE, 2024', text: 'University of Pandora gave me world-class education surrounded by nature. The faculty are exceptional and the campus is breathtaking.' },
  { name: 'Priya Sharma', role: 'MBA, 2023', text: 'The placement support and industry exposure here is unmatched. I landed my dream job at a Fortune 500 company right from campus.' },
  { name: 'Dr. Kavita Rao', role: 'Associate Professor', text: 'Teaching here is a privilege. Our research facilities rival the best in the world, and the student talent is extraordinary.' },
]

const NEWS = [
  { date: 'Apr 28, 2026', title: 'UoP Signs MoU with Amazon Research Institute', category: 'Research' },
  { date: 'Apr 20, 2026', title: 'Students Win National Robotics Championship', category: 'Achievement' },
  { date: 'Apr 10, 2026', title: 'New Hostel Block Opens — 500 More Seats Available', category: 'Campus' },
  { date: 'Mar 30, 2026', title: 'International Faculty Exchange Program Launched', category: 'Academics' },
]

/* ═══════════════════════════════════════════════
   ANIMATION HOOKS (Production-grade IntersectionObserver)
   ═══════════════════════════════════════════════ */
function useScrollReveal(options = {}) {
  const ref = useRef(null)
  const { threshold = 0.12, delay = 0, duration = 700 } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Initial hidden state
    el.style.opacity = '0'
    el.style.transform = 'translateY(40px) scale(0.96)'
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
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
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
        const stepDuration = duration / steps

        const timer = setInterval(() => {
          current += increment
          if (current >= end) {
            setCount(end)
            clearInterval(timer)
          } else {
            setCount(Math.floor(current))
          }
        }, stepDuration)
      }
    }, { threshold: 0.5 })

    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration])

  return [count, ref]
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════ */
function StatCard({ value, suffix, label }) {
  const [count, ref] = useCountUp(value)

  return (
    <div ref={ref} className="text-center flex-1 min-w-[120px] group">
      <p className="text-2xl md:text-4xl font-black text-brand-400 group-hover:scale-110 transition-transform duration-300">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-xs text-slate-400 mt-1 tracking-wider uppercase font-semibold">
        {label}
      </p>
    </div>
  )
}

function ProgramCard({ program, index, onNavigate }) {
  const Icon = program.icon
  const cardRef = useScrollReveal({ delay: index * 100 })

  return (
    <button
      ref={cardRef}
      onClick={() => onNavigate('/programs')}
      className={`group text-left w-full bg-white dark:bg-slate-800 rounded-2xl p-8 border ${program.border} dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-400 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-500/10 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`}
    >
      <div className={`w-14 h-14 rounded-xl ${program.bg} dark:bg-slate-700 flex items-center justify-center ${program.color} dark:text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
        <Icon size={28} />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
        {program.title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
        {program.desc}
      </p>
      <div className={`flex items-center gap-2 ${program.color} dark:text-brand-400 text-sm font-semibold group-hover:gap-3 transition-all duration-300`}>
        Learn More <MdArrowRightAlt size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
      </div>
    </button>
  )
}

function NewsCard({ news, index }) {
  const ref = useScrollReveal({ delay: index * 120 })

  return (
    <article
      ref={ref}
      className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer focus-within:ring-2 focus-within:ring-brand-500"
      tabIndex={0}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold tracking-wider">
          {news.category}
        </span>
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
          <MdCalendarToday size={14} />{news.date}
        </div>
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
        {news.title}
      </h3>
      <div className="mt-6 flex items-center gap-2 text-brand-600 dark:text-brand-400 text-sm font-semibold group-hover:gap-3 transition-all duration-300">
        Read More <MdArrowRightAlt size={18} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </article>
  )
}

function GalleryImage({ img, onNavigate }) {
  const ref = useScrollReveal()

  return (
    <button
      ref={ref}
      onClick={() => onNavigate('/campus-life')}
      className="group relative rounded-2xl overflow-hidden aspect-video shadow-md hover:shadow-2xl transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
    >
      <img
        src={img.src}
        alt={img.label}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
        onError={(e) => { e.target.style.display = 'none' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
        <span className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          {img.label}
        </span>
      </div>
    </button>
  )
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate()
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [isHeroLoaded, setIsHeroLoaded] = useState(false)

  const handleNavigate = useCallback((path) => navigate(path), [navigate])

  // Hero entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsHeroLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Auto-rotate testimonials
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 5000)
    return () => clearInterval(t)
  }, [])

  // Scroll reveal refs
  const programsRef = useStaggerReveal(PROGRAMS.length, 120)
  const galleryRef = useStaggerReveal(6, 100)
  const newsRef = useStaggerReveal(NEWS.length, 100)
  const statsRef = useScrollReveal()
  const testimonialRef = useScrollReveal()
  const ctaRef = useScrollReveal()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 overflow-x-hidden">
      <PublicNavbar />

      {/* ═══════════════════════════════════════════════
          HERO SECTION — Cinematic with Parallax
          ═══════════════════════════════════════════════ */}
      <section id="home" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background with Ken Burns */}
        <div className="absolute inset-0 z-0">
          <img
            src="/campus_building.png"
            alt="Campus Building"
            className="w-full h-full object-cover animate-ken-burns"
          />
          {/* Parallax overlay layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
        </div>

        {/* Animated grain texture */}
        <div className="absolute inset-0 opacity-[0.03] z-[1] pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
        />

        {/* Brand shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] z-20 overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-brand-400 to-transparent animate-shimmer" />
        </div>

        {/* Hero Content */}
        <div className={`relative z-20 text-center px-6 max-w-4xl mx-auto mt-16 transition-all duration-1000 ${isHeroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-50/10 backdrop-blur-md border border-brand-500/30 rounded-full px-5 py-2 mb-8 hover:bg-brand-50/20 transition-colors duration-300 cursor-default">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-brand-300 text-xs font-bold tracking-widest uppercase">Admissions Open 2026–27</span>
          </div>

          {/* Title with character stagger effect */}
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight mb-6">
            <span className="block overflow-hidden">
              <span className={`block transition-transform duration-700 delay-200 ${isHeroLoaded ? 'translate-y-0' : 'translate-y-full'}`}>
                University of
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className={`block bg-gradient-to-br from-blue-400 via-brand-400 to-brand-500 bg-clip-text text-transparent transition-transform duration-700 delay-300 ${isHeroLoaded ? 'translate-y-0' : 'translate-y-full'}`}>
                Pandora
              </span>
            </span>
          </h1>

          <p className={`text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-700 delay-500 ${isHeroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Where Knowledge Meets Nature — A world-class institution nestled in the heart of the Amazon, shaping tomorrow's leaders.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 delay-700 ${isHeroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button
              onClick={() => handleNavigate('/apply')}
              className="group relative flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-lg shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-1 active:scale-95 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              Apply Now <MdArrowForward size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => handleNavigate('/about')}
              className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-lg border border-white/20 hover:border-white/40 hover:-translate-y-1 active:scale-95 transition-all duration-300"
            >
              <MdPlayCircle size={22} className="group-hover:scale-110 transition-transform" />
              Explore Campus
            </button>
          </div>
        </div>

        {/* Stats Bar — Floating */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 py-6 px-6">
          <div ref={statsRef} className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-6">
            {STATS.map(s => (
              <StatCard key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-scroll-down" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          ANNOUNCEMENT TICKER
          ═══════════════════════════════════════════════ */}
      <div className="bg-brand-50 dark:bg-brand-900/30 py-3 overflow-hidden relative border-b border-brand-100 dark:border-brand-900/50">
        <div className="flex whitespace-nowrap animate-ticker">
          {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((a, i) => (
            <span key={`ticker-${i}`} className="inline-flex items-center gap-2 px-10 text-sm font-semibold text-brand-700 dark:text-brand-300 hover:text-brand-900 dark:hover:text-brand-100 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              {a}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          PROGRAMS SECTION
          ═══════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900 relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold text-brand-600 dark:text-brand-400 tracking-[0.2em] uppercase mb-4 animate-fade-in-up">
              Academics
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              Explore Our Programs
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              60+ undergraduate, postgraduate, and doctoral programs designed for the modern world.
            </p>
          </div>

          <div ref={programsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROGRAMS.map((p, i) => (
              <ProgramCard key={p.title} program={p} index={i} onNavigate={handleNavigate} />
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => handleNavigate('/programs')}
              className="group inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 hover:bg-brand-600 hover:text-white hover:border-brand-600 font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              View All Programs <MdArrowForward size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CAMPUS GALLERY — Masonry with Hover Reveal
          ═══════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-brand-50/50 dark:bg-slate-800/50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold text-brand-600 dark:text-brand-400 tracking-[0.2em] uppercase mb-4">
              Campus Life
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Life at University of Pandora
            </h2>
          </div>

          <div ref={galleryRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { src: '/campus_aerial.png', label: 'Aerial View' },
              { src: '/campus_gate.png', label: 'Main Gate' },
              { src: '/campus_building.png', label: 'Academic Block' },
              { src: '/campus_library.png', label: 'Central Library' },
              { src: '/campus_students.png', label: 'Campus Life' },
              { src: '/campus_sports.png', label: 'Sports Complex' },
            ].map(img => (
              <GalleryImage key={img.label} img={img} onNavigate={handleNavigate} />
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => handleNavigate('/campus-life')}
              className="group inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-500 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Explore Campus Life <MdArrowForward size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          NEWS SECTION
          ═══════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-6">
            <div>
              <span className="inline-block text-xs font-bold text-brand-600 dark:text-brand-400 tracking-[0.2em] uppercase mb-3">
                Latest News
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                News & Announcements
              </h2>
            </div>
            <button
              onClick={() => handleNavigate('/about')}
              className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-all duration-300"
            >
              View All <MdArrowForward size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div ref={newsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {NEWS.map((n, i) => (
              <NewsCard key={n.title} news={n} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TESTIMONIALS — Carousel with Auto-play
          ═══════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gradient-to-br from-brand-50 to-white dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block text-xs font-bold text-brand-600 dark:text-brand-400 tracking-[0.2em] uppercase mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-12">
            What Our Community Says
          </h2>

          <div ref={testimonialRef} className="relative">
            <div className="bg-white dark:bg-slate-800 border border-brand-100 dark:border-slate-700 rounded-3xl p-10 md:p-14 shadow-xl shadow-brand-500/5 min-h-[280px] flex flex-col justify-center transition-all duration-500">
              {/* Quote icon */}
              <div className="text-brand-200 dark:text-brand-900 text-6xl font-serif leading-none mb-4">"</div>

              <div className="flex justify-center mb-6">
                {[1, 2, 3, 4, 5].map(s => (
                  <MdStar key={s} size={24} className="text-amber-400 animate-pulse" style={{ animationDelay: `${s * 100}ms` }} />
                ))}
              </div>

              <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed italic mb-8 transition-opacity duration-500">
                "{TESTIMONIALS[activeTestimonial].text}"
              </p>

              <div className="transition-all duration-500">
                <p className="text-slate-900 dark:text-white font-bold text-base">
                  {TESTIMONIALS[activeTestimonial].name}
                </p>
                <p className="text-brand-600 dark:text-brand-400 text-sm font-medium mt-1">
                  {TESTIMONIALS[activeTestimonial].role}
                </p>
              </div>
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center gap-3 mt-8">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-2.5 rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${i === activeTestimonial ? 'w-10 bg-brand-600' : 'w-2.5 bg-brand-200 dark:bg-slate-600 hover:bg-brand-400'}`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA SECTION — Final Call to Action
          ═══════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900 text-center relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, var(--color-brand) 1px, transparent 1px), linear-gradient(to bottom, var(--color-brand) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        <div ref={ctaRef} className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            Begin Your Journey at<br />
            <span className="bg-gradient-to-r from-brand-600 to-blue-500 bg-clip-text text-transparent">
              University of Pandora
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl leading-relaxed mb-10">
            Join 12,000+ students from across the globe in our vibrant, nature-surrounded campus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleNavigate('/apply')}
              className="group relative inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-brand-600 text-white font-bold text-base shadow-lg shadow-brand-500/30 hover:bg-brand-500 hover:-translate-y-1 hover:shadow-xl active:scale-95 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              Apply for Admission <MdArrowForward size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => handleNavigate('/contact')}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 hover:-translate-y-1 active:scale-95 transition-all duration-300"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />
      <ThemeToggle />

      {/* ═══════════════════════════════════════════════
          KEYFRAME ANIMATIONS (Embedded)
          ═══════════════════════════════════════════════ */}
      <style>{`
        @keyframes ken-burns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.15) translate(-2%, -1%); }
        }
        
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes scroll-down {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(8px); opacity: 0.5; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-ken-burns {
          animation: ken-burns 20s ease-in-out infinite alternate;
        }
        
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .animate-scroll-down {
          animation: scroll-down 2s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .animate-ken-burns,
          .animate-ticker,
          .animate-shimmer,
          .animate-scroll-down,
          .animate-fade-in-up {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}