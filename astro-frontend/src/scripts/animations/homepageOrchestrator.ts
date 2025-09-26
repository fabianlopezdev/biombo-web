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

  constructor() {
    // Check if we're on the homepage
    const pathname = window.location.pathname
    this.isHomepage =
      pathname === '/' || pathname === '/ca' || pathname === '/es' || pathname === '/en'

    if (!this.isHomepage) return

    // Cache elements
    this.header = document.querySelector('.site-header')
    this.scrollIndicator = document.querySelector('.scroll-indicator')
    this.heroTitle = document.querySelector('[data-slide-up-animation]')

    this.init()
  }

  private init(): void {
    // Hide elements initially
    this.hideInitialElements()

    // Listen for loader complete event
    window.addEventListener('loader:complete', () => {
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

    // Hero title will be hidden by slideUpTextAnimation
  }

  private onLoaderComplete(): void {
    // Start hero animation with configurable delay
    if (this.HERO_SLIDEUP_DELAY_AFTER_LOADER > 0) {
      setTimeout(() => {
        this.startHeroAnimation()
      }, this.HERO_SLIDEUP_DELAY_AFTER_LOADER)
    } else {
      this.startHeroAnimation()
    }

    // Start header and scroll indicator fade after configured delay
    setTimeout(() => {
      this.fadeInHeaderAndScroll()
    }, this.HEADER_SCROLL_FADE_DELAY_AFTER_LOADER)
  }

  private startHeroAnimation(): void {
    if (!this.heroTitle) return

    // Remove the data-animate-immediate attribute if it exists
    this.heroTitle.removeAttribute('data-animate-immediate')

    // Trigger the slide-up animation
    // The animation script will handle this when it detects the element
    this.heroTitle.setAttribute('data-animation-trigger', 'start')
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
