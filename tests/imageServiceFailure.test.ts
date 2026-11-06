import { describe, it, expect, vi, afterEach } from 'vitest';
import { imageService } from '../src/services/imageService';

const fetchMock = vi.fn();

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe('imageService — hata davranışı', () => {
  it('API 503 döndüğünde dış servis URL’i üretmeden hata fırlatır', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);

    await expect(imageService.generateImage({ prompt: 'test görseli 503' })).rejects.toThrow(/Görsel üretilemedi/);
  });

  it('API 200 + veri URL’i döndüğünde onu kullanır ve önbelleğe alır', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ url: 'data:image/png;base64,AAAA', provider: 'pollinations' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const first = await imageService.generateImage({ prompt: 'test görseli 200' });
    const second = await imageService.generateImage({ prompt: 'test görseli 200' });

    expect(first).toBe('data:image/png;base64,AAAA');
    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
