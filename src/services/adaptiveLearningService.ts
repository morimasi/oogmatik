import { AssessmentReport, StudentProfile } from '../types.js';
import { generateWithSchema } from './geminiClient.js';

export interface AdaptiveProfile {
  suggestedDifficulty: 'Başlangıç' | 'Orta' | 'Zor' | 'Uzman';
  dynamicFocusAreas: string[];
  performanceScore: number; // 0-100
}

export const adaptiveLearningService = {
  /**
   * Öğrencinin geçmiş Assessment Report ve skorlarını inceleyerek algoritmik bir metrik çıkarır.
   */
  analyzePerformanceHistory: (
    reports: AssessmentReport[],
    studentProfile?: StudentProfile
  ): AdaptiveProfile => {
    if (!reports || reports.length === 0) {
      return { suggestedDifficulty: 'Orta', dynamicFocusAreas: [], performanceScore: 50 };
    }

    // Basit bir örnekleme: Son 3 testin skor ortalamasını al
    const recentReports = reports.slice(0, 3);
    let totalScore = 0;
    let scoreCount = 0;
    const weaknessMap: Record<string, number> = {};

    recentReports.forEach(report => {
      if (report.scores) {
        Object.entries(report.scores).forEach(([skill, score]) => {
          totalScore += score;
          scoreCount++;
          if (score < 60) {
            weaknessMap[skill] = (weaknessMap[skill] || 0) + 1;
          }
        });
      }
    });

    const averageScore = scoreCount > 0 ? totalScore / scoreCount : 50;
    
    // Zayıflık analizi: En çok hata yapılan ilk 2 alanı focus area yap
    const dynamicFocusAreas = Object.entries(weaknessMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(entry => entry[0]);

    return {
      performanceScore: Math.round(averageScore),
      suggestedDifficulty: adaptiveLearningService.predictNextDifficulty(averageScore),
      dynamicFocusAreas,
    };
  },

  /**
   * ZPD'ye (Yakınsal Gelişim Alanı) göre zorluk atar.
   */
  predictNextDifficulty: (score: number): 'Başlangıç' | 'Orta' | 'Zor' | 'Uzman' => {
    if (score < 40) return 'Başlangıç';
    if (score < 70) return 'Orta';
    if (score < 90) return 'Zor';
    return 'Uzman';
  },

  /**
   * AI destekli pedagojik tavsiye oluşturucu.
   */
  generateTeacherRecommendations: async (
    studentProfile: StudentProfile,
    adaptiveProfile: AdaptiveProfile
  ): Promise<string> => {
    const prompt = `
      Sen bir özel eğitim uzmanısın.
      Öğrenci: ${studentProfile?.name || 'Öğrenci'} (Sınıf: ${studentProfile?.grade || 'Belirtilmedi'})
      Ortalama Başarı Skoru: ${adaptiveProfile.performanceScore}/100
      Önerilen Etkinlik Zorluğu: ${adaptiveProfile.suggestedDifficulty}
      Gelişime Açık (Zayıf) Alanlar: ${adaptiveProfile.dynamicFocusAreas.join(', ')}
      
      Yukarıdaki verilere dayanarak öğretmene 3 maddelik kısa, somut ve disleksi dostu bir pedagojik eylem planı öner. Sadece öneri metnini yaz (Yorum katma).
    `;

    const schema = {
      type: 'OBJECT',
      properties: {
        recommendationMessage: { type: 'STRING' }
      },
      required: ['recommendationMessage']
    };

    try {
      const response = await generateWithSchema(prompt, schema);
      return response.recommendationMessage || 'Öğrencinin zorlandığı alanlara odaklanan kolay seviye etkinliklerle başlayın.';
    } catch {
      return 'Öğrencinin son performansına dayanarak, yeni etkinlikleri "Kolay/Orta" zorlukta başlatmanız önerilir.';
    }
  }
};
