/**
 * Initialization Manager for preventing duplicate script initialization
 * and managing cleanup on page navigation
 */

interface ScriptInstance {
  name: string
  cleanup?: () => void
  initialized: boolean
}

class InitializationManager {
  private scripts = new Map<string, ScriptInstance>()
  private cleanupFunctions = new Map<string, (() => void)[]>()

  /**
   * Register and initialize a script
   * @param name - Unique script identifier
   * @param initFn - Initialization function that optionally returns a cleanup function
   * @param options - Configuration options
   */
  register(
    name: string,
    initFn: () => void | (() => void),
    options: {
      reinitOnNavigation?: boolean
      allowMultiple?: boolean
    } = {},
  ): void {
    const { reinitOnNavigation = true, allowMultiple = false } = options

    // Check if already registered and not allowing multiple
    if (!allowMultiple && this.scripts.has(name)) {
      const script = this.scripts.get(name)!
      if (script.initialized && !reinitOnNavigation) {
        console.log(`Script "${name}" already initialized, skipping...`)
        return
      }
    }

    // Clean up previous instance if it exists
    this.cleanup(name)

    // Initialize the script
    try {
      const cleanupFn = initFn()

      // Store script instance
      this.scripts.set(name, {
        name,
        cleanup: typeof cleanupFn === 'function' ? cleanupFn : undefined,
        initialized: true,
      })

      // Store cleanup function if provided
      if (typeof cleanupFn === 'function') {
        const cleanups = this.cleanupFunctions.get(name) || []
        cleanups.push(cleanupFn)
        this.cleanupFunctions.set(name, cleanups)
      }
    } catch (error) {
      console.error(`Error initializing script "${name}":`, error)
    }
  }

  /**
   * Clean up a specific script
   */
  cleanup(name: string): void {
    const script = this.scripts.get(name)

    if (script?.cleanup) {
      try {
        script.cleanup()
      } catch (error) {
        console.error(`Error cleaning up script "${name}":`, error)
      }
    }

    // Run all cleanup functions for this script
    const cleanups = this.cleanupFunctions.get(name)
    if (cleanups) {
      cleanups.forEach((cleanup) => {
        try {
          cleanup()
        } catch (error) {
          console.error(`Error running cleanup for "${name}":`, error)
        }
      })
      this.cleanupFunctions.delete(name)
    }

    // Mark as not initialized
    const scriptInstance = this.scripts.get(name)
    if (scriptInstance) {
      scriptInstance.initialized = false
    }
  }

  /**
   * Clean up all registered scripts
   */
  cleanupAll(): void {
    for (const [name] of this.scripts) {
      this.cleanup(name)
    }
  }

  /**
   * Check if a script is initialized
   */
  isInitialized(name: string): boolean {
    return this.scripts.get(name)?.initialized ?? false
  }

  /**
   * Get all registered script names
   */
  getRegisteredScripts(): string[] {
    return Array.from(this.scripts.keys())
  }
}

// Create singleton instance
const initManager = new InitializationManager()

// Clean up on page navigation
document.addEventListener('astro:before-swap', () => {
  // Clean up scripts that shouldn't persist across navigation
  initManager.cleanupAll()
})

// Export singleton instance
export default initManager

/**
 * Helper function to register a script with standard configuration
 */
export function registerScript(
  name: string,
  initFn: () => void | (() => void),
  options?: {
    runOnce?: boolean
    autoReinit?: boolean
  },
): void {
  const { runOnce = false, autoReinit = true } = options || {}

  function initialize() {
    initManager.register(name, initFn, {
      reinitOnNavigation: autoReinit && !runOnce,
      allowMultiple: false,
    })
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true })
  } else {
    initialize()
  }

  // Re-initialize on Astro navigation if needed
  if (autoReinit && !runOnce) {
    document.addEventListener('astro:page-load', initialize)
  }
}
