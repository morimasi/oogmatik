import { supabase } from './supabaseClient';
import { SavedWorksheet, SingleWorksheetData, ActivityType } from '../types';

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
        if (!supabase) throw new Error("Veritabanı bağlantısı yok.");

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
            .maybeSingle();

        if (error) {
            console.error("Supabase worksheet insert error:", error);
            throw error;
        }

        if (!inserted) {
            throw new Error("Etkinlik kaydedildi ancak sunucudan yanıt alınamadı. Lütfen sayfayı yenileyip arşivinizi kontrol edin.");
        }

        // Increment user stats but don't fail the whole operation if this fails.
        // This makes the save more robust.
        supabase.rpc('increment_worksheet_count', { user_id: userId }).then(({ error: rpcError }) => {
            if (rpcError) {
                console.warn("Could not increment worksheet count via RPC:", rpcError);
            }
        });

        return mapDbToWorksheet(inserted);
    },

    getUserWorksheets: async (userId: string, page: number, pageSize: number): Promise<{ items: SavedWorksheet[], count: number | null }> => {
        if (!supabase) return { items: [], count: 0 };
        
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await supabase
            .from('saved_worksheets')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .is('shared_with', null) 
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error("Error fetching worksheets:", error);
            return { items: [], count: 0 };
        }
        return { items: data.map(mapDbToWorksheet), count };
    },

    deleteWorksheet: async (id: string) => {
        if (!supabase) return;
        const { error } = await supabase.from('saved_worksheets').delete().eq('id', id);
        if (error) throw error;
    },

    shareWorksheet: async (worksheet: SavedWorksheet, senderId: string, senderName: string, receiverId: string): Promise<void> => {
        if (!supabase) throw new Error("Veritabanı bağlantısı yok.");

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

    getSharedWithMe: async (userId: string, page: number, pageSize: number): Promise<{ items: SavedWorksheet[], count: number | null }> => {
        if (!supabase) return { items: [], count: 0 };

        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await supabase
            .from('saved_worksheets')
            .select('*', { count: 'exact' })
            .eq('shared_with', userId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error("Error fetching shared worksheets:", error);
            return { items: [], count: 0 };
        }
        return { items: data.map(mapDbToWorksheet), count };
    }
};