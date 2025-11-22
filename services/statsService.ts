
import { ActivityType, ActivityStats } from '../types';
import { ACTIVITIES } from '../constants';

const STATS_KEY = 'app_global_stats';

export const statsService = {
    // Initialize stats if they don't exist (seeding for demo purposes)
    initializeStats: () => {
        if (localStorage.getItem(STATS_KEY)) return;

        const initialStats: Record<string, ActivityStats> = {};
        
        ACTIVITIES.forEach(activity => {
            // Generate some realistic looking fake data for the demo
            const baseCount = Math.floor(Math.random() * 50) + 5;
            const avgTime = Math.floor(Math.random() * 15) + 5;
            
            initialStats[activity.id] = {
                activityId: activity.id,
                title: activity.title,
                generationCount: baseCount,
                lastGenerated: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
                avgCompletionTime: avgTime
            };
        });

        localStorage.setItem(STATS_KEY, JSON.stringify(initialStats));
    },

    getAllStats: (): ActivityStats[] => {
        const stored = localStorage.getItem(STATS_KEY);
        if (!stored) {
            statsService.initializeStats();
            return statsService.getAllStats();
        }
        return Object.values(JSON.parse(stored));
    },

    getTopActivities: (limit: number = 5): ActivityStats[] => {
        const stats = statsService.getAllStats();
        return stats.sort((a, b) => b.generationCount - a.generationCount).slice(0, limit);
    },

    getTotalGenerations: (): number => {
        const stats = statsService.getAllStats();
        return stats.reduce((sum, item) => sum + item.generationCount, 0);
    },

    incrementUsage: (activityId: ActivityType) => {
        const stored = localStorage.getItem(STATS_KEY);
        let statsMap: Record<string, ActivityStats> = stored ? JSON.parse(stored) : {};
        
        if (!statsMap[activityId]) {
            // Fallback if new activity added
            const activity = ACTIVITIES.find(a => a.id === activityId);
            statsMap[activityId] = {
                activityId,
                title: activity ? activity.title : activityId,
                generationCount: 0,
                lastGenerated: new Date().toISOString(),
                avgCompletionTime: 10 // Default
            };
        }

        statsMap[activityId].generationCount += 1;
        statsMap[activityId].lastGenerated = new Date().toISOString();
        
        // Slightly vary the avg time to make it look alive
        const variation = Math.random() > 0.5 ? 0.5 : -0.5;
        statsMap[activityId].avgCompletionTime = Math.max(1, parseFloat((statsMap[activityId].avgCompletionTime + variation).toFixed(1)));

        localStorage.setItem(STATS_KEY, JSON.stringify(statsMap));
    }
};
