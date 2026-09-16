import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { AssessmentReport, SavedAssessment, AdaptiveQuestion, TestCategory, AssessmentConfig } from '../types';
import { AuthorizationError } from '../utils/AppError.js';
import { generateAdaptiveQuestionsFromAI } from './generators/assessment';
import { generateOfflineAdaptiveQuestions } from './offlineGenerators/assessment';
import { shuffle } from './offlineGenerators/helpers';

import { logInfo, logError, logWarn } from '../utils/logger.js';
import { useStudentStore } from '../store/useStudentStore.js';
const { collection, addDoc, query, where, getDocs, doc, getDoc, deleteDoc, updateDoc } = firestore;

export const assessmentService = {
    saveAssessment: async (
        userId: string,
        studentName: string,
        gender: 'Kız' | 'Erkek',
        age: number,
        grade: string,
        report: AssessmentReport,
        studentId?: string
    ): Promise<void> => {
        try {
            const { activeStudent } = useStudentStore.getState();
            const finalStudentId = studentId || activeStudent?.id || null;
            const finalStudentName = studentName || activeStudent?.name || 'Öğrenci';
            const payload = {
                userId,
                studentId: finalStudentId,
                studentName: finalStudentName,
                gender: gender || 'Erkek',
                age: age || 7,
                grade: grade || '1. Sınıf',
                report: JSON.parse(JSON.stringify(report)),
                isArchived: false,
                createdAt: new Date().toISOString()
            };
            await addDoc(collection(db, "saved_assessments"), payload);
        } catch (error) {
            logError('Değerlendirme kaydedilemedi', { error: error instanceof Error ? error.message : String(error), context: 'saveAssessment' });
            throw error;
        }
    },

    getUserAssessments: async (userId: string): Promise<SavedAssessment[]> => {
        try {
            const q = query(
                collection(db, "saved_assessments"),
                where("userId", "==", userId)
            );
            const querySnapshot = await getDocs(q);
            const assessments: SavedAssessment[] = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data() as any;
                if (!data.sharedWith) {
                    assessments.push({
                        id: docSnap.id,
                        userId: data.userId,
                        studentId: data.studentId,
                        studentName: data.studentName,
                        gender: data.gender,
                        age: data.age,
                        grade: data.grade,
                        createdAt: data.createdAt,
                        report: data.report,
                        sharedBy: data.sharedBy,
                        sharedByName: data.sharedByName,
                        isArchived: !!data.isArchived,
                    } as SavedAssessment);
                }
            });
            assessments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return assessments;
        } catch (error) {
            logError(error instanceof Error ? error : String(error));
            return [];
        }
    },

    getSharedAssessments: async (userId: string): Promise<SavedAssessment[]> => {
        try {
            const q = query(
                collection(db, "saved_assessments"),
                where("sharedWith", "==", userId)
            );
            const querySnapshot = await getDocs(q);
            const assessments: SavedAssessment[] = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data() as any;
                assessments.push({
                    id: docSnap.id,
                    userId: data.userId,
                    studentId: data.studentId,
                    studentName: data.studentName,
                    gender: data.gender,
                    age: data.age,
                    grade: data.grade,
                    createdAt: data.createdAt,
                    report: data.report,
                    sharedBy: data.sharedBy,
                    sharedByName: data.sharedByName,
                    isArchived: !!data.isArchived,
                } as SavedAssessment);
            });
            assessments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return assessments;
        } catch (error) {
            logError(error instanceof Error ? error : String(error));
            return [];
        }
    },

    getAssessmentsByStudent: async (studentId: string): Promise<SavedAssessment[]> => {
        try {
            const q = query(
                collection(db, "saved_assessments"),
                where("studentId", "==", studentId)
            );
            const querySnapshot = await getDocs(q);
            const assessments: SavedAssessment[] = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data() as any;
                assessments.push({
                    id: docSnap.id,
                    userId: data.userId,
                    studentId: data.studentId,
                    studentName: data.studentName,
                    gender: data.gender,
                    age: data.age,
                    grade: data.grade,
                    createdAt: data.createdAt,
                    report: data.report,
                    isArchived: !!data.isArchived,
                } as SavedAssessment);
            });
            assessments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return assessments;
        } catch (error) {
            logError(error instanceof Error ? error : String(error));
            return [];
        }
    },

    toggleArchiveAssessment: async (assessmentId: string, userId: string, isArchived: boolean): Promise<void> => {
        try {
            const ref = doc(db, 'saved_assessments', assessmentId);
            const snap = await getDoc(ref);
            if (!snap.exists()) {
                throw new Error('Kayıt bulunamadı.');
            }
            const data = snap.data() as { userId?: string; studentId?: string };
            if (data.userId !== userId) {
                throw new AuthorizationError('Bu işlemi yapma izniniz yok.');
            }
            await updateDoc(ref, {
                isArchived: isArchived,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            logError('Değerlendirme arşiv durumu güncellenemedi', { error: error instanceof Error ? error.message : String(error), context: 'toggleArchiveAssessment' });
            throw error;
        }
    },

    deleteAssessment: async (assessmentId: string, userId: string): Promise<void> => {
        try {
            const ref = doc(db, 'saved_assessments', assessmentId);
            const snap = await getDoc(ref);
            if (!snap.exists()) {
                throw new Error('Kayıt bulunamadı.');
            }
            const data = snap.data() as { userId?: string };
            if (data.userId !== userId) {
                throw new AuthorizationError('Bu raporu silme izniniz yok.');
            }
            await deleteDoc(ref);
        } catch (error) {
            logError('Değerlendirme silinemedi', { error: error instanceof Error ? error.message : String(error), context: 'deleteAssessment' });
            throw error;
        }
    },

    shareAssessment: async (assessment: SavedAssessment, senderId: string, senderName: string, receiverId: string, permission?: string, message?: string): Promise<void> => {
        try {
            const payload = {
                userId: senderId,
                studentName: assessment.studentName,
                gender: assessment.gender,
                age: assessment.age,
                grade: assessment.grade,
                report: JSON.parse(JSON.stringify(assessment.report)),
                sharedBy: senderId,
                sharedByName: senderName || 'Anonim',
                sharedWith: receiverId,
                permission: permission || 'view',
                message: message || '',
                createdAt: new Date().toISOString()
            };
            await addDoc(collection(db, "saved_assessments"), payload);
        } catch (error) {
            logError('Değerlendirme paylaşılamadı', { error: error instanceof Error ? error.message : String(error), context: 'shareAssessment' });
            throw error;
        }
    }
};
