
import { supabase } from './supabaseClient';
import { AssessmentReport, SavedAssessment } from '../types';

export const assessmentService = {
    saveAssessment: async (
        userId: string,
        studentName: string,
        gender: 'Kız' | 'Erkek',
        age: number,
        grade: string,
        report: AssessmentReport
    ): Promise<void> => {
        if (!supabase) return;

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
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('saved_assessments')
            .select('*')
            .eq('user_id', userId)
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
            report: item.report
        }));
    }
};
