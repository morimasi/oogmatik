/**
 * BDMIND - Studio Registry
 * Uygulamadaki tüm stüdyo ve modüllerin merkezi konfigürasyonu.
 */

export interface StudioItem {
    id: string;
    label: string;
    icon: string;
    color: string;
    actionType?: 'callback' | 'event';
    eventName?: string;
}

export interface StudioGroup {
    title: string;
    items: StudioItem[];
}

export const STUDIO_GROUPS: StudioGroup[] = [
    {
        title: 'Değerlendirme & Plan',
        items: [
            {
                id: 'screening',
                label: 'Tarama & Analiz',
                icon: 'fa-clipboard-question',
                color: 'text-purple-500',
                actionType: 'callback'
            },
            {
                id: 'curriculum',
                label: 'Plan & Müfredat',
                icon: 'fa-calendar-check',
                color: 'text-emerald-500',
                actionType: 'callback'
            },
        ],
    },
    {
        title: 'Alan Stüdyoları',
        items: [
            {
                id: 'reading',
                label: 'Okuma-Anlama Stüdyosu',
                icon: 'fa-book-open',
                color: 'text-rose-500',
                actionType: 'callback'
            },
            {
                id: 'math',
                label: 'Matematik İşlem Stüdyosu',
                icon: 'fa-calculator',
                color: 'text-blue-500',
                actionType: 'callback'
            },
            {
                id: 'super-turkce',
                label: 'Türkçe Anlama Stüdyosu',
                icon: 'fa-wand-magic-sparkles',
                color: 'text-teal-500',
                actionType: 'callback'
            },
            {
                id: 'sinav-studyosu',
                label: 'Türkçe Sınav Stüdyosu',
                icon: 'fa-clipboard-check',
                color: 'text-amber-500',
                actionType: 'callback'
            },
            {
                id: 'mat-sinav-studyosu',
                label: 'Matematik Sınav Stüdyosu',
                icon: 'fa-square-root-variable',
                color: 'text-blue-600',
                actionType: 'callback'
            },
        ],
    },
    {
        title: 'Yaratıcı Atölye',
        items: [
            {
                id: 'activity-studio',
                label: 'Ultra Etkinlik Stüdyosu',
                icon: 'fa-wand-sparkles',
                color: 'text-fuchsia-500',
                actionType: 'callback'
            },
            {
                id: 'infographic-studio',
                label: 'İnfografik Stüdyosu',
                icon: 'fa-chart-pie',
                color: 'text-violet-500',
                actionType: 'callback'
            },
            {
                id: 'sari-kitap-studio',
                label: 'Hızlı Okuma Stüdyosu',
                icon: 'fa-book',
                color: 'text-yellow-500',
                actionType: 'callback'
            },
            {
                id: 'kelime-cumle-studio',
                label: 'Kelime-Cümle Stüdyosu',
                icon: 'fa-font',
                color: 'text-indigo-500',
                actionType: 'callback'
            },
        ],
    },
];
