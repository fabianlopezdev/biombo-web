document.addEventListener('DOMContentLoaded', () => {
  const scrollButton = document.querySelector('.scroll-indicator') as HTMLElement
  const container = document.getElementById('horizontal-container') as HTMLElement
  const target = document.querySelector('#projects') as HTMLElement

  if (!scrollButton || !container || !target) {
    console.warn('Hero: Required elements not found', {
      scrollButton: !!scrollButton,
      container: !!container,
      target: !!target,
    })
    return
  }

  scrollButton.addEventListener('click', () => {
    // Calculate extraOffset as 10vw:
    const extraOffset = window.innerWidth * 0.3

    // Base distance to align left edges
    const baseDistance = target.offsetLeft - container.scrollLeft

    // Add your extra vw-based offset
    const scrollDistance = baseDistance + extraOffset

    if (Math.abs(scrollDistance) > 1) {
      container.scrollBy({
        left: scrollDistance,
        top: 0,
        behavior: 'smooth',
      })
    }
  })
})
