import React, { useState, useEffect } from 'react'
import { MdLightMode, MdDarkMode } from 'react-icons/md'

const ThemeToggle = () => {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button
      onClick={() => setDark(d => !d)}
      aria-label="Toggle theme"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 99999,
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        background: dark
          ? 'linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))'
          : 'var(--pub-surface,#fff)',
        border: `2px solid ${dark ? 'var(--color-brand)' : 'var(--color-brand)'}`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: dark
          ? '0 4px 24px var(--color-brand-shadow), 0 0 0 4px var(--color-brand-ring)'
          : '0 4px 24px rgba(10,22,40,0.5), 0 0 0 4px rgba(10,22,40,0.15)',
        transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        color: dark ? '#ffffff' : 'var(--color-brand)',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12) rotate(15deg)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)' }}
    >
      {dark ? <MdLightMode size={24} /> : <MdDarkMode size={24} />}
    </button>
  )
}

export default ThemeToggle
