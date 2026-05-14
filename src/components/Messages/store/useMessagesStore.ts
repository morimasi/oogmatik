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
import { loadNotificationPrefs } from '../services/notificationService';

type MessagesStore = MessagesState & MessagesActions;

const defaultNotificationPrefs: NotificationPreferences = {
  sound: true,
  vibration: true,
  visual: true,
  showPreview: true,
  groupByConversation: true,
};

// localStorage'dan kayıtlı tercihleri yükle
const savedPrefs = loadNotificationPrefs();
const mergedPrefs: NotificationPreferences = { ...defaultNotificationPrefs, ...savedPrefs };

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
  notificationPrefs: mergedPrefs,
  searchQuery: '',
  error: null,
  highlightedMessageId: null,
  isMessagesOpen: false,
  autoDismissDelay: 6000,
};

export const useMessagesStore = create<MessagesStore>((set) => ({
  ...initialState,

  setContacts: (contacts: Contact[]) => set({ contacts }),
  setActiveContactId: (id: string | null) =>
    set({ activeContactId: id, messages: [], replyToMessage: null, quoteContent: null }),
  setMessages: (messages: Message[]) => set({ messages }),
  addMessage: (msg: Message) => set((s: MessagesStore) => ({ messages: [...s.messages, msg] })),
  updateMessage: (id: string, updates: Partial<Message>) =>
    set((s: MessagesStore) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),
  removeMessage: (id: string) =>
    set((s: MessagesStore) => ({
      messages: s.messages.filter((m) => m.id !== id),
    })),
  setLoading: (loading: boolean) => set({ loading }),
  setSending: (sending: boolean) => set({ sending }),
  setReplyToMessage: (msg: Message | null) => set({ replyToMessage: msg }),
  setQuoteContent: (content: string | null) => set({ quoteContent: content }),
  addFileUpload: (upload: FileUploadState) =>
    set((s: MessagesStore) => ({ fileUploads: [...s.fileUploads, upload] })),
  updateFileUpload: (id: string, updates: Partial<FileUploadState>) =>
    set((s: MessagesStore) => ({
      fileUploads: s.fileUploads.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),
  removeFileUpload: (id: string) =>
    set((s: MessagesStore) => ({ fileUploads: s.fileUploads.filter((f) => f.id !== id) })),
  clearFileUploads: () => set({ fileUploads: [] }),
  setUnreadCount: (count: number) => set({ unreadCount: count }),
  incrementUnread: () => set((s: MessagesStore) => ({ unreadCount: s.unreadCount + 1 })),
  addNotification: (notification: MessageNotification) =>
    set((s: MessagesStore) => ({
      notifications: [notification, ...s.notifications].slice(0, 50),
    })),
  dismissNotification: (id: string) =>
    set((s: MessagesStore) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),
  dismissAllNotifications: () => set({ notifications: [] }),
  markNotificationRead: (id: string) =>
    set((s: MessagesStore) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    })),
  setNotificationPrefs: (prefs: Partial<NotificationPreferences>) =>
    set((s: MessagesStore) => ({ notificationPrefs: { ...s.notificationPrefs, ...prefs } })),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setError: (error: string | null) => set({ error }),
  resetMessages: () => set(initialState),

  setHighlightedMessageId: (id: string | null) => set({ highlightedMessageId: id }),
  setIsMessagesOpen: (open: boolean) => set({ isMessagesOpen: open }),
  setAutoDismissDelay: (ms: number) => set({ autoDismissDelay: ms }),
}));
