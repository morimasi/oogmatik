import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateAd } from '../src/services/adGeneratorService';
import { DEFAULT_SETTINGS } from '../src/types/adStudio';

describe('generateAd Turkish output contract', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps legacy English settings from producing or labeling English ads', async () => {
    const generatedContent = {
      title: 'Türkçe reklam başlığı',
      scenes: [],
      script: 'Türkçe reklam metni',
      socialCopy: 'Türkçe sosyal medya metni',
      emailSubject: 'Türkçe e-posta konusu',
      emailBody: 'Türkçe e-posta metni',
    };
    let requestBody = '';
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(input).toBe('/api/generate');
      if (typeof init?.body === 'string') requestBody = init.body;
      return new Response(JSON.stringify({ text: JSON.stringify(generatedContent) }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const output = await generateAd(
      { ...DEFAULT_SETTINGS, language: 'en' },
      {
        id: 'brand-1',
        name: 'bdmind',
        logo: '',
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        font: 'Lexend',
        slogan: 'Herkes için öğrenme',
        website: 'https://example.com',
        createdAt: '2026-10-02T00:00:00.000Z',
      }
    );

    const request = JSON.parse(requestBody) as {
      prompt: string;
    };
    expect(request.prompt).toContain('DIL: Turkce');
    expect(output.language).toBe('tr');
  });

  it('rejects English generated copy instead of returning it as a successful ad', async () => {
    const generatedContent = {
      title: 'The best learning platform for your students',
      scenes: [],
      script: 'Our platform helps every child learn.',
    };
    vi.stubGlobal('fetch', vi.fn(async () =>
      new Response(JSON.stringify({ text: JSON.stringify(generatedContent) }), { status: 200 })
    ));

    await expect(generateAd(DEFAULT_SETTINGS, {
      id: 'brand-1',
      name: 'bdmind',
      logo: '',
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      font: 'Lexend',
      slogan: 'Herkes için öğrenme',
      website: 'https://example.com',
      createdAt: '2026-10-02T00:00:00.000Z',
    })).rejects.toMatchObject({ code: 'TURKISH_CONTENT_VALIDATION_FAILED' });
  });
});
