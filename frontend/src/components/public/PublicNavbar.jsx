import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MdMenu, MdClose, MdExpandMore, MdKeyboardArrowRight } from 'react-icons/md'
import Logo from '../Logo'

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  {
    label: 'Academics', path: null,
    dropdown: [
      { label: 'All Programs', path: '/programs' },
      { label: 'Research', path: '/research' },
    ]
  },
  { label: 'Admissions', path: '/admissions' },
  { label: 'Campus Life', path: '/campus-life' },
  { label: 'Contact', path: '/contact' },
]

/**
 * Only routes with a full-bleed DARK hero section get the
 * transparent-navbar + white-text treatment when not scrolled.
 * All other public pages have light backgrounds, so we keep
 * the navbar solid from the start.
 */
const HERO_ROUTES = ['/']

const PublicNavbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute('data-theme') === 'dark'
  )

  // Track scroll depth for background solidification
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Watch theme changes (theme toggle updates data-theme attribute)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  // Close mobile menu on navigation
  useEffect(() => { setMenuOpen(false) }, [location])

  const isActive = (path) => path && location.pathname === path

  /**
   * isHeroPage — true only for the landing page which has a dark hero.
   * On hero pages + not-yet-scrolled: transparent bg + white text.
   * On ALL other pages (or after scroll): solid bg + dark text.
   */
  const isHeroPage = HERO_ROUTES.includes(location.pathname)
  const isTransparent = isHeroPage && !scrolled

  // ── Dynamic class helpers ──────────────────────────────────────────
  // Navbar background
  const navBg = isTransparent
    ? 'bg-transparent border-b border-transparent'
    : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm'

  // Text color for nav links
  const linkColor = isTransparent
    ? 'text-white'
    : 'text-slate-700 dark:text-slate-200'

  // Hover bg for nav links
  const linkHover = isTransparent
    ? 'hover:bg-white/15'
    : 'hover:bg-slate-100 dark:hover:bg-slate-800'

  // Expand icon color
  const expandIconColor = isTransparent ? 'text-white/70' : 'text-brand-500'

  // Logo text color
  const logoTextColor = isTransparent ? 'text-white' : 'text-slate-900 dark:text-white'

  // Login button style
  const loginBtnClass = isTransparent
    ? 'text-white border border-white/30 hover:bg-white/10'
    : 'text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'

  // Hamburger button style
  const hamburgerClass = isTransparent
    ? 'text-white hover:bg-white/10'
    : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[9000] transition-all duration-300 ease-in-out ${navBg}`}>
        <div className="max-w-7xl mx-auto px-6 h-[70px] flex items-center justify-between">

          {/* Logo */}
          <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer group">
            <Logo size={36} darkTheme={isDark} />
            <div>
              <p className={`font-black text-base leading-tight tracking-tight transition-colors ${logoTextColor}`}>
                University of Pandora
              </p>
              <p className="text-brand-500 dark:text-brand-400 text-[10px] tracking-widest uppercase font-bold mt-0.5">
                Est. 2001 · Excellence
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              link.dropdown ? (
                <div key={link.label} className="relative group">
                  <button className={`flex items-center gap-1 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${linkColor} ${linkHover}`}>
                    {link.label}
                    <MdExpandMore
                      size={18}
                      className={`${expandIconColor} transition-transform duration-200 group-hover:rotate-180`}
                    />
                  </button>

                  {/* CSS-driven dropdown — no JS state needed */}
                  <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-left translate-y-2 group-hover:translate-y-0">
                    <div className="min-w-[220px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-xl backdrop-blur-xl">
                      {link.dropdown.map(sub => (
                        <button
                          key={sub.label}
                          onClick={() => navigate(sub.path)}
                          className="flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
                        >
                          <MdKeyboardArrowRight size={16} className="text-brand-500" />
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                    isActive(link.path)
                      ? 'bg-brand-500 text-white font-bold'
                      : `font-medium ${linkColor} ${linkHover} hover:text-brand-500 dark:hover:text-brand-400`
                  }`}
                >
                  {link.label}
                </button>
              )
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className={`cms-btn px-5 py-2 transition-colors ${loginBtnClass}`}
              >
                Login
              </button>
              <button onClick={() => navigate('/apply')} className="cms-btn-primary px-5 py-2">
                Apply Now
              </button>
            </div>

            {/* Hamburger */}
            <button
              className={`lg:hidden p-2 rounded-lg transition-colors ${hamburgerClass}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden absolute top-[70px] left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl px-6 py-6 max-h-[calc(100vh-70px)] overflow-y-auto">
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map(link => (
                <div key={link.label}>
                  <button
                    onClick={() => link.path && navigate(link.path)}
                    className={`w-full text-left py-3 px-4 rounded-xl text-base font-semibold transition-colors ${
                      isActive(link.path)
                        ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                        : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.label}
                  </button>
                  {link.dropdown && (
                    <div className="pl-4 mt-1 flex flex-col gap-1 border-l-2 border-slate-100 dark:border-slate-800 ml-4">
                      {link.dropdown.map(sub => (
                        <button
                          key={sub.label}
                          onClick={() => navigate(sub.path)}
                          className="w-full text-left py-2.5 px-4 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => navigate('/login')} className="cms-btn-secondary w-full justify-center py-3">Login</button>
                <button onClick={() => navigate('/apply')} className="cms-btn-primary w-full justify-center py-3">Apply Now</button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

export default PublicNavbar
