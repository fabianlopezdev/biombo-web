/**
 * Header that hides when scrolling down and shows when scrolling up.
 * Special handling for horizontal scroll sections and top of page.
 */

interface ScrollState {
  lastScrollY: number
  lastScrollX: number
  ticking: boolean
  isHorizontalScrolling: boolean
  headerHeight: number
}

class HideOnScrollHeader {
  private header: HTMLElement | null
  private horizontalContainer: HTMLElement | null
  private state: ScrollState
  private scrollThreshold = 5 // Minimum scroll distance to trigger hide/show
  private topThreshold = 100 // Distance from top where header always shows

  constructor() {
    this.header = document.querySelector('.site-header')
    this.horizontalContainer = document.getElementById('horizontal-container')

    this.state = {
      lastScrollY: 0,
      lastScrollX: 0,
      ticking: false,
      isHorizontalScrolling: false,
      headerHeight: 0,
    }

    if (!this.header) return

    this.init()

    // Listen for when homepage loading completes to initialize scroll position
    window.addEventListener('loader:complete', () => {
      // Small delay to ensure header fade-in has started
      setTimeout(() => {
        this.checkScrollPosition()
        // Ensure header is visible after loader completes
        this.showHeader()
      }, 100)
    })
  }

  private init() {
    // Get header height
    this.updateHeaderHeight()

    // Add base class for transitions
    this.header?.classList.add('hide-on-scroll')

    // Bind event listeners
    this.bindEvents()

    // Don't check initial position if homepage is loading
    // The homepage orchestrator will handle the initial state
    const isHomepageLoading = document.body.classList.contains('homepage-loading')
    if (!isHomepageLoading) {
      // Check initial state for non-homepage or after loading
      this.checkScrollPosition()
    }
  }

  private updateHeaderHeight() {
    const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--header-height')

    if (cssVar.endsWith('px')) {
      this.state.headerHeight = parseFloat(cssVar)
    } else if (cssVar.endsWith('rem')) {
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
      this.state.headerHeight = parseFloat(cssVar) * rootFontSize
    } else {
      this.state.headerHeight = this.header?.offsetHeight || 0
    }
  }

  private bindEvents() {
    // Window scroll for vertical scrolling
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true })

    // Horizontal container scroll if it exists
    if (this.horizontalContainer) {
      this.horizontalContainer.addEventListener('scroll', () => this.handleHorizontalScroll(), {
        passive: true,
      })

      // Monitor when horizontal scrolling is active
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Check if horizontal container is in viewport and at the top
            const rect = entry.boundingClientRect
            const isInView = entry.isIntersecting
            // Container is at top when its top edge is near the top of viewport
            const isAtTop = rect.top <= 5 && rect.top >= -5

            this.state.isHorizontalScrolling = isInView && isAtTop && window.innerWidth >= 1025

            // Always show header during horizontal scroll
            if (this.state.isHorizontalScrolling) {
              this.showHeader()
            }
          })
        },
        { threshold: [0, 0.1, 0.5, 1] },
      )

      observer.observe(this.horizontalContainer)
    }

    // Handle resize
    window.addEventListener('resize', () => this.handleResize(), { passive: true })
  }

  private handleScroll() {
    if (!this.state.ticking && !this.state.isHorizontalScrolling) {
      window.requestAnimationFrame(() => {
        this.updateHeaderVisibility()
        this.state.ticking = false
      })
      this.state.ticking = true
    }
  }

  private handleHorizontalScroll() {
    // During horizontal scroll, always show the header
    if (this.state.isHorizontalScrolling) {
      this.showHeader()
    }
  }

  private updateHeaderVisibility() {
    const currentScrollY = window.scrollY

    // Always show at the top of the page
    if (currentScrollY < this.topThreshold) {
      this.showHeader()
      this.state.lastScrollY = currentScrollY
      return
    }

    // Don't hide/show for small scroll distances
    if (Math.abs(currentScrollY - this.state.lastScrollY) < this.scrollThreshold) {
      return
    }

    // Scrolling down - hide header
    if (currentScrollY > this.state.lastScrollY && currentScrollY > this.state.headerHeight) {
      this.hideHeader()
    }
    // Scrolling up - show header
    else if (currentScrollY < this.state.lastScrollY) {
      this.showHeader()
    }

    this.state.lastScrollY = currentScrollY
  }

  private showHeader() {
    this.header?.classList.remove('header-hidden')
    this.header?.classList.add('header-visible')
  }

  private hideHeader() {
    // Don't hide if we're in horizontal scrolling mode
    if (this.state.isHorizontalScrolling) return

    this.header?.classList.remove('header-visible')
    this.header?.classList.add('header-hidden')
  }

  private checkScrollPosition() {
    // Check initial position
    this.state.lastScrollY = window.scrollY

    if (window.scrollY < this.topThreshold) {
      this.showHeader()
    }
  }

  private handleResize() {
    this.updateHeaderHeight()

    // Check if we're still in horizontal scroll mode
    if (window.innerWidth < 1025) {
      this.state.isHorizontalScrolling = false
    }

    this.checkScrollPosition()
  }

  // Cleanup method for SPAs
  public destroy() {
    window.removeEventListener('scroll', () => this.handleScroll())
    this.horizontalContainer?.removeEventListener('scroll', () => this.handleHorizontalScroll())
    window.removeEventListener('resize', () => this.handleResize())
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new HideOnScrollHeader()
  })
} else {
  new HideOnScrollHeader()
}

// Export for potential use in SPAs
export default HideOnScrollHeader
