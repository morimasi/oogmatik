import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { AssessmentReport, SavedAssessment } from '../types';

const { collection, addDoc, query, where, getDocs, orderBy } = firestore;

export const assessmentService = {
    saveAssessment: async (
        userId: string,
        studentName: string,
        gender: 'Kız' | 'Erkek',
        age: number,
        grade: string,
        report: AssessmentReport
    ): Promise<void> => {
        const payload = {
            userId,
            studentName,
            gender,
            age,
            grade,
            report,
            createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, "saved_assessments"), payload);
    },

    getUserAssessments: async (userId: string): Promise<SavedAssessment[]> => {
        try {
            const q = query(
                collection(db, "saved_assessments"), 
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);
            const assessments: SavedAssessment[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Filter out shared items if necessary, assuming sharedWith field check
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
            report: assessment.report,
            sharedBy: senderId,
            sharedByName: senderName,
            sharedWith: receiverId,
            createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, "saved_assessments"), payload);
    },

    getSharedAssessments: async (userId: string): Promise<SavedAssessment[]> => {
        try {
            const q = query(
                collection(db, "saved_assessments"), 
                where("sharedWith", "==", userId),
                orderBy("createdAt", "desc")
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

            return assessments;
        } catch (error) {
            console.error("Error fetching shared assessments:", error);
            return [];
        }
    }
};