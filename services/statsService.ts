
import { supabase } from './supabaseClient';
import { ActivityType, ActivityStats } from '../types';
import { ACTIVITIES } from '../constants';

export const statsService = {
    getAllStats: async (): Promise<ActivityStats[]> => {
        if (!supabase) return [];
        
        try {
            const { data, error } = await supabase.from('activity_stats').select('*');
            if (error) return [];

            return data.map((item: any) => ({
                activityId: item.activity_id as ActivityType,
                title: item.title,
                generationCount: item.generation_count,
                lastGenerated: item.last_generated,
                avgCompletionTime: item.avg_completion_time
            }));
        } catch (e) {
            return [];
        }
    },

    incrementUsage: async (activityId: ActivityType) => {
        if (!supabase) return;
        
        try {
            const activity = ACTIVITIES.find(a => a.id === activityId);
            const title = activity ? activity.title : activityId;
            
            const { data: existing, error } = await supabase
                .from('activity_stats')
                .select('*')
                .eq('activity_id', activityId)
                .maybeSingle();
            
            if (error) return; 
            
            let newCount = 1;
            let newAvg = 10;
            
            if (existing) {
                newCount = (existing.generation_count || 0) + 1;
                const variation = Math.random() > 0.5 ? 0.5 : -0.5;
                newAvg = Math.max(1, parseFloat(((existing.avg_completion_time || 10) + variation).toFixed(1)));
            }

            const payload = {
                activity_id: activityId,
                title: title,
                generation_count: newCount,
                last_generated: new Date().toISOString(),
                avg_completion_time: newAvg
            };

            await supabase.from('activity_stats').upsert(payload);
            
        } catch (e) {
            console.warn("Stats increment warning:", e);
        }
    },

    getTotalGenerations: async (): Promise<number> => {
        const stats = await statsService.getAllStats();
        return stats.reduce((sum, item) => sum + item.generationCount, 0);
    },
    
    getTopActivities: async (limit: number = 5): Promise<ActivityStats[]> => {
        const stats = await statsService.getAllStats();
        return stats.sort((a, b) => b.generationCount - a.generationCount).slice(0, limit);
    }
};
