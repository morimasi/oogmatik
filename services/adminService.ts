
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { DynamicActivity, PromptTemplate, PromptSnippet, StaticContentItem, ActivityDraft, PromptVersion } from '../types/admin';
import { UserRole, UserStatus } from '../types/core';
import { generateWithSchema } from './geminiClient';
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

    // Yeni aktiviteyi sisteme/menüye kaydet
    publishNewActivity: async (activity: DynamicActivity) => {
        const docRef = doc(db, "config_activities", activity.id);
        await setDoc(docRef, {
            ...activity,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    },

    // --- ACTIVITY MANAGEMENT ---
    saveActivity: async (activity: DynamicActivity) => {
        const docRef = doc(db, "config_activities", activity.id);
        await setDoc(docRef, activity, { merge: true });
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
        
        return await generateWithSchema(appliedTemplate, { type: Type.OBJECT }, 'gemini-3-flash-preview');
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

    saveStaticContent: async (item: StaticContentItem) => {
        await setDoc(doc(db, "config_static_content", item.id), {
            ...item,
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
        await adminService.publishNewActivity({
            id: draft.id,
            ...config,
            isActive: true,
            isPremium: false,
            updatedAt: new Date().toISOString(),
            engineConfig: { 
                mode: 'ai_only', 
                parameters: { allowDifficulty: true, allowDistraction: true, allowFontSize: true } 
            }
        } as DynamicActivity);
        await deleteDoc(doc(db, "activity_drafts", draft.id));
    },

    deleteDraft: async (id: string) => {
        await deleteDoc(doc(db, "activity_drafts", id));
    }
};
