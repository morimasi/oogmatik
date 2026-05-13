import type { Message, MessageFile, MessageQuote, User } from '../../types';

export type FileUploadStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

export interface FileUploadState {
  file: File;
  id: string;
  progress: number;
  status: FileUploadStatus;
  downloadUrl?: string;
  error?: string;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
}

export interface NotificationPreferences {
  sound: boolean;
  vibration: boolean;
  visual: boolean;
  showPreview: boolean;
  groupByConversation: boolean;
}

export interface MessageNotification {
  id: string;
  messageId: string;
  senderId: string;
  senderName: string;
  content: string;
  conversationId: string;
  timestamp: string;
  isRead: boolean;
}

export type Contact = Pick<User, 'id' | 'name' | 'email' | 'role' | 'avatar'> & {
  lastMessage?: Message;
  unreadCount: number;
  isOnline?: boolean;
  lastSeen?: string;
};

export interface MessagesState {
  contacts: Contact[];
  activeContactId: string | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;
  replyToMessage: Message | null;
  quoteContent: string | null;
  fileUploads: FileUploadState[];
  unreadCount: number;
  notifications: MessageNotification[];
  notificationPrefs: NotificationPreferences;
  searchQuery: string;
  error: string | null;
}

export interface MessagesActions {
  setContacts: (contacts: Contact[]) => void;
  setActiveContactId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  removeMessage: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setSending: (sending: boolean) => void;
  setReplyToMessage: (msg: Message | null) => void;
  setQuoteContent: (content: string | null) => void;
  addFileUpload: (upload: FileUploadState) => void;
  updateFileUpload: (id: string, updates: Partial<FileUploadState>) => void;
  removeFileUpload: (id: string) => void;
  clearFileUploads: () => void;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  addNotification: (notification: MessageNotification) => void;
  dismissNotification: (id: string) => void;
  dismissAllNotifications: () => void;
  markNotificationRead: (id: string) => void;
  setNotificationPrefs: (prefs: Partial<NotificationPreferences>) => void;
  setSearchQuery: (query: string) => void;
  setError: (error: string | null) => void;
  resetMessages: () => void;
}

export { Message, MessageFile, MessageQuote };
