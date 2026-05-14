import { describe, it, expect, vi, beforeEach } from 'vitest';

// notificationService mock
vi.mock('../services/notificationService', () => ({
  loadNotificationPrefs: vi.fn(() => ({})),
  saveNotificationPrefs: vi.fn(),
  notificationService: {
    dismiss: vi.fn(),
    clearAll: vi.fn(),
    markRead: vi.fn(),
  },
}));

import { useMessagesStore } from '../store/useMessagesStore';

describe('Notification Deep Link', () => {
  beforeEach(() => {
    useMessagesStore.getState().resetMessages();
  });

  // ─── Deep link state akışı ──────────────────────────────────────────────

  describe('deep link state flow', () => {
    it('sets highlightedMessageId when navigating to a message', () => {
      useMessagesStore.getState().setHighlightedMessageId('target-msg');
      expect(useMessagesStore.getState().highlightedMessageId).toBe('target-msg');
    });

    it('opens messages modal via isMessagesOpen', () => {
      expect(useMessagesStore.getState().isMessagesOpen).toBe(false);
      useMessagesStore.getState().setIsMessagesOpen(true);
      expect(useMessagesStore.getState().isMessagesOpen).toBe(true);
    });

    it('complete deep link flow: open modal → select contact → highlight message', () => {
      const contacts = [
        { id: 'sender-1', name: 'Ali Öğretmen', email: 'ali@test.com', role: 'teacher', avatar: '', unreadCount: 1 },
        { id: 'sender-2', name: 'Veli Öğretmen', email: 'veli@test.com', role: 'teacher', avatar: '', unreadCount: 0 },
      ];
      useMessagesStore.getState().setContacts(contacts);

      // 1. Modal aç
      useMessagesStore.getState().setIsMessagesOpen(true);
      expect(useMessagesStore.getState().isMessagesOpen).toBe(true);

      // 2. Kişiyi seç
      useMessagesStore.getState().setActiveContactId('sender-1');
      expect(useMessagesStore.getState().activeContactId).toBe('sender-1');

      // 3. Mesajı vurgula
      useMessagesStore.getState().setHighlightedMessageId('msg-deep-42');
      expect(useMessagesStore.getState().highlightedMessageId).toBe('msg-deep-42');
    });

    it('clears highlight after timeout simulation', () => {
      useMessagesStore.getState().setHighlightedMessageId('msg-123');
      expect(useMessagesStore.getState().highlightedMessageId).toBe('msg-123');

      // Timeout sonrası temizleme simülasyonu
      useMessagesStore.getState().setHighlightedMessageId(null);
      expect(useMessagesStore.getState().highlightedMessageId).toBeNull();
    });
  });

  // ─── Bildirim tıklama senaryoları ────────────────────────────────────────

  describe('notification click scenarios', () => {
    it('navigates correctly when modal is already open', () => {
      useMessagesStore.getState().setIsMessagesOpen(true);
      useMessagesStore.getState().setActiveContactId('other-contact');

      // Bildirime tıklama → kişi değişir
      useMessagesStore.getState().setActiveContactId('sender-1');
      useMessagesStore.getState().setHighlightedMessageId('msg-from-notification');

      expect(useMessagesStore.getState().activeContactId).toBe('sender-1');
      expect(useMessagesStore.getState().highlightedMessageId).toBe('msg-from-notification');
    });

    it('navigates correctly when modal is closed', () => {
      expect(useMessagesStore.getState().isMessagesOpen).toBe(false);

      // 1) Modal aç
      useMessagesStore.getState().setIsMessagesOpen(true);
      // 2) Kişi seç
      useMessagesStore.getState().setActiveContactId('sender-1');
      // 3) Mesaj vurgula
      useMessagesStore.getState().setHighlightedMessageId('msg-link');

      expect(useMessagesStore.getState().isMessagesOpen).toBe(true);
      expect(useMessagesStore.getState().activeContactId).toBe('sender-1');
      expect(useMessagesStore.getState().highlightedMessageId).toBe('msg-link');
    });

    it('kişi bulunamadığında senderId doğrudan kullanılır', () => {
      // contacts boş → senderId'yi direkt activeContactId olarak ata
      useMessagesStore.getState().setContacts([]);
      useMessagesStore.getState().setActiveContactId('unknown-sender');
      expect(useMessagesStore.getState().activeContactId).toBe('unknown-sender');
    });
  });

  // ─── Bildirim dismiss senaryoları ────────────────────────────────────────

  describe('notification dismiss scenarios', () => {
    it('marks notification as read and dismisses on navigation', () => {
      const notif = {
        id: 'notif-deep-1',
        messageId: 'msg-deep-1',
        senderId: 'sender-1',
        senderName: 'Ali',
        content: 'Yeni mesaj geldi',
        conversationId: 'conv-1',
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      useMessagesStore.getState().addNotification(notif);
      expect(useMessagesStore.getState().notifications).toHaveLength(1);
      expect(useMessagesStore.getState().notifications[0].isRead).toBe(false);

      // 1) Bildirimi okundu yap
      useMessagesStore.getState().markNotificationRead('notif-deep-1');
      expect(useMessagesStore.getState().notifications[0].isRead).toBe(true);

      // 2) Bildirimi kaldır
      useMessagesStore.getState().dismissNotification('notif-deep-1');
      expect(useMessagesStore.getState().notifications).toHaveLength(0);
    });

    it('auto-dismiss delay configuration works', () => {
      useMessagesStore.getState().setAutoDismissDelay(5000);
      expect(useMessagesStore.getState().autoDismissDelay).toBe(5000);

      useMessagesStore.getState().setAutoDismissDelay(0); // Kapatma = sonsuz
      expect(useMessagesStore.getState().autoDismissDelay).toBe(0);
    });
  });
});
