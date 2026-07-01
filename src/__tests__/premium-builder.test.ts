import { describe, test, expect } from 'vitest';
import { PremiumBlockBuilder } from '../utils/PremiumBlockBuilder'

describe('PremiumBlockBuilder', () => {
  test('chainability and build', () => {
    const builder = new PremiumBlockBuilder()
      .addPremiumHeader('Test Header')
      .setInstruction('Do this')
      .addRiddle({ id: 'r1', mysteryNumber: 7, clues: [] })
    const content = builder.build()
    expect(content.header).toBe('Test Header')
    expect(content.instruction).toBe('Do this')
    expect(Array.isArray(content.riddles)).toBe(true)
    expect(content.riddles?.length).toBe(1)
  })
})
