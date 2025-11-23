
import { supabase } from './supabaseClient';
import { AssessmentReport, SavedAssessment } from '../types';

const LOCAL_STORAGE_KEY = 'offline_assessments';

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
            user_id: userId,
            student_name: studentName,
            gender,
            age,
            grade,
            report,
            created_at: new Date().toISOString()
        };

        if (supabase) {
            try {
                const { error } = await supabase.from('saved_assessments').insert(payload);
                if (error) throw error;
                return;
            } catch (e) {
                console.warn("DB Save failed, falling back to local storage.");
            }
        }

        // Fallback
        try {
            const newItem = { ...payload, id: `local-${Date.now()}` };
            const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([newItem, ...existing]));
        } catch (e) {
            console.error("Local save failed", e);
        }
    },

    getUserAssessments: async (userId: string): Promise<SavedAssessment[]> => {
        let dbItems: SavedAssessment[] = [];

        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('saved_assessments')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    dbItems = data.map((item: any) => ({
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
            } catch (e) {
                // Silent fail
            }
        }

        let localItems: SavedAssessment[] = [];
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                localItems = parsed.filter((i: any) => i.user_id === userId).map((item: any) => ({
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
        } catch (e) {}

        return [...dbItems, ...localItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
};
