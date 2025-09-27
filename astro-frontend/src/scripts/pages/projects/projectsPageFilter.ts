// Service filtering functionality with URL parameter support for ProjectsPageLayout

// Extend Window interface to include our global variables
declare global {
  interface Window {
    activeFilters: Set<string>
    announceFilterResults: () => void
    isDragEvent?: boolean
  }
}

// Export to make this a module (required for global augmentation)
export {}

function initProjectsPageFilter(): void {
  const filterPills = document.querySelectorAll<HTMLElement>('.filter-pill')
  const projectItems = document.querySelectorAll<HTMLElement>('.project-item')
  const deleteFiltersBtn = document.querySelector<HTMLButtonElement>('.delete-filters')

  // Get translations from data attributes (we'll add these to the HTML)
  const filterContainer = document.querySelector('.projects-filter-container')
  const filtersActiveText =
    filterContainer?.getAttribute('data-filters-active') ||
    '{0} filters active, showing {1} projects'
  const allProjectsText =
    filterContainer?.getAttribute('data-all-projects') || 'Showing all {0} projects'

  // Track active filters using a Set for O(1) lookup efficiency
  window.activeFilters = new Set()

  // Check for service parameter in URL on page load
  window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search)
    const serviceParam = urlParams.get('service')

    if (serviceParam) {
      // Try to find pill by slug first (check data-slug), then fallback to ID (data-service)
      let pill = document.querySelector<HTMLElement>(`[data-slug="${serviceParam}"]`)
      if (!pill) {
        // Fallback to ID-based search for backward compatibility
        pill = document.querySelector<HTMLElement>(`[data-service="${serviceParam}"]`)
      }
      if (pill) {
        // Simulate a click to activate the filter
        pill.click()
      }
    }
  })

  // Function to handle filter click
  function handleFilterClick(pill: HTMLElement): void {
    // Prevent filter activation if this was triggered by drag
    if (window.isDragEvent) {
      window.isDragEvent = false
      return
    }

    const serviceId = pill.getAttribute('data-service')
    if (!serviceId) return

    const isActive = pill.classList.contains('active')

    if (isActive) {
      // Remove from active filters
      pill.classList.remove('active')
      pill.setAttribute('aria-pressed', 'false')
      window.activeFilters.delete(serviceId)
    } else {
      // Add to active filters
      pill.classList.add('active')
      pill.setAttribute('aria-pressed', 'true')
      window.activeFilters.add(serviceId)
    }

    // Filter project items
    projectItems.forEach((item) => {
      const itemServices = item.getAttribute('data-services')?.split(',') || []

      if (window.activeFilters.size === 0) {
        // No filters active, show all
        item.style.display = 'block'
      } else {
        // Check if item has any of the active filters
        const hasActiveFilter = itemServices.some((service) => window.activeFilters.has(service))
        item.style.display = hasActiveFilter ? 'block' : 'none'
      }
    })

    // Announce results for screen readers
    window.announceFilterResults()
  }

  // Add keyboard support and click handlers to filter pills
  filterPills.forEach((pill) => {
    pill.setAttribute('tabindex', '0')
    pill.setAttribute('aria-pressed', 'false')

    // Keyboard support
    pill.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        pill.click()
      }
    })

    // Click handler
    pill.addEventListener('click', () => handleFilterClick(pill))
  })

  // Create live region for screen reader announcements
  const liveRegion = document.createElement('div')
  liveRegion.setAttribute('role', 'status')
  liveRegion.setAttribute('aria-live', 'polite')
  liveRegion.setAttribute('aria-atomic', 'true')
  liveRegion.classList.add('sr-only')
  document.body.appendChild(liveRegion)

  // Function to announce filter results
  window.announceFilterResults = function (): void {
    const visibleCount = [...projectItems].filter((item) => item.style.display !== 'none').length
    const filterCount = window.activeFilters.size

    if (filterCount > 0) {
      // Replace {0} with filterCount and {1} with visibleCount
      liveRegion.textContent = filtersActiveText
        .replace('{0}', filterCount.toString())
        .replace('{1}', visibleCount.toString())
    } else {
      // Replace {0} with visibleCount
      liveRegion.textContent = allProjectsText.replace('{0}', visibleCount.toString())
    }
  }

  // Delete filters button
  if (deleteFiltersBtn) {
    deleteFiltersBtn.addEventListener('click', () => {
      // Clear all filters
      filterPills.forEach((p) => {
        p.classList.remove('active')
        p.setAttribute('aria-pressed', 'false')
      })
      window.activeFilters.clear()

      // Show all projects
      projectItems.forEach((item) => {
        item.style.display = 'block'
      })

      // Announce that filters have been cleared
      window.announceFilterResults()
    })
  }
}

// Initialize on DOM content loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectsPageFilter)
} else {
  initProjectsPageFilter()
}

// Re-initialize on Astro page navigation
document.addEventListener('astro:page-load', initProjectsPageFilter)
