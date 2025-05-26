document.addEventListener('DOMContentLoaded', () => {
  if (!matchMedia('(pointer:fine)').matches) return

  const cursor = document.createElement('div')
  cursor.className = 'custom-cursor'
  document.body.appendChild(cursor)

  let raf: number | null = null

  const move = (x: number, y: number) => {
    if (raf) cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      cursor.style.left = `${x}px`
      cursor.style.top = `${y}px`
    })
  }

  function show(text: string, x: number, y: number) {
    move(x, y) // set position *first*
    cursor.textContent = text
    cursor.style.opacity = '1'
    cursor.style.transform = 'translate(-50%, -50%) scale(1)'
    document.body.classList.add('cursor-hidden')
    window.addEventListener('pointermove', pointerMove)
  }

  function hide() {
    cursor.style.opacity = '0'
    cursor.style.transform = 'translate(-50%, -50%) scale(0.75)'
    document.body.classList.remove('cursor-hidden')
    window.removeEventListener('pointermove', pointerMove)
  }

  const pointerEnter = (e: Event) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor-text]')
    if (t)
      show(t.dataset.cursorText ?? '', (e as PointerEvent).clientX, (e as PointerEvent).clientY)
  }

  const pointerLeave = (e: Event) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor-text]')
    if (t) hide()
  }

  const pointerMove = (e: PointerEvent) => move(e.clientX, e.clientY)

  document.addEventListener('pointerenter', pointerEnter, true)
  document.addEventListener('pointerleave', pointerLeave, true)

  // Keyboard focus support
  document.addEventListener('focusin', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor-text]')
    if (el) {
      const r = el.getBoundingClientRect()
      show(el.dataset.cursorText ?? '', r.left + r.width / 2, r.top + r.height / 2)
    }
  })
  document.addEventListener('focusout', hide)
})
