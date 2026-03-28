/**
 * OOGMATIK - Worksheet Service
 * Firestore CRUD + Error Handling + Permission Validation
 */

import { db } from './firebaseClient.js';
import * as firestore from "firebase/firestore";
import { SavedWorksheet, SingleWorksheetData, ActivityType, StyleSettings, StudentProfile, CollectionItem, WorkbookSettings } from '../types.js';
import { AppError, NotFoundError, AuthorizationError, _DatabaseError, InternalServerError, toAppError } from '../utils/AppError.js';
import { logError, _retryWithBackoff, _withTimeout } from '../utils/errorHandler.js';

// @ts-ignore - Vercel TS build might not resolve firebase types correctly with node resolution
const { collection, addDoc, query, where, getDocs, doc, updateDoc, increment, deleteDoc, getDoc, orderBy, limit, _startAfter } = firestore;

/**
 * Firestore timeout configurations (ms)
 */
const _FIRESTORE_TIMEOUT = 10000;
const _FIRESTORE_RETRY_CONFIG = {
    maxRetries: 3,
    initialDelay: 500,
    shouldRetry: (error: any) => {
        // Retry on network errors, not on permission errors
        const message = error?.message || '';
        return message.includes('DEADLINE_EXCEEDED') ||
            message.includes('UNAVAILABLE') ||
            message.includes('RESOURCE_EXHAUSTED');
    }
};

/**
 * Serialize worksheet data to JSON string
 */
