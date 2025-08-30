# Adding New Content Types with Internationalization in Sanity

This guide explains how to properly add new content types (schemas) to Sanity with internationalization support. We learned this the hard way with the footer implementation!

## Key Learning: Singleton Documents Must Be Pre-Created

**The most important thing to understand:** The `@sanity/document-internationalization` plugin does NOT automatically create singleton documents when you click on them in the UI. They must be pre-created using a script.

## Step-by-Step Guide

### 1. Create the Schema File

Create your schema in `sanity-studio/schemaTypes/yourSchema.ts`:

```typescript
import {defineField, defineType} from 'sanity'

export const yourSchema = defineType({
  name: 'yourSchema',
  title: 'Your Schema Title',
  type: 'document',
  fields: [
    // CRITICAL: Include the language field for i18n
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true, // The i18n plugin manages this
      hidden: false,
    }),
    // Your other fields here
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    // etc...
  ],
  preview: {
    select: {
      title: 'title',
      language: 'language',
    },
    prepare(selection) {
      const {title, language} = selection
      return {
        title: `Your Schema (${(language || '').toUpperCase()})`,
        subtitle: 'Description',
      }
    },
  },
})
```

### 2. Add to Schema Index

Update `sanity-studio/schemaTypes/index.ts`:

```typescript
import { yourSchema } from './yourSchema'

export const schemaTypes = [
  // ... existing schemas
  yourSchema,
  // ...
]
```

### 3. Add to i18n Configuration

Update `sanity-studio/constants/i18n.ts`:

```typescript
export const SINGLETONS = [
  // ... existing singletons
  {id: 'yourSchema', _type: 'yourSchema', title: 'Your Schema Title'},
]
```

### 4. Update Desk Structure

Update `sanity-studio/deskStructure.ts`:

```typescript
const singletonIcon = (id: string) => {
  const map: Record<string, string> = {
    // ... existing icons
    yourSchema: '📄', // Choose an emoji
  }
  return () => map[id] ?? '📄'
}
```

### 5. Add to Internationalization Plugin Config

Update `sanity-studio/sanity.config.ts`:

```typescript
documentInternationalization({
  // ...
  schemaTypes: [
    // ... existing types
    'yourSchema',
  ],
  // ...
})
```

### 6. CREATE THE INITIALIZATION SCRIPT (CRITICAL!)

Create `sanity-studio/createYourSchema.ts`:

```typescript
import {getCliClient} from 'sanity/cli'

const SINGLETON = {id: 'yourSchema', _type: 'yourSchema', title: 'Your Schema Title'}

const LANGUAGES = [
  {id: 'ca', title: 'Català'},
  {id: 'es', title: 'Español'},
  {id: 'en', title: 'English'},
]

const client = getCliClient()

async function createDocuments() {
  // Create documents for each language
  const translations = LANGUAGES.map((language) => ({
    _id: `${SINGLETON.id}-${language.id}`,
    _type: SINGLETON._type,
    language: language.id,
  }))

  // Create metadata document that binds all translations together
  const metadata = {
    _id: `${SINGLETON.id}-translation-metadata`,
    _type: 'translation.metadata',
    translations: translations.map((translation) => ({
      _key: translation.language,
      value: {
        _type: 'reference',
        _ref: translation._id,
      },
    })),
    schemaTypes: [SINGLETON._type],
  }

  const documents = [metadata, ...translations]

  const transaction = client.transaction()

  documents.forEach((doc) => {
    transaction.createOrReplace(doc)
  })

  await transaction
    .commit()
    .then((res) => {
      console.log('✅ Successfully created documents:')
      res.results.forEach((result) => {
        console.log(`  - ${result.id}`)
      })
    })
    .catch((err) => {
      console.error('❌ Transaction failed:', err.message)
      throw err
    })
}

createDocuments()
  .then(() => {
    console.log('✅ All documents created successfully!')
  })
  .catch((err) => {
    console.error('❌ Script failed:', err)
    process.exit(1)
  })
```

