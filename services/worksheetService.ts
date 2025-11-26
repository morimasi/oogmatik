
import { supabase } from './supabaseClient';
import { SavedWorksheet, SingleWorksheetData, ActivityType } from '../types';

const MOCK_STORAGE_KEY = 'mock_saved_worksheets';

// Mapper
const mapDbToWorksheet = (dbItem: any): SavedWorksheet => ({
    id: dbItem.id,
    userId: dbItem.user_id,
    name: dbItem.name,
    activityType: dbItem.activity_type as ActivityType,
    worksheetData: dbItem.worksheet_data as SingleWorksheetData[],
    createdAt: dbItem.created_at,
    icon: dbItem.icon || 'fa-solid fa-file',
    category: {
        id: dbItem.category_id || 'uncategorized',
        title: dbItem.category_title || 'Genel'
    },
    sharedBy: dbItem.shared_by,
    sharedByName: dbItem.shared_by_name,
    sharedWith: dbItem.shared_with
});

export const worksheetService = {
    saveWorksheet: async (
        userId: string, 
        name: string, 
        activityType: ActivityType, 
        data: SingleWorksheetData[], 
        icon: string,
        category: { id: string, title: string }
    ): Promise<SavedWorksheet> => {
        // --- MOCK FALLBACK ---
        if (!supabase) {
            const newWorksheet: SavedWorksheet = {
                id: 'mock-ws-' + Date.now(),
                userId,
                name,
                activityType,
                worksheetData: data,
                icon,
                category,
                createdAt: new Date().toISOString()
            };
            const stored = localStorage.getItem(MOCK_STORAGE_KEY);
            const worksheets = stored ? JSON.parse(stored) : [];
            worksheets.push(newWorksheet);
            localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(worksheets));
            return newWorksheet;
        }
        // ---------------------

        const dbPayload = {
            user_id: userId,
            name,
            activity_type: activityType,
            worksheet_data: data,
            icon,
            category_id: category.id,
            category_title: category.title,
            created_at: new Date().toISOString()
        };

        const { data: inserted, error } = await supabase
            .from('saved_worksheets')
            .insert(dbPayload)
            .select()
            .single();

        if (error) throw error;
        
        // Increment user stats
        await supabase.rpc('increment_worksheet_count', { user_id: userId }).catch(() => {});

        return mapDbToWorksheet(inserted);
    },

    getUserWorksheets: async (userId: string): Promise<SavedWorksheet[]> => {
        // --- MOCK FALLBACK ---
        if (!supabase) {
            const stored = localStorage.getItem(MOCK_STORAGE_KEY);
            const worksheets: SavedWorksheet[] = stored ? JSON.parse(stored) : [];
            return worksheets.filter(w => w.userId === userId && !w.sharedWith).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        // ---------------------
        
        const { data, error } = await supabase
            .from('saved_worksheets')
            .select('*')
            .eq('user_id', userId)
            .is('shared_with', null) 
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching worksheets:", error);
            return [];
        }
        return data.map(mapDbToWorksheet);
    },

    deleteWorksheet: async (id: string) => {
        // --- MOCK FALLBACK ---
        if (!supabase) {
            const stored = localStorage.getItem(MOCK_STORAGE_KEY);
            if (stored) {
                const worksheets: SavedWorksheet[] = JSON.parse(stored);
                const filtered = worksheets.filter(w => w.id !== id);
                localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(filtered));
            }
            return;
        }
        // ---------------------

        const { error } = await supabase.from('saved_worksheets').delete().eq('id', id);
        if (error) throw error;
    },

    shareWorksheet: async (worksheet: SavedWorksheet, senderId: string, senderName: string, receiverId: string): Promise<void> => {
        if (!supabase) {
            console.log("Mock sharing not fully supported but acknowledged.");
            return;
        }

        const sharedPayload = {
            user_id: senderId, 
            name: worksheet.name,
            activity_type: worksheet.activityType,
            worksheet_data: worksheet.worksheetData,
            icon: worksheet.icon,
            category_id: worksheet.category.id,
            category_title: worksheet.category.title,
            shared_by: senderId,
            shared_by_name: senderName,
            shared_with: receiverId,
            created_at: new Date().toISOString()
        };

        const { error } = await supabase.from('saved_worksheets').insert(sharedPayload);
        if (error) throw error;
    },

    getSharedWithMe: async (userId: string): Promise<SavedWorksheet[]> => {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('saved_worksheets')
            .select('*')
            .eq('shared_with', userId)
            .order('created_at', { ascending: false });

        if (error) return [];
        return data.map(mapDbToWorksheet);
    }
};
