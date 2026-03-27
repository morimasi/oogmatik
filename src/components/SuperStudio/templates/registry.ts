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
        defaultSettings: OkumaAnlama.DEFAULT_SETTINGS || {
            cognitiveLoadLimit: 12,
            chunkingEnabled: true,
            visualScaffolding: true,
            typographicHighlight: true,
            mindMap5N1K: true,
            questionCount: 4
        },
        component: OkumaAnlama.Settings,
        promptBuilder: OkumaAnlama.promptBuilder
    },
    {
        id: 'dil-bilgisi',
        title: 'Dil Bilgisi & Yazım',
        category: 'Dil Bilgisi',
        description: 'Ayna harfler (b/d, p/q) ve harf farkındalığı odaklı dil bilgisi çalışmaları.',
        icon: 'fa-solid fa-spell-check',
        defaultSettings: DilBilgisi.DEFAULT_SETTINGS || {
            targetDistractors: 'b-d',
            gridSize: '4x4',
            syllableSimulation: true,
            camouflageGrid: true,
            hintBox: true
        },
        component: DilBilgisi.Settings,
        promptBuilder: DilBilgisi.promptBuilder
    },
    {
        id: 'mantik-muhakeme',
        title: 'Mantık Muhakeme',
        category: 'Bilişsel Gelişim',
        description: 'Sıralama, sözel matris ve dedektiflik oyunlarıyla üst düzey mantık becerileri.',
        icon: 'fa-solid fa-puzzle-piece',
        defaultSettings: MantikMuhakeme.DEFAULT_SETTINGS || {
            sequenceSteps: 4,
            matrixSize: '3x3',
            logicMatrix: true,
            detailDetective: true
        },
        component: MantikMuhakeme.Settings,
        promptBuilder: MantikMuhakeme.promptBuilder
    },
    {
        id: 'yaratici-yazarlik',
        title: 'Yaratıcı Yazarlık',
        category: 'Yazma Becerileri',
        description: 'Hikaye zarları ve duygu radarı ile eğlenceli, oyunlaştırılmış yazma stüdyosu.',
        icon: 'fa-solid fa-pen-nib',
        defaultSettings: YaraticiYazarlik.DEFAULT_SETTINGS || {
            storyDiceCount: 3,
            clozeFormat: 'none',
            minSentences: 5,
            emotionRadar: true
        },
        component: YaraticiYazarlik.Settings,
        promptBuilder: YaraticiYazarlik.promptBuilder
    },
    {
        id: 'yazim-noktalama',
        title: 'Yazım & Noktalama',
        category: 'Yazma Becerileri',
        description: 'Hata dedektifi ve kural hatırlatıcılar ile noktalama işaretlerini ustalıkla öğrenme.',
        icon: 'fa-solid fa-quote-right',
        defaultSettings: YazimNoktalama.DEFAULT_SETTINGS || {
            ruleSelection: ['capitalization', 'punctuation'],
            errorDetectiveMode: true,
            clozeFormat: 'none',
            showRuleHints: true,
            itemCount: 8
        },
        component: YazimNoktalama.Settings,
        promptBuilder: YazimNoktalama.promptBuilder
    },
    {
        id: 'soz-varligi',
        title: 'Söz Varlığı (Deyim/Atasözü)',
        category: 'Anlam Bilgisi',
        description: 'Görsel analoji ve bağlam temelli deyim/atasözü farkındalık çalışmaları.',
        icon: 'fa-solid fa-language',
        defaultSettings: SozVarligi.DEFAULT_SETTINGS || {
            learningType: 'idioms',
            visualAnalogy: true,
            contextualUsage: true,
            synonymAntonymMatch: true,
            itemCount: 6
        },
        component: SozVarligi.Settings,
        promptBuilder: SozVarligi.promptBuilder
    },
    {
        id: 'hece-ses',
        title: 'Hece & Ses Olayları',
        category: 'Dil Bilgisi',
        description: 'Fonolojik farkındalık, heceleme kuralları ve ses olaylarını kavrama stüdyosu.',
        icon: 'fa-solid fa-wave-square',
        defaultSettings: HeceSes.DEFAULT_SETTINGS || {
            focusArea: 'syllable_splitting',
            multisensoryCues: true,
            phonemeManipulation: true,
            targetSoundChanges: ['softening', 'hardening'],
            itemCount: 10
        },
        component: HeceSes.Settings,
        promptBuilder: HeceSes.promptBuilder
    }
];

export const getTemplateById = (id: string) => {
    return SUPER_STUDIO_REGISTRY.find(t => t.id === id);
};
