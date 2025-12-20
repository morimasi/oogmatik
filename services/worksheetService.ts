
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { SavedWorksheet, SingleWorksheetData, ActivityType, StyleSettings, StudentProfile, CollectionItem, WorkbookSettings } from '../types';

const { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, increment, getDoc } = firestore;

const serializeData = (data: any): string => {
    try { return JSON.stringify(data); } 
    catch (e) { return "[]"; }
};

const deserializeData = (data: any): SingleWorksheetData[] => {
    if (typeof data === 'string') {
        try { return JSON.parse(data); } 
        catch (e) { return []; }
    }
    return Array.isArray(data) ? data : [];
};

export const worksheetService = {
    // Saves a single worksheet activity
    saveWorksheet: async (
        userId: string, 
        name: string, 
        activityType: ActivityType, 
        data: SingleWorksheetData[], 
        icon: string,
        category: { id: string, title: string },
        styleSettings?: StyleSettings,
        studentProfile?: StudentProfile
    ): Promise<SavedWorksheet> => {
        try {
            const payload: any = {
                userId,
                name: name || 'Adsız Etkinlik',
                activityType,
                worksheetData: serializeData(data), // Save everything (including studio layout)
                icon: icon || 'fa-solid fa-file',
                category: category || { id: 'uncategorized', title: 'Genel' },
                createdAt: new Date().toISOString(),
            };

            if (styleSettings) payload.styleSettings = styleSettings;
            if (studentProfile) payload.studentProfile = studentProfile;

            const docRef = await addDoc(collection(db, "saved_worksheets"), payload);
            await updateDoc(doc(db, "users", userId), { worksheetCount: increment(1) });

            return { id: docRef.id, ...payload, worksheetData: data };
        } catch (error) {
            console.error("Error saving worksheet:", error);
            throw error;
        }
    },

    // Fixed: Added saveWorkbook method to resolve error in WorkbookView.tsx
    saveWorkbook: async (
        userId: string, 
        settings: WorkbookSettings, 
        items: CollectionItem[]
    ): Promise<SavedWorksheet> => {
        try {
            const payload: any = {
                userId,
                name: settings.title || 'Adsız Kitapçık',
                activityType: ActivityType.WORKBOOK,
                worksheetData: serializeData([]), // Workbooks use workbookItems
                icon: 'fa-solid fa-book-open-reader',
                category: { id: 'workbook', title: 'Kitapçıklarım' },
                createdAt: new Date().toISOString(),
                workbookItems: serializeData(items),
                workbookSettings: settings
            };

            const docRef = await addDoc(collection(db, "saved_worksheets"), payload);
            await updateDoc(doc(db, "users", userId), { worksheetCount: increment(1) });

            return { id: docRef.id, ...payload, worksheetData: [], workbookItems: items };
        } catch (error) {
            console.error("Error saving workbook:", error);
            throw error;
        }
    },

    // Fixed: Updated mapping to include workbookItems deserialization
    getUserWorksheets: async (userId: string, page: number, pageSize: number): Promise<{ items: SavedWorksheet[], count: number | null }> => {
        try {
            const q = query(collection(db, "saved_worksheets"), where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            const items: SavedWorksheet[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as any;
                if (!data.sharedWith) {
                    items.push({
                        id: doc.id,
                        ...data,
                        worksheetData: deserializeData(data.worksheetData),
                        workbookItems: data.workbookItems ? deserializeData(data.workbookItems) : undefined
                    });
                }
            });
            items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return { items, count: items.length };
        } catch (error) {
            return { items: [], count: 0 };
        }
    },

    deleteWorksheet: async (id: string) => {
        await deleteDoc(doc(db, "saved_worksheets", id));
    },

    // Fixed: shareWorksheet updated to support workbookItems
    shareWorksheet: async (worksheet: SavedWorksheet, senderId: string, senderName: string, receiverId: string): Promise<void> => {
        const sharedPayload: any = {
            ...worksheet,
            userId: senderId,
            worksheetData: serializeData(worksheet.worksheetData),
            workbookItems: worksheet.workbookItems ? serializeData(worksheet.workbookItems) : undefined,
            sharedBy: senderId,
            sharedByName: senderName,
            sharedWith: receiverId,
            createdAt: new Date().toISOString(),
        };
        delete sharedPayload.id;
        await addDoc(collection(db, "saved_worksheets"), sharedPayload);
    },

    // Fixed: getSharedWithMe updated to support workbookItems
    getSharedWithMe: async (userId: string, page: number, pageSize: number): Promise<{ items: SavedWorksheet[], count: number | null }> => {
        try {
            const q = query(collection(db, "saved_worksheets"), where("sharedWith", "==", userId));
            const querySnapshot = await getDocs(q);
            const items: SavedWorksheet[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as any;
                items.push({
                    id: doc.id,
                    ...data,
                    worksheetData: deserializeData(data.worksheetData),
                    workbookItems: data.workbookItems ? deserializeData(data.workbookItems) : undefined
                });
            });
            items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return { items, count: items.length };
        } catch (error) {
            return { items: [], count: 0 };
        }
    }
};
