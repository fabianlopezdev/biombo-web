/**
 * Services list animation
 * Staggered fade-up animation for service items
 */

class ServicesListAnimation {
  private container!: HTMLElement
  private items!: NodeListOf<HTMLDetailsElement>
  private animatedItems: HTMLDetailsElement[] = []
  private observer?: IntersectionObserver

  constructor() {
    // Add a delay to ensure text animations have time to measure properly
    // This prevents race conditions with slideUpTextAnimation.ts
    setTimeout(() => {
      const container = document.querySelector('.services-list') as HTMLElement
      if (!container) return

      this.container = container
      this.items = container.querySelectorAll('details[data-service-item]')

      if (this.items.length === 0) return

      this.init()
    }, 500) // Wait 500ms to let text animations complete measurement
  }

  private init(): void {
    // Set initial state for all items
    this.items.forEach((item) => {
      item.style.opacity = '0'
      item.style.transform = 'translateY(30px)'
      item.style.transition = 'none'
    })

    // Set up intersection observer for EACH item
    this.setupIntersectionObserver()
  }

  private setupIntersectionObserver(): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback: animate all items immediately
      this.items.forEach((item) => this.animateItem(item))
      return
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const item = entry.target as HTMLDetailsElement
            if (!this.animatedItems.includes(item)) {
              this.animateItem(item)
              this.animatedItems.push(item)
              this.observer?.unobserve(item)
            }
          }
        })
      },
      {
        threshold: 0.2, // Trigger when 20% of the item is visible
        rootMargin: '-50px', // Start a bit before fully in view for smoother feel
      },
    )

    // Observe EACH item individually
    this.items.forEach((item) => {
      this.observer?.observe(item)
    })
  }

  private animateItem(item: HTMLDetailsElement): void {
    // Use requestAnimationFrame to ensure smooth animation
    requestAnimationFrame(() => {
      // Small delay to ensure paint
      setTimeout(() => {
        item.style.transition =
          'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        item.style.opacity = '1'
        item.style.transform = 'translateY(0)'

        // Add class for potential CSS hooks
        item.classList.add('animate-in')
      }, 50)
    })
  }

  public destroy(): void {
    // Clean up observers
    this.observer?.disconnect()

    // Reset styles
    this.items.forEach((item) => {
      item.style.opacity = ''
      item.style.transform = ''
      item.style.transition = ''
      item.classList.remove('animate-in')
    })
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  // Initialize the animation
  new ServicesListAnimation()
})

export default ServicesListAnimation
