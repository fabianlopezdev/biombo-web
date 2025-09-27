// Mobile menu toggle and interaction functionality
import { registerScript } from '@/scripts/core/initialization-manager'
import { elementCache } from '@/scripts/core/dom-utilities'

registerScript('mobileMenu', () => {
  // Register mobile menu in element cache for potential reuse
  const menuOverlay = elementCache.get('mobileMenu')
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

  const handleOverlayClick = (e: Event) => {
    if (e.target === menuOverlay) {
      closeMenu()
    }
  }

  const handleContentClick = (e: Event) => {
    e.stopPropagation()
  }

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && menuOverlay?.classList.contains('open')) {
      closeMenu()
    }
  }

  // Add event listeners (using regular addEventListener for now)
  menuButton?.addEventListener('click', openMenu)
  closeButton?.addEventListener('click', closeMenu)
  menuOverlay?.addEventListener('click', handleOverlayClick)
  menuContent?.addEventListener('click', handleContentClick)
  document.addEventListener('keydown', handleEscapeKey)

  // Return cleanup function
  return () => {
    menuButton?.removeEventListener('click', openMenu)
    closeButton?.removeEventListener('click', closeMenu)
    menuOverlay?.removeEventListener('click', handleOverlayClick)
    menuContent?.removeEventListener('click', handleContentClick)
    document.removeEventListener('keydown', handleEscapeKey)
    // Reset body overflow on cleanup
    document.body.style.overflow = ''
  }
})
