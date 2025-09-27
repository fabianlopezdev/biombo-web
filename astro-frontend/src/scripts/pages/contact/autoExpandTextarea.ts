// Auto-expand textarea functionality for contact form
function initAutoExpandTextarea(): void {
  const autoExpandTextareas = document.querySelectorAll<HTMLTextAreaElement>('textarea.auto-expand')

  autoExpandTextareas.forEach((textarea) => {
    // Function to adjust height
    const adjustHeight = (): void => {
      // Reset height to min-height to get accurate scrollHeight
      textarea.style.height = 'auto'
      // Set height to scrollHeight but respect max-height from CSS
      textarea.style.height = textarea.scrollHeight + 'px'
    }

    // Adjust on input
    textarea.addEventListener('input', adjustHeight)

    // Initial adjustment in case there's pre-filled content
    adjustHeight()
  })
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', initAutoExpandTextarea)
// Re-initialize on Astro page navigation
document.addEventListener('astro:page-load', initAutoExpandTextarea)
