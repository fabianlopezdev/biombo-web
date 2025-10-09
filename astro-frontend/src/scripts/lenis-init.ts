/**
 * Custom Lenis initialization with configurable smoothness.
 * Adjust lerp and wheelMultiplier to control scroll feel.
 */

import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

// Initialize Lenis with custom configuration
const lenis = new Lenis({
  lerp: 0.12, // Smoothness: 0.05 = snappy, 0.15 = very smooth (default: 0.1)
  duration: 1.5, // Animation duration in seconds (default: 1.2)
  wheelMultiplier: 1.0, // Mouse wheel scroll speed multiplier (default: 1)
  touchMultiplier: 1.0, // Touch scroll speed multiplier (default: 1)
  smoothWheel: true, // Enable smooth scrolling for mouse wheel (default: true)
})

// Make lenis available globally for other scripts
window.lenis = lenis

// Animation loop
function raf(time: number) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)
