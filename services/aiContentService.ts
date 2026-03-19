<<<<<<< HEAD
import { generateWithSchema } from './geminiClient.js';
import { ActivityType, SingleWorksheetData } from '../types.js';
=======
import { generateWithSchema } from './geminiClient';
import { Type } from '@google/genai';
import { ActivityType, SingleWorksheetData } from '../types';
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060

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
    },
    studentProfile?: { age: number; grade: string; weaknesses?: string[]; strengths?: string[] }
  ) => {
<<<<<<< HEAD
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
=======
    try {
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

>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
      // Set defaults
      const difficulty = options.difficulty || 'Orta';
      const questionCount = options.questionCount || 10;
      const focusAreas = options.focusAreas || [];
      const theme = options.theme || 'Genel';

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
- Tema: ${theme}

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
<<<<<<< HEAD
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
=======
        type: Type.OBJECT,
        properties: {
          content: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                content: { type: Type.STRING },
                visualDescription: { type: Type.STRING },
                answerKey: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                teacherNotes: { type: Type.STRING },
                focusArea: { type: Type.STRING },
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
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
<<<<<<< HEAD
          instruction: `Bu alıştırma ${activityTitle} becerilerinizi geliştirmek için tasarlanmıştır.`,
=======
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
          sections: [
            {
              type: 'instruction',
              content: `Bu alıştırma ${activityTitle} becerilerinizi geliştirmek için tasarlanmıştır.`,
            },
          ],
<<<<<<< HEAD
        } as any);
=======
        });
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
      }
      return fallbackContent;
    }
  },
};
