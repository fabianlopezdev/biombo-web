// sanity-studio/schemaTypes/supportedLanguages.ts
export interface Language {
  id: 'ca' | 'es' | 'en' // Union of your language codes
  title: string
  isDefault?: boolean
}

export const supportedLanguages: Language[] = [
  { id: 'ca', title: 'Catalan', isDefault: true },
  { id: 'es', title: 'Spanish' },
  { id: 'en', title: 'English' },
]

export const baseLanguage: Language | undefined = supportedLanguages.find(l => l.isDefault)

// Helper function to get a language object by its ID
export function getLanguage(langId: string): Language | undefined {
  return supportedLanguages.find(lang => lang.id === langId)
}

// Helper to get the title of a language by its ID, defaulting to the ID itself
export function getLanguageTitle(langId: string): string {
  const lang = getLanguage(langId)
  return lang ? lang.title : langId
}
