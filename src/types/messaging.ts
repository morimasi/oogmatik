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
  
  // Oogmatik Soft Delete & Edit History
  isDeleted: boolean;
  deletedAt?: Timestamp | null;
  editHistory?: IMessageEdit[];
  
  // Threading ve Quote Hiyerarşisi
  quoteData?: QuoteData;
  threadId?: string; // Ana mesaj ID'sine referans
  replyCount?: number;
  
  // Okunma durumu
  readBy: Record<string, Timestamp>; // userId -> timestamp
  
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
  title?: string; // Sadece grup için
  participants: ChatParticipant[];
  adminIds?: string[]; // Grup konuşmalarında yöneticiler
  
  lastMessage?: {
    id: string;
    text: string;
    senderId: string;
    createdAt: Timestamp;
  };
  
  // Toplam okunmamış sayısı (kullanıcı bazlı hesaplanması gerekebilir)
  unreadCount?: Record<string, number>; 
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
