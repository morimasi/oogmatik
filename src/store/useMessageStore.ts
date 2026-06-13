import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, ChatSettings, NotificationPreferences } from '../types/messaging';

const defaultNotificationPreferences: NotificationPreferences = {
  soundEnabled: true,
  vibrationEnabled: true,
  desktopEnabled: false,
  showOnLockScreen: false,
};

const defaultChatSettings: ChatSettings = {
  isMuted: false,
  showReadReceipts: true,
  notificationPreferences: defaultNotificationPreferences,
};

interface MessageState {
  activeConversationId: string | null;
  activeThreadId: string | null;
  quotingMessage: Message | null;
  editingMessage: Message | null;
  unreadTotalCount: number;
  highlightMessageId: string | null;

  // Per-conversation settings (keyed by conversationId)
  conversationSettings: Record<string, ChatSettings>;

  setActiveConversationId: (id: string | null) => void;
  setActiveThreadId: (id: string | null) => void;
  setQuotingMessage: (msg: Message | null) => void;
  setEditingMessage: (msg: Message | null) => void;
  setUnreadTotalCount: (count: number) => void;
  setHighlightMessageId: (id: string | null) => void;
  clearComposerState: () => void;

  getConversationSettings: (conversationId: string) => ChatSettings;
  updateConversationSettings: (conversationId: string, updates: Partial<ChatSettings>) => void;
  updateNotificationPreferences: (conversationId: string, prefs: Partial<NotificationPreferences>) => void;
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      activeConversationId: null,
      activeThreadId: null,
      quotingMessage: null,
      editingMessage: null,
      unreadTotalCount: 0,
      highlightMessageId: null,
      conversationSettings: {},

      setActiveConversationId: (id: string | null) => set({
        activeConversationId: id,
        activeThreadId: null,
        quotingMessage: null,
        editingMessage: null,
        highlightMessageId: null,
      }),

      setActiveThreadId: (id: string | null) => set({ activeThreadId: id }),
      setQuotingMessage: (msg: Message | null) => set({
        quotingMessage: msg,
        editingMessage: null,
      }),
      setEditingMessage: (msg: Message | null) => set({
        editingMessage: msg,
        quotingMessage: null,
      }),
      setUnreadTotalCount: (count: number) => set({ unreadTotalCount: count }),
      setHighlightMessageId: (id: string | null) => set({ highlightMessageId: id }),

      clearComposerState: () => set({
        quotingMessage: null,
        editingMessage: null,
      }),

      getConversationSettings: (conversationId: string): ChatSettings => {
        const state = get();
        return state.conversationSettings[conversationId] || { ...defaultChatSettings };
      },

      updateConversationSettings: (conversationId: string, updates: Partial<ChatSettings>) => {
        const state = get();
        const current = state.conversationSettings[conversationId] || { ...defaultChatSettings };
        set({
          conversationSettings: {
            ...state.conversationSettings,
            [conversationId]: { ...current, ...updates },
          },
        });
      },

      updateNotificationPreferences: (conversationId: string, prefs: Partial<NotificationPreferences>) => {
        const state = get();
        const current = state.conversationSettings[conversationId] || { ...defaultChatSettings };
        set({
          conversationSettings: {
            ...state.conversationSettings,
            [conversationId]: {
              ...current,
              notificationPreferences: { ...current.notificationPreferences, ...prefs },
            },
          },
        });
      },
    }),
    {
      name: 'bdmind-message-store',
      partialize: (state) => ({
        conversationSettings: state.conversationSettings,
      }),
    }
  )
);
