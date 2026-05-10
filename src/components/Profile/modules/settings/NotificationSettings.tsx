import React from 'react';
import { SectionHeader } from '../../components/shared/SectionHeader';
import { ToggleSwitch } from '../../components/shared/ToggleSwitch';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import type { NotificationSettingsProps, NotificationSettingsData } from '../../types';

const NOTIFICATION_CHANNELS = [
    { id: 'emailNotifications', label: 'E-Posta Özetleri', desc: 'Haftalık öğrenci gelişim raporu', icon: 'fa-envelope-open-text', color: 'emerald' },
    { id: 'pushNotifications', label: 'Tarayıcı Bildirimleri', desc: 'Anlık push bildirimler', icon: 'fa-bell', color: 'indigo' },
    { id: 'studentAlerts', label: 'Öğrenci Uyarıları', desc: 'Plato, düşüş ve ilerleme uyarıları', icon: 'fa-user-shield', color: 'amber' },
    { id: 'materialSuggestions', label: 'Materyal Önerileri', desc: 'AI destekli içerik önerileri', icon: 'fa-lightbulb', color: 'purple' },
    { id: 'systemUpdates', label: 'Sistem Güncellemeleri', desc: 'Platform ve özellik güncellemeleri', icon: 'fa-code-branch', color: 'blue' },
    { id: 'bepReminders', label: 'BEP Hatırlatıcıları', desc: 'Hedef süresi ve ilerleme takibi', icon: 'fa-clock', color: 'rose' },
] as const;

const FREQUENCIES = [
    { id: 'realtime', label: 'Anlık', icon: 'fa-bolt' },
    { id: 'daily', label: 'Günlük Özet', icon: 'fa-sun' },
    { id: 'weekly', label: 'Haftalık Özet', icon: 'fa-calendar-week' },
] as const;

export const NotificationSettings: React.FC<NotificationSettingsProps> = () => {
    const { notificationSettings, saveNotificationSettings } = useProfileSettings();

    const update = (field: keyof NotificationSettingsData, value: unknown) => {
        saveNotificationSettings({ ...notificationSettings, [field]: value } as NotificationSettingsData);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Bildirim Kanalları */}
            <div className="space-y-3">
                {NOTIFICATION_CHANNELS.map(ch => (
                    <div
                        key={ch.id}
                        className="flex items-center justify-between p-5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] hover:border-[var(--accent-color)]/20 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${(notificationSettings as unknown as Record<string, unknown>)[ch.id]
                                ? `bg-${ch.color}-500 text-white shadow-lg shadow-${ch.color}-500/20`
                                : 'bg-white dark:bg-zinc-800 text-zinc-300 group-hover:text-[var(--accent-color)]'
                                }`}>
                                <i className={`fa-solid ${ch.icon}`} />
                            </div>
                            <div>
                                <p className="font-black text-[var(--text-primary)] text-sm">{ch.label}</p>
                                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">{ch.desc}</p>
                            </div>
                        </div>
                        <ToggleSwitch
                            enabled={!!(notificationSettings as unknown as Record<string, unknown>)[ch.id]}
                            onChange={(v) => update(ch.id as keyof NotificationSettingsData, v)}
                            color={`bg-${ch.color}-500`}
                        />
                    </div>
                ))}
            </div>

            {/* Bildirim Sıklığı */}
            <div className="p-5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)]">
                <SectionHeader title="Bildirim Sıklığı" icon="fa-clock-rotate-left" />
                <div className="flex gap-2">
                    {FREQUENCIES.map(f => (
                        <button
                            key={f.id}
                            onClick={() => update('frequency', f.id)}
                            className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2 ${notificationSettings.frequency === f.id
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20'
                                : 'bg-[var(--bg-paper)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                                }`}
                        >
                            <i className={`fa-solid ${f.icon} text-lg`} />
                            <span>{f.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sessiz Saatler */}
            <div className="p-5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)]">
                <SectionHeader title="Sessiz Saatler" icon="fa-moon" description="Bu saatler arasında bildirim gönderilmez" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Başlangıç</label>
                        <input
                            type="time"
                            value={notificationSettings.quietHoursStart}
                            onChange={(e) => update('quietHoursStart', e.target.value)}
                            className="w-full px-4 py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl font-bold text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Bitiş</label>
                        <input
                            type="time"
                            value={notificationSettings.quietHoursEnd}
                            onChange={(e) => update('quietHoursEnd', e.target.value)}
                            className="w-full px-4 py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl font-bold text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
