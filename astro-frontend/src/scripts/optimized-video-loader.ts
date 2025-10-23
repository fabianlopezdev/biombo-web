/**
 * Optimized Video Loader
 *
 * Implements lazy loading and autoplay on scroll for videos.
 * Uses Intersection Observer to:
 * 1. Only load videos when they're about to enter viewport
 * 2. Autoplay when 50%+ of video is visible
 * 3. Pause when video scrolls out of view (performance optimization)
 */

// Configuration
const INTERSECTION_THRESHOLD = 0.5 // Play when 50% visible
const ROOT_MARGIN = '50px' // Start loading 50px before entering viewport

// Track initialized videos to avoid duplicate observers
const initializedVideos = new WeakSet<HTMLVideoElement>()

/**
 * Initialize a single video element with Intersection Observer
 */
function initializeVideo(video: HTMLVideoElement): void {
  if (initializedVideos.has(video)) {
    return
  }
  initializedVideos.add(video)

  // Create Intersection Observer for this video
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const videoElement = entry.target as HTMLVideoElement

        // Video is entering viewport and is sufficiently visible
        if (entry.isIntersecting && entry.intersectionRatio >= INTERSECTION_THRESHOLD) {
          // Mark as loaded for fade-in effect
          videoElement.setAttribute('data-loaded', 'true')

          // Play the video
          const playPromise = videoElement.play()

          // Handle play promise (required for some browsers)
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              // Auto-play was prevented (shouldn't happen with muted videos, but handle it)
              console.warn('Video autoplay prevented:', error)
            })
          }
        }
        // Video has scrolled out of view
        else if (!entry.isIntersecting) {
          // Pause to save resources
          videoElement.pause()
        }
      })
    },
    {
      threshold: INTERSECTION_THRESHOLD,
      rootMargin: ROOT_MARGIN,
    },
  )

  // Start observing
  observer.observe(video)

  // Handle video loaded metadata event
  video.addEventListener('loadedmetadata', () => {
    // Video metadata is loaded (first frame available for poster)
    video.setAttribute('data-metadata-loaded', 'true')
  })

  // Handle video can play through event
  video.addEventListener('canplaythrough', () => {
    // Video is ready to play without buffering
    video.setAttribute('data-can-play', 'true')
  })
}

/**
 * Initialize all videos on the page
 */
function initializeAllVideos(): void {
  const videos = document.querySelectorAll<HTMLVideoElement>('video[data-video-autoplay]')
  videos.forEach(initializeVideo)
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAllVideos)
} else {
  initializeAllVideos()
}

// Re-initialize when navigating (for view transitions)
document.addEventListener('astro:page-load', initializeAllVideos)

// Also watch for dynamically added videos
if (typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          // Check if the node itself is a video
          if (node.tagName === 'VIDEO' && node.hasAttribute('data-video-autoplay')) {
            initializeVideo(node as HTMLVideoElement)
          }
          // Check for videos within the added node
          const videos = node.querySelectorAll<HTMLVideoElement>('video[data-video-autoplay]')
          videos.forEach(initializeVideo)
        }
      })
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}
