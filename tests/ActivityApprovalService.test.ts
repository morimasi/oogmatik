/**
 * Activity Approval Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { activityApprovalService } from '@/services/activityApprovalService';
import type { ActivityTemplate } from '@/types/ocr-activity';

// Mock template for testing
function createMockTemplate(overrides?: Partial<ActivityTemplate>): ActivityTemplate {
    return {
        id: 'tmpl_test_123',
        version: 'v1.0',
        mode: 'prompt_generation',
        status: 'draft',
        layout: {
            pageSize: 'A4',
            orientation: 'portrait',
            columns: 1,
            margin: { top: 20, right: 15, bottom: 20, left: 15 },
            gap: 12,
        },
        sections: [
            { id: 'sec_1', type: 'header', content: 'Test', position: { row: 0, col: 0 } },
            { id: 'sec_2', type: 'question_block', content: 'Q1', position: { row: 1, col: 0 } },
        ],
        metadata: {
            title: 'Test Etkinlik',
            subject: 'Matematik',
            gradeLevel: 4,
            ageGroup: '8-10',
            difficulty: 'Orta',
            estimatedDuration: 20,
            targetSkills: ['Toplama'],
            learningObjectives: ['İshlem yapabilme'],
            pedagogicalNote: 'Bu aktivite toplama işlemlerini pekiştirmek için tasarlanmıştır.',
            productionMode: 'prompt_generation',
        },
        history: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides,
    };
}

describe('Activity Approval Service - Submit', () => {
    beforeEach(() => {
        activityApprovalService.clearAll();
    });

    it('should submit template for review', async () => {
        const template = createMockTemplate();
        const draft = await activityApprovalService.submitForReview(template, 'teacher-1');

        expect(draft.id).toMatch(/^draft_/);
        expect(draft.status).toBe('pending_review');
        expect(draft.title).toBe('Test Etkinlik');
        expect(draft.createdBy).toBe('teacher-1');
        expect(draft.productionMode).toBe('prompt_generation');
    });

    it('should preserve metadata in draft', async () => {
        const template = createMockTemplate();
        const draft = await activityApprovalService.submitForReview(template, 'teacher-1');

        expect(draft.metadata?.subject).toBe('Matematik');
        expect(draft.metadata?.gradeLevel).toBe(4);
        expect(draft.metadata?.difficulty).toBe('Orta');
        expect(draft.metadata?.targetSkills).toContain('Toplama');
    });
});

describe('Activity Approval Service - Listing', () => {
    beforeEach(() => {
        activityApprovalService.clearAll();
    });

    it('should list pending reviews', async () => {
        const t1 = createMockTemplate({ id: 'tmpl_1' });
        const t2 = createMockTemplate({ id: 'tmpl_2' });

        await activityApprovalService.submitForReview(t1, 'teacher-1');
        await activityApprovalService.submitForReview(t2, 'teacher-2');

        const pending = await activityApprovalService.getPendingReviews();
        expect(pending.length).toBe(2);
    });

    it('should filter by status', async () => {
        const t1 = createMockTemplate({ id: 'tmpl_1' });
        await activityApprovalService.submitForReview(t1, 'teacher-1');

        const pending = await activityApprovalService.getPendingReviews({ status: 'pending_review' });
        expect(pending.length).toBe(1);

        const approved = await activityApprovalService.getPendingReviews({ status: 'approved' });
        expect(approved.length).toBe(0);
    });
});

describe('Activity Approval Service - Approve/Reject', () => {
    beforeEach(() => {
        activityApprovalService.clearAll();
    });

    it('should approve a draft', async () => {
        const template = createMockTemplate();
        const draft = await activityApprovalService.submitForReview(template, 'teacher-1');

        const approved = await activityApprovalService.approve(draft.id, 'admin-1');

        expect(approved.status).toBe('approved');
        expect(approved.approvedBy).toBe('admin-1');
        expect(approved.approvedAt).toBeDefined();
    });

    it('should reject a draft with reason', async () => {
        const template = createMockTemplate();
        const draft = await activityApprovalService.submitForReview(template, 'teacher-1');

        const rejected = await activityApprovalService.reject(draft.id, 'admin-1', 'Zorluk seviyesi uyumsuz');

        expect(rejected.status).toBe('rejected');
        expect(rejected.rejectionReason).toBe('Zorluk seviyesi uyumsuz');
    });

    it('should save rejection as feedback signal', async () => {
        const template = createMockTemplate();
        const draft = await activityApprovalService.submitForReview(template, 'teacher-1');

        await activityApprovalService.reject(draft.id, 'admin-1', 'Pedagojik not yetersiz');

        const signals = await activityApprovalService.getFeedbackSignals();
        expect(signals.length).toBe(1);
        expect(signals[0].reason).toBe('Pedagojik not yetersiz');
    });

    it('should throw on approving non-existent draft', async () => {
        await expect(activityApprovalService.approve('nonexistent', 'admin')).rejects.toThrow('bulunamadı');
    });

    it('should throw on approving already approved draft', async () => {
        const template = createMockTemplate();
        const draft = await activityApprovalService.submitForReview(template, 'teacher-1');
        await activityApprovalService.approve(draft.id, 'admin-1');

        await expect(activityApprovalService.approve(draft.id, 'admin-1')).rejects.toThrow('onay beklemiyormuş');
    });
});

describe('Activity Approval Service - Versioning', () => {
    beforeEach(() => {
        activityApprovalService.clearAll();
    });

    it('should create a new version', async () => {
        const template = createMockTemplate();
        const draft = await activityApprovalService.submitForReview(template, 'teacher-1');

        const newVersion = await activityApprovalService.createNewVersion(draft.id, {
            title: 'Güncellenmiş Etkinlik',
        });

        expect(newVersion.version).toBe('v1.1');
        expect(newVersion.parentId).toBe(draft.id);
        expect(newVersion.title).toBe('Güncellenmiş Etkinlik');
        expect(newVersion.status).toBe('draft');
    });
});

describe('Activity Approval Service - Publish', () => {
    beforeEach(() => {
        activityApprovalService.clearAll();
    });

    it('should publish approved draft as DynamicActivity', async () => {
        const template = createMockTemplate();
        const draft = await activityApprovalService.submitForReview(template, 'teacher-1');
        await activityApprovalService.approve(draft.id, 'admin-1');

        const activity = await activityApprovalService.publishActivity(draft.id);

        expect(activity.id).toMatch(/^act_/);
        expect(activity.title).toBe('Test Etkinlik');
        expect(activity.isActive).toBe(true);
        expect(activity.category).toBe('Matematik');
    });

    it('should throw when publishing unapproved draft', async () => {
        const template = createMockTemplate();
        const draft = await activityApprovalService.submitForReview(template, 'teacher-1');

        await expect(activityApprovalService.publishActivity(draft.id)).rejects.toThrow('onaylanmış');
    });
});

describe('Activity Approval Service - Auto Settings', () => {
    it('should generate auto settings from draft metadata', () => {
        const draft = {
            id: 'draft_1',
            title: 'Test',
            description: 'Test',
            baseType: 'prompt_generation',
            createdBy: 'teacher-1',
            createdAt: new Date().toISOString(),
            customInstructions: '',
            metadata: {
                difficulty: 'Orta',
                estimatedDuration: 25,
            },
        };

        const settings = activityApprovalService.generateAutoSettings(draft);

        expect(settings.fastModeDefaults.difficulty).toBe('Orta');
        expect(settings.fastModeDefaults.estimatedDuration).toBe(25);
        expect(settings.advancedModeDefaults.questionTypes).toBeDefined();
    });
});
