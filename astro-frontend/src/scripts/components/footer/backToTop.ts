// Back to top functionality for footer links
function initBackToTop(): void {
  // Find all back-to-top links and the horizontal scrolling container from the main page
  const backToTopLinks = document.querySelectorAll<HTMLAnchorElement>('.back-to-top-link')
  const horizontalContainer = document.getElementById('horizontal-container')

  // Add listener to all back-to-top links
  backToTopLinks.forEach((link) => {
    link.addEventListener('click', (event: Event) => {
      // 1. Stop the link from its default "jump" behavior
      event.preventDefault()

      // 2. Instantly reset the horizontal container to the beginning if it exists
      if (horizontalContainer) {
        horizontalContainer.scrollLeft = 0
      }

      // 3. Smoothly scroll the main page to the very top
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    })
  })
}

// Initialize on DOM content loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBackToTop)
} else {
  initBackToTop()
}

// Re-initialize on Astro page navigation
document.addEventListener('astro:page-load', initBackToTop)
