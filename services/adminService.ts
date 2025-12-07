
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { DynamicActivity, PromptTemplate } from '../types/admin';
import { ACTIVITIES } from '../constants';
import { PEDAGOGICAL_BASE } from './generators/prompts';
import { generateWithSchema } from './geminiClient';
import { Type } from '@google/genai';

const { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } = firestore;

export const adminService = {
    // --- ACTIVITIES ---
    getAllActivities: async (): Promise<DynamicActivity[]> => {
        try {
            const snapshot = await getDocs(collection(db, "config_activities"));
            if (snapshot.empty) {
                // Initialize from constants if DB is empty (First Run)
                const defaults = ACTIVITIES.map(a => ({
                    id: a.id,
                    title: a.title,
                    description: a.description,
                    icon: a.icon,
                    category: 'general',
                    isActive: true,
                    isPremium: false
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

        // Note: The generateWithSchema function sends the prompt to our proxy/backend.
        // The prompt constructed here simulates the full context.
        
        const fullContext = `
        [SYSTEM ROLE & INSTRUCTION]:
        ${prompt.systemInstruction}

        [TASK]:
        ${compiledPrompt}
        `;

        return await generateWithSchema(fullContext, genericSchema, prompt.modelConfig?.modelName || 'gemini-2.5-flash');
    }
};
