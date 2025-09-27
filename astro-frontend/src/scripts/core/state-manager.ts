/**
 * Centralized state management to avoid global window pollution
 * Provides type-safe state management across scripts
 */

type StateValue = unknown
type StateListener<T = unknown> = (value: T) => void

class StateManager {
  private static instance: StateManager | null = null
  private state = new Map<string, StateValue>()
  private listeners = new Map<string, Set<StateListener>>()

  private constructor() {
    // Clear state on page navigation unless marked as persistent
    document.addEventListener('astro:before-swap', () => {
      this.clearNonPersistent()
    })
  }

  static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager()
    }
    return StateManager.instance
  }

  /**
   * Set a state value
   */
  set<T>(key: string, value: T): void {
    this.state.set(key, value)
    this.notifyListeners(key, value)
  }

  /**
   * Get a state value with type safety
   */
  get<T>(key: string): T | undefined {
    return this.state.get(key) as T | undefined
  }

  /**
   * Get a state value with a default
   */
  getOrDefault<T>(key: string, defaultValue: T): T {
    return (this.state.get(key) as T) ?? defaultValue
  }

  /**
   * Check if a state key exists
   */
  has(key: string): boolean {
    return this.state.has(key)
  }

  /**
   * Delete a state value
   */
  delete(key: string): void {
    this.state.delete(key)
    this.notifyListeners(key, undefined)
  }

  /**
   * Clear all state
   */
  clear(): void {
    this.state.clear()
    // Notify all listeners that their values are gone
    for (const listeners of this.listeners.values()) {
      for (const listener of listeners) {
        listener(undefined)
      }
    }
  }

  /**
   * Clear non-persistent state (called on navigation)
   */
  private clearNonPersistent(): void {
    // For now, clear everything except specific persistent keys
    const persistentKeys = new Set(['theme', 'locale', 'user-preferences'])

    for (const key of this.state.keys()) {
      if (!persistentKeys.has(key)) {
        this.delete(key)
      }
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe<T>(key: string, listener: StateListener<T>): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }

    const listeners = this.listeners.get(key)!
    listeners.add(listener as StateListener)

    // Return unsubscribe function
    return () => {
      listeners.delete(listener as StateListener)
      if (listeners.size === 0) {
        this.listeners.delete(key)
      }
    }
  }

  /**
   * Notify listeners of state change
   */
  private notifyListeners<T>(key: string, value: T): void {
    const listeners = this.listeners.get(key)
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(value)
        } catch (error) {
          console.error(`[StateManager] Error in listener for "${key}":`, error)
        }
      }
    }
  }

  /**
   * Get all keys (for debugging)
   */
  keys(): string[] {
    return Array.from(this.state.keys())
  }

  /**
   * Get state size (for debugging)
   */
  get size(): number {
    return this.state.size
  }
}

// Export singleton instance
export const stateManager = StateManager.getInstance()

/**
 * Type-safe state key creator
 */
export function createStateKey<T>(namespace: string, key: string) {
  const fullKey = `${namespace}:${key}`

  return {
    set(value: T): void {
      stateManager.set(fullKey, value)
    },
    get(): T | undefined {
      return stateManager.get<T>(fullKey)
    },
    getOrDefault(defaultValue: T): T {
      return stateManager.getOrDefault(fullKey, defaultValue)
    },
    delete(): void {
      stateManager.delete(fullKey)
    },
    subscribe(listener: StateListener<T>): () => void {
      return stateManager.subscribe(fullKey, listener)
    },
  }
}
