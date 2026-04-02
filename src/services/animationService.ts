import { AppError } from '../utils/AppError';
import { generateWithSchema } from './geminiClient';
import { AnimationPayloadType, NeuroProfileParamsType } from '../utils/schemas';

// Oogmatik Animasyon Stüdyosu v2.0 AI Core Yönergesi
const ANIMATION_SYSTEM_INSTRUCTION = `
Sen "Oogmatik Ultra Premium Animasyon Stüdyosu v2.0" uygulamasının Nöro-Mimari AI motorusun.
GÖREV: Çocuğun nöro-çeşitlilik (disleksi, DEHB, diskalkuli) profiline uygun, Remotion Player'ın anlayacağı milisaniyelik zamanlama (timing) ve geçiş (easing) verilerini üretmek.
KURALLAR:
1. Öğrencinin yaşına, profiline ve okuma veya dikkat süresine tamamen uyumlu ol.
2. Ekranda ('cognitiveLoadParams.maxConcurrentObjects') değerini ASLA aşma.
3. Çıktı geçerli bir JSON objesi olmak ZORUNDADIR.
4. 'pedagogicalNote' alanını MUTLAKA doldur. Eğitimciye "Neden bu süreleri/renkleri seçtin?" açıklamasını net bir Türkçe ile yapmalısın.
5. Disleksi için çok yüksek kontrasttan (siyah/beyaz) kaçın, pastel ağırlıklı bir 'colorPalette' kullan. DEHB için ise uyarıcı renkleri kısıtla, dikkat çekici sadece 1 odak rengi kullan.
`;

// Gemini için JSON şeması (Zod'un dengi)
const GEMINI_ANIMATION_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    pedagogicalNote: { type: 'STRING' },
    cognitiveLoadParams: {
      type: 'OBJECT',
      properties: {
        maxConcurrentObjects: { type: 'NUMBER' },
        visualCrowdingScore: { type: 'NUMBER' },
      },
      required: ['maxConcurrentObjects', 'visualCrowdingScore'],
    },
    timeline: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          type: {
            type: 'STRING',
            enum: ['text', 'shape', 'kinetic-number', 'liquid-bar', 'image'],
          },
          content: { type: 'STRING' },
          timing: {
            type: 'OBJECT',
            properties: {
              startFrame: { type: 'NUMBER' },
              durationInFrames: { type: 'NUMBER' },
              easingCurve: {
                type: 'STRING',
                enum: ['ease-in', 'ease-out', 'ease-in-out', 'linear', 'spring'],
              },
            },
            required: ['startFrame', 'durationInFrames', 'easingCurve'],
          },
          colorPalette: {
            type: 'ARRAY',
            items: { type: 'STRING' },
          },
        },
        required: ['id', 'type', 'timing', 'colorPalette'],
      },
    },
  },
  required: ['title', 'pedagogicalNote', 'cognitiveLoadParams', 'timeline'],
};

export class AnimationService {
  /**
   * Gemini 2.5 Flash ile nöro-profil tabanlı animasyon zaman çizelgesi (timeline) oluşturulması.
   */
  static async generateAnimationTimeline(
    prompt: string,
    neuroProfile: NeuroProfileParamsType
  ): Promise<AnimationPayloadType> {
    try {
      const enrichedPrompt = `
        İSTENEN ANİMASYON İÇERİĞİ:
        ${prompt}

        ÖĞRENCİ NÖRO-PROFİLİ:
        - Profil Tipi: ${neuroProfile.profileType}
        - Yaş Grubu: ${neuroProfile.ageGroup}
        - Okuma Hızı: ${neuroProfile.readingSpeed || 'Bilinmiyor'}
        - Dikkat Süresi (Saniye): ${neuroProfile.attentionSpan || 'Bilinmiyor'}

        LÜTFEN BU VERİLERE DAYANARAK RETENTION (AKILDA KALMA) ODAKLI BİR TIMELINE JSON'I ÜRET.
      `;

      // geminiClient üzerinden (Proxy -> JSON Repair -> Doğrudan Json Objesi)
      const data = await generateWithSchema(enrichedPrompt, GEMINI_ANIMATION_SCHEMA);

      // Veriyi direkt döndürüyoruz çünkü geminiClient repair ve parse işlemlerini arka planda hallediyor.
      // Dışarıdan component tarafına giderken Zod parse (schemas.ts içinden) kullanılabilir.
      return data as AnimationPayloadType;
    } catch (error: any) {
      console.error('AnimationService Hatası:', error);
      throw new AppError(
        'Animasyon senaryosu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
        'ANIMATION_GENERATION_FAILED',
        500
      );
    }
  }
}
