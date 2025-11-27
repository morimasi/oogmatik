import { supabase } from './supabaseClient';
import { FeedbackItem, Message, User } from '../types';

const mapDbFeedback = (db: any): FeedbackItem => ({
    id: db.id,
    userId: db.user_id,
    userName: db.user_name,
    userEmail: db.user_email,
    activityType: db.activity_type,
    activityTitle: db.activity_title,
    rating: db.rating,
    message: db.message,
    timestamp: db.timestamp,
    status: db.status,
    adminReply: db.admin_reply
});

export const mapDbMessage = (db: any): Message => ({
    id: db.id,
    senderId: db.sender_id,
    receiverId: db.receiver_id,
    senderName: db.sender_name,
    content: db.content,
    timestamp: db.timestamp,
    isRead: db.is_read,
    relatedFeedbackId: db.related_feedback_id
});

export const messagingService = {
    submitFeedback: async (data: Omit<FeedbackItem, 'id' | 'timestamp' | 'status'>): Promise<void> => {
        if (!supabase) {
            console.log("Mock Feedback Submitted:", data);
            return;
        }
        
        const payload = {
            user_id: data.userId,
            user_name: data.userName,
            user_email: data.userEmail,
            activity_type: data.activityType,
            activity_title: data.activityTitle,
            rating: data.rating,
            message: data.message,
            status: 'new'
        };

        const { error } = await supabase.from('feedbacks').insert(payload);
        if (error) throw error;
    },

    getAllFeedbacks: async (page: number, pageSize: number): Promise<{ feedbacks: FeedbackItem[], count: number | null }> => {
        if (!supabase) {
            return { 
                feedbacks: [
                    { id: 'm1', userId: 'u1', userName: 'Mehmet', userEmail: 'mehmet@test.com', activityType: 'WORD_SEARCH', activityTitle: 'Kelime Bulmaca', rating: 5, message: 'Harika bir uygulama!', timestamp: new Date().toISOString(), status: 'new' },
                    { id: 'm2', userId: 'u2', userName: 'Ayşe', userEmail: 'ayse@test.com', activityType: 'MATH', activityTitle: 'Matematik', rating: 4, message: 'Daha fazla soru eklenebilir.', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'read' }
                ],
                count: 2
            };
        }
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await supabase
            .from('feedbacks')
            .select('*', { count: 'exact' })
            .order('timestamp', { ascending: false })
            .range(from, to);

        if (error) {
            console.error("Error fetching feedbacks:", error);
            return { feedbacks: [], count: 0 };
        }
        return { feedbacks: data.map(mapDbFeedback), count };
    },

    replyToFeedback: async (feedbackId: string, replyMessage: string, adminUser: User): Promise<void> => {
        if (!supabase) {
            console.log("Mock reply sent:", replyMessage);
            return;
        }

        const { data: feedback, error: fbError } = await supabase
            .from('feedbacks')
            .update({ status: 'replied', admin_reply: replyMessage })
            .eq('id', feedbackId)
            .select()
            .maybeSingle();

        if (fbError) throw fbError;

        if (feedback && feedback.user_id) {
            await messagingService.sendMessage({
                senderId: adminUser.id,
                senderName: adminUser.name,
                receiverId: feedback.user_id,
                content: `GERİ BİLDİRİM YANITI:\n"${feedback.message}"\n\nYANIT:\n${replyMessage}`,
                relatedFeedbackId: feedbackId
            });
        }
    },

    sendMessage: async (msgData: Omit<Message, 'id' | 'timestamp' | 'isRead'>): Promise<Message> => {
        if (!supabase) {
            console.log("Mock Message Sent:", msgData);
             const mockMessage: Message = {
                id: `mock-${Date.now()}`,
                timestamp: new Date().toISOString(),
                isRead: false,
                ...msgData
            };
            return mockMessage;
        }

        const payload = {
            sender_id: msgData.senderId,
            sender_name: msgData.senderName,
            receiver_id: msgData.receiverId,
            content: msgData.content,
            related_feedback_id: msgData.relatedFeedbackId
        };

        const { data, error } = await supabase
            .from('messages')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error("Mesaj gönderildi ancak sunucudan yanıt alınamadı.");
        
        return mapDbMessage(data);
    },

    getMessagesForUser: async (userId: string): Promise<Message[]> => {
        if (!supabase) {
            // Return empty for mock users unless we implement a local message store,
            // or return a welcome message
            return [{
                id: 'welcome-msg',
                senderId: 'system',
                receiverId: userId,
                senderName: 'Sistem',
                content: 'Sisteme hoş geldiniz! Bu mesaj çevrimdışı modda olduğunuz için otomatik oluşturulmuştur.',
                timestamp: new Date().toISOString(),
                isRead: false
            }];
        }

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('timestamp', { ascending: true });

        if (error) return [];
        return data.map(mapDbMessage);
    },

    getUnreadCount: async (userId: string): Promise<number> => {
        if (!supabase) return 0;
        const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', userId)
            .eq('is_read', false);
        return count || 0;
    },

    markAsRead: async (messageId: string) => {
        if (!supabase) return;
        await supabase.from('messages').update({ is_read: true }).eq('id', messageId);
    }
};