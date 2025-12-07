
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
        // In a real scenario, we might want to let admin define the schema too.
        // For now, we assume a generic flexible object to see what AI returns.
        const genericSchema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                data: { type: Type.ARRAY, items: { type: Type.STRING } }, // Fallback
                pedagogicalNote: { type: Type.STRING }
            }
        };

        // Note: In production, you might pass the specific schema related to the activity type.
        // Here we just want to see if the AI understands the prompt instruction.
        
        // We prepend the System Instruction to the prompt for the simulation if using the simple generateWithSchema wrapper
        // ideally generateWithSchema should accept systemInstruction separately.
        // For now, we append it to prompt context.
        const fullPrompt = `
        [SYSTEM INSTRUCTION]: ${prompt.systemInstruction}
        
        [USER PROMPT]:
        ${compiledPrompt}
        `;

        return await generateWithSchema(fullPrompt, genericSchema, 'gemini-2.5-flash');
    }
};
