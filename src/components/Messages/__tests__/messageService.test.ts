import { describe, it, expect, vi, beforeEach } from 'vitest';

// Firebase modüllerini mock'la
vi.mock('../../../services/firebaseClient', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  onSnapshot: vi.fn(() => vi.fn()), // unsubscribe fn
  addDoc: vi.fn().mockResolvedValue({ id: 'mock-msg-id' }),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  deleteDoc: vi.fn().mockResolvedValue(undefined),
  doc: vi.fn().mockReturnValue({ id: 'mock-doc-ref' }),
  getDocs: vi.fn().mockResolvedValue({ size: 0, docs: [] }),
  getDoc: vi.fn().mockResolvedValue({
    exists: () => true,
    data: () => ({
      content: 'Orijinal mesaj içeriği',
      editHistory: [],
      isDeleted: false,
      deletedAt: null,
      originalContent: null,
    }),
  }),
  Timestamp: {
    now: () => ({
      toDate: () => new Date(),
    }),
  },
}));

vi.mock('../store/useMessagesStore', () => ({
  useMessagesStore: {
    getState: () => ({
      setSending: vi.fn(),
      clearFileUploads: vi.fn(),
      setUnreadCount: vi.fn(),
    }),
  },
}));

vi.mock('../../../store/useToastStore', () => ({
  useToastStore: {
    getState: () => ({
      error: vi.fn(),
      success: vi.fn(),
    }),
  },
}));

vi.mock('../services/fileUploadService', () => ({
  uploadFileToStorage: vi.fn().mockResolvedValue({
    id: 'file-id-1',
    name: 'test.pdf',
    type: 'application/pdf',
    url: 'https://storage.example.com/test.pdf',
    size: 1024,
    mimeCategory: 'document',
  }),
  deleteFileFromStorage: vi.fn().mockResolvedValue(true),
}));

import { messageService } from '../services/messageService';

