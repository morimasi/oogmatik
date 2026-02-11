
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { DynamicActivity, PromptTemplate, StaticContentItem, ActivityDraft, PromptSnippet } from '../types/admin';
import { ActivityType, UserRole, UserStatus } from '../types';
import { generateWithSchema } from './geminiClient';
import { Type } from '@google/genai';

const { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, orderBy, query } = firestore;

export const adminService = {
    // --- ACTIVITIES ---
    getAllActivities: async (): Promise<DynamicActivity[]> => {
        try {
            const snapshot = await getDocs(collection(db, "config_activities"));
            return snapshot.docs.map(d => d.data() as DynamicActivity);
        } catch (e) {
            console.error("Activities fetch error:", e);
            return [];
        }
    },

    saveActivity: async (activity: DynamicActivity) => {
        const activityRef = doc(db, "config_activities", activity.id);
        await setDoc(activityRef, {
            ...activity,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    },

    // --- PROMPTS ---
    getAllPrompts: async (): Promise<PromptTemplate[]> => {
        const snapshot = await getDocs(collection(db, "config_prompts"));
        return snapshot.docs.map(d => d.data() as PromptTemplate);
    },

    getPromptTemplate: async (id: string): Promise<PromptTemplate | null> => {
        const snap = await getDoc(doc(db, "config_prompts", id));
        return snap.exists() ? snap.data() as PromptTemplate : null;
    },

    savePrompt: async (prompt: PromptTemplate, changeLog: string = 'Sistem Güncellemesi') => {
        const newVersion: any = {
            version: (prompt.version || 0) + 1,
            template: prompt.template,
            systemInstruction: prompt.systemInstruction,
            updatedAt: new Date().toISOString(),
            changeLog,
            author: 'Admin'
        };

        const updatedPrompt = {
            ...prompt,
            version: newVersion.version,
            updatedAt: newVersion.updatedAt,
            history: [...(prompt.history || []), newVersion].slice(-10)
        };

        await setDoc(doc(db, "config_prompts", prompt.id), updatedPrompt);
        return updatedPrompt;
    },

    // --- SNIPPETS ---
    getAllSnippets: async (): Promise<PromptSnippet[]> => {
        const snapshot = await getDocs(collection(db, "config_snippets"));
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as PromptSnippet));
    },

    saveSnippet: async (snippet: PromptSnippet) => {
        const payload = { ...snippet, updatedAt: new Date().toISOString() };
        if (snippet.id.startsWith('new_')) {
            const { id, ...data } = payload;
            await addDoc(collection(db, "config_snippets"), data);
        } else {
            await setDoc(doc(db, "config_snippets", snippet.id), payload, { merge: true });
        }
    },

    // --- STATIC CONTENT ---
    getAllStaticContent: async (): Promise<StaticContentItem[]> => {
        const snapshot = await getDocs(collection(db, "static_content"));
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as StaticContentItem));
    },

    saveStaticContent: async (item: StaticContentItem) => {
        await setDoc(doc(db, "static_content", item.id), {
            ...item,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    },

    // --- USERS ---
    updateUserRole: async (userId: string, newRole: UserRole) => {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { role: newRole });
    },

    updateUserStatus: async (userId: string, newStatus: UserStatus) => {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { status: newStatus });
    },

    // --- DRAFTS ---
    getAllDrafts: async (): Promise<ActivityDraft[]> => {
        const snapshot = await getDocs(collection(db, "activity_drafts"));
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as ActivityDraft));
    },

    deleteDraft: async (id: string) => {
        await deleteDoc(doc(db, "activity_drafts", id));
    },

    publishDraft: async (draft: ActivityDraft, config: { title: string, description: string, icon: string, category: string }) => {
        const newActivity: DynamicActivity = {
            id: draft.id,
            title: config.title,
            description: config.description,
            icon: config.icon,
            category: config.category,
            isActive: true,
            isPremium: false,
            promptId: `prompt_${draft.id.toLowerCase()}`,
            order: 0,
            themeColor: '#6366f1',
            secondaryColor: '#4f46e5',
            animationType: 'fade',
            targetSkills: [],
            updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, "config_activities", newActivity.id), newActivity);
        await deleteDoc(doc(db, "activity_drafts", draft.id));
    },

    // --- SIMULATION ENGINE ---
    testPrompt: async (prompt: PromptTemplate, vars: Record<string, any>) => {
        let compiled = prompt.template;
        Object.entries(vars).forEach(([k, v]) => {
            compiled = compiled.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
        });

        const schema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                data: { 
                    type: Type.ARRAY, 
                    items: { 
                        type: Type.OBJECT, 
                        properties: { 
                            text: {type: Type.STRING}, 
                            val: {type: Type.NUMBER},
                            imagePrompt: {type: Type.STRING}
                        } 
                    } 
                }
            }
        };

        const config: any = {
            systemInstruction: prompt.systemInstruction,
            temperature: prompt.modelConfig?.temperature ?? 0.1,
            responseMimeType: "application/json",
            responseSchema: schema
        };

        if (prompt.modelConfig?.thinkingBudget && prompt.modelConfig.thinkingBudget > 0) {
            config.thinkingConfig = { thinkingBudget: prompt.modelConfig.thinkingBudget };
        }

        const model = prompt.modelConfig?.modelName || 'gemini-3-flash-preview';
        return await generateWithSchema(compiled, schema, model);
    },

    getInitialPromptForActivity: (id: string): string => {
        return `[ROL: UZMAN EĞİTİM TASARIMCISI]\nGÖREV: ${id} etkinliği için yüksek kaliteli içerik üret.\nKONU: {{topic}}\nZORLUK: {{difficulty}}\nADET: {{itemCount}}\n\nÇIKTI (JSON): { "title": "...", "instruction": "...", "data": [] }`;
    }
};
