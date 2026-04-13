/**
 * OOGMATIK - AI-Enhanced Worksheet Service
 * Intelligent worksheet generation with multi-agent coordination
 */

import { agentService } from './agentService.js';
import { generateWithSchema } from './geminiClient.js';
import { WorksheetData, ActivityType } from '../types/core.js';
import { Student } from '../types/student.js';
import { ValidationError } from '../utils/AppError.js';

export interface WorksheetGenerationParams {
  student: Student;
  subject: string;
  topic: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  duration: number;
  activityTypes: ActivityType[];
  learningObjectives: string[];
  adaptiveLevel?: number; // 1-5, ne kadar adaptif
}

export interface AIWorksheetValidation {
  isValid: boolean;
  pedagogicalScore: number; // 0-100
  clinicalScore: number; // 0-100
  technicalScore: number; // 0-100
  aiQualityScore: number; // 0-100
  overallScore: number; // 0-100
  issues: Array<{
    severity: 'critical' | 'warning' | 'info';
    category: 'pedagogical' | 'clinical' | 'technical' | 'ai';
    message: string;
    suggestion: string;
  }>;
  approvedBy: string[];
}

export interface SmartWorksheetSuggestion {
  title: string;
  description: string;
  estimatedDifficulty: 'Kolay' | 'Orta' | 'Zor';
  estimatedDuration: number;
  recommendedActivities: ActivityType[];
  rationale: string;
  expectedBenefits: string[];
  prerequisites: string[];
}

const VALID_DIFFICULTIES = ['Kolay', 'Orta', 'Zor'] as const;

const normalizeDifficulty = (value: unknown): 'Kolay' | 'Orta' | 'Zor' => {
  if (typeof value === 'string' && VALID_DIFFICULTIES.includes(value as 'Kolay' | 'Orta' | 'Zor')) {
    return value as 'Kolay' | 'Orta' | 'Zor';
  }

  return 'Orta';
};

const normalizeSeverity = (value: unknown): 'critical' | 'warning' | 'info' => {
  if (value === 'critical' || value === 'warning' || value === 'info') {
    return value;
  }

  return 'warning';
};

const validateWorksheetParams = (params: WorksheetGenerationParams): void => {
  if (!params.student?.id || !params.student?.name) {
    throw new ValidationError('Öğrenci bilgisi zorunludur.', { field: 'student' });
  }

  if (!params.subject?.trim() || !params.topic?.trim()) {
    throw new ValidationError('Ders ve konu zorunludur.', { field: 'subject/topic' });
  }

  if (!Array.isArray(params.activityTypes) || params.activityTypes.length === 0) {
    throw new ValidationError('En az bir aktivite tipi seçilmelidir.', { field: 'activityTypes' });
  }

  if (!Number.isFinite(params.duration) || params.duration <= 0) {
    throw new ValidationError('Süre pozitif bir sayı olmalıdır.', { field: 'duration' });
  }

  if (!Array.isArray(params.learningObjectives) || params.learningObjectives.length === 0) {
    throw new ValidationError('En az bir öğrenme hedefi gereklidir.', { field: 'learningObjectives' });
  }
};

