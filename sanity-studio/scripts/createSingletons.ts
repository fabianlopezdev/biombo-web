import {getCliClient} from 'sanity/cli'
import {LANGUAGES, SINGLETONS} from '../constants/i18n'

/**
 * Ensure singleton documents exist for every language and create/update
 * their accompanying translation.metadata documents.
 *
 * Run with:
 *   pnpm sanity exec ./scripts/createSingletons.ts --with-user-token
 */
async function createSingletons() {
  const client = getCliClient()

  const docs = SINGLETONS.flatMap((singleton) => {
    const translations = LANGUAGES.map((lang) => ({
      _id: `${singleton.id}-${lang.id}`,
      _type: singleton._type,
      language: lang.id,
    }))

    const metadata = {
      _id: `${singleton.id}-translation-metadata`,
      _type: 'translation.metadata',
      translations: translations.map((t) => ({
        _key: t.language,
        value: { _type: 'reference', _ref: t._id },
      })),
      schemaTypes: [...new Set(translations.map((t) => t._type))],
    }

    return [metadata, ...translations]
  })

  const tx = client.transaction()
  docs.forEach((d) => tx.createOrReplace(d))

  await tx.commit()
  // eslint-disable-next-line no-console
  console.log(`✅ Ensured singletons for ${SINGLETONS.length} types in ${LANGUAGES.length} languages`)
}

createSingletons().catch((err) => {
  console.error(err)
  process.exit(1)
})
