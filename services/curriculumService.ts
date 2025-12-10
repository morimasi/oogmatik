
import { generateWithSchema } from './geminiClient';
import { Type } from "@google/genai";
import { Curriculum, ActivityType } from '../types';
import { ACTIVITIES } from '../constants';

export const curriculumService = {
    generatePlan: async (
        studentName: string,
        age: number,
        grade: string,
        diagnosis: string, // e.g., Dyslexia, Attention Deficit
        durationDays: number = 7
    ): Promise<Curriculum> => {
        
        // Prepare activity list for AI to choose from
        const availableActivities = ACTIVITIES.map(a => `${a.id}: ${a.title}`).join('\n');

        const prompt = `
        [ROL: ÖZEL EĞİTİM MÜFREDAT UZMANI]

        GÖREV: Aşağıdaki öğrenci profili için ${durationDays} günlük, kişiselleştirilmiş ve bilimsel temelli bir ev çalışma programı oluştur.
        
        ÖĞRENCİ PROFİLİ:
        - İsim: ${studentName}
        - Yaş: ${age}
        - Sınıf: ${grade}
        - Tanı/İhtiyaç: ${diagnosis}

        MEVCUT AKTİVİTE HAVUZU (Sadece bunları kullan):
        ${availableActivities}

        KURALLAR:
        1. Her gün için 2-3 aktivite planla.
        2. Aktiviteler öğrencinin tanısına uygun olmalı (Örn: Disleksi için okuma akışı, Diskalkuli için sayı hissi).
        3. Zorluk seviyesi gün geçtikçe kademeli artmalı (Spiral eğitim).
        4. "activityId" alanı, yukarıdaki listedeki ID ile TAM EŞLEŞMELİDİR.

        ÇIKTI FORMATI (JSON):
        {
            "goals": ["Hedef 1", "Hedef 2"],
            "note": "Ebeveyn için kısa rehber notu",
            "schedule": [
                {
                    "day": 1,
                    "focus": "Günün odağı (örn: Görsel Dikkat)",
                    "activities": [
                        { "activityId": "ACTIVITY_ID", "title": "Aktivite Adı", "duration": 15, "goal": "Neyi geliştirecek?" }
                    ]
                }
            ]
        }
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                goals: { type: Type.ARRAY, items: { type: Type.STRING } },
                note: { type: Type.STRING },
                schedule: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            day: { type: Type.INTEGER },
                            focus: { type: Type.STRING },
                            activities: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        activityId: { type: Type.STRING },
                                        title: { type: Type.STRING },
                                        duration: { type: Type.INTEGER },
                                        goal: { type: Type.STRING }
                                    },
                                    required: ['activityId', 'title', 'duration', 'goal']
                                }
                            }
                        },
                        required: ['day', 'focus', 'activities']
                    }
                }
            },
            required: ['goals', 'note', 'schedule']
        };

        const result = await generateWithSchema(prompt, schema, 'gemini-2.5-flash');

        return {
            id: crypto.randomUUID(),
            studentName,
            grade,
            startDate: new Date().toISOString(),
            durationDays,
            goals: result.goals,
            schedule: result.schedule,
            note: result.note
        };
    }
};
