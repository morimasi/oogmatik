/**
 * AI Üretim Servisi - V3 Prompt Engineering Engine
 * 
 * FAZ 3'ün tüm bileşenlerini birleştirerek production-ready AI içerik üretimi sağlar.
 * Gemini 2.0 Flash entegrasyonu ile multimodal desteği sunar.
 */

import { GradeLevel, Objective, DifficultyLevel, TargetAudience, EngineMode } from '@/modules/super-turkce/core/types';
import { ActivityFormatDef } from '@/modules/super-turkce/core/types/activity-formats';
import { AtomicPromptBuilder, QuestionQualityAnalyzer, PedagogicalAuditor } from './PromptEngine';
import { generateCreativeMultimodal } from '@/services/geminiClient';

/**
 * Multimodal Dosya Yapısı
 */
export interface MultimodalFile {
  data: string;
  mimeType: string;
}

/**
 * AI Üretim Sonucu
 */
export interface AIProductionResult {
  success: boolean;
  data?: any;
  metrics?: any;
  auditReport?: any;
  error?: string;
}

/**
 * Production Config
 */
export interface ProductionConfig {
  enableAudit: boolean;
  enableMetrics: boolean;
  minQualityScore: number;
  maxRetries: number;
  timeoutMs: number;
}

const DEFAULT_CONFIG: ProductionConfig = {
  enableAudit: true,
  enableMetrics: true,
  minQualityScore: 70,
  maxRetries: 2,
  timeoutMs: 45000, // Multimodal üretimi için 45 saniye
};

/**
 * AI Production Service
 */
export class AIProductionService {
  private config: ProductionConfig;

