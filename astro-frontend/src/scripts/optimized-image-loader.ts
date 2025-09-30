const initialized = new WeakSet<Element>()

function markLoaded(img: HTMLImageElement) {
  img.dataset.loaded = 'true'
}

function register(img: Element) {
  if (!(img instanceof HTMLImageElement)) {
    return
  }

  if (initialized.has(img)) {
    return
  }

  initialized.add(img)

  const finish = () => {
    markLoaded(img)
  }

  // If already loaded, mark immediately
  if (img.complete && img.naturalWidth > 0) {
    finish()
    return
  }

  // Otherwise, wait for load/error events
  const onLoad = () => {
    finish()
  }

  const onError = () => {
    finish()
  }

  img.addEventListener('load', onLoad, { once: true })
  img.addEventListener('error', onError, { once: true })
}

// Scan for all blur images
function scan(root: ParentNode = document) {
  root.querySelectorAll('img[data-blur-image]').forEach(register)
}

// Watch for new images being added
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) {
        return
      }

      // If the node itself is a blur image
      if (node instanceof HTMLImageElement && node.hasAttribute('data-blur-image')) {
        register(node)
        return
      }

      // Otherwise scan inside it
      scan(node)
    })
  }
})

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    scan()
    observer.observe(document.body, { childList: true, subtree: true })
  })
} else {
  scan()
  observer.observe(document.body, { childList: true, subtree: true })
}
