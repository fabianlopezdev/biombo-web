/**
 * Services mobile animation handler
 * Manages touch-specific interactions for service toggle animations
 */

class ServicesMobileAnimation {
  private isTouchDevice: boolean = false
  private activeToggle: HTMLElement | null = null
  private animationTimeout: number | null = null

  constructor() {
    // Detect if this is a touch device
    this.isTouchDevice = this.detectTouchDevice()
    
    if (!this.isTouchDevice) return
    
    this.init()
  }

  private detectTouchDevice(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    )
  }

  private init(): void {
    // Removed touch-device class addition to prevent layout issues
    
    // Get all service details elements
    const details = document.querySelectorAll('details[data-service-item]')
    
    details.forEach((detail) => {
      const summary = detail.querySelector('summary')
      const toggle = detail.querySelector('.services-toggle')
      
      if (!summary || !toggle) return
      
      // Handle the animation sequence on click/tap
      summary.addEventListener('click', (e) => {
        // Don't prevent default - let the details element toggle naturally
        this.handleToggleAnimation(detail as HTMLDetailsElement, toggle as HTMLElement)
      })
      
      // Clear any stuck hover states when tapping elsewhere
      document.addEventListener('touchstart', (e) => {
        const target = e.target as HTMLElement
        if (!detail.contains(target)) {
          this.clearHoverState(detail as HTMLDetailsElement)
        }
      })
    })
  }

  private handleToggleAnimation(detail: HTMLDetailsElement, toggle: HTMLElement): void {
    // Clear any existing animation timeout
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout)
      this.animationTimeout = null
    }
    
    // Check if we're opening or closing
    const isOpening = !detail.open // It's about to open (hasn't toggled yet)
    
    if (isOpening) {
      // Add mobile animation class - this will handle the direct transition
      // from plus text to minus text with circle appearing
      toggle.classList.add('mobile-animating')
      
      // Remove the animation class after animation completes
      this.animationTimeout = window.setTimeout(() => {
        toggle.classList.remove('mobile-animating')
      }, 400)
      
    } else {
      // Closing - ensure clean state
      toggle.classList.remove('mobile-animating')
      
      // Clear hover state after animation completes
      setTimeout(() => {
        this.clearHoverState(detail)
      }, 300)
    }
  }

  private clearHoverState(detail: HTMLDetailsElement): void {
    const summary = detail.querySelector('summary')
    const toggle = detail.querySelector('.services-toggle')
    
    if (summary && toggle) {
      // Remove any animation classes
      toggle.classList.remove('mobile-animating')
      
      // Force a reflow to clear any stuck states
      void toggle.offsetHeight
    }
  }

  public destroy(): void {
    // Clean up event listeners and classes
    document.body.classList.remove('touch-device')
    
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout)
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new ServicesMobileAnimation()
})

export default ServicesMobileAnimation