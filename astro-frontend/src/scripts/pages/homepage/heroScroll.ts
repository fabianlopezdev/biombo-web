/**
 * Handles the hero section scroll button interaction.
 * Scrolls horizontally to the projects section when clicked.
 */

// Self-executing script for hero scroll functionality
document.addEventListener('DOMContentLoaded', () => {
  const scrollButton = document.querySelector('.scroll-indicator') as HTMLElement
  const container = document.getElementById('horizontal-container') as HTMLElement
  const target = document.querySelector('#projects') as HTMLElement

  // Early validation - fail fast
  if (!scrollButton || !container || !target) {
    console.warn('Hero: Required elements not found', {
      scrollButton: !!scrollButton,
      container: !!container,
      target: !!target,
    })
    return
  }

  scrollButton.addEventListener('click', () => {
    const scrollDistance = target.offsetLeft - container.scrollLeft

    if (Math.abs(scrollDistance) > 1) {
      container.scrollBy({
        left: scrollDistance,
        top: 0,
        behavior: 'smooth',
      })
    }
  })
})
