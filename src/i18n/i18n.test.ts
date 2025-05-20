// src/i18n/i18n.test.ts
import { describe, it, expect } from 'vitest' // Or these will be global if globals:true works

describe('Vitest setup', () => {
  it('should work', () => {
    expect(true).toBe(true)
  })

  it('simple math test', () => {
    expect(1 + 1).toBe(2)
  })
})
