import React, { useState } from 'react';
import { 
    notificationService, 
    NotificationSettings, 
    defaultNotificationSettings 
} from '../../../services/messaging/notificationService';
import { Bell, BellOff, Volume2, Smartphone, Monitor } from 'lucide-react';
import { useMessageStore } from '../../../store/useMessageStore';

export const ChatSettings: React.FC = () => {
    const { activeConversationId } = useMessageStore();
    const [settings, setSettings] = useState<NotificationSettings>(defaultNotificationSettings);

    const toggleMute = () => {
        if (!activeConversationId) return;
        
        setSettings((prev: NotificationSettings) => {
            const isMuted = prev.mutedChatIds.includes(activeConversationId);
            const newMuted = isMuted 
                ? prev.mutedChatIds.filter((id: string) => id !== activeConversationId)
                : [...prev.mutedChatIds, activeConversationId];
                
            return { ...prev, mutedChatIds: newMuted };
        });
    };

    const isCurrentChatMuted = activeConversationId ? settings.mutedChatIds.includes(activeConversationId) : false;

    return (
        <div className="p-4 bg-[#0f1115]/50 border border-white/5 rounded-xl backdrop-blur-sm">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-accent-primary" />
                Bildirim Ayarları
            </h3>

            <div className="space-y-4">
                {/* Sohbeti Sessize Al (Mute/Unmute) */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isCurrentChatMuted ? <BellOff className="w-4 h-4 text-white/50" /> : <Bell className="w-4 h-4 text-white/80" />}
                        <span className="text-sm text-white/80">Bu Sohbeti Sessize Al</span>
                    </div>
                    <button 
                        onClick={toggleMute}
                        className={`w-10 h-5 rounded-full relative transition-colors ${isCurrentChatMuted ? 'bg-accent-primary' : 'bg-white/10'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${isCurrentChatMuted ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Native Bildirim İzni */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-white/80" />
                        <span className="text-sm text-white/80">Masaüstü Bildirimleri</span>
                    </div>
                    <button 
                        onClick={async () => {
                            if (!settings.desktopEnabled) {
                                const granted = await notificationService.requestDesktopPermission();
                                if (granted) setSettings((s: NotificationSettings) => ({ ...s, desktopEnabled: true }));
                            } else {
                                setSettings((s: NotificationSettings) => ({ ...s, desktopEnabled: false }));
                            }
                        }}
                        className={`w-10 h-5 rounded-full relative transition-colors ${settings.desktopEnabled ? 'bg-accent-primary' : 'bg-white/10'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${settings.desktopEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Kilit Ekranı / Detay Gizleme */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-white/80" />
                        <span className="text-sm text-white/80">İçeriği Gizle (Gizlilik)</span>
                    </div>
                    <button 
                        onClick={() => setSettings((s: NotificationSettings) => ({ ...s, showOnLockScreen: !s.showOnLockScreen }))}
                        className={`w-10 h-5 rounded-full relative transition-colors ${!settings.showOnLockScreen ? 'bg-accent-primary' : 'bg-white/10'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${!settings.showOnLockScreen ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Ses Asistanı */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-white/80" />
                        <span className="text-sm text-white/80">Bildirim Sesi</span>
                    </div>
                    <button 
                        onClick={() => setSettings((s: NotificationSettings) => ({ ...s, soundEnabled: !s.soundEnabled }))}
                        className={`w-10 h-5 rounded-full relative transition-colors ${settings.soundEnabled ? 'bg-accent-primary' : 'bg-white/10'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${settings.soundEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
            
            <p className="text-xs text-white/40 mt-4 leading-relaxed italic">
                Oogmatik iletişim kayıtları KVKK kapsamında saklanmaktadır. Gizlilik modunu açarak push bildirimlerinde mesaj içeriğini şifreleyebilirsiniz.
            </p>
        </div>
    );
};
