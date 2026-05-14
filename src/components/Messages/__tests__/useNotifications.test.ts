import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/notificationService', () => ({
  loadNotificationPrefs: vi.fn(() => ({})),
  saveNotificationPrefs: vi.fn(),
  notificationService: {
    dismiss: vi.fn(),
    clearAll: vi.fn(),
    markRead: vi.fn(),
    triggerNotification: vi.fn(),
    playSound: vi.fn(),
    updatePreferences: vi.fn(),
    getPreferences: vi.fn(() => ({
      sound: true, vibration: true, visual: true, showPreview: true, groupByConversation: true,
    })),
  },
}));

import { useMessagesStore } from '../store/useMessagesStore';

describe('useNotifications — store-level tests', () => {
  beforeEach(() => {
    useMessagesStore.getState().resetMessages();
  });

  // ─── Bildirim ekleme ve yönetim ─────────────────────────────────────────

  describe('notification management', () => {
    it('adds notification and increments unread', () => {
      useMessagesStore.getState().addNotification({
        id: 'n-1',
        messageId: 'm-1',
        senderId: 's-1',
        senderName: 'Ali',
        content: 'Merhaba',
        conversationId: 'c-1',
        timestamp: new Date().toISOString(),
        isRead: false,
      });
      useMessagesStore.getState().incrementUnread();

      expect(useMessagesStore.getState().notifications).toHaveLength(1);
      expect(useMessagesStore.getState().unreadCount).toBe(1);
    });

    it('dismisses specific notification by id', () => {
      useMessagesStore.getState().addNotification({
        id: 'n-1', messageId: 'm-1', senderId: 's-1', senderName: 'A',
        content: 'X', conversationId: 'c', timestamp: '', isRead: false,
      });
      useMessagesStore.getState().addNotification({
        id: 'n-2', messageId: 'm-2', senderId: 's-2', senderName: 'B',
        content: 'Y', conversationId: 'c', timestamp: '', isRead: false,
      });
      expect(useMessagesStore.getState().notifications).toHaveLength(2);

      useMessagesStore.getState().dismissNotification('n-1');
      expect(useMessagesStore.getState().notifications).toHaveLength(1);
      expect(useMessagesStore.getState().notifications[0].id).toBe('n-2');
    });

    it('dismisses all notifications at once', () => {
      for (let i = 0; i < 10; i++) {
        useMessagesStore.getState().addNotification({
          id: `n-${i}`, messageId: `m-${i}`, senderId: 'u', senderName: 'T',
          content: `Msg ${i}`, conversationId: 'c', timestamp: '', isRead: false,
        });
      }
      useMessagesStore.getState().dismissAllNotifications();
      expect(useMessagesStore.getState().notifications).toHaveLength(0);
    });
  });

  // ─── Bildirim tercihleri ─────────────────────────────────────────────────

  describe('notification preferences', () => {
    it('updates individual preference keys', () => {
      useMessagesStore.getState().setNotificationPrefs({ sound: false });
      expect(useMessagesStore.getState().notificationPrefs.sound).toBe(false);
      expect(useMessagesStore.getState().notificationPrefs.visual).toBe(true);
    });

    it('updates multiple preferences at once', () => {
      useMessagesStore.getState().setNotificationPrefs({ sound: false, vibration: false, showPreview: false });
      const p = useMessagesStore.getState().notificationPrefs;
      expect(p.sound).toBe(false);
      expect(p.vibration).toBe(false);
      expect(p.showPreview).toBe(false);
      // visual untouched
      expect(p.visual).toBe(true);
    });

    it('preserves existing prefs when updating one key', () => {
      useMessagesStore.getState().setNotificationPrefs({ groupByConversation: false });
      const p = useMessagesStore.getState().notificationPrefs;
      expect(p.groupByConversation).toBe(false);
      expect(p.sound).toBe(true);
      expect(p.vibration).toBe(true);
    });
  });

  // ─── Auto-dismiss ──────────────────────────────────────────────────────

  describe('auto-dismiss delay', () => {
    it('defaults to 6000ms', () => {
      expect(useMessagesStore.getState().autoDismissDelay).toBe(6000);
    });

    it('can be set to 0 (disabled)', () => {
      useMessagesStore.getState().setAutoDismissDelay(0);
      expect(useMessagesStore.getState().autoDismissDelay).toBe(0);
    });

    it('can be set to custom values', () => {
      useMessagesStore.getState().setAutoDismissDelay(10000);
      expect(useMessagesStore.getState().autoDismissDelay).toBe(10000);

      useMessagesStore.getState().setAutoDismissDelay(30000);
      expect(useMessagesStore.getState().autoDismissDelay).toBe(30000);
    });
  });

  // ─── Notification ordering ──────────────────────────────────────────────

  describe('notification ordering', () => {
    it('newest notifications appear first', () => {
      useMessagesStore.getState().addNotification({
        id: 'old', messageId: 'm1', senderId: 'u', senderName: 'A',
        content: 'Old', conversationId: 'c', timestamp: '2024-01-01T00:00:00Z', isRead: false,
      });
      useMessagesStore.getState().addNotification({
        id: 'new', messageId: 'm2', senderId: 'u', senderName: 'B',
        content: 'New', conversationId: 'c', timestamp: '2024-01-02T00:00:00Z', isRead: false,
      });
      const notifs = useMessagesStore.getState().notifications;
      expect(notifs[0].id).toBe('new');
      expect(notifs[1].id).toBe('old');
    });
  });

  // ─── showPreview maskeleme ────────────────────────────────────────────

  describe('showPreview behavior', () => {
    it('can disable preview to mask content', () => {
      useMessagesStore.getState().setNotificationPrefs({ showPreview: false });
      expect(useMessagesStore.getState().notificationPrefs.showPreview).toBe(false);
      // notificationService.triggerNotification bunu kontrol ederek "Yeni mesaj" gösterir
    });
  });
});
