import { v4 as uuidv4 } from 'uuid';
import { useMessagesStore } from '../store/useMessagesStore';
import type { MessageNotification, NotificationPreferences } from '../types';

const NOTIFICATION_SOUND_URL = '/sounds/message.mp3';
const PREFS_STORAGE_KEY = 'oogmatik_msg_notification_prefs';
const AUTO_DISMISS_DELAY_MS = 6000;

/** Web Audio API ile basit bildirim bip sesi üretir (ses dosyası olmasa da çalışır) */
function playBeepFallback(): void {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // AudioContext yoksa sessiz hata
  }
}

/** localStorage'dan bildirim tercihlerini yükle */
export function loadNotificationPrefs(): Partial<NotificationPreferences> {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<NotificationPreferences>;
  } catch {
    return {};
  }
}

/** localStorage'a bildirim tercihlerini kaydet */
export function saveNotificationPrefs(prefs: NotificationPreferences): void {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // storage dolu olabilir
  }
}

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

    const displayContent = notificationPrefs.showPreview
      ? content.substring(0, 100)
      : 'Yeni mesaj';

    const notification: MessageNotification = {
      id: uuidv4(),
      messageId,
      senderId,
      senderName,
      content: displayContent,
      conversationId,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    if (notificationPrefs.visual) {
      store.addNotification(notification);

      // Auto-dismiss
      const dismissDelay = store.autoDismissDelay ?? AUTO_DISMISS_DELAY_MS;
      if (dismissDelay > 0) {
        setTimeout(() => {
          useMessagesStore.getState().dismissNotification(notification.id);
        }, dismissDelay);
      }
    }

    if (notificationPrefs.sound) {
      this.playSound();
    }

    if (notificationPrefs.vibration && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    store.incrementUnread();
  },

  playSound(): void {
    try {
      const audio = new Audio(NOTIFICATION_SOUND_URL);
      audio.volume = 0.5;
      audio.play().catch(() => {
        // ses dosyası yoksa Web Audio API fallback
        playBeepFallback();
      });
    } catch {
      playBeepFallback();
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

  updatePreferences(prefs: Partial<NotificationPreferences>): void {
    const store = useMessagesStore.getState();
    store.setNotificationPrefs(prefs);
    saveNotificationPrefs({ ...store.notificationPrefs, ...prefs });
  },

  getPreferences(): NotificationPreferences {
    return useMessagesStore.getState().notificationPrefs;
  },
};
