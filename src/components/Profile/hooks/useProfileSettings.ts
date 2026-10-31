/**
 * useProfileSettings — Profil Ayarları Ortak State Yönetimi
 * Tüm settings alt modüllerinin paylaştığı state ve save mekanizması.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useToastStore } from '../../../store/useToastStore';
import { AppError } from '../../../utils/AppError';
import { logError } from '../../../utils/errorHandler';
import type {
    ProfileFormFields,
    PedagogySettingsData,
    AISettingsData,
    NotificationSettingsData,
    CustomUISettings,
} from '../types';
import {
    DEFAULT_PEDAGOGY_SETTINGS as PEDAGOGY_DEFAULTS,
    DEFAULT_AI_SETTINGS as AI_DEFAULTS,
    DEFAULT_NOTIFICATION_SETTINGS as NOTIFICATION_DEFAULTS,
} from '../types';

/**
 * Hangi ayar grubunun kaydedileceğini belirtir. Her ayar modülü kendi
 * dilimini yazar; böylece bir sekmedeki değişiklik diğer sekmelerin
 * (özellikle profil alanları ve pedagoji/AI ayarlarının) üzerine yazmaz.
 */
export type SettingsSaveScope = 'profile' | 'pedagogy' | 'ai' | 'all';

export const useProfileSettings = () => {
    const { user, updateUser } = useAuthStore();
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ─── Profil Alanları ─────────────────────────────────────────
    const [profileFields, setProfileFields] = useState<ProfileFormFields>({
        name: user?.name || '',
        profession: user?.profession || '',
        institution: user?.institution || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        avatar: user?.avatar || '',
    });

    // User değiştiğinde state'i güncelle
    useEffect(() => {
        if (user) {
            setProfileFields({
                name: user.name || '',
                profession: user.profession || '',
                institution: user.institution || '',
                phone: user.phone || '',
                bio: user.bio || '',
                avatar: user.avatar || '',
            });
        }
    }, [user?.id]);

    // ─── Pedagoji Ayarları ───────────────────────────────────────
    const [pedagogySettings, setPedagogySettings] = useState<PedagogySettingsData>(() => {
        if (user?.pedagogySettings) return user.pedagogySettings;
        return PEDAGOGY_DEFAULTS;
    });

    // ─── AI Ayarları ─────────────────────────────────────────────
    const [aiSettings, setAiSettings] = useState<AISettingsData>(() => {
        if (user?.aiAssistantSettings) return user.aiAssistantSettings as AISettingsData;
        return AI_DEFAULTS;
    });

    // ─── Bildirim Ayarları ───────────────────────────────────────
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsData>(() => {
        try {
            const stored = localStorage.getItem('bdmind_notifications');
            if (stored) return JSON.parse(stored);
        } catch { /* ignore */ }
        return NOTIFICATION_DEFAULTS;
    });

    // ─── UI Ayarları ─────────────────────────────────────────────
    const [customUI, setCustomUI] = useState<CustomUISettings>({
        density: 'comfortable',
        radius: 'xl',
        sidebarPosition: 'left',
        accent: 'indigo',
        animationLevel: 'full',
    });

    // ─── Kaydetme İşlemleri ──────────────────────────────────────
    const [isSaving, setIsSaving] = useState(false);

    const saveProfile = useCallback(async (scope: SettingsSaveScope = 'all') => {
        if (!user) return;
        setIsSaving(true);
        try {
            const updates: Parameters<typeof updateUser>[0] = {};
            if (scope === 'profile' || scope === 'all') {
                updates.name = profileFields.name;
                updates.profession = profileFields.profession;
                updates.institution = profileFields.institution;
                updates.phone = profileFields.phone;
                updates.bio = profileFields.bio;
                updates.avatar = profileFields.avatar;
            }
            if (scope === 'pedagogy' || scope === 'all') {
                updates.pedagogySettings = pedagogySettings;
            }
            if (scope === 'ai' || scope === 'all') {
                updates.aiAssistantSettings = aiSettings;
            }
            await updateUser(updates);
            useToastStore.getState().success(
                scope === 'pedagogy' || scope === 'ai'
                    ? 'Ayarlar kaydedildi.'
                    : 'Profil bilgileri güncellendi.'
            );
        } catch (e: unknown) {
            const err = e instanceof AppError ? e : new AppError(String(e), 'PROFILE_UPDATE_ERROR', 500);
            logError(err, { context: 'useProfileSettings.saveProfile' });
            useToastStore.getState().error('Güncelleme sırasında hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    }, [user, profileFields, pedagogySettings, aiSettings, updateUser]);

    const saveNotificationSettings = useCallback((settings: NotificationSettingsData) => {
        setNotificationSettings(settings);
        localStorage.setItem('bdmind_notifications', JSON.stringify(settings));
    }, []);

    // Debounced auto-save (2 saniye)
    const debouncedSave = useCallback((scope: SettingsSaveScope = 'pedagogy') => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            saveProfile(scope);
        }, 2000);
    }, [saveProfile]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, []);

    // ─── Profil Tamamlanma Oranı ─────────────────────────────────
    const profileCompletion = (() => {
        let filled = 0;
        const total = 6;
        if (profileFields.name) filled++;
        if (profileFields.profession) filled++;
        if (profileFields.institution) filled++;
        if (profileFields.phone) filled++;
        if (profileFields.bio) filled++;
        if (profileFields.avatar) filled++;
        return Math.round((filled / total) * 100);
    })();

    return {
        // State
        profileFields,
        setProfileFields,
        pedagogySettings,
        setPedagogySettings,
        aiSettings,
        setAiSettings,
        notificationSettings,
        saveNotificationSettings,
        customUI,
        setCustomUI,

        // Actions
        saveProfile,
        debouncedSave,
        isSaving,

        // Computed
        profileCompletion,
        user,
    };
};
