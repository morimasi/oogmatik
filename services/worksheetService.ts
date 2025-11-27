import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { SavedWorksheet, SingleWorksheetData, ActivityType } from '../types';

const { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc, updateDoc, increment } = firestore;

// Mapper
const mapDbToWorksheet = (docData: any, id: string): SavedWorksheet => ({
    id: id,
    userId: docData.userId,
    name: docData.name,
    activityType: docData.activityType as ActivityType,
    worksheetData: docData.worksheetData as SingleWorksheetData[],
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
        const payload = {
            userId,
            name,
            activityType,
            worksheetData: data,
            icon,
            category,
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, "saved_worksheets"), payload);

        // Increment user stats in Firestore
        const userRef = doc(db, "users", userId);
        updateDoc(userRef, { worksheetCount: increment(1) }).catch(console.warn);

        return mapDbToWorksheet(payload, docRef.id);
    },

    getUserWorksheets: async (userId: string, page: number, pageSize: number): Promise<{ items: SavedWorksheet[], count: number | null }> => {
        try {
            const q = query(
                collection(db, "saved_worksheets"), 
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
                // Note: Firestore requires a composite index for this query. 
                // If it fails, check console for index creation link.
            );
            
            const querySnapshot = await getDocs(q);
            const items: SavedWorksheet[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Client-side filtering for sharedWith if index issues arise, 
                // or ensure "sharedWith" field exists/is null.
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
            userId: senderId, // Original owner ID kept for reference, but usually receiver views their own list
            // Actually, for "Shared With Me" view, we query where sharedWith == currentUserId
            
            name: worksheet.name,
            activityType: worksheet.activityType,
            worksheetData: worksheet.worksheetData,
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