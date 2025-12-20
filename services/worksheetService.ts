
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { SavedWorksheet, SingleWorksheetData, ActivityType, StyleSettings, StudentProfile, CollectionItem, WorkbookSettings } from '../types';

const { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc, updateDoc, increment, writeBatch, getDoc } = firestore;

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
    sharedWith: docData.sharedWith,
    styleSettings: docData.styleSettings, // Load style settings if present
    studentProfile: docData.studentProfile, // Load student profile if present
    // Workbook specific fields
    workbookItems: docData.workbookItems ? JSON.parse(docData.workbookItems) : undefined,
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
        studentProfile?: StudentProfile
    ): Promise<SavedWorksheet> => {
        try {
            const safeCategory = category || { id: 'uncategorized', title: 'Genel' };
            const safeIcon = icon || 'fa-solid fa-file';
            
            // Create a payload object that will be sent to Firestore
            const payload: any = {
                userId,
                name: name || 'Adsız Etkinlik',
                activityType,
                worksheetData: serializeData(data),
                icon: safeIcon,
                category: { 
                    id: safeCategory.id || 'uncategorized', 
                    title: safeCategory.title || 'Genel' 
                },
                createdAt: new Date().toISOString(),
            };

            // Conditionally add optional fields to avoid Firestore 'undefined' error
            if (styleSettings) {
                payload.styleSettings = styleSettings;
            }
            if (studentProfile) {
                payload.studentProfile = studentProfile;
            }

            const docRef = await addDoc(collection(db, "saved_worksheets"), payload);

            // Increment user stats in Firestore
            const userRef = doc(db, "users", userId);
            // Fire and forget update
            updateDoc(userRef, { worksheetCount: increment(1) }).catch(console.warn);

            // Return with hydrated data for the UI
            return {
                ...mapDbToWorksheet(payload, docRef.id),
                worksheetData: data 
            };
        } catch (error) {
            console.error("Error saving worksheet:", error);
            throw error;
        }
    },

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
                worksheetData: "[]", // Empty for workbooks
                icon: 'fa-solid fa-book-journal-whills',
                category: { id: 'workbook', title: 'Çalışma Kitapçığı' },
                createdAt: new Date().toISOString(),
                workbookSettings: settings,
                workbookItems: serializeData(items) // Serialize complex items array
            };

            const docRef = await addDoc(collection(db, "saved_worksheets"), payload);

            const userRef = doc(db, "users", userId);
            updateDoc(userRef, { worksheetCount: increment(1) }).catch(console.warn);

            return mapDbToWorksheet(payload, docRef.id);
        } catch (error) {
            console.error("Error saving workbook:", error);
            throw error;
        }
    },

    getUserWorksheets: async (userId: string, page: number, pageSize: number): Promise<{ items: SavedWorksheet[], count: number | null }> => {
        try {
            // REMOVED orderBy("createdAt", "desc") to avoid index requirements error
            const q = query(
                collection(db, "saved_worksheets"), 
                where("userId", "==", userId)
            );
            
            const querySnapshot = await getDocs(q);
            const items: SavedWorksheet[] = [];
            
            querySnapshot.forEach((doc) => {
                // FIX: Cast doc.data() to any to access properties
                const data = doc.data() as any;
                if (!data.sharedWith) {
                    items.push(mapDbToWorksheet(data, doc.id));
                }
            });

            // Client-side sorting
            items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            return { items, count: items.length };
        } catch (error) {
            console.error("Error fetching worksheets:", error);
            return { items: [], count: 0 };
        }
    },

    deleteWorksheet: async (id: string) => {
        await deleteDoc(doc(db, "saved_worksheets", id));
    },

    deleteWorksheetsBulk: async (ids: string[]) => {
        const batch = writeBatch(db);
        ids.forEach(id => {
            const ref = doc(db, "saved_worksheets", id);
            batch.delete(ref);
        });
        await batch.commit();
    },

    updateWorksheetDetails: async (id: string, updates: { name?: string }) => {
        const ref = doc(db, "saved_worksheets", id);
        await updateDoc(ref, updates);
    },

    duplicateWorksheet: async (id: string): Promise<SavedWorksheet | null> => {
        const ref = doc(db, "saved_worksheets", id);
        const snapshot = await getDoc(ref);
        
        if (!snapshot.exists()) return null;
        
        const data = snapshot.data();
        const payload = {
            ...data,
            name: `${data.name} (Kopya)`,
            createdAt: new Date().toISOString()
        };
        
        const newRef = await addDoc(collection(db, "saved_worksheets"), payload);
        
        // Increment user stats
        if (data.userId) {
             const userRef = doc(db, "users", data.userId);
             updateDoc(userRef, { worksheetCount: increment(1) }).catch(console.warn);
        }

        return mapDbToWorksheet(payload, newRef.id);
    },

    shareWorksheet: async (worksheet: SavedWorksheet, senderId: string, senderName: string, receiverId: string): Promise<void> => {
        try {
            const safeCategory = worksheet.category || { id: 'uncategorized', title: 'Genel' };
            const safeIcon = worksheet.icon || 'fa-solid fa-share';

            const sharedPayload: any = {
                userId: senderId,
                name: worksheet.name || 'Paylaşılan Etkinlik',
                activityType: worksheet.activityType,
                worksheetData: serializeData(worksheet.worksheetData), // Serialize for sharing too
                icon: safeIcon,
                category: {
                    id: safeCategory.id || 'uncategorized',
                    title: safeCategory.title || 'Genel'
                },
                sharedBy: senderId,
                sharedByName: senderName || 'Anonim',
                sharedWith: receiverId,
                createdAt: new Date().toISOString(),
            };

            // Conditionally add optional fields
            if (worksheet.styleSettings) {
                sharedPayload.styleSettings = worksheet.styleSettings;
            }
            if (worksheet.studentProfile) {
                sharedPayload.studentProfile = worksheet.studentProfile;
            }
            if (worksheet.activityType === ActivityType.WORKBOOK) {
                sharedPayload.workbookItems = serializeData(worksheet.workbookItems);
                sharedPayload.workbookSettings = worksheet.workbookSettings;
            }

            await addDoc(collection(db, "saved_worksheets"), sharedPayload);
        } catch (error) {
            console.error("Error sharing worksheet:", error);
            throw error;
        }
    },

    getSharedWithMe: async (userId: string, page: number, pageSize: number): Promise<{ items: SavedWorksheet[], count: number | null }> => {
        try {
            // REMOVED orderBy("createdAt", "desc") to avoid index requirements error
            const q = query(
                collection(db, "saved_worksheets"), 
                where("sharedWith", "==", userId)
            );

            const querySnapshot = await getDocs(q);
            const items: SavedWorksheet[] = [];
            querySnapshot.forEach((doc) => {
                items.push(mapDbToWorksheet(doc.data(), doc.id));
            });

            // Client-side sorting
            items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            return { items, count: items.length };
        } catch (error) {
            console.error("Error fetching shared worksheets:", error);
            return { items: [], count: 0 };
        }
    }
};
