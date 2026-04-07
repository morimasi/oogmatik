/**
 * OOGMATIK - Factory Functions Tests (Sprint 3)
 * Test suite for createAdvancedStudent and module factory functions
 */

import { describe, it, expect } from 'vitest';
import type { Student } from '../src/types/student';
import {
    createDefaultIEP,
    createDefaultFinancial,
    createDefaultAttendance,
    createDefaultAcademic,
    createDefaultBehavior,
    createDefaultAIProfile,
    createDefaultPrivacySettings,
    createAdvancedStudent,
} from '../src/types/student-advanced';

describe('Factory Functions — Sprint 3', () => {
    describe('createDefaultIEP', () => {
        it('should create a valid IEP plan with draft status', () => {
            const studentId = 'student-123';
            const iep = createDefaultIEP(studentId);

            expect(iep.id).toBeDefined();
            expect(iep.studentId).toBe(studentId);
            expect(iep.status).toBe('draft');
            expect(iep.diagnosis).toEqual([]);
            expect(iep.goals).toEqual([]);
            expect(iep.teamMembers).toEqual([]);
        });

        it('should set endDate to 1 year from now', () => {
            const iep = createDefaultIEP('student-123');
            const startDate = new Date(iep.startDate);
            const endDate = new Date(iep.endDate);

            const daysDiff = Math.floor(
                (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            expect(daysDiff).toBeGreaterThanOrEqual(364); // Account for leap years
            expect(daysDiff).toBeLessThanOrEqual(366);
        });

        it('should generate unique IDs for each IEP', () => {
            const iep1 = createDefaultIEP('student-1');
            const iep2 = createDefaultIEP('student-1');

            expect(iep1.id).not.toBe(iep2.id);
        });
    });

    describe('createDefaultFinancial', () => {
        it('should create a valid financial profile with zero balance', () => {
            const studentId = 'student-456';
            const financial = createDefaultFinancial(studentId);

            expect(financial.studentId).toBe(studentId);
            expect(financial.balance).toBe(0);
            expect(financial.transactions).toEqual([]);
            expect(financial.paymentMethods).toEqual([]);
            expect(financial.monthlyPaymentStatus).toBe('pending');
        });

        it('should have undefined lastTransactionDate initially', () => {
            const financial = createDefaultFinancial('student-456');

            expect(financial.lastTransactionDate).toBeUndefined();
        });
    });

    describe('createDefaultAttendance', () => {
        it('should create valid attendance data with zero stats', () => {
            const attendance = createDefaultAttendance();

            expect(attendance.records).toEqual([]);
            expect(attendance.stats.totalDays).toBe(0);
            expect(attendance.stats.present).toBe(0);
            expect(attendance.stats.absent).toBe(0);
            expect(attendance.stats.attendanceRate).toBe(100);
        });

        it('should set trend to stable initially', () => {
            const attendance = createDefaultAttendance();

            expect(attendance.stats.trend).toBe('stable');
        });
    });

    describe('createDefaultAcademic', () => {
        it('should create valid academic data with empty grades', () => {
            const academic = createDefaultAcademic();

            expect(academic.grades).toEqual([]);
            expect(academic.metrics.gpa).toBe(0);
            expect(academic.metrics.subjectAverages).toEqual({});
        });

        it('should set default subjects to dash', () => {
            const academic = createDefaultAcademic();

            expect(academic.metrics.strongestSubject).toBe('-');
            expect(academic.metrics.weakestSubject).toBe('-');
        });

        it('should set recent trend to flat', () => {
            const academic = createDefaultAcademic();

            expect(academic.metrics.recentTrend).toBe('flat');
        });

        it('should set attendance and completion rates correctly', () => {
            const academic = createDefaultAcademic();

            expect(academic.metrics.attendanceRate).toBe(100);
            expect(academic.metrics.participationRate).toBe(0);
            expect(academic.metrics.homeworkCompletionRate).toBe(0);
        });
    });

    describe('createDefaultBehavior', () => {
        it('should create valid behavior data with zero score', () => {
            const behavior = createDefaultBehavior();

            expect(behavior.incidents).toEqual([]);
            expect(behavior.score).toBe(0);
        });
    });

    describe('createDefaultAIProfile', () => {
        it('should create valid AI profile with visual learning style', () => {
            const aiProfile = createDefaultAIProfile();

            expect(aiProfile.learningStyle).toBe('visual');
            expect(aiProfile.recommendedActivities).toEqual([]);
            expect(aiProfile.riskFactors).toEqual([]);
        });

        it('should have placeholder analysis text', () => {
            const aiProfile = createDefaultAIProfile();

            expect(aiProfile.strengthAnalysis).toBe('Henüz yeterli veri yok');
            expect(aiProfile.struggleAnalysis).toBe('Henüz yeterli veri yok');
        });

        it('should have lastUpdated timestamp', () => {
            const aiProfile = createDefaultAIProfile();

            expect(aiProfile.lastUpdated).toBeDefined();
            expect(() => new Date(aiProfile.lastUpdated)).not.toThrow();
        });
    });

    describe('createDefaultPrivacySettings', () => {
        it('should create KVKK-compliant privacy settings', () => {
            const teacherId = 'teacher-789';
            const privacy = createDefaultPrivacySettings(teacherId);

            expect(privacy.profileVisibility).toBe('teachers_only');
            expect(privacy.lastUpdatedBy).toBe(teacherId);
            expect(privacy.schemaVersion).toBe('1.0');
        });

        it('should set sensitive data handling to local_only for diagnosis', () => {
            const privacy = createDefaultPrivacySettings('teacher-789');

            expect(privacy.sensitiveDataHandling.diagnosisInfo).toBe('local_only');
            expect(privacy.sensitiveDataHandling.medicalInfo).toBe('local_only');
            expect(privacy.sensitiveDataHandling.behavioralNotes).toBe('local_only');
        });

        it('should allow AI personalization by default', () => {
            const privacy = createDefaultPrivacySettings('teacher-789');

            expect(privacy.aiProcessing.allowPersonalization).toBe(true);
            expect(privacy.aiProcessing.allowLearningAnalysis).toBe(true);
            expect(privacy.aiProcessing.allowAnonymizedTraining).toBe(false);
        });

        it('should exclude sensitive data from AI processing', () => {
            const privacy = createDefaultPrivacySettings('teacher-789');

            expect(privacy.aiProcessing.excludedDataTypes).toContain('medical');
            expect(privacy.aiProcessing.excludedDataTypes).toContain('family');
            expect(privacy.aiProcessing.excludedDataTypes).toContain('financial');
        });

        it('should set parental consent to false initially', () => {
            const privacy = createDefaultPrivacySettings('teacher-789');

            expect(privacy.parentalConsent.granted).toBe(false);
            expect(privacy.parentalConsent.scope.dataCollection).toBe(false);
            expect(privacy.parentalConsent.scope.aiProcessing).toBe(false);
        });
    });

    describe('createAdvancedStudent', () => {
        const baseStudent: Student = {
            id: 'student-abc',
            teacherId: 'teacher-xyz',
            name: 'Ali Yılmaz',
            age: 10,
            grade: '4',
            avatar: '',
            diagnosis: ['Disleksi'],
            interests: ['Futbol'],
            strengths: ['Matematik'],
            weaknesses: ['Okuma'],
            learningStyle: 'Görsel',
            createdAt: new Date().toISOString(),
        };

        it('should create a fully populated AdvancedStudent', () => {
            const advancedStudent = createAdvancedStudent(baseStudent);

            expect(advancedStudent.id).toBe(baseStudent.id);
            expect(advancedStudent.name).toBe(baseStudent.name);
            expect(advancedStudent.iep).toBeDefined();
            expect(advancedStudent.financial).toBeDefined();
            expect(advancedStudent.attendance).toBeDefined();
            expect(advancedStudent.academic).toBeDefined();
            expect(advancedStudent.behavior).toBeDefined();
            expect(advancedStudent.portfolio).toBeDefined();
            expect(advancedStudent.aiProfile).toBeDefined();
            expect(advancedStudent.privacySettings).toBeDefined();
        });

        it('should link IEP to correct student', () => {
            const advancedStudent = createAdvancedStudent(baseStudent);

            expect(advancedStudent.iep.studentId).toBe(baseStudent.id);
        });

        it('should link financial profile to correct student', () => {
            const advancedStudent = createAdvancedStudent(baseStudent);

            expect(advancedStudent.financial.studentId).toBe(baseStudent.id);
        });

        it('should initialize empty portfolio array', () => {
            const advancedStudent = createAdvancedStudent(baseStudent);

            expect(advancedStudent.portfolio).toEqual([]);
        });

        it('should set privacy settings updatedBy to teacher', () => {
            const advancedStudent = createAdvancedStudent(baseStudent);

            expect(advancedStudent.privacySettings?.lastUpdatedBy).toBe(
                baseStudent.teacherId
            );
        });

        it('should have non-null modules (no undefined runtime errors)', () => {
            const advancedStudent = createAdvancedStudent(baseStudent);

            // These should not throw undefined errors
            expect(advancedStudent.iep.goals.length).toBe(0);
            expect(advancedStudent.financial.transactions.length).toBe(0);
            expect(advancedStudent.attendance.records.length).toBe(0);
            expect(advancedStudent.academic.grades.length).toBe(0);
            expect(advancedStudent.behavior.incidents.length).toBe(0);
            expect(advancedStudent.portfolio.length).toBe(0);
            expect(advancedStudent.aiProfile.recommendedActivities.length).toBe(0);
        });

        it('should be TypeScript strict mode compliant', () => {
            const advancedStudent = createAdvancedStudent(baseStudent);

            // No optional chaining needed - all modules guaranteed to exist
            const iepGoalsCount = advancedStudent.iep.goals.length;
            const financialBalance = advancedStudent.financial.balance;
            const attendanceRate = advancedStudent.attendance.stats.attendanceRate;
            const gpa = advancedStudent.academic.metrics.gpa;
            const behaviorScore = advancedStudent.behavior.score;
            const portfolioCount = advancedStudent.portfolio.length;
            const learningStyle = advancedStudent.aiProfile.learningStyle;
            const profileVisibility = advancedStudent.privacySettings?.profileVisibility;

            expect(iepGoalsCount).toBe(0);
            expect(financialBalance).toBe(0);
            expect(attendanceRate).toBe(100);
            expect(gpa).toBe(0);
            expect(behaviorScore).toBe(0);
            expect(portfolioCount).toBe(0);
            expect(learningStyle).toBe('visual');
            expect(profileVisibility).toBe('teachers_only');
        });
    });

    describe('Factory Functions Integration', () => {
        it('should create consistent timestamps across modules', () => {
            const baseStudent: Student = {
                id: 'student-time',
                teacherId: 'teacher-time',
                name: 'Test Student',
                age: 10,
                grade: '4',
                avatar: '',
                diagnosis: [],
                interests: [],
                strengths: [],
                weaknesses: [],
                learningStyle: 'Görsel',
                createdAt: new Date().toISOString(),
            };

            const startTime = Date.now();
            const advancedStudent = createAdvancedStudent(baseStudent);
            const endTime = Date.now();

            const iepTime = new Date(advancedStudent.iep.startDate).getTime();
            const aiProfileTime = new Date(advancedStudent.aiProfile.lastUpdated).getTime();
            const privacyTime = new Date(
                advancedStudent.privacySettings?.lastUpdated || ''
            ).getTime();

            // All timestamps should be within test execution window
            expect(iepTime).toBeGreaterThanOrEqual(startTime);
            expect(iepTime).toBeLessThanOrEqual(endTime);
            expect(aiProfileTime).toBeGreaterThanOrEqual(startTime);
            expect(aiProfileTime).toBeLessThanOrEqual(endTime);
            expect(privacyTime).toBeGreaterThanOrEqual(startTime);
            expect(privacyTime).toBeLessThanOrEqual(endTime);
        });

        it('should produce deterministic results (except UUIDs)', () => {
            const baseStudent: Student = {
                id: 'student-deterministic',
                teacherId: 'teacher-deterministic',
                name: 'Test Student',
                age: 10,
                grade: '4',
                avatar: '',
                diagnosis: [],
                interests: [],
                strengths: [],
                weaknesses: [],
                learningStyle: 'Görsel',
                createdAt: new Date().toISOString(),
            };

            const student1 = createAdvancedStudent(baseStudent);
            const student2 = createAdvancedStudent(baseStudent);

            // Same base data should produce same structure (except IDs)
            expect(student1.financial.balance).toBe(student2.financial.balance);
            expect(student1.attendance.stats.attendanceRate).toBe(
                student2.attendance.stats.attendanceRate
            );
            expect(student1.academic.metrics.gpa).toBe(student2.academic.metrics.gpa);
            expect(student1.behavior.score).toBe(student2.behavior.score);
            expect(student1.aiProfile.learningStyle).toBe(student2.aiProfile.learningStyle);
        });
    });

    describe('Sprint 3 Success Criteria', () => {
        it('should eliminate undefined runtime errors', () => {
            const baseStudent: Student = {
                id: 'student-safe',
                teacherId: 'teacher-safe',
                name: 'Safe Student',
                age: 10,
                grade: '4',
                avatar: '',
                diagnosis: [],
                interests: [],
                strengths: [],
                weaknesses: [],
                learningStyle: 'Görsel',
                createdAt: new Date().toISOString(),
            };

            const advancedStudent = createAdvancedStudent(baseStudent);

            // All these operations should succeed without optional chaining
            expect(() => {
                const _ = advancedStudent.iep.goals;
                const __ = advancedStudent.financial.transactions;
                const ___ = advancedStudent.attendance.records;
                const ____ = advancedStudent.academic.grades;
                const _____ = advancedStudent.behavior.incidents;
                const ______ = advancedStudent.portfolio;
                const _______ = advancedStudent.aiProfile.recommendedActivities;
            }).not.toThrow();
        });

        it('should be TypeScript strict mode compliant', () => {
            const baseStudent: Student = {
                id: 'student-strict',
                teacherId: 'teacher-strict',
                name: 'Strict Student',
                age: 10,
                grade: '4',
                avatar: '',
                diagnosis: [],
                interests: [],
                strengths: [],
                weaknesses: [],
                learningStyle: 'Görsel',
                createdAt: new Date().toISOString(),
            };

            const advancedStudent = createAdvancedStudent(baseStudent);

            // TypeScript should not require optional chaining
            const hasIEP = advancedStudent.iep !== undefined;
            const hasFinancial = advancedStudent.financial !== undefined;
            const hasAttendance = advancedStudent.attendance !== undefined;
            const hasAcademic = advancedStudent.academic !== undefined;
            const hasBehavior = advancedStudent.behavior !== undefined;
            const hasPortfolio = advancedStudent.portfolio !== undefined;
            const hasAIProfile = advancedStudent.aiProfile !== undefined;

            expect(hasIEP).toBe(true);
            expect(hasFinancial).toBe(true);
            expect(hasAttendance).toBe(true);
            expect(hasAcademic).toBe(true);
            expect(hasBehavior).toBe(true);
            expect(hasPortfolio).toBe(true);
            expect(hasAIProfile).toBe(true);
        });
    });
});
