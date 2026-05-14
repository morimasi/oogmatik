import { create } from 'zustand';
import { IMessage } from '../types/messaging';

interface MessageState {
    activeConversationId: string | null;
    activeThreadId: string | null;
    quotingMessage: IMessage | null;
    editingMessage: IMessage | null;
    unreadTotalCount: number;

    // Actions
    setActiveConversationId: (id: string | null) => void;
    setActiveThreadId: (id: string | null) => void;
    setQuotingMessage: (msg: IMessage | null) => void;
    setEditingMessage: (msg: IMessage | null) => void;
    setUnreadTotalCount: (count: number) => void;
    
    // Yardımcı fonksiyonlar
    clearComposerState: () => void;
}

export const useMessageStore = create<MessageState>()((set) => ({
    // Initial State
    activeConversationId: null,
    activeThreadId: null,
    quotingMessage: null,
    editingMessage: null,
    unreadTotalCount: 0,

    // Methods
    setActiveConversationId: (id) => set({ 
        activeConversationId: id,
        // Yeni sohbete geçince thread'i ve composer durumunu sıfırla
        activeThreadId: null,
        quotingMessage: null,
        editingMessage: null
    }),

    setActiveThreadId: (id) => set({ activeThreadId: id }),

    setQuotingMessage: (msg) => set({ 
        quotingMessage: msg,
        editingMessage: null // Aynı anda hem alıntı hem edit yapılamaz
    }),

    setEditingMessage: (msg) => set({ 
        editingMessage: msg,
        quotingMessage: null
    }),

    setUnreadTotalCount: (count) => set({ unreadTotalCount: count }),

    clearComposerState: () => set({
        quotingMessage: null,
        editingMessage: null
    })
}));
