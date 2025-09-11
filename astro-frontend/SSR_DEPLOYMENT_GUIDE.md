# SSR Deployment Guide for Biombo Web

## Overview

This guide explains how to deploy and manage the Biombo website with Server-Side Rendering (SSR) enabled, allowing real-time content updates from Sanity Studio.

## Current Setup

### Architecture

- **Frontend**: Astro with SSR enabled via Netlify adapter
- **CMS**: Sanity Studio (deployed at https://biombo-studio.sanity.studio)
- **Hosting**: Netlify (configured for SSR deployment)
- **Data Flow**: Every page request fetches fresh data from Sanity

### Key Features

- ✅ **Real-time Updates**: Content changes in Sanity appear immediately on the website
- ✅ **No Rebuild Required**: SSR fetches fresh data on every request
- ✅ **Development Flexibility**: Easy switching between local and production data
- ✅ **Future-Ready**: Simple migration path to SSG when needed

## Environment Configuration

### Environment Files

```
.env.development    # Local development settings
.env.production     # Production/Netlify settings
.env.local          # Local overrides (gitignored)
```

### Key Environment Variables

```bash
PUBLIC_SANITY_PROJECT_ID="08xgag7z"
PUBLIC_SANITY_DATASET="production"
PUBLIC_SANITY_API_VERSION="2024-05-20"
PUBLIC_SANITY_USE_CDN="true"  # true for production, false for dev
PUBLIC_SANITY_STUDIO_URL="https://biombo-studio.sanity.studio"
```

## Development Workflow

### Local Development

```bash
# Standard development (uses .env.development)
pnpm run dev

# Development with production Sanity data
pnpm run dev:prod-data

# Build for production
pnpm run build:production

# Preview production build
pnpm run preview
```

### Working with Different Datasets

1. **Local Development**: Uses development environment by default
2. **Testing with Production Data**: Run `pnpm run dev:prod-data`
3. **Production**: Always uses production dataset with CDN enabled

## Deployment to Netlify

### Initial Setup

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables in Netlify dashboard

### Required Netlify Environment Variables

```
PUBLIC_SANITY_PROJECT_ID=08xgag7z
PUBLIC_SANITY_DATASET=production
PUBLIC_SANITY_API_VERSION=2024-05-20
PUBLIC_SANITY_USE_CDN=true
ASTRO_SITE=https://your-production-domain.com
```

### Deployment Process

1. Push to `master` branch
2. Netlify automatically builds and deploys
3. SSR functions are deployed to Netlify Edge
4. Site serves fresh content on every request

## How SSR Works

### Request Flow

1. User visits a page
2. Netlify Edge Function handles the request
3. Astro fetches latest data from Sanity
4. Page is rendered server-side with fresh content
5. HTML is sent to the user

### Benefits

- **Instant Updates**: Client's Sanity changes appear immediately
- **SEO Friendly**: Full HTML rendered server-side
- **No Cache Issues**: Always serves latest content
- **Better Performance**: CDN enabled for production

## Sanity Integration

### Client Workflow

1. Client logs into Sanity Studio at https://biombo-studio.sanity.studio
2. Makes content changes
3. Changes appear immediately on the website (no rebuild needed)

### Developer Workflow

1. Work locally with test data
2. Test with production data using `pnpm run dev:prod-data`
3. Deploy schema changes to Sanity
4. Push code changes to master

### Important Notes

- **Data Persistence**: All Sanity data lives in the cloud
- **Schema Changes**: Deploy with `npx sanity deploy` from sanity-studio
- **No Data Loss**: Client's content is never affected by deployments

## Future Migration to SSG

When ready to switch from SSR to Static Site Generation:

### 1. Update Astro Configuration

```javascript
// astro.config.mjs
export default defineConfig({
  output: 'static', // Change from 'server' to 'static'
  // Remove or comment out the adapter
  // adapter: netlify(),
})
```

### 2. Set Up Sanity Webhooks

1. Go to Sanity Studio → Settings → Webhooks
2. Create webhook with URL: `https://api.netlify.com/build_hooks/[YOUR_HOOK_ID]`
3. Trigger on: Create, Update, Delete

### 3. Benefits of SSG

- **Better Performance**: Pre-built static pages
- **Lower Costs**: No serverless function invocations
- **Global CDN**: Faster load times worldwide
- **Trade-off**: 2-3 minute delay for content updates

## Troubleshooting

### Common Issues

#### Dev Server Won't Start

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Sanity Data Not Updating

- Check `PUBLIC_SANITY_USE_CDN` is set correctly
- Verify API version matches Sanity configuration
- Check Sanity dataset is correct (production vs development)

#### Build Failures

- Ensure all environment variables are set in Netlify
- Check Node version matches local (v20)
- Verify netlify.toml configuration

### Debug Commands

```bash
# Check environment variables
pnpm run build -- --verbose

# Test SSR locally
pnpm run preview

# Check Netlify CLI locally
npx netlify dev
```

## Best Practices

### Performance

- Enable CDN in production (`PUBLIC_SANITY_USE_CDN=true`)
- Use image optimization for Sanity images
- Implement proper caching headers (configured in netlify.toml)

### Security

- Never commit `.env` files with sensitive data
- Use environment variables for all secrets
- Keep Sanity API tokens secure

### Development

- Test with production data before deploying
- Keep schema changes backward compatible
- Document any breaking changes

## Contact & Support

For issues or questions:

- Frontend issues: Check this guide first
- Sanity issues: https://www.sanity.io/docs
- Netlify issues: https://docs.netlify.com

## Quick Reference

### Scripts

- `pnpm run dev` - Local development
- `pnpm run dev:prod-data` - Dev with production data
- `pnpm run build` - Build for deployment
- `pnpm run preview` - Preview built site

### URLs

- Local Dev: http://localhost:4321
- Sanity Studio: https://biombo-studio.sanity.studio
- Production: [To be configured]

### File Structure

```
astro-frontend/
├── .env.development     # Dev environment
├── .env.production      # Prod environment
├── astro.config.mjs     # SSR configuration
├── netlify.toml         # Netlify settings
└── src/
    └── shared/
        └── lib/
            └── sanity/
                └── client.ts  # Sanity client
```
