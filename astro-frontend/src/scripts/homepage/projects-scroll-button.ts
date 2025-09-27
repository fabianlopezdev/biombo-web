/**
 * Projects section scroll button functionality
 * Provides smooth scrolling to the about section when the scroll button is clicked
 */

document.addEventListener('DOMContentLoaded', () => {
  const scrollButton = document.querySelector(
    '.projects-container .scroll-container',
  ) as HTMLElement
  const targetSection = document.getElementById('about')

  // Guard clause for missing elements
  if (!scrollButton || !targetSection) {
    return
  }

  // Use passive event listener for better performance
  scrollButton.addEventListener(
    'click',
    () => {
      // Use modern ScrollIntoView with options for smooth scrolling
      targetSection.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    },
    { passive: true },
  )
})
