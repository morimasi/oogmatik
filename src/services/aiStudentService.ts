import { generateWithSchema } from './geminiClient.js';
import { AdvancedStudent } from '../types/student-advanced';
import { logError } from '../utils/logger.js';

export const aiStudentService = {
  /**
   * Generates IEP goals based on student profile and weaknesses
   */
  generateIEPGoals: async (student: AdvancedStudent) => {
    const prompt = `
[ROL: Uzman Özel Eğitim Koordinatörü ve Nöro-Pedagog]

GÖREV: Aşağıdaki öğrenci profiline uygun, SMART (Specific, Measurable, Achievable, Relevant, Time-bound) kriterlerine göre 3 adet Bireyselleştirilmiş Eğitim Planı (BEP) hedefi üret.

ÖĞRENCİ PROFİLİ:
- İsim: ${student.name}
- Sınıf: ${student.grade}
- Yaş: ${student.age}
- Zayıf Alanlar: ${student.weaknesses?.join(', ') || 'Belirtilmedi'}
- Güçlü Alanlar: ${student.strengths?.join(', ') || 'Belirtilmedi'}
- Tanı/Bağlam: ${student.diagnosisContext || 'Belirtilmedi'}

İSTENEN ÇIKTI FORMATI (JSON):
{
  "goals": [
    {
      "title": "Hedef Başlığı (Kısa ve öz)",
      "description": "Hedefin detaylı açıklaması ve başarı kriterleri",
      "category": "academic | behavioral | social | motor",
      "priority": "high | medium | low",
      "targetDate": "YYYY-MM-DD (Gelecek bir tarih)",
      "strategies": ["Strateji 1", "Strateji 2"]
    }
  ]
}

UYARI:
- Hedefler öğrencinin zayıf alanlarını doğrudan desteklemeli.
- Güçlü alanları ise öğrenme sürecinde kaldıraç olarak kullanmalı.
- Sadece JSON döndür.
`;

    const schema = {
      type: 'OBJECT',
      properties: {
        goals: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              title: { type: 'STRING' },
              description: { type: 'STRING' },
              category: { type: 'STRING', enum: ['academic', 'behavioral', 'social', 'motor'] },
              priority: { type: 'STRING', enum: ['high', 'medium', 'low'] },
              targetDate: { type: 'STRING' },
              strategies: { type: 'ARRAY', items: { type: 'STRING' } }
            },
            required: ['title', 'description', 'category', 'priority', 'targetDate']
          }
        }
      },
      required: ['goals']
    };

    try {
      const result = await generateWithSchema(prompt, schema);
      return result.goals;
    } catch (error) {
      logError('AI IEP Goals Error:', error);
      throw error;
    }
  },

  /**
   * Generates AI insights and cognitive profile analysis
   */
  generateNeuroInsights: async (student: AdvancedStudent) => {
    const prompt = `
[ROL: Klinik Psikolog ve Öğrenme Bilimci]

GÖREV: Aşağıdaki öğrenci verilerine dayanarak bilişsel profil analizi ve nöro-pedagojik içgörüler üret.

ÖĞRENCİ VERİLERİ:
- Zayıf Alanlar: ${student.weaknesses?.join(', ') || 'Belirtilmedi'}
- Güçlü Alanlar: ${student.strengths?.join(', ') || 'Belirtilmedi'}
- İlerleme Notları: ${JSON.stringify(student.progressNotes || [])}

İSTENEN ÇIKTI FORMATI (JSON):
{
  "insights": [
    {
      "type": "strength | weakness | opportunity",
      "category": "cognitive | academic | emotional",
      "title": "İçgörü Başlığı",
      "description": "Detaylı analiz ve öneri",
      "confidence": 0-100
    }
  ]
}
`;

    const schema = {
      type: 'OBJECT',
      properties: {
        insights: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              type: { type: 'STRING' },
              category: { type: 'STRING' },
              title: { type: 'STRING' },
              description: { type: 'STRING' },
              confidence: { type: 'NUMBER' }
            },
            required: ['type', 'category', 'title', 'description', 'confidence']
          }
        }
      },
      required: ['insights']
    };

    try {
      const result = await generateWithSchema(prompt, schema);
      return result.insights;
    } catch (error) {
      logError('AI Neuro Insights Error:', error);
      return [];
    }
  }
};
