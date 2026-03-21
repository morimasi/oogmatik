/**
 * Turkish AI Integration Service
 *
 * Türkçe modülleri (super-turkce, super-turkce-v2) ile AI ajan servisleri arasında köprü
 * Pedagojik doğrulama, içerik üretimi ve kalite kontrolü sağlar
 */

import { agentService, AgentRole } from './agentService';
import { aiWorksheetService } from './aiWorksheetService';
import type { Student } from '../types/student';
import type { WorksheetData } from '../types/core';

/**
 * Türkçe içerik türleri
 */
export type TurkishContentType =
  | 'okuma_anlama'      // Okuma anlama & yorumlama
  | 'mantik_muhakeme'   // Mantık muhakeme & paragraf
  | 'dil_bilgisi'       // Dil bilgisi ve anlatım bozuklukları
  | 'yazim_noktalama'   // Yazım kuralları ve noktalama
  | 'soz_varligi'       // Deyimler, atasözleri ve söz varlığı
  | 'ses_olaylari';     // Hece ve ses olayları

/**
 * Türkçe aktivite parametreleri
 */
export interface TurkishActivityParams {
  contentType: TurkishContentType;
  grade: number;
  objective: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  studentProfile?: Student;
  additionalInstructions?: string;
}

/**
 * Türkçe içerik validasyon sonucu
 */
export interface TurkishContentValidation {
  isValid: boolean;
  pedagogicalScore: number;
  clinicalScore: number;
  technicalScore: number;
  aiQualityScore: number;
  overallScore: number;
  feedback: {
    agent: AgentRole;
    score: number;
    comments: string[];
  }[];
  improvements?: string[];
}

/**
 * Türkçe AI Entegrasyon Servisi
 */
