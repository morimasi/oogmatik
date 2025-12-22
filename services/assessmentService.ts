
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { AssessmentReport, SavedAssessment, AdaptiveQuestion, TestCategory, AssessmentConfig } from '../types';
import { generateAdaptiveQuestionsFromAI } from './generators/assessment';
import { generateOfflineAdaptiveQuestions } from './offlineGenerators/assessment';
import { shuffle } from './offlineGenerators/helpers';

const { collection, addDoc, query, where, getDocs } = firestore;

export const assessmentService = {
    // ... (Existing Save/Get/Share methods remain unchanged)
    saveAssessment: async (
        userId: string,
        studentName: string,
        gender: 'Kız' | 'Erkek',
        age: number,
        grade: string,
        report: AssessmentReport,
        studentId?: string // Optional link to student profile
    ): Promise<void> => {
        const payload = {
            userId,
            studentId: studentId || null,
            studentName: studentName || 'Öğrenci',
            gender: gender || 'Erkek',
            age: age || 7,
            grade: grade || '1. Sınıf',
            report: JSON.parse(JSON.stringify(report)),
            createdAt: new Date().toISOString()
        };
        await addDoc(collection(db, "saved_assessments"), payload);
    },

    getUserAssessments: async (userId: string): Promise<SavedAssessment[]> => {
        try {
            const q = query(
                collection(db, "saved_assessments"), 
                where("userId", "==", userId)
            );
            const querySnapshot = await getDocs(q);
            const assessments: SavedAssessment[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as any;
                if (!data.sharedWith) {
                    assessments.push({
                        id: doc.id,
                        userId: data.userId,
                        studentId: data.studentId,
                        studentName: data.studentName,
                        gender: data.gender,
                        age: data.age,
                        grade: data.grade,
                        createdAt: data.createdAt,
                        report: data.report,
                        sharedBy: data.sharedBy,
                        sharedByName: data.sharedByName
                    });
                }
            });
            assessments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return assessments;
        } catch (error) {
            console.error("Error fetching assessments:", error);
            return [];
        }
    },

    // NEW: Get assessments specifically for a student profile
    getAssessmentsByStudent: async (studentId: string): Promise<SavedAssessment[]> => {
        try {
            // Note: In Firestore, you might need a composite index for this if also ordering by date
            // For now, we filter by studentId and sort client-side if needed, or rely on created index
            const q = query(
                collection(db, "saved_assessments"), 
                where("studentId", "==", studentId)
            );
            const querySnapshot = await getDocs(q);
            const assessments: SavedAssessment[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as any;
                assessments.push({
                    id: doc.id,
                    userId: data.userId,
                    studentId: data.studentId,
                    studentName: data.studentName,
                    gender: data.gender,
                    age: data.age,
                    grade: data.grade,
                    createdAt: data.createdAt,
                    report: data.report
                });
            });
            assessments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return assessments;
        } catch (error) {
            console.error("Error fetching student assessments:", error);
            return [];
        }
    },

    shareAssessment: async (assessment: SavedAssessment, senderId: string, senderName: string, receiverId: string): Promise<void> => {
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
            createdAt: new Date().toISOString()
        };
        await addDoc(collection(db, "saved_assessments"), payload);
    },

    getSharedAssessments: async (userId: string): Promise<SavedAssessment[]> => {
        try {
            const q = query(
                collection(db, "saved_assessments"), 
                where("sharedWith", "==", userId)
            );
            const querySnapshot = await getDocs(q);
            const assessments: SavedAssessment[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as any;
                assessments.push({
                    id: doc.id,
                    userId: data.userId,
                    studentName: data.studentName,
                    gender: data.gender,
                    age: data.age,
                    grade: data.grade,
                    createdAt: data.createdAt,
                    report: data.report,
                    sharedBy: data.sharedBy,
                    sharedByName: data.sharedByName,
                    sharedWith: data.sharedWith
                });
            });
            assessments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return assessments;
        } catch (error) {
            console.error("Error fetching shared assessments:", error);
            return [];
        }
    },

    // --- NEW: SESSION GENERATION ---
    
    generateSession: async (config: AssessmentConfig): Promise<AdaptiveQuestion[]> => {
        const { selectedSkills, mode } = config;
        
        // Determine question count per skill based on mode
        // Quick: 3, Standard: 5, Full: 8
        const count = mode === 'quick' ? 3 : (mode === 'standard' ? 5 : 8);
        
        let questionsMap: Record<string, AdaptiveQuestion[]> = {};
        let source = 'offline';

        // 1. Try AI Generation
        try {
            // Only try AI if mode is NOT specifically forcing offline (though config usually doesn't enforce this yet)
            // Ideally we'd have a toggle, but user wants AI default with fallback.
            questionsMap = await generateAdaptiveQuestionsFromAI(selectedSkills, count);
            source = 'ai';
        } catch (error) {
            console.warn("AI Generation failed for Assessment, falling back to Offline engine.", error);
            // 2. Fallback to Offline
            questionsMap = generateOfflineAdaptiveQuestions(selectedSkills, count);
        }

        // 3. Flatten and Prepare Initial Queue
        const allQuestions = Object.values(questionsMap).flat();
        
        return allQuestions; 
    }
};
