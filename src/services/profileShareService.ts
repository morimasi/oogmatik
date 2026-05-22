import { db } from './firebaseClient';
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';

export type SharedModuleType = 'overview' | 'reports' | 'analysis' | 'plans';
export type SharePermission = 'view' | 'edit';

export interface SharedContent {
  id?: string;
  ownerId: string;
  ownerName: string;
  recipientId: string;
  moduleType: SharedModuleType;
  contentId?: string;
  permission: SharePermission;
  message?: string;
  createdAt: string;
  readAt?: string;
}

const COLLECTION = 'shared_profile_content';

export const profileShareService = {
  async shareModule(data: Omit<SharedContent, 'id' | 'createdAt'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION), {
        ...data,
        createdAt: Timestamp.now().toDate().toISOString(),
      });
      return docRef.id;
    } catch {
      return null;
    }
  },

  async getSharedWithMe(userId: string): Promise<SharedContent[]> {
    try {
      const q = query(collection(db, COLLECTION), where('recipientId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SharedContent))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return [];
    }
  },

  async getMySharedContent(ownerId: string): Promise<SharedContent[]> {
    try {
      const q = query(collection(db, COLLECTION), where('ownerId', '==', ownerId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SharedContent))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return [];
    }
  },

  async removeShare(shareId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, COLLECTION, shareId));
      return true;
    } catch {
      return false;
    }
  },

  async markAsRead(shareId: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, COLLECTION, shareId), {
        readAt: Timestamp.now().toDate().toISOString(),
      });
      return true;
    } catch {
      return false;
    }
  },
};
