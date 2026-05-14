import { useCallback } from 'react';
import { useMessagesStore } from '../store/useMessagesStore';
import { notificationService, saveNotificationPrefs } from '../services/notificationService';
import type { NotificationPreferences } from '../types';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Deep link: Bildirime tıklandığında mesaj modülünü açar,
   * ilgili kişiyi seçer ve mesajı vurgular.
   * Modal kapalı olsa bile doğru çalışır.
   */
  const openMessagesAndNavigate = useCallback(
    (senderId: string, messageId: string, notificationId: string) => {
      // 1. Mesajlar modalını aç
      store.setIsMessagesOpen(true);

      // 2. İlgili kişiyi akif yap
      const contact = store.contacts.find((c) => c.id === senderId);
      if (contact) {
        store.setActiveContactId(contact.id);
      } else {
        // Kişi listede yoksa sadece senderId ile dene
        store.setActiveContactId(senderId);
      }

      // 3. Mesajı vurgula (scroll ConversationPanel tarafından yapılır)
      store.setHighlightedMessageId(messageId);

      // 4. Bildirimi okundu say ve kapat
      notificationService.markRead(notificationId);

      // 5. 3 saniye sonra highlight'ı temizle
      setTimeout(() => {
        useMessagesStore.getState().setHighlightedMessageId(null);
      }, 3000);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.contacts]
  );

  /**
   * Bildirim tercihlerini güncelle ve localStorage'a kaydet
   */
  const updatePrefs = useCallback(
    (prefs: Partial<NotificationPreferences>) => {
      store.setNotificationPrefs(prefs);
      const updated = { ...store.notificationPrefs, ...prefs };
      saveNotificationPrefs(updated);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.notificationPrefs]
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
    openMessagesAndNavigate,
    prefs: store.notificationPrefs,
    updatePrefs,
  };
}
