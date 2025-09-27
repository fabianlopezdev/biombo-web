// Mobile menu toggle and interaction functionality
function initMobileMenu(): void {
  const menuOverlay = document.getElementById('mobile-menu')
  const menuButton = document.querySelector<HTMLElement>('.mobile-menu')
  const closeButton = menuOverlay?.querySelector<HTMLElement>('.close-button')
  const menuContent = menuOverlay?.querySelector<HTMLElement>('.mobile-menu-content')

  function openMenu(): void {
    if (menuOverlay) {
      menuOverlay.classList.add('open')
      menuOverlay.classList.remove('closing')
      document.body.style.overflow = 'hidden'
    }
  }

  function closeMenu(): void {
    if (menuOverlay) {
      // Add closing class to hide content immediately
      menuOverlay.classList.add('closing')
      // Small delay to let content disappear before sliding up
      setTimeout(() => {
        menuOverlay.classList.remove('open')
        document.body.style.overflow = ''
      }, 50)
    }
  }

  menuButton?.addEventListener('click', openMenu)
  closeButton?.addEventListener('click', closeMenu)

  menuOverlay?.addEventListener('click', (e: Event) => {
    if (e.target === menuOverlay) {
      closeMenu()
    }
  })

  menuContent?.addEventListener('click', (e: Event) => {
    e.stopPropagation()
  })

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && menuOverlay?.classList.contains('open')) {
      closeMenu()
    }
  })
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', initMobileMenu)
// Re-initialize on Astro page navigation
document.addEventListener('astro:page-load', initMobileMenu)
