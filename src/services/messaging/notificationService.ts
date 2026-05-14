import { logInfo, logError } from "../../utils/logger.js";
import { IMessage } from "../../types/messaging";

export interface NotificationSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showOnLockScreen: boolean; // Mock kilit ekranı veya OS bazlı privacy
  desktopEnabled: boolean;
  mutedChatIds: string[];
}

export const defaultNotificationSettings: NotificationSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  showOnLockScreen: false,
  desktopEnabled: false,
  mutedChatIds: []
};

class NotificationService {
  private audio?: HTMLAudioElement;

  constructor() {
    if (typeof window !== "undefined") {
      this.audio = new Audio("/assets/sounds/message-pop.mp3");
    }
  }

  /**
   * Tarayıcıdan bildirim izni ister
   */
  async requestDesktopPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      logError("Tarayıcı masaüstü bildirimlerini desteklemiyor.");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  /**
   * Yeni mesaj bildirimi fırlatır (Zustand üzerinden toast da tetiklenebilir)
   */
  notifyNewMessage(
    message: IMessage, 
    senderName: string, 
    settings: NotificationSettings = defaultNotificationSettings
  ) {
    // 1. Sessize alınmış sohbet kontrolü
    if (settings.mutedChatIds.includes(message.conversationId)) {
      return;
    }

    // 2. Ses ve titreşim
    if (settings.soundEnabled && this.audio) {
      this.audio.play().catch(e => logInfo("Ses çalınamadı (etkileşim gerekli olabilir):", e));
    }
    
    if (settings.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(200);
    }

    // 3. Desktop Native Bildirim
    if (settings.desktopEnabled && Notification.permission === "granted") {
      let bodyText = message.text || "Yeni bir medya gönderdi.";
      
      // Kilit ekranı / Gizlilik modu
      if (!settings.showOnLockScreen) {
        bodyText = "Yeni bir mesajınız var.";
      } else {
        // Uzun mesajları "..." ile kesme (Max 100 karakter)
        if (bodyText.length > 100) {
          bodyText = bodyText.substring(0, 100) + "...";
        }
      }

      const notification = new Notification(`Yeni Mesaj: ${senderName}`, {
        body: bodyText,
        icon: "/favicon.ico", // Platforma özel ikon
        tag: message.conversationId, // Aynı conversation için eski bildirimi ezer
      });

      // Deep Linking: Bildirime tıklanınca ilgili chat id'ye yönlendir
      notification.onclick = () => {
        window.focus();
        // Zustand routing store kullanılarak veya window.location ile URL değişecek
        // Örn: window.location.href = `/messages/${message.conversationId}?msgId=${message.id}`
        // Ancak bu React ortamında React Router ile ele alınmalı.
        logInfo("Bildirime tıklandı. Yönlendirme tetikleniyor...", message.id);
        notification.close();
      };
    }
  }
}

export const notificationService = new NotificationService();
