
<<<<<<< HEAD
import { db } from './firebaseClient.js';
import * as firestore from "firebase/firestore";
import { DynamicActivity, PromptTemplate, PromptSnippet, StaticContentItem, ActivityDraft, PromptVersion } from '../types/admin.js';
import { UserRole, UserStatus } from '../types/core.js';
import { generateWithSchema, evaluateContent } from './geminiClient.js';
=======
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { DynamicActivity, PromptTemplate, PromptSnippet, StaticContentItem, ActivityDraft, PromptVersion } from '../types/admin';
import { UserRole, UserStatus } from '../types/core';
import { generateWithSchema, evaluateContent } from './geminiClient';
import { Type } from "@google/genai";
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060

const { collection, doc, getDocs, setDoc, query, where, updateDoc, deleteDoc, getDoc } = firestore;

export const adminService = {
    // Tüm dinamik aktiviteleri getir
    getAllActivities: async (): Promise<DynamicActivity[]> => {
        try {
            const snapshot = await getDocs(collection(db, "config_activities"));
            return snapshot.docs
<<<<<<< HEAD
                .map((d: any) => {
=======
                .map(d => {
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                    const data = d.data();
                    if (!data) return null;
                    return { ...data, id: d.id } as DynamicActivity;
                })
<<<<<<< HEAD
                .filter((a: any): a is DynamicActivity => !!a && !!a.id);
=======
                .filter((a): a is DynamicActivity => !!a && !!a.id);
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
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
        return snapshot.docs
<<<<<<< HEAD
            .map((d: any) => {
=======
            .map(d => {
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                const data = d.data();
                if (!data) return null;
                return { ...data, id: d.id } as PromptTemplate;
            })
<<<<<<< HEAD
            .filter((p: any): p is PromptTemplate => !!p && !!p.id);
=======
            .filter((p): p is PromptTemplate => !!p && !!p.id);
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
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
<<<<<<< HEAD
        return await generateWithSchema(appliedTemplate, { type: 'OBJECT' });
=======
        return await generateWithSchema(appliedTemplate, { type: Type.OBJECT });
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
    },

    auditActivity: async (content: any) => {
        return await evaluateContent(content);
    },

    // --- SNIPPETS ---
    getAllSnippets: async (): Promise<PromptSnippet[]> => {
        const snapshot = await getDocs(collection(db, "config_snippets"));
<<<<<<< HEAD
        return snapshot.docs.map((d: any) => ({ ...d.data(), id: d.id } as PromptSnippet));
=======
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as PromptSnippet));
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
    },

    saveSnippet: async (snippet: PromptSnippet) => {
        const payload = { ...snippet, updatedAt: new Date().toISOString() };
        await setDoc(doc(db, "config_snippets", snippet.id), payload, { merge: true });
    },

    // --- STATIC CONTENT (CMS) ---
    getAllStaticContent: async (): Promise<StaticContentItem[]> => {
        const snapshot = await getDocs(collection(db, "config_static_content"));
        return snapshot.docs
<<<<<<< HEAD
            .map((d: any) => {
=======
            .map(d => {
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                const data = d.data();
                if (!data) return null;
                return { ...data, id: d.id } as StaticContentItem;
            })
<<<<<<< HEAD
            .filter((i: any): i is StaticContentItem => !!i && !!i.id);
=======
            .filter((i): i is StaticContentItem => !!i && !!i.id);
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
    },

    saveStaticContent: async (item: StaticContentItem, note?: string) => {
        if (!item || !item.id) throw new Error("Gecersiz veri.");
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
        if (!userId) return;
        await updateDoc(doc(db, "users", userId), { role: newRole });
    },

    updateUserStatus: async (userId: string, newStatus: UserStatus) => {
        if (!userId) return;
        await updateDoc(doc(db, "users", userId), { status: newStatus });
    },

    // --- DRAFTS (OCR) ---
    getAllDrafts: async (): Promise<ActivityDraft[]> => {
        const snapshot = await getDocs(collection(db, "activity_drafts"));
        return snapshot.docs
<<<<<<< HEAD
            .map((d: any) => {
=======
            .map(d => {
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                const data = d.data();
                if (!data) return null;
                return { ...data, id: d.id } as ActivityDraft;
            })
<<<<<<< HEAD
            .filter((d: any): d is ActivityDraft => !!d && !!d.id);
=======
            .filter((d): d is ActivityDraft => !!d && !!d.id);
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
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
<<<<<<< HEAD
            type: 'OBJECT',
            properties: {
                title: { type: 'STRING' },
                description: { type: 'STRING' },
                category: { type: 'STRING' },
                targetSkills: { type: 'ARRAY', items: { type: 'STRING' } },
                learningObjectives: { type: 'ARRAY', items: { type: 'STRING' } },
                themeColor: { type: 'STRING' },
                icon: { type: 'STRING' }
=======
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                targetSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                learningObjectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                themeColor: { type: Type.STRING },
                icon: { type: Type.STRING }
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
            },
            required: ["title", "description", "category"]
        });

        return result;
    },

    deleteDraft: async (id: string) => {
        await deleteDoc(doc(db, "activity_drafts", id));
    },

    // Yeni aktiviteyi doğrudan sisteme yayınla (CreativeStudio → ActivityPublisher)
    publishNewActivity: async (activity: DynamicActivity) => {
        await adminService.saveActivity(activity);
    }
};
