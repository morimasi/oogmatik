
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { ActivityType, ActivityStats, Activity } from '../types';
import { ACTIVITIES } from '../constants';
import { authService } from './authService';
import { auth } from './firebaseClient';

const { collection, doc, setDoc, getDocs, updateDoc, increment, getDoc } = firestore;

export const statsService = {
    // Tüm istatistikleri çek
    getAllStats: async (): Promise<ActivityStats[]> => {
        try {
            const querySnapshot = await getDocs(collection(db, "activity_stats"));
            const stats: ActivityStats[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data() as any;
                stats.push({
                    activityId: doc.id as ActivityType, 
                    title: data.title,
                    generationCount: data.generationCount,
                    lastGenerated: data.lastGenerated,
                    avgCompletionTime: data.avgCompletionTime || 10
                });
            });
            return stats;
        } catch (e) {
            console.error("Stats service error:", e);
            return [];
        }
    },

    // Kullanım sayısını artır (Otomatik)
    incrementUsage: async (activityId: ActivityType) => {
        try {
            const activity = ACTIVITIES.find(a => a.id === activityId);
            const title = activity ? activity.title : activityId;
            const statRef = doc(db, "activity_stats", activityId);
            
            const docSnap = await getDoc(statRef);

            if (docSnap.exists()) {
                await updateDoc(statRef, {
                    generationCount: increment(1),
                    lastGenerated: new Date().toISOString()
                });
            } else {
                await setDoc(statRef, {
                    title: title,
                    generationCount: 1,
                    lastGenerated: new Date().toISOString(),
                    avgCompletionTime: 10
                });
            }
        } catch (e) {
            console.warn("Stats increment warning:", e);
        }
    },

    // En popüler etkinlikleri getir (Favoriler için)
    getTopActivities: async (limit: number = 10, forceDefaults: boolean = false): Promise<(Activity & { stats: ActivityStats })[]> => {
        let stats: ActivityStats[] = [];
        
        if (!forceDefaults) {
            stats = await statsService.getAllStats();
        }
        
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
        
        // Eğer yeterli veri yoksa, varsayılanları ekle
        if (result.length < limit) {
            const defaults = [
                ActivityType.WORD_SEARCH,
                ActivityType.MATH_PUZZLE,
                ActivityType.STORY_COMPREHENSION,
                ActivityType.VISUAL_ODD_ONE_OUT,
                ActivityType.ODD_EVEN_SUDOKU,
                ActivityType.PUNCTUATION_MAZE,
                ActivityType.FIND_THE_DIFFERENCE,
                ActivityType.NUMBER_SEARCH,
                ActivityType.READING_FLOW,
                ActivityType.BASIC_OPERATIONS
            ].filter(id => !result.find(r => r.id === id));

            defaults.forEach(defId => {
                const def = ACTIVITIES.find(a => a.id === defId);
                if (def && result.length < limit) {
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
                }
            });
        }

        return result;
    },

    // --- FAVORITES (LOCAL STORAGE & FIREBASE SYNC) ---
    getFavorites: (): ActivityType[] => {
        try {
            if (typeof window === 'undefined') return [];
            return JSON.parse(localStorage.getItem('user_favorites') || '[]');
        } catch { return []; }
    },

    toggleFavorite: (id: ActivityType) => {
        try {
            const favs = statsService.getFavorites();
            const newFavs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
            localStorage.setItem('user_favorites', JSON.stringify(newFavs));
            
            // Sync with Firebase if user is logged in
            const currentUser = auth.currentUser;
            if (currentUser) {
                authService.updateProfile(currentUser.uid, { favorites: newFavs }).catch(console.error);
            }
            
            return newFavs;
        } catch { return []; }
    },

    isFavorite: (id: ActivityType) => {
        return statsService.getFavorites().includes(id);
    }
};
