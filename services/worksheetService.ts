import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { SavedWorksheet, SingleWorksheetData, ActivityType } from '../types';

const { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc, updateDoc, increment } = firestore;

// Helper to handle serialization of complex nested arrays (Firestore limitation)
const serializeData = (data: any): string => {
    try {
        return JSON.stringify(data);
    } catch (e) {
        console.error("Serialization error", e);
        return "[]";
    }
};

const deserializeData = (data: any): SingleWorksheetData[] => {
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Deserialization error", e);
            return [];
        }
    }
    // Backward compatibility for existing non-stringified data (if any)
    if (Array.isArray(data)) return data;
    return [];
};

// Mapper
const mapDbToWorksheet = (docData: any, id: string): SavedWorksheet => ({
    id: id,
    userId: docData.userId,
    name: docData.name,
    activityType: docData.activityType as ActivityType,
    worksheetData: deserializeData(docData.worksheetData),
    createdAt: docData.createdAt,
    icon: docData.icon || 'fa-solid fa-file',
    category: docData.category || { id: 'uncategorized', title: 'Genel' },
    sharedBy: docData.sharedBy,
    sharedByName: docData.sharedByName,
    sharedWith: docData.sharedWith
});

export const worksheetService = {
    saveWorksheet: async (
        userId: string, 
        name: string, 
        activityType: ActivityType, 
        data: SingleWorksheetData[], 
        icon: string,
        category: { id: string, title: string }
    ): Promise<SavedWorksheet> => {
        // Serialize worksheetData to string to avoid "Nested arrays not supported" error in Firestore
        const payload = {
            userId,
            name,
            activityType,
            worksheetData: serializeData(data),
            icon,
            category,
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, "saved_worksheets"), payload);

        // Increment user stats in Firestore
        const userRef = doc(db, "users", userId);
        updateDoc(userRef, { worksheetCount: increment(1) }).catch(console.warn);

        // Return with hydrated data for the UI
        return {
            ...mapDbToWorksheet(payload, docRef.id),
            worksheetData: data 
        };
    },

    getUserWorksheets: async (userId: string, page: number, pageSize: number): Promise<{ items: SavedWorksheet[], count: number | null }> => {
        try {
            const q = query(
                collection(db, "saved_worksheets"), 
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            );
            
            const querySnapshot = await getDocs(q);
            const items: SavedWorksheet[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (!data.sharedWith) {
                    items.push(mapDbToWorksheet(data, doc.id));
                }
            });

            return { items, count: items.length };
        } catch (error) {
            console.error("Error fetching worksheets:", error);
            return { items: [], count: 0 };
        }
    },

    deleteWorksheet: async (id: string) => {
        await deleteDoc(doc(db, "saved_worksheets", id));
    },

    shareWorksheet: async (worksheet: SavedWorksheet, senderId: string, senderName: string, receiverId: string): Promise<void> => {
        const sharedPayload = {
            userId: senderId,
            name: worksheet.name,
            activityType: worksheet.activityType,
            worksheetData: serializeData(worksheet.worksheetData), // Serialize for sharing too
            icon: worksheet.icon,
            category: worksheet.category,
            sharedBy: senderId,
            sharedByName: senderName,
            sharedWith: receiverId,
            createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, "saved_worksheets"), sharedPayload);
    },

    getSharedWithMe: async (userId: string, page: number, pageSize: number): Promise<{ items: SavedWorksheet[], count: number | null }> => {
        try {
            const q = query(
                collection(db, "saved_worksheets"), 
                where("sharedWith", "==", userId),
                orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);
            const items: SavedWorksheet[] = [];
            querySnapshot.forEach((doc) => {
                items.push(mapDbToWorksheet(doc.data(), doc.id));
            });

            return { items, count: items.length };
        } catch (error) {
            console.error("Error fetching shared worksheets:", error);
            return { items: [], count: 0 };
        }
    }
};