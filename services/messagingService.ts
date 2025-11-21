
import { FeedbackItem, Message, User } from '../types';
import { authService } from './authService';

const MESSAGES_KEY = 'app_messages';
const FEEDBACKS_KEY = 'app_feedbacks';

// Mock implementation using localStorage to simulate a backend service
export const messagingService = {
    // --- FEEDBACK ---
    submitFeedback: async (data: Omit<FeedbackItem, 'id' | 'timestamp' | 'status'>): Promise<FeedbackItem> => {
        await new Promise(resolve => setTimeout(resolve, 500)); // Sim delay
        
        const feedbacks = JSON.parse(localStorage.getItem(FEEDBACKS_KEY) || '[]');
        const newFeedback: FeedbackItem = {
            ...data,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            status: 'new'
        };
        
        feedbacks.unshift(newFeedback); // Add to top
        localStorage.setItem(FEEDBACKS_KEY, JSON.stringify(feedbacks));
        return newFeedback;
    },

    getAllFeedbacks: (): FeedbackItem[] => {
        return JSON.parse(localStorage.getItem(FEEDBACKS_KEY) || '[]');
    },

    // Admin replies to feedback -> Marks as replied AND sends a message to user
    replyToFeedback: async (feedbackId: string, replyMessage: string, adminUser: User): Promise<void> => {
        const feedbacks = messagingService.getAllFeedbacks();
        const index = feedbacks.findIndex(f => f.id === feedbackId);
        
        if (index === -1) throw new Error("Feedback not found");
        
        // Update Feedback Status
        feedbacks[index].status = 'replied';
        feedbacks[index].adminReply = replyMessage;
        localStorage.setItem(FEEDBACKS_KEY, JSON.stringify(feedbacks));

        // Send Message to User
        if (feedbacks[index].userId) {
            await messagingService.sendMessage({
                senderId: adminUser.id,
                senderName: adminUser.name,
                receiverId: feedbacks[index].userId!,
                content: `GERİ BİLDİRİM YANITI:\n"${feedbacks[index].message}"\n\nYANIT:\n${replyMessage}`,
                relatedFeedbackId: feedbackId
            });
        }
    },

    // --- MESSAGING ---
    sendMessage: async (msgData: Omit<Message, 'id' | 'timestamp' | 'isRead'>): Promise<Message> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
        const newMessage: Message = {
            ...msgData,
            id: Date.now().toString() + Math.random(),
            timestamp: new Date().toISOString(),
            isRead: false
        };
        
        messages.push(newMessage);
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
        return newMessage;
    },

    getMessagesForUser: (userId: string): Message[] => {
        const allMessages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]') as Message[];
        // Return messages where user is sender OR receiver
        return allMessages.filter(m => m.senderId === userId || m.receiverId === userId)
                          .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },

    getUnreadCount: (userId: string): number => {
        const allMessages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]') as Message[];
        return allMessages.filter(m => m.receiverId === userId && !m.isRead).length;
    },

    markAsRead: (messageId: string) => {
        const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]') as Message[];
        const index = messages.findIndex(m => m.id === messageId);
        if (index !== -1) {
            messages[index].isRead = true;
            localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
        }
    }
};
