// Set up animation for the projects title section

document.addEventListener('DOMContentLoaded', function () {
  /* Respect user preference for reduced-motion */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  // Find the heading element or exit early if not found
  const headingElement = document.getElementById('projects-heading') as HTMLElement
  if (!headingElement) return

  /* ------------------------------------------------------------------
         Animation helpers
      ------------------------------------------------------------------ */
  /* Letter groups commented out - only SVG animation needed
  const letterGroups: NodeListOf<Element>[] = [
    headingElement.querySelectorAll('.chunk-slinky .character'),
    headingElement.querySelectorAll('.chunk-wave  .character'),
    headingElement.querySelectorAll('.chunk-flip  .character'),
  ] */

  // Animation is now triggered through CSS when data-has-played is set to true

  /* Function commented out - only SVG animation needed
  function startAnimationsOnLetters(letters: NodeListOf<Element>) {
    letters.forEach(function (letter) {
      // Check if letter is an HTMLElement before accessing style property
      if (letter instanceof HTMLElement) {
        letter.style.animationPlayState = 'running'
      }
    })
  } */

  // Highlight animation is now controlled entirely through CSS using the data-has-played attribute

  /* Function commented out - only SVG animation needed
  function playChunksSequentially(index = 0) {
    if (!letterGroups[index]) {
      // All animation timing is now controlled by CSS
      return
    }

    startAnimationsOnLetters(letterGroups[index])

    // Get the last element from the current group if available
    const letterGroup = letterGroups[index]
    const last = letterGroup && letterGroup.length > 0 ? letterGroup[letterGroup.length - 1] : null
    if (last && letterGroups[index + 1]) {
      // Make sure we have an HTMLElement with addEventListener
      if (last instanceof HTMLElement) {
        last.addEventListener(
          'animationend',
          function () {
            playChunksSequentially(index + 1)
          },
          { once: true },
        )
      }
    }
  } */

  /* ------------------------------------------------------------------
         Robust trigger / cleanup logic
      ------------------------------------------------------------------ */
  let hasPlayed = false
  let observer: IntersectionObserver | undefined /* declared here so cleanup can reach it */

  const abortCtrl = new AbortController()
  const { signal } = abortCtrl

  function triggerAnimation() {
    if (hasPlayed) return
    hasPlayed = true
    headingElement.dataset.hasPlayed = 'true'
    // playChunksSequentially() - commented out, only SVG animation needed

    /* Cleanup all listeners/observers */
    abortCtrl.abort()
    if (observer) observer.disconnect()
  }

  /* ------------------------------------------------------------------
         Intersection Observer path (preferred)
      ------------------------------------------------------------------ */
  const viewportRevealedRatio = 0.55

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= viewportRevealedRatio) {
            triggerAnimation()
          }
        })
      },
      {
        threshold: viewportRevealedRatio,
        rootMargin: '-20px',
      },
    )

    observer.observe(headingElement)
  } else {
    /* ----------------------------------------------------------------
           Scroll/resize fallback with rAF throttling & early detach
        ---------------------------------------------------------------- */
    let rAFScheduled = false

    // Properly typed event handler function
    function fallbackHandler(): void {
      if (rAFScheduled) return
      rAFScheduled = true

      requestAnimationFrame(function () {
        rAFScheduled = false
        if (hasPlayed || signal.aborted) return

        const rect = headingElement.getBoundingClientRect()

        /* visible-area calc (same 80 % rule) */
        const visibleH = Math.max(
          0,
          Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0),
        )
        const visibleW = Math.max(
          0,
          Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0),
        )
        const visibleArea = visibleH * visibleW
        const totalArea = rect.width * rect.height

        if (totalArea > 0 && visibleArea / totalArea >= viewportRevealedRatio) {
          triggerAnimation()
          return
        }

        /* Early-detach: user has scrolled > 2 viewport heights past heading */
        if (rect.top < -2 * window.innerHeight) abortCtrl.abort()
      })
    }

    // Define properly typed event handlers
    const handleScroll = (): void => {
      fallbackHandler()
    }

    const handleResize = (): void => {
      fallbackHandler()
    }

    // Attach event listeners
    document.addEventListener('scroll', () => handleScroll(), { passive: true, signal })
    document.addEventListener('resize', () => handleResize(), { signal })

    /* Initial check (in case heading already visible) */
    // Call the handler immediately to check if animation should start right away
    fallbackHandler()
  }
})
