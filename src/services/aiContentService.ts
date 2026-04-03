import { generateWithSchema } from './geminiClient.js';
import { ActivityType, SingleWorksheetData, AssessmentReport } from '../types.js';
import { cacheService } from './cacheService.js';
import { adaptiveLearningService } from './adaptiveLearningService.js';

/**
 * AI-Powered Content Generation Service
 * Automatically generates worksheet content (questions, exercises, etc.) using AI
 */
export const aiContentService = {
  /**
   * Generate AI-powered content for a specific activity type
   * @param activityType The type of activity to generate content for
   * @param options Generation options (difficulty, count, etc.)
   * @param studentProfile Optional student profile for personalization
   * @returns Promise with generated content
   */
  generateContent: async (
    activityType: ActivityType,
    options: {
      difficulty?: 'Başlangıç' | 'Orta' | 'Zor' | 'Uzman';
      questionCount?: number;
      focusAreas?: string[];
      theme?: string;
      historicalReports?: AssessmentReport[]; // Adaptif öğrenme için eklendi
      useAdaptiveDifficulty?: boolean; // Adaptif öğrenme açık mı?
    },
    studentProfile?: { name?: string; age: number; grade: string; weaknesses?: string[]; strengths?: string[] }
  ) => {
    // Get activity title for context
    const activities: Record<string, string> = {
      [ActivityType.FIND_LETTER_PAIR]: 'Harf İkilisi Dedektifi',
      [ActivityType.READING_SUDOKU]: 'Dil ve Mantık Sudokusu',
      [ActivityType.SYLLABLE_MASTER_LAB]: 'Hece Ustası Laboratuvarı',
      [ActivityType.READING_STROOP]: 'Sözel Stroop Testi',
      [ActivityType.FAMILY_RELATIONS]: 'Akrabalık İlişkileri',
      [ActivityType.FAMILY_LOGIC_TEST]: 'Akrabalık Mantık Testi',
      [ActivityType.SYNONYM_ANTONYM_MATCH]: 'Eş ve Zıt Anlamlılar',
      [ActivityType.LETTER_VISUAL_MATCHING]: 'Harf-Görsel Eşleme',
      [ActivityType.SYLLABLE_WORD_BUILDER]: 'Hece Dedektifi',
      [ActivityType.MAP_INSTRUCTION]: 'Harita Dedektifi',
      [ActivityType.ALGORITHM_GENERATOR]: 'Algoritma Üretici',
      [ActivityType.HIDDEN_PASSWORD_GRID]: 'Gizli Şifre Matrisi',
      [ActivityType.NUMBER_LOGIC_RIDDLES]: 'Sayısal Mantık Bilmeceleri',
      [ActivityType.MATH_PUZZLE]: 'Matematik Bulmacaları',
      [ActivityType.CLOCK_READING]: 'Saat Okuma',
      [ActivityType.MONEY_COUNTING]: 'Paralarımız',
      [ActivityType.MATH_MEMORY_CARDS]: 'Matematik Hafıza Kartları',
      [ActivityType.FIND_THE_DIFFERENCE]: 'Farkı Bul',
      [ActivityType.VISUAL_ODD_ONE_OUT]: 'Görsel Farklıyı Bul',
      [ActivityType.GRID_DRAWING]: 'Kare Kopyalama',
      [ActivityType.SYMMETRY_DRAWING]: 'Simetri Tamamlama',
      [ActivityType.WORD_SEARCH]: 'Kelime Bulmaca',
      [ActivityType.SHAPE_COUNTING]: 'Kaç Tane Üçgen Var?',
      [ActivityType.MORPHOLOGY_MATRIX]: 'Morfolojik Kelime İnşaatı',
      [ActivityType.READING_PYRAMID]: 'Akıcı Okuma Piramidi',
      [ActivityType.NUMBER_PATH_LOGIC]: 'Sembolik İşlem Zinciri',
      [ActivityType.DIRECTIONAL_TRACKING]: 'Yönsel İz Sürme (Kod Çözme)',
      [ActivityType.ABC_CONNECT]: 'ABC Bağlama (Romenler)',
      [ActivityType.ODD_EVEN_SUDOKU]: 'Tek ve Çift Sudoku',
      [ActivityType.FUTOSHIKI]: 'Futoşhiki',
      [ActivityType.MAGIC_PYRAMID]: 'Sihirli Piramit',
      [ActivityType.CAPSULE_GAME]: 'Kapsül Oyunu',
      [ActivityType.FIVE_W_ONE_H]: '5N1K Okuma Anlama Simülatörü',
      [ActivityType.COLORFUL_SYLLABLE_READING]: 'Renkli Hece / Odaklı Okuma',
      [ActivityType.FAMILY_TREE_MATRIX]: 'Akrabalık ve Soy Ağacı Matrisi',
      [ActivityType.APARTMENT_LOGIC_PUZZLE]: 'Nerede Oturuyor? (Einstein Apartmanı)',
      [ActivityType.FINANCIAL_MARKET_CALCULATOR]: 'Pazar Yeri & Finans',
      [ActivityType.DIRECTIONAL_CODE_READING]: 'Şifreli Kod & Rota',
      [ActivityType.LOGIC_ERROR_HUNTER]: 'Mantık Hataları Avcısı',
      [ActivityType.PATTERN_COMPLETION]: 'Kafayı Çalıştır (Desen Tamamla)',
      [ActivityType.VISUAL_INTERPRETATION]: 'Resim Yorumlama ve Analiz',
      [ActivityType.BRAIN_TEASERS]: 'Kafayı Çalıştır (Zeka Oyunları)',
      [ActivityType.BOX_MATH]: 'Kutularla Matematik',
    };

    const activityTitle = activities[activityType] || 'Bilinmeyen Etkinlik';

    try {
      // Set defaults
      let difficulty = options.difficulty || 'Orta';
      const questionCount = options.questionCount || 10;
      let focusAreas = options.focusAreas || [];
      const theme = options.theme || 'Genel';
      let pedagogicalRecommendation = '';

      // ADAPTİF ÖĞRENME MÜDAHALESİ (FAZ 4)
      if (options.useAdaptiveDifficulty && options.historicalReports) {
        const adaptiveProfile = adaptiveLearningService.analyzePerformanceHistory(options.historicalReports, studentProfile as any);
        difficulty = adaptiveProfile.suggestedDifficulty;
        if (adaptiveProfile.dynamicFocusAreas.length > 0) {
          // Mevcut odak alanlarıyla birleştir
          focusAreas = [...new Set([...focusAreas, ...adaptiveProfile.dynamicFocusAreas])];
        }
        // AI'a verilecek ekstra pedogojik içgörü notu
        if (adaptiveProfile.performanceScore < 60) {
           pedagogicalRecommendation = `\nÖNEMLİ NOT: Bu öğrencinin geçmiş performansı düşük (${adaptiveProfile.performanceScore}/100). Lütfen soruları ekstra kolay, görsel olarak daha aralıklı ve adım adım yönergeli kurgula. Çeldiricileri azalt.`;
        }
      }

      // Create student context
      const studentContext = studentProfile
        ? `Öğrenci Profili: Yaş ${studentProfile.age}, Sınıf ${studentProfile.grade}, 
           Zayıflıklar: ${studentProfile.weaknesses?.join(', ') || 'Belirtilmedi'}, 
           Güçlü Yönler: ${studentProfile.strengths?.join(', ') || 'Belirtilmedi'}`
        : 'Öğrenci profili belirtilmemiş, genel içerik üretilecek.';

      const prompt = `
[ROL: Uzman Eğitim İçerik Geliştirici ve Disleksi Uzmanı]

GÖREV: ${activityTitle} etkinliği türü için disleksi dostu, eğitimsel olarak etkili ve yaşına uygun alıştırmalar, sorular ve içerik üret.

${studentContext}
İstenen Özellikler:
- Zorluk Seviyesi: ${difficulty}
- Soru/Alıştırma Sayısı: ${questionCount}
- Odak Alanları: ${focusAreas.length > 0 ? focusAreas.join(', ') : 'Belirtilmedi'}
- Tema: ${theme}${pedagogicalRecommendation}

İSTENEN ÇIKTI:
${questionCount} adet disleksi dostu alıştırma/soru (aktivite tipine göre uygun formatta)
Her öğe için:
- İçerik/metin (aktiviteye göre uygun)
- Görsel açıklama (varsa)
- Cevap anahtarı (aktiviteye göre uygun)
- Öğretmen notları
- Zorluk işareti (kolay/orta/zor)

ÇIKTI FORMATI (JSON):
{
  "content": [
    {
      "id": "unique-id-1",
      "type": "exercise/question/image/etc",
      "content": "Alıştırma veya soru içeriği",
      "visualDescription": "Görsel açıklama (varsa)",
      "answerKey": "Cevap veya çözüm",
      "difficulty": "Kolay/Orta/Zor",
      "teacherNotes": "Öğretmenler için notlar ve ipuçları",
      "focusArea": "odak-alani"
    }
  ]
}

UYARI: 
- Sadece disleksi dostu içerik üret (net talimatlar, yüksek kontrast, minimale görsel yük)
- Yaş ve sınıf seviyesine uygun dil kullan
- Karmaşık yönergelerden kaçın, basit ve net talimatlar ver
- Görsel öğeler kullanılıyorsa, disleksi dostu olacak şekilde tasarla
- JSON formatında sadece geçerli veri döndür, ek açıklama verme
`;

      const schema = {
        type: 'OBJECT',
        properties: {
          content: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                id: { type: 'STRING' },
                type: { type: 'STRING' },
                content: { type: 'STRING' },
                visualDescription: { type: 'STRING' },
                answerKey: { type: 'STRING' },
                difficulty: { type: 'STRING' },
                teacherNotes: { type: 'STRING' },
                focusArea: { type: 'STRING' },
              },
              required: [
                'id',
                'type',
                'content',
                'answerKey',
                'difficulty',
                'teacherNotes',
                'focusArea',
              ],
            },
          },
        },
        required: ['content'],
      };

      const result = await generateWithSchema(prompt, schema);
      return result.content as Array<SingleWorksheetData>;
    } catch (error) {
      console.error('AI content generation error:', error);
      // Fallback to basic content generation
      const fallbackContent: Array<SingleWorksheetData> = [];
      for (let i = 1; i <= (options.questionCount || 10); i++) {
        fallbackContent.push({
          id: `content-${activityType}-${i}`,
          title: `${activityTitle} Alıştırma ${i}`,
          instruction: `Bu alıştırma ${activityTitle} becerilerinizi geliştirmek için tasarlanmıştır.`,
          sections: [
            {
              type: 'instruction',
              content: `Bu alıştırma ${activityTitle} becerilerinizi geliştirmek için tasarlanmıştır.`,
            },
          ],
        } as any);
      }
      return fallbackContent;
    }
  },

  /**
   * FAZ 3: Batch İşleme (5'li Gruplar)
   * Limit aşımı olan büyük isteklerde sistemi yormamak için görevleri 5'li gruplara böler ve önbellekleme yapar.
   */
  batchGenerateContent: async (
    activityType: ActivityType,
    totalItems: number,
    options: {
      difficulty?: 'Başlangıç' | 'Orta' | 'Zor' | 'Uzman';
      focusAreas?: string[];
      theme?: string;
      historicalReports?: AssessmentReport[];
      useAdaptiveDifficulty?: boolean;
    },
    studentProfile?: { name?: string; age: number; grade: string; weaknesses?: string[]; strengths?: string[] }
  ): Promise<SingleWorksheetData[]> => {
    const BATCH_SIZE = 5;
    const allContent: SingleWorksheetData[] = [];
    const cacheKeyBase = `batch-${activityType}-${options.difficulty || 'Orta'}-${options.theme || 'Genel'}`;

    let remaining = totalItems;
    let batchIndex = 0;

    while (remaining > 0) {
      const currentBatchCount = Math.min(remaining, BATCH_SIZE);
      const cacheKey = `${cacheKeyBase}-part-${batchIndex}`;
      
      // Önce cache kontrolü
      const cached = await cacheService.get(cacheKey);
      if (cached && Array.isArray(cached) && cached.length === currentBatchCount) {
        allContent.push(...(cached as SingleWorksheetData[]));
      } else {
        // Yoksa AI ile generate et
        const batchOptions = { ...options, questionCount: currentBatchCount };
        const result = await aiContentService.generateContent(activityType, batchOptions, studentProfile);
        
        allContent.push(...result);
        
        if (result.length > 0) {
          // Cache'e yaz
          await cacheService.set(cacheKey, result);
        }
      }
      
      remaining -= currentBatchCount;
      batchIndex++;
    }

    return allContent;
  },
};
