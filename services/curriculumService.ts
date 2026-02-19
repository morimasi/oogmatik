
import { generateWithSchema } from './geminiClient';
import { Type } from "@google/genai";
import { Curriculum, ActivityType, CurriculumDay, CurriculumActivityStatus, Student } from '../types';
import { ACTIVITIES } from '../constants';
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";

const { collection, addDoc, query, where, getDocs, doc, deleteDoc, updateDoc, getDoc } = firestore;

// Yardımcı Fonksiyon: Belli bir kategoriye ait aktivite ID'lerini filtreler
const getActivitiesByTag = (tag: string): string[] => {
    // Burada basit bir filtreleme yapılabilir, şimdilik tüm ID'leri dönelim
    // Gelişmiş versiyonda ACTIVITIES constant'ına 'tags' eklenip filtrelenebilir.
    return ACTIVITIES.map(a => a.id);
};

export const curriculumService = {
    generatePlan: async (
        student: Partial<Student>,
        durationDays: number = 7
    ): Promise<Curriculum> => {
        
        // Tüm aktivitelerin ID ve Açıklamasını birleştir
        const availableActivities = ACTIVITIES.map(a => `- ${a.id}: ${a.title} (${a.description})`).join('\n');

        const prompt = `
        [ROL: KIDEMLİ NÖRO-PSİKOLOG VE BEP (BİREYSEL EĞİTİM PLANI) TASARIMCISI - GEMINI 3 FLASH THINKING]

        GÖREV: Öğrencinin klinik tablosuna ve ilgi alanlarına göre ${durationDays} günlük, kişiselleştirilmiş, bilimsel temelli bir Müfredat Planı oluştur.
        
        ÖĞRENCİ PROFİLİ:
        - Ad: ${student.name}
        - Yaş/Sınıf: ${student.age} yaş, ${student.grade}
        - İlgi Alanları: ${student.interests?.join(', ') || 'Genel çocuk ilgileri'}
        - Zayıf Yönler / Destek İhtiyaçları: ${student.weaknesses?.join(', ')}
        - Ek Klinik Notlar: ${student.notes || 'Yok'}

        THINKING PROTOKOLÜ (PLANLAMA STRATEJİSİ):
        1. **Semptom-Aktivite Eşleşmesi:** Öğrencinin zayıf yönlerini analiz et ve aşağıdaki listeden EN UYGUN aktivite ID'lerini seç.
           - Örn: "b/d karıştırıyor" -> MIRROR_LETTERS, FIND_LETTER_PAIR
           - Örn: "Okuma hızı yavaş" -> READING_FLOW, RAPID_NAMING
           - Örn: "Dikkat eksikliği" -> BURDON_TEST, STROOP_TEST
        2. **Sarmal Yapı (Spiral Learning):** 
           - İlk günler: Başarı hissi yaratacak, ilgi alanına uygun eğlenceli aktiviteler.
           - Orta günler: Zorlayıcı klinik çalışmalar (Semptom odaklı).
           - Son günler: Pekiştirme ve genelleme.
        3. **İlgi Alanı Entegrasyonu:** "goal" açıklamalarında öğrencinin sevdiği temaları kullan (Örn: "Uzay gemisi hızında okuma denemesi").

        KULLANILABİLİR AKTİVİTE HAVUZU (SADECE BUNLARI KULLAN):
        ${availableActivities}

        ÇIKTI FORMATI (JSON):
        {
          "goals": ["Genel Hedef 1", "Genel Hedef 2"],
          "note": "Uzman görüşü ve strateji özeti.",
          "schedule": [
            {
              "day": 1,
              "focus": "Günün odak konusu (Örn: Görsel Ayrıştırma)",
              "activities": [
                {
                  "activityId": "AKTIVITE_ID_LISTEDEN_SEC",
                  "title": "Aktivite Başlığı",
                  "duration": 15,
                  "difficultyLevel": "Easy",
                  "goal": "Öğrenciye özel, motive edici kısa hedef cümlesi."
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
