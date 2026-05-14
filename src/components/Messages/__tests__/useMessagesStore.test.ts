import { describe, it, expect, beforeEach, vi } from 'vitest';

// notificationService mock
vi.mock('../services/notificationService', () => ({
  loadNotificationPrefs: vi.fn(() => ({})),
  saveNotificationPrefs: vi.fn(),
}));

import { useMessagesStore } from '../store/useMessagesStore';

describe('useMessagesStore', () => {
  beforeEach(() => {
    const { resetMessages } = useMessagesStore.getState();
    resetMessages();
  });

  // ─── Temel state yönetimi ────────────────────────────────────────────────

  it('initializes with empty state', () => {
    const state = useMessagesStore.getState();
    expect(state.messages).toEqual([]);
    expect(state.contacts).toEqual([]);
    expect(state.activeContactId).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.sending).toBe(false);
    expect(state.unreadCount).toBe(0);
    expect(state.error).toBeNull();
  });

  it('sets loading state', () => {
    useMessagesStore.getState().setLoading(true);
    expect(useMessagesStore.getState().loading).toBe(true);
    useMessagesStore.getState().setLoading(false);
    expect(useMessagesStore.getState().loading).toBe(false);
  });

  it('sets and clears active contact', () => {
    useMessagesStore.getState().setActiveContactId('contact-1');
    expect(useMessagesStore.getState().activeContactId).toBe('contact-1');
    useMessagesStore.getState().setActiveContactId(null);
    expect(useMessagesStore.getState().activeContactId).toBeNull();
  });

  it('clears reply state when switching contacts', () => {
    const mockMsg = {
      id: 'msg-1', senderId: 'u1', receiverId: 'u2', senderName: 'Test',
      content: 'Hello', timestamp: new Date().toISOString(), isRead: false,
    };
    useMessagesStore.getState().setReplyToMessage(mockMsg);
    useMessagesStore.getState().setQuoteContent('Alıntı');
    expect(useMessagesStore.getState().replyToMessage).not.toBeNull();
    expect(useMessagesStore.getState().quoteContent).not.toBeNull();

    // Kişi değiştir → reply/quote temizlenmeli
    useMessagesStore.getState().setActiveContactId('contact-2');
    expect(useMessagesStore.getState().replyToMessage).toBeNull();
    expect(useMessagesStore.getState().quoteContent).toBeNull();
  });

  // ─── Mesaj yönetimi ──────────────────────────────────────────────────────

  it('adds and removes messages', () => {
    const msg = {
      id: 'msg-1', senderId: 'u1', receiverId: 'u2', senderName: 'Ali',
      content: 'Test', timestamp: '2024-01-01T00:00:00Z', isRead: false,
    };
    useMessagesStore.getState().addMessage(msg);
    expect(useMessagesStore.getState().messages).toHaveLength(1);

    useMessagesStore.getState().removeMessage('msg-1');
    expect(useMessagesStore.getState().messages).toHaveLength(0);
  });

  it('updates a message by ID', () => {
    const msg = {
      id: 'msg-1', senderId: 'u1', receiverId: 'u2', senderName: 'Ali',
      content: 'Orijinal', timestamp: '2024-01-01T00:00:00Z', isRead: false,
    };
    useMessagesStore.getState().addMessage(msg);
    useMessagesStore.getState().updateMessage('msg-1', { content: 'Güncellenmiş', isEdited: true });

    const updated = useMessagesStore.getState().messages[0];
    expect(updated.content).toBe('Güncellenmiş');
    expect(updated.isEdited).toBe(true);
  });

  // ─── Bildirim yönetimi ──────────────────────────────────────────────────

  it('adds and dismisses notifications', () => {
    const notification = {
      id: 'notif-1',
      messageId: 'msg-1',
      senderId: 'u2',
      senderName: 'Veli',
      content: 'Yeni mesaj',
      conversationId: 'u1_u2',
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    useMessagesStore.getState().addNotification(notification);
    expect(useMessagesStore.getState().notifications).toHaveLength(1);

    useMessagesStore.getState().dismissNotification('notif-1');
    expect(useMessagesStore.getState().notifications).toHaveLength(0);
  });

  it('marks notification as read', () => {
    const notification = {
      id: 'notif-1',
      messageId: 'msg-1',
      senderId: 'u2',
      senderName: 'Veli',
      content: 'Mesaj',
      conversationId: 'u1_u2',
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    useMessagesStore.getState().addNotification(notification);
    useMessagesStore.getState().markNotificationRead('notif-1');
    expect(useMessagesStore.getState().notifications[0].isRead).toBe(true);
  });

  it('dismisses all notifications', () => {
    for (let i = 0; i < 5; i++) {
      useMessagesStore.getState().addNotification({
        id: `notif-${i}`,
        messageId: `msg-${i}`,
        senderId: 'u2',
        senderName: 'Test',
        content: `Mesaj ${i}`,
        conversationId: 'conv',
        timestamp: new Date().toISOString(),
        isRead: false,
      });
    }
    expect(useMessagesStore.getState().notifications).toHaveLength(5);
    useMessagesStore.getState().dismissAllNotifications();
    expect(useMessagesStore.getState().notifications).toHaveLength(0);
  });

  it('limits notifications to 50', () => {
    for (let i = 0; i < 55; i++) {
      useMessagesStore.getState().addNotification({
        id: `notif-${i}`,
        messageId: `msg-${i}`,
        senderId: 'u2',
        senderName: 'Test',
        content: `Mesaj ${i}`,
        conversationId: 'conv',
        timestamp: new Date().toISOString(),
        isRead: false,
      });
    }
    expect(useMessagesStore.getState().notifications.length).toBeLessThanOrEqual(50);
  });

  // ─── Notification preferences ────────────────────────────────────────────

  it('initializes notification prefs with defaults', () => {
    const prefs = useMessagesStore.getState().notificationPrefs;
    expect(prefs.sound).toBe(true);
    expect(prefs.vibration).toBe(true);
    expect(prefs.visual).toBe(true);
    expect(prefs.showPreview).toBe(true);
  });

  it('updates notification prefs partially', () => {
    useMessagesStore.getState().setNotificationPrefs({ sound: false });
    const prefs = useMessagesStore.getState().notificationPrefs;
    expect(prefs.sound).toBe(false);
    // Diğerleri değişmemeli
    expect(prefs.vibration).toBe(true);
    expect(prefs.visual).toBe(true);
  });

  // ─── highlightedMessageId (deep linking) ────────────────────────────────

  it('initializes highlightedMessageId as null', () => {
    expect(useMessagesStore.getState().highlightedMessageId).toBeNull();
  });

  it('sets and clears highlightedMessageId', () => {
    useMessagesStore.getState().setHighlightedMessageId('msg-42');
    expect(useMessagesStore.getState().highlightedMessageId).toBe('msg-42');

    useMessagesStore.getState().setHighlightedMessageId(null);
    expect(useMessagesStore.getState().highlightedMessageId).toBeNull();
  });

  // ─── isMessagesOpen ─────────────────────────────────────────────────────

  it('initializes isMessagesOpen as false', () => {
    expect(useMessagesStore.getState().isMessagesOpen).toBe(false);
  });

  it('toggles isMessagesOpen', () => {
    useMessagesStore.getState().setIsMessagesOpen(true);
    expect(useMessagesStore.getState().isMessagesOpen).toBe(true);

    useMessagesStore.getState().setIsMessagesOpen(false);
    expect(useMessagesStore.getState().isMessagesOpen).toBe(false);
  });

  // ─── autoDismissDelay ───────────────────────────────────────────────────

  it('initializes autoDismissDelay at 6000ms', () => {
    expect(useMessagesStore.getState().autoDismissDelay).toBe(6000);
  });

  it('updates autoDismissDelay', () => {
    useMessagesStore.getState().setAutoDismissDelay(10000);
    expect(useMessagesStore.getState().autoDismissDelay).toBe(10000);

    useMessagesStore.getState().setAutoDismissDelay(0); // Kapatma
    expect(useMessagesStore.getState().autoDismissDelay).toBe(0);
  });

  // ─── File uploads ──────────────────────────────────────────────────────

  it('manages file upload lifecycle', () => {
    const upload = {
      id: 'up-1',
      file: new File(['data'], 'test.pdf', { type: 'application/pdf' }),
      progress: 0,
      status: 'idle' as const,
    };
    useMessagesStore.getState().addFileUpload(upload);
    expect(useMessagesStore.getState().fileUploads).toHaveLength(1);

    useMessagesStore.getState().updateFileUpload('up-1', { progress: 50, status: 'uploading' });
    expect(useMessagesStore.getState().fileUploads[0].progress).toBe(50);

    useMessagesStore.getState().removeFileUpload('up-1');
    expect(useMessagesStore.getState().fileUploads).toHaveLength(0);
  });

  it('clears all file uploads', () => {
    for (let i = 0; i < 3; i++) {
      useMessagesStore.getState().addFileUpload({
        id: `up-${i}`,
        file: new File([''], `file-${i}.txt`, { type: 'text/plain' }),
        progress: 0,
        status: 'idle',
      });
    }
    expect(useMessagesStore.getState().fileUploads).toHaveLength(3);
    useMessagesStore.getState().clearFileUploads();
    expect(useMessagesStore.getState().fileUploads).toHaveLength(0);
  });

  // ─── Unread count ──────────────────────────────────────────────────────

  it('increments unread count', () => {
    expect(useMessagesStore.getState().unreadCount).toBe(0);
    useMessagesStore.getState().incrementUnread();
    useMessagesStore.getState().incrementUnread();
    expect(useMessagesStore.getState().unreadCount).toBe(2);
  });

  it('sets unread count directly', () => {
    useMessagesStore.getState().setUnreadCount(42);
    expect(useMessagesStore.getState().unreadCount).toBe(42);
  });

  // ─── Full reset ──────────────────────────────────────────────────────────

  it('resets entire store to initial state', () => {
    useMessagesStore.getState().setActiveContactId('c1');
    useMessagesStore.getState().setUnreadCount(10);
    useMessagesStore.getState().setHighlightedMessageId('msg-1');
    useMessagesStore.getState().setIsMessagesOpen(true);

    useMessagesStore.getState().resetMessages();

    const s = useMessagesStore.getState();
    expect(s.activeContactId).toBeNull();
    expect(s.unreadCount).toBe(0);
    expect(s.highlightedMessageId).toBeNull();
    expect(s.isMessagesOpen).toBe(false);
  });
});
