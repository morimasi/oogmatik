import { IMessage } from "../../types/messaging";
import { useMessageStore } from "../../store/useMessageStore";
import { useToastStore } from "../../store/useToastStore";

class NotificationService {
  private audio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.audio = new Audio("/assets/sounds/message-pop.mp3");
    }
  }

  async requestDesktopPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  notifyNewMessage(
    message: IMessage,
    senderName: string,
    conversationId: string,
  ) {
    const settings = useMessageStore.getState().getConversationSettings(conversationId);
    const prefs = settings.notificationPreferences;

    if (settings.isMuted) return;

    // Sound
    if (prefs.soundEnabled && this.audio) {
      this.audio.play().catch(() => {});
    }

    // Vibration
    if (prefs.vibrationEnabled && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(200);
    }

    // Toast notification with deep linking
    const previewText = message.text
      ? message.text.length > 100
        ? message.text.substring(0, 100) + "..."
        : message.text
      : "Bir dosya gönderdi";

    useToastStore.getState().show(
      previewText,
      "info",
      5000,
      senderName,
      () => {
        const store = useMessageStore.getState();
        store.setActiveConversationId(conversationId);
        store.setHighlightMessageId(message.id);
      },
    );

    // Desktop notification
    if (prefs.desktopEnabled && Notification.permission === "granted") {
      let bodyText = message.text || "Yeni bir medya gönderdi.";

      if (!prefs.showOnLockScreen) {
        bodyText = "Yeni bir mesajınız var.";
      } else if (bodyText.length > 100) {
        bodyText = bodyText.substring(0, 100) + "...";
      }

      const notification = new Notification(`Yeni Mesaj: ${senderName}`, {
        body: bodyText,
        icon: "/favicon.ico",
        tag: conversationId,
      });

      notification.onclick = () => {
        window.focus();
        const store = useMessageStore.getState();
        store.setActiveConversationId(conversationId);
        store.setHighlightMessageId(message.id);
        notification.close();
      };
    }
  }

  playTestSound() {
    if (this.audio) {
      this.audio.play().catch(() => {});
    }
  }
}

export interface NotificationSettings {
  soundEnabled: boolean;
  desktopEnabled: boolean;
  mutedChatIds: string[];
  showOnLockScreen: boolean;
}

export const defaultNotificationSettings: NotificationSettings = {
  soundEnabled: true,
  desktopEnabled: false,
  mutedChatIds: [],
  showOnLockScreen: false,
};

export const notificationService = new NotificationService();
