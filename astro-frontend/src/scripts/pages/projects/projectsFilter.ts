// Service filtering functionality for project cards in ProjectsList component
function initProjectsFilter(): void {
  const filterButtons = document.querySelectorAll<HTMLElement>('.filter-button')
  const projectCards = document.querySelectorAll<HTMLElement>('.project-card')

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.getAttribute('data-filter')

      // Update active state
      filterButtons.forEach((btn) => {
        btn.classList.remove('active')
        btn.setAttribute('aria-pressed', 'false')
      })
      button.classList.add('active')
      button.setAttribute('aria-pressed', 'true')

      // Filter projects
      projectCards.forEach((card) => {
        if (filter === 'all') {
          card.style.display = 'block'
        } else {
          const cardServices = card.getAttribute('data-services')?.split(',') || []
          if (cardServices.includes(filter || '')) {
            card.style.display = 'block'
          } else {
            card.style.display = 'none'
          }
        }
      })
    })
  })
}

// Initialize on DOM content loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectsFilter)
} else {
  initProjectsFilter()
}

// Re-initialize on Astro page navigation
document.addEventListener('astro:page-load', initProjectsFilter)
