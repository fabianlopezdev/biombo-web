// @ts-check
import { defineConfig } from 'astro/config'
import sanity from '@sanity/astro'
import { loadEnv } from 'vite'

// Load environment variables using Vite's loadEnv
const mode = import.meta.env.MODE || process.env.NODE_ENV || 'development';
const env = loadEnv(mode, process.cwd(), ''); // Load all env vars, '' for all prefixes

// --- START Sanity Environment Variable Validation ---
const sanityProjectId = env.PUBLIC_SANITY_PROJECT_ID
const sanityDataset = env.PUBLIC_SANITY_DATASET
const sanityApiVersion = env.PUBLIC_SANITY_API_VERSION || 'v2024-05-01' // Default if not set

if (!sanityProjectId) {
  throw new Error(
    'Missing Sanity Project ID. Please set PUBLIC_SANITY_PROJECT_ID in your .env file.'
  )
}
if (typeof sanityProjectId !== 'string') {
  throw new Error(
    'Invalid Sanity Project ID. PUBLIC_SANITY_PROJECT_ID must be a string.'
  )
}

if (!sanityDataset) {
  throw new Error(
    'Missing Sanity Dataset. Please set PUBLIC_SANITY_DATASET in your .env file.'
  )
}
if (typeof sanityDataset !== 'string') {
  throw new Error(
    'Invalid Sanity Dataset. PUBLIC_SANITY_DATASET must be a string.'
  )
}
// --- END Sanity Environment Variable Validation ---

// https://astro.build/config
export default defineConfig({
  integrations: [
    sanity({
      projectId: sanityProjectId, // Use validated variable
      dataset: sanityDataset, // Use validated variable
      apiVersion: sanityApiVersion,
      useCdn: false, // false for static builds, true for live previews/SSR with fresh data
      // studioBasePath: '/admin' // Add this if you plan to embed Sanity Studio later
    }),
  ],
  // Other Astro configurations might be here
})