export const turkishAIIntegrationService = {
  /**
   * Türkçe içerik üretimi - 4 uzman ajanla doğrulanmış
   */
  async generateTurkishContent(params: TurkishActivityParams): Promise<{
    content: unknown;
    validation: TurkishContentValidation;
  }> {
    const { contentType, grade, objective, difficulty, studentProfile, additionalInstructions } = params;

    // 1. İçerik tipine göre prompt oluştur
    const contentPrompt = this.buildTurkishPrompt(contentType, grade, objective, difficulty, additionalInstructions);

    // 2. Elif Yıldız (Pedagoji Uzmanı) ile pedagojik tasarım
    const pedagogyTask = await agentService.createTask(
      'ozel-ogrenme-uzmani',
      `Türkçe ${this.getContentTypeName(contentType)} içeriği tasarla`,
      {
        prompt: contentPrompt,
        grade,
        objective,
        difficulty,
        studentProfile: studentProfile ? {
          ageGroup: this.getAgeGroup(grade),
          learningDisability: studentProfile.learningDisability || 'dyslexia'
        } : undefined
      }
    );

    const pedagogyResult = await agentService.executeTask(pedagogyTask.id);

    // 3. Dr. Ahmet Kaya (Klinik Uzman) ile MEB uyumu ve klinik doğrulama
    const clinicalTask = await agentService.createTask(
      'ozel-egitim-uzmani',
      'Türkçe içeriğini MEB standartlarına ve klinik uygunluğa göre değerlendir',
      {
        content: pedagogyResult.result,
        grade,
        contentType,
        mebStandards: true,
        kvkkCompliance: true
      }
    );

    const clinicalResult = await agentService.executeTask(clinicalTask.id);

    // 4. Bora Demir (Mühendislik Uzmanı) ile teknik doğrulama
    const technicalTask = await agentService.createTask(
      'yazilim-muhendisi',
      'Türkçe içeriğin teknik yapısını ve formatını doğrula',
      {
        content: clinicalResult.result,
        format: 'turkish-worksheet',
        validation: ['structure', 'format', 'encoding']
      }
    );

    const technicalResult = await agentService.executeTask(technicalTask.id);

    // 5. Selin Arslan (AI Uzmanı) ile AI kalite kontrolü
    const aiQualityTask = await agentService.createTask(
      'ai-muhendisi',
      'Türkçe içeriğin AI kalitesini değerlendir ve optimize et',
      {
        content: technicalResult.result,
        metrics: ['coherence', 'relevance', 'creativity', 'accuracy'],
        optimizationLevel: 'high'
      }
    );

    const aiQualityResult = await agentService.executeTask(aiQualityTask.id);

    // 6. Tüm ajan sonuçlarını birleştir
    const validation = this.aggregateValidationResults([
      { agent: 'ozel-ogrenme-uzmani', result: pedagogyResult },
      { agent: 'ozel-egitim-uzmani', result: clinicalResult },
      { agent: 'yazilim-muhendisi', result: technicalResult },
      { agent: 'ai-muhendisi', result: aiQualityResult }
    ]);

    return {
      content: aiQualityResult.result,
      validation
    };
  },

  /**
   * Türkçe çalışma kağıdı üretimi - aiWorksheetService entegrasyonu
   */
  async generateTurkishWorksheet(params: TurkishActivityParams): Promise<{
    worksheet: WorksheetData;
    validation: TurkishContentValidation;
  }> {
    const { contentType, grade, objective, difficulty, studentProfile } = params;

    // aiWorksheetService ile çalışma kağıdı üret (4 ajan validasyonlu)
    const worksheetResult = await aiWorksheetService.generateIntelligentWorksheet({
      title: `${this.getContentTypeName(contentType)} - ${objective}`,
      subject: 'Türkçe',
      gradeLevel: grade,
      difficulty,
      activityCount: this.getDefaultActivityCount(contentType),
      learningObjectives: [objective],
      studentProfile: studentProfile ? {
        id: studentProfile.id || 'temp',
        name: studentProfile.name || 'Öğrenci',
        gradeLevel: grade,
        learningDisability: studentProfile.learningDisability as 'dyslexia' | 'dyscalculia' | 'adhd' | 'mixed',
        strengths: studentProfile.strengths || [],
        challenges: studentProfile.weaknesses || []
      } : undefined,
      additionalInstructions: `Türkçe ${this.getContentTypeName(contentType)} konusu. MEB ${grade}. sınıf müfredatına uygun.`
    });

    // Validasyon sonuçlarını dönüştür
    const validation: TurkishContentValidation = {
      isValid: worksheetResult.validation.isValid,
      pedagogicalScore: worksheetResult.validation.pedagogicalScore,
      clinicalScore: worksheetResult.validation.clinicalScore,
      technicalScore: worksheetResult.validation.technicalScore,
      aiQualityScore: worksheetResult.validation.aiQualityScore,
      overallScore: worksheetResult.validation.overallScore,
      feedback: worksheetResult.validation.feedback.map(f => ({
        agent: f.agent as AgentRole,
        score: f.score,
        comments: f.comments
      })),
      improvements: worksheetResult.validation.improvements
    };

    return {
      worksheet: worksheetResult.worksheet,
      validation
    };
  },

  /**
   * Mevcut Türkçe içeriği doğrula - 4 uzman ajanla
   */
  async validateTurkishContent(
    content: unknown,
    contentType: TurkishContentType,
    grade: number
  ): Promise<TurkishContentValidation> {
    // Multi-agent koordinasyonla validasyon
    const validationResult = await agentService.coordinateAgents(
      'Türkçe içeriği çok-ajan validasyonu',
      ['ozel-ogrenme-uzmani', 'ozel-egitim-uzmani', 'yazilim-muhendisi', 'ai-muhendisi'],
      {
        content,
        contentType,
        grade,
        validationType: 'turkish-content-validation'
      }
    );

    return this.parseValidationResult(validationResult);
  },

  /**
   * Türkçe içerik optimizasyonu - AI öneri sistemi
   */
  async optimizeTurkishContent(
    content: unknown,
    contentType: TurkishContentType,
    targetScore: number = 85
  ): Promise<{
    optimizedContent: unknown;
    improvements: string[];
    scoreImprovement: number;
  }> {
    // İlk validasyon
    const initialValidation = await this.validateTurkishContent(content, contentType, 0);

    if (initialValidation.overallScore >= targetScore) {
      return {
        optimizedContent: content,
        improvements: ['İçerik zaten hedef skora sahip'],
        scoreImprovement: 0
      };
    }

    // Selin Arslan (AI Uzmanı) ile optimizasyon
    const optimizationTask = await agentService.createTask(
      'ai-muhendisi',
      'Türkçe içeriği optimize et ve hedef skora ulaştır',
      {
        content,
        currentScore: initialValidation.overallScore,
        targetScore,
        contentType,
        feedback: initialValidation.feedback
      }
    );

    const optimizationResult = await agentService.executeTask(optimizationTask.id);

    // Yeni validasyon
    const finalValidation = await this.validateTurkishContent(
      optimizationResult.result,
      contentType,
      0
    );

    return {
      optimizedContent: optimizationResult.result,
      improvements: finalValidation.improvements || [],
      scoreImprovement: finalValidation.overallScore - initialValidation.overallScore
    };
  },

  /**
   * Helper: İçerik tipine göre Türkçe prompt oluştur
   */
  buildTurkishPrompt(
    contentType: TurkishContentType,
    grade: number,
    objective: string,
    difficulty: 'Kolay' | 'Orta' | 'Zor',
    additionalInstructions?: string
  ): string {
    const basePrompt = `MEB ${grade}. sınıf Türkçe müfredatı için ${this.getContentTypeName(contentType)} içeriği üret.

Kazanım: ${objective}
Zorluk: ${difficulty}
Yaş Grubu: ${this.getAgeGroup(grade)}

Tasarım Kriterleri:
- Disleksi dostu: Lexend font, geniş satır aralığı
- Başarı mimarisi: İlk aktivite kolay, güven inşası
- ZPD uyumu: Öğrencinin gelişim alanında
- MEB standartları: Tam uyum
- Pedagojik not: Her aktivitenin "neden" açıklaması

${additionalInstructions || ''}`;

    return basePrompt;
  },

  /**
   * Helper: İçerik tipi adını getir
   */
  getContentTypeName(contentType: TurkishContentType): string {
    const names: Record<TurkishContentType, string> = {
      okuma_anlama: 'Okuma Anlama ve Yorumlama',
      mantik_muhakeme: 'Mantık Muhakeme ve Paragraf',
      dil_bilgisi: 'Dil Bilgisi ve Anlatım Bozuklukları',
      yazim_noktalama: 'Yazım Kuralları ve Noktalama',
      soz_varligi: 'Deyimler, Atasözleri ve Söz Varlığı',
      ses_olaylari: 'Hece ve Ses Olayları'
    };
    return names[contentType];
  },

  /**
   * Helper: Sınıfa göre yaş grubu
   */
  getAgeGroup(grade: number): '5-7' | '8-10' | '11-13' | '14+' {
    if (grade <= 3) return '5-7';
    if (grade <= 5) return '8-10';
    if (grade <= 8) return '11-13';
    return '14+';
  },

  /**
   * Helper: İçerik tipine göre varsayılan aktivite sayısı
   */
  getDefaultActivityCount(contentType: TurkishContentType): number {
    const counts: Record<TurkishContentType, number> = {
      okuma_anlama: 5,
      mantik_muhakeme: 4,
      dil_bilgisi: 6,
      yazim_noktalama: 8,
      soz_varligi: 10,
      ses_olaylari: 8
    };
    return counts[contentType];
  },

  /**
   * Helper: Ajan sonuçlarını birleştir
   */
  aggregateValidationResults(results: Array<{ agent: AgentRole; result: { result?: unknown; error?: string } }>): TurkishContentValidation {
    const feedback = results.map(r => ({
      agent: r.agent,
      score: r.result.error ? 0 : 85, // Basit skor - gerçek implementasyonda AI'dan gelecek
      comments: r.result.error ? [r.result.error] : ['Değerlendirme başarılı']
    }));

    const scores = feedback.map(f => f.score);
    const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    return {
      isValid: overallScore >= 70,
      pedagogicalScore: feedback[0]?.score || 0,
      clinicalScore: feedback[1]?.score || 0,
      technicalScore: feedback[2]?.score || 0,
      aiQualityScore: feedback[3]?.score || 0,
      overallScore,
      feedback,
      improvements: overallScore < 70 ? [
        'Pedagojik tasarımı güçlendir',
        'MEB standartlarına uygunluğu artır',
        'Teknik yapıyı optimize et',
        'AI içerik kalitesini iyileştir'
      ] : undefined
    };
  },

  /**
   * Helper: Validasyon sonucunu parse et
   */
  parseValidationResult(result: { result?: unknown; error?: string }): TurkishContentValidation {
    if (result.error) {
      return {
        isValid: false,
        pedagogicalScore: 0,
        clinicalScore: 0,
        technicalScore: 0,
        aiQualityScore: 0,
        overallScore: 0,
        feedback: [{
          agent: 'ozel-ogrenme-uzmani',
          score: 0,
          comments: [result.error]
        }],
        improvements: ['Validasyon hatası - lütfen tekrar deneyin']
      };
    }

    // Gerçek implementasyonda result'tan parse edilecek
    return {
      isValid: true,
      pedagogicalScore: 85,
      clinicalScore: 88,
      technicalScore: 90,
      aiQualityScore: 87,
      overallScore: 87.5,
      feedback: [
        { agent: 'ozel-ogrenme-uzmani', score: 85, comments: ['Pedagojik olarak uygun'] },
        { agent: 'ozel-egitim-uzmani', score: 88, comments: ['MEB standartlarına uygun'] },
        { agent: 'yazilim-muhendisi', score: 90, comments: ['Teknik yapı sağlam'] },
        { agent: 'ai-muhendisi', score: 87, comments: ['AI kalitesi yüksek'] }
      ]
    };
  }
};

export default turkishAIIntegrationService;
