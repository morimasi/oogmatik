/**
 * Super Türkçe Sınav Stüdyosu - AI Generator
 * MEB kazanım entegreli sınav üretimi
 *
 * Selin Arslan: Vercel serverless ortamında self-HTTP-call yasak olduğundan
 * Gemini REST API doğrudan çağrılır.
 */

import type { SinavAyarlari, Soru, Sinav, CevapAnahtari } from '../../types/sinav.js';
import { getKazanimByCode } from '../../data/meb-turkce-kazanim.js';
import { AppError } from '../../utils/AppError.js';

const MASTER_MODEL = 'gemini-2.5-flash';

// ─── Doğrudan Gemini REST API çağrısı (Vercel serverless uyumlu) ────────────
export const callGeminiDirect = async (prompt: string, schema: object): Promise<unknown> => {
  // Test ortamında mock'ı kullan
  if (process.env.NODE_ENV === 'test') {
    return {
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
          tahminiSure: 90,
        },
        {
          id: 'soru-2',
          tip: 'coktan-secmeli',
          zorluk: 'Kolay',
          soruMetni: 'Metindeki ana fikir ne anlama gelir?',
          secenekler: [
            'A) Konunun özeti',
            'B) Yazarın asıl vermek istediği mesaj',
            'C) Kitap adı',
            'D) Karakter sayısı',
          ],
          dogruCevap: '1',
          kazanimKodu: 'T.5.3.1',
          puan: 5,
          tahminiSure: 90,
        },
        {
          id: 'soru-3',
          tip: 'bosluk-doldurma',
          zorluk: 'Orta',
          soruMetni: 'Hikâyenin geçtiği yer _____ olarak adlandırılır.',
          dogruCevap: 'mekân',
          kazanimKodu: 'T.5.3.2',
          puan: 5,
          tahminiSure: 60,
        },
        {
          id: 'soru-4',
          tip: 'acik-uclu',
          zorluk: 'Orta',
          soruMetni:
            'Okuduğunuz bir metnin ana fikrini belirlerken nelere dikkat edersiniz? Açıklayınız.',
          dogruCevap:
            'Metnin bütününü okumak, tekrarlanan kavramlar, başlık ve sonuç cümlesi gibi unsurlara dikkat etmek gerekir.',
          kazanimKodu: 'T.5.3.1',
          puan: 10,
          tahminiSure: 300,
        },
      ],
      pedagogicalNote:
        'Bu sınav T.5.3.1 ve T.5.3.2 kazanımlarını ölçmektedir. Öğretmen dikkat noktaları: İlk iki soru kolay seviyede başarı anı mimarisini desteklemektedir. Üçüncü soru mekân kavramını pekiştirirken, son soru öğrencinin metni analiz etme becerisini değerlendirir. Disleksi desteğine ihtiyaç duyan öğrenciler için sade dil kullanılmıştır.',
    };
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new AppError(
      'API anahtarı bulunamadı. Lütfen yönetici ile iletişime geçin.',
      'CONFIG_ERROR',
      500,
      undefined,
      false
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MASTER_MODEL}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      temperature: 0.4
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const msg = (errData as any)?.error?.message || response.statusText;
    throw new AppError(
      `Gemini API hatası: ${msg}`,
      'GEMINI_API_ERROR',
      502,
      { status: response.status },
      true
    );
  }

  const data = await response.json();
  const text = (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new AppError(
      'Gemini boş yanıt döndürdü.',
      'GEMINI_EMPTY_RESPONSE',
      502,
      undefined,
      true
    );
  }

  // JSON parse — responseMimeType: application/json olduğundan direkt parse
  try {
    return JSON.parse(text);
  } catch {
    // Bazen markdown sarmalayabilir
    const cleaned = text
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/^```json[\s\S]*?\n/, '')
      .replace(/^```\s*/m, '')
      .replace(/```\s*$/m, '')
      .trim();
    return JSON.parse(cleaned);
  }
};

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

UYARI: pedagogicalNote alanı ZORUNLU, en az 100 karakter olmalı.
`;
};

const EXAM_SCHEMA = {
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

  try {
    const aiResponse = await callGeminiDirect(prompt, EXAM_SCHEMA) as any;

    // Validation: pedagogicalNote kontrolü
    if (!aiResponse.pedagogicalNote || aiResponse.pedagogicalNote.length < 100) {
      // Pedagojik not yoksa oluştur (hata vermek yerine fallback)
      aiResponse.pedagogicalNote =
        `Bu sınav ${settings.sinif}. sınıf Türkçe dersi için ${settings.secilenKazanimlar.join(', ')} ` +
        `kazanımlarını ölçmektedir. Başarı Anı Mimarisi ile ilk iki soru öğrencinin motivasyonunu artırmak için ` +
        `kolay tutulmuştur. Öğretmen geri bildiriminde öğrencinin güçlü yönlerini vurgulaması önerilir.`;
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

    // Başarı Anı Mimarisi: ilk 2 soruyu zorunlu olarak Kolay yap
    if (aiResponse.sorular.length >= 2) {
      aiResponse.sorular[0].zorluk = 'Kolay';
      aiResponse.sorular[1].zorluk = 'Kolay';
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
    const toplamPuan = aiResponse.sorular.reduce((sum: number, s: any) => sum + (s.puan || 5), 0);
    const tahminiSure = aiResponse.sorular.reduce((sum: number, s: any) => sum + (s.tahminiSure || 90), 0);

    const sinav: Sinav = {
      id: `exam-${Date.now()}`,
      baslik: aiResponse.baslik || `${settings.sinif}. Sınıf Türkçe Değerlendirme Sınavı`,
      sinif: settings.sinif,
      secilenKazanimlar: settings.secilenKazanimlar,
      sorular: aiResponse.sorular,
      toplamPuan,
      tahminiSure,
      olusturmaTarihi: new Date().toISOString(),
      olusturanKullanici: 'system',
      pedagogicalNote: aiResponse.pedagogicalNote,
      cevapAnahtari
    };

    return sinav;
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;

    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[sinavGenerator] Hata:', errorMessage);
    throw new AppError(
      'Sınav oluşturulurken beklenmeyen bir hata oluştu.',
      'EXAM_GENERATION_ERROR',
      500,
      { originalError: errorMessage },
      true
    );
  }
};
