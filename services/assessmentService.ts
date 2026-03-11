
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { AssessmentReport, SavedAssessment, AdaptiveQuestion, TestCategory, AssessmentConfig } from '../types';
import { generateAdaptiveQuestionsFromAI } from './generators/assessment';
import { generateOfflineAdaptiveQuestions } from './offlineGenerators/assessment';
import { shuffle } from './offlineGenerators/helpers';

const { collection, addDoc, query, where, getDocs } = firestore;

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

    getAssessmentsByStudent: async (studentId: string): Promise<SavedAssessment[]> => {
        try {
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

    generateSession: async (config: AssessmentConfig): Promise<AdaptiveQuestion[]> => {
        const { selectedSkills, mode } = config;
        const count = mode === 'quick' ? 3 : (mode === 'standard' ? 5 : 8);
        let questionsMap: Record<string, AdaptiveQuestion[]> = {};
        try {
            questionsMap = await generateAdaptiveQuestionsFromAI(selectedSkills, count);
        } catch (error) {
            console.warn("AI Generation failed for Assessment, falling back to Offline engine.", error);
            questionsMap = generateOfflineAdaptiveQuestions(selectedSkills, count);
        }
        return Object.values(questionsMap).flat(); 
    }
};
