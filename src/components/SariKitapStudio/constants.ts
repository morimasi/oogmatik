import type { SariKitapActivityType } from '../../types/sariKitap';

export interface ModuleInfo {
    type: SariKitapActivityType;
    label: string;
    icon: string;
    color: string;
    description: string;
}

export const MODULE_LIST: ModuleInfo[] = [
    {
        type: 'pencere',
        label: 'Pencere',
        icon: '🪟',
        color: '#3b82f6',
        description: 'Maskeleme ile odaklanma',
    },
    {
        type: 'nokta',
        label: 'Nokta',
        icon: '⚫',
        color: '#10b981',
        description: 'Göz takibi noktaları',
    },
    {
        type: 'kopru',
        label: 'Köprü',
        icon: '🌉',
        color: '#8b5cf6',
        description: 'Hece yay bağlantıları',
    },
    {
        type: 'cift_metin',
        label: 'Çift Metin',
        icon: '📖',
        color: '#f59e0b',
        description: 'İki hikaye ayrıştırma',
    },
    {
        type: 'bellek',
        label: 'Bellek',
        icon: '🧠',
        color: '#ef4444',
        description: 'Kelime hafıza blokları',
    },
    {
        type: 'hizli_okuma',
        label: 'Hızlı Okuma',
        icon: '⚡',
        color: '#06b6d4',
        description: 'Seriyal kelime blokları',
    },
];

export const AGE_GROUPS = [
    { value: '5-7', label: '5-7 yaş (Okul Öncesi)' },
    { value: '8-10', label: '8-10 yaş (İlkokul)' },
    { value: '11-13', label: '11-13 yaş (Ortaokul)' },
    { value: '14+', label: '14+ yaş (Lise)' },
] as const;

export const DIFFICULTIES = [
    { value: 'Başlangıç', label: 'Başlangıç', color: '#10b981' },
    { value: 'Orta', label: 'Orta', color: '#f59e0b' },
    { value: 'İleri', label: 'İleri', color: '#ef4444' },
    { value: 'Uzman', label: 'Uzman', color: '#8b5cf6' },
] as const;

export const PROFILES = [
    { value: 'dyslexia', label: 'Disleksi' },
    { value: 'dyscalculia', label: 'Diskalkuli' },
    { value: 'adhd', label: 'DEHB' },
    { value: 'mixed', label: 'Karma' },
] as const;

export const TOPICS = [
    'Doğa', 'Okul', 'Hayvanlar', 'Aile', 'Macera',
] as const;
