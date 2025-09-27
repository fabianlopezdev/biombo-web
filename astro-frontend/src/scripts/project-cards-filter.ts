// Service filtering functionality for project cards in ProjectsList component
import { BaseFilter } from '@/scripts/core/base-filter-class'
import { registerScript } from '@/scripts/core/initialization-manager'
import { cleanupRegistry } from '@/scripts/core/cleanup-registry'

class ProjectsListFilter extends BaseFilter {
  constructor() {
    try {
      super({
        filterSelector: '.filter-button',
        itemSelector: '.project-card',
        itemDataAttribute: 'data-services',
        activeClass: 'active',
        filterAllValue: 'all',
      })
    } catch (error) {
      console.error('[ProjectsListFilter] Initialization failed:', error)
      throw error
    }
  }

  protected matchesFilters(itemData: string[]): boolean {
    // Early return for edge cases
    if (itemData.length === 0 || this.activeFilters.size === 0) {
      return this.activeFilters.size === 0
    }

    // For ProjectsList: item should show if it has ANY of the active filters
    return Array.from(this.activeFilters).some((filter) => itemData.includes(filter))
  }

  protected handleInitialState(): void {
    try {
      // Activate "all" filter by default
      let allFilterFound = false

      this.filterElements.forEach((element) => {
        const filterValue = this.getFilterValue(element)
        if (filterValue === 'all') {
          this.activateFilter(element)
          allFilterFound = true
        }
      })

      if (!allFilterFound) {
        console.warn('[ProjectsListFilter] No "all" filter button found')
      }
    } catch (error) {
      console.error('[ProjectsListFilter] Error handling initial state:', error)
    }
  }

  protected onFiltersChanged(): void {
    // ProjectsList doesn't need announcements or special handling
    // This is handled in the component itself if needed
    console.debug('[ProjectsListFilter] Filters changed, active:', Array.from(this.activeFilters))
  }
}

// Register the script with initialization manager
registerScript('projectsListFilter', () => {
  try {
    const filter = new ProjectsListFilter()

    // Cleanup function
    const cleanup = () => {
      try {
        filter.destroy()
      } catch (error) {
        console.error('[ProjectsListFilter] Error during cleanup:', error)
      }
    }

    // Register with cleanup registry
    cleanupRegistry.register({
      id: 'projectsListFilter',
      cleanup,
    })

    return cleanup
  } catch (error) {
    console.error('[ProjectsListFilter] Failed to initialize:', error)
    return () => {}
  }
})
