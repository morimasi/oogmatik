
import { supabase } from './supabaseClient';
import { ActivityType, ActivityStats, Activity } from '../types';
import { ACTIVITIES } from '../constants';

export const statsService = {
    getAllStats: async (): Promise<ActivityStats[]> => {
        if (!supabase) {
            // Mock Stats so dashboard isn't empty
            return ACTIVITIES.slice(0, 10).map(act => ({
                activityId: act.id,
                title: act.title,
                generationCount: Math.floor(Math.random() * 50) + 5,
                lastGenerated: new Date().toISOString(),
                avgCompletionTime: Math.floor(Math.random() * 15) + 5
            }));
        }
        
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
    
    getTopActivities: async (limit: number = 6): Promise<(Activity & { stats: ActivityStats })[]> => {
        const stats = await statsService.getAllStats();
        const sortedStats = stats.sort((a, b) => b.generationCount - a.generationCount).slice(0, limit);
        
        const result: (Activity & { stats: ActivityStats })[] = [];
        
        sortedStats.forEach(stat => {
            const activityDef = ACTIVITIES.find(a => a.id === stat.activityId);
            if (activityDef) {
                result.push({
                    ...activityDef,
                    stats: stat
                });
            }
        });
        
        // If not enough stats (new app), fill with defaults
        if (result.length < limit) {
            const defaults = ACTIVITIES.slice(0, limit - result.length).filter(a => !result.find(r => r.id === a.id));
            defaults.forEach(def => {
                result.push({
                    ...def,
                    stats: {
                        activityId: def.id,
                        title: def.title,
                        generationCount: 0,
                        lastGenerated: new Date().toISOString(),
                        avgCompletionTime: 10
                    }
                });
            });
        }

        return result;
    }
};
