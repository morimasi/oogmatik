import { describe, it, expect, beforeEach } from 'vitest';
import { useMessagesStore } from '../store/useMessagesStore';

describe('useNotifications', () => {
  beforeEach(() => {
    useMessagesStore.getState().resetMessages();
  });

  it('initially has empty notifications', () => {
    expect(useMessagesStore.getState().notifications).toEqual([]);
    expect(useMessagesStore.getState().unreadCount).toBe(0);
  });

  it('adds and removes notifications', () => {
    const store = useMessagesStore.getState();
    store.addNotification({
      id: 'n1', messageId: 'm1', senderId: 'u1', senderName: 'Ali',
      content: 'Yeni mesaj', conversationId: 'c1', timestamp: new Date().toISOString(), isRead: false,
    });
    expect(useMessagesStore.getState().notifications).toHaveLength(1);
    expect(useMessagesStore.getState().unreadCount).toBe(0); // incrementUnread is separate

    useMessagesStore.getState().incrementUnread();
    expect(useMessagesStore.getState().unreadCount).toBe(1);
  });

  it('marks notification as read', () => {
    const store = useMessagesStore.getState();
    store.addNotification({
      id: 'n1', messageId: 'm1', senderId: 'u1', senderName: 'Ali',
      content: 'Test', conversationId: 'c1', timestamp: new Date().toISOString(), isRead: false,
    });
    useMessagesStore.getState().markNotificationRead('n1');
    expect(useMessagesStore.getState().notifications[0].isRead).toBe(true);
  });

  it('dismisses all notifications', () => {
    for (let i = 0; i < 3; i++) {
      useMessagesStore.getState().addNotification({
        id: `n${i}`, messageId: 'm1', senderId: 'u1', senderName: 'Ali',
        content: 'Test', conversationId: 'c1', timestamp: new Date().toISOString(), isRead: false,
      });
    }
    useMessagesStore.getState().dismissAllNotifications();
    expect(useMessagesStore.getState().notifications).toHaveLength(0);
  });

  it('tracks unread count via incrementUnread', () => {
    useMessagesStore.getState().incrementUnread();
    useMessagesStore.getState().incrementUnread();
    useMessagesStore.getState().incrementUnread();
    expect(useMessagesStore.getState().unreadCount).toBe(3);

    useMessagesStore.getState().setUnreadCount(0);
    expect(useMessagesStore.getState().unreadCount).toBe(0);
  });

  it('updates notification preferences', () => {
    const store = useMessagesStore.getState();
    expect(store.notificationPrefs.sound).toBe(true);
    expect(store.notificationPrefs.visual).toBe(true);
    expect(store.notificationPrefs.vibration).toBe(true);

    store.setNotificationPrefs({ sound: false, vibration: false });
    const updated = useMessagesStore.getState().notificationPrefs;
    expect(updated.sound).toBe(false);
    expect(updated.vibration).toBe(false);
    expect(updated.visual).toBe(true); // unchanged
  });
});
