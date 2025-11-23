
import { supabase } from './supabaseClient';
import { SavedWorksheet, SingleWorksheetData, ActivityType } from '../types';

const LOCAL_STORAGE_KEY = 'offline_worksheets';

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
        // Try DB first
        if (supabase) {
            try {
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
                
                // Increment user stats silently
                supabase.rpc('increment_worksheet_count', { user_id: userId }).catch(() => {});

                return mapDbToWorksheet(inserted);
            } catch (e) {
                console.warn("DB Save failed, falling back to local storage.", e);
            }
        }

        // Fallback to LocalStorage
        const newWorksheet: SavedWorksheet = {
            id: `local-${Date.now()}`,
            userId,
            name,
            activityType,
            worksheetData: data,
            createdAt: new Date().toISOString(),
            icon,
            category
        };

        try {
            const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([newWorksheet, ...existing]));
        } catch (e) {
            console.error("Local storage save failed", e);
            throw new Error("Kaydetme başarısız oldu (Disk dolu olabilir).");
        }

        return newWorksheet;
    },

    getUserWorksheets: async (userId: string): Promise<SavedWorksheet[]> => {
        let dbWorksheets: SavedWorksheet[] = [];
        
        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('saved_worksheets')
                    .select('*')
                    .eq('user_id', userId)
                    .is('shared_with', null) // Only own worksheets
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    dbWorksheets = data.map(mapDbToWorksheet);
                }
            } catch (e) {
                // Ignore DB errors in safe mode
            }
        }

        // Load local worksheets
        let localWorksheets: SavedWorksheet[] = [];
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                // Filter by user if needed, though local storage is usually single user per browser profile context
                localWorksheets = parsed.filter((w: any) => w.userId === userId);
            }
        } catch (e) {}

        // Merge and sort
        return [...dbWorksheets, ...localWorksheets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    deleteWorksheet: async (id: string) => {
        if (id.startsWith('local-')) {
            try {
                const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
                const filtered = existing.filter((w: any) => w.id !== id);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
                return;
            } catch (e) { return; }
        }

        if (supabase) {
            try {
                const { error } = await supabase.from('saved_worksheets').delete().eq('id', id);
                if (error) throw error;
            } catch (e) {
                console.warn("DB delete failed", e);
                throw e;
            }
        }
    },

    shareWorksheet: async (worksheet: SavedWorksheet, senderId: string, senderName: string, receiverId: string): Promise<void> => {
        if (!supabase) throw new Error("Paylaşım için internet bağlantısı gereklidir.");

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

        try {
            const { data, error } = await supabase
                .from('saved_worksheets')
                .select('*')
                .eq('shared_with', userId)
                .order('created_at', { ascending: false });

            if (error) return [];
            return data.map(mapDbToWorksheet);
        } catch (e) {
            return [];
        }
    }
};
