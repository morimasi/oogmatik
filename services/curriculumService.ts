
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
        
        const availableActivities = ACTIVITIES.map(a => `${a.id}: ${a.title}`).join('\n');

        const prompt = `
        [ROL: KIDEMLİ ÖZEL EĞİTİM PROGRAM GELİŞTİRİCİSİ]

        GÖREV: Aşağıdaki öğrenci profili için ${durationDays} günlük, "Spiral Öğrenme Modeli"ne dayalı, kişiselleştirilmiş bir ev çalışma programı oluştur.
        
        ÖĞRENCİ PROFİLİ:
        - İsim: ${studentName}
        - Yaş: ${age}
        - Sınıf: ${grade}
        - Ana Odak: ${diagnosis}
        - İLGİ ALANLARI (ÇOK ÖNEMLİ): ${interests.join(', ') || 'Genel'}
        - ZAYIF YÖNLER (HEDEF): ${weaknesses.join(', ') || 'Genel akademik destek'}

        STRATEJİK TALİMATLAR:
        1. **İlgi Odaklı Kurgu:** Aktivite başlıklarını öğrencinin ilgi alanlarına göre uyarla (Örn: İlgi alanı "Uzay" ise, "Matematik Labirenti" yerine "Mars'ta Sayı Avı" de).
        2. **Spiral Yapı:** İlk günler basit bilişsel hazırlık, sonraki günler zayıf yönleri hedefleyen kademeli zorlukta görevler planla.
        3. **Çeşitlilik:** Her gün için 1 Ana Görev ve 1 Destekleyici Aktivite seç.

        AKTİVİTE HAVUZU:
        ${availableActivities}

        ÇIKTI: Sadece JSON döndür.
        {
            "goals": ["Hedef 1", "Hedef 2", "Hedef 3"],
            "note": "Ebeveyn için rehber notu.",
            "schedule": [
                {
                    "day": 1,
                    "focus": "Günün Teması",
                    "activities": [
                        { 
                            "activityId": "ACTIVITY_ID", 
                            "title": "İlgiye Göre Özelleştirilmiş Başlık", 
                            "duration": 15, 
                            "goal": "Kazanılacak beceri",
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

        const result = await generateWithSchema(prompt, schema);

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
        const availableActivities = ACTIVITIES.map(a => `${a.id}: ${a.title}`).join('\n');
        
        const prompt = `
        GÖREV: Aşağıdaki öğrenci için ${currentDay.day}. günün programını değiştir. 
        ÖĞRENCİ: ${studentProfile.name}, ${studentProfile.grade}, İlgi: ${studentProfile.interests?.join(',')}.
        ESKİ PLAN: ${currentDay.focus}
        HAVUZ: ${availableActivities}
        ÇIKTI: JSON (day, focus, activities).
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

    saveCurriculum: async (userId: string, curriculum: Curriculum, studentId?: string): Promise<string> => {
        const payload = {
            ...curriculum,
            userId,
            studentId: studentId || null,
            createdAt: new Date().toISOString()
        };
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
            return [];
        }
    },

    getCurriculumsByStudent: async (studentId: string): Promise<Curriculum[]> => {
        try {
            const q = query(collection(db, "saved_curriculums"), where("studentId", "==", studentId));
            const querySnapshot = await getDocs(q);
            const items: Curriculum[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as any;
                items.push({ ...data, id: doc.id });
            });
            return items.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        } catch (e) {
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

    updateActivityStatus: async (curriculumId: string, day: number, activityId: string, status: CurriculumActivityStatus): Promise<void> => {
        try {
            const planRef = doc(db, "saved_curriculums", curriculumId);
            const planSnap = await getDoc(planRef);
            if (planSnap.exists()) {
                const planData = planSnap.data() as Curriculum;
                const newSchedule = planData.schedule.map(d => {
                    if (d.day === day) {
                        const newActivities = d.activities.map(a => a.id === activityId ? { ...a, status } : a);
                        const isDayComplete = newActivities.every(a => a.status === 'completed' || a.status === 'skipped');
                        return { ...d, activities: newActivities, isCompleted: isDayComplete };
                    }
                    return d;
                });
                await updateDoc(planRef, { schedule: newSchedule });
            }
        } catch (e) {
            throw e;
        }
    }
};