### 7. Run the Initialization Script

**THIS IS THE CRITICAL STEP THAT WE MISSED:**

```bash
cd sanity-studio
npx sanity exec ./createYourSchema.ts --with-user-token
```

This will create:
- `yourSchema-ca` (Catalan document)
- `yourSchema-es` (Spanish document)
- `yourSchema-en` (English document)
- `yourSchema-translation-metadata` (Links all translations)

### 8. Delete the Script

After running successfully, delete the script:

```bash
rm createYourSchema.ts
```

## Frontend Integration

### 1. Create Query File

Create `astro-frontend/src/shared/lib/sanity/queries/yourSchemaQueries.ts`:

```typescript
import { fetchSanityQuery } from '@/shared/lib/sanity/client'
import { yourSchemaSchema, type YourSchema } from '@/shared/schemas/sanity/yourSchemaSchema'

export async function fetchYourSchema(locale: string = 'ca'): Promise<YourSchema | null> {
  try {
    const query = `*[_type == "yourSchema" && language == $language][0]{
      ...
    }`
    const params = { language: locale }

    let data = await fetchSanityQuery({
      query,
      params,
      schema: yourSchemaSchema,
    })

    // Fallback to Catalan if not found
    if (!data && locale !== 'ca') {
      const fallbackQuery = `*[_type == "yourSchema" && language == "ca"][0]{
        ...
      }`
      data = await fetchSanityQuery({
        query: fallbackQuery,
        schema: yourSchemaSchema,
      })
    }

    return data
  } catch (error) {
    console.error('Failed to fetch data:', error)
    return null
  }
}
```

### 2. Create Validation Schema

Create `astro-frontend/src/shared/schemas/sanity/yourSchemaSchema.ts`:

```typescript
import { z } from 'zod'

export const yourSchemaSchema = z.object({
  _id: z.string(),
  _type: z.literal('yourSchema'),
  _createdAt: z.string(),
  _updatedAt: z.string(),
  _rev: z.string(),
  language: z.string(),
  title: z.string().optional(),
  // ... other fields
})

export type YourSchema = z.infer<typeof yourSchemaSchema>
```

### 3. Use in Astro Component

```astro
---
import { fetchYourSchema } from '@/shared/lib/sanity/queries/yourSchemaQueries'

const locale = (Astro.currentLocale as 'ca' | 'es' | 'en') || 'ca'
const data = await fetchYourSchema(locale)

// Use fallback values if no data
const title = data?.title || 'Default Title'
---

<div>{title}</div>
```

## Troubleshooting

### Problem: "Language field not prepopulated"
**Solution:** You forgot to run the initialization script! The documents must be pre-created.

### Problem: Ghost/cached data appearing
**Solution:** 
1. Delete all documents: `npx sanity documents delete schema-ca schema-es schema-en schema-translation-metadata`
2. Clear browser cache
3. Restart Sanity Studio
4. Run the initialization script again

### Problem: Documents are read-only
**Solution:** Check that the language field is set to `readOnly: true` in your schema. The i18n plugin manages this field.

### Problem: Duplicate entries in navigation
**Solution:** Ensure each singleton has a unique ID in the desk structure.

## Important Notes

1. **NEVER** try to create singleton documents through the UI first - they won't have the proper language field set
2. **ALWAYS** create the initialization script and run it before trying to edit content
3. The document IDs follow the pattern: `{schemaId}-{languageId}` (e.g., `footer-ca`, `footer-es`)
4. The translation metadata document links all language versions together
5. Document-level i18n means each language is a separate document, not fields within one document

## References

- [@sanity/document-internationalization documentation](https://github.com/sanity-io/document-internationalization)
- [Singleton documents guide](https://github.com/sanity-io/document-internationalization/blob/main/docs/01-singleton-documents.md)
- [Creating documents script](https://github.com/sanity-io/document-internationalization/blob/main/scripts/createSingletons.ts)