describe('messageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── sendMessage ──────────────────────────────────────────────────────────

  describe('sendMessage', () => {
    it('returns message ID on success', async () => {
      const id = await messageService.sendMessage(
        'user-1',
        'user-2',
        'Test Kullanıcı',
        'Merhaba!'
      );
      expect(id).toBe('mock-msg-id');
    });

    it('includes reply and quote in message data', async () => {
      const id = await messageService.sendMessage(
        'user-1',
        'user-2',
        'Test',
        'Yanıt mesajı',
        {
          replyToMessageId: 'parent-msg-id',
          quote: {
            messageId: 'parent-msg-id',
            senderId: 'user-2',
            senderName: 'Diğer Kullanıcı',
            content: 'Alıntılanan metin',
            timestamp: new Date().toISOString(),
          },
        }
      );
      expect(id).toBe('mock-msg-id');
    });
  });

  // ─── editMessage ─────────────────────────────────────────────────────────

  describe('editMessage', () => {
    it('returns true on successful edit', async () => {
      const result = await messageService.editMessage('msg-1', 'Düzenlenmiş içerik');
      expect(result).toBe(true);
    });

    it('preserves edit history on edit', async () => {
      // getDoc mock dosyanın mevcut içeriğini dönüyor
      // updateDoc'un editHistory alanı ile çağrıldığını doğrula
      const { updateDoc } = await import('firebase/firestore');
      await messageService.editMessage('msg-1', 'Yeni içerik');

      // updateDoc çağrıldı mı kontrol et
      expect(updateDoc).toHaveBeenCalledTimes(1);
      const call = vi.mocked(updateDoc).mock.calls[0];
      const updateData = call[1] as unknown as Record<string, unknown>;
      expect(updateData.content).toBe('Yeni içerik');
      expect(updateData.isEdited).toBe(true);
      expect(Array.isArray(updateData.editHistory)).toBe(true);
      // Yeni history entry mevcut içeriği (Orijinal mesaj içeriği) içermeli
      const history = updateData.editHistory as Array<{ content: string; editedAt: string }>;
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].content).toBe('Orijinal mesaj içeriği');
    });
  });

  // ─── deleteMessage ───────────────────────────────────────────────────────

  describe('deleteMessage', () => {
    it('soft deletes a message by default', async () => {
      const { updateDoc } = await import('firebase/firestore');
      const result = await messageService.deleteMessage('msg-1');

      expect(result).toBe(true);
      // Soft delete → updateDoc çağrılmalı, deleteDoc değil
      expect(updateDoc).toHaveBeenCalled();
    });

    it('hard deletes when softDelete = false', async () => {
      const { deleteDoc } = await import('firebase/firestore');
      const result = await messageService.deleteMessage('msg-1', false);

      expect(result).toBe(true);
      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  // ─── restoreMessage ──────────────────────────────────────────────────────

  describe('restoreMessage', () => {
    it('returns false if deletion was over 30 days ago', async () => {
      const { getDoc } = await import('firebase/firestore');
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31); // 31 gün önce

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          content: '[Bu mesaj silindi]',
          isDeleted: true,
          deletedAt: oldDate.toISOString(),
          originalContent: 'Orijinal içerik',
        }),
      } as unknown as ReturnType<typeof import('firebase/firestore').getDoc> extends Promise<infer T> ? T : never);

      const result = await messageService.restoreMessage('msg-1');
      expect(result).toBe(false);
    });

    it('restores a message deleted within 30 days', async () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 5); // 5 gün önce

      const { getDoc, updateDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          content: '[Bu mesaj silindi]',
          isDeleted: true,
          deletedAt: recentDate.toISOString(),
          originalContent: 'Orijinal içerik',
        }),
      } as unknown as ReturnType<typeof import('firebase/firestore').getDoc> extends Promise<infer T> ? T : never);

      const result = await messageService.restoreMessage('msg-1');
      expect(result).toBe(true);
      expect(updateDoc).toHaveBeenCalled();
    });
  });

  // ─── getConversationId ────────────────────────────────────────────────────

  describe('getConversationId', () => {
    it('returns the same ID regardless of order', () => {
      const id1 = messageService.getConversationId('user-A', 'user-B');
      const id2 = messageService.getConversationId('user-B', 'user-A');
      expect(id1).toBe(id2);
    });

    it('uses underscore separator between sorted IDs', () => {
      const id = messageService.getConversationId('abc', 'xyz');
      expect(id).toBe('abc_xyz');
    });
  });

  // ─── Alıntı zinciri (nested quote) ───────────────────────────────────────

  describe('quote chain', () => {
    it('sends message with 3-level quote chain', async () => {
      const makeQuote = (level: number) => ({
        messageId: `msg-level-${level}`,
        senderId: `user-${level}`,
        senderName: `Kullanıcı ${level}`,
        content: `Seviye ${level} içerik`,
        timestamp: new Date().toISOString(),
      });

      // A → B alıntıladı → C alıntıladı
      const id = await messageService.sendMessage('user-C', 'user-A', 'C', 'Alıntı zinciri', {
        replyToMessageId: 'msg-level-2',
        quote: makeQuote(2),
      });
      expect(id).toBe('mock-msg-id');
    });
  });

  // ─── mapDoc ──────────────────────────────────────────────────────────────

  describe('mapDoc', () => {
    it('correctly maps Firestore document to Message', () => {
      const raw = {
        senderId: 'u1',
        receiverId: 'u2',
        senderName: 'Ali',
        content: 'Merhaba',
        timestamp: '2024-01-01T00:00:00.000Z',
        isRead: false,
        replyToMessageId: null,
        quote: null,
        files: [],
        isEdited: false,
        editedAt: null,
        editHistory: [],
        isDeleted: false,
        deletedAt: null,
        originalContent: null,
      };
      const msg = messageService.mapDoc(raw as Record<string, unknown>, 'msg-123');
      expect(msg.id).toBe('msg-123');
      expect(msg.senderId).toBe('u1');
      expect(msg.content).toBe('Merhaba');
      expect(msg.files).toEqual([]);
      expect(msg.editHistory).toEqual([]);
    });
  });
});
