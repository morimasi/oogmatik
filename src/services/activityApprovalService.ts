import { AppError } from '../utils/AppError';
/**
 * OOGMATIK — Etkinlik Onay Servisi
 *
 * Üretilen etkinliklerin onay kuyruğunu yönetir.
 * Taslak → Onay Bekliyor → Aktif / Reddedildi akışı.
 * Versiyonlama ve red gerekçesi öğrenme sinyali desteği.
 *
 * Dr. Ahmet Kaya: MEB uyumluluğu ve klinik kontrol.
 * Bora Demir: Firestore CRUD, AppError standardı.
 */

import { db, collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, deleteDoc } from './firebaseClient.js';

import type { ActivityDraft, DynamicActivity } from '../types/admin';
import type {
    ActivityTemplate,
    ApprovalStatus,
    ProductionMode,
    ApprovalQueueFilter,
    AutoSettings,
} from '../types/ocr-activity';

// ─── Firestore Entegrasyonu ──────────────

const QUEUE_COLLECTION = 'approval_queue';
const FEEDBACK_COLLECTION = 'feedback_signals';
let resetPromise: Promise<void> = Promise.resolve();

const stripUndefinedFields = <T>(value: T): T => {
    if (Array.isArray(value)) {
        return value.map((item) => stripUndefinedFields(item)) as T;
    }

    if (value && typeof value === 'object') {
        const entries = Object.entries(value as Record<string, unknown>)
            .filter(([, item]) => item !== undefined)
            .map(([key, item]) => [key, stripUndefinedFields(item)]);

        return Object.fromEntries(entries) as T;
    }

    return value;
};

// ─── ID Üretici ──────────────────────────────────────────────────────────

