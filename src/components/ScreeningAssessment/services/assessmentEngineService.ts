import type { ScreeningResult, EvaluationCategory } from '../../../types/screening';
import { CATEGORY_LABELS } from '../../../data/screeningQuestions';

export interface AIAnalysisResult {
  letter: string;
  actionSteps: string[];
  pedagogicalNote?: string;
  /** Güçlü yönler (opsiyonel — raporlarda gösterilir) */
  strengths?: string[];
  /** Zayıf yönler (opsiyonel — raporlarda gösterilir) */
  weaknesses?: string[];
}

export interface RecommendedActivityItem {
  activityId: string;
  title: string;
  category: EvaluationCategory;
  description: string;
  targetSkill: string;
}

export const CATEGORY_RECOMMENDED_ACTIVITIES: Record<EvaluationCategory, RecommendedActivityItem[]> = {
  reading: [
    { activityId: 'VISUAL_ODD_ONE_OUT', title: 'Farklı Olanı Bul', category: 'reading', description: 'Görsel ve fonolojik benzerlik ayrımı', targetSkill: 'Harf & Sembol Ayrımı' },
    { activityId: 'COLORFUL_SYLLABLE', title: 'Renkli Hece Treni', category: 'reading', description: 'Heceleme ve akıcı okuma desteği', targetSkill: 'Heceleme & Fonolojik Akıcılık' },
    { activityId: 'MISSING_PARTS', title: 'Eksik Parçaları Tamamla', category: 'reading', description: 'Okuduğunu anlama ve bağlam kurma', targetSkill: 'Bağlamsal Okuma' },
  ],
  writing: [
    { activityId: 'LETTER_MAZE_TEST', title: 'Harf Labirenti', category: 'writing', description: 'Motor planlama ve harf dizisi izleme', targetSkill: 'Grafomotor Beceriler' },
    { activityId: 'DIRECTIONAL_CODE_READING', title: 'Yönsel Kod Okuma', category: 'writing', description: 'Yön ve uzamsal organizasyon', targetSkill: 'Yön ve Alan Kontrolü' },
  ],
  attention: [
    { activityId: 'FIND_THE_DIFFERENCE', title: 'Farkı Bul', category: 'attention', description: 'Detay odaklanması ve seçici dikkat', targetSkill: 'Seçici & Sürdürülebilir Dikkat' },
    { activityId: 'STROOP_COLOR_TEST', title: 'Stroop Renk-Kelime Testi', category: 'attention', description: 'Bilişsel esneklik ve dürtü kontrolü', targetSkill: 'Bilişsel Ketleme' },
    { activityId: 'MATRIX_MEMORY', title: 'Matris Hafıza', category: 'attention', description: 'Görsel çalışma belleği antrenmanı', targetSkill: 'Çalışma Belleği' },
  ],
  math: [
    { activityId: 'MAGIC_PYRAMID', title: 'Sihirli Piramit', category: 'math', description: 'Sayı hissi ve akıl yürütme', targetSkill: 'Sayı Algısı & Mantık' },
    { activityId: 'FUTOSHIKI', title: 'Futoshiki', category: 'math', description: 'Büyüktür-küçüktür mantıksal sıralama', targetSkill: 'Sayısal İlişkiler' },
    { activityId: 'CLOCK_READING', title: 'Saat Okuma', category: 'math', description: 'Zaman ve açı kavrayışı', targetSkill: 'Zaman Algısı' },
  ],
  language: [
    { activityId: 'FIVE_W_ONE_H', title: '5N1K Anlama Panosu', category: 'language', description: 'Soru-cevap ve dil kavrama', targetSkill: 'Sözel Mantık & Anlama' },
    { activityId: 'SEMANTIC_LINKER', title: 'Kavram Bağlayıcı', category: 'language', description: 'Kavramlar arası anlamsal ilişki kurma', targetSkill: 'Semantik İlişkilendirme' },
  ],
  motor_spatial: [
    { activityId: 'GRID_DRAWING', title: 'Izgara Çizim & Simetri', category: 'motor_spatial', description: 'Görsel-uzamsal algı ve çizim', targetSkill: 'Görsel-Uzamsal Koordinasyon' },
    { activityId: 'MAP_DETECTIVE', title: 'Harita Dedektifi', category: 'motor_spatial', description: 'Mekansal yön bulma ve planlama', targetSkill: 'Mekansal Oryantasyon' },
  ],
};

