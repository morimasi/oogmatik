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

import type { ActivityDraft, DynamicActivity } from '../types/admin';
import type {
    ActivityTemplate,
    ApprovalStatus,
    ProductionMode,
    ApprovalQueueFilter,
    AutoSettings,
} from '../types/ocr-activity';

// ─── In-Memory Store (Firestore bağlantısı sonra eklenecek) ──────────────

let approvalQueue: ActivityDraft[] = [];
let feedbackSignals: Array<{ draftId: string; reason: string; timestamp: string }> = [];

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
                pedagogicalNote: template.metadata.pedagogicalNote,
                curriculumCode: template.metadata.curriculumCode,
            },
            templateId: template.id,
            updatedAt: now,
        };

        approvalQueue.push(draft);
        return draft;
    },

    /**
     * Onay bekleyen taslakları listeler.
     */
    async getPendingReviews(filter?: ApprovalQueueFilter): Promise<ActivityDraft[]> {
        let results = [...approvalQueue];

        if (filter?.status) {
            results = results.filter((d) => d.status === filter.status);
        } else {
            results = results.filter((d) => d.status === 'pending_review');
        }

        if (filter?.mode) {
            results = results.filter((d) => d.productionMode === filter.mode);
        }

        if (filter?.createdBy) {
            results = results.filter((d) => d.createdBy === filter.createdBy);
        }

        if (filter?.dateRange) {
            results = results.filter((d) => {
                const date = new Date(d.createdAt);
                return date >= new Date(filter.dateRange!.start) && date <= new Date(filter.dateRange!.end);
            });
        }

        // Sıralama
        const sortBy = filter?.sortBy || 'newest';
        results.sort((a, b) => {
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
        const draft = approvalQueue.find((d) => d.id === draftId);
        if (!draft) {
            throw new Error(`Taslak bulunamadı: ${draftId}`);
        }

        if (draft.status !== 'pending_review') {
            throw new Error(`Bu taslak onay beklemiyormuş. Mevcut durum: ${draft.status}`);
        }

        draft.status = 'approved';
        draft.approvedBy = adminId;
        draft.approvedAt = new Date().toISOString();
        draft.updatedAt = new Date().toISOString();

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
        const draft = approvalQueue.find((d) => d.id === draftId);
        if (!draft) {
            throw new Error(`Taslak bulunamadı: ${draftId}`);
        }

        if (draft.status !== 'pending_review') {
            throw new Error(`Bu taslak onay beklemiyormuş. Mevcut durum: ${draft.status}`);
        }

        draft.status = 'rejected';
        draft.rejectionReason = reason;
        draft.approvedBy = adminId;
        draft.approvedAt = new Date().toISOString();
        draft.updatedAt = new Date().toISOString();

        // Red gerekçesini öğrenme sinyali olarak kaydet
        await this.saveFeedbackSignal(draftId, reason);

        return draft;
    },

    /**
     * Onaylanan taslaktan aktif etkinlik (DynamicActivity) oluşturur.
     */
    async publishActivity(draftId: string): Promise<DynamicActivity> {
        const draft = approvalQueue.find((d) => d.id === draftId);
        if (!draft) {
            throw new Error(`Taslak bulunamadı: ${draftId}`);
        }

        if (draft.status !== 'approved') {
            throw new Error('Sadece onaylanmış taslaklar yayınlanabilir.');
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
        const original = approvalQueue.find((d) => d.id === draftId);
        if (!original) {
            throw new Error(`Orijinal taslak bulunamadı: ${draftId}`);
        }

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

        approvalQueue.push(newDraft);
        return newDraft;
    },

    /**
     * Red gerekçesini öğrenme sinyali olarak kaydeder.
     * Gelecekteki üretimlerde kaliteyi artırmak için referans alınır.
     */
    async saveFeedbackSignal(draftId: string, reason: string): Promise<void> {
        feedbackSignals.push({
            draftId,
            reason,
            timestamp: new Date().toISOString(),
        });
    },

    /**
     * Kayıtlı öğrenme sinyallerini döndürür.
     */
    async getFeedbackSignals(): Promise<Array<{ draftId: string; reason: string; timestamp: string }>> {
        return [...feedbackSignals];
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
        return approvalQueue.find((d) => d.id === draftId) ?? null;
    },

    /**
     * Tüm taslakları temizle (test için).
     */
    clearAll(): void {
        approvalQueue = [];
        feedbackSignals = [];
    },
};
