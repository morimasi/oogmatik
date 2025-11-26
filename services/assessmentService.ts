
import { supabase } from './supabaseClient';
import { AssessmentReport, SavedAssessment } from '../types';

const MOCK_ASSESSMENTS_KEY = 'mock_saved_assessments';

export const assessmentService = {
    saveAssessment: async (
        userId: string,
        studentName: string,
        gender: 'Kız' | 'Erkek',
        age: number,
        grade: string,
        report: AssessmentReport
    ): Promise<void> => {
        // --- MOCK FALLBACK ---
        if (!supabase) {
            const newAssessment: SavedAssessment = {
                id: 'mock-assess-' + Date.now(),
                userId,
                studentName,
                gender,
                age,
                grade,
                report,
                createdAt: new Date().toISOString()
            };
            const stored = localStorage.getItem(MOCK_ASSESSMENTS_KEY);
            const list = stored ? JSON.parse(stored) : [];
            list.push(newAssessment);
            localStorage.setItem(MOCK_ASSESSMENTS_KEY, JSON.stringify(list));
            return;
        }
        // ---------------------

        const payload = {
            user_id: userId,
            student_name: studentName,
            gender,
            age,
            grade,
            report,
            created_at: new Date().toISOString()
        };

        const { error } = await supabase.from('saved_assessments').insert(payload);
        if (error) throw error;
    },

    getUserAssessments: async (userId: string): Promise<SavedAssessment[]> => {
        // --- MOCK FALLBACK ---
        if (!supabase) {
            const stored = localStorage.getItem(MOCK_ASSESSMENTS_KEY);
            const list: SavedAssessment[] = stored ? JSON.parse(stored) : [];
            return list.filter(a => a.userId === userId && !a.sharedWith).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        // ---------------------

        const { data, error } = await supabase
            .from('saved_assessments')
            .select('*')
            .eq('user_id', userId)
            .is('shared_with', null)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching assessments:", error);
            return [];
        }

        return data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            studentName: item.student_name,
            gender: item.gender,
            age: item.age,
            grade: item.grade,
            createdAt: item.created_at,
            report: item.report,
            sharedBy: item.shared_by,
            sharedByName: item.shared_by_name
        }));
    },

    shareAssessment: async (assessment: SavedAssessment, senderId: string, senderName: string, receiverId: string): Promise<void> => {
        if (!supabase) {
            console.log("Mock share assessment simulated.");
            return;
        }

        const payload = {
            user_id: senderId,
            student_name: assessment.studentName,
            gender: assessment.gender,
            age: assessment.age,
            grade: assessment.grade,
            report: assessment.report,
            shared_by: senderId,
            shared_by_name: senderName,
            shared_with: receiverId,
            created_at: new Date().toISOString()
        };

        const { error } = await supabase.from('saved_assessments').insert(payload);
        if (error) throw error;
    },

    getSharedAssessments: async (userId: string): Promise<SavedAssessment[]> => {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('saved_assessments')
            .select('*')
            .eq('shared_with', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching shared assessments:", error);
            return [];
        }

        return data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            studentName: item.student_name,
            gender: item.gender,
            age: item.age,
            grade: item.grade,
            createdAt: item.created_at,
            report: item.report,
            sharedBy: item.shared_by,
            sharedByName: item.shared_by_name,
            sharedWith: item.shared_with
        }));
    }
};
