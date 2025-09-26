document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('page-loader')
  if (!loader) return

  const main = document.querySelector('main')

  // Accessibility: make underlying content inert while loader is active
  if (main) {
    main.setAttribute('inert', '')
    main.setAttribute('aria-hidden', 'true')
  }
  document.body.setAttribute('aria-busy', 'true')

  // iOS/Safari viewport height handling
  const setViewportHeight = () => {
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight
    document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`)
    if (!loader.hasAttribute('data-loader-complete')) loader.style.height = `${vh}px`
  }
  setViewportHeight()
  const onVVResize = () => setViewportHeight()
  window.addEventListener('resize', setViewportHeight)
  window.addEventListener('orientationchange', setViewportHeight)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onVVResize)
  }

  // Finish routine
  const finish = (skipped = false) => {
    loader.setAttribute('data-loader-complete', '')
    window.dispatchEvent(new CustomEvent('loader:complete', { detail: { skipped } }))
    document.body.removeAttribute('aria-busy')
    if (main) {
      main.removeAttribute('inert')
      main.removeAttribute('aria-hidden')
    }
    setTimeout(() => {
      window.removeEventListener('resize', setViewportHeight)
      window.removeEventListener('orientationchange', setViewportHeight)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onVVResize)
      }
      loader.remove()
    }, 600) // match CSS fade
  }

  // Keyboard-only skip (Esc or "s")
  const onKey = (e: KeyboardEvent) => {
    const k = e.key || ''
    if (k === 'Escape' || k.toLowerCase() === 's') {
      e.preventDefault()
      finish(true)
    }
  }
  document.addEventListener('keydown', onKey)

  // Auto-finish after the configured timeline (original 4000ms)
  const styles = getComputedStyle(loader)
  const ms = parseInt(styles.getPropertyValue('--loader-total-duration')) || 4000
  const t = window.setTimeout(() => finish(false), ms)
  window.addEventListener('pagehide', () => {
    clearTimeout(t)
  })
})
