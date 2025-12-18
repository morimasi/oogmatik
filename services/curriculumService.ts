
import { generateWithSchema } from './geminiClient';
import { Type } from "@google/genai";
import { Curriculum, ActivityType, CurriculumDay, CurriculumActivityStatus } from '../types';
import { ACTIVITIES } from '../constants';
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";

const { collection, addDoc, query, where, getDocs, doc, deleteDoc, updateDoc, getDoc } = firestore;

export const curriculumService = {
    generatePlan: async (
        studentName: string,
        age: number,
        grade: string,
        diagnosis: string,
        durationDays: number = 7,
        interests: string[] = [],
        weaknesses: string[] = []
    ): Promise<Curriculum> => {
        
        // Prepare activity list for AI to choose from
        const availableActivities = ACTIVITIES.map(a => `${a.id}: ${a.title}`).join('\n');

        const prompt = `
        [ROL: KIDEMLİ ÖZEL EĞİTİM PROGRAM GELİŞTİRİCİSİ]

        GÖREV: Aşağıdaki öğrenci profili için ${durationDays} günlük, "Spiral Öğrenme Modeli"ne dayalı, kişiselleştirilmiş ve etkileşimli bir ev çalışma programı oluştur.
        
        ÖĞRENCİ PROFİLİ:
        - İsim: ${studentName}
        - Yaş: ${age}
        - Sınıf: ${grade}
        - Tanı/İhtiyaç: ${diagnosis}
        - İlgi Alanları: ${interests.join(', ') || 'Genel'}
        - Zayıf Yönler: ${weaknesses.join(', ') || 'Genel akademik destek'}

        PEDAGOJİK KURALLAR (SPIRAL LEARNING):
        1. **Kademeli Zorluk:** İlk günlerde basit görsel/dikkat etkinlikleri, sonlara doğru karmaşık mantık/okuma etkinlikleri planla.
        2. **Tekrar:** 1. gün öğrenilen bir beceriyi 3. gün daha zor bir versiyonla tekrar ettir.
        3. **İlgi Odaklılık:** Öğrencinin ilgi alanlarını (örn: uzay, hayvanlar) aktivite başlıklarına veya hedeflerine yedir.
        4. **Bilişsel Yük Dengesi:** Her gün için 1 "Zorlayıcı" (Bilişsel) ve 2 "Eğlenceli/Pekiştirici" (Algısal) aktivite seç.

        MEVCUT AKTİVİTE HAVUZU (Sadece bunları kullan):
        ${availableActivities}

        ÇIKTI FORMATI (JSON):
        {
            "goals": ["Hedef 1", "Hedef 2", "Hedef 3"],
            "note": "Ebeveyn için motive edici ve yönlendirici bir önsöz.",
            "schedule": [
                {
                    "day": 1,
                    "focus": "Günün Teması (örn: Görsel Dikkat ve Tarama)",
                    "activities": [
                        { 
                            "activityId": "ACTIVITY_ID", 
                            "title": "Aktivite Başlığı (İlgi alanına göre özelleştirilebilir)", 
                            "duration": 15, 
                            "goal": "Bu aktivitenin kazandıracağı beceri.",
                            "difficultyLevel": "Easy" 
                        }
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
                                        goal: { type: Type.STRING },
                                        difficultyLevel: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] }
                                    },
                                    required: ['activityId', 'title', 'duration', 'goal', 'difficultyLevel']
                                }
                            }
                        },
                        required: ['day', 'focus', 'activities']
                    }
                }
            },
            required: ['goals', 'note', 'schedule']
        };

        // Removed specific model name to allow backend to fallback
        const result = await generateWithSchema(prompt, schema);

        // Post-process to add IDs and status
        const schedule = result.schedule.map((day: any) => ({
            ...day,
            isCompleted: false,
            activities: day.activities.map((act: any) => ({
                ...act,
                id: crypto.randomUUID(),
                status: 'pending'
            }))
        }));

        return {
            id: crypto.randomUUID(),
            studentName,
            grade,
            startDate: new Date().toISOString(),
            durationDays,
            goals: result.goals,
            schedule: schedule,
            note: result.note,
            interests,
            weaknesses
        };
    },

    regenerateDay: async (currentDay: CurriculumDay, studentProfile: any): Promise<CurriculumDay> => {
        // Logic to regenerate just one day
        const availableActivities = ACTIVITIES.map(a => `${a.id}: ${a.title}`).join('\n');
        
        const prompt = `
        [ROL: EĞİTİM PROGRAMI DÜZELTİCİ]
        
        GÖREV: Aşağıdaki öğrenci için ${currentDay.day}. günün programını tamamen değiştir. Kullanıcı mevcut planı beğenmedi.
        
        ÖĞRENCİ: ${studentProfile.name}, ${studentProfile.grade}, İlgi: ${studentProfile.interests?.join(',')}.
        
        ESKİ PLAN (Bunu kullanma): ${currentDay.focus}
        
        KURALLAR:
        - Farklı bir odak noktası seç.
        - Farklı aktiviteler öner.
        - Mevcut aktivite havuzunu kullan:
        ${availableActivities}
        
        ÇIKTI (JSON - Tek Gün):
        {
            "day": ${currentDay.day},
            "focus": "Yeni Odak",
            "activities": [...]
        }
        `;

        const schema = {
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
                            goal: { type: Type.STRING },
                            difficultyLevel: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] }
                        },
                        required: ['activityId', 'title', 'duration', 'goal', 'difficultyLevel']
                    }
                }
            },
            required: ['day', 'focus', 'activities']
        };

        // Removed specific model name
        const result = await generateWithSchema(prompt, schema);
        
        return {
            ...result,
            isCompleted: false,
            activities: result.activities.map((act: any) => ({
                ...act,
                id: crypto.randomUUID(),
                status: 'pending'
            }))
        };
    },

    // --- DB OPERATIONS ---

    saveCurriculum: async (userId: string, curriculum: Curriculum): Promise<string> => {
        const payload = {
            ...curriculum,
            userId,
            createdAt: new Date().toISOString()
        };
        // Remove the temporary ID if it exists, let Firestore generate one or overwrite if explicitly setting
        // Ideally we let Firestore generate ID for new docs.
        const { id, ...dataToSave } = payload; 
        
        const docRef = await addDoc(collection(db, "saved_curriculums"), dataToSave);
        return docRef.id;
    },

    updateCurriculum: async (curriculumId: string, updates: Partial<Curriculum>): Promise<void> => {
        const planRef = doc(db, "saved_curriculums", curriculumId);
        await updateDoc(planRef, updates);
    },

    getUserCurriculums: async (userId: string): Promise<Curriculum[]> => {
        try {
            const q = query(collection(db, "saved_curriculums"), where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            const items: Curriculum[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as any;
                items.push({ ...data, id: doc.id });
            });
            return items.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        } catch (e) {
            console.error("Get Curriculums Error", e);
            return [];
        }
    },

    deleteCurriculum: async (id: string): Promise<void> => {
        await deleteDoc(doc(db, "saved_curriculums", id));
    },

    shareCurriculum: async (curriculum: Curriculum, senderId: string, senderName: string, receiverId: string): Promise<void> => {
        const payload = {
            ...curriculum,
            userId: senderId, 
            sharedBy: senderId,
            sharedByName: senderName,
            sharedWith: receiverId,
            createdAt: new Date().toISOString()
        };
        delete (payload as any).id;
        
        await addDoc(collection(db, "saved_curriculums"), payload);
    },

    // NEW: Update specific activity status
    updateActivityStatus: async (curriculumId: string, day: number, activityId: string, status: CurriculumActivityStatus): Promise<void> => {
        try {
            const planRef = doc(db, "saved_curriculums", curriculumId);
            const planSnap = await getDoc(planRef);
            
            if (planSnap.exists()) {
                const planData = planSnap.data() as Curriculum;
                const newSchedule = planData.schedule.map(d => {
                    if (d.day === day) {
                        const newActivities = d.activities.map(a => 
                            a.id === activityId ? { ...a, status } : a
                        );
                        // Check if all completed
                        const isDayComplete = newActivities.every(a => a.status === 'completed' || a.status === 'skipped');
                        return { ...d, activities: newActivities, isCompleted: isDayComplete };
                    }
                    return d;
                });
                
                await updateDoc(planRef, { schedule: newSchedule });
            }
        } catch (e) {
            console.error("Update activity status error", e);
            throw e;
        }
    }
};
