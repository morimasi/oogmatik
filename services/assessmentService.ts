
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { AssessmentReport, SavedAssessment } from '../types';

const { collection, addDoc, query, where, getDocs } = firestore;

export const assessmentService = {
    saveAssessment: async (
        userId: string,
        studentName: string,
        gender: 'Kız' | 'Erkek',
        age: number,
        grade: string,
        report: AssessmentReport
    ): Promise<void> => {
        // Ensure no undefined values
        const payload = {
            userId,
            studentName: studentName || 'Öğrenci',
            gender: gender || 'Erkek',
            age: age || 7,
            grade: grade || '1. Sınıf',
            report: JSON.parse(JSON.stringify(report)), // Deep clone to strip undefineds
            createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, "saved_assessments"), payload);
    },

    getUserAssessments: async (userId: string): Promise<SavedAssessment[]> => {
        try {
            // REMOVED orderBy to prevent index errors
            const q = query(
                collection(db, "saved_assessments"), 
                where("userId", "==", userId)
            );

            const querySnapshot = await getDocs(q);
            const assessments: SavedAssessment[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Filter out shared items if necessary
                if (!data.sharedWith) {
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
                        sharedByName: data.sharedByName
                    });
                }
            });

            // Client-side sorting
            assessments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            return assessments;
        } catch (error) {
            console.error("Error fetching assessments:", error);
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
            report: JSON.parse(JSON.stringify(assessment.report)), // Ensure clean object
            sharedBy: senderId,
            sharedByName: senderName || 'Anonim',
            sharedWith: receiverId,
            createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, "saved_assessments"), payload);
    },

    getSharedAssessments: async (userId: string): Promise<SavedAssessment[]> => {
        try {
            // REMOVED orderBy
            const q = query(
                collection(db, "saved_assessments"), 
                where("sharedWith", "==", userId)
            );

            const querySnapshot = await getDocs(q);
            const assessments: SavedAssessment[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
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

            // Client-side sorting
            assessments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            return assessments;
        } catch (error) {
            console.error("Error fetching shared assessments:", error);
            return [];
        }
    }
};
