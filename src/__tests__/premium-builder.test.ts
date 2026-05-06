import { PremiumBlockBuilder } from '../utils/PremiumBlockBuilder'

test('PremiumBlockBuilder chainability and build', () => {
  const builder = new PremiumBlockBuilder()
    .addPremiumHeader('Test Header')
    .setInstruction('Do this')
    .addPedagogicalNote('Note for test')
    .addRiddle({ id: 'r1', mysteryNumber: 7, clues: [] as any[] })
  const content = builder.build()
  expect(content.header).toBe('Test Header')
  expect(content.instruction).toBe('Do this')
  expect(content.pedagogicalNote).toBe('Note for test')
  expect(Array.isArray(content.riddles)).toBe(true)
  expect(content.riddles.length).toBe(1)
})
