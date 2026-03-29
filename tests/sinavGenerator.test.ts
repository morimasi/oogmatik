/**
 * Sınav Generator Unit Tests
 * Tests for Super Türkçe Sınav Stüdyosu AI generator
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateExam } from '../src/services/generators/sinavGenerator';
import type { SinavAyarlari } from '../src/types/sinav';

// Mock geminiClient
vi.mock('../src/services/geminiClient', () => ({
  generateWithSchema: vi.fn(async () => ({
    baslik: '5. Sınıf Türkçe Değerlendirme Sınavı',
    sorular: [
      {
        id: 'soru-1',
        tip: 'coktan-secmeli',
        zorluk: 'Kolay',
        soruMetni: 'Aşağıdakilerden hangisi hikâye unsurlarından biridir?',
        secenekler: ['A) Olay', 'B) Başlık', 'C) Sayfa numarası', 'D) Renk'],
        dogruCevap: '0',
        kazanimKodu: 'T.5.3.1',
        puan: 5,
        tahminiSure: 90
      },
      {
        id: 'soru-2',
        tip: 'coktan-secmeli',
        zorluk: 'Kolay',
        soruMetni: 'Metindeki ana fikir ne anlama gelir?',
        secenekler: ['A) Konunun özeti', 'B) Yazarın asıl vermek istediği mesaj', 'C) Kitap adı', 'D) Karakter sayısı'],
        dogruCevap: '1',
        kazanimKodu: 'T.5.3.1',
        puan: 5,
        tahminiSure: 90
      },
      {
        id: 'soru-3',
        tip: 'bosluk-doldurma',
        zorluk: 'Orta',
        soruMetni: 'Hikâyenin geçtiği yer _____ olarak adlandırılır.',
        dogruCevap: 'mekân',
        kazanimKodu: 'T.5.3.2',
        puan: 5,
        tahminiSure: 60
      },
      {
        id: 'soru-4',
        tip: 'acik-uclu',
        zorluk: 'Orta',
        soruMetni: 'Okuduğunuz bir metnin ana fikrini belirlerken nelere dikkat edersiniz? Açıklayınız.',
        dogruCevap: 'Metnin bütününü okumak, tekrarlanan kavramlar, başlık ve sonuç cümlesi gibi unsurlara dikkat etmek gerekir.',
        kazanimKodu: 'T.5.3.1',
        puan: 10,
        tahminiSure: 300
      }
    ],
    pedagogicalNote: 'Bu sınav T.5.3.1 ve T.5.3.2 kazanımlarını ölçmektedir. Öğretmen dikkat noktaları: İlk iki soru kolay seviyede başarı anı mimarisini desteklemektedir. Üçüncü soru mekân kavramını pekiştirirken, son soru öğrencinin metni analiz etme becerisini değerlendirir. Disleksi desteğine ihtiyaç duyan öğrenciler için sade dil kullanılmıştır.'
  }))
}));

describe('sinavGenerator', () => {
  let validSettings: SinavAyarlari;

  beforeEach(() => {
    validSettings = {
      sinif: 5,
      secilenUniteler: ['unite-5-1'],
      secilenKazanimlar: ['T.5.3.1', 'T.5.3.2'],
      soruDagilimi: {
        'coktan-secmeli': 2,
        'dogru-yanlis-duzeltme': 0,
        'bosluk-doldurma': 1,
        'acik-uclu': 1
      },
      zorlukDagilimi: {
        'Kolay': 2,
        'Orta': 2,
        'Zor': 0
      }
    };
  });

  it('should throw error if no grade selected', async () => {
    const invalidSettings = { ...validSettings, sinif: null };

    await expect(generateExam(invalidSettings as any)).rejects.toThrow('Sınıf seçimi zorunludur.');
  });

  it('should throw error if no kazanim selected', async () => {
    const invalidSettings = { ...validSettings, secilenKazanimlar: [] };

    await expect(generateExam(invalidSettings)).rejects.toThrow('En az bir MEB kazanımı seçilmelidir.');
  });

  it('should throw error if less than 4 questions total', async () => {
    const invalidSettings = {
      ...validSettings,
      soruDagilimi: {
        'coktan-secmeli': 1,
        'dogru-yanlis-duzeltme': 1,
        'bosluk-doldurma': 1,
        'acik-uclu': 0
      }
    };

    await expect(generateExam(invalidSettings)).rejects.toThrow('En az 4 soru olmalıdır (Başarı Anı Mimarisi için).');
  });

  it('should generate exam with valid settings', async () => {
    const sinav = await generateExam(validSettings);

    expect(sinav).toBeDefined();
    expect(sinav.id).toContain('exam-');
    expect(sinav.baslik).toBe('5. Sınıf Türkçe Değerlendirme Sınavı');
    expect(sinav.sinif).toBe(5);
    expect(sinav.sorular).toHaveLength(4);
    expect(sinav.secilenKazanimlar).toEqual(['T.5.3.1', 'T.5.3.2']);
  });

  it('should enforce Başarı Anı Mimarisi (first 2 questions easy)', async () => {
    const sinav = await generateExam(validSettings);

    expect(sinav.sorular[0].zorluk).toBe('Kolay');
    expect(sinav.sorular[1].zorluk).toBe('Kolay');
  });

  it('should include pedagogicalNote with min 100 chars', async () => {
    const sinav = await generateExam(validSettings);

    expect(sinav.pedagogicalNote).toBeDefined();
    expect(sinav.pedagogicalNote.length).toBeGreaterThanOrEqual(100);
  });

  it('should calculate total points correctly', async () => {
    const sinav = await generateExam(validSettings);

    const expectedTotal = sinav.sorular.reduce((sum, soru) => sum + soru.puan, 0);
    expect(sinav.toplamPuan).toBe(expectedTotal);
    expect(sinav.toplamPuan).toBe(25); // 2*5 + 5 + 10
  });

  it('should calculate estimated time correctly', async () => {
    const sinav = await generateExam(validSettings);

    const expectedTime = sinav.sorular.reduce((sum, soru) => sum + soru.tahminiSure, 0);
    expect(sinav.tahminiSure).toBe(expectedTime);
    expect(sinav.tahminiSure).toBe(540); // 90+90+60+300
  });

  it('should generate answer key with correct structure', async () => {
    const sinav = await generateExam(validSettings);

    expect(sinav.cevapAnahtari).toBeDefined();
    expect(sinav.cevapAnahtari.sorular).toHaveLength(4);

    sinav.cevapAnahtari.sorular.forEach((cevap, index) => {
      expect(cevap.soruNo).toBe(index + 1);
      expect(cevap.dogruCevap).toBeDefined();
      expect(cevap.puan).toBeDefined();
      expect(cevap.kazanimKodu).toBeDefined();
    });
  });

  it('should include creation timestamp', async () => {
    const beforeTime = new Date().toISOString();
    const sinav = await generateExam(validSettings);
    const afterTime = new Date().toISOString();

    expect(sinav.olusturmaTarihi).toBeDefined();
    expect(sinav.olusturmaTarihi >= beforeTime).toBe(true);
    expect(sinav.olusturmaTarihi <= afterTime).toBe(true);
  });

  it('should handle optional special topic', async () => {
    const settingsWithTopic = {
      ...validSettings,
      ozelKonu: 'Uzay keşfi'
    };

    const sinav = await generateExam(settingsWithTopic);
    expect(sinav).toBeDefined();
    // AI prompt'a tema eklendiğinden başarılı şekilde üretilmeli
  });
});
