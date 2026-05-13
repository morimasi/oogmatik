import { v4 as uuidv4 } from 'uuid';
import { useMessagesStore } from '../store/useMessagesStore';
import { useToastStore } from '../../../store/useToastStore';
import type { MessageNotification } from '../types';

const NOTIFICATION_SOUND_URL = '/sounds/message.mp3';

export const notificationService = {
  triggerNotification(
    messageId: string,
    senderId: string,
    senderName: string,
    content: string,
    conversationId: string
  ): void {
    const store = useMessagesStore.getState();
    const { notificationPrefs } = store;

    const notification: MessageNotification = {
      id: uuidv4(),
      messageId,
      senderId,
      senderName,
      content: content.substring(0, 100),
      conversationId,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    if (notificationPrefs.visual) {
      store.addNotification(notification);
      this.showToast(notification);
    }

    if (notificationPrefs.sound) {
      this.playSound();
    }

    if (notificationPrefs.vibration && 'vibrate' in navigator) {
      navigator.vibrate(200);
    }

    store.incrementUnread();
  },

  showToast(notification: MessageNotification): void {
    useToastStore.getState().info(
      `${notification.senderName}: ${notification.content.substring(0, 80)}`,
      5000
    );
  },

  playSound(): void {
    try {
      const audio = new Audio(NOTIFICATION_SOUND_URL);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {
      // silent fail
    }
  },

  clearAll(): void {
    useMessagesStore.getState().dismissAllNotifications();
  },

  dismiss(id: string): void {
    useMessagesStore.getState().dismissNotification(id);
  },

  markRead(id: string): void {
    useMessagesStore.getState().markNotificationRead(id);
  },

  updatePreferences(prefs: { sound?: boolean; vibration?: boolean; visual?: boolean }): void {
    useMessagesStore.getState().setNotificationPrefs(prefs);
  },

  getPreferences() {
    return useMessagesStore.getState().notificationPrefs;
  },
};
