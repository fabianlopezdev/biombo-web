// Service filtering functionality with URL parameter support for ProjectsPageLayout
import { BaseFilter } from '@/scripts/core/base-filter-class'
import { registerScript } from '@/scripts/core/initialization-manager'
import { stateManager, createStateKey } from '@/scripts/core/state-manager'
import { cleanupRegistry } from '@/scripts/core/cleanup-registry'

// Extend Window interface for backward compatibility properties
declare global {
  interface Window {
    activeFilters?: Set<string>
    announceFilterResults?: () => void
  }
}

// Create type-safe state keys
const activeFiltersKey = createStateKey<Set<string>>('filter', 'activeFilters')
const announceResultsKey = createStateKey<() => void>('filter', 'announceResults')

class ProjectsPageFilter extends BaseFilter {
  private deleteFiltersBtn: HTMLElement | null
  private liveRegion: HTMLElement | null = null
  private filtersActiveText: string
  private allProjectsText: string
  private urlTimeoutId: number | undefined

  constructor() {
    super({
      filterSelector: '.filter-pill',
      itemSelector: '.project-item',
      itemDataAttribute: 'data-services',
      activeClass: 'active',
    })

    // Get translations from data attributes
    const filterContainer = document.querySelector('.projects-filter-container')
    if (!filterContainer) {
      console.warn('[ProjectsPageFilter] Filter container not found')
    }

    this.filtersActiveText =
      filterContainer?.getAttribute('data-filters-active') ||
      '{0} filters active, showing {1} projects'
    this.allProjectsText =
      filterContainer?.getAttribute('data-all-projects') || 'Showing all {0} projects'

    this.deleteFiltersBtn = document.querySelector<HTMLElement>('.delete-filters')

    // Set up additional features specific to ProjectsPage
    this.setupDeleteButton()
    this.setupScreenReaderAnnouncements()
    this.setupGlobalVariables()
  }

  protected handleFilterClick(event: Event): void {
    // Prevent filter activation if this was triggered by drag
    const isDragEvent = stateManager.get<boolean>('filter:isDragEvent')
    if (isDragEvent) {
      stateManager.delete('filter:isDragEvent')
      return
    }

    super.handleFilterClick(event)
  }

  protected matchesFilters(itemData: string[]): boolean {
    // For ProjectsPage: item should show if it has ANY of the active filters
    return Array.from(this.activeFilters).some((filter) => itemData.includes(filter))
  }

  protected handleInitialState(): void {
    // Check for service parameter in URL
    const urlParams = new URLSearchParams(window.location.search)
    const serviceParam = urlParams.get('service')

    if (serviceParam) {
      // Try to find pill by slug first, then fallback to ID
      const pill =
        document.querySelector<HTMLElement>(`[data-slug="${serviceParam}"]`) ||
        document.querySelector<HTMLElement>(`[data-service="${serviceParam}"]`)

      if (pill) {
        // Use setTimeout to ensure DOM is ready, but store the ID for cleanup
        this.urlTimeoutId = window.setTimeout(() => {
          pill.click()
          this.urlTimeoutId = undefined
        }, 0)
      }
    }
  }

  protected onFiltersChanged(): void {
    // Announce results for screen readers
    this.announceFilterResults()
  }

  private setupDeleteButton(): void {
    if (!this.deleteFiltersBtn) return

    const handleClick = (): void => {
      this.clearAllFilters()
      this.showAllItems()
      this.onFiltersChanged()
    }

    this.deleteFiltersBtn.addEventListener('click', handleClick)

    // Store cleanup
    cleanupRegistry.register({
      id: 'projectsPageFilter:deleteButton',
      cleanup: () => {
        this.deleteFiltersBtn?.removeEventListener('click', handleClick)
      },
    })
  }

  private setupScreenReaderAnnouncements(): void {
    // Create live region for screen reader announcements
    this.liveRegion = document.createElement('div')
    this.liveRegion.setAttribute('role', 'status')
    this.liveRegion.setAttribute('aria-live', 'polite')
    this.liveRegion.setAttribute('aria-atomic', 'true')
    this.liveRegion.classList.add('sr-only')
    document.body.appendChild(this.liveRegion)
  }

  private announceFilterResults(): void {
    if (!this.liveRegion) return

    const visibleCount = this.getVisibleCount()
    const filterCount = this.activeFilters.size

    if (filterCount > 0) {
      // Replace {0} with filterCount and {1} with visibleCount
      this.liveRegion.textContent = this.filtersActiveText
        .replace('{0}', filterCount.toString())
        .replace('{1}', visibleCount.toString())
    } else {
      // Replace {0} with visibleCount
      this.liveRegion.textContent = this.allProjectsText.replace('{0}', visibleCount.toString())
    }
  }

  private setupGlobalVariables(): void {
    // Use state manager instead of window properties
    activeFiltersKey.set(this.activeFilters)
    announceResultsKey.set(() => this.announceFilterResults())

    // For backward compatibility, also set on window (with deprecation warning)
    if (typeof window !== 'undefined') {
      window.activeFilters = this.activeFilters
      window.announceFilterResults = () => {
        console.warn(
          '[ProjectsPageFilter] window.announceFilterResults is deprecated. Use state manager.',
        )
        this.announceFilterResults()
      }
    }
  }

  destroy(): void {
    // Clear timeout if it exists
    if (this.urlTimeoutId !== undefined) {
      clearTimeout(this.urlTimeoutId)
      this.urlTimeoutId = undefined
    }

    super.destroy()

    // Clean up live region
    if (this.liveRegion) {
      this.liveRegion.remove()
      this.liveRegion = null
    }

    // Clean up state manager
    activeFiltersKey.delete()
    announceResultsKey.delete()

    // Clean up window properties (for backward compatibility)
    if (typeof window !== 'undefined' && window.activeFilters === this.activeFilters) {
      // Only delete if it's still our instance
      delete window.activeFilters
      delete window.announceFilterResults
    }
  }
}

// Register the script with initialization manager
registerScript('projectsPageFilter', () => {
  const filter = new ProjectsPageFilter()

  // Register main cleanup
  cleanupRegistry.register({
    id: 'projectsPageFilter:main',
    cleanup: () => filter.destroy(),
  })

  return () => filter.destroy()
})
