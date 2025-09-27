/**
 * Base class for filtering functionality shared between different filter implementations
 */

import { createCleanupGroup } from '@/scripts/core/cleanup-registry'

export interface FilterOptions {
  filterSelector: string
  itemSelector: string
  itemDataAttribute?: string
  activeClass?: string
  filterAllValue?: string
}

export abstract class BaseFilter {
  protected filterElements: NodeListOf<HTMLElement>
  protected itemElements: NodeListOf<HTMLElement>
  protected activeFilters = new Set<string>()
  protected options: Required<FilterOptions>
  private cleanupGroup = createCleanupGroup()
  private eventHandlers = new Map<HTMLElement, Map<string, EventListener>>()

  constructor(options: FilterOptions) {
    this.options = {
      itemDataAttribute: 'data-services',
      activeClass: 'active',
      filterAllValue: 'all',
      ...options,
    }

    this.filterElements = document.querySelectorAll<HTMLElement>(this.options.filterSelector)
    this.itemElements = document.querySelectorAll<HTMLElement>(this.options.itemSelector)

    if (this.filterElements.length === 0) {
      console.warn(
        `[BaseFilter] No filter elements found for selector: ${this.options.filterSelector}`,
      )
    }

    if (this.itemElements.length === 0) {
      console.warn(`[BaseFilter] No item elements found for selector: ${this.options.itemSelector}`)
    }

    this.init()
  }

  protected init(): void {
    this.setupFilterElements()
    this.setupKeyboardSupport()
    this.handleInitialState()
  }

  protected setupFilterElements(): void {
    this.filterElements.forEach((element) => {
      const handleClick = (e: Event) => this.handleFilterClick(e)

      // Store event handler for cleanup
      this.addEventHandler(element, 'click', handleClick)
      element.addEventListener('click', handleClick)
      element.setAttribute('aria-pressed', 'false')
    })
  }

  protected setupKeyboardSupport(): void {
    this.filterElements.forEach((element) => {
      element.setAttribute('tabindex', '0')

      const handleKeydown = (e: Event) => {
        if (e instanceof KeyboardEvent && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          element.click()
        }
      }

      // Store event handler for cleanup
      this.addEventHandler(element, 'keydown', handleKeydown)
      element.addEventListener('keydown', handleKeydown)
    })
  }

  protected handleFilterClick(event: Event): void {
    const element = event.currentTarget as HTMLElement
    if (!element) return

    const filterValue = this.getFilterValue(element)
    if (!filterValue) {
      console.warn('[BaseFilter] No filter value found for element:', element)
      return
    }

    // Handle 'all' filter specially
    if (filterValue === this.options.filterAllValue) {
      this.clearAllFilters()
      this.activateFilter(element)
      this.showAllItems()
    } else {
      this.toggleFilter(element, filterValue)
      this.applyFilters()
    }

    this.onFiltersChanged()
  }

  protected toggleFilter(element: HTMLElement, filterValue: string): void {
    const isActive = element.classList.contains(this.options.activeClass)

    if (isActive) {
      element.classList.remove(this.options.activeClass)
      element.setAttribute('aria-pressed', 'false')
      this.activeFilters.delete(filterValue)
    } else {
      // Deactivate "all" filter if it's active
      this.deactivateAllFilter()
      element.classList.add(this.options.activeClass)
      element.setAttribute('aria-pressed', 'true')
      this.activeFilters.add(filterValue)
    }
  }

  protected activateFilter(element: HTMLElement): void {
    element.classList.add(this.options.activeClass)
    element.setAttribute('aria-pressed', 'true')
  }

  protected deactivateAllFilter(): void {
    this.filterElements.forEach((el) => {
      const filterValue = this.getFilterValue(el)
      if (filterValue === this.options.filterAllValue) {
        el.classList.remove(this.options.activeClass)
        el.setAttribute('aria-pressed', 'false')
      }
    })
  }

  protected clearAllFilters(): void {
    this.filterElements.forEach((element) => {
      element.classList.remove(this.options.activeClass)
      element.setAttribute('aria-pressed', 'false')
    })
    this.activeFilters.clear()
  }

  protected showAllItems(): void {
    this.itemElements.forEach((item) => {
      item.style.display = 'block'
    })
  }

  protected applyFilters(): void {
    if (this.activeFilters.size === 0) {
      this.showAllItems()
      // Activate "all" filter
      this.filterElements.forEach((el) => {
        const filterValue = this.getFilterValue(el)
        if (filterValue === this.options.filterAllValue) {
          this.activateFilter(el)
        }
      })
      return
    }

    this.itemElements.forEach((item) => {
      const shouldShow = this.shouldShowItem(item)
      item.style.display = shouldShow ? 'block' : 'none'
    })
  }

  protected shouldShowItem(item: HTMLElement): boolean {
    const itemData = item.getAttribute(this.options.itemDataAttribute)?.split(',') || []
    return this.matchesFilters(itemData)
  }

  protected getFilterValue(element: HTMLElement): string | null {
    return element.getAttribute('data-filter') || element.getAttribute('data-service') || null
  }

  protected getVisibleCount(): number {
    return Array.from(this.itemElements).filter((item) => item.style.display !== 'none').length
  }

  /**
   * Helper to track event handlers for cleanup
   */
  private addEventHandler(element: HTMLElement, event: string, handler: EventListener): void {
    if (!this.eventHandlers.has(element)) {
      this.eventHandlers.set(element, new Map())
    }
    this.eventHandlers.get(element)!.set(event, handler)

    // Add to cleanup group
    this.cleanupGroup.add(() => {
      element.removeEventListener(event, handler)
    })
  }

  /**
   * Override this method to implement different matching logic
   * (e.g., ANY match vs ALL match)
   */
  protected abstract matchesFilters(itemData: string[]): boolean

  /**
   * Override this method to handle initial state (e.g., URL parameters)
   */
  protected abstract handleInitialState(): void

  /**
   * Override this method to handle filter changes (e.g., announcements)
   */
  protected abstract onFiltersChanged(): void

  /**
   * Cleanup method to remove event listeners
   */
  destroy(): void {
    // Clean up all event listeners
    this.cleanupGroup.cleanupAll()

    // Clean up event handler references
    this.eventHandlers.clear()

    // Clear active filters
    this.activeFilters.clear()

    // Reset elements to initial state
    this.filterElements.forEach((element) => {
      element.classList.remove(this.options.activeClass)
      element.setAttribute('aria-pressed', 'false')
      element.removeAttribute('tabindex')
    })

    this.itemElements.forEach((item) => {
      item.style.display = ''
    })
  }
}
