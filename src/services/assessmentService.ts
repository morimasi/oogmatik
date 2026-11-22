import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { AssessmentReport, SavedAssessment, SubTestResult } from '../types';
import { AuthorizationError } from '../utils/AppError.js';
import { logError } from '../utils/logger.js';
import { useStudentStore } from '../store/useStudentStore.js';

const { collection, setDoc, addDoc, query, where, getDocs, doc, getDoc, deleteDoc, updateDoc } = firestore;

// ─── Tip Güvenli Firestore Belge Arayüzü ─────────────────────────────────────
interface FirestoreAssessmentDoc {
    userId: string;
    studentId: string | null;
    studentName: string;
    gender: 'Kız' | 'Erkek';
    age: number;
    grade: string;
    report: AssessmentReport;
    isArchived: boolean;
    createdAt: string;
    updatedAt?: string;
    sharedWith?: string;
    sharedBy?: string;
    sharedByName?: string;
    permission?: string;
    message?: string;
}

/** Firestore ham verisini SavedAssessment tipine güvenli dönüştürür. */
function mapDocToSavedAssessment(docSnap: firestore.QueryDocumentSnapshot): SavedAssessment {
    const data = docSnap.data() as FirestoreAssessmentDoc;
    return {
        id: docSnap.id,
        userId: data.userId,
        studentId: data.studentId ?? undefined,
        studentName: data.studentName,
        gender: data.gender ?? 'Erkek',
        age: data.age,
        grade: data.grade,
        createdAt: data.createdAt,
        report: data.report,
        sharedBy: data.sharedBy,
        sharedByName: data.sharedByName,
        sharedWith: data.sharedWith,
        isArchived: !!data.isArchived,
    };
}

export const assessmentService = {
    /**
     * Değerlendirme sonucunu Firestore'a kaydeder.
     * Deterministic ID: `assessment_{userId}_{timestamp}` → tekrar kayıt engellenir.
     * subTestResults varsa BEP notlarını öğrenci profiline senkronize eder.
     */
    saveAssessment: async (
        userId: string,
        studentName: string,
        gender: 'Kız' | 'Erkek',
        age: number,
        grade: string,
        report: AssessmentReport,
        studentId?: string,
        subTestResults?: SubTestResult[]
    ): Promise<string> => {
        try {
            const { activeStudent } = useStudentStore.getState();
            const finalStudentId = studentId || activeStudent?.id || null;
            const finalStudentName = studentName || activeStudent?.name || 'Öğrenci';
            const timestamp = Date.now();
            const docId = `assessment_${userId}_${timestamp}`;

            const payload: FirestoreAssessmentDoc = {
                userId,
                studentId: finalStudentId,
                studentName: finalStudentName,
                gender: gender || 'Erkek',
                age: age || 7,
                grade: grade || '1. Sınıf',
                report: JSON.parse(JSON.stringify(report)) as AssessmentReport,
                isArchived: false,
                createdAt: new Date().toISOString(),
            };

            await setDoc(doc(db, 'saved_assessments', docId), payload);

            // ─── BEP Senkronizasyonu ─────────────────────────────────────────
            if (finalStudentId && subTestResults && subTestResults.length > 0) {
                try {
                    const { updateStudent } = useStudentStore.getState();
                    const weakDomains = subTestResults
                        .filter(r => r.score < 65)
                        .map(r => r.name);
                    if (weakDomains.length > 0) {
                        const bepNote = `[BEP ${new Date().toLocaleDateString('tr-TR')}] Desteklenmesi önerilen bilişsel alanlar: ${weakDomains.join(', ')}`;
                        updateStudent(finalStudentId, { notes: bepNote });
                    }
                } catch (bepErr) {
                    // BEP sync hatası ana kayıt işlemini engellemez
                    logError('BEP senkronizasyonu başarısız', { error: bepErr instanceof Error ? bepErr.message : String(bepErr) });
                }
            }

            return docId;
        } catch (error) {
            logError('Değerlendirme kaydedilemedi', { error: error instanceof Error ? error.message : String(error), context: 'saveAssessment' });
            throw error;
        }
    },

    getUserAssessments: async (userId: string): Promise<SavedAssessment[]> => {
        try {
            const q = query(
                collection(db, 'saved_assessments'),
                where('userId', '==', userId)
            );
            const querySnapshot = await getDocs(q);
            const assessments: SavedAssessment[] = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data() as FirestoreAssessmentDoc;
                if (!data.sharedWith) {
                    assessments.push(mapDocToSavedAssessment(docSnap));
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
                collection(db, 'saved_assessments'),
                where('sharedWith', '==', userId)
            );
            const querySnapshot = await getDocs(q);
            const assessments: SavedAssessment[] = [];
            querySnapshot.forEach((docSnap) => {
                assessments.push(mapDocToSavedAssessment(docSnap));
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
                collection(db, 'saved_assessments'),
                where('studentId', '==', studentId)
            );
            const querySnapshot = await getDocs(q);
            const assessments: SavedAssessment[] = [];
            querySnapshot.forEach((docSnap) => {
                assessments.push(mapDocToSavedAssessment(docSnap));
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
                report: JSON.parse(JSON.stringify(assessment.report)) as AssessmentReport,
                sharedBy: senderId,
                sharedByName: senderName || 'Anonim',
                sharedWith: receiverId,
                permission: permission || 'view',
                message: message || '',
                isArchived: false,
                createdAt: new Date().toISOString()
            };
            await addDoc(collection(db, 'saved_assessments'), payload);
        } catch (error) {
            logError('Değerlendirme paylaşılamadı', { error: error instanceof Error ? error.message : String(error), context: 'shareAssessment' });
            throw error;
        }
    }
};
