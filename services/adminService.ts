
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { DynamicActivity, PromptTemplate, PromptSnippet, StaticContentItem, ActivityDraft, PromptVersion } from '../types/admin';
import { UserRole, UserStatus } from '../types/core';
import { generateWithSchema, evaluateContent } from './geminiClient';
import { Type } from "@google/genai";

const { collection, doc, getDocs, setDoc, query, where, updateDoc, deleteDoc, getDoc } = firestore;

export const adminService = {
    // Tüm dinamik aktiviteleri getir
    getAllActivities: async (): Promise<DynamicActivity[]> => {
        try {
            const snapshot = await getDocs(collection(db, "config_activities"));
            return snapshot.docs.map(d => d.data() as DynamicActivity);
        } catch (e) {
            console.error("Dinamik aktiviteler yüklenemedi", e);
            return [];
        }
    },

    // --- ACTIVITY MANAGEMENT ---
    saveActivity: async (activity: DynamicActivity) => {
        const docRef = doc(db, "config_activities", activity.id);
        await setDoc(docRef, {
            ...activity,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    },

    saveActivitiesBulk: async (activities: DynamicActivity[]) => {
        const batch = firestore.writeBatch(db);
        activities.forEach(act => {
            const ref = doc(db, "config_activities", act.id);
            batch.set(ref, { ...act, updatedAt: new Date().toISOString() }, { merge: true });
        });
        await batch.commit();
    },

    // --- PROMPT MANAGEMENT ---
    getAllPrompts: async (): Promise<PromptTemplate[]> => {
        const snapshot = await getDocs(collection(db, "config_prompts"));
        return snapshot.docs.map(d => d.data() as PromptTemplate);
    },

    getPromptTemplate: async (id: string): Promise<PromptTemplate | null> => {
        const snap = await getDoc(doc(db, "config_prompts", id));
        return snap.exists() ? snap.data() as PromptTemplate : null;
    },

    getInitialPromptForActivity: (id: string) => {
        return `[GÖREV: ${id}]\nSen bir özel eğitim uzmanısın. Disleksi dostu içerik üret.\n\n[MİMARİ DNA]:\n{{blueprint}}`;
    },

    savePrompt: async (prompt: PromptTemplate, note: string): Promise<PromptTemplate> => {
        const newVersion = (prompt.version || 0) + 1;
        const historyItem: PromptVersion = {
            version: newVersion,
            updatedAt: new Date().toISOString(),
            template: prompt.template,
            systemInstruction: prompt.systemInstruction,
            changeLog: note
        };
        const updated: PromptTemplate = {
            ...prompt,
            version: newVersion,
            updatedAt: new Date().toISOString(),
            history: [...(prompt.history || []), historyItem]
        };
        await setDoc(doc(db, "config_prompts", prompt.id), updated);
        return updated;
    },

    testPrompt: async (prompt: PromptTemplate, vars: Record<string, string>) => {
        let appliedTemplate = prompt.template;
        Object.entries(vars).forEach(([k, v]) => {
            appliedTemplate = appliedTemplate.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
        });

        // Fix: Removed the third argument 'gemini-3-flash-preview' as generateWithSchema only expects two arguments
        return await generateWithSchema(appliedTemplate, { type: Type.OBJECT });
    },

    auditActivity: async (content: any) => {
        return await evaluateContent(content);
    },

    // --- SNIPPETS ---
    getAllSnippets: async (): Promise<PromptSnippet[]> => {
        const snapshot = await getDocs(collection(db, "config_snippets"));
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as PromptSnippet));
    },

    saveSnippet: async (snippet: PromptSnippet) => {
        const payload = { ...snippet, updatedAt: new Date().toISOString() };
        await setDoc(doc(db, "config_snippets", snippet.id), payload, { merge: true });
    },

    // --- STATIC CONTENT (CMS) ---
    getAllStaticContent: async (): Promise<StaticContentItem[]> => {
        const snapshot = await getDocs(collection(db, "config_static_content"));
        return snapshot.docs.map(d => d.data() as StaticContentItem);
    },

    saveStaticContent: async (item: StaticContentItem, note?: string) => {
        const oldDoc = await getDoc(doc(db, "config_static_content", item.id));
        const history = item.history || [];

        if (oldDoc.exists()) {
            const oldData = oldDoc.data() as StaticContentItem;
            history.unshift({
                data: oldData.data,
                updatedAt: oldData.updatedAt,
                note: note || 'Otomatik yedekleme'
            });
        }

        await setDoc(doc(db, "config_static_content", item.id), {
            ...item,
            history: history.slice(0, 10), // Son 10 sürümü sakla
            updatedAt: new Date().toISOString()
        });
    },

    // --- USER MANAGEMENT ---
    updateUserRole: async (userId: string, newRole: UserRole) => {
        await updateDoc(doc(db, "users", userId), { role: newRole });
    },

    updateUserStatus: async (userId: string, newStatus: UserStatus) => {
        await updateDoc(doc(db, "users", userId), { status: newStatus });
    },

    // --- DRAFTS (OCR) ---
    getAllDrafts: async (): Promise<ActivityDraft[]> => {
        const snapshot = await getDocs(collection(db, "activity_drafts"));
        return snapshot.docs.map(d => d.data() as ActivityDraft);
    },

    publishDraft: async (draft: ActivityDraft, config: any) => {
        await adminService.saveActivity({
            id: draft.id,
            ...config,
            isActive: true,
            isPremium: false,
            updatedAt: new Date().toISOString(),
            order: 999,
            engineConfig: {
                mode: 'ai_only',
                parameters: { allowDifficulty: true, allowDistraction: true, allowFontSize: true }
            }
        } as DynamicActivity);
        await deleteDoc(doc(db, "activity_drafts", draft.id));
    },

    refineActivityDraft: async (rawContent: string): Promise<Partial<DynamicActivity>> => {
        const prompt = `
            [GÖREV]
            Aşağıdaki ham OCR metnini analiz et ve bu metinden bir "Disleksi Dostu Aktivite" taslağı oluştur.
            
            [HAM METİN]
            ${rawContent}
            
            [ÇIKTI FORMATI - JSON]
            {
                "title": "Aktivite Başlığı",
                "description": "Pedagojik hedef ve uygulama açıklaması",
                "category": "visual-perception | phonological | working-memory | executive-function | math-logic",
                "targetSkills": ["beceri1", "beceri2"],
                "learningObjectives": ["hedef1", "hedef2"],
                "themeColor": "#HEX_COLOR",
                "icon": "font-awesome-icon-name"
            }
        `;

        const result = await generateWithSchema(prompt, {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                targetSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                learningObjectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                themeColor: { type: Type.STRING },
                icon: { type: Type.STRING }
            },
            required: ["title", "description", "category"]
        });

        return result;
    },

    deleteDraft: async (id: string) => {
        await deleteDoc(doc(db, "activity_drafts", id));
    }
};
