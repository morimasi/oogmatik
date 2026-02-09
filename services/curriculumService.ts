
import { generateWithSchema } from './geminiClient';
import { Type } from "@google/genai";
import { Curriculum, ActivityType, CurriculumDay, CurriculumActivityStatus, Student } from '../types';
import { ACTIVITIES } from '../constants';
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";

const { collection, addDoc, query, where, getDocs, doc, deleteDoc, updateDoc, getDoc } = firestore;

export const curriculumService = {
    generatePlan: async (
        student: Partial<Student>,
        durationDays: number = 7
    ): Promise<Curriculum> => {
        
        const availableActivities = ACTIVITIES.map(a => `${a.id}: ${a.title}`).join('\n');

        const prompt = `
        [ROL: KIDEMLİ ÖZEL EĞİTİM PROGRAM GELİŞTİRİCİSİ VE NÖROPSİKOLOG]

        GÖREV: Aşağıdaki detaylı öğrenci profili için ${durationDays} günlük, "Spiral Öğrenme Modeli"ne dayalı bir Bireysel Eğitim Planı (BEP) oluştur.
        
        ÖĞRENCİ PROFİLİ:
        - İsim: ${student.name}
        - Yaş: ${student.age}
        - Sınıf: ${student.grade}
        - Tanılar: ${student.diagnosis?.join(', ') || 'Genel Gelişim'}
        - İLGİ ALANLARI: ${student.interests?.join(', ') || 'Belirtilmemiş'}
        - ZAYIF YÖNLER (HEDEF): ${student.weaknesses?.join(', ') || 'Akademik destek'}
        - ÖĞRENME STİLİ: ${student.learningStyle || 'Karma'}

        STRATEJİK TALİMATLAR:
        1. **Klinik Eşleşme:** Seçtiğin aktiviteler, öğrencinin 'zayıf yönlerini' doğrudan hedeflemelidir. 
        2. **İlgi Odaklı Kurgu:** Aktivite başlıklarını öğrencinin ilgi alanlarına göre uyarla. (Örn: İlgi alanı "Robotlar" ise "Robotun Hafıza Kartları" de).
        3. **Zorluk Projeksiyonu:** İlk 2 gün özgüven inşası için daha kolay, orta günler yoğun bilişsel yük, son günler ise pekiştirme odaklı olsun.

        AKTİVİTE HAVUZU:
        ${availableActivities}

        ÇIKTI: Sadece JSON döndür.
        {
            "goals": ["Örn: Görsel tarama hızını artırmak", "Örn: b-d harf ayrımını pekiştirmek"],
            "note": "Uygulama sırasında dikkat edilmesi gereken pedagojik öneri.",
            "schedule": [
                {
                    "day": 1,
                    "focus": "Günün Bilişsel Teması",
                    "activities": [
                        { 
                            "activityId": "ACTIVITY_ID", 
                            "title": "Özelleştirilmiş Başlık", 
                            "duration": 15, 
                            "goal": "Bu aktivitenin öğrenciye spesifik katkısı",
                            "difficultyLevel": "Easy | Medium | Hard" 
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
            studentId: student.id || null,
            studentName: student.name || 'Öğrenci',
            grade: student.grade || '',
            startDate: new Date().toISOString(),
            durationDays,
            goals: result.goals,
            schedule: schedule,
            note: result.note,
            interests: student.interests || [],
            weaknesses: student.weaknesses || []
        };
    },

    saveCurriculum: async (userId: string, curriculum: Curriculum): Promise<string> => {
        const payload = {
            ...curriculum,
            userId,
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

    // Fix: Added missing getCurriculumsByStudent function for dashboard and profile views
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
            console.error("Error fetching student curriculums:", e);
            return [];
        }
    },

    deleteCurriculum: async (id: string): Promise<void> => {
        await deleteDoc(doc(db, "saved_curriculums", id));
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
