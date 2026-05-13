import { describe, it, expect, beforeEach } from 'vitest';
import { useMessagesStore } from '../store/useMessagesStore';
import type { Message, MessageFile } from '../../../types';
import type { FileUploadState, MessageNotification } from '../types';

describe('useMessagesStore', () => {
  beforeEach(() => {
    useMessagesStore.getState().resetMessages();
  });

  it('sets contacts correctly', () => {
    const contacts = [{ id: '1', name: 'Test', email: 'test@test.com', role: 'teacher' as const, avatar: '', unreadCount: 0 }];
    useMessagesStore.getState().setContacts(contacts);
    expect(useMessagesStore.getState().contacts).toEqual(contacts);
  });

  it('manages active contact', () => {
    useMessagesStore.getState().setActiveContactId('user-1');
    expect(useMessagesStore.getState().activeContactId).toBe('user-1');
    expect(useMessagesStore.getState().messages).toEqual([]);
  });

  it('adds and updates messages', () => {
    const msg: Message = {
      id: 'msg-1', senderId: 'u1', receiverId: 'u2', senderName: 'Ali',
      content: 'Test mesajı', timestamp: new Date().toISOString(), isRead: false,
    };
    useMessagesStore.getState().addMessage(msg);
    expect(useMessagesStore.getState().messages).toHaveLength(1);

    useMessagesStore.getState().updateMessage('msg-1', { content: 'Güncellendi', isEdited: true });
    const updated = useMessagesStore.getState().messages[0];
    expect(updated.content).toBe('Güncellendi');
    expect(updated.isEdited).toBe(true);
  });

  it('removes messages', () => {
    const msg: Message = {
      id: 'msg-1', senderId: 'u1', receiverId: 'u2', senderName: 'Ali',
      content: 'Test', timestamp: new Date().toISOString(), isRead: false,
    };
    useMessagesStore.getState().addMessage(msg);
    useMessagesStore.getState().removeMessage('msg-1');
    expect(useMessagesStore.getState().messages).toHaveLength(0);
  });

  it('manages file uploads', () => {
    const upload: FileUploadState = {
      file: new File([''], 'test.pdf'), id: 'upload-1', progress: 0, status: 'idle',
    };
    useMessagesStore.getState().addFileUpload(upload);
    expect(useMessagesStore.getState().fileUploads).toHaveLength(1);

    useMessagesStore.getState().updateFileUpload('upload-1', { progress: 50, status: 'uploading' });
    expect(useMessagesStore.getState().fileUploads[0].progress).toBe(50);

    useMessagesStore.getState().removeFileUpload('upload-1');
    expect(useMessagesStore.getState().fileUploads).toHaveLength(0);
  });

  it('manages unread count', () => {
    expect(useMessagesStore.getState().unreadCount).toBe(0);
    useMessagesStore.getState().incrementUnread();
    expect(useMessagesStore.getState().unreadCount).toBe(1);
    useMessagesStore.getState().setUnreadCount(5);
    expect(useMessagesStore.getState().unreadCount).toBe(5);
  });

  it('manages notifications', () => {
    const notif: MessageNotification = {
      id: 'n-1', messageId: 'm-1', senderId: 'u1', senderName: 'Ali',
      content: 'Merhaba', conversationId: 'conv-1', timestamp: new Date().toISOString(), isRead: false,
    };
    useMessagesStore.getState().addNotification(notif);
    expect(useMessagesStore.getState().notifications).toHaveLength(1);

    useMessagesStore.getState().markNotificationRead('n-1');
    expect(useMessagesStore.getState().notifications[0].isRead).toBe(true);

    useMessagesStore.getState().dismissNotification('n-1');
    expect(useMessagesStore.getState().notifications).toHaveLength(0);
  });

  it('dismisses all notifications', () => {
    for (let i = 0; i < 5; i++) {
      useMessagesStore.getState().addNotification({
        id: `n-${i}`, messageId: 'm-1', senderId: 'u1', senderName: 'Ali',
        content: 'Test', conversationId: 'conv-1', timestamp: new Date().toISOString(), isRead: false,
      });
    }
    useMessagesStore.getState().dismissAllNotifications();
    expect(useMessagesStore.getState().notifications).toHaveLength(0);
  });

  it('caps notifications at 50', () => {
    for (let i = 0; i < 60; i++) {
      useMessagesStore.getState().addNotification({
        id: `n-${i}`, messageId: 'm-1', senderId: 'u1', senderName: 'Ali',
        content: 'Test', conversationId: 'conv-1', timestamp: new Date().toISOString(), isRead: false,
      });
    }
    expect(useMessagesStore.getState().notifications.length).toBeLessThanOrEqual(50);
  });

  it('updates notification preferences', () => {
    useMessagesStore.getState().setNotificationPrefs({ sound: false, vibration: false });
    const prefs = useMessagesStore.getState().notificationPrefs;
    expect(prefs.sound).toBe(false);
    expect(prefs.vibration).toBe(false);
    expect(prefs.visual).toBe(true); // unchanged
  });

  it('archives screening (example delete action)', () => {
    const msg: Message = {
      id: 'm-1', senderId: 'u1', receiverId: 'u2', senderName: 'Ali',
      content: 'Test', timestamp: new Date().toISOString(), isRead: false,
    };
    useMessagesStore.getState().addMessage(msg);
    useMessagesStore.getState().removeMessage('m-1');
    expect(useMessagesStore.getState().messages).toHaveLength(0);
  });

  it('resets to initial state', () => {
    useMessagesStore.getState().setActiveContactId('user-1');
    useMessagesStore.getState().setUnreadCount(10);
    useMessagesStore.getState().resetMessages();
    expect(useMessagesStore.getState().activeContactId).toBeNull();
    expect(useMessagesStore.getState().unreadCount).toBe(0);
  });
});
