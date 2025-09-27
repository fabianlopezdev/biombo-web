/**
 * Magnetic cursor effect for project tiles
 * - Follows cursor with magnetic attraction near center
 * - Handles horizontal scrolling correctly
 * - Respects prefers-reduced-motion
 * - Cleans up properly on page navigation
 */

import { registerScript } from '@/scripts/core/initialization-manager'
import { cleanupRegistry } from '@/scripts/core/cleanup-registry'

// Configuration
const CONFIG = {
  STRENGTH: 0.15,
  MAGNET_RADIUS: 120,
  DAMPENING: 0.08,
  CENTER_PULL: 0.3,
  COLLAPSE_DELAY: 250,
  CLICK_ANIMATION_DURATION: 300,
} as const

interface CursorState {
  element: HTMLElement
  active: boolean
  inMagnetic: boolean
  position: { x: number; y: number }
  target: { x: number; y: number }
  viewport: { x: number; y: number }
  timers: Set<ReturnType<typeof setTimeout>>
}

class MagneticCursor {
  private state: CursorState
  private elements: {
    project: HTMLElement
    link: HTMLAnchorElement
    cursor: HTMLElement
    cursorText: HTMLElement | null
    cursorImage: HTMLImageElement | null
    scrollContainer: HTMLElement | null
  }
  private listeners: Array<() => void> = []
  private rafId: number | null = null
  private prefersReducedMotion: boolean
  private initialized = false

  constructor(project: HTMLElement) {
    // Early return if missing required elements
    const link = project.querySelector<HTMLAnchorElement>('.project-link')
    const cursor = project.querySelector<HTMLElement>('.project-cursor')
    if (!link || !cursor) {
      console.warn('[MagneticCursor] Missing required elements')
      // Initialize with empty values to satisfy TypeScript
      this.state = {
        element: document.createElement('div'),
        active: false,
        inMagnetic: false,
        position: { x: 0, y: 0 },
        target: { x: 0, y: 0 },
        viewport: { x: 0, y: 0 },
        timers: new Set(),
      }
      this.elements = {
        project: document.createElement('div'),
        link: document.createElement('a'),
        cursor: document.createElement('div'),
        cursorText: null,
        cursorImage: null,
        scrollContainer: null,
      }
      this.prefersReducedMotion = false
      return
    }

    this.prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

    this.elements = {
      project,
      link,
      cursor,
      cursorText: cursor.querySelector<HTMLElement>('.cursor-text'),
      cursorImage: cursor.querySelector<HTMLImageElement>('.cursor-image'),
      scrollContainer: document.getElementById('horizontal-container'),
    }

    this.state = {
      element: cursor,
      active: false,
      inMagnetic: false,
      position: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
      viewport: { x: 0, y: 0 },
      timers: new Set(),
    }

    this.initialized = true
    this.init()
  }

  private init(): void {
    // Early return if not initialized
    if (!this.initialized) return

    // Early return for touch devices
    if (this.isTouchDevice()) return

    this.setupEventListeners()
  }