export const aiWorksheetService = {
  /**
   * Generate AI-powered worksheet with multi-agent validation
   */
  generateIntelligentWorksheet: async (
    params: WorksheetGenerationParams
  ): Promise<{ worksheet: WorksheetData; validation: AIWorksheetValidation }> => {
    validateWorksheetParams(params);

    // Step 1: Generate base worksheet content
    const worksheetPrompt = `
[GÖREV: Zeki Çalışma Kâğıdı Üretimi]

ÖĞRENCİ PROFİLİ:
- İsim: ${params.student.name}
- Yaş: ${params.student.age}
- Öğrenme Profili: ${params.student.learningStyle}
- Güçlü Yönler: ${(params.student.strengths || []).join(', ')}
- Zayıf Yönler: ${(params.student.weaknesses || []).join(', ')}

PARAMETRELER:
- Konu: ${params.subject} - ${params.topic}
- Zorluk: ${params.difficulty}
- Süre: ${params.duration} dakika
- Aktivite Tipleri: ${params.activityTypes.join(', ')}
- Öğrenme Hedefleri: ${params.learningObjectives.join(', ')}

Yukarıdaki parametrelere göre kişiselleştirilmiş, disleksi-dostu bir çalışma kâğıdı üret.

STANDARTLAR:
✓ pedagogicalNote mutlaka ekle
✓ İlk aktivite kolay olmalı (güven inşası)
✓ Lexend font kullan
✓ Geniş satır aralığı
✓ Açık talimatlar

YANIT FORMATI (JSON):
{
  "title": "Çalışma kâğıdı başlığı",
  "description": "Kısa açıklama",
  "activities": [
    {
      "type": "activity-type",
      "title": "Aktivite başlığı",
      "instructions": "Talimatlar",
      "content": "İçerik",
      "difficulty": "Kolay | Orta | Zor",
      "estimatedTime": number
    }
  ],
  "pedagogicalNote": "Öğretmen notları ve açıklamalar",
  "materialsNeeded": ["materyal 1"],
  "adaptiveHints": ["ipucu 1"]
}`;

    const worksheet = await generateWithSchema(worksheetPrompt, {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING' },
        description: { type: 'STRING' },
        activities: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              type: { type: 'STRING' },
              title: { type: 'STRING' },
              instructions: { type: 'STRING' },
              content: { type: 'STRING' },
              difficulty: { type: 'STRING' },
              estimatedTime: { type: 'NUMBER' }
            }
          }
        },
        pedagogicalNote: { type: 'STRING' },
        materialsNeeded: { type: 'ARRAY', items: { type: 'STRING' } },
        adaptiveHints: { type: 'ARRAY', items: { type: 'STRING' } }
      },
      required: ['title', 'description', 'activities', 'pedagogicalNote']
    });

    // Step 2: Multi-agent validation
    const validation = await aiWorksheetService.validateWithAgents(worksheet);

    // Step 3: If validation passes, finalize worksheet
    const finalWorksheet = {
      id: `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: worksheet.title,
      description: worksheet.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: worksheet.activities.map((act: any, index: number) => ({
        id: `act_${index}`,
        type: act.type as ActivityType,
        difficulty: normalizeDifficulty(act.difficulty),
        ...act
      })),
      metadata: {
        studentId: params.student.id,
        subject: params.subject,
        topic: params.topic,
        difficulty: params.difficulty,
        validationScore: validation.overallScore,
        aiGenerated: true,
        agentApproved: validation.approvedBy
      }
    } as unknown as WorksheetData;

    return { worksheet: finalWorksheet, validation };
  },

  /**
   * Validate worksheet with all 4 expert agents
   */
  validateWithAgents: async (worksheetContent: any): Promise<AIWorksheetValidation> => {
    const agents: Array<{
      role: 'ozel-ogrenme-uzmani' | 'ozel-egitim-uzmani' | 'yazilim-muhendisi' | 'ai-muhendisi';
      category: 'pedagogical' | 'clinical' | 'technical' | 'ai';
    }> = [
        { role: 'ozel-ogrenme-uzmani', category: 'pedagogical' },
        { role: 'ozel-egitim-uzmani', category: 'clinical' },
        { role: 'yazilim-muhendisi', category: 'technical' },
        { role: 'ai-muhendisi', category: 'ai' }
      ];

    const validationTasks = await Promise.all(
      agents.map(({ role, category }) =>
        agentService.createTask({
          role,
          type: 'validation',
          description: `Çalışma kâğıdı doğrulama: ${category}`,
          priority: 1,
          input: { worksheet: worksheetContent }
        })
      )
    );

    const validationResults = await Promise.all(
      validationTasks.map(task => agentService.executeTask(task.id))
    );

    const scores: Record<string, number> = {};
    const issues: AIWorksheetValidation['issues'] = [];
    const approvedBy: string[] = [];

    if (!worksheetContent?.pedagogicalNote || typeof worksheetContent.pedagogicalNote !== 'string') {
      issues.push({
        severity: 'critical',
        category: 'pedagogical',
        message: 'pedagogicalNote eksik veya geçersiz.',
        suggestion: 'Her çalışma kâğıdına anlamlı bir pedagogicalNote ekleyin.'
      });
    }

    if (!Array.isArray(worksheetContent?.activities) || worksheetContent.activities.length === 0) {
      issues.push({
        severity: 'critical',
        category: 'technical',
        message: 'Çalışma kâğıdında en az bir aktivite bulunmalıdır.',
        suggestion: 'En az bir yapılandırılmış aktivite ekleyin.'
      });
    }

    validationResults.forEach((result, index) => {
      const { category } = agents[index];

      if (result.status === 'completed' && result.output) {
        const output = result.output as any;

        // Extract score
        const score = output.score || (output.isValid ? 100 : 0);
        scores[`${category}Score`] = score;

        // Extract issues
        if (output.violations && Array.isArray(output.violations)) {
          output.violations.forEach((violation: string) => {
            issues.push({
              severity: normalizeSeverity(output.severity),
              category,
              message: violation,
              suggestion: output.suggestions?.[0] || 'İyileştirme önerileri mevcut'
            });
          });
        }

        // Add to approved list if valid
        if (output.isValid || score > 70) {
          approvedBy.push(agents[index].role);
        }
      }
    });

    const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;

    return {
      isValid: issues.filter(i => i.severity === 'critical').length === 0 && overallScore >= 70,
      pedagogicalScore: scores.pedagogicalScore || 0,
      clinicalScore: scores.clinicalScore || 0,
      technicalScore: scores.technicalScore || 0,
      aiQualityScore: scores.aiScore || 0,
      overallScore,
      issues,
      approvedBy
    };
  },

  /**
   * Get smart worksheet suggestions based on student profile
   */
  getSuggestedWorksheets: async (
    student: Student,
    count: number = 5
  ): Promise<SmartWorksheetSuggestion[]> => {
    const prompt = `
[GÖREV: Akıllı Çalışma Kâğıdı Önerileri]

ÖĞRENCİ PROFİLİ:
${JSON.stringify({
      name: student.name,
      age: student.age,
      grade: student.grade,
      learningStyle: student.learningStyle,
      strengths: student.strengths,
      weaknesses: student.weaknesses
    }, null, 2)}

Bu öğrenci için ${count} adet kişiselleştirilmiş çalışma kâğıdı önerisi oluştur.

Her öneri şunları içermeli:
- Açık başlık ve açıklama
- Tahmini zorluk seviyesi
- Tahmini süre
- Önerilen aktivite tipleri
- Pedagojik gerekçe
- Beklenen faydalar
- Önkoşullar

YANIT FORMATI (JSON):
{
  "suggestions": [
    {
      "title": "Başlık",
      "description": "Açıklama",
      "estimatedDifficulty": "Kolay | Orta | Zor",
      "estimatedDuration": number,
      "recommendedActivities": ["activity-type-1"],
      "rationale": "Neden bu öğrenci için uygun",
      "expectedBenefits": ["fayda 1"],
      "prerequisites": ["önkoşul 1"]
    }
  ]
}`;

    const result = await generateWithSchema(prompt, {
      type: 'OBJECT',
      properties: {
        suggestions: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              title: { type: 'STRING' },
              description: { type: 'STRING' },
              estimatedDifficulty: { type: 'STRING' },
              estimatedDuration: { type: 'NUMBER' },
              recommendedActivities: { type: 'ARRAY', items: { type: 'STRING' } },
              rationale: { type: 'STRING' },
              expectedBenefits: { type: 'ARRAY', items: { type: 'STRING' } },
              prerequisites: { type: 'ARRAY', items: { type: 'STRING' } }
            }
          }
        }
      },
      required: ['suggestions']
    });

    return ((result as any).suggestions || []).map((suggestion: SmartWorksheetSuggestion) => ({
      ...suggestion,
      estimatedDifficulty: normalizeDifficulty(suggestion.estimatedDifficulty),
    }));
  },

  /**
   * Optimize existing worksheet for better learning outcomes
   */
  optimizeWorksheet: async (
    worksheet: WorksheetData,
    student: Student
  ): Promise<{ optimized: WorksheetData; changes: string[]; improvements: string[] }> => {
    const prompt = `
[GÖREV: Çalışma Kâğıdı Optimizasyonu]

MEVCUT ÇALIŞMA KÂĞIDI:
${JSON.stringify(worksheet, null, 2)}

ÖĞRENCİ PROFİLİ:
${JSON.stringify({
      name: student.name,
      learningStyle: student.learningStyle,
      strengths: student.strengths,
      weaknesses: student.weaknesses
    }, null, 2)}

Çalışma kâğıdını bu öğrenci için optimize et.

ODAKLANILACAK ALANLAR:
- Aktivite sıralaması (kolay → zor)
- Talimat netliği
- Görsel destek
- Zaman dağılımı
- Disleksi uyumluluğu

YANIT FORMATI (JSON):
{
  "optimized": { /* optimize edilmiş worksheet */ },
  "changes": ["değişiklik 1"],
  "improvements": ["iyileştirme 1"]
}`;

    const result = await generateWithSchema(prompt, {
      type: 'OBJECT',
      properties: {
        optimized: { type: 'OBJECT' },
        changes: { type: 'ARRAY', items: { type: 'STRING' } },
        improvements: { type: 'ARRAY', items: { type: 'STRING' } }
      },
      required: ['optimized', 'changes', 'improvements']
    });

    const typedResult = result as { optimized?: Partial<WorksheetData>; changes: string[]; improvements: string[] };

    return {
      optimized: {
        ...worksheet,
        ...(typedResult.optimized || {}),
        name: typedResult.optimized?.name || worksheet.name,
        description: typedResult.optimized?.description || worksheet.description,
        activities: Array.isArray(typedResult.optimized?.activities)
          ? typedResult.optimized.activities
          : worksheet.activities,
      } as WorksheetData,
      changes: typedResult.changes,
      improvements: typedResult.improvements,
    };
  },

  /**
   * Generate adaptive worksheet that adjusts difficulty in real-time
   */
  generateAdaptiveWorksheet: async (
    params: WorksheetGenerationParams
  ): Promise<{
    worksheet: WorksheetData;
    adaptiveLevels: Array<{ trigger: string; adjustment: string }>;
  }> => {
    const prompt = `
[GÖREV: Adaptif Çalışma Kâğıdı Üretimi]

PARAMETRELER:
${JSON.stringify(params, null, 2)}

Öğrenci performansına göre kendini ayarlayan bir çalışma kâğıdı oluştur.

HER AKTİVİTE İÇİN:
- 3 seviye zorluk (kolay/orta/zor)
- Geçiş kriterleri
- Destek ipuçları
- Alternatif sorular

YANIT FORMATI (JSON):
{
  "worksheet": { /* worksheet data */ },
  "adaptiveLevels": [
    {
      "trigger": "Öğrenci 3 soru üst üste yanlış yaparsa",
      "adjustment": "Zorluk seviyesini düşür, ipucu göster"
    }
  ]
}`;

    const result = await generateWithSchema(prompt, {
      type: 'OBJECT',
      properties: {
        worksheet: { type: 'OBJECT' },
        adaptiveLevels: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              trigger: { type: 'STRING' },
              adjustment: { type: 'STRING' }
            }
          }
        }
      },
      required: ['worksheet', 'adaptiveLevels']
    });

    return result as {
      worksheet: WorksheetData;
      adaptiveLevels: Array<{ trigger: string; adjustment: string }>;
    };
  }
};
