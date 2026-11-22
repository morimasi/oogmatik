import { generateWithSchema } from './geminiClient.js';
import { Curriculum, CurriculumActivityStatus, CurriculumDay, CurriculumActivity, Student } from '../types.js';
import type { Difficulty } from '../types/common.js';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants.js';
import { db } from './firebaseClient.js';
import { logError } from '../utils/logger.js';
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

const LOCAL_STORAGE_KEY = 'bdmind_local_curriculums_v2';

export interface PlanGenerationOptions {
    planType?: 'clinical' | 'meb' | 'hybrid';
    selectedKazanimlar?: string[];
    subject?: string;
    focusAreas?: string[];
}

export const getActivityDomain = (activityId?: string): 'reading' | 'math' | 'visual' | 'attention' | 'general' => {
    if (!activityId) return 'general';
    for (const cat of ACTIVITY_CATEGORIES) {
        if (cat.activities.some(act => act === activityId)) {
            if (cat.id === 'math-logic') return 'math';
            if (cat.id === 'reading-comprehension' || cat.id === 'reading-verbal' || cat.id === 'creative-writing') return 'reading';
            if (cat.id === 'visual-perception') return 'visual';
            if (cat.id === 'memory-attention') return 'attention';
        }
    }
    const lower = String(activityId).toLowerCase();
    if (lower.includes('math') || lower.includes('toplama') || lower.includes('carpma') || lower.includes('sudoku') || lower.includes('sayi') || lower.includes('number')) return 'math';
    if (lower.includes('read') || lower.includes('okuma') || lower.includes('hece') || lower.includes('metin') || lower.includes('kelime') || lower.includes('letter')) return 'reading';
    if (lower.includes('visual') || lower.includes('gorsel') || lower.includes('cizim') || lower.includes('sekil') || lower.includes('harita') || lower.includes('pattern')) return 'visual';
    if (lower.includes('attention') || lower.includes('dikkat') || lower.includes('hafiza') || lower.includes('stroop')) return 'attention';
    return 'general';
};

const normalizeDifficulty = (val: unknown): Difficulty => {
    const s = String(val).trim().toLowerCase();
    if (s === 'kolay' || s === 'easy') return 'Kolay';
    if (s === 'zor' || s === 'hard') return 'Zor';
    return 'Orta';
};

// Yerel depolama yardımcıları (offline desteği)
const getLocalCurriculums = (): Curriculum[] => {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as Curriculum[]) : [];
    } catch {
        return [];
    }
};

const saveLocalCurriculums = (plans: Curriculum[]) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plans));
    } catch {
        // depolama doluysa yut
    }
};

const upsertLocalCurriculum = (plan: Curriculum) => {
    const plans = getLocalCurriculums();
    const idx = plans.findIndex(p => p.id === plan.id);
    if (idx >= 0) {
        plans[idx] = plan;
    } else {
        plans.unshift(plan);
    }
    saveLocalCurriculums(plans);
};

const removeLocalCurriculum = (planId: string) => {
    const plans = getLocalCurriculums().filter(p => p.id !== planId);
    saveLocalCurriculums(plans);
};

