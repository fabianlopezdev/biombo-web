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