const serializeData = (data: any): string => {
    try {
        return JSON.stringify(data);
    } catch (e) {
        logError(
            new InternalServerError('Veri serileştirilemedi'),
            { context: 'serializeData', originalError: e }
        );
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
            try {
                await updateDoc(userRef, { worksheetCount: increment(1) });
            } catch (countErr) {
                console.warn("worksheetCount güncellenemedi:", countErr);
            }

            return {
                ...mapDbToWorksheet(payload, docRef.id),
                worksheetData: data
            };
        } catch (error) {
            console.error("Error saving worksheet:", error);
            throw error;
        }
    },

    getUserWorksheets: async (userId: string, page: number, pageSize: number, categoryId?: string): Promise<{ items: SavedWorksheet[], count: number | null }> => {
        try {
            // Only fetch private (not shared) worksheets for this user
            let q = query(
                collection(db, "saved_worksheets"),
                where("userId", "==", userId),
                where("sharedWith", "==", null)
            );

            if (categoryId && categoryId !== 'all') {
                q = query(q, where("category.id", "==", categoryId));
            }

            q = query(q, orderBy("createdAt", "desc"), limit(pageSize));

            // Note: This needs a composite index in Firestore (userId, sharedWith, category.id, createdAt)
            const querySnapshot = await getDocs(q);
            const items: SavedWorksheet[] = [];
            querySnapshot.forEach((doc) => {
                items.push(mapDbToWorksheet(doc.data(), doc.id));
            });

            return { items, count: null };
        } catch (error) {
            console.warn("Firestore Query Error (Index likely missing):", error);
            // Fallback to client-side filter if index is missing
            const qFallback = query(collection(db, "saved_worksheets"), where("userId", "==", userId));
            const querySnapshot = await getDocs(qFallback);
            const items: SavedWorksheet[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as any;
                if (!data.sharedWith) items.push(mapDbToWorksheet(data, doc.id));
            });

            let filtered = items;
            if (categoryId && categoryId !== 'all') {
                filtered = items.filter(i => i.category?.id === categoryId);
            }

            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return { items: filtered.slice(page * pageSize, (page + 1) * pageSize), count: filtered.length };
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
            // Updated to use array-contains for sharedWith to support multiple receivers
            const q = query(
                collection(db, "saved_worksheets"),
                where("sharedWith", "array-contains", userId),
                orderBy("createdAt", "desc"),
                limit(pageSize)
            );
            const querySnapshot = await getDocs(q);
            const items: SavedWorksheet[] = [];
            querySnapshot.forEach((doc) => {
                items.push(mapDbToWorksheet(doc.data(), doc.id));
            });
            return { items, count: null };
        } catch (error) {
            console.warn("Firestore Shared Query Error:", error);
            // Fallback for missing index
            const qFallback = query(
                collection(db, "saved_worksheets")
            );
            const querySnapshot = await getDocs(qFallback);
            const items: SavedWorksheet[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as any;
                const sharedWith = data.sharedWith;
                if (sharedWith === userId || (Array.isArray(sharedWith) && sharedWith.includes(userId))) {
                    items.push(mapDbToWorksheet(data, doc.id));
                }
            });
            items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return { items: items.slice(page * pageSize, (page + 1) * pageSize), count: items.length };
        }
    },

    shareWorksheet: async (worksheetId: string, senderId: string, senderName: string, receiverIds: string | string[]): Promise<void> => {
        const docRef = doc(db, "saved_worksheets", worksheetId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new NotFoundError('Paylaşılacak çalışma sayfası bulunamadı');
        }

        const data = docSnap.data();
        const currentSharedWith = data.sharedWith || [];
        const receivers = Array.isArray(receiverIds) ? receiverIds : [receiverIds];

        // Merge receivers into sharedWith array, avoiding duplicates
        const updatedSharedWith = Array.isArray(currentSharedWith)
            ? [...new Set([...currentSharedWith, ...receivers])]
            : [...new Set([currentSharedWith, ...receivers])].filter(i => i);

        await updateDoc(docRef, {
            sharedWith: updatedSharedWith,
            sharedBy: senderId,
            sharedByName: senderName,
            updatedAt: new Date().toISOString()
        });
    },

    /**
     * Get single worksheet by ID with access control
     * @throws {NotFoundError} If worksheet doesn't exist
     * @throws {AuthorizationError} If user doesn't have access
     */
    getWorksheetById: async (worksheetId: string, userId: string): Promise<SavedWorksheet> => {
        try {
            const docRef = doc(db, "saved_worksheets", worksheetId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                throw new NotFoundError('Çalışma sayfası bulunamadı');
            }

            const data = docSnap.data();
            const worksheet = mapDbToWorksheet(data, docSnap.id);

            // Access control: Owner or shared with user
            const isOwner = worksheet.userId === userId;
            const isShared = worksheet.sharedWith === userId ||
                (Array.isArray(worksheet.sharedWith) && worksheet.sharedWith.includes(userId));

            if (!isOwner && !isShared) {
                throw new AuthorizationError('Bu çalışma sayfasına erişim izniniz yok');
            }

            return worksheet;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            const appError = toAppError(error);
            logError(appError, {
                context: 'getWorksheetById',
                worksheetId,
                userId
            });
            throw appError;
        }
    },

    /**
     * Update worksheet with ownership check
     * @throws {NotFoundError} If worksheet doesn't exist
     * @throws {AuthorizationError} If user is not owner
     */
    updateWorksheet: async (
        worksheetId: string,
        userId: string,
        updateData: Partial<SavedWorksheet>
    ): Promise<SavedWorksheet> => {
        try {
            const docRef = doc(db, "saved_worksheets", worksheetId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                throw new NotFoundError('Çalışma sayfası bulunamadı');
            }

            const data = docSnap.data();

            // Verify ownership
            if (data.userId !== userId) {
                throw new AuthorizationError('Bu çalışmayı düzenleme izniniz yok');
            }

            // Prepare update payload
            const payload = { ...updateData };
            delete (payload as any).id;
            delete (payload as any).userId;
            delete (payload as any).createdAt;
            (payload as any).updatedAt = new Date().toISOString();

            // Serialize if needed
            if (payload.worksheetData && Array.isArray(payload.worksheetData)) {
                (payload as any).worksheetData = serializeData(payload.worksheetData);
            }
            if (payload.workbookItems && Array.isArray(payload.workbookItems)) {
                (payload as any).workbookItems = serializeData(payload.workbookItems);
            }

            await updateDoc(docRef, payload);

            // Return updated worksheet
            return mapDbToWorksheet({ ...data, ...payload }, worksheetId);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            const appError = toAppError(error);
            logError(appError, {
                context: 'updateWorksheet',
                worksheetId,
                userId
            });
            throw appError;
        }
    },

    /**
     * Delete worksheet with ownership check
     * @throws {NotFoundError} If worksheet doesn't exist
     * @throws {AuthorizationError} If user is not owner
     */
    deleteWorksheet: async (worksheetId: string, userId: string): Promise<void> => {
        try {
            const docRef = doc(db, "saved_worksheets", worksheetId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                throw new NotFoundError('Çalışma sayfası bulunamadı');
            }

            const data = docSnap.data();

            // Verify ownership
            if (data.userId !== userId) {
                throw new AuthorizationError('Bu çalışmayı silme izniniz yok');
            }

            await deleteDoc(docRef);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            const appError = toAppError(error);
            logError(appError, {
                context: 'deleteWorksheet',
                worksheetId,
                userId
            });
            throw appError;
        }
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