  private isTouchDevice(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(hover: none)').matches ||
      window.matchMedia('(pointer: coarse)').matches
    )
  }

  private setupEventListeners(): void {
    const { link, scrollContainer } = this.elements
    const opts = { passive: true }

    // Pointer events
    const enter = (e: PointerEvent) => this.handleEnter(e)
    const leave = () => this.handleLeave()
    const move = (e: PointerEvent) => this.handleMove(e)
    const down = () => this.handleClick()

    link.addEventListener('pointerenter', enter, opts)
    link.addEventListener('pointerleave', leave, opts)
    link.addEventListener('pointermove', move, opts)
    link.addEventListener('pointerdown', down)

    // Store cleanup functions
    this.listeners.push(
      () => link.removeEventListener('pointerenter', enter),
      () => link.removeEventListener('pointerleave', leave),
      () => link.removeEventListener('pointermove', move),
      () => link.removeEventListener('pointerdown', down),
    )

    // Scroll handling
    if (scrollContainer) {
      const scroll = () => this.handleScroll()
      scrollContainer.addEventListener('scroll', scroll, opts)
      this.listeners.push(() => scrollContainer.removeEventListener('scroll', scroll))
    }
  }

  private handleEnter(e: PointerEvent): void {
    const { cursor, cursorText, cursorImage, link } = this.elements

    this.state.active = true
    cursor.classList.add('visible')
    cursor.classList.remove('project-cursor-clicked', 'magnetic')

    // Store viewport coordinates
    this.state.viewport = { x: e.clientX, y: e.clientY }

    // Calculate initial position
    const rect = link.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    this.state.target = { x, y }
    this.state.position = { x, y }

    cursor.style.left = `${x}px`
    cursor.style.top = `${y}px`

    cursorText?.classList.remove('visible')
    cursorImage?.classList.remove('visible')

    // Schedule collapse animation
    this.clearTimers()
    const timer = setTimeout(() => {
      if (!this.state.active) return
      cursor.classList.add('collapsed')
      cursorText?.classList.add('visible')
      cursorImage?.classList.add('visible')
    }, CONFIG.COLLAPSE_DELAY)

    this.state.timers.add(timer)
    this.startAnimation()
  }

  private handleLeave(): void {
    const { cursor, cursorText, cursorImage } = this.elements

    this.state.active = false
    this.state.inMagnetic = false

    cursor.classList.remove('visible', 'magnetic', 'collapsed', 'project-cursor-clicked')
    cursorText?.classList.remove('visible')
    cursorImage?.classList.remove('visible')

    this.clearTimers()
  }

  private handleMove(e: PointerEvent): void {
    if (!this.state.active) return

    const { project, link } = this.elements

    // Update viewport coordinates
    this.state.viewport = { x: e.clientX, y: e.clientY }

    const linkRect = link.getBoundingClientRect()
    const relX = e.clientX - linkRect.left
    const relY = e.clientY - linkRect.top

    // Calculate magnetic effect
    const projectBounds = project.getBoundingClientRect()
    const centerX = projectBounds.left + projectBounds.width / 2
    const centerY = projectBounds.top + projectBounds.height / 2
    const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY)
    const inMagneticRange = distance < CONFIG.MAGNET_RADIUS

    // Update magnetic state
    if (inMagneticRange !== this.state.inMagnetic) {
      this.state.inMagnetic = inMagneticRange
      this.elements.cursor.classList.toggle('magnetic', inMagneticRange)
    }

    // Calculate target position
    if (inMagneticRange) {
      const pull = 1 - distance / CONFIG.MAGNET_RADIUS
      const projectCenterX = centerX - linkRect.left
      const projectCenterY = centerY - linkRect.top
      const blend = CONFIG.CENTER_PULL * pull

      this.state.target = {
        x: relX * (1 - blend) + projectCenterX * blend,
        y: relY * (1 - blend) + projectCenterY * blend,
      }
    } else {
      this.state.target = { x: relX, y: relY }
    }
  }

  private handleClick(): void {
    if (!this.state.active) return

    const { cursor, cursorText, cursorImage } = this.elements

    cursorText?.classList.add('visible')
    cursorImage?.classList.add('visible')
    cursor.classList.add('project-cursor-clicked')

    const timer = setTimeout(() => {
      cursor.classList.remove('project-cursor-clicked')
    }, CONFIG.CLICK_ANIMATION_DURATION)

    this.state.timers.add(timer)
  }

  private handleScroll(): void {
    if (!this.state.active || !this.elements.scrollContainer) return

    const { link, project } = this.elements
    const linkRect = link.getBoundingClientRect()

    // Calculate new position after scroll
    const relX = this.state.viewport.x - linkRect.left
    const relY = this.state.viewport.y - linkRect.top

    // Check if cursor is still over element
    if (relX < 0 || relX > linkRect.width || relY < 0 || relY > linkRect.height) {
      this.handleLeave()
      return
    }

    // Update position with magnetic effect
    const projectBounds = project.getBoundingClientRect()
    const centerX = projectBounds.left + projectBounds.width / 2
    const centerY = projectBounds.top + projectBounds.height / 2
    const distance = Math.hypot(this.state.viewport.x - centerX, this.state.viewport.y - centerY)
    const inMagneticRange = distance < CONFIG.MAGNET_RADIUS

    if (inMagneticRange) {
      const pull = 1 - distance / CONFIG.MAGNET_RADIUS
      const projectCenterX = centerX - linkRect.left
      const projectCenterY = centerY - linkRect.top
      const blend = CONFIG.CENTER_PULL * pull

      this.state.target = {
        x: relX * (1 - blend) + projectCenterX * blend,
        y: relY * (1 - blend) + projectCenterY * blend,
      }
    } else {
      this.state.target = { x: relX, y: relY }
    }
  }

  private startAnimation(): void {
    if (this.prefersReducedMotion || this.rafId !== null) return
    this.rafId = requestAnimationFrame(() => this.animate())
  }

  private animate(): void {
    if (!this.state.active) {
      this.stopAnimation()
      return
    }

    // Direct positioning (no lag)
    this.state.position = { ...this.state.target }

    const { cursor } = this.elements
    cursor.style.left = `${this.state.position.x}px`
    cursor.style.top = `${this.state.position.y}px`

    this.rafId = requestAnimationFrame(() => this.animate())
  }

  private stopAnimation(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  private clearTimers(): void {
    this.state.timers.forEach((timer) => clearTimeout(timer))
    this.state.timers.clear()
  }

  destroy(): void {
    this.handleLeave()
    this.stopAnimation()
    this.clearTimers()
    this.listeners.forEach((cleanup) => cleanup())
    this.listeners = []
  }
}

// Register script
registerScript('magneticCursor', () => {
  const cursors: MagneticCursor[] = []

  // Initialize cursors for all project tiles
  document.querySelectorAll<HTMLElement>('.project, .project-card').forEach((project) => {
    cursors.push(new MagneticCursor(project))
  })

  // Cleanup function
  const cleanup = () => {
    cursors.forEach((cursor) => cursor.destroy())
    cursors.length = 0
  }

  // Register with cleanup registry
  cleanupRegistry.register({
    id: 'magneticCursor',
    cleanup,
  })

  return cleanup
})
