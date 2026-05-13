import { useCallback } from 'react';
import { useMessagesStore } from '../store/useMessagesStore';
import { notificationService } from '../services/notificationService';

export function useNotifications() {
  const store = useMessagesStore();

  const dismissNotification = useCallback((id: string) => {
    notificationService.dismiss(id);
  }, []);

  const dismissAll = useCallback(() => {
    notificationService.clearAll();
  }, []);

  const markRead = useCallback((id: string) => {
    notificationService.markRead(id);
    store.dismissNotification(id);
  }, []);

  const navigateToConversation = useCallback(
    (conversationId: string, notificationId: string) => {
      const senderId = conversationId.replace(store.activeContactId || '', '').replace('_', '');
      const contact = store.contacts.find(
        (c) => c.id === senderId || conversationId.includes(c.id)
      );
      if (contact) {
        store.setActiveContactId(contact.id);
      }
      store.dismissNotification(notificationId);
    },
    [store.contacts, store.activeContactId]
  );

  const unreadCount = store.unreadCount;
  const hasUnread = unreadCount > 0;

  return {
    notifications: store.notifications,
    unreadCount,
    hasUnread,
    dismissNotification,
    dismissAll,
    markRead,
    navigateToConversation,
    prefs: store.notificationPrefs,
    updatePrefs: store.setNotificationPrefs,
  };
}
