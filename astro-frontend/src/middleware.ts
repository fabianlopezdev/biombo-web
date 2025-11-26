import { defineMiddleware } from 'astro:middleware'

// Legacy URL redirects (301 permanent)
const redirects: Record<string, string> = {
  // Core Navigation Changes
  '/inici': '/',
  '/hola': '/nosaltres',
  '/hola/': '/nosaltres',
  '/about-me-1': '/nosaltres',
  '/about-me-1/': '/nosaltres',
  '/about-me-2': '/nosaltres',
  '/about-me-2/': '/nosaltres',
  '/on-som': '/contacte',
  '/on-som/': '/contacte',
  '/contact': '/contacte',
  '/contact/': '/contacte',
  '/serveis/': '/serveis',
  '/avis-legal/': '/avis-legal',

  // Deleted Pages (Cookies & Blog)
  '/politica-de-cookies': '/',
  '/politica-de-cookies/': '/',
  '/masonry-3-col': '/',
  '/masonry-3-col/': '/',
  '/sample-page': '/',
  '/sample-page/': '/',

  // Specific Project Mappings
  '/portfolio-item/granollers-a-la-fresca': '/projectes/granollers-a-la-fresca',
  '/portfolio-item/granollers-a-la-fresca/': '/projectes/granollers-a-la-fresca',
  '/portfolio-item/patrimoni': '/projectes/aquest-nadal-viu-el-patrimoni',
  '/portfolio-item/patrimoni/': '/projectes/aquest-nadal-viu-el-patrimoni',
  '/portfolio-item/cinema-edison': '/projectes/cinema-edison',
  '/portfolio-item/cinema-edison/': '/projectes/cinema-edison',
  '/portfolio-item/norma-comics': '/projectes/norma-comics',
  '/portfolio-item/norma-comics/': '/projectes/norma-comics',
  '/portfolio-item/historia-basquet-granollers': '/projectes/club-basquet-granollers',
  '/portfolio-item/historia-basquet-granollers/': '/projectes/club-basquet-granollers',
  '/portfolio-item/patinautes': '/projectes/els-Patinautes',
  '/portfolio-item/patinautes/': '/projectes/els-Patinautes',
  '/portfolio-item/10-anys-fantastik': '/projectes/Fantàstik-Film-Festival',
  '/portfolio-item/10-anys-fantastik/': '/projectes/Fantàstik-Film-Festival',
  '/portfolio-item/obert-x-vacances': '/projectes/Obert-vacances',
  '/portfolio-item/obert-x-vacances/': '/projectes/Obert-vacances',
  '/portfolio-item/interactius': '/projectes/interactius-10',
  '/portfolio-item/interactius/': '/projectes/interactius-10',
}

export const onRequest = defineMiddleware(({ request }, next) => {
  const url = new URL(request.url)
  const pathname = url.pathname

  // Check exact redirects
  if (redirects[pathname]) {
    return Response.redirect(new URL(redirects[pathname], request.url), 301)
  }

  // Catch-all for /blog/* -> /
  if (pathname.startsWith('/blog/') || pathname === '/blog') {
    return Response.redirect(new URL('/', request.url), 301)
  }

  // Catch-all for remaining /portfolio-item/* -> /projectes
  if (pathname.startsWith('/portfolio-item/')) {
    return Response.redirect(new URL('/projectes', request.url), 301)
  }

  return next()
})
