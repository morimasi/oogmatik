import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGenerateWithSchema } = vi.hoisted(() => ({
  mockGenerateWithSchema: vi.fn(),
}));

vi.mock('../src/services/geminiClient.js', () => ({
  generateWithSchema: mockGenerateWithSchema,
  generateCreativeMultimodal: vi.fn(),
}));

import { refinePromptWithAI } from '../src/services/generators/creativeStudio';

describe('refinePromptWithAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('schema yanıtında refined yoksa mevcut promptu korur', async () => {
    mockGenerateWithSchema.mockResolvedValue({});

    const currentPrompt = 'Mevcut prompt metni';
    const result = await refinePromptWithAI(currentPrompt, 'clinical');

    expect(result).toBe(currentPrompt);
  });

  it('refined null/undefined/boş veya string dışıysa mevcut promptu korur', async () => {
    const currentPrompt = 'Korunacak prompt';
    const invalidCases = [{ refined: null }, { refined: undefined }, { refined: '' }, { refined: 123 }, { refined: { text: 'x' } }];

    for (const mocked of invalidCases) {
      mockGenerateWithSchema.mockResolvedValue(mocked);
      const result = await refinePromptWithAI(currentPrompt, 'expand');
      expect(result).toBe(currentPrompt);
    }
  });

  it('geçerli refined dönerse onu kullanır', async () => {
    mockGenerateWithSchema.mockResolvedValue({ refined: 'Yeni prompt' });

    const result = await refinePromptWithAI('Eski prompt', 'expand');

    expect(result).toBe('Yeni prompt');
  });
});
