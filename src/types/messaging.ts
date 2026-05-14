import { Timestamp } from "firebase/firestore";
import { UserRole } from "./user";

export type MessageType = "text" | "file" | "system";
export type VirusScanStatus = "pending" | "clean" | "infected";
export type ConversationType = "direct" | "group" | "announcement";

export interface IAttachment {
  id: string;
  url: string;
  name: string;
  size: number;
  type: "image" | "document" | "audio" | "video" | "other";
  mimeType: string;
  virusScanStatus: VirusScanStatus;
}

export interface QuoteData {
  messageId: string;
  originalSenderId: string;
  originalSenderName: string;
  originalText: string;
  selectedText?: string;
}

export interface IMessageEdit {
  previousText: string;
  editedAt: Timestamp;
}

export interface IMessage {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  text?: string;
  attachments?: IAttachment[];

  isDeleted: boolean;
  deletedAt?: Timestamp | null;

  editHistory?: IMessageEdit[];

  quoteData?: QuoteData;
  threadId?: string;
  replyCount?: number;

  readBy: Record<string, Timestamp>;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ChatParticipant {
  userId: string;
  role: UserRole;
  joinedAt: Timestamp;
  lastReadAt?: Timestamp;
}

export interface IConversation {
  id: string;
  type: ConversationType;
  title?: string;
  participants: ChatParticipant[];
  participantIds?: string[];
  adminIds?: string[];

  lastMessage?: {
    id: string;
    text: string;
    senderId: string;
    createdAt: Timestamp;
  };

  unreadCount?: Record<string, number>;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NotificationPreferences {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  desktopEnabled: boolean;
  showOnLockScreen: boolean;
}

export interface ChatSettings {
  isMuted: boolean;
  showReadReceipts: boolean;
  notificationPreferences: NotificationPreferences;
}
