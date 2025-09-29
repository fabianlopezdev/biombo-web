// @ts-check
import { defineConfig } from 'astro/config'
import sanity from '@sanity/astro'
import netlify from '@astrojs/netlify'
import sitemap from '@astrojs/sitemap'
import dotenv from 'dotenv'

// Load environment variables from .env files
// This is needed because Astro config runs before Astro loads env files
dotenv.config()

// --- START Sanity Environment Variable Validation ---
const sanityProjectId = process.env.PUBLIC_SANITY_PROJECT_ID
const sanityDataset = process.env.PUBLIC_SANITY_DATASET
const sanityApiVersion = process.env.PUBLIC_SANITY_API_VERSION || 'v2024-05-01' // Default if not set

if (!sanityProjectId) {
  throw new Error(
    'Missing Sanity Project ID. Please set PUBLIC_SANITY_PROJECT_ID in your .env file.',
  )
}
if (typeof sanityProjectId !== 'string') {
  throw new Error('Invalid Sanity Project ID. PUBLIC_SANITY_PROJECT_ID must be a string.')
}

if (!sanityDataset) {
  throw new Error('Missing Sanity Dataset. Please set PUBLIC_SANITY_DATASET in your .env file.')
}
if (typeof sanityDataset !== 'string') {
  throw new Error('Invalid Sanity Dataset. PUBLIC_SANITY_DATASET must be a string.')
}
// --- END Sanity Environment Variable Validation ---

// https://astro.build/config
export default defineConfig({
  site: process.env.ASTRO_SITE || 'https://biombostudio.com', // Production URL for sitemap
  output: 'server', // Enable SSR
  adapter: netlify({
    // Optional: Enable edge middleware for faster response times
    edgeMiddleware: false,
    // Disable Netlify Image CDN - we use Sanity for images
    imageCDN: false,
  }),
  prefetch: true,
  i18n: {
    defaultLocale: 'ca',
    locales: ['ca', 'es', 'en'],
    routing: {
      prefixDefaultLocale: false, // Catalan stays at root without /ca prefix
    }
  },
  integrations: [
    sanity({
      projectId: sanityProjectId, // Use validated variable
      dataset: sanityDataset, // Use validated variable
      apiVersion: sanityApiVersion,
      useCdn: process.env.PUBLIC_SANITY_USE_CDN === 'true', // Use CDN in production, false for development
      // studioBasePath: '/admin' // Add this if you plan to embed Sanity Studio later
    }),
    sitemap({
      // i18n configuration for multilingual sitemap
      i18n: {
        defaultLocale: 'ca',
        locales: {
          ca: 'ca-ES',
          en: 'en-US',
          es: 'es-ES',
        },
      },
    }),
  ],
})
