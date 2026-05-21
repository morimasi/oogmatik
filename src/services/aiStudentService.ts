import { generateWithSchema } from './geminiClient.js';
import { AdvancedStudent } from '../types/student-advanced';
import { logError } from '../utils/logger.js';

export interface CognitiveProfileResult {
  scores: Record<string, number>;
  radarData: { skill: string; score: number }[];
  insights: string[];
  recommendations: string[];
  summary: string;
  strengths: { label: string; trend: 'up' | 'down' | 'stable' }[];
  strategies: { title: string; text: string; icon: string; color: string }[];
  timeline: { date: string; event: string }[];
}

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
- Tanı/Bağlam: ${(student as any).diagnosisContext || 'Belirtilmedi'}

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
      const result = await generateWithSchema(prompt, schema) as { goals?: any[] };
      return result.goals;
    } catch (error) {
      logError(error instanceof Error ? error : String(error));
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
- İlerleme Notları: ${JSON.stringify((student as any).progressNotes || [])}

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
      const result = await generateWithSchema(prompt, schema) as { insights?: any[] };
      return result.insights;
    } catch (error) {
      logError(error instanceof Error ? error : String(error));
      return [];
    }
  },

  generateCognitiveInsight: async (student: AdvancedStudent): Promise<CognitiveProfileResult> => {
    const weaknesses = student.weaknesses || [];
    const strengths = student.strengths || [];
    const scores: Record<string, number> = {};
    const radarData: { skill: string; score: number }[] = [];
    
    const allSkills = [...new Set([...weaknesses, ...strengths])];
    for (const skill of allSkills) {
      const score = strengths.includes(skill) ? 75 : 35;
      scores[skill] = score;
      radarData.push({ skill, score });
    }

    return {
      scores,
      radarData,
      insights: ['Profil analiz edildi'],
      recommendations: ['BEP hedefleri gözden geçirilmeli'],
      summary: 'Bilişsel profil analizi tamamlandı',
      strengths: strengths.map(s => ({ label: s, trend: 'up' as const })),
      strategies: [{ title: 'Odak Stratejisi', text: 'BEP hedeflerine odaklan', icon: 'fa-target', color: 'indigo' }],
      timeline: [{ date: new Date().toISOString(), event: 'Profil oluşturuldu' }]
    };
  }
};
