/**
 * BDMIND - Worksheet Service
 * Firestore CRUD + Error Handling + Permission Validation
 */

import { db } from './firebaseClient.js';
import * as firestore from "firebase/firestore";
import { SavedWorksheet, SingleWorksheetData, ActivityType, StyleSettings, StudentProfile, CollectionItem } from '../types.js';
import { ACTIVITY_CATEGORIES } from '../constants.js';
import { AppError, NotFoundError, AuthorizationError, DatabaseError, InternalServerError, toAppError } from '../utils/AppError.js';
import { logError as reportError, retryWithBackoff, withTimeout } from '../utils/errorHandler.js';

import { logInfo, logError, logWarn } from '../utils/logger.js';
import { useStudentStore } from '../store/useStudentStore.js';
// @ts-ignore - Vercel TS build might not resolve firebase types correctly with node resolution
const { collection, addDoc, query, where, getDocs, doc, updateDoc, increment, deleteDoc, getDoc, orderBy, limit } = firestore;

/**
 * Firestore timeout configurations (ms)
 */
const _FIRESTORE_TIMEOUT = 10000;
const _FIRESTORE_RETRY_CONFIG = {
    maxRetries: 3,
    initialDelay: 500,
    shouldRetry: (error: unknown) => {
        // Retry on network errors, not on permission errors
        const message = error instanceof Error ? error.message : (error as Record<string, unknown>)?.message || '';
        return typeof message === 'string' && (message.includes('DEADLINE_EXCEEDED') ||
            message.includes('UNAVAILABLE') ||
            message.includes('RESOURCE_EXHAUSTED'));
    }
};

/**
 * Serialize worksheet data to JSON string
 */
const serializeData = (data: unknown): string => {
    try {
        return JSON.stringify(data);
    } catch (e) {
        reportError(
            new InternalServerError('Veri serileştirilemedi'),
            { context: 'serializeData', originalError: e }
        );
        return "[]";
    }
};

const deserializeData = (data: unknown): SingleWorksheetData[] => {
    if (!data) return [];

    let parsed: unknown = [];
    if (typeof data === 'string') {
        try {
            parsed = JSON.parse(data);
        } catch (e) {
            logError("Deserialization error", { error: e });
            return [];
        }
    } else {
        parsed = data;
    }

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return [parsed as SingleWorksheetData];
    }

    return Array.isArray(parsed) ? (parsed as SingleWorksheetData[]) : [];
};

/**
 * Arşiv filtresi: Firestore'a yazılmış category.id veya aktivite üyeliği ile tüm CONTENT kategorileri kapsanır.
 */
export function worksheetMatchesArchiveCategory(sheet: SavedWorksheet, categoryId: string): boolean {
    if (categoryId === 'all') return true;
    const meta = ACTIVITY_CATEGORIES.find((c) => c.id === categoryId);
    if (sheet.category?.id === categoryId) return true;
    if (!meta) return sheet.category?.id === categoryId;
    return (meta.activities as readonly ActivityType[]).includes(sheet.activityType);
}

const _MAX_ARCHIVE_ROWS = 2800;

