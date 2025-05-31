// src/shared/lib/sanity/queries/homePageQueries.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { MockedFunction } from 'vitest'
import { fetchHomePageByLocale } from './homePageQueries' // The function to test
import {
  fetchSanityQuery,
  fetchSanityQuery as originalFetchSanityQuery,
} from '@/shared/lib/sanity/client' // The function to mock and its original type
import { homePageSchema } from '@/shared/schemas/sanity/homePageSchema' // Used in the actual implementation
import { z } from 'zod' // Import Zod

// Infer HomePage type from the schema
type HomePage = z.infer<typeof homePageSchema>

// Define the expected query parameters type
interface SanityQueryParams {
  query: string
  params: { documentId: string }
  schema: typeof homePageSchema
}

// Mock the fetchSanityQuery function
vi.mock('@/shared/lib/sanity/client', () => ({
  fetchSanityQuery: vi.fn() as unknown as typeof originalFetchSanityQuery,
}))

// Type the mocked function
const mockedFetchSanityQuery = fetchSanityQuery as MockedFunction<typeof originalFetchSanityQuery>

describe('fetchHomePageByLocale', () => {
  beforeEach(() => {
    // Reset the mock before each test
    mockedFetchSanityQuery.mockClear()
  })

  it('should fetch Catalan homepage data with correct document ID', async () => {
    const mockResponse = { title: 'Pàgina Inici Català', slug: { current: '/' } } // Example data
    mockedFetchSanityQuery.mockImplementation(() =>
      Promise.resolve(mockResponse as unknown as HomePage),
    )

    const result: HomePage | null = await fetchHomePageByLocale('ca')

    expect(fetchSanityQuery).toHaveBeenCalledTimes(1)
    expect(fetchSanityQuery).toHaveBeenCalledWith({
      query: expect.stringContaining('*[_id == $documentId][0]') as string,
      params: { documentId: 'homePage-ca' },
      schema: homePageSchema,
    } satisfies SanityQueryParams)
    expect(result).toEqual(mockResponse)
  })

  it('should fetch Spanish homepage data with correct document ID', async () => {
    const mockResponse = { title: 'Página Inicio Español', slug: { current: '/es' } }
    mockedFetchSanityQuery.mockImplementation(() =>
      Promise.resolve(mockResponse as unknown as HomePage),
    )

    const result: HomePage | null = await fetchHomePageByLocale('es')

    expect(fetchSanityQuery).toHaveBeenCalledTimes(1)
    expect(fetchSanityQuery).toHaveBeenCalledWith({
      query: expect.stringContaining('*[_id == $documentId][0]') as string,
      params: { documentId: 'homePage-es' },
      schema: homePageSchema,
    } satisfies SanityQueryParams)
    expect(result).toEqual(mockResponse)
  })

  it('should fetch English homepage data with correct document ID', async () => {
    const mockResponse = { title: 'English Home Page', slug: { current: '/en' } }
    mockedFetchSanityQuery.mockImplementation(() =>
      Promise.resolve(mockResponse as unknown as HomePage),
    )

    const result: HomePage | null = await fetchHomePageByLocale('en')

    expect(fetchSanityQuery).toHaveBeenCalledTimes(1)
    expect(fetchSanityQuery).toHaveBeenCalledWith({
      query: expect.stringContaining('*[_id == $documentId][0]') as string,
      params: { documentId: 'homePage-en' },
      schema: homePageSchema,
    } satisfies SanityQueryParams)
    expect(result).toEqual(mockResponse)
  })

  it('should default to Catalan for undefined locale', async () => {
    const mockResponse = { title: 'Pàgina Inici Català Default', slug: { current: '/' } }
    mockedFetchSanityQuery.mockImplementation(() =>
      Promise.resolve(mockResponse as unknown as HomePage),
    )

    const result: HomePage | null = await fetchHomePageByLocale(undefined)

    expect(fetchSanityQuery).toHaveBeenCalledTimes(1)
    expect(fetchSanityQuery).toHaveBeenCalledWith({
      query: expect.stringContaining('*[_id == $documentId][0]') as string,
      params: { documentId: 'homePage-ca' }, // Defaults to Catalan
      schema: homePageSchema,
    } satisfies SanityQueryParams)
    expect(result).toEqual(mockResponse)
  })

  it('should return null if fetchSanityQuery returns null (e.g., document not found or validation fails)', async () => {
    mockedFetchSanityQuery.mockImplementation(() => Promise.resolve(null)) // Simulate null return

    const result = await fetchHomePageByLocale('ca')

    expect(fetchSanityQuery).toHaveBeenCalledTimes(1)
    expect(result).toBeNull()
  })

  it('should return null if fetchSanityQuery consistently fails', async () => {
    const errorMessage = 'Sanity fetch failed consistently'
    mockedFetchSanityQuery.mockImplementation(() => Promise.reject(new Error(errorMessage)))

    const result = await fetchHomePageByLocale('ca')

    expect(result).toBeNull()
    // It will be called twice: once for schema validation, once for raw data fallback
    expect(fetchSanityQuery).toHaveBeenCalledTimes(2)
  })
})
