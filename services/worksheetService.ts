
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { SavedWorksheet, SingleWorksheetData, ActivityType, StyleSettings, StudentProfile, CollectionItem, WorkbookSettings } from '../types';

const { collection, addDoc, query, where, getDocs, doc, updateDoc, increment, deleteDoc, getDoc } = firestore;

const serializeData = (data: any): string => {
    try {
        return JSON.stringify(data);
    } catch (e) {
        console.error("Serialization error", e);
        return "[]";
    }
};

const deserializeData = (data: any): SingleWorksheetData[] => {
    if (!data) return [];
    
    let parsed: any = [];
    if (typeof data === 'string') {
        try {
            parsed = JSON.parse(data);
        } catch (e) {
            console.error("Deserialization error", e);
            return [];
        }
    } else {
        parsed = data;
    }

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return [parsed];
    }

    return Array.isArray(parsed) ? parsed : [];
};

const mapDbToWorksheet = (docData: any, id: string): SavedWorksheet => ({
    id: id,
    userId: docData.userId,
    studentId: docData.studentId,
    name: docData.name,
    activityType: docData.activityType as ActivityType,
    worksheetData: deserializeData(docData.worksheetData),
    createdAt: docData.createdAt,
    icon: docData.icon || 'fa-solid fa-file',
    category: docData.category || { id: 'uncategorized', title: 'Kategorisiz' },
    sharedBy: docData.sharedBy,
    sharedByName: docData.sharedByName,
    sharedWith: docData.sharedWith,
    styleSettings: docData.styleSettings,
    studentProfile: docData.studentProfile,
    // Fixed: Cast deserialized data to CollectionItem[] to match type definition
    workbookItems: docData.workbookItems ? (deserializeData(docData.workbookItems) as unknown as CollectionItem[]) : undefined,
    workbookSettings: docData.workbookSettings
});

export const worksheetService = {
    saveWorksheet: async (
        userId: string, 
        name: string, 
        activityType: ActivityType, 
        data: SingleWorksheetData[], 
        icon: string,
        category: { id: string, title: string },
        styleSettings?: StyleSettings,
        studentProfile?: StudentProfile,
        studentId?: string
    ): Promise<SavedWorksheet> => {
        try {
            const payload: any = {
                userId,
                studentId: studentId || null,
                name: name || 'Adsız Etkinlik',
                activityType,
                worksheetData: serializeData(data),
                icon: icon || 'fa-solid fa-file',
                category: category || { id: 'uncategorized', title: 'Kategorisiz' },
                createdAt: new Date().toISOString(),
            };

            if (styleSettings) payload.styleSettings = styleSettings;
            if (studentProfile) payload.studentProfile = studentProfile;

            const docRef = await addDoc(collection(db, "saved_worksheets"), payload);
            const userRef = doc(db, "users", userId);
            updateDoc(userRef, { worksheetCount: increment(1) }).catch(console.warn);

            return {
                ...mapDbToWorksheet(payload, docRef.id),
                worksheetData: data 
            };
        } catch (error) {
            console.error("Error saving worksheet:", error);
            throw error;
        }
    },

    getUserWorksheets: async (userId: string, page: number, pageSize: number): Promise<{ items: SavedWorksheet[], count: number | null }> => {
        try {
            const q = query(collection(db, "saved_worksheets"), where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            const items: SavedWorksheet[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as any;
                if (!data.sharedWith) items.push(mapDbToWorksheet(data, doc.id));
            });
            items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return { items, count: items.length };
        } catch (error) {
            return { items: [], count: 0 };
        }
    },

    getWorksheetsByStudent: async (studentId: string): Promise<SavedWorksheet[]> => {
        try {
            const q = query(collection(db, "saved_worksheets"), where("studentId", "==", studentId));
            const querySnapshot = await getDocs(q);
            const items: SavedWorksheet[] = [];
            querySnapshot.forEach((doc) => {
                items.push(mapDbToWorksheet(doc.data(), doc.id));
            });
            items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return items;
        } catch (error) {
            console.error("Error fetching student worksheets:", error);
            return [];
        }
    },

    getSharedWithMe: async (userId: string, page: number, pageSize: number): Promise<{ items: SavedWorksheet[], count: number | null }> => {
        try {
            const q = query(
                collection(db, "saved_worksheets"), 
                where("sharedWith", "==", userId)
            );
            const querySnapshot = await getDocs(q);
            const items: SavedWorksheet[] = [];
            querySnapshot.forEach((doc) => {
                items.push(mapDbToWorksheet(doc.data(), doc.id));
            });
            items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return { items, count: items.length };
        } catch (error) {
            return { items: [], count: 0 };
        }
    },

    shareWorksheet: async (worksheet: any, senderId: string, senderName: string, receiverId: string): Promise<void> => {
        const payload = {
            ...worksheet,
            userId: senderId,
            sharedBy: senderId,
            sharedByName: senderName,
            sharedWith: receiverId,
            createdAt: new Date().toISOString()
        };
        
        if (Array.isArray(payload.worksheetData)) {
            payload.worksheetData = serializeData(payload.worksheetData);
        }
        if (Array.isArray(payload.workbookItems)) {
            payload.workbookItems = serializeData(payload.workbookItems);
        }
        
        await addDoc(collection(db, "saved_worksheets"), payload);
    },

    deleteWorksheet: async (id: string) => {
        await deleteDoc(doc(db, "saved_worksheets", id));
    },

    saveWorkbook: async (userId: string, settings: WorkbookSettings, items: CollectionItem[], studentId?: string): Promise<SavedWorksheet> => {
        try {
            const payload: any = {
                userId,
                studentId: studentId || null,
                name: settings.title || 'Adsız Kitapçık',
                activityType: ActivityType.WORKBOOK,
                worksheetData: "[]",
                icon: 'fa-solid fa-book-journal-whills',
                category: { id: 'workbook', title: 'Çalışma Kitapçığı' },
                createdAt: new Date().toISOString(),
                workbookSettings: settings,
                workbookItems: serializeData(items)
            };
            const docRef = await addDoc(collection(db, "saved_worksheets"), payload);
            return mapDbToWorksheet(payload, docRef.id);
        } catch (error) {
            throw error;
        }
    }
};
