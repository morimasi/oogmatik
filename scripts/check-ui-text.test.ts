import { describe, expect, it } from 'vitest';
import {
  findEnglishUiText,
  findNewEnglishUiText,
  isEnglishUiText,
  loadBaseline,
} from './check-ui-text';

/**
 * Arayüz dili koruması
 * ------------------------------------------------------------------
 * bdmind'de kullanıcı YALNIZCA Türkçe metin görmelidir. Bu test, kaynak koda
 * yeni eklenen İngilizce arayüz metnini yakalar ve süreci kırar; böylece
 * çeviri regresyonu sessizce geri dönemez.
 *
 * Yeni bir İngilizce metin eklerseniz:
 *   1. Önce Türkçeye çevirin (tercih edilen yol), veya
 *   2. Meşru bir istisnaysa baseline'ı yenileyin:
 *        npx tsx scripts/check-ui-text.ts --update
 */
describe('arayüz metni Türkçe olmalı', () => {
  it('kaynakta baseline dışı İngilizce arayüz metni bulunmamalı', () => {
    const hits = findEnglishUiText('src');
    const baseline = loadBaseline();
    const fresh = findNewEnglishUiText(hits, baseline);

    const report = fresh
      .map((h) => `  ${h.file}:${h.line} [${h.kind}] ${h.text}`)
      .join('\n');

    expect(
      fresh.length,
      fresh.length === 0
        ? ''
        : `${fresh.length} yeni İngilizce arayüz metni bulundu:\n${report}\n\n` +
            'Türkçeye çevirin ya da baseline\'ı güncelleyin: npx tsx scripts/check-ui-text.ts --update',
    ).toBe(0);
  });

  it('baseline dosyası geçerli bir JSON dizisidir', () => {
    expect(() => loadBaseline()).not.toThrow();
    for (const entry of loadBaseline()) {
      expect(typeof entry).toBe('string');
      expect(entry.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('isEnglishUiText sezgisi', () => {
  it('Türkçe metni İngilizce saymaz', () => {
    expect(isEnglishUiText('Etkinliği tamamla')).toBe(false);
    expect(isEnglishUiText('Tüm ayarları sıfırla')).toBe(false);
    expect(isEnglishUiText('Etkinlik ayarları')).toBe(false);
    expect(isEnglishUiText('Paneli aç')).toBe(false);
  });

  it('İngilizce arayüz metnini yakalar', () => {
    expect(isEnglishUiText('Complete the activity')).toBe(true);
    expect(isEnglishUiText('Activity settings')).toBe(true);
    expect(isEnglishUiText('Refresh token required')).toBe(true);
  });

  it('teknik değerleri arayüz metni saymaz', () => {
    expect(isEnglishUiText('https://example.com/save')).toBe(false);
    expect(isEnglishUiText('dogru_parcasi')).toBe(false);
    expect(isEnglishUiText('fa-solid fa-trash')).toBe(false);
    expect(isEnglishUiText('&copy;')).toBe(false);
    expect(isEnglishUiText('application/pdf')).toBe(false);
  });
});
