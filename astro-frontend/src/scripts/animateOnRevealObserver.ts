/**
 * Intersection Observer for triggering animations when elements come into view
 * Supports both immediate animations and reveal-based animations
 */

interface AnimateOnRevealOptions {
  threshold?: number | number[];
  rootMargin?: string;
  animationClass?: string;
  once?: boolean;
}

class AnimateOnReveal {
  private observer: IntersectionObserver;
  private animatedElements: WeakSet<Element>;
  private options: Required<AnimateOnRevealOptions>;

  constructor(options: AnimateOnRevealOptions = {}) {
    this.options = {
      threshold: options.threshold ?? 0.1,
      rootMargin: options.rootMargin ?? '0px',
      animationClass: options.animationClass ?? 'animate',
      once: options.once ?? true,
    };

    this.animatedElements = new WeakSet();
    this.observer = this.createObserver();
  }

  private createObserver(): IntersectionObserver {
    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.handleIntersection(entry.target);
        }
      });
    }, {
      threshold: this.options.threshold,
      rootMargin: this.options.rootMargin,
    });
  }

  private handleIntersection(element: Element): void {
    // Skip if already animated and once is true
    if (this.options.once && this.animatedElements.has(element)) {
      return;
    }

    // Add animation class to trigger CSS animation
    element.classList.add(this.options.animationClass);
    
    // Mark as animated
    this.animatedElements.add(element);

    // Unobserve if animation should only happen once
    if (this.options.once) {
      this.observer.unobserve(element);
    }

    // Dispatch custom event for additional handling
    element.dispatchEvent(new CustomEvent('reveal-animation-triggered', {
      bubbles: true,
      detail: { element }
    }));
  }

  public observe(element: Element): void {
    if (!element) return;
    this.observer.observe(element);
  }

  public observeAll(selector: string): void {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => this.observe(element));
  }

  public disconnect(): void {
    this.observer.disconnect();
  }

  public unobserve(element: Element): void {
    this.observer.unobserve(element);
  }
}

// Initialize on DOM ready
function initAnimateOnReveal(): void {
  // Check if document is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimateOnReveal);
    return;
  }

  // Create observer for footer scribbles
  const footerRevealObserver = new AnimateOnReveal({
    threshold: 0.3, // Trigger when 30% of the element is visible
    rootMargin: '-50px', // Start animation slightly before fully in view
    animationClass: 'animate-draw',
    once: true, // Only animate once
  });

  // Observe all scribbles that should animate on reveal
  footerRevealObserver.observeAll('[data-animate-on-reveal="true"]');

  // Optional: Handle dynamically added elements
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          const revealElements = node.querySelectorAll('[data-animate-on-reveal="true"]');
          revealElements.forEach(el => footerRevealObserver.observe(el));
          
          if (node.matches('[data-animate-on-reveal="true"]')) {
            footerRevealObserver.observe(node);
          }
        }
      });
    });
  });

  // Start observing the document for changes
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Cleanup function for SPA navigation
  const cleanup = () => {
    footerRevealObserver.disconnect();
    mutationObserver.disconnect();
  };

  // Store cleanup function for potential use in page transitions
  (window as any).__animateOnRevealCleanup = cleanup;
}

// Initialize
initAnimateOnReveal();

// Export for use in other modules if needed
export { AnimateOnReveal, initAnimateOnReveal };