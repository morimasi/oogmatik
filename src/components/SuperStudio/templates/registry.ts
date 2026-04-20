import React from 'react';
import type { SuperStudioDifficulty } from '../../../types/superStudio';

// ------------------------------------------------------------
// GLOBAL TYPES (MİMARİ ALTYAPI)
// ------------------------------------------------------------

export interface TemplateSettingsProps<T = any> {
    templateId: string;
    settings: T;
    onChange: (payload: Partial<T>) => void;
}

export interface IPromptBuilderContext<T = any> {
    topic: string;
    studentName?: string;
    grade?: string | null;
    difficulty: SuperStudioDifficulty;
    settings: T;
}

export interface SuperTemplateDefinition<T = any> {
    id: string;
    title: string;
    category: string;
    description: string;
    icon: string;             // FontAwesome referansı
    defaultSettings: T;       // Şablonun standart ayarları
    component: React.FC<TemplateSettingsProps<T>>; 
    promptBuilder: (context: IPromptBuilderContext<T>) => string;
}

// ------------------------------------------------------------
// MODÜLER İTHALAT (DIRECTORY-BASED IMPORTS)
// ------------------------------------------------------------

import * as OkumaAnlama from './OkumaAnlama';
import * as DilBilgisi from './DilBilgisi';
import * as MantikMuhakeme from './MantikMuhakeme';
import * as YaraticiYazarlik from './YaraticiYazarlik';
import * as YazimNoktalama from './YazimNoktalama';
import * as SozVarligi from './SozVarligi';
import * as HeceSes from './HeceSes';
import * as KelimeBilgisi from './KelimeBilgisi';

// ------------------------------------------------------------
// REGISTRY: TÜM ŞABLONLARIN DEPOSU
// ------------------------------------------------------------

export const SUPER_STUDIO_REGISTRY: SuperTemplateDefinition[] = [
    {
        id: 'okuma-anlama',
        title: 'Okuma Anlama',
        category: 'Okuma ve Anlama',
        description: 'Bilişsel yükü filtrelenmiş, disleksi dostu okuma metinleri ve 5N1K soruları.',
        icon: 'fa-solid fa-book-open-reader',
        defaultSettings: OkumaAnlama.DEFAULT_SETTINGS,
        component: OkumaAnlama.Settings,
        promptBuilder: OkumaAnlama.promptBuilder
    },
    {
        id: 'dil-bilgisi',
        title: 'Dil Bilgisi & Yazım',
        category: 'Dil Bilgisi',
        description: 'Ayna harfler (b/d, p/q) ve harf farkındalığı odaklı dil bilgisi çalışmaları.',
        icon: 'fa-solid fa-spell-check',
        defaultSettings: DilBilgisi.DEFAULT_SETTINGS,
        component: DilBilgisi.Settings,
        promptBuilder: DilBilgisi.promptBuilder
    },
    {
        id: 'mantik-muhakeme',
        title: 'Mantık Muhakeme',
        category: 'Bilişsel Gelişim',
        description: 'Sıralama, sözel matris ve dedektiflik oyunlarıyla üst düzey mantık becerileri.',
        icon: 'fa-solid fa-puzzle-piece',
        defaultSettings: MantikMuhakeme.DEFAULT_SETTINGS,
        component: MantikMuhakeme.Settings,
        promptBuilder: MantikMuhakeme.promptBuilder
    },
    {
        id: 'yaratici-yazarlik',
        title: 'Yaratıcı Yazarlık',
        category: 'Yazma Becerileri',
        description: 'Hikaye zarları ve duygu radarı ile eğlenceli, oyunlaştırılmış yazma stüdyosu.',
        icon: 'fa-solid fa-pen-nib',
        defaultSettings: YaraticiYazarlik.DEFAULT_SETTINGS,
        component: YaraticiYazarlik.Settings,
        promptBuilder: YaraticiYazarlik.promptBuilder
    },
    {
        id: 'yazim-noktalama',
        title: 'Yazım & Noktalama',
        category: 'Yazma Becerileri',
        description: 'Hata dedektifi ve kural hatırlatıcılar ile noktalama işaretlerini ustalıkla öğrenme.',
        icon: 'fa-solid fa-quote-right',
        defaultSettings: YazimNoktalama.DEFAULT_SETTINGS,
        component: YazimNoktalama.Settings,
        promptBuilder: YazimNoktalama.promptBuilder
    },
    {
        id: 'soz-varligi',
        title: 'Söz Varlığı (Deyim/Atasözü)',
        category: 'Anlam Bilgisi',
        description: 'Görsel analoji ve bağlam temelli deyim/atasözü farkındalık çalışmaları.',
        icon: 'fa-solid fa-language',
        defaultSettings: SozVarligi.DEFAULT_SETTINGS,
        component: SozVarligi.Settings,
        promptBuilder: SozVarligi.promptBuilder
    },
    {
        id: 'hece-ses',
        title: 'Hece & Ses Olayları',
        category: 'Dil Bilgisi',
        description: 'Fonolojik farkındalık, heceleme kuralları ve ses olaylarını kavrama stüdyosu.',
        icon: 'fa-solid fa-wave-square',
        defaultSettings: HeceSes.DEFAULT_SETTINGS,
        component: HeceSes.Settings,
        promptBuilder: HeceSes.promptBuilder
    },
    {
        id: 'kelime-bilgisi',
        title: 'Kelime Bilgisi',
        category: 'Anlam Bilgisi',
        description: 'Eş anlamlı, zıt anlamlı ve eş sesli kelimeler ile kelime dağarcığı geliştirme stüdyosu.',
        icon: 'fa-solid fa-spell-check',
        defaultSettings: KelimeBilgisi.DEFAULT_SETTINGS,
        component: KelimeBilgisi.Settings,
        promptBuilder: KelimeBilgisi.promptBuilder
    }
];

export const getTemplateById = (id: string) => {
    return SUPER_STUDIO_REGISTRY.find(t => t.id === id);
};
