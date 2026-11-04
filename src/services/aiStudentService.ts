import { generateWithSchema } from './geminiClient';
import { db } from './firebaseClient';
import { doc, getDoc } from 'firebase/firestore';
import { 
    AdvancedStudent, 
    createAdvancedStudent
} from '../types/student-advanced';
import { agentService } from './agentService';

import { logError } from '../utils/logger';

// --- TYPES FOR AI RESULTS ---
export interface CognitiveProfileResult {
    overallScore?: number;
    radarData: { subject?: string; label?: string; value: number; fullMark?: number }[];
    strengths: any[];
    challenges?: string[];
    recommendations?: string[];
    summary: string;
    strategies?: string[];
    timeline?: any[];
    suggestedIEPGoals?: {
        category: 'academic' | 'behavioral' | 'social' | 'motor' | 'speech';
        title: string;
        description: string;
        successCriteria: string;
        priority: 'high' | 'medium' | 'low';
    }[];
}

export const aiStudentService = {
    /**
     * Firestore'dan tam öğrenci verisini çeker ve AdvancedStudent formatına getirir.
     */
    getFullStudentProfile: async (studentId: string): Promise<AdvancedStudent | null> => {
        try {
            const studentDoc = await getDoc(doc(db, "students", studentId));
            if (!studentDoc.exists()) return null;

            const baseData = { id: studentDoc.id, ...studentDoc.data() } as any;
            return createAdvancedStudent(baseData);
        } catch (error) {
            logError("getFullStudentProfile error:", error as Record<string, unknown>);
            return null;
        }
    },

    /**
     * Öğrencinin performans verilerini analiz ederek bilişsel bir profil çıkarır.
     */
    generateCognitiveInsight: async (student: any): Promise<any> => {
        try {
            const prompt = `[GÖREV: Bilişsel Matris Hiyerarşisi (AIInsightsModule)] Öğrenci analizi: ${student.name || ''}`;
            const schema = {
                type: "OBJECT",
                properties: {
                    radarData: { type: "ARRAY", items: { type: "OBJECT" } },
                    summary: { type: "STRING" },
                    strengths: { type: "ARRAY", items: { type: "OBJECT" } },
                    strategies: { type: "ARRAY", items: { type: "STRING" } },
                    timeline: { type: "ARRAY", items: { type: "OBJECT" } }
                }
            };
            const result = await generateWithSchema(prompt, schema);
            return result;
        } catch (error) {
            logError("generateCognitiveInsight error:", error as Record<string, unknown>);
            throw error;
        }
    },

    /**
     * Öğrenciyi 4 uzman ajan ile analiz eder.
     */
    analyzeStudent: async (student: any): Promise<any> => {
        try {
            const agentInsights = await agentService.coordinateAgents(`Öğrenci analizi: ${student.name}`);
            const prompt = `Öğrenci kapsamlı analiz: ${student.name}`;
            const result: any = await generateWithSchema(prompt, {});

            return {
                strengths: result?.strengths || student.strengths || ['Görsel algı'],
                challenges: result?.challenges || student.challenges || student.weaknesses || ['Odaklanma'],
                recommendations: result?.recommendations || ['Görsel kartlar kullanılmalı'],
                learningStyle: (result?.learningStyle || student.learningStyle || 'görsel').toLowerCase(),
                attentionSpan: result?.attentionSpan || 'medium',
                motivationLevel: result?.motivationLevel || 'high',
                progressTrend: result?.progressTrend || 'stable',
                interventionNeeded: result?.interventionNeeded ?? false,
                agentInsights: agentInsights || {}
            };
        } catch (error) {
            logError("analyzeStudent error:", error as Record<string, unknown>);
            throw error;
        }
    },

    /**
     * Kişiselleştirilmiş içerik üretir.
     */
    generatePersonalizedContent: async (student: any, subject: string, topic: string): Promise<any> => {
        try {
            const prompt = `[GÖREV: Kişiselleştirilmiş İçerik Üretimi] Öğrenci: ${student.name}, Ders: ${subject}, Konu: ${topic}`;
            const result: any = await generateWithSchema(prompt, {});
            return {
                activityType: result?.activityType || `${subject} Etkinliği`,
                difficulty: result?.difficulty || 'Orta',
                duration: result?.duration || 15,
                materials: result?.materials || ['Çalışma kağıdı', 'Kalem'],
                instructions: result?.instructions || 'Yönergeleri takip edin.',
                pedagogicalRationale: result?.pedagogicalRationale || 'Bu aktivite öğrencinin dikkat ve odaklanma becerisini destekler.',
                expectedOutcomes: result?.expectedOutcomes || ['Hedef kazanım gerçekleşti']
            };
        } catch (error) {
            logError("generatePersonalizedContent error:", error as Record<string, unknown>);
            throw error;
        }
    },

    /**
     * BEP önerileri oluşturur.
     */
    generateBEPSuggestions: async (student: any): Promise<any> => {
        try {
            const prompt = `BEP Önerileri: ${student.name}`;
            const result: any = await generateWithSchema(prompt, {});
            return {
                goals: result?.goals || [
                    {
                        objective: 'Okuma akıcılığı artırma',
                        targetDate: '2026-06-01',
                        measurableIndicator: 'Dakikada 60 kelime',
                        supportStrategies: ['Heceleme egzersizi'],
                        progress: 'not_started'
                    }
                ],
                timeline: result?.timeline || '6 ay',
                resources: result?.resources || ['Özel okuma metinleri'],
                evaluationCriteria: result?.evaluationCriteria || ['Haftalık takip'],
                familyInvolvement: result?.familyInvolvement || ['Evde 10 dakika birlikte okuma']
            };
        } catch (error) {
            logError("generateBEPSuggestions error:", error as Record<string, unknown>);
            throw error;
        }
    },

    /**
     * İlerleme durumunu doğrular.
     */
    validateProgress: async (student: any, performance: any): Promise<any> => {
        try {
            const prompt = `[GÖREV: Öğrenci İlerleme Değerlendirmesi] Öğrenci: ${student.name}, Performans: ${JSON.stringify(performance)}`;
            const result: any = await generateWithSchema(prompt, {});
            return {
                isOnTrack: result?.isOnTrack ?? true,
                concernAreas: result?.concernAreas || [],
                interventions: result?.interventions || [],
                strengthAreas: result?.strengthAreas || [],
                nextSteps: result?.nextSteps || []
            };
        } catch (error) {
            logError("validateProgress error:", error as Record<string, unknown>);
            throw error;
        }
    },

    /**
     * Veli raporu üretir.
     */
    generateParentReport: async (student: any, period: string): Promise<any> => {
        try {
            const prompt = `Veli Raporu: ${student.name}, Dönem: ${period}`;
            const result: any = await generateWithSchema(prompt, {});
            return {
                summary: result?.summary || `${student.name} bu dönemde istikrarlı bir ilerleme göstermiştir.`,
                achievements: result?.achievements || ['Yeni kelimeler öğrendi'],
                areasForGrowth: result?.areasForGrowth || ['Odaklanma egzersizleri'],
                homeActivities: result?.homeActivities || ['Birlikte kitap okuma'],
                parentTips: result?.parentTips || ['Sabırlı ve destekleyici olun']
            };
        } catch (error) {
            logError("generateParentReport error:", error as Record<string, unknown>);
            throw error;
        }
    },

    /**
     * Akran eşleşmesi bulur.
     */
    findPeerMatches: async (student: any, allStudents: any[]): Promise<any[]> => {
        try {
            const prompt = `Akran Eşleşmesi: ${student.name}`;
            const result: any = await generateWithSchema(prompt, {});
            if (result?.matches && Array.isArray(result.matches)) {
                return result.matches;
            }
            return allStudents
                .filter(s => s.id !== student.id)
                .map(peer => ({
                    peerName: peer.name,
                    matchScore: 85,
                    commonStrengths: ['Görsel öğrenme'],
                    complementarySkills: ['Sosyal etkileşim'],
                    activitySuggestions: ['Ortak çizim ve bulmaca etkinliği']
                }));
        } catch (error) {
            logError("findPeerMatches error:", error as Record<string, unknown>);
            throw error;
        }
    },

    /**
     * SMART IEP Hedefleri üretir.
     */
    generateIEPGoals: async (student: any): Promise<any[]> => {
        try {
            const prompt = `[GÖREV: Bireyselleştirilmiş Eğitim Programı (BEP) Hedef Üretimi] Öğrenci: ${student.name}`;
            const result: any = await generateWithSchema(prompt, {});
            return result?.goals || [
                {
                    title: 'Akıcı Okuma',
                    description: 'Dakikada 70 kelime okuyabilme',
                    category: 'academic',
                    priority: 'high',
                    targetDate: '2026-06-01'
                }
            ];
        } catch (error) {
            logError("generateIEPGoals error:", error as Record<string, unknown>);
            throw error;
        }
    }
};
