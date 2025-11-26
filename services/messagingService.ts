
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

const mapDbMessage = (db: any): Message => ({
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

    getAllFeedbacks: async (): Promise<FeedbackItem[]> => {
        if (!supabase) return [];
        const { data, error } = await supabase.from('feedbacks').select('*').order('timestamp', { ascending: false });
        if (error) return [];
        return data.map(mapDbFeedback);
    },

    replyToFeedback: async (feedbackId: string, replyMessage: string, adminUser: User): Promise<void> => {
        if (!supabase) return;

        const { data: feedback, error: fbError } = await supabase
            .from('feedbacks')
            .update({ status: 'replied', admin_reply: replyMessage })
            .eq('id', feedbackId)
            .select()
            .single();

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

    sendMessage: async (msgData: Omit<Message, 'id' | 'timestamp' | 'isRead'>): Promise<void> => {
        if (!supabase) {
            console.log("Mock Message Sent:", msgData);
            return;
        }

        const payload = {
            sender_id: msgData.senderId,
            sender_name: msgData.senderName,
            receiver_id: msgData.receiverId,
            content: msgData.content,
            related_feedback_id: msgData.relatedFeedbackId
        };

        const { error } = await supabase.from('messages').insert(payload);
        if (error) throw error;
    },

    getMessagesForUser: async (userId: string): Promise<Message[]> => {
        if (!supabase) return [];

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
