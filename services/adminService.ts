
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { DynamicActivity, PromptTemplate, StaticContentItem } from '../types/admin';
import { ACTIVITIES } from '../constants';
import { PEDAGOGICAL_BASE } from './generators/prompts';
import { generateWithSchema } from './geminiClient';
import { Type } from '@google/genai';
import { PROVERBS, SAYINGS } from '../data/sentences';
import { TR_VOCAB } from '../data/vocabulary';

const { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } = firestore;

export const adminService = {
    // --- ACTIVITIES ---
    getAllActivities: async (): Promise<DynamicActivity[]> => {
        try {
            const snapshot = await getDocs(collection(db, "config_activities"));
            if (snapshot.empty) {
                // Initialize from constants if DB is empty (First Run / Migration)
                const defaults = ACTIVITIES.map(a => ({
                    id: a.id,
                    title: a.title,
                    description: a.description,
                    icon: a.icon,
                    category: 'general',
                    isActive: true,
                    isPremium: false
                }));
                // Opsiyonel: Veritabanına toplu yazma işlemi burada yapılabilir
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
            if (snapshot.empty) {
                // Return seed prompts if empty
                return [
                    {
                        id: 'pedagogical_base',
                        name: 'Pedagojik Temel',
                        description: 'Tüm promptların kullandığı temel pedagojik kurallar.',
                        systemInstruction: 'Sen uzman bir özel eğitim pedagogusun.',
                        template: PEDAGOGICAL_BASE,
                        variables: [],
                        tags: ['core', 'system'],
                        updatedAt: new Date().toISOString(),
                        version: 1,
                        history: []
                    }
                ];
            }
            return snapshot.docs.map(d => d.data() as PromptTemplate);
        } catch (e) {
            console.error("Fetch prompts failed", e);
            return [];
        }
    },

    savePrompt: async (prompt: PromptTemplate, changeLog: string = 'Update') => {
        // Create a version snapshot
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

    // --- STATIC CONTENT (Lists like Proverbs, Vocab) ---
    getAllStaticContent: async (): Promise<StaticContentItem[]> => {
        try {
            const snapshot = await getDocs(collection(db, "static_content"));
            if (snapshot.empty) {
                // Seed data structure for first use
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

    // --- SIMULATION (AI LAB) ---
    testPrompt: async (prompt: PromptTemplate, testVariables: Record<string, any>) => {
        let compiledPrompt = prompt.template;
        
        // Replace variables
        Object.entries(testVariables).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            compiledPrompt = compiledPrompt.replace(regex, String(value));
        });

        // Use a generic schema for testing to see raw structure
        const genericSchema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                data: { type: Type.ARRAY, items: { type: Type.OBJECT, description: "Dynamic content structure" } }, 
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
