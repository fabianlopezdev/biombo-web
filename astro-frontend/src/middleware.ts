// src/middleware.ts
import { sequence } from 'astro/middleware'
import { useAstroI18n } from 'astro-i18n'

console.log('[Diagnostic Middleware] Calling useAstroI18n()...')
const astroI18nMiddlewareInstance = useAstroI18n()
console.log(
  '[Diagnostic Middleware] Type of astroI18nMiddlewareInstance:',
  typeof astroI18nMiddlewareInstance,
)
if (typeof astroI18nMiddlewareInstance === 'function') {
  console.log(
    '[Diagnostic Middleware] astroI18nMiddlewareInstance function length (expected args):',
    astroI18nMiddlewareInstance.length,
  )
}

export const onRequest = sequence(astroI18nMiddlewareInstance)