  constructor(config: Partial<ProductionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Ana üretim fonksiyonu
   */
  async generateContent(
    format: ActivityFormatDef,
    grade: GradeLevel,
    objective: Objective,
    difficulty: DifficultyLevel,
    audience: TargetAudience,
    settings: Record<string, any>,
    mode: EngineMode = 'ai',
    files?: MultimodalFile[]
  ): Promise<AIProductionResult> {
    try {
      // 1. Atomic Prompt Oluşturma
      const promptBuilder = new AtomicPromptBuilder(
        grade,
        objective,
        difficulty,
        audience,
        format.id,
        settings
      );

      const systemInstruction = promptBuilder.buildSystemInstruction();
      const prompt = promptBuilder.buildPrompt(format);

      console.log('📝 Generated Atomic Prompt (Multimodal Support Ready)');

      // 2. API Çağrısı (Hızlı mod veya gerçek AI)
      let rawData: any;

      if (mode === 'fast') {
        rawData = await this.fastGenerate(format, grade, objective, settings);
      } else {
        rawData = await this.aiGenerate(prompt, systemInstruction, this.config.timeoutMs, files);
      }

      if (!rawData) {
        throw new Error('AI içeriği üretilemedi.');
      }

      // 3. Kalite Metrikleri
      let metrics = null;
      if (this.config.enableMetrics && rawData.questions) {
        metrics = rawData.questions.map((q: any) =>
          QuestionQualityAnalyzer.analyzeQuestion(q, grade, difficulty)
        );
      }

      // 4. Pedagojik Denetim
      let auditReport = null;
      if (this.config.enableAudit) {
        auditReport = PedagogicalAuditor.auditContent(rawData, grade, objective, audience);

        if (auditReport.score < this.config.minQualityScore) {
          console.warn(`⚠️ Kalite skoru düşük (${auditReport.score}). Yeniden deneme başlatılıyor...`);

          if (this.config.maxRetries > 0) {
            return this.retryWithFeedback(
              format, grade, objective, difficulty, audience, settings, mode,
              auditReport.issues, files
            );
          }
        }
      }

      return {
        success: true,
        data: rawData,
        metrics,
        auditReport,
      };

    } catch (error: any) {
      console.error('❌ AI Production Error:', error);
      return {
        success: false,
        error: error.message || 'Bilinmeyen bir hata oluştu.',
      };
    }
  }

  /**
   * Hızlı Mod Üretimi (Algoritmik / Mock)
   */
  private async fastGenerate(
    format: ActivityFormatDef,
    grade: GradeLevel,
    objective: Objective,
    settings: Record<string, any>
  ): Promise<any> {
    if (format.fastGenerate) {
      return format.fastGenerate(settings, grade, objective.title);
    }

    // [KRİTİK]: Hızlı modda placeholder içeriklerin kalitesini artırıyoruz.
    // "Seçenek A" gibi boş ifadeler yerine konuya vurgu yapıyoruz.
    return {
      title: `${objective.title} Değerlendirme`,
      learningObjective: objective.id,
      questions: Array(settings.questionCount || 5).fill(null).map((_, i) => ({
        id: i + 1,
        question: `[HIZLI MOD]: ${objective.title} konusuyla ilgili ${i + 1}. değerlendirme sorusu hazırlık aşamasında. (Lütfen gerçek içerik için AI Modunu seçiniz)`,
        options: [
          `${objective.title} Örnek Uygulama A`,
          `${objective.title} Örnek Uygulama B`,
          `${objective.title} Örnek Uygulama C`,
          `${objective.title} Örnek Uygulama D`
        ],
        correctAnswer: 0,
      })),
    };
  }

  /**
   * AI Üretimi (Gemini 2.0 Flash - Ultra Optimized)
   */
  private async aiGenerate(
    prompt: string,
    systemInstruction: any,
    timeoutMs: number,
    files?: MultimodalFile[]
  ): Promise<any> {
    console.log('🤖 Gemini 2.0 Flash Multimodal API çağrılıyor (V3 Engine)...');

    // Sistem talimatını daha agresif ve net hale getiriyoruz
    const enrichedSystemInstruction = `
      Sen ultra-profesyonel bir Süper Türkçe Eğitim Materyali Üretim Uzmanısın.
      Gemini 2.0 Flash mimarisini kullanarak %100 pedagojik, kültürel hassasiyeti yüksek ve hatasız içerik üretirsin.
      
      KRİTİK KURALLAR:
      1. Çıktı kesinlikle geçerli bir JSON olmalıdır.
      2. Dil bilgisi ve yazım kuralları TDK ile tam uyumlu olmalıdır.
      3. Disleksi hassasiyetini (basit cümleler, net açıklamalar) asla ihmal etme.
      4. Multimodal veri (resim/dosya) varsa, içeriği bu verilere dayalı ve anlamlı kur.
      5. Öğrencinin sınıf seviyesine (${systemInstruction.grade || 'belirtilen'} .sınıf) tam uygun dil kullan.

      TEKNİK ŞABLON:
      ${typeof systemInstruction === 'string' ? systemInstruction : JSON.stringify(systemInstruction)}
    `;

    try {
      const response = await generateCreativeMultimodal({
        prompt,
        systemInstruction: enrichedSystemInstruction,
        files,
        temperature: 0.1, // Daha stabil ve tutarlı çıktılar için düşürüldü
        model: 'gemini-1.5-flash-latest'
      });

      if (!response) throw new Error('API yanıtı boş döndü.');

      // JSON güvenliğini kontrol et (Gerekirse Parse temizliği yap)
      return typeof response === 'string' ? JSON.parse(response.replace(/```json|```/g, '')) : response;
    } catch (error: any) {
      console.error('❌ Gemini 2.0 Flash Hatası:', error);
      throw error;
    }
  }

  /**
   * Geri Bildirim ile Yeniden Deneme
   */
  private async retryWithFeedback(
    format: ActivityFormatDef,
    grade: GradeLevel,
    objective: Objective,
    difficulty: DifficultyLevel,
    audience: TargetAudience,
    settings: Record<string, any>,
    mode: EngineMode,
    issues: any[],
    files?: MultimodalFile[]
  ): Promise<AIProductionResult> {
    const enhancedSettings = {
      ...settings,
      _feedbackIssues: issues,
    };

    const retryConfig = { ...this.config, maxRetries: this.config.maxRetries - 1 };
    const retryService = new AIProductionService(retryConfig);

    return retryService.generateContent(
      format, grade, objective, difficulty, audience, enhancedSettings, mode, files
    );
  }

  /**
   * Batch Üretim
   */
  async generateBatch(
    formats: ActivityFormatDef[],
    grade: GradeLevel,
    objective: Objective,
    difficulty: DifficultyLevel,
    audience: TargetAudience,
    settings: Record<string, any>,
    mode: EngineMode = 'ai'
  ): Promise<AIProductionResult[]> {
    return Promise.all(
      formats.map(format =>
        this.generateContent(format, grade, objective, difficulty, audience, settings, mode)
      )
    );
  }

  /**
   * İstatistikler
   */
  getProductionStats(results: AIProductionResult[]) {
    const total = results.length;
    const successful = results.filter(r => r.success).length;
    return {
      total,
      successful,
      failed: total - successful,
      successRate: Math.round((successful / total) * 100),
    };
  }
}

export const aiProductionService = new AIProductionService();
export default AIProductionService;
