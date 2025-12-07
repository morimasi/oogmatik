
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { DynamicActivity, PromptTemplate, StaticContentItem } from '../types/admin';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';
import { PEDAGOGICAL_BASE } from './generators/prompts';
import { generateWithSchema } from './geminiClient';
import { Type } from '@google/genai';
import { PROVERBS, SAYINGS } from '../data/sentences';
import { TR_VOCAB } from '../data/vocabulary';
import { UserRole, UserStatus, ActivityType } from '../types';

const { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } = firestore;

export const adminService = {
    // --- ACTIVITIES ---
    getAllActivities: async (): Promise<DynamicActivity[]> => {
        try {
            const snapshot = await getDocs(collection(db, "config_activities"));
            if (snapshot.empty) {
                // Initialize from constants if DB is empty
                const defaults = ACTIVITIES.map(a => ({
                    id: a.id,
                    title: a.title,
                    description: a.description,
                    icon: a.icon,
                    category: ACTIVITY_CATEGORIES.find(c => c.activities.includes(a.id))?.id || 'general',
                    isActive: true,
                    isPremium: false,
                    promptId: `prompt_${a.id.toLowerCase()}`
                }));
                return defaults;
            }
            return snapshot.docs.map(d => d.data() as DynamicActivity);
        } catch (e) {
            console.error("Fetch activities failed", e);
            return [];
        }
    },

    saveActivity: async (activity: DynamicActivity) => {
        await setDoc(doc(db, "config_activities", activity.id), activity, { merge: true });
    },

    deleteActivity: async (id: string) => {
        await deleteDoc(doc(db, "config_activities", id));
    },

    // --- PROMPTS ---
    getAllPrompts: async (): Promise<PromptTemplate[]> => {
        try {
            const snapshot = await getDocs(collection(db, "config_prompts"));
            return snapshot.docs.map(d => d.data() as PromptTemplate);
        } catch (e) {
            console.error("Fetch prompts failed", e);
            return [];
        }
    },

    // --- REVERSE ENGINEER DEFAULT PROMPTS ---
    // This allows the admin to see the "current code logic" as a prompt text
    // instead of an empty box when they open an activity for the first time.
    getInitialPromptForActivity: (activityId: ActivityType): string => {
        const base = PEDAGOGICAL_BASE;
        const imgGuide = `
[GÖRSEL SANAT YÖNETMENİ]
"imagePrompt" alanı için: "Flat Vector Art, Educational, Minimalist, White Background" stilinde İngilizce betimleme yaz.
        `;

        let taskSpecific = "";

        // MATH LOGIC
        if (['BASIC_OPERATIONS', 'MATH_PUZZLE', 'NUMBER_PYRAMID'].includes(activityId)) {
            taskSpecific = `
GÖREV: Matematiksel içerik üret.
TÜR: ${activityId}
ZORLUK: {{difficulty}}
KONU: {{topic}}
İŞLEM TÜRÜ: {{operationType}} (Eğer belirtilmişse)

KURALLAR:
- Sayılar yaş seviyesine uygun olmalı.
- Sonuçlar tam sayı olmalı.
- "worksheetCount": {{worksheetCount}} adet üret.
            `;
        } 
        // VERBAL
        else if (['WORD_SEARCH', 'CROSSWORD', 'ANAGRAM'].includes(activityId)) {
            taskSpecific = `
GÖREV: Kelime oyunu içeriği üret.
TÜR: ${activityId}
KONU: {{topic}}
ZORLUK: {{difficulty}}

KURALLAR:
- Kelimeler konuyla ilgili olmalı.
- Harf hataları yapılmamalı.
- "itemCount": {{itemCount}} adet kelime/soru üret.
            `;
        }
        // READING
        else if (['STORY_COMPREHENSION', 'STORY_SEQUENCING'].includes(activityId)) {
            taskSpecific = `
GÖREV: Okuma anlama metni ve soruları.
KONU: {{topic}}
ZORLUK: {{difficulty}}

KURALLAR:
- Hikaye akıcı ve anlaşılır olsun.
- Disleksi dostu kısa cümleler kur.
- 5N 1K soruları ekle.
            `;
        }
        // VISUAL / ATTENTION
        else {
             taskSpecific = `
GÖREV: Görsel algı ve dikkat egzersizi.
TÜR: ${activityId}
ZORLUK: {{difficulty}}
ÖĞE SAYISI: {{itemCount}}

KURALLAR:
- Görsel betimlemeler (imagePrompt) çok detaylı olsun.
- Çeldiriciler mantıklı seçilsin.
            `;
        }

        return `${base}\n\n${taskSpecific}\n\n${imgGuide}\n\nÇIKTI (JSON): ...`;
    },

    savePrompt: async (prompt: PromptTemplate, changeLog: string = 'Update') => {
        const newVersionEntry = {
            version: prompt.version || 1,
            template: prompt.template,
            systemInstruction: prompt.systemInstruction,
            updatedAt: new Date().toISOString(),
            changeLog
        };

        const payload: PromptTemplate = { 
            ...prompt, 
            updatedAt: new Date().toISOString(), 
            version: (prompt.version || 0) + 1,
            history: [...(prompt.history || []), newVersionEntry]
        };

        await setDoc(doc(db, "config_prompts", prompt.id), payload, { merge: true });
        return payload;
    },

    deletePrompt: async (id: string) => {
        await deleteDoc(doc(db, "config_prompts", id));
    },

    // --- STATIC CONTENT ---
    getAllStaticContent: async (): Promise<StaticContentItem[]> => {
        try {
            const snapshot = await getDocs(collection(db, "static_content"));
            if (snapshot.empty) {
                return [
                    { id: 'proverbs', title: 'Atasözleri', type: 'list', data: PROVERBS, updatedAt: new Date().toISOString() },
                    { id: 'sayings', title: 'Özdeyişler', type: 'list', data: SAYINGS, updatedAt: new Date().toISOString() },
                    { id: 'vocab_animals', title: 'Kelime: Hayvanlar', type: 'list', data: TR_VOCAB.animals, updatedAt: new Date().toISOString() },
                    { id: 'vocab_school', title: 'Kelime: Okul', type: 'list', data: TR_VOCAB.school, updatedAt: new Date().toISOString() }
                ];
            }
            return snapshot.docs.map(d => d.data() as StaticContentItem);
        } catch (e) {
            console.error("Fetch static content failed", e);
            return [];
        }
    },

    saveStaticContent: async (content: StaticContentItem) => {
        await setDoc(doc(db, "static_content", content.id), {
            ...content,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    },

    // --- USER MANAGEMENT ---
    updateUserRole: async (userId: string, newRole: UserRole) => {
        await updateDoc(doc(db, "users", userId), { role: newRole });
    },

    updateUserStatus: async (userId: string, newStatus: UserStatus) => {
        await updateDoc(doc(db, "users", userId), { status: newStatus });
    },

    // --- SIMULATION ---
    testPrompt: async (prompt: PromptTemplate, testVariables: Record<string, any>) => {
        let compiledPrompt = prompt.template;
        
        Object.entries(testVariables).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            compiledPrompt = compiledPrompt.replace(regex, String(value));
        });

        // Use a generic schema for testing to see raw structure or partial structure
        const genericSchema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                data: { type: Type.ARRAY, items: { type: Type.OBJECT, description: "Dynamic content items" } }, 
                // Loose schema to allow most AI responses to pass
                items: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                questions: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT } },
            }
        };

        const fullContext = `
        [SYSTEM ROLE & INSTRUCTION]:
        ${prompt.systemInstruction}

        [TASK]:
        ${compiledPrompt}
        `;

        return await generateWithSchema(fullContext, genericSchema, prompt.modelConfig?.modelName || 'gemini-2.5-flash');
    }
};
