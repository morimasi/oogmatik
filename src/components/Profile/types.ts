/**
 * Profile Module — Tip Tanımları
 * Tüm profil modülleri ve alt bileşenler için merkezi tip dosyası.
 */
import { ProfileData } from '../../types/profile';
import { AppTheme, UiSettings } from '../../types';

// ─── Settings Alt Modülleri ────────────────────────────────────
export type SettingsCategory = 'profile' | 'appearance' | 'pedagogy' | 'ai' | 'notifications' | 'security' | 'students';

export interface SettingsCategoryItem {
    id: SettingsCategory;
    label: string;
    icon: string;
    desc: string;
}

// Kullanıcı Profili
export interface ProfileFormFields {
    name: string;
    profession: string;
    institution: string;
    phone: string;
    bio: string;
    avatar: string;
}

// Pedagoji Ayarları
export interface PedagogySettingsData {
    curriculumSync: boolean;
    curriculumYear: string;
    zpdStrategy: 'optimal' | 'scaffold' | 'autonomy';
    terminologyMode: 'supportive' | 'clinical';
    bepIntegration: boolean;
    fontStandard: string;
}

// AI Ayarları
export interface AISettingsData {
    tone: string;
    creativity: number;
    imageMode: 'cartoon' | 'realistic' | 'schematic' | 'lineart';
    scaffolding: 'low' | 'balanced' | 'high' | 'max';
    autoSuggest: boolean;
    voiceAssistant: boolean;
    analysisDepth: 'detailed' | 'summary' | 'bullet';
}

// Bildirim Ayarları
export interface NotificationSettingsData {
    emailNotifications: boolean;
    pushNotifications: boolean;
    studentAlerts: boolean;
    materialSuggestions: boolean;
    systemUpdates: boolean;
    bepReminders: boolean;
    frequency: 'realtime' | 'daily' | 'weekly';
    quietHoursStart: string; // "22:00"
    quietHoursEnd: string;   // "08:00"
}

// UI Özelleştirme
export interface CustomUISettings {
    density: 'comfortable' | 'compact';
    radius: 'none' | 'sm' | 'xl' | 'full';
    sidebarPosition: 'left' | 'right';
    accent: string;
    animationLevel: 'full' | 'reduced' | 'none';
}

// Güvenlik
export interface PasswordForm {
    next: string;
    confirm: string;
}

// ─── Shared Bileşen Props ──────────────────────────────────────
export interface BentoCardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    icon?: string;
    iconColor?: string;
    action?: React.ReactNode;
    compact?: boolean;
}

export interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (value: boolean) => void;
    size?: 'sm' | 'md' | 'lg';
    color?: string;
    disabled?: boolean;
}

export interface StatCardProps {
    value: string | number;
    label: string;
    icon?: string;
    trend?: { value: number; direction: 'up' | 'down' | 'stable' };
    color?: string;
}

export interface SectionHeaderProps {
    title: string;
    icon?: string;
    description?: string;
    action?: React.ReactNode;
}

// ─── Settings Alt Modül Props ──────────────────────────────────
export interface BaseSettingsProps {
    data: ProfileData;
    isReadOnly?: boolean;
}

export interface UserProfileSettingsProps extends BaseSettingsProps { }

export interface AppearanceSettingsProps extends BaseSettingsProps {
    theme?: AppTheme;
    uiSettings?: UiSettings;
    onUpdateTheme?: (theme: AppTheme) => void;
    onUpdateUiSettings?: (settings: UiSettings) => void;
}

export interface PedagogySettingsProps extends BaseSettingsProps { }

export interface AIControlSettingsProps extends BaseSettingsProps { }

export interface NotificationSettingsProps extends BaseSettingsProps { }

export interface SecuritySettingsProps extends BaseSettingsProps { }

// ─── Analiz Hook Tipleri ───────────────────────────────────────
export interface ProfileAnalytics {
    skillRadar: { label: string; value: number }[];
    weeklyProgress: { week: string; score: number }[];
    categoryBreakdown: { category: string; count: number; avgScore: number }[];
    plateauAlerts: { student: string; risk: 'high' | 'medium' | 'low'; weeksStable: number }[];
}

// ─── Sabitler ──────────────────────────────────────────────────
export const SETTINGS_CATEGORIES: SettingsCategoryItem[] = [
    { id: 'profile', label: 'Kullanıcı Profili', icon: 'fa-user-astronaut', desc: 'Kimlik ve Kurumsal' },
    { id: 'students', label: 'Öğrencilerim', icon: 'fa-users-rectangle', desc: 'Öğrenci Yönetimi' },
    { id: 'appearance', label: 'Tasarım & Tema', icon: 'fa-wand-magic-sparkles', desc: 'Ultra Premium UI' },
    { id: 'pedagogy', label: 'Eğitim Vizyonu', icon: 'fa-microscope', desc: 'Strateji ve ZPD' },
    { id: 'ai', label: 'AI Kontrol Merkezi', icon: 'fa-brain-circuit', desc: 'Motor & Zeka' },
    { id: 'notifications', label: 'İletişim Hattı', icon: 'fa-satellite-dish', desc: 'Sistem Mesajları' },
    { id: 'security', label: 'Varlık Güvenliği', icon: 'fa-vault', desc: 'Şifre & Gizlilik' },
];

export const DEFAULT_PEDAGOGY_SETTINGS: PedagogySettingsData = {
    curriculumSync: true,
    curriculumYear: '2024-2025',
    zpdStrategy: 'optimal',
    terminologyMode: 'supportive',
    bepIntegration: true,
    fontStandard: 'Lexend',
};

export const DEFAULT_AI_SETTINGS: AISettingsData = {
    tone: 'kurumsal',
    creativity: 75,
    imageMode: 'cartoon',
    scaffolding: 'balanced',
    autoSuggest: true,
    voiceAssistant: false,
    analysisDepth: 'detailed',
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsData = {
    emailNotifications: true,
    pushNotifications: false,
    studentAlerts: true,
    materialSuggestions: true,
    systemUpdates: true,
    bepReminders: true,
    frequency: 'daily',
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
};
