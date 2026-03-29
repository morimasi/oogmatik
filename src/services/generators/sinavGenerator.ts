/**
 * Super Türkçe Sınav Stüdyosu - AI Generator
 * MEB kazanım entegreli sınav üretimi
 */

import { generateWithSchema } from '../geminiClient.js';
import type { SinavAyarlari, Soru, Sinav, CevapAnahtari } from '../../types/sinav.js';
import { getKazanimByCode } from '../../data/meb-turkce-kazanim.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Sınav için AI prompt oluştur
 */
const buildExamPrompt = (settings: SinavAyarlari): string => {
  // Kazanım bilgilerini topla
  const kazanimBilgileri = settings.secilenKazanimlar
    .map(kod => {
      const kazanim = getKazanimByCode(kod);
      return kazanim ? `${kod}: ${kazanim.tanim} (${kazanim.ogrenmeAlani})` : kod;
    })
    .join('\n');

  const toplamSoru =
    settings.soruDagilimi['coktan-secmeli'] +
    settings.soruDagilimi['dogru-yanlis-duzeltme'] +
    settings.soruDagilimi['bosluk-doldurma'] +
    settings.soruDagilimi['acik-uclu'];

  return `
[ROL: MEB SINAV UZMANI + DİSLEKSİ UZMAN ÖĞRETMENİ]

GÖREV: ${settings.sinif}. sınıf Türkçe dersi için ${toplamSoru} soruluk sınav hazırla.

[MEB KAZANIM HEDEFLEME]
Aşağıdaki MEB 2024-2025 kazanımlarını ölç:
${kazanimBilgileri}

[ZORUNLU: BAŞARI ANI MİMARİSİ]
- İlk 2 soru MUTLAKA KOLAY zorlukta olmalı (öğrenciye güven inşa et)
- 3. ve 4. sorular ORTA zorlukta
- Eğer 5+ soru varsa, son soru ORTA-ZOR aralığında

[SORU DAĞILIMI]
- Çoktan Seçmeli (4 seçenekli): ${settings.soruDagilimi['coktan-secmeli']} adet
- Doğru-Yanlış-Düzeltme: ${settings.soruDagilimi['dogru-yanlis-duzeltme']} adet
- Boşluk Doldurma: ${settings.soruDagilimi['bosluk-doldurma']} adet
- Açık Uçlu: ${settings.soruDagilimi['acik-uclu']} adet

${settings.ozelKonu ? `[TEMA]\nTüm sorular "${settings.ozelKonu}" teması etrafında olmalı.\n` : ''}

[DİSLEKSİ UYUMLULUK KURALLARI]
- Sade, net dil kullan (karmaşık cümlelerden kaçın)
- Çoktan seçmelide dikkat dağıtıcılar mantıklı ama net yanlış olmalı
- Boşluk doldurmalarda kelime uzunluğu ipucu verme (hepsi aynı uzunlukta "___" kullan)

[PUAN VE SÜRE TAHMİNİ]
- Çoktan seçmeli: 5 puan, ~90 saniye
- Doğru-Yanlış-Düzeltme: 5 puan, ~120 saniye
- Boşluk doldurma: 5 puan, ~60 saniye
- Açık uçlu: 10 puan, ~300 saniye

[YANIT FORMATI - ZORUNLU JSON]
{
  "baslik": "Sınavın başlığı (örn: ${settings.sinif}. Sınıf Türkçe Değerlendirme Sınavı)",
  "sorular": [
    {
      "id": "soru-1",
      "tip": "coktan-secmeli",
      "zorluk": "Kolay",
      "soruMetni": "Soru metni...",
      "secenekler": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "dogruCevap": "0",
      "kazanimKodu": "T.5.3.1",
      "puan": 5,
      "tahminiSure": 90
    }
  ],
  "pedagogicalNote": "ZORUNLU: Bu sınav [kazanım kodlarını listele] kazanımlarını ölçmektedir. Öğretmen dikkat noktaları: [detaylı pedagojik açıklama, en az 100 karakter]"
}

UYARI: pedagogicalNote alanı boş veya 100 karakterden kısa olamaz.
`;
};

/**
 * AI ile sınav oluştur
 */
