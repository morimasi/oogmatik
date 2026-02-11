
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
        const snapshot = await getDocs(collection(db, "config_activities"));
        return snapshot.docs.map(d => d.data() as DynamicActivity);
    },

    saveActivity: async (activity: DynamicActivity) => {
        await setDoc(doc(db, "config_activities", activity.id), activity, { merge: true });
    },

    // --- PROMPTS (MİMARİ MERKEZ) ---
    getAllPrompts: async (): Promise<PromptTemplate[]> => {
        const snapshot = await getDocs(collection(db, "config_prompts"));
        return snapshot.docs.map(d => d.data() as PromptTemplate);
    },

    getPromptTemplate: async (id: string): Promise<PromptTemplate | null> => {
        const snap = await getDoc(doc(db, "config_prompts", id));
        return snap.exists() ? snap.data() as PromptTemplate : null;
    },

    savePrompt: async (prompt: PromptTemplate, changeLog: string = 'Update') => {
        const newVersion: any = {
            version: (prompt.version || 0) + 1,
            template: prompt.template,
            systemInstruction: prompt.systemInstruction,
            updatedAt: new Date().toISOString(),
            changeLog
        };

        const updatedPrompt = {
            ...prompt,
            version: newVersion.version,
            updatedAt: newVersion.updatedAt,
            history: [...(prompt.history || []), newVersion]
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
        await setDoc(doc(db, "static_content", item.id), item, { merge: true });
    },

    // --- USERS ---
    updateUserRole: async (userId: string, newRole: UserRole) => {
        await updateDoc