export const curriculumService = {
    generatePlan: async (
        student: Partial<Student>,
        durationDays: number = 7,
        options?: PlanGenerationOptions
    ): Promise<Curriculum> => {
        const planType = options?.planType || 'hybrid';
        const selectedKazanimlar = options?.selectedKazanimlar || [];

        // Aktivite havuzunu kompakt hale getir
        const availableActivities = ACTIVITIES
            .map(a => `- ${a.id}: ${a.title}`)
            .join('\n');

        const kazanimPromptPart = selectedKazanimlar.length > 0
            ? `\nMEB HEDEF KAZANIMLARI (Bu kazanımları günlere dağıtarak aktivitelere entegre et):\n${selectedKazanimlar.join('\n')}\n`
            : '';

        const prompt = `
        [ROL: KIDEMLİ NÖRO-PEDAGOJİK MİMAR VE MEB BEP TASARIMCISI - GEMINI 3 FLASH]

        GÖREV: Öğrencinin bireysel profilini, MEB müfredatını ve bilişsel ihtiyaçlarını esas alarak ${durationDays} günlük, bilimsel sarmal öğrenme (Spiral Learning) modeline dayalı bir Akıllı Müfredat Planı oluştur.
        
        ÖĞRENCİ BİLGİLERİ:
        - Ad: ${student.name || 'Öğrenci'}
        - Yaş/Sınıf: ${student.age || 8} yaş, ${student.grade || '2. Sınıf'}
        - Plan Türü: ${planType === 'meb' ? 'MEB Kazanım Odaklı' : planType === 'clinical' ? 'Bilişsel & Özel Eğitim Destek' : 'Hibrit (MEB + Özel Eğitim)'}
        - İlgi Alanları (Motivasyon Temaları): ${student.interests?.join(', ') || 'Uzay, Doğa, Robotlar'}
        - Destek İhtiyaçları / Zayıf Yönler: ${student.weaknesses?.join(', ') || 'Okuma hızı, dikkat'}
        - Ek Notlar: ${student.notes || 'Yok'}
        ${kazanimPromptPart}

        NÖRO-PEDAGOJİK STRATEJİ:
        1. **Yakınsal Gelişim Alanı (ZPD) & Güven İnşası:** 1. gün mutlaka öğrencinin hemen başarabileceği 'Kolay' seviye ile başla.
        2. **Sarmal Öğrenme:** 2-4. günlerde öğrenilen beceriyi farklı formatlarda pekiştir. Son günlerde 'Orta' veya 'Zor' aşamaya geç.
        3. **DEHB ve Disleksi Ergonomisi:** Günlük aktivite süreleri 15-20 dakikayı aşmamalı, sıfır bilişsel yorgunluk hedeflenmelidir.
        4. **Zorluk Seviyesi:** Her aktivite için YALNIZCA "Kolay", "Orta" veya "Zor" değerini ver.

        KULLANILABİLİR AKTİVİTE HAVUZU:
        ${availableActivities}
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
                            kazanimKod: { type: 'STRING' },
                            activities: {
                                type: 'ARRAY',
                                items: {
                                    type: 'OBJECT',
                                    properties: {
                                        activityId: { type: 'STRING' },
                                        title: { type: 'STRING' },
                                        duration: { type: 'INTEGER' },
                                        goal: { type: 'STRING' },
                                        difficultyLevel: { type: 'STRING', enum: ['Kolay', 'Orta', 'Zor', 'Easy', 'Medium', 'Hard'] },
                                        kazanimKod: { type: 'STRING' }
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

        const result = (await generateWithSchema(prompt, schema)) as Record<string, unknown>;

        const rawSchedule = Array.isArray(result?.schedule) ? result.schedule : [];
        const rawGoals = Array.isArray(result?.goals) ? (result.goals as string[]) : [];
        const rawNote = typeof result?.note === 'string' ? result.note : 'Plan başarıyla oluşturuldu.';

        const schedule: CurriculumDay[] = rawSchedule.map((dayObj: unknown) => {
            const day = (dayObj && typeof dayObj === 'object') ? (dayObj as Record<string, unknown>) : {};
            const rawActs = Array.isArray(day.activities) ? day.activities : [];
            const dayKazanim = typeof day.kazanimKod === 'string' ? day.kazanimKod : undefined;

            const activities: CurriculumActivity[] = rawActs.map((actObj: unknown) => {
                const act = (actObj && typeof actObj === 'object') ? (actObj as Record<string, unknown>) : {};
                const actId = typeof act.activityId === 'string' ? act.activityId : 'dyslexia-word-builder';
                const actTitle = typeof act.title === 'string' ? act.title : 'Destek Etkinliği';
                const diff = normalizeDifficulty(act.difficultyLevel);

                return {
                    id: uuidv4(),
                    activityId: actId,
                    title: actTitle,
                    duration: typeof act.duration === 'number' ? act.duration : 15,
                    goal: typeof act.goal === 'string' ? act.goal : 'Bilişsel Beceriyi Geliştirme',
                    difficultyLevel: diff,
                    status: 'pending' as CurriculumActivityStatus,
                    domain: getActivityDomain(actId),
                    kazanimKod: typeof act.kazanimKod === 'string' ? act.kazanimKod : dayKazanim,
                };
            });

            return {
                day: typeof day.day === 'number' ? day.day : 1,
                focus: typeof day.focus === 'string' ? day.focus : 'Bilişsel Destek',
                isCompleted: false,
                notes: '',
                kazanimKod: dayKazanim,
                activities
            };
        });

        const newCurriculum: Curriculum = {
            id: uuidv4(),
            studentId: student.id || undefined,
            studentName: student.name || 'Öğrenci',
            grade: student.grade || '',
            startDate: new Date().toISOString(),
            durationDays,
            goals: rawGoals.length > 0 ? rawGoals : ['Bilişsel Becerileri ve MEB Kazanımlarını Güçlendirme'],
            schedule,
            note: rawNote,
            interests: student.interests || [],
            weaknesses: student.weaknesses || [],
            planType,
            selectedKazanimlar,
            subject: options?.subject || 'Genel Bilişsel & MEB',
            status: 'active'
        };

        // Yerel önbelleğe de hemen ekle
        upsertLocalCurriculum(newCurriculum);

        return newCurriculum;
    },

    saveCurriculum: async (userId: string, curriculum: Curriculum): Promise<string> => {
        const payload = {
            ...curriculum,
            userId,
            createdAt: curriculum.createdAt || new Date().toISOString()
        };
        const { id, ...dataToSave } = payload;

        try {
            const docRef = await addDoc(collection(db, "saved_curriculums"), dataToSave);
            const savedWithId: Curriculum = { ...curriculum, id: docRef.id, userId };
            upsertLocalCurriculum(savedWithId);
            return docRef.id;
        } catch (_e) {
            logError('Firestore kayıt hatası, yerel önbelleğe kaydedildi', { error: _e instanceof Error ? _e.message : String(_e) });
            const localId = id || uuidv4();
            const savedWithId: Curriculum = { ...curriculum, id: localId, userId };
            upsertLocalCurriculum(savedWithId);
            return localId;
        }
    },

    updateCurriculum: async (curriculumId: string, updates: Partial<Curriculum>): Promise<void> => {
        // Önce yerel önbelleği güncelle
        const existingPlans = getLocalCurriculums();
        const planIdx = existingPlans.findIndex(p => p.id === curriculumId);
        if (planIdx >= 0) {
            existingPlans[planIdx] = { ...existingPlans[planIdx], ...updates };
            saveLocalCurriculums(existingPlans);
        }

        try {
            const planRef = doc(db, "saved_curriculums", curriculumId);
            await updateDoc(planRef, updates);
        } catch (_e) {
            logError('Firestore güncelleme hatası (yerelde güncellendi)', { error: _e instanceof Error ? _e.message : String(_e) });
        }
    },

    getUserCurriculums: async (userId: string): Promise<Curriculum[]> => {
        try {
            const q = query(collection(db, "saved_curriculums"), where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            const items: Curriculum[] = [];
            querySnapshot.forEach((docSnap: QueryDocumentSnapshot) => {
                const data = docSnap.data() as Record<string, unknown>;
                items.push({ ...(data as unknown as Curriculum), id: docSnap.id });
            });
            const sorted = items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            
            // Yerel önbelleğe kaydet
            if (sorted.length > 0) {
                saveLocalCurriculums(sorted);
                return sorted;
            }
        } catch (_e) {
            logError('Müfredatlar Firestore’dan okunamadı, yerel önbellekten dönülüyor', {
                error: _e instanceof Error ? _e.message : String(_e),
                context: 'getUserCurriculums'
            });
        }

        // Firestore boş veya hata verirse yerel veriyi dön
        const local = getLocalCurriculums().filter(p => !p.userId || p.userId === userId);
        return local.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    },

    getCurriculumsByStudent: async (studentId: string): Promise<Curriculum[]> => {
        try {
            const q = query(collection(db, "saved_curriculums"), where("studentId", "==", studentId));
            const querySnapshot = await getDocs(q);
            const items: Curriculum[] = [];
            querySnapshot.forEach((docSnap: QueryDocumentSnapshot) => {
                const data = docSnap.data() as Record<string, unknown>;
                items.push({ ...(data as unknown as Curriculum), id: docSnap.id });
            });
            if (items.length > 0) {
                return items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            }
        } catch (_e) {
            logError('Öğrenci müfredatları okunamadı', { error: _e instanceof Error ? _e.message : String(_e), context: 'getCurriculumsByStudent' });
        }

        const local = getLocalCurriculums().filter(p => p.studentId === studentId);
        return local.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    },

    deleteCurriculum: async (curriculumId: string): Promise<void> => {
        removeLocalCurriculum(curriculumId);
        try {
            await deleteDoc(doc(db, "saved_curriculums", curriculumId));
        } catch (_e) {
            logError('Firestore silme hatası (yerelden silindi)', { error: _e instanceof Error ? _e.message : String(_e) });
        }
    },

    getCurriculumById: async (curriculumId: string): Promise<Curriculum | null> => {
        try {
            const docRef = doc(db, "saved_curriculums", curriculumId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as Record<string, unknown>;
                return { ...(data as unknown as Curriculum), id: docSnap.id };
            }
        } catch (_e) {
            logError('Firestore getCurriculumById hatası', { error: _e instanceof Error ? _e.message : String(_e) });
        }

        const local = getLocalCurriculums().find(p => p.id === curriculumId);
        return local || null;
    },

    updateActivityStatus: async (curriculumId: string, day: number, activityId: string, status: CurriculumActivityStatus): Promise<void> => {
        // Önce yerel veriyi güncelle
        const existingPlans = getLocalCurriculums();
        const planIdx = existingPlans.findIndex(p => p.id === curriculumId);
        if (planIdx >= 0) {
            const plan = existingPlans[planIdx];
            const updatedSchedule = plan.schedule.map(d => {
                if (d.day === day) {
                    const acts = d.activities.map(a => a.id === activityId ? { ...a, status } : a);
                    return {
                        ...d,
                        activities: acts,
                        isCompleted: acts.every(a => a.status === 'completed')
                    };
                }
                return d;
            });
            existingPlans[planIdx] = { ...plan, schedule: updatedSchedule };
            saveLocalCurriculums(existingPlans);
        }

        try {
            const planRef = doc(db, "saved_curriculums", curriculumId);
            const docSnap = await getDoc(planRef);
            if (!docSnap.exists()) return;

            const data = docSnap.data() as Record<string, unknown>;
            const rawSched = Array.isArray(data.schedule) ? (data.schedule as CurriculumDay[]) : [];
            const newSchedule = rawSched.map(d => {
                if (d.day === day) {
                    const updatedActivities = d.activities.map(a =>
                        a.id === activityId ? { ...a, status } : a
                    );
                    return {
                        ...d,
                        activities: updatedActivities,
                        isCompleted: updatedActivities.every(a => a.status === 'completed')
                    };
                }
                return d;
            });

            await updateDoc(planRef, { schedule: newSchedule });
        } catch (_e) {
            logError('Firestore updateActivityStatus hatası (yerelde güncellendi)', { error: _e instanceof Error ? _e.message : String(_e) });
        }
    },

    updateDayNote: async (curriculumId: string, day: number, note: string): Promise<void> => {
        const existingPlans = getLocalCurriculums();
        const planIdx = existingPlans.findIndex(p => p.id === curriculumId);
        if (planIdx >= 0) {
            const plan = existingPlans[planIdx];
            const updatedSchedule = plan.schedule.map(d => d.day === day ? { ...d, notes: note } : d);
            existingPlans[planIdx] = { ...plan, schedule: updatedSchedule };
            saveLocalCurriculums(existingPlans);
        }

        try {
            const planRef = doc(db, "saved_curriculums", curriculumId);
            const docSnap = await getDoc(planRef);
            if (!docSnap.exists()) return;

            const data = docSnap.data() as Record<string, unknown>;
            const rawSched = Array.isArray(data.schedule) ? (data.schedule as CurriculumDay[]) : [];
            const newSchedule = rawSched.map(d => d.day === day ? { ...d, notes: note } : d);
            await updateDoc(planRef, { schedule: newSchedule });
        } catch (_e) {
            logError('Firestore updateDayNote hatası', { error: _e instanceof Error ? _e.message : String(_e) });
        }
    },

    updateDayFocus: async (curriculumId: string, day: number, focus: string): Promise<void> => {
        const existingPlans = getLocalCurriculums();
        const planIdx = existingPlans.findIndex(p => p.id === curriculumId);
        if (planIdx >= 0) {
            const plan = existingPlans[planIdx];
            const updatedSchedule = plan.schedule.map(d => d.day === day ? { ...d, focus } : d);
            existingPlans[planIdx] = { ...plan, schedule: updatedSchedule };
            saveLocalCurriculums(existingPlans);
        }

        try {
            const planRef = doc(db, "saved_curriculums", curriculumId);
            const docSnap = await getDoc(planRef);
            if (!docSnap.exists()) return;

            const data = docSnap.data() as Record<string, unknown>;
            const rawSched = Array.isArray(data.schedule) ? (data.schedule as CurriculumDay[]) : [];
            const newSchedule = rawSched.map(d => d.day === day ? { ...d, focus } : d);
            await updateDoc(planRef, { schedule: newSchedule });
        } catch (_e) {
            logError('Firestore updateDayFocus hatası', { error: _e instanceof Error ? _e.message : String(_e) });
        }
    }
};