export const assessmentEngineService = {
  buildAnalysisPrompt(result: ScreeningResult): string {
    const riskSummary = (Object.keys(result?.categoryScores || {}) as EvaluationCategory[])
      .map((cat) => {
        const data = result.categoryScores[cat];
        return `${CATEGORY_LABELS[cat]}: %${data.score} (${data.riskLabel})`;
      })
      .join('\n');

    const findings = (Object.keys(result?.categoryScores || {}) as EvaluationCategory[])
      .flatMap((cat) => result.categoryScores[cat]?.findings ?? []);

    return `
[ROL: ORDINARYÜS PEDAGOJİ & ÇOCUK GELİŞİMİ UZMANI - BDMIND PLATFORMU]
GÖREV: Aşağıdaki bilişsel tarama envanteri sonuçlarına göre ebeveyne ve öğretmene yönelik bilimsel, şefkatli, endişe azaltıcı ve güçlendirici bir pedagojik durum mektubu yaz.

KRİTİK KURALLAR:
1. KESİNLİKLE TANI KOYUCU DİL KULLANMA. "Disleksisi var", "hastadır", "bozukluk" GİBİ İFADELER KESİNLİKLE YASAKTIR.
2. Yerine: "Bilişsel destek ihtiyacı", "gelişim alanı", "öğrenme adımı", "güçlü potansiyel" ifadelerini kullan.
3. Her zaman çocuğun güçlü yönlerini öne çıkararak başla (özgüven ve güven inşası).
4. Öğretmene ve veliye evde/okulda hemen uygulanabilecek somut stratejiler ver.

ÖĞRENCİ: ${result.studentName} (${result.age} yaş, ${result.grade})
GENEL SKOR: %${result.overallScore}

ALAN PERFORMANSLARI:
${riskSummary}

BULGULAR:
${findings.join(', ') || 'Genel gelişim izlenmektedir.'}

İSTENEN ÇIKTI (JSON):
{
    "letter": "Empatik, profesyonel, çocuğun potansiyelini öne çıkaran 3 paragraflık değerlendirme mektubu.",
    "actionSteps": ["Somut ve pratik gelişim adımı 1", "Somut ve pratik gelişim adımı 2", "Somut ve pratik gelişim adımı 3"],
    "pedagogicalNote": "Öğretmen için ZPD ve bilişsel yük odaklı pedagojik not."
}`;
  },

  getAIAnalysisSchema() {
    return {
      type: 'OBJECT' as const,
      properties: {
        letter: { type: 'STRING' as const },
        actionSteps: { type: 'ARRAY' as const, items: { type: 'STRING' as const } },
        pedagogicalNote: { type: 'STRING' as const },
      },
      required: ['letter', 'actionSteps'],
    };
  },

  normalizeActionSteps(steps: unknown): string[] {
    if (!Array.isArray(steps)) return [];
    return steps.map((step: unknown) => {
      if (typeof step === 'string') return step;
      if (step !== null && typeof step === 'object') {
        const s = step as Record<string, unknown>;
        return [s.area, s.description, s.intervention].filter(Boolean).join(' - ') || String(step);
      }
      return String(step ?? '');
    });
  },

  renderActionStep(step: unknown): string {
    if (typeof step === 'string') return step;
    if (step !== null && typeof step === 'object') {
      const s = step as Record<string, unknown>;
      return [s.intervention, s.description, s.area].filter(Boolean).join(' - ') || JSON.stringify(step);
    }
    return String(step ?? '');
  },

  getRecommendedActivities(result: ScreeningResult): RecommendedActivityItem[] {
    const list: RecommendedActivityItem[] = [];
    (Object.keys(result?.categoryScores || {}) as EvaluationCategory[]).forEach((cat) => {
      const catData = result.categoryScores[cat];
      if (catData && (catData.riskLevel === 'high' || catData.riskLevel === 'moderate')) {
        const recs = CATEGORY_RECOMMENDED_ACTIVITIES[cat] || [];
        list.push(...recs);
      }
    });
    // Fallback: If all low risk, provide enrichment activities
    if (list.length === 0) {
      list.push(
        ...CATEGORY_RECOMMENDED_ACTIVITIES.reading.slice(0, 1),
        ...CATEGORY_RECOMMENDED_ACTIVITIES.math.slice(0, 1),
        ...CATEGORY_RECOMMENDED_ACTIVITIES.attention.slice(0, 1)
      );
    }
    return list;
  },
};
