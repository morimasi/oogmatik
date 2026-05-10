import React, { ChangeEvent, useState } from 'react';
import { BentoCard } from '../../components/shared/BentoCard';
import { SectionHeader } from '../../components/shared/SectionHeader';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import type { UserProfileSettingsProps } from '../../types';

export const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({ data }) => {
    const { profileFields, setProfileFields, saveProfile, isSaving, profileCompletion } = useProfileSettings();
    const [showAvatarInput, setShowAvatarInput] = useState(false);

    const update = (field: string, value: string) => {
        setProfileFields((prev: typeof profileFields) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Avatar + Info Hero */}
            <div className="p-8 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent rounded-[3rem] border border-white/20 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full -mr-40 -mt-40 blur-[100px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full -ml-32 -mb-32 blur-[80px]" />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    {/* Avatar */}
                    <div className="relative group cursor-pointer">
                        <div className="w-28 h-28 rounded-[2.5rem] p-1 bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-500 shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2">
                            <img
                                src={profileFields.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profileFields.name || 'U')}
                                className="w-full h-full rounded-[2.3rem] object-cover bg-white"
                                alt="Avatar"
                            />
                        </div>
                        <button
                            onClick={() => setShowAvatarInput(!showAvatarInput)}
                            className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-zinc-900 border-4 border-slate-50 dark:border-zinc-800 text-indigo-600 rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                        >
                            <i className="fa-solid fa-cloud-arrow-up text-sm" />
                        </button>
                    </div>

                    {/* Info */}
                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{profileFields.name || 'İsimsiz Eğitmen'}</h3>
                            <span className="px-3 py-1 bg-indigo-500 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-indigo-500/40">Premium Pro</span>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            {profileFields.profession && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/50 shadow-sm">
                                    <i className="fa-solid fa-user-graduate text-indigo-500 text-[10px]" />
                                    <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">{profileFields.profession}</span>
                                </div>
                            )}
                            {profileFields.institution && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/50 shadow-sm">
                                    <i className="fa-solid fa-building-columns text-emerald-500 text-[10px]" />
                                    <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">{profileFields.institution}</span>
                                </div>
                            )}
                        </div>
                        {/* Profil Tamamlanma */}
                        <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full overflow-hidden max-w-[200px]">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${profileCompletion}%` }} />
                            </div>
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">%{profileCompletion} Tamamlandı</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Avatar URL Input */}
            {showAvatarInput && (
                <div className="animate-in slide-in-from-top-2 duration-300 p-5 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                    <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 ml-1">Özel Avatar URL</label>
                    <input
                        type="text"
                        value={profileFields.avatar}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => update('avatar', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-4 py-3 bg-white dark:bg-black/30 border border-indigo-200 dark:border-indigo-500/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold shadow-inner"
                    />
                </div>
            )}

            {/* Form Alanları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField icon="fa-signature" label="Gerçek Adınız" value={profileFields.name} onChange={(v) => update('name', v)} />
                <FormField icon="fa-graduation-cap" label="Uzmanlık & Branş" value={profileFields.profession} onChange={(v) => update('profession', v)} />
                <FormField icon="fa-school" label="Çalıştığınız Kurum" value={profileFields.institution} onChange={(v) => update('institution', v)} accentColor="emerald" />
                <FormField icon="fa-mobile-screen-button" label="İletişim Numarası" value={profileFields.phone} onChange={(v) => update('phone', v)} type="tel" />
            </div>

            {/* Bio */}
            <div className="space-y-2">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Eğitmen Özeti / Biyografi</label>
                <textarea
                    value={profileFields.bio}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => update('bio', e.target.value)}
                    rows={3}
                    placeholder="Pedagoji yaklaşımınızdan veya deneyimlerinizden bahsedin..."
                    className="w-full px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold resize-none transition-all text-sm"
                />
            </div>

            {/* Kaydet */}
            <div className="flex justify-end">
                <button
                    onClick={saveProfile}
                    disabled={isSaving}
                    className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-indigo-600/30 disabled:opacity-50"
                >
                    <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
                    <div className="relative flex items-center gap-3">
                        {isSaving ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-bolt-lightning" />}
                        <span>Profil Değişikliklerini Uygula</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

// ─── Form Field Bileşeni ─────────────────────────────────────
const FormField: React.FC<{
    icon: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    accentColor?: string;
}> = ({ icon, label, value, onChange, type = 'text', accentColor = 'indigo' }) => (
    <div className="space-y-2">
        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-${accentColor}-500 transition-colors`}>
                <i className={`fa-solid ${icon} text-xs`} />
            </div>
            <input
                type={type}
                value={value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                className={`w-full pl-11 pr-4 py-3.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-${accentColor}-500/10 font-bold transition-all text-sm`}
            />
        </div>
    </div>
);
