import React from 'react'

/**
 * Logo — renders the University of Pandora seal.
 * Falls back gracefully if the image fails to load.
 * The `size` prop controls width/height in px.
 */
const Logo = ({ size = 36, className = '' }) => {
  return (
    <img
      src="/university_logo.png"
      alt="University of Pandora Logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export default Logo
