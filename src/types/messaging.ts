import { Timestamp } from 'firebase/firestore';

export type AttachmentType = 'activity' | 'assessment' | 'file' | 'image' | 'voice' | 'link';

export interface Attachment {
    type: AttachmentType;
    id?: string;        // Worksheet ID, Assessment ID vb.
    url?: string;       // Dosya/Görsel URL
    name?: string;      // Dosya adı
    size?: number;      // Bayt cinsinden boyut
    thumbnail?: string; // Küçük resim
    metadata?: Record<string, any>;
}

export interface Message {
    id: string;
    studentId: string;
    senderId: string;
    senderRole: 'teacher' | 'parent' | 'admin';
    senderName: string;
    text?: string;
    attachment?: Attachment;
    createdAt: string; // ISO String (For sorting in UI)
    dbTimestamp: Timestamp; // Firestore Server Timestamp
    isRead: boolean;
    readBy?: string[];
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
