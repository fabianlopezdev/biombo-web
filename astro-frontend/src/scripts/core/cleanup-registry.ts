/**
 * Centralized cleanup registry for managing script lifecycle
 * Ensures all event listeners, timers, and observers are properly cleaned up
 */

export interface Cleanup {
  (): void
}

export interface CleanupOptions {
  id: string
  cleanup: Cleanup
  persistent?: boolean // If true, survives page navigation
}

class CleanupRegistry {
  private static instance: CleanupRegistry | null = null
  private cleanups = new Map<string, Cleanup>()
  private persistentCleanups = new Set<string>()

  private constructor() {
    // Listen for Astro page navigation to clean up non-persistent items
    document.addEventListener('astro:before-swap', () => {
      this.cleanupNonPersistent()
    })
  }

  static getInstance(): CleanupRegistry {
    if (!CleanupRegistry.instance) {
      CleanupRegistry.instance = new CleanupRegistry()
    }
    return CleanupRegistry.instance
  }

  /**
   * Register a cleanup function
   */
  register(options: CleanupOptions): void {
    const { id, cleanup, persistent = false } = options

    // Clean up existing if it exists
    this.cleanup(id)

    this.cleanups.set(id, cleanup)

    if (persistent) {
      this.persistentCleanups.add(id)
    } else {
      this.persistentCleanups.delete(id)
    }
  }

  /**
   * Execute and remove a specific cleanup
   */
  cleanup(id: string): void {
    const cleanupFn = this.cleanups.get(id)
    if (cleanupFn) {
      try {
        cleanupFn()
      } catch (error) {
        console.error(`[CleanupRegistry] Error during cleanup of "${id}":`, error)
      }
      this.cleanups.delete(id)
      this.persistentCleanups.delete(id)
    }
  }

  /**
   * Clean up all non-persistent items (called on page navigation)
   */
  private cleanupNonPersistent(): void {
    for (const [id, cleanup] of this.cleanups.entries()) {
      if (!this.persistentCleanups.has(id)) {
        try {
          cleanup()
        } catch (error) {
          console.error(`[CleanupRegistry] Error during cleanup of "${id}":`, error)
        }
        this.cleanups.delete(id)
      }
    }
  }

  /**
   * Clean up all items (including persistent)
   */
  cleanupAll(): void {
    for (const [id, cleanup] of this.cleanups.entries()) {
      try {
        cleanup()
      } catch (error) {
        console.error(`[CleanupRegistry] Error during cleanup of "${id}":`, error)
      }
    }
    this.cleanups.clear()
    this.persistentCleanups.clear()
  }

  /**
   * Check if a cleanup is registered
   */
  has(id: string): boolean {
    return this.cleanups.has(id)
  }

  /**
   * Get the number of registered cleanups
   */
  get size(): number {
    return this.cleanups.size
  }
}

// Export singleton instance
export const cleanupRegistry = CleanupRegistry.getInstance()

/**
 * Helper to create a cleanup group for related cleanups
 */
export function createCleanupGroup(): {
  add: (cleanup: Cleanup) => void
  cleanupAll: () => void
} {
  const cleanups: Cleanup[] = []

  return {
    add(cleanup: Cleanup): void {
      cleanups.push(cleanup)
    },
    cleanupAll(): void {
      for (const cleanup of cleanups) {
        try {
          cleanup()
        } catch (error) {
          console.error('[CleanupGroup] Cleanup error:', error)
        }
      }
      cleanups.length = 0
    },
  }
}