const mapDbToWorksheet = (docData: firestore.DocumentData, id: string): SavedWorksheet => ({
    id: id,
    userId: docData.userId as string,
    studentId: docData.studentId as string | undefined,
    studentName: docData.studentName as string | undefined,
    name: docData.name as string,
    activityType: docData.activityType as ActivityType,
    worksheetData: deserializeData(docData.worksheetData),
    createdAt: docData.createdAt as string,
    icon: docData.icon as string || 'fa-solid fa-file',
    category: docData.category as { id: string; title: string } || { id: 'uncategorized', title: 'Kategorisiz' },
    sharedBy: docData.sharedBy as string | undefined,
    sharedByName: docData.sharedByName as string | undefined,
    sharedWith: docData.sharedWith as string | string[] | undefined,
    styleSettings: docData.styleSettings as StyleSettings | undefined,
    studentProfile: docData.studentProfile as StudentProfile | undefined
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
        studentId?: string,
        studentName?: string
    ): Promise<SavedWorksheet> => {
        try {
            // Global activeStudent'ı al (hangi bileşenden çağrılırsa çağrılsın tutarlılık sağla)
            const { activeStudent } = useStudentStore.getState();
            const finalStudentId = studentId || activeStudent?.id || null;
            const finalStudentName = studentName || activeStudent?.name || null;

            const payload: Record<string, unknown> = {
                userId,
                studentId: finalStudentId,
                studentName: finalStudentName,
                name: name || 'Adsız Etkinlik',
                activityType,
                worksheetData: serializeData(data),
                icon: icon || 'fa-solid fa-file',
                category: category || { id: 'uncategorized', title: 'Kategorisiz' },
                createdAt: new Date().toISOString(),
            };

            if (styleSettings) payload.styleSettings = styleSettings;
            if (studentProfile) payload.studentProfile = studentProfile;

            const docRef = await retryWithBackoff(
                () => addDoc(collection(db, "saved_worksheets"), payload),
                { maxRetries: 3 }
            );
            const userRef = doc(db, "users", userId);
            try {
                await retryWithBackoff(
                    () => updateDoc(userRef, { worksheetCount: increment(1) }),
                    { maxRetries: 3 }
                );
            } catch (countErr) {
                logWarn("worksheetCount güncellenemedi", { error: countErr });
            }

            return {
                ...mapDbToWorksheet(payload, docRef.id),
                worksheetData: data
            };
        } catch (error) {
            logError("Error saving worksheet", { error });
            throw error;
        }
    },

    /** Kullanıcı arşivi: gerçek sayfalama + tüm CONTENT kategorileri (activityType ∪ category.id) */
    getUserWorksheets: async (
        userId: string,
        page: number,
        pageSize: number,
        categoryId?: string
    ): Promise<{ items: SavedWorksheet[]; total: number; count: number | null }> => {
        try {
            // First try with orderBy (requires index)
            let qRef;
            try {
                qRef = query(
                    collection(db, 'saved_worksheets'),
                    where('userId', '==', userId),
                    orderBy('createdAt', 'desc')
                );
            } catch (e) {
                // If query construction fails, fallback to simple filtering
                qRef = query(
                    collection(db, 'saved_worksheets'),
                    where('userId', '==', userId)
                );
            }

            const querySnapshot = await getDocs(qRef);
            const rows: SavedWorksheet[] = [];
            querySnapshot.forEach((d: firestore.QueryDocumentSnapshot<firestore.DocumentData>) => {
                const data = d.data();
                rows.push(mapDbToWorksheet(data, d.id));
            });

            // Ensure sorting in memory in case the Firestore index is missing or query was simple
            rows.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });

            let pool = rows;
            if (rows.length > _MAX_ARCHIVE_ROWS) {
                logWarn('Arşiv satır üst limiti kesildi', { userId, n: rows.length, cap: _MAX_ARCHIVE_ROWS });
                pool = rows.slice(0, _MAX_ARCHIVE_ROWS);
            }

            const filtered =
                categoryId && categoryId !== 'all'
                    ? pool.filter((s) => worksheetMatchesArchiveCategory(s, categoryId))
                    : pool;

            const total = filtered.length;
            const sliced = filtered.slice(page * pageSize, (page + 1) * pageSize);
            
            logInfo(' getUserWorksheets başarıyla yüklendi', { 
                userId, 
                count: sliced.length, 
                total 
            });

            return { items: sliced, total, count: total };
        } catch (error: unknown) {
            const err = error as Record<string, unknown>;
            logError('getUserWorksheets yükleme hatası', { error: err?.message || error });
            // If it's a failed-precondition, it's almost certainly a missing index
            if (err?.code === 'failed-precondition') {
                logWarn('Firestore indeksi eksik! İndeks oluşturulana kadar basit sorgu kullanılacak.');
                // Try one more time with zero ordering (Firestore will return in arbitrary order, we sort in memory)
                try {
                     const fallbackQ = query(
                        collection(db, 'saved_worksheets'),
                        where('userId', '==', userId)
                    );
                    const snap = await getDocs(fallbackQ);
                    const fallbackRows: SavedWorksheet[] = [];
                    snap.forEach((d: firestore.QueryDocumentSnapshot<firestore.DocumentData>) => fallbackRows.push(mapDbToWorksheet(d.data(), d.id)));
                    fallbackRows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    
                    const filtered = categoryId && categoryId !== 'all'
                        ? fallbackRows.filter((s) => worksheetMatchesArchiveCategory(s, categoryId))
                        : fallbackRows;

                    return { 
                        items: filtered.slice(page * pageSize, (page + 1) * pageSize), 
                        total: filtered.length, 
                        count: filtered.length 
                    };
                } catch (fallbackError) {
                    logError('Fallback query also failed', { error: fallbackError });
                }
            }
            return { items: [], total: 0, count: 0 };
        }
    },

    getWorksheetsByStudent: async (studentId: string): Promise<SavedWorksheet[]> => {
        try {
            const q = query(collection(db, "saved_worksheets"), where("studentId", "==", studentId));
            const querySnapshot = await getDocs(q);
            const items: SavedWorksheet[] = [];
            querySnapshot.forEach((doc: firestore.QueryDocumentSnapshot<firestore.DocumentData>) => {
                items.push(mapDbToWorksheet(doc.data(), doc.id));
            });
            items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return items;
        } catch (error) {
            logError("Error fetching student worksheets", { error });
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
            querySnapshot.forEach((doc: firestore.QueryDocumentSnapshot<firestore.DocumentData>) => {
                items.push(mapDbToWorksheet(doc.data(), doc.id));
            });
            return { items, count: null };
        } catch (error) {
            logWarn("Firestore Shared Query Error", { error });
            // Fallback for missing index
            const qFallback = query(
                collection(db, "saved_worksheets")
            );
            const querySnapshot = await getDocs(qFallback);
            const items: SavedWorksheet[] = [];
            querySnapshot.forEach((doc: firestore.QueryDocumentSnapshot<firestore.DocumentData>) => {
                const data = doc.data();
                const sharedWith = data.sharedWith as string | string[] | undefined;
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

        const data = docSnap.data() as firestore.DocumentData;
        const currentSharedWith = data.sharedWith || [];
        const receivers = Array.isArray(receiverIds) ? receiverIds : [receiverIds];

        // Merge receivers into sharedWith array, avoiding duplicates
        const updatedSharedWith = Array.isArray(currentSharedWith)
            ? [...new Set([...currentSharedWith, ...receivers])]
            : [...new Set([currentSharedWith, ...receivers])].filter(i => i);

        await retryWithBackoff(
            () => updateDoc(docRef, {
                sharedWith: updatedSharedWith,
                sharedBy: senderId,
                sharedByName: senderName,
                updatedAt: new Date().toISOString()
            }),
            { maxRetries: 3 }
        );
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

            const data = docSnap.data() as firestore.DocumentData;
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

            const data = docSnap.data() as firestore.DocumentData;

            // Verify ownership
            if (data.userId !== userId) {
                throw new AuthorizationError('Bu çalışmayı düzenleme izniniz yok');
            }

            // Prepare update payload
            const payload: Record<string, unknown> = { ...updateData };
            delete payload.id;
            delete payload.userId;
            delete payload.createdAt;
            payload.updatedAt = new Date().toISOString();

            // Serialize if needed
            if (payload.worksheetData && Array.isArray(payload.worksheetData)) {
                payload.worksheetData = serializeData(payload.worksheetData);
            }

            await retryWithBackoff(
                () => updateDoc(docRef, payload),
                { maxRetries: 3 }
            );

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

            const data = docSnap.data() as firestore.DocumentData;

            // Verify ownership
            if (data.userId !== userId) {
                throw new AuthorizationError('Bu çalışmayı silme izniniz yok');
            }

            await retryWithBackoff(
                () => deleteDoc(docRef),
                { maxRetries: 3 }
            );
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
    }
};
