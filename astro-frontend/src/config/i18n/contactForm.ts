/**
 * Contact Form Translations
 * Privacy policy checkbox text and links for all languages
 */

export interface PrivacyPolicyTranslation {
  text: string
  linkText: string
  linkUrl: string
}

export const privacyPolicyText: Record<'ca' | 'es' | 'en', PrivacyPolicyTranslation> = {
  ca: {
    text: "Accepto que les meves dades es guardin d'acord amb la ",
    linkText: 'política de privacitat',
    linkUrl: '/avis-legal#privacitat',
  },
  es: {
    text: 'Acepto que mis datos se almacenen de acuerdo con la ',
    linkText: 'política de privacidad',
    linkUrl: '/es/aviso-legal#privacidad',
  },
  en: {
    text: 'I agree that my data will be stored in accordance with the ',
    linkText: 'privacy policy',
    linkUrl: '/en/legal-notice#privacy-policy',
  },
}