const generateId = (prefix: string): string =>
    `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

// ─── Ana Servis ──────────────────────────────────────────────────────────

export const activityApprovalService = {
    /**
     * ActivityTemplate'den taslak oluşturur ve onay kuyruğuna ekler.
     */
    async submitForReview(
        template: ActivityTemplate,
        createdBy: string
    ): Promise<ActivityDraft> {
        await resetPromise;
        const now = new Date().toISOString();

        const draft: ActivityDraft = {
            id: generateId('draft'),
            title: template.metadata.title,
            description: `${template.metadata.subject} — ${template.metadata.gradeLevel}. sınıf — ${template.metadata.difficulty}`,
            baseType: template.mode,
            createdBy,
            createdAt: now,
            customInstructions: '',
            productionMode: template.mode,
            status: 'pending_review',
            version: template.version,
            metadata: {
                subject: template.metadata.subject,
                gradeLevel: template.metadata.gradeLevel,
                ageGroup: template.metadata.ageGroup,
                difficulty: template.metadata.difficulty,
                estimatedDuration: template.metadata.estimatedDuration,
                targetSkills: template.metadata.targetSkills,
                learningObjectives: template.metadata.learningObjectives,
                curriculumCode: template.metadata.curriculumCode,
            },
            templateId: template.id,
            updatedAt: now,
        };

        const draftRef = doc(collection(db, QUEUE_COLLECTION), draft.id);
        await setDoc(draftRef, stripUndefinedFields(draft));
        return draft;
    },

    /**
     * Onay bekleyen taslakları listeler.
     */
    async getPendingReviews(filter?: ApprovalQueueFilter): Promise<ActivityDraft[]> {
        await resetPromise;
        const qParams: any[] = [];

        if (filter?.status) {
            qParams.push(where('status', '==', filter.status));
        } else {
            qParams.push(where('status', '==', 'pending_review'));
        }

        const baseQuery = query(collection(db, QUEUE_COLLECTION), ...qParams);
        const snapshot = await getDocs(baseQuery);
        let results: ActivityDraft[] = snapshot.docs.map((d: any) => d.data() as ActivityDraft);

        if (filter?.mode) {
            results = results.filter((d: ActivityDraft) => d.productionMode === filter.mode);
        }

        if (filter?.createdBy) {
            results = results.filter((d: ActivityDraft) => d.createdBy === filter.createdBy);
        }

        if (filter?.dateRange) {
            results = results.filter((d: ActivityDraft) => {
                const date = new Date(d.createdAt);
                return date >= new Date(filter.dateRange!.start) && date <= new Date(filter.dateRange!.end);
            });
        }

        // Sıralama
        const sortBy = filter?.sortBy || 'newest';
        results.sort((a: ActivityDraft, b: ActivityDraft) => {
            if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            return 0;
        });

        return results;
    },

    /**
     * Taslağı onaylar — statü "approved" olur.
     */
    async approve(draftId: string, adminId: string): Promise<ActivityDraft> {
        await resetPromise;
        const draftRef = doc(db, QUEUE_COLLECTION, draftId);
        const snap = await getDoc(draftRef);

        if (!snap.exists()) {
            throw new AppError(`Taslak bulunamadı: ${draftId}`, 'INTERNAL_ERROR', 500);
        }

        const draft = snap.data() as ActivityDraft;

        if (draft.status !== 'pending_review') {
            throw new AppError(`Bu taslak onay beklemiyormuş. Mevcut durum: ${draft.status}`, 'INTERNAL_ERROR', 500);
        }

        draft.status = 'approved';
        draft.approvedBy = adminId;
        draft.approvedAt = new Date().toISOString();
        draft.updatedAt = new Date().toISOString();

        await updateDoc(draftRef, {
            status: draft.status,
            approvedBy: draft.approvedBy,
            approvedAt: draft.approvedAt,
            updatedAt: draft.updatedAt
        });

        return draft;
    },

    /**
     * Taslağı reddeder — gerekçe kaydedilir.
     */
    async reject(
        draftId: string,
        adminId: string,
        reason: string
    ): Promise<ActivityDraft> {
        await resetPromise;
        const draftRef = doc(db, QUEUE_COLLECTION, draftId);
        const snap = await getDoc(draftRef);

        if (!snap.exists()) {
            throw new AppError(`Taslak bulunamadı: ${draftId}`, 'INTERNAL_ERROR', 500);
        }

        const draft = snap.data() as ActivityDraft;

        if (draft.status !== 'pending_review') {
            throw new AppError(`Bu taslak onay beklemiyormuş. Mevcut durum: ${draft.status}`, 'INTERNAL_ERROR', 500);
        }

        draft.status = 'rejected';
        draft.rejectionReason = reason;
        draft.approvedBy = adminId;
        draft.approvedAt = new Date().toISOString();
        draft.updatedAt = new Date().toISOString();

        await updateDoc(draftRef, {
            status: draft.status,
            rejectionReason: draft.rejectionReason,
            approvedBy: draft.approvedBy,
            approvedAt: draft.approvedAt,
            updatedAt: draft.updatedAt
        });

        // Red gerekçesini öğrenme sinyali olarak kaydet
        await this.saveFeedbackSignal(draftId, reason);

        return draft;
    },

    /**
     * Onaylanan taslaktan aktif etkinlik (DynamicActivity) oluşturur.
     */
    async publishActivity(draftId: string): Promise<DynamicActivity> {
        await resetPromise;
        const draftRef = doc(db, QUEUE_COLLECTION, draftId);
        const snap = await getDoc(draftRef);

        if (!snap.exists()) {
            throw new AppError(`Taslak bulunamadı: ${draftId}`, 'INTERNAL_ERROR', 500);
        }

        const draft = snap.data() as ActivityDraft;

        if (draft.status !== 'approved') {
            throw new AppError('Sadece onaylanmış taslaklar yayınlanabilir.', 'INTERNAL_ERROR', 500);
        }

        const activity: DynamicActivity = {
            id: generateId('act'),
            title: draft.title,
            description: draft.description,
            icon: 'fa-wand-magic-sparkles',
            category: draft.metadata?.subject || 'Genel',
            isActive: true,
            isPremium: false,
            updatedAt: new Date().toISOString(),
            order: 0,
            themeColor: '#6366f1',
            targetSkills: draft.metadata?.targetSkills,
            learningObjectives: draft.metadata?.learningObjectives,
            engineConfig: {
                mode: 'ai_only',
                parameters: {
                    allowDifficulty: true,
                    allowDistraction: false,
                    allowFontSize: true,
                },
            },
        };

        return activity;
    },

    /**
     * Yeni versiyon oluşturur.
     */
    async createNewVersion(
        draftId: string,
        changes: Partial<ActivityDraft>
    ): Promise<ActivityDraft> {
        await resetPromise;
        const originalSnap = await getDoc(doc(db, QUEUE_COLLECTION, draftId));
        if (!originalSnap.exists()) {
            throw new AppError(`Orijinal taslak bulunamadı: ${draftId}`, 'INTERNAL_ERROR', 500);
        }

        const original = originalSnap.data() as ActivityDraft;

        const currentVersion = original.version || 'v1.0';
        const versionParts = currentVersion.replace('v', '').split('.');
        const minor = parseInt(versionParts[1] || '0', 10) + 1;
        const newVersion = `v${versionParts[0]}.${minor}`;

        const newDraft: ActivityDraft = {
            ...original,
            ...changes,
            id: generateId('draft'),
            version: newVersion,
            status: 'draft',
            parentId: draftId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            approvedBy: undefined,
            approvedAt: undefined,
            rejectionReason: undefined,
        };

        const draftRef = doc(collection(db, QUEUE_COLLECTION), newDraft.id);
        await setDoc(draftRef, stripUndefinedFields(newDraft));
        return newDraft;
    },

    /**
     * Red gerekçesini öğrenme sinyali olarak kaydeder.
     * Gelecekteki üretimlerde kaliteyi artırmak için referans alınır.
     */
    async saveFeedbackSignal(draftId: string, reason: string): Promise<void> {
        await resetPromise;
        const signal = {
            draftId,
            reason,
            timestamp: new Date().toISOString(),
        };
        const ref = doc(collection(db, FEEDBACK_COLLECTION));
        await setDoc(ref, signal);
    },

    /**
     * Kayıtlı öğrenme sinyallerini döndürür.
     */
    async getFeedbackSignals(): Promise<Array<{ draftId: string; reason: string; timestamp: string }>> {
        await resetPromise;
        const snap = await getDocs(collection(db, FEEDBACK_COLLECTION));
        return snap.docs.map((d: any) => d.data() as { draftId: string; reason: string; timestamp: string });
    },

    /**
     * Onaylanan etkinlik için otomatik ayar önerisi oluşturur.
     */
    generateAutoSettings(draft: ActivityDraft): AutoSettings {
        const questionCount = 10;
        const duration = draft.metadata?.estimatedDuration || 20;
        const difficulty = (draft.metadata?.difficulty as 'Kolay' | 'Orta' | 'Zor') || 'Orta';

        return {
            fastModeDefaults: {
                difficulty,
                questionCount,
                estimatedDuration: duration,
            },
            advancedModeDefaults: {
                difficulty,
                questionCount,
                questionTypes: ['fill_in_the_blank', 'multiple_choice'],
                estimatedDuration: duration,
                includeImages: false,
            },
        };
    },

    /**
     * ID ile taslak getir.
     */
    async getDraftById(draftId: string): Promise<ActivityDraft | null> {
        await resetPromise;
        const snap = await getDoc(doc(db, QUEUE_COLLECTION, draftId));
        return snap.exists() ? (snap.data() as ActivityDraft) : null;
    },

    /**
     * Tüm taslakları temizle (test için).
     */
    clearAll(): void {
        resetPromise = (async () => {
            const [draftsSnap, feedbackSnap] = await Promise.all([
                getDocs(collection(db, QUEUE_COLLECTION)),
                getDocs(collection(db, FEEDBACK_COLLECTION)),
            ]);

            await Promise.all([
                ...draftsSnap.docs.map((draft) => deleteDoc(draft.ref)),
                ...feedbackSnap.docs.map((signal) => deleteDoc(signal.ref)),
            ]);
        })();
    },
};
