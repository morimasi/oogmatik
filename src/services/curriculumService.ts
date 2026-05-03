import { generateWithSchema } from './geminiClient.js';
import { Curriculum, CurriculumActivityStatus, Student } from '../types.js';
import { ACTIVITIES } from '../constants.js';
import { db } from './firebaseClient.js';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    doc, 
    deleteDoc, 
    updateDoc, 
    getDoc,
    QueryDocumentSnapshot
} from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

// Yardımcı Fonksiyon: Belli bir kategoriye ait aktivite ID'lerini filtreler
const _getActivitiesByTag = (_tag: string): string[] => {
    // Burada basit bir filtreleme yapılabilir, şimdilik tüm ID'leri dönelim
    // Gelişmiş versiyonda ACTIVITIES constant'ına 'tags' eklenip filtrelenebilir.
    return ACTIVITIES.map(a => a.id);
};

export const curriculumService = {
    generatePlan: async (
        student: Partial<Student>,
        durationDays: number = 7
    ): Promise<Curriculum> => {

        // Aktivite havuzunu daha kompakt hale getirerek 10.000 karakter sınırını koru
        const availableActivities = ACTIVITIES
            .map(a => `- ${a.id}: ${a.title}`)
            .join('\n');

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
        2. **Sarmal Yapı (Spiral Learning):** 
        3. **İlgi Alanı Entegrasyonu:** "goal" açıklamalarında öğrencinin sevdiği temaları kullan.

        KULLANILABİLİR AKTİVİTE HAVUZU (SADECE BUNLARI KULLAN):
        ${availableActivities}

        ...
        `;

        const schema = {
            type: 'OBJECT',
            properties: {
                goals: { type: 'ARRAY', items: { type: 'STRING' } },
                note: { type: 'STRING' },
                schedule: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            day: { type: 'INTEGER' },
                            focus: { type: 'STRING' },
                            activities: {
                                type: 'ARRAY',
                                items: {
                                    type: 'OBJECT',
                                    properties: {
                                        activityId: { type: 'STRING' },
                                        title: { type: 'STRING' },
                                        duration: { type: 'INTEGER' },
                                        goal: { type: 'STRING' },
                                        difficultyLevel: { type: 'STRING', enum: ['Easy', 'Medium', 'Hard'] }
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
                id: uuidv4(),
                status: 'pending' as CurriculumActivityStatus
            }))
        }));

        return {
            id: uuidv4(),
            studentId: student.id || undefined,
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
            querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
                const data = doc.data() as any;
                items.push({ ...data, id: doc.id });
            });
            return items.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        } catch (_e) {
            return [];
        }
    },

    getCurriculumsByStudent: async (studentId: string): Promise<Curriculum[]> => {
        try {
            const q = query(collection(db, "saved_curriculums"), where("studentId", "==", studentId));
            const querySnapshot = await getDocs(q);
            const items: Curriculum[] = [];
            querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
                const data = doc.data() as any;
                items.push({ ...data, id: doc.id });
            });
            return items.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        } catch (_e) {
            return [];
        }
    },

    deleteCurriculum: async (curriculumId: string): Promise<void> => {
        await deleteDoc(doc(db, "saved_curriculums", curriculumId));
    },

    getCurriculumById: async (curriculumId: string): Promise<Curriculum | null> => {
        const docRef = doc(db, "saved_curriculums", curriculumId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { ...(docSnap.data() as any), id: docSnap.id };
        }
        return null;
    }
};
