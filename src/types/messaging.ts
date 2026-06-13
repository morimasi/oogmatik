import { Timestamp } from 'firebase/firestore';

export type AttachmentType = 'activity' | 'assessment' | 'file' | 'image' | 'pdf' | 'voice' | 'link';

export interface Attachment {
    type: AttachmentType;
    id?: string;        // Worksheet ID, Assessment ID vb.
    url?: string;       // Dosya/Görsel URL
    name?: string;      // Dosya adı
    size?: number;      // Bayt cinsinden boyut
    thumbnail?: string; // Küçük resim
    mimeType?: string;
    virusScanStatus?: VirusScanStatus;
    metadata?: Record<string, any>;
}

export interface Message {
    id: string;
    studentId: string;
    senderId: string;
    senderRole: 'teacher' | 'parent' | 'admin';
    senderName: string;
    text?: string;
    type?: string;
    attachment?: Attachment;
    attachments?: Attachment[];
    conversationId: string;
    participantIds?: string[]; // İkili sohbetler için
    contextStudentId?: string; // Mesajın ilgili olduğu öğrenci
    contextStudentName?: string;
    isGlobal?: boolean;
    isDeleted?: boolean;
    createdAt: string; 
    dbTimestamp: Timestamp; // Firestore Server Timestamp
    isRead: boolean;
    readBy?: string[];
    editHistory?: IMessageEdit[];
    replyCount?: number;
    quoteData?: QuoteData;
    deletedAt?: string;
}

export interface MessageGroup {
    date: string; // YYYY-MM-DD
    messages: Message[];
}

export interface OogmatikConnectState {
    activeConversationId: string | null;
    messages: Message[];
    isLoading: boolean;
    error: string | null;
}

// Backward compatibility aliases
export type IAttachment = Attachment;
export type IMessage = Message;

export interface IConversation {
  id: string;
  type: 'direct' | 'group' | 'announcement';
  participantIds: string[];
  participantRoles?: string[];
  participants: { userId: string; role: string; joinedAt?: { seconds: number; nanoseconds: number } }[];
  title?: string;
  lastMessage?: Message;
  unreadCount?: Record<string, number>;
  isArchived?: boolean;
  adminIds?: string[];
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface VirusScanStatus {
  status: 'clean' | 'infected' | 'scanning' | 'error' | 'skipped';
  scannedAt?: string;
  threatName?: string;
}

export interface QuoteData {
  messageId: string;
  senderName: string;
  text: string;
  originalSenderId?: string;
  originalSenderName?: string;
  originalText?: string;
  attachment?: Attachment;
  [key: string]: unknown;
}

export interface IMessageEdit {
  editedAt: string;
  previousText: string;
  editedBy: string;
}

export interface ChatSettings {
  isMuted: boolean;
  showReadReceipts: boolean;
  notificationPreferences: NotificationPreferences;
}

export interface NotificationPreferences {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  desktopEnabled: boolean;
  showOnLockScreen: boolean;
}
