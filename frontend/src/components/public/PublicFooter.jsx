/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MdPhone, MdEmail, MdLocationOn, MdArrowForward } from 'react-icons/md'
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa'
import Logo from '../Logo'

const FOOTER_LINKS = {
  'Quick Links': [
    { label: 'Home', path: '/' },
    { label: 'About University', path: '/about' },
    { label: 'Programs', path: '/programs' },
    { label: 'Admissions', path: '/admissions' },
    { label: 'Campus Life', path: '/campus-life' },
    { label: 'Contact', path: '/contact' },
  ],
  'Academics': [
    { label: 'B.Tech Programs', path: '/programs' },
    { label: 'MBA / Management', path: '/programs' },
    { label: 'Science & Research', path: '/programs' },
    { label: 'Arts & Humanities', path: '/programs' },
    { label: 'Research Center', path: '/research' },
  ],
  'Student Portal': [
    { label: 'Student Login', path: '/login' },
    { label: 'Apply Online', path: '/apply' },
    { label: 'Track Application', path: '/apply/track' },
    { label: 'Fee Payment', path: '/login' },
    { label: 'Results / Marks', path: '/login' },
  ],
}

const PublicFooter = () => {
  const navigate = useNavigate()
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 font-sans transition-colors duration-300">
      {/* Brand accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-300 via-brand-600 to-brand-300 bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]" />

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* ── Top row: 4 equal columns — Quick Links | Academics | Student Portal | Contact ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12">

          {/* Auto-generated link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-brand-600 dark:text-brand-400 text-xs font-bold tracking-widest uppercase mb-5 flex items-center gap-2">
                <span className="w-4 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
                {title}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map(link => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 text-sm font-medium transition-all"
                    >
                      <MdArrowForward size={14} className="group-hover:translate-x-1 transition-transform" />
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact — 4th column, beside the link columns */}
          <div>
            <h4 className="text-brand-600 dark:text-brand-400 text-xs font-bold tracking-widest uppercase mb-5 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
              Contact
            </h4>
            <div className="flex flex-col gap-4">
              {[
                { icon: <MdLocationOn size={17} />, text: 'Pandora Valley, Amazon Forest Region, PX 110001' },
                { icon: <MdPhone size={17} />, text: '+91 98765 43210' },
                { icon: <MdEmail size={17} />, text: 'info@universityofpandora.edu' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start group">
                  <span className="text-brand-600 dark:text-brand-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.text}</span>
                </div>
              ))}
              <div className="mt-1 p-3 rounded-xl bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800/50">
                <p className="text-brand-600 dark:text-brand-400 text-[10px] font-bold tracking-widest uppercase mb-1">Office Hours</p>
                <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">Mon – Sat: 9:00 AM – 5:00 PM</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Sunday: Closed</p>
              </div>
            </div>
          </div>

        </div>

        {/* ── Divider ── */}
        <div className="border-t border-slate-200 dark:border-slate-800" />

        {/* ── Centered branding block below the link grid ── */}
        <div className="flex flex-col items-center text-center pt-10 gap-4">

          {/* Logo + Name */}
          <div className="flex items-center gap-3">
            <Logo size={42} darkTheme={document.documentElement.getAttribute('data-theme') === 'dark'} />
            <div className="text-left">
              <p className="text-slate-900 dark:text-white font-black text-lg leading-tight">University of Pandora</p>
              <p className="text-brand-600 dark:text-brand-400 text-[10px] tracking-widest uppercase font-bold mt-0.5">Excellence in Knowledge</p>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-lg">
            Nestled in the heart of the Amazon, the University of Pandora is a world-class institution committed to shaping future leaders through innovation, research, and compassion.
          </p>

          {/* Social Icons */}
          <div className="flex gap-3 flex-wrap justify-center mt-1">
            {[
              { Icon: FaFacebook, hover: 'hover:text-[#1877f2] hover:bg-[#1877f2]/10 hover:border-[#1877f2]' },
              { Icon: FaTwitter, hover: 'hover:text-[#1da1f2] hover:bg-[#1da1f2]/10 hover:border-[#1da1f2]' },
              { Icon: FaInstagram, hover: 'hover:text-[#e1306c] hover:bg-[#e1306c]/10 hover:border-[#e1306c]' },
              { Icon: FaYoutube, hover: 'hover:text-[#ff0000] hover:bg-[#ff0000]/10 hover:border-[#ff0000]' },
              { Icon: FaLinkedin, hover: 'hover:text-[#0a66c2] hover:bg-[#0a66c2]/10 hover:border-[#0a66c2]' },
            ].map(({ Icon, hover }, i) => (
              <a
                key={i}
                href="#"
                className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-all duration-300 ${hover}`}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom copyright bar */}
      <div className="border-t border-slate-200 dark:border-slate-800 py-6 px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            © {new Date().getFullYear()} University of Pandora. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Use', 'Disclaimer'].map(item => (
              <a
                key={item}
                href="#"
                className="text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 text-sm font-medium transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter
