
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { DynamicActivity, PromptTemplate } from '../types/admin';
import { ACTIVITIES } from '../constants';
import { PEDAGOGICAL_BASE } from './generators/prompts';

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
                    category: 'general', // You might want to map real categories here
                    isActive: true,
                    isPremium: false
                }));
                // We don't save all at once to avoid write bursts, but return defaults
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
                        template: PEDAGOGICAL_BASE,
                        variables: [],
                        tags: ['core', 'system'],
                        updatedAt: new Date().toISOString(),
                        version: 1
                    },
                    {
                        id: 'math_puzzle',
                        name: 'Matematik Bulmacası',
                        description: 'Görsel matematik problemleri için şablon.',
                        template: `"${"{{difficulty}}"}" seviyesinde, '${"{{topic}}"}' temalı matematik.`,
                        variables: ['difficulty', 'topic'],
                        tags: ['math'],
                        updatedAt: new Date().toISOString(),
                        version: 1
                    }
                ];
            }
            return snapshot.docs.map(d => d.data() as PromptTemplate);
        } catch (e) {
            console.error("Fetch prompts failed", e);
            return [];
        }
    },

    savePrompt: async (prompt: PromptTemplate) => {
        const payload = { ...prompt, updatedAt: new Date().toISOString(), version: (prompt.version || 0) + 1 };
        await setDoc(doc(db, "config_prompts", prompt.id), payload, { merge: true });
    }
};
