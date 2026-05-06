import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop — mounts inside <Router>, listens for pathname changes,
 * and instantly snaps the window to the top on every navigation.
 * "instant" avoids a visible scroll animation that fights page transitions.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null // renders nothing — purely a side-effect component
}

export default ScrollToTop
