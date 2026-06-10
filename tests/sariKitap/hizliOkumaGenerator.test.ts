import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/services/geminiClient.js', () => ({
  generateWithSchema: vi.fn(),
}));

import { generateWithSchema } from '../../src/services/geminiClient.js';
import { generateHizliOkumaFromAI } from '../../src/services/generators/sariKitap/hizliOkuma';

describe('Hızlı Okuma AI generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('kullanıcı tarafından seçilen konuyu prompt içine ekler', async () => {
    const mockResponse = [
      {
        title: 'Hızlı Okuma - Türk Tarihi',
        instructions: 'Başlık oku ve hızla devam et',
        wordBlocks: [['Anadolu', 'saklı', 'geçmiş']],
      },
    ];

    vi.mocked(generateWithSchema).mockResolvedValueOnce(mockResponse);

    const options = {
      topics: ['Türk Tarihi'],
      difficulty: 'Orta',
      ageGroup: '8-10',
      wordsPerBlock: 3,
      blockRows: 20,
      showTimer: true,
      rhythmicMode: false,
      autoFill: true,
      columnMode: 'cift',
      lineSpacing: 'geniş',
      worksheetCount: 1,
    };

    const result = await generateHizliOkumaFromAI(options);

    expect(result).toEqual(mockResponse);
    expect(generateWithSchema).toHaveBeenCalledTimes(1);
    const [prompt] = vi.mocked(generateWithSchema).mock.calls[0];
    expect(prompt).toContain('"Türk Tarihi" temalı HIZLI OKUMA materyali üret');
    expect(prompt).toContain('Sütun modu: Çift sütun');
    expect(prompt).toContain('Satır sayısı: 20');
    expect(prompt).toContain('Satır aralığı: geniş');
  });

  it('topics yoksa topic alanından fallback yapar', async () => {
    const mockResponse = [
      {
        title: 'Hızlı Okuma - Uzay',
        instructions: 'Uzay temalı hız testleri',
        wordBlocks: [['Uzay', 'gizemli', 'yıldız']],
      },
    ];

    vi.mocked(generateWithSchema).mockResolvedValueOnce(mockResponse);

    const options = {
      topic: 'Uzay & Astronomi',
      difficulty: 'Başlangıç',
      ageGroup: '5-7',
      wordsPerBlock: 2,
      blockRows: 15,
      showTimer: false,
      rhythmicMode: true,
      autoFill: false,
      columnMode: 'tek',
      lineSpacing: 'normal',
      worksheetCount: 1,
    };

    await generateHizliOkumaFromAI(options);

    const [prompt] = vi.mocked(generateWithSchema).mock.calls[0];
    expect(prompt).toContain('"Uzay & Astronomi" temalı HIZLI OKUMA materyali üret');
  });
});
