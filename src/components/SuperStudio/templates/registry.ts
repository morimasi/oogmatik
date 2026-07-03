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

import { DEFAULT_SETTINGS as OkumaAnlamaDefaults, Settings as OkumaAnlamaSettings, promptBuilder as OkumaAnlamaPrompt } from './OkumaAnlama';
import { DEFAULT_SETTINGS as DilBilgisiDefaults, Settings as DilBilgisiSettings, promptBuilder as DilBilgisiPrompt } from './DilBilgisi';
import { DEFAULT_SETTINGS as MantikMuhakemeDefaults, Settings as MantikMuhakemeSettings, promptBuilder as MantikMuhakemePrompt } from './MantikMuhakeme';
import { DEFAULT_SETTINGS as YaraticiYazarlikDefaults, Settings as YaraticiYazarlikSettings, promptBuilder as YaraticiYazarlikPrompt } from './YaraticiYazarlik';
import { DEFAULT_SETTINGS as YazimNoktalamaDefaults, Settings as YazimNoktalamaSettings, promptBuilder as YazimNoktalamaPrompt } from './YazimNoktalama';
import { DEFAULT_SETTINGS as SozVarligiDefaults, Settings as SozVarligiSettings, promptBuilder as SozVarligiPrompt } from './SozVarligi';
import { DEFAULT_SETTINGS as HeceSesDefaults, Settings as HeceSesSettings, promptBuilder as HeceSesPrompt } from './HeceSes';
import { DEFAULT_SETTINGS as KelimeBilgisiDefaults, Settings as KelimeBilgisiSettings, promptBuilder as KelimeBilgisiPrompt } from './KelimeBilgisi';

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
        defaultSettings: OkumaAnlamaDefaults,
        component: OkumaAnlamaSettings as any,
        promptBuilder: OkumaAnlamaPrompt as any
    },
    {
        id: 'dil-bilgisi',
        title: 'Dil Bilgisi & Yazım',
        category: 'Dil Bilgisi',
        description: 'Ayna harfler (b/d, p/q) ve harf farkındalığı odaklı dil bilgisi çalışmaları.',
        icon: 'fa-solid fa-spell-check',
        defaultSettings: DilBilgisiDefaults,
        component: DilBilgisiSettings as any,
        promptBuilder: DilBilgisiPrompt as any
    },
    {
        id: 'mantik-muhakeme',
        title: 'Mantık Muhakeme',
        category: 'Bilişsel Gelişim',
        description: 'Sıralama, sözel matris ve dedektiflik oyunlarıyla üst düzey mantık becerileri.',
        icon: 'fa-solid fa-puzzle-piece',
        defaultSettings: MantikMuhakemeDefaults,
        component: MantikMuhakemeSettings as any,
        promptBuilder: MantikMuhakemePrompt as any
    },
    {
        id: 'yaratici-yazarlik',
        title: 'Yaratıcı Yazarlık',
        category: 'Yazma Becerileri',
        description: 'Hikaye zarları ve duygu radarı ile eğlenceli, oyunlaştırılmış yazma stüdyosu.',
        icon: 'fa-solid fa-pen-nib',
        defaultSettings: YaraticiYazarlikDefaults,
        component: YaraticiYazarlikSettings as any,
        promptBuilder: YaraticiYazarlikPrompt as any
    },
    {
        id: 'yazim-noktalama',
        title: 'Yazım & Noktalama',
        category: 'Yazma Becerileri',
        description: 'Hata dedektifi ve kural hatırlatıcılar ile noktalama işaretlerini ustalıkla öğrenme.',
        icon: 'fa-solid fa-quote-right',
        defaultSettings: YazimNoktalamaDefaults,
        component: YazimNoktalamaSettings as any,
        promptBuilder: YazimNoktalamaPrompt as any
    },
    {
        id: 'soz-varligi',
        title: 'Söz Varlığı (Deyim/Atasözü)',
        category: 'Anlam Bilgisi',
        description: 'Görsel analoji ve bağlam temelli deyim/atasözü farkındalık çalışmaları.',
        icon: 'fa-solid fa-language',
        defaultSettings: SozVarligiDefaults,
        component: SozVarligiSettings as any,
        promptBuilder: SozVarligiPrompt as any
    },
    {
        id: 'hece-ses',
        title: 'Hece & Ses Olayları',
        category: 'Dil Bilgisi',
        description: 'Fonolojik farkındalık, heceleme kuralları ve ses olaylarını kavrama stüdyosu.',
        icon: 'fa-solid fa-wave-square',
        defaultSettings: HeceSesDefaults,
        component: HeceSesSettings as any,
        promptBuilder: HeceSesPrompt as any
    },
    {
        id: 'kelime-bilgisi',
        title: 'Kelime Bilgisi',
        category: 'Anlam Bilgisi',
        description: 'Eş anlamlı, zıt anlamlı ve eş sesli kelimeler ile kelime dağarcığı geliştirme stüdyosu.',
        icon: 'fa-solid fa-spell-check',
        defaultSettings: KelimeBilgisiDefaults,
        component: KelimeBilgisiSettings as any,
        promptBuilder: KelimeBilgisiPrompt as any
    }
];

export const getTemplateById = (id: string) => {
    return SUPER_STUDIO_REGISTRY.find(t => t.id === id);
};
