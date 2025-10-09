/// <reference types="@sanity/astro/module" />

import 'astro/client'

interface ImportMetaEnv {
  readonly PUBLIC_SANITY_PROJECT_ID: string
  readonly PUBLIC_SANITY_DATASET: string
  readonly PUBLIC_SANITY_API_VERSION: string
  // Add other environment variables here if/when needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Lenis smooth scroll types
interface LenisScrollData {
  scroll: number
  limit: number
  velocity: number
  direction: number
  progress: number
}

interface LenisScrollOptions {
  offset?: number
  lerp?: number
  duration?: number
  easing?: (t: number) => number
  immediate?: boolean
  lock?: boolean
  force?: boolean
}

interface Lenis {
  on(event: string, callback: (data: LenisScrollData) => void): void
  off(event: string, callback: (data: LenisScrollData) => void): void
  scrollTo(target: number | string | HTMLElement, options?: LenisScrollOptions): void
  destroy(): void
  raf(time: number): void
}

interface Window {
  lenis?: Lenis
}
