/**
 * Homepage Animation Orchestrator
 * Coordinates the sequence of animations after the loader completes
 */

class HomepageOrchestrator {
  // Timing configuration variables

  // Header and scroll indicator fade timing (after loader completes)
  private readonly HEADER_SCROLL_FADE_DELAY_AFTER_LOADER = 800 // ms - Delay after loader completes before header/scroll start fading in
  private readonly HEADER_FADE_DURATION = 800 // ms - Duration for header fade-in
  private readonly HEADER_FADE_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)' // Easing for header fade
  private readonly SCROLL_INDICATOR_FADE_DURATION = 800 // ms - Duration for scroll indicator fade-in
  private readonly SCROLL_INDICATOR_FADE_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)' // Easing for scroll indicator fade

  // Hero title slide-up animation timing
  private readonly HERO_SLIDEUP_DELAY_AFTER_LOADER = 0 // ms - Delay before starting hero slide-up after loader completes

  private isHomepage: boolean = false
  private header: HTMLElement | null = null
  private scrollIndicator: HTMLElement | null = null
  private heroTitle: HTMLElement | null = null
  private projectsMobile: HTMLElement | null = null

  constructor() {
    console.log('[HomepageOrchestrator] Constructor called')
    // Check if we're on the homepage
    const pathname = window.location.pathname
    // Normalize pathname by removing trailing slash (except for root '/')
    const normalizedPath = pathname.replace(/\/$/, '') || '/'
    this.isHomepage =
      normalizedPath === '/' || normalizedPath === '/ca' || normalizedPath === '/es' || normalizedPath === '/en'

    console.log('[HomepageOrchestrator] Is homepage:', this.isHomepage, 'pathname:', pathname, 'normalized:', normalizedPath)

    if (!this.isHomepage) return

    // Reset scroll position to top on homepage load/refresh
    // This ensures users always start from the hero section
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)

    // Also reset horizontal container if it exists
    const horizontalContainer = document.getElementById('horizontal-container')
    if (horizontalContainer) {
      horizontalContainer.scrollLeft = 0
    }

    // Cache elements
    this.header = document.querySelector('.site-header')
    this.scrollIndicator = document.querySelector('.scroll-indicator')
    this.heroTitle = document.querySelector('[data-slide-up-animation]')
    this.projectsMobile = document.querySelector('.projects-container-mobile')

    console.log('[HomepageOrchestrator] Cached elements:')
    console.log('  - header:', this.header ? 'found' : 'NOT FOUND')
    console.log('  - scrollIndicator:', this.scrollIndicator ? 'found' : 'NOT FOUND')
    console.log('  - heroTitle:', this.heroTitle ? 'found' : 'NOT FOUND')
    console.log('  - projectsMobile:', this.projectsMobile ? 'found' : 'NOT FOUND')

    this.init()
  }

  private init(): void {
    console.log('[HomepageOrchestrator] init() called')
    // Hide elements initially
    this.hideInitialElements()

    // Listen for loader complete event
    console.log('[HomepageOrchestrator] Setting up loader:complete event listener')
    window.addEventListener('loader:complete', (event) => {
      console.log('[HomepageOrchestrator] loader:complete event received!', event)
      this.onLoaderComplete()
    })
  }

  private hideInitialElements(): void {
    // Add loading class to body
    document.body.classList.add('homepage-loading')

    // Hide elements via CSS classes
    if (this.header) {
      this.header.classList.add('header-loading')
    }

    if (this.scrollIndicator) {
      this.scrollIndicator.style.opacity = '0'
      this.scrollIndicator.style.transition = `opacity ${this.SCROLL_INDICATOR_FADE_DURATION}ms ${this.SCROLL_INDICATOR_FADE_EASING}`
    }

    // Hide mobile projects container initially
    if (this.projectsMobile) {
      this.projectsMobile.classList.add('projects-mobile-loading')
      this.projectsMobile.style.opacity = '0'
      this.projectsMobile.style.transition = `opacity ${this.HEADER_FADE_DURATION}ms ${this.HEADER_FADE_EASING}`
    }

    // Hero title will be hidden by slideUpTextAnimation
  }

  private onLoaderComplete(): void {
    console.log('[HomepageOrchestrator] onLoaderComplete() called')
    console.log('[HomepageOrchestrator] HERO_SLIDEUP_DELAY_AFTER_LOADER:', this.HERO_SLIDEUP_DELAY_AFTER_LOADER)

    // Start hero animation with configurable delay
    if (this.HERO_SLIDEUP_DELAY_AFTER_LOADER > 0) {
      console.log('[HomepageOrchestrator] Scheduling startHeroAnimation with delay:', this.HERO_SLIDEUP_DELAY_AFTER_LOADER)
      setTimeout(() => {
        this.startHeroAnimation()
      }, this.HERO_SLIDEUP_DELAY_AFTER_LOADER)
    } else {
      console.log('[HomepageOrchestrator] Calling startHeroAnimation immediately')
      this.startHeroAnimation()
    }

    // Start header and scroll indicator fade after configured delay
    console.log('[HomepageOrchestrator] Scheduling fadeInHeaderAndScroll with delay:', this.HEADER_SCROLL_FADE_DELAY_AFTER_LOADER)
    setTimeout(() => {
      this.fadeInHeaderAndScroll()
    }, this.HEADER_SCROLL_FADE_DELAY_AFTER_LOADER)
  }

  private startHeroAnimation(): void {
    console.log('[HomepageOrchestrator] startHeroAnimation() called')
    console.log('[HomepageOrchestrator] heroTitle element:', this.heroTitle)

    if (!this.heroTitle) {
      console.error('[HomepageOrchestrator] heroTitle is null! Cannot start animation')
      return
    }

    console.log('[HomepageOrchestrator] heroTitle current attributes:')
    console.log('  - data-animation:', this.heroTitle.getAttribute('data-animation'))
    console.log('  - data-animate-immediate:', this.heroTitle.getAttribute('data-animate-immediate'))
    console.log('  - data-animation-trigger:', this.heroTitle.getAttribute('data-animation-trigger'))

    // Remove the data-animate-immediate attribute if it exists
    this.heroTitle.removeAttribute('data-animate-immediate')
    console.log('[HomepageOrchestrator] Removed data-animate-immediate attribute')

    // Trigger the slide-up animation
    // The animation script will handle this when it detects the element
    console.log('[HomepageOrchestrator] Setting data-animation-trigger="start"')
    this.heroTitle.setAttribute('data-animation-trigger', 'start')
    console.log('[HomepageOrchestrator] Attribute set successfully')

    // Verify it was set
    console.log('[HomepageOrchestrator] Verification - data-animation-trigger:', this.heroTitle.getAttribute('data-animation-trigger'))
  }

  private fadeInHeaderAndScroll(): void {
    // Remove loading class from body
    document.body.classList.remove('homepage-loading')

    // Fade in header by removing loading class
    if (this.header) {
      this.header.classList.remove('header-loading')
    }

    if (this.scrollIndicator) {
      this.scrollIndicator.style.opacity = '1'
    }

    // Fade in mobile projects container
    if (this.projectsMobile) {
      this.projectsMobile.classList.remove('projects-mobile-loading')
      this.projectsMobile.style.opacity = '1'
    }
  }

  public destroy(): void {
    // Clean up if needed
    window.removeEventListener('loader:complete', () => this.onLoaderComplete())
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new HomepageOrchestrator()
  })
} else {
  new HomepageOrchestrator()
}

export default HomepageOrchestrator
