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

  it('geçerli refined dönerse onu kullanır', async () => {
    mockGenerateWithSchema.mockResolvedValue({ refined: 'Yeni prompt' });

    const result = await refinePromptWithAI('Eski prompt', 'expand');

    expect(result).toBe('Yeni prompt');
  });
});
