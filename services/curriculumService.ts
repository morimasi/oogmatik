
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
        [ROL: KIDEMLİ NÖRO-PSİKOLOG VE BEP TASARIMCISI]

        GÖREV: Aşağıdaki detaylı öğrenci profili için ${durationDays} günlük, "Sarmal Öğrenme Modeli"ne dayalı bir Bireysel Eğitim Planı (BEP) oluştur.
        
        ÖĞRENCİ PROFİLİ:
        - İsim: ${student.name}
        - Yaş: ${student.age}
        - Sınıf: ${student.grade}
        - Tanılar: ${student.diagnosis?.join(', ') || 'Genel Gelişim'}
        - İLGİ ALANLARI: ${student.interests?.join(', ') || 'Karışık'}
        - ZAYIF YÖNLER (ÖNCELİKLİ HEDEF): ${student.weaknesses?.join(', ') || 'Genel Akademik'}

        SARMAL ÖĞRENME ALGORİTMASI:
        1. **1-2. Gün (Tanışma & Özgüven):** Öğrencinin ilgi alanlarını merkeze alan, başarı hissi yüksek kolay görevler.
        2. **3-5. Gün (Yoğun Müdahale):** Zayıf yönleri doğrudan hedefleyen, çapraz beceri gerektiren orta-zor görevler.
        3. **6. Gün (Transfer):** Öğrenilen beceriyi farklı bir tema içinde kullanma.
        4. **7. Gün (Değerlendirme & Pekiştirme):** Genel tekrar.

        ÖNEMLİ: Aktivite başlıklarını öğrencinin ilgi alanına göre "YENİDEN ADLANDIR". 
        Örn: İlgi alanı "Dinozor" ise "Harf Avı" -> "T-Rex'in Kayıp Harfleri" olsun.

        AKTİVİTE HAVUZU (Sadece buradaki ID'leri kullan):
        ${availableActivities}

        ÇIKTI: Sadece JSON döndür.
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                goals: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Haftalık klinik hedefler" },
                note: { type: Type.STRING, description: "Eğitmen için pedagojik not" },
                schedule: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            day: { type: Type.INTEGER },
                            focus: { type: Type.STRING, description: "Günün bilişsel odak noktası" },
                            activities: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        activityId: { type: Type.STRING },
                                        title: { type: Type.STRING, description: "İlgi alanına uyarlanmış başlık" },
                                        duration: { type: Type.INTEGER },
                                        goal: { type: Type.STRING, description: "Klinik gerekçe" },
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
