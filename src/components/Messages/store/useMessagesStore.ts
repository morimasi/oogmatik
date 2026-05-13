import { create } from 'zustand';
import type { Message } from '../../../types';
import type {
  MessagesState,
  MessagesActions,
  Contact,
  FileUploadState,
  MessageNotification,
  NotificationPreferences,
} from '../types';

type MessagesStore = MessagesState & MessagesActions;

const defaultNotificationPrefs: NotificationPreferences = {
  sound: true,
  vibration: true,
  visual: true,
  showPreview: true,
  groupByConversation: true,
};

const initialState: MessagesState = {
  contacts: [],
  activeContactId: null,
  messages: [],
  loading: false,
  sending: false,
  replyToMessage: null,
  quoteContent: null,
  fileUploads: [],
  unreadCount: 0,
  notifications: [],
  notificationPrefs: defaultNotificationPrefs,
  searchQuery: '',
  error: null,
};

export const useMessagesStore = create<MessagesStore>((set) => ({
  ...initialState,

  setContacts: (contacts) => set({ contacts }),
  setActiveContactId: (id) => set({ activeContactId: id, messages: [], replyToMessage: null, quoteContent: null }),
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  updateMessage: (id, updates) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),
  removeMessage: (id) =>
    set((s) => ({
      messages: s.messages.filter((m) => m.id !== id),
    })),
  setLoading: (loading) => set({ loading }),
  setSending: (sending) => set({ sending }),
  setReplyToMessage: (msg) => set({ replyToMessage: msg }),
  setQuoteContent: (content) => set({ quoteContent: content }),
  addFileUpload: (upload) => set((s) => ({ fileUploads: [...s.fileUploads, upload] })),
  updateFileUpload: (id, updates) =>
    set((s) => ({
      fileUploads: s.fileUploads.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),
  removeFileUpload: (id) =>
    set((s) => ({ fileUploads: s.fileUploads.filter((f) => f.id !== id) })),
  clearFileUploads: () => set({ fileUploads: [] }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  addNotification: (notification) =>
    set((s) => ({ notifications: [notification, ...s.notifications].slice(0, 50) })),
  dismissNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
  dismissAllNotifications: () => set({ notifications: [] }),
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    })),
  setNotificationPrefs: (prefs) =>
    set((s) => ({ notificationPrefs: { ...s.notificationPrefs, ...prefs } })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setError: (error) => set({ error }),
  resetMessages: () => set(initialState),
}));