export const generateExam = async (settings: SinavAyarlari): Promise<Sinav> => {
  // Validation
  if (!settings.sinif) {
    throw new AppError('Sınıf seçimi zorunludur.', 'VALIDATION_ERROR', 400, undefined, false);
  }

  if (!Array.isArray(settings.secilenKazanimlar) || settings.secilenKazanimlar.length === 0) {
    throw new AppError(
      'En az bir MEB kazanımı seçilmelidir.',
      'NO_KAZANIM_SELECTED',
      400,
      undefined,
      false
    );
  }

  const toplamSoru =
    settings.soruDagilimi['coktan-secmeli'] +
    settings.soruDagilimi['dogru-yanlis-duzeltme'] +
    settings.soruDagilimi['bosluk-doldurma'] +
    settings.soruDagilimi['acik-uclu'];

  if (toplamSoru < 4) {
    throw new AppError(
      'En az 4 soru olmalıdır (Başarı Anı Mimarisi için).',
      'VALIDATION_ERROR',
      400,
      undefined,
      false
    );
  }

  // Prompt oluştur
  const prompt = buildExamPrompt(settings);

  // Gemini şema
  const schema = {
    type: 'OBJECT',
    properties: {
      baslik: { type: 'STRING' },
      sorular: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING' },
            tip: {
              type: 'STRING',
              enum: ['coktan-secmeli', 'dogru-yanlis-duzeltme', 'bosluk-doldurma', 'acik-uclu']
            },
            zorluk: { type: 'STRING', enum: ['Kolay', 'Orta', 'Zor'] },
            soruMetni: { type: 'STRING' },
            secenekler: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              nullable: true
            },
            dogruCevap: { type: 'STRING' },
            kazanimKodu: { type: 'STRING' },
            puan: { type: 'INTEGER' },
            tahminiSure: { type: 'INTEGER' }
          },
          required: ['id', 'tip', 'zorluk', 'soruMetni', 'dogruCevap', 'kazanimKodu', 'puan', 'tahminiSure']
        }
      },
      pedagogicalNote: { type: 'STRING' }
    },
    required: ['baslik', 'sorular', 'pedagogicalNote']
  };

  try {
    const aiResponse = await generateWithSchema(prompt, schema);

    // Validation: pedagogicalNote kontrolü
    if (!aiResponse.pedagogicalNote || aiResponse.pedagogicalNote.length < 100) {
      throw new AppError(
        'Pedagojik not eksik veya çok kısa (en az 100 karakter olmalı).',
        'VALIDATION_ERROR',
        400,
        undefined,
        false
      );
    }

    // Defensive coding: sorular array kontrolü
    if (!Array.isArray(aiResponse.sorular)) {
      throw new AppError(
        'AI yanıtında soru dizisi bulunamadı.',
        'INVALID_AI_RESPONSE',
        500,
        undefined,
        true
      );
    }

    // Validation: Başarı Anı Mimarisi kontrolü
    if (aiResponse.sorular.length >= 2) {
      if (aiResponse.sorular[0].zorluk !== 'Kolay' || aiResponse.sorular[1].zorluk !== 'Kolay') {
        console.warn('⚠️ AI ilk 2 soruyu Kolay yapmadı, manuel düzeltme yapılıyor.');
        aiResponse.sorular[0].zorluk = 'Kolay';
        aiResponse.sorular[1].zorluk = 'Kolay';
      }
    }

    // Cevap anahtarı oluştur
    const cevapAnahtari: CevapAnahtari = {
      sorular: aiResponse.sorular.map((soru: any, index: number) => ({
        soruNo: index + 1,
        dogruCevap: String(soru.dogruCevap),
        puan: soru.puan,
        kazanimKodu: soru.kazanimKodu
      }))
    };

    // Toplam puan ve süre hesapla
    const toplamPuan = aiResponse.sorular.reduce((sum: number, s: any) => sum + s.puan, 0);
    const tahminiSure = aiResponse.sorular.reduce((sum: number, s: any) => sum + s.tahminiSure, 0);

    const sinav: Sinav = {
      id: `exam-${Date.now()}`,
      baslik: aiResponse.baslik,
      sinif: settings.sinif,
      secilenKazanimlar: settings.secilenKazanimlar,
      sorular: aiResponse.sorular,
      toplamPuan,
      tahminiSure,
      olusturmaTarihi: new Date().toISOString(),
      olusturanKullanici: 'current-user-id', // TODO: authStore'dan al
      pedagogicalNote: aiResponse.pedagogicalNote,
      cevapAnahtari
    };

    return sinav;
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;

    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new AppError(
      'Sınav oluşturulurken beklenmeyen bir hata oluştu.',
      'EXAM_GENERATION_ERROR',
      500,
      { originalError: errorMessage },
      true
    );
  }
};
