/**
 * Project-tile custom cursor
 * – Pointer-events based (mouse, pen, future inputs)
 * – Single global RAF loop for all active tiles
 * – Passive listeners where safe
 * – Respects prefers-reduced-motion
 * – Cleans up listeners & RAF on page hide
 */

type Timeout = ReturnType<typeof setTimeout>

interface CursorState {
  project: HTMLElement
  link: HTMLAnchorElement
  cursor: HTMLElement
  cursorText: HTMLElement | null
  cursorImage: HTMLImageElement | null
  // runtime
  active: boolean
  inMagnetic: boolean
  cursorX: number
  cursorY: number
  targetX: number
  targetY: number
  collapseTimeout?: Timeout
  clickTimeout?: Timeout
  // stored listener refs for clean-up
  removeAll: () => void
}

const states: CursorState[] = []
let rafId: number | null = null
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

const config = {
  strength: 0.15,
  magnetRadius: 120,
  dampening: 0.08,
  centerPull: 0.3,
} as const

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */
function getBounds(el: HTMLElement) {
  const r = el.getBoundingClientRect()
  return {
    centerX: r.left + r.width / 2,
    centerY: r.top + r.height / 2,
    left: r.left,
    top: r.top,
    width: r.width,
    height: r.height,
  }
}

function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1)
}

/* ------------------------------------------------------------------ */
/* RAF tick                                                           */
/* ------------------------------------------------------------------ */
function startRAF() {
  if (prefersReducedMotion || rafId !== null) return
  rafId = requestAnimationFrame(tick)
}

function stopRAF() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

function tick() {
  states.forEach((s) => {
    if (!s.active) return
    const lerp = s.inMagnetic ? config.dampening * 0.7 : config.dampening
    s.cursorX += (s.targetX - s.cursorX) * lerp
    s.cursorY += (s.targetY - s.cursorY) * lerp
    s.cursor.style.left = `${s.cursorX}px`
    s.cursor.style.top = `${s.cursorY}px`
  })

  // continue only if at least one cursor is active
  if (states.some((s) => s.active)) {
    rafId = requestAnimationFrame(tick)
  } else {
    stopRAF()
  }
}

/* ------------------------------------------------------------------ */
/* initialise per-project state                                       */
/* ------------------------------------------------------------------ */
function initProject(project: HTMLElement) {
  const link = project.querySelector<HTMLAnchorElement>('.project-link')
  const cursor = project.querySelector<HTMLElement>('.project-cursor')
  if (!link || !cursor) return

  // Store references to DOM elements we know exist at this point
  // This makes it clear to TypeScript that these elements are non-null
  const linkElement = link
  const cursorElement = cursor

  const cursorText = cursorElement.querySelector<HTMLElement>('.cursor-text')
  const cursorImage = cursorElement.querySelector<HTMLImageElement>('.cursor-image')

  const state: CursorState = {
    project,
    link,
    cursor,
    cursorText,
    cursorImage,
    active: false,
    inMagnetic: false,
    cursorX: 0,
    cursorY: 0,
    targetX: 0,
    targetY: 0,
    collapseTimeout: undefined,
    clickTimeout: undefined,
    removeAll: () => {},
  }
  states.push(state)

  /* ---------- local helpers ---------- */
  function showCursor(e: PointerEvent) {
    state.active = true
    cursorElement.classList.add('visible')
    cursorElement.classList.remove('project-cursor-clicked', 'magnetic')

    // We can safely use linkElement since we've already checked it exists
    const linkRect = linkElement.getBoundingClientRect()
    state.targetX = e.clientX - linkRect.left
    state.targetY = e.clientY - linkRect.top
    state.cursorX = state.targetX
    state.cursorY = state.targetY
    cursorElement.style.left = `${state.cursorX}px`
    cursorElement.style.top = `${state.cursorY}px`
    cursorText?.classList.remove('visible')
    cursorImage?.classList.remove('visible')

    // gravity collapse
    clearTimeout(state.collapseTimeout)
    state.collapseTimeout = setTimeout(() => {
      if (!state.active) return
      cursor?.classList.add('collapsed')
      cursorText?.classList.add('visible')
      cursorImage?.classList.add('visible')
    }, 250)

    startRAF()
  }

  function hideCursor() {
    state.active = false
    state.inMagnetic = false
    cursorElement.classList.remove('visible', 'magnetic', 'collapsed', 'project-cursor-clicked')
    cursorText?.classList.remove('visible')
    cursorImage?.classList.remove('visible')
    clearTimeout(state.collapseTimeout)
    clearTimeout(state.clickTimeout)
  }

  function moveCursor(e: PointerEvent) {
    if (!state.active) return
    const bounds = getBounds(project)
    const linkRect = linkElement.getBoundingClientRect()

    const relX = e.clientX - linkRect.left
    const relY = e.clientY - linkRect.top

    const dist = distance(e.clientX, e.clientY, bounds.centerX, bounds.centerY)
    const inMag = dist < config.magnetRadius

    if (inMag !== state.inMagnetic) {
      state.inMagnetic = inMag
      cursorElement.classList.toggle('magnetic', inMag)
    }

    if (inMag) {
      const pull = 1 - dist / config.magnetRadius
      const centerX = bounds.centerX - linkRect.left
      const centerY = bounds.centerY - linkRect.top
      const blend = config.centerPull * pull
      state.targetX = relX * (1 - blend) + centerX * blend
      state.targetY = relY * (1 - blend) + centerY * blend
    } else {
      state.targetX = relX
      state.targetY = relY
    }
  }

  function clickCursor() {
    if (!state.active) return
    cursorText?.classList.add('visible')
    cursorImage?.classList.add('visible')
    cursorElement.classList.add('project-cursor-clicked')
    clearTimeout(state.clickTimeout)
    state.clickTimeout = setTimeout(
      () => cursorElement.classList.remove('project-cursor-clicked'),
      300,
    )
  }

  /* ---------- event listeners ---------- */
  const optsPassive = { passive: true } as const
  linkElement.addEventListener('pointerenter', showCursor, optsPassive)
  linkElement.addEventListener('pointerleave', hideCursor, optsPassive)
  linkElement.addEventListener('pointermove', moveCursor, optsPassive)
  linkElement.addEventListener('pointerdown', clickCursor)

  /* ---------- teardown helper ---------- */
  state.removeAll = () => {
    linkElement.removeEventListener('pointerenter', showCursor)
    linkElement.removeEventListener('pointerleave', hideCursor)
    linkElement.removeEventListener('pointermove', moveCursor)
    linkElement.removeEventListener('pointerdown', clickCursor)
  }
}

/* ------------------------------------------------------------------ */
/* boot                                                                */
/* ------------------------------------------------------------------ */
document.querySelectorAll<HTMLElement>('.project').forEach(initProject)

/* cleanup on page hide (browser back-nav, hot-reload etc.) */
window.addEventListener(
  'pagehide',
  () => {
    stopRAF()
    states.forEach((s) => s.removeAll())
    states.length = 0
  },
  { once: true },
)
