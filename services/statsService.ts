
import { supabase } from './supabaseClient';
import { ActivityType, ActivityStats, Activity } from '../types';
import { ACTIVITIES } from '../constants';

export const statsService = {
    // Tüm istatistikleri çek
    getAllStats: async (): Promise<ActivityStats[]> => {
        if (!supabase) return [];
        
        try {
            const { data, error } = await supabase.from('activity_stats').select('*');
            if (error) {
                console.warn("Stats fetch error:", error.message);
                return [];
            }

            return data.map((item: any) => ({
                activityId: item.activity_id as ActivityType,
                title: item.title,
                generationCount: item.generation_count,
                lastGenerated: item.last_generated,
                avgCompletionTime: item.avg_completion_time
            }));
        } catch (e) {
            console.error("Stats service error:", e);
            return [];
        }
    },

    // Kullanım sayısını artır (Otomatik)
    incrementUsage: async (activityId: ActivityType) => {
        if (!supabase) return;
        
        try {
            const activity = ACTIVITIES.find(a => a.id === activityId);
            const title = activity ? activity.title : activityId;
            
            // Önce mevcut kaydı kontrol et
            const { data: existing } = await supabase
                .from('activity_stats')
                .select('generation_count')
                .eq('activity_id', activityId)
                .maybeSingle();
            
            const newCount = (existing?.generation_count || 0) + 1;

            // Upsert (Ekle veya Güncelle)
            const { error } = await supabase.from('activity_stats').upsert({
                activity_id: activityId,
                title: title,
                generation_count: newCount,
                last_generated: new Date().toISOString()
            });

            if (error) console.warn("Stats increment error:", error.message);
            
        } catch (e) {
            console.warn("Stats increment warning:", e);
        }
    },

    // En popüler etkinlikleri getir (Favoriler için)
    getTopActivities: async (limit: number = 6): Promise<(Activity & { stats: ActivityStats })[]> => {
        const stats = await statsService.getAllStats();
        
        // İstatistiklere göre sırala (En çok üretilen en üstte)
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
        
        // Eğer yeterli veri yoksa (yeni kurulum), varsayılan popüler etkinlikleri ekle
        if (result.length < limit) {
            const defaults = [
                ActivityType.WORD_SEARCH,
                ActivityType.MATH_PUZZLE,
                ActivityType.STORY_COMPREHENSION,
                ActivityType.VISUAL_ODD_ONE_OUT,
                ActivityType.ODD_EVEN_SUDOKU,
                ActivityType.PUNCTUATION_MAZE
            ].filter(id => !result.find(r => r.id === id));

            defaults.forEach(defId => {
                const def = ACTIVITIES.find(a => a.id === defId);
                if (def && result.length < limit) {
                    result.push({
                        ...def,
                        stats: {
                            activityId: def.id,
                            title: def.title,
                            generationCount: 0, // Henüz verisi yok
                            lastGenerated: new Date().toISOString(),
                            avgCompletionTime: 10
                        }
                    });
                }
            });
        }

        return result;
    }
};