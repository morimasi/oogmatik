/**
 * OOGMATIK - AI-Enhanced Student Service
 * Advanced student analysis with AI agent integration
 */

import { agentService, AgentRole } from './agentService.js';
import { StudentAIProfile, IEPGoal as BEPGoal } from '../types/student-advanced.js';
import { Student } from '../types/student.js';
import { generateWithSchema } from './geminiClient.js';

export interface StudentAnalysisResult {
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  learningStyle: string;
  attentionSpan: 'short' | 'medium' | 'long';
  motivationLevel: 'low' | 'medium' | 'high';
  progressTrend: 'improving' | 'stable' | 'declining';
  interventionNeeded: boolean;
  agentInsights: Record<AgentRole, {
    feedback: string;
    priority: number;
    actionItems: string[];
  }>;
}

export interface PersonalizedContent {
  activityType: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  duration: number;
  materials: string[];
  instructions: string;
  pedagogicalRationale: string;
  expectedOutcomes: string[];
}

export interface BEPSuggestion {
  goals: BEPGoal[];
  timeline: string;
  resources: string[];
  evaluationCriteria: string[];
  familyInvolvement: string[];
}

export const aiStudentService = {
  /**
   * Comprehensive student analysis using all 4 expert agents
   */
  analyzeStudent: async (student: any): Promise<StudentAnalysisResult> => {
    const studentData = {
      name: student.name,
      age: student.age,
      grade: student.grade,
      profile: student.profile,
      strengths: student.strengths || [],
      challenges: student.challenges || [],
      recentAssessments: student.recentAssessments || [],
      behavioralNotes: student.behavioralNotes || []
    };

    // Coordinate all 4 expert agents for comprehensive analysis
    const agentRoles: AgentRole[] = [
      'ozel-ogrenme-uzmani',
      'ozel-egitim-uzmani',
      'yazilim-muhendisi',
      'ai-muhendisi'
    ];

    const tasks = await agentService.coordinateAgents(
      `Öğrenci analizi: ${JSON.stringify(studentData)}`,
      agentRoles
    );

    // Compile insights from all agents
    const agentInsights: Record<AgentRole, any> = {} as Record<AgentRole, any>;

    for (const role of agentRoles) {
      const task = tasks[role];
      if (task.status === 'completed' && task.output) {
        agentInsights[role] = {
          feedback: task.output.feedback || task.output.summary || '',
          priority: task.output.priority || 1,
          actionItems: task.output.recommendations || task.output.suggestions || []
        };
      }
    }

    // Generate comprehensive analysis
    const analysisPrompt = `
[GÖREV: Öğrenci Kapsamlı Analizi]

ÖĞRENCİ VERİSİ:
${JSON.stringify(studentData, null, 2)}

UZMAN GERİ BİLDİRİMLERİ:
${Object.entries(agentInsights).map(([role, insight]) =>
      `${role}: ${JSON.stringify(insight, null, 2)}`
    ).join('\n\n')}

Yukarıdaki uzman görüşlerini birleştirerek öğrenci için kapsamlı bir analiz hazırla.

YANIT FORMATI (JSON):
{
  "strengths": ["güçlü yön 1", "güçlü yön 2"],
  "challenges": ["zorluk 1", "zorluk 2"],
  "recommendations": ["öneri 1", "öneri 2"],
  "learningStyle": "görsel | işitsel | kinestetik | karma",
  "attentionSpan": "short | medium | long",
  "motivationLevel": "low | medium | high",
  "progressTrend": "improving | stable | declining",
  "interventionNeeded": boolean
}`;

    const analysis = await generateWithSchema(analysisPrompt, {
      type: 'OBJECT',
      properties: {
        strengths: { type: 'ARRAY', items: { type: 'STRING' } },
        challenges: { type: 'ARRAY', items: { type: 'STRING' } },
        recommendations: { type: 'ARRAY', items: { type: 'STRING' } },
        learningStyle: { type: 'STRING' },
        attentionSpan: { type: 'STRING' },
        motivationLevel: { type: 'STRING' },
        progressTrend: { type: 'STRING' },
        interventionNeeded: { type: 'BOOLEAN' }
      },
      required: [
        'strengths',
        'challenges',
        'recommendations',
        'learningStyle',
        'attentionSpan',
        'motivationLevel',
        'progressTrend',
        'interventionNeeded'
      ]
    });

    return {
      ...analysis,
      agentInsights
    } as StudentAnalysisResult;
  },

  /**
   * Generate personalized learning content for student
   */
  generatePersonalizedContent: async (
    student: Student,
    subject: string,
    objective: string
  ): Promise<PersonalizedContent> => {
    const prompt = `
[GÖREV: Kişiselleştirilmiş İçerik Üretimi]

ÖĞRENCİ PROFİLİ:
- İsim: ${student.name}
- Yaş: ${student.age}
- Sınıf: ${student.grade}
- Öğrenme Profili: ${student.learningStyle}
- Güçlü Yönler: ${(student.strengths || []).join(', ')}
- Zayıf Yönler: ${(student.weaknesses || []).join(', ')}

KONU: ${subject}
HED EF: ${objective}

Bu öğrenci için özel olarak tasarlanmış, onun öğrenme profiline ve ihtiyaçlarına uygun aktivite içeriği üret.

YANIT FORMATI (JSON):
{
  "activityType": "aktivite türü",
  "difficulty": "Kolay | Orta | Zor",
  "duration": number (dakika),
  "materials": ["materyal 1", "materyal 2"],
  "instructions": "Detaylı adım adım talimatlar",
  "pedagogicalRationale": "Bu aktivitenin neden bu öğrenci için uygun olduğu",
  "expectedOutcomes": ["beklenen sonuç 1", "beklenen sonuç 2"]
}`;

    const content = await generateWithSchema(prompt, {
      type: 'OBJECT',
      properties: {
        activityType: { type: 'STRING' },
        difficulty: { type: 'STRING' },
        duration: { type: 'NUMBER' },
        materials: { type: 'ARRAY', items: { type: 'STRING' } },
        instructions: { type: 'STRING' },
        pedagogicalRationale: { type: 'STRING' },
        expectedOutcomes: { type: 'ARRAY', items: { type: 'STRING' } }
      },
      required: [
        'activityType',
        'difficulty',
        'duration',
        'materials',
        'instructions',
        'pedagogicalRationale',
        'expectedOutcomes'
      ]
    });

    return content as PersonalizedContent;
  },

  /**
   * Generate BEP (Individualized Education Plan) suggestions
   */
  generateBEPSuggestions: async (student: any): Promise<BEPSuggestion> => {
    // Use clinical expert agent for BEP generation
    const task = await agentService.createTask({
      role: 'ozel-egitim-uzmani',
      type: 'generation',
      description: `BEP önerisi oluştur: ${student.name}`,
      priority: 1,
      input: {
        student: {
          name: student.name,
          age: student.age,
          grade: student.grade,
          learningStyle: student.learningStyle,
          strengths: student.strengths,
          weaknesses: student.weaknesses
        }
      }
    });

    const result = await agentService.executeTask(task.id);

    const prompt = `
[GÖREV: BEP (Bireyselleştirilmiş Eğitim Programı) Önerileri]

ÖĞRENCİ:
${JSON.stringify({
      name: student.name,
      age: student.age,
      grade: student.grade,
      learningStyle: student.learningStyle,
      strengths: student.strengths,
      weaknesses: student.weaknesses
    }, null, 2)}

UZMAN GÖRÜŞü (Dr. Ahmet Kaya):
${JSON.stringify(result.output, null, 2)}

MEB Özel Eğitim Yönetmeliği ve 573 sayılı KHK'ya uygun, SMART formatında BEP hedefleri oluştur.

YANIT FORMATI (JSON):
{
  "goals": [
    {
      "objective": "Ölçülebilir hedef",
      "targetDate": "ISO tarih",
      "measurableIndicator": "Başarı göstergesi",
      "supportStrategies": ["strateji 1", "strateji 2"],
      "progress": "not_started"
    }
  ],
  "timeline": "Genel zaman çizelgesi",
  "resources": ["kaynak 1", "kaynak 2"],
  "evaluationCriteria": ["kriter 1", "kriter 2"],
  "familyInvolvement": ["aile katılımı 1", "aile katılımı 2"]
}`;

    const bep = await generateWithSchema(prompt, {
      type: 'OBJECT',
      properties: {
        goals: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              objective: { type: 'STRING' },
              targetDate: { type: 'STRING' },
              measurableIndicator: { type: 'STRING' },
              supportStrategies: { type: 'ARRAY', items: { type: 'STRING' } },
              progress: { type: 'STRING' }
            }
          }
        },
        timeline: { type: 'STRING' },
        resources: { type: 'ARRAY', items: { type: 'STRING' } },
        evaluationCriteria: { type: 'ARRAY', items: { type: 'STRING' } },
        familyInvolvement: { type: 'ARRAY', items: { type: 'STRING' } }
      },
      required: ['goals', 'timeline', 'resources', 'evaluationCriteria', 'familyInvolvement']
    });

    return bep as BEPSuggestion;
  },

  /**
   * Validate student progress and provide intervention recommendations
   */
  validateProgress: async (
    student: Student,
    recentPerformance: Record<string, number>
  ): Promise<{
    isOnTrack: boolean;
    concernAreas: string[];
    interventions: string[];
    strengthAreas: string[];
    nextSteps: string[];
  }> => {
    const prompt = `
[GÖREV: Öğrenci İlerleme Değerlendirmesi]

ÖĞRENCİ: ${student.name}
PROFİL: ${student.learningStyle}

SON PERFORMANS VERİLERİ:
${JSON.stringify(recentPerformance, null, 2)}

Öğrencinin ilerlemesini değerlendir ve gerekirse müdahale önerileri sun.

YANIT FORMATI (JSON):
{
  "isOnTrack": boolean,
  "concernAreas": ["endişe alanı 1"],
  "interventions": ["müdahale önerisi 1"],
  "strengthAreas": ["güçlü alan 1"],
  "nextSteps": ["sonraki adım 1"]
}`;

    const validation = await generateWithSchema(prompt, {
      type: 'OBJECT',
      properties: {
        isOnTrack: { type: 'BOOLEAN' },
        concernAreas: { type: 'ARRAY', items: { type: 'STRING' } },
        interventions: { type: 'ARRAY', items: { type: 'STRING' } },
        strengthAreas: { type: 'ARRAY', items: { type: 'STRING' } },
        nextSteps: { type: 'ARRAY', items: { type: 'STRING' } }
      },
      required: ['isOnTrack', 'concernAreas', 'interventions', 'strengthAreas', 'nextSteps']
    });

    return validation as {
      isOnTrack: boolean;
      concernAreas: string[];
      interventions: string[];
      strengthAreas: string[];
      nextSteps: string[];
    };
  },

  /**
   * Generate parent communication report
   */
  generateParentReport: async (
    student: Student,
    period: 'weekly' | 'monthly' | 'quarterly'
  ): Promise<{
    summary: string;
    achievements: string[];
    areasForGrowth: string[];
    homeActivities: string[];
    parentTips: string[];
  }> => {
    const prompt = `
[GÖREV: Veli Raporu Oluştur]

ÖĞRENCİ: ${student.name}
DÖNEM: ${period}
PROFİL: ${student.learningStyle}

Veli için anlaşılır, destekleyici ve yapıcı bir rapor hazırla.

ÖNEMLI:
- Tanı koyucu dil kullanma
- Olumlu dil kullan
- Somut örnekler ver
- Evde yapılabilir aktiviteler öner

YANIT FORMATI (JSON):
{
  "summary": "Genel özet",
  "achievements": ["başarı 1"],
  "areasForGrowth": ["gelişim alanı 1"],
  "homeActivities": ["evde aktivite 1"],
  "parentTips": ["veli ipucu 1"]
}`;

    const report = await generateWithSchema(prompt, {
      type: 'OBJECT',
      properties: {
        summary: { type: 'STRING' },
        achievements: { type: 'ARRAY', items: { type: 'STRING' } },
        areasForGrowth: { type: 'ARRAY', items: { type: 'STRING' } },
        homeActivities: { type: 'ARRAY', items: { type: 'STRING' } },
        parentTips: { type: 'ARRAY', items: { type: 'STRING' } }
      },
      required: ['summary', 'achievements', 'areasForGrowth', 'homeActivities', 'parentTips']
    });

    return report as {
      summary: string;
      achievements: string[];
      areasForGrowth: string[];
      homeActivities: string[];
      parentTips: string[];
    };
  },

  /**
   * AI-powered student matching for peer learning
   */
  findPeerMatches: async (
    student: Student,
    allStudents: Student[]
  ): Promise<Array<{
    peer: Student;
    matchScore: number;
    commonStrengths: string[];
    complementarySkills: string[];
    activitySuggestions: string[];
  }>> => {
    const prompt = `
[GÖREV: Akran Eşleştirme]

ODAK ÖĞRENCİ:
${JSON.stringify({
      name: student.name,
      learningStyle: student.learningStyle,
      strengths: student.strengths,
      weaknesses: student.weaknesses
    }, null, 2)}

ADAY ÖĞRENCİLER:
${JSON.stringify(allStudents.map(s => ({
      name: s.name,
      learningStyle: s.learningStyle,
      strengths: s.strengths,
      weaknesses: s.weaknesses
    })), null, 2)}

Akran öğrenme için en uygun eşleşmeleri bul.

YANIT FORMATI (JSON):
{
  "matches": [
    {
      "peerName": "İsim",
      "matchScore": number (0-100),
      "commonStrengths": ["ortak güçlü yön"],
      "complementarySkills": ["tamamlayıcı beceri"],
      "activitySuggestions": ["aktivite önerisi"]
    }
  ]
}`;

    const matches = await generateWithSchema(prompt, {
      type: 'OBJECT',
      properties: {
        matches: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              peerName: { type: 'STRING' },
              matchScore: { type: 'NUMBER' },
              commonStrengths: { type: 'ARRAY', items: { type: 'STRING' } },
              complementarySkills: { type: 'ARRAY', items: { type: 'STRING' } },
              activitySuggestions: { type: 'ARRAY', items: { type: 'STRING' } }
            }
          }
        }
      },
      required: ['matches']
    });

    return (matches as any).matches.map((match: any) => ({
      peer: allStudents.find(s => s.name === match.peerName)!,
      matchScore: match.matchScore,
      commonStrengths: match.commonStrengths,
      complementarySkills: match.complementarySkills,
      activitySuggestions: match.activitySuggestions
    }));
  }
};
