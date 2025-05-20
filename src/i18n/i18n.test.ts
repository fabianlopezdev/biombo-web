import { describe, it, expect } from 'vitest'

// Import the translation files
import caMessages from './shared/ca.json'
import enMessages from './shared/en.json'
import esMessages from './shared/es.json'

// Define types for our translation messages
type TranslationValue = string | { [key: string]: TranslationValue }
type Translations = Record<string, TranslationValue>

// Helper function to navigate nested objects using a dot-notation key
function getNestedValue(obj: Translations, key: string): string | undefined {
  const keys = key.split('.')
  let current: TranslationValue | undefined = obj
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k]
    } else {
      return undefined
    }
  }
  return typeof current === 'string' ? current : undefined
}

// Simplified t-function generator for testing
function createTestT(messageBundles: Array<Translations>) {
  return (key: string, interpolations?: Record<string, string | number>): string => {
    for (const messages of messageBundles) {
      let translation = getNestedValue(messages, key)
      if (translation !== undefined) {
        if (interpolations) {
          Object.entries(interpolations).forEach(([varName, value]) => {
            const placeholder = `{# ${varName} #}` // Matches astro-i18n's default
            translation = translation!.replace(new RegExp(placeholder, 'g'), String(value))
          })
        }
        return translation
      }
    }
    return key // Fallback to key if not found
  }
}

describe('i18n translations and t function (test implementation)', () => {
  describe('Catalan (ca)', () => {
    const t = createTestT([caMessages]) // Only Catalan messages

    it('should translate a simple key', () => {
      expect(t('simple_key_test')).toBe('Això és una prova simple.')
    })
    it('should translate a key with interpolation', () => {
      expect(t('greeting', { name: 'Usuari' })).toBe('Hola, Usuari!')
    })

    it('should translate a nested key', () => {
      expect(t('site.title')).toBe('Biombo')
    })

    it('should return the key itself if the translation is missing', () => {
      expect(t('a_truly_missing_key')).toBe('a_truly_missing_key')
    })

    it('should translate a key that exists only in the default language', () => {
      expect(t('only_in_default_lang')).toBe('Aquest text només està en Català.')
    })
  })

  describe('English (en)', () => {
    const t = createTestT([enMessages, caMessages]) // English, then Catalan fallback

    it('should translate a simple key', () => {
      expect(t('simple_key_test')).toBe('This is a simple test.')
    })
    it('should translate a key with interpolation', () => {
      expect(t('greeting', { name: 'User' })).toBe('Hello, User!')
    })

    it('should translate a nested key', () => {
      expect(t('site.title')).toBe('Biombo')
    })

    it('should fallback to the default language (Catalan) for a key missing in English', () => {
      expect(t('only_in_default_lang')).toBe('Aquest text només està en Català.')
    })

    it('should return the key itself if the translation is missing in all fallbacks', () => {
      expect(t('a_truly_missing_key')).toBe('a_truly_missing_key')
    })
  })

  describe('Spanish (es)', () => {
    const t = createTestT([esMessages, caMessages]) // Spanish, then Catalan fallback

    it('should translate a simple key', () => {
      expect(t('simple_key_test')).toBe('Esta es una prueba sencilla.')
    })
    it('should translate a key with interpolation', () => {
      expect(t('greeting', { name: 'Usuario' })).toBe('Hola, Usuario!')
    })

    it('should translate a nested key', () => {
      expect(t('site.title')).toBe('Biombo')
    })

    it('should fallback to the default language (Catalan) for a key missing in Spanish', () => {
      expect(t('only_in_default_lang')).toBe('Aquest text només està en Català.')
    })

    it('should return the key itself if the translation is missing in all fallbacks', () => {
      expect(t('a_truly_missing_key')).toBe('a_truly_missing_key')
    })
  })
})
