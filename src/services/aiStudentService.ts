import { generateWithSchema } from './geminiClient';
import { db } from './firebaseClient';
import { doc, getDoc } from 'firebase/firestore';
import { 
    AdvancedStudent, 
    createAdvancedStudent
} from '../types/student-advanced';
import { 
    ActivityType, 
    ApiResponse
} from '../types';
import { logError, logInfo } from '../utils/logger';

// --- TYPES FOR AI RESULTS ---
export interface CognitiveProfileResult {
    overallScore: number;
    radarData: { subject: string; value: number; fullMark: number }[];
    strengths: string[];
    challenges: string[];
    recommendations: string[];
    summary: string;
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
            logError("getFullStudentProfile error:", error);
            return null;
        }
    },

    /**
     * Öğrencinin performans verilerini analiz ederek bilişsel bir profil çıkarır.
     */
    generateCognitiveInsight: async (student: AdvancedStudent): Promise<ApiResponse<CognitiveProfileResult>> => {
        try {
            const performanceContext = {
                gpa: student.academic?.metrics?.gpa,
                struggles: student.aiProfile?.struggleAnalysis,
                strengths: student.aiProfile?.strengthAnalysis,
                recentGrades: student.academic?.grades?.slice(0, 5),
                iepGoals: student.iep?.goals?.map(g => ({ title: g.title, progress: g.progress }))
            };

            const prompt = `
            Aşağıdaki öğrenci verilerini bir nöro-pedagog gözüyle analiz et ve bilişsel bir profil oluştur.
            Öğrenci: ${student.name}, Yaş: ${student.age}, Sınıf: ${student.grade}
            Bağlam: ${JSON.stringify(performanceContext)}

            Lütfen şu formatta bir JSON döndür:
            {
                "overallScore": 85,
                "radarData": [
                    { "subject": "Görsel Algı", "value": 80, "fullMark": 100 },
                    { "subject": "İşitsel Hafıza", "value": 65, "fullMark": 100 },
                    { "subject": "Dikkat Kontrolü", "value": 70, "fullMark": 100 },
                    { "subject": "İşlemleme Hızı", "value": 75, "fullMark": 100 },
                    { "subject": "Sözel Akıcılık", "value": 85, "fullMark": 100 }
                ],
                "strengths": ["Görsel çıkarım yeteneği yüksek", "Sosyal etkileşimde başarılı"],
                "challenges": ["Uzun süre odaklanma güçlüğü", "İşitsel yönergeleri takipte zorlanma"],
                "recommendations": ["Görsel destekli eğitim materyalleri tercih edilmeli", "Yönergeler kısa ve öz tutulmalı"],
                "summary": "Öğrenci genel olarak görsel alanlarda güçlüdür ancak dikkat süresini artırıcı egzersizlere ihtiyaç duymaktadır.",
                "suggestedIEPGoals": [
                    {
                        "category": "academic",
                        "title": "Görsel Okuma ve Anlama",
                        "description": "Karmaşık görsellerden ana fikri çıkarma becerisi",
                        "successCriteria": "10 görselden 8'inde ana fikri 30 saniye içinde bulma",
                        "priority": "medium"
                    }
                ]
            }
            Yanıtı sadece JSON olarak ver, başka açıklama ekleme.
            `;

            // Schema definition for Gemini
            const schema = {
                type: "OBJECT",
                properties: {
                    overallScore: { type: "NUMBER" },
                    radarData: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                subject: { type: "STRING" },
                                value: { type: "NUMBER" },
                                fullMark: { type: "NUMBER" }
                            }
                        }
                    },
                    strengths: { type: "ARRAY", items: { type: "STRING" } },
                    challenges: { type: "ARRAY", items: { type: "STRING" } },
                    recommendations: { type: "ARRAY", items: { type: "STRING" } },
                    summary: { type: "STRING" },
                    suggestedIEPGoals: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                category: { type: "STRING", enum: ["academic", "behavioral", "social", "motor", "speech"] },
                                title: { type: "STRING" },
                                description: { type: "STRING" },
                                successCriteria: { type: "STRING" },
                                priority: { type: "STRING", enum: ["high", "medium", "low"] }
                            }
                        }
                    }
                },
                required: ["overallScore", "radarData", "strengths", "challenges", "recommendations", "summary"]
            };

            const result = await generateWithSchema(prompt, schema);
            
            if (!result) {
                throw new Error("AI yanıt üretemedi.");
            }

            return {
                success: true,
                data: result as unknown as CognitiveProfileResult,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            logError("generateCognitiveInsight error:", error);
            return {
                success: false,
                error: { 
                    message: "Bilişsel analiz sırasında bir hata oluştu.",
                    code: "AI_ANALYSIS_FAILED"
                },
                timestamp: new Date().toISOString()
            };
        }
    }
};
