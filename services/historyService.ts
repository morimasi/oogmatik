
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { HistoryItem, ActivityType } from '../types';

const { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit, writeBatch } = firestore;

export const historyService = {
    addToHistory: async (userId: string, item: Omit<HistoryItem, 'id'>): Promise<void> => {
        if (userId === 'guest') return; // Guests still use local or nothing
        
        const colRef = collection(db, "users", userId, "history");
        await addDoc(colRef, {
            ...item,
            data: JSON.stringify(item.data) // Safe serialization
        });
    },

    getHistory: async (userId: string): Promise<HistoryItem[]> => {
        if (userId === 'guest') return [];
        
        const colRef = collection(db, "users", userId, "history");
        const q = query(colRef, orderBy("timestamp", "desc"), limit(50));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                userId: data.userId,
                activityType: data.activityType as ActivityType,
                title: data.title,
                timestamp: data.timestamp,
                category: data.category,
                data: JSON.parse(data.data)
            };
        });
    },

    clearHistory: async (userId: string): Promise<void> => {
        const colRef = collection(db, "users", userId, "history");
        const snapshot = await getDocs(colRef);
        const batch = writeBatch(db);
        snapshot.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
    },

    deleteHistoryItem: async (userId: string, itemId: string): Promise<void> => {
        await deleteDoc(doc(db, "users", userId, "history", itemId));
    }
};
