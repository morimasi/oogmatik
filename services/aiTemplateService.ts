<<<<<<< HEAD
import { generateWithSchema } from './geminiClient.js';
import { ActivityType } from '../types.js';
=======
import { generateWithSchema } from './geminiClient';
import { Type } from '@google/genai';
import { ActivityType } from '../types';
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060

/**
 * AI-Powered Template Suggestions Service
 * Generates optimized worksheet templates based on activity type and student profile
 */
export const aiTemplateService = {
  /**
   * Get AI-generated template suggestions for a specific activity type
   * @param activityType The type of activity to generate templates for
   * @param studentProfile Optional student profile for personalization
   * @param difficulty Optional difficulty level
   * @returns Promise with template suggestions
   */
  getTemplateSuggestions: async (
    activityType: ActivityType,
    studentProfile?: { age: number; grade: string; weaknesses?: string[]; strengths?: string[] },
    difficulty?: 'Başlangıç' | 'Orta' | 'Zor' | 'Uzman'
  ) => {
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

      // Create student context
      const studentContext = studentProfile
        ? `Öğrenci Profili: Yaş ${studentProfile.age}, Sınıf ${studentProfile.grade}, 
           Zayıflıklar: ${studentProfile.weaknesses?.join(', ') || 'Belirtilmedi'}, 
           Güçlü Yönler: ${studentProfile.strengths?.join(', ') || 'Belirtilmedi'}`
        : 'Öğrenci profili belirtilmemiş, genel öneriler sunulacak.';

      const difficultyContext = difficulty
        ? `İstenen Zorluk Seviyesi: ${difficulty}`
        : 'Zorluk seviyesi belirtilmemiş, tüm seviyeler için öneriler sunulacak.';

      const prompt = `
[ROL: Uzman Öğretim Tasarımcı ve Disleksi Uzmanı]

GÖREV: ${activityTitle} etkinliği türü için disleksi dostu, pedagogik olarak etkili ve görsel olarak çekişmiş worksheet şablon önerileri üret.

${studentContext}
${difficultyContext}

İSTENEN ÇIKTI:
1. 3 farklı worksheet şablon önerisi (her biri farklı yaklaşımlarla)
2. Her şablon için:
   - Başlık ve kısa açıklama
   - Önerilen düzen ve yapı (sütun sayısı, boşluklar vb.)
   - Öğrenme odak noktası
   - Disleksi dostu özellikler (font önerileri, renk kontrastları vb.)
   - Zorluk seviyesi ayarlama önerileri
   - Öğretmen notları ve uygulama ipuçları

ÇIKTI FORMATI (JSON):
{
  "templates": [
    {
      "id": "unique-id-1",
      "title": "Şablon Başlığı",
      "description": "Şablonun kısa açıklaması",
      "layout": {
        "columns": 1-4,
        "spacing": "normal/wide",
        "fontSize": 14-24,
        "orientation": "portrait/landscape"
      },
      "focusAreas": ["odak1", "odak2"],
      "dyslexiaFriendly": {
        "font": "Lexend/OpenDyslexic/Inter/Comic Neue",
        "colorContrast": "high/medium",
        "visualClutter": "low/medium/high"
      },
      "difficulty": "Başlangıç/Orta/Zor/Uzman",
      "teacherNotes": "Öğretmenler için uygulama notları ve ipuçları"
    }
  ]
}

UYARI: 
- Sadece disleksi dostu tasarım ilkelerine uygun öneriler sun
- Görsel yüklü değil, odak odaklı tasarımlar öncelikli
- Net talimatlar ve minimale metin kullan
- Renk kullanımında uygun kontrast sağla
- Yazı tipleri disleksi dostu olmalı
- JSON formatında sadece geçerli veri döndür, ek açıklama verme
`;

      const schema = {
<<<<<<< HEAD
        type: 'OBJECT',
        properties: {
          templates: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                id: { type: 'STRING' },
                title: { type: 'STRING' },
                description: { type: 'STRING' },
                layout: {
                  type: 'OBJECT',
                  properties: {
                    columns: { type: 'INTEGER' },
                    spacing: { type: 'STRING' },
                    fontSize: { type: 'INTEGER' },
                    orientation: { type: 'STRING' },
=======
        type: Type.OBJECT,
        properties: {
          templates: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                layout: {
                  type: Type.OBJECT,
                  properties: {
                    columns: { type: Type.INTEGER },
                    spacing: { type: Type.STRING },
                    fontSize: { type: Type.INTEGER },
                    orientation: { type: Type.STRING },
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                  },
                  required: ['columns', 'spacing', 'fontSize', 'orientation'],
                },
                focusAreas: {
<<<<<<< HEAD
                  type: 'ARRAY',
                  items: { type: 'STRING' },
                },
                dyslexiaFriendly: {
                  type: 'OBJECT',
                  properties: {
                    font: { type: 'STRING' },
                    colorContrast: { type: 'STRING' },
                    visualClutter: { type: 'STRING' },
                  },
                  required: ['font', 'colorContrast', 'visualClutter'],
                },
                difficulty: { type: 'STRING' },
                teacherNotes: { type: 'STRING' },
=======
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                dyslexiaFriendly: {
                  type: Type.OBJECT,
                  properties: {
                    font: { type: Type.STRING },
                    colorContrast: { type: Type.STRING },
                    visualClutter: { type: Type.STRING },
                  },
                  required: ['font', 'colorContrast', 'visualClutter'],
                },
                difficulty: { type: Type.STRING },
                teacherNotes: { type: Type.STRING },
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
              },
              required: [
                'id',
                'title',
                'description',
                'layout',
                'focusAreas',
                'dyslexiaFriendly',
                'difficulty',
                'teacherNotes',
              ],
            },
          },
        },
        required: ['templates'],
      };

      const result = await generateWithSchema(prompt, schema);
      return result.templates as Array<any>;
    } catch (error) {
      console.error('AI template suggestions error:', error);
      // Fallback to basic suggestions
      return [
        {
          id: `template-${activityType}-1`,
          title: `Standart ${activityType.replace(/_/g, ' ')} Şablonu`,
          description: 'Temel yapı ve disleksi dostu özelliklere sahip standart şablon',
          layout: {
            columns: 1,
            spacing: 'wide',
            fontSize: 18,
            orientation: 'portrait',
          },
          focusAreas: ['Temel Beceri Geliştirme'],
          dyslexiaFriendly: {
            font: 'Lexend',
            colorContrast: 'high',
            visualClutter: 'low',
          },
          difficulty: difficulty || 'Orta',
          teacherNotes:
            'Standart uygulama için uygun şablon. Geniş boşluklar ve yüksek kontrast kullanın.',
        },
      ];
    }
  },
};
