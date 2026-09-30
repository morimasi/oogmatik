import React from 'react';
import { GeneratorOptions } from '../../types';
import {
    ConfigSection,
    SectionTitle,
    ConfigInput,
    ConfigGridButton,
    ConfigRadioCard,
    CompactSlider,
    CompactToggleGroup,
    ConfigColorDot,
    ConfigToggleRow
} from './SharedConfigComponents';

// ─── Sabit Veriler ──────────────────────────────────────────────────────────

const CATEGORIES = [
    { id: 'günlük_yaşam', label: 'Günlük Yaşam', icon: 'fa-house-chimney' },
    { id: 'matematik',    label: 'Matematik',    icon: 'fa-calculator'    },
    { id: 'fen',          label: 'Fen',          icon: 'fa-flask'         },
    { id: 'sosyal',       label: 'Sosyal',       icon: 'fa-people-group'  },
    { id: 'teknoloji',    label: 'Teknoloji',    icon: 'fa-microchip'     },
] as const;

const ALGORITHM_TYPES = [
    {
        id: 'lineer',
        label: 'Lineer',
        desc: 'Adım adım düz akış',
        icon: 'fa-arrow-down',
        color: 'bg-gradient-to-br from-indigo-500 to-blue-500',
    },
    {
        id: 'dallanmalı',
        label: 'Dallanmalı',
        desc: 'Karar noktaları ile',
        icon: 'fa-code-branch',
        color: 'bg-gradient-to-br from-amber-500 to-orange-500',
    },
    {
        id: 'döngüsel',
        label: 'Döngüsel',
        desc: 'Tekrar eden döngü',
        icon: 'fa-rotate',
        color: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    },
    {
        id: 'paralel',
        label: 'Paralel',
        desc: 'Eş zamanlı süreçler',
        icon: 'fa-grip-lines-vertical',
        color: 'bg-gradient-to-br from-violet-500 to-purple-500',
    },
] as const;

const COLOR_THEMES = [
    { id: 'varsayılan', label: 'Klasik',  dot: '#1e293b' },
    { id: 'okyanus',   label: 'Okyanus', dot: '#0ea5e9' },
    { id: 'orman',     label: 'Orman',   dot: '#22c55e' },
    { id: 'şeker',     label: 'Şeker',   dot: '#ec4899' },
] as const;

const AGE_GROUPS = ['5-7', '8-10', '11-13', '14+'] as const;

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

export const AlgorithmConfig = ({
    options,
    onChange,
}: {
    options: GeneratorOptions;
    onChange: (k: string, v: unknown) => void;
}) => {
    const stepCount: number     = (options.stepCount as number)     ?? 6;
    const showHints: boolean    = (options.showHints as boolean)    ?? true;
    const showTime: boolean     = (options.showTime as boolean)     ?? false;
    const showSubSteps: boolean = (options.showSubSteps as boolean) ?? false;
    const colorTheme: string    = (options.colorTheme as string)    ?? 'varsayılan';
    const ageGroup: string      = (options.ageGroup as string)      ?? '8-10';
    const category: string      = (options.category as string)      ?? 'günlük_yaşam';
    const algorithmType: string = (options.algorithmType as string) ?? 'lineer';

    return (
        <div className="space-y-4 animate-in fade-in duration-300 font-lexend">

            {/* ── Sistem Senaryosu ── */}
            <ConfigSection icon="fa-pen-nib" label="Sistem Senaryosu" accent>
                <ConfigInput
                    value={options.topic || ''}
                    onChange={(v) => onChange('topic', v)}
                    placeholder="Örn: Kek Yapımı, Robot Kontrol..."
                />
            </ConfigSection>

            {/* ── Konu Kategorisi ── */}
            <ConfigSection icon="fa-layer-group" label="Konu Kategorisi">
                <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => (
                        <ConfigGridButton
                            key={cat.id}
                            isActive={category === cat.id}
                            onClick={() => onChange('category', cat.id)}
                            icon={cat.icon}
                            label={cat.label}
                        />
                    ))}
                </div>
            </ConfigSection>

            {/* ── Algoritma Tipi ── */}
            <ConfigSection icon="fa-diagram-project" label="Algoritma Tipi">
                <div className="grid grid-cols-2 gap-2">
                    {ALGORITHM_TYPES.map(at => (
                        <ConfigRadioCard
                            key={at.id}
                            isActive={algorithmType === at.id}
                            onClick={() => onChange('algorithmType', at.id)}
                            icon={at.icon}
                            label={at.label}
                            description={at.desc}
                            gradient={at.color}
                        />
                    ))}
                </div>
            </ConfigSection>

            {/* ── Adım Sayısı Slider ── */}
            <ConfigSection icon="fa-list-ol" label={`Adım Sayısı — ${stepCount}`}>
                <CompactSlider
                    label="Adım"
                    min={4}
                    max={12}
                    value={stepCount}
                    onChange={(v) => onChange('stepCount', v)}
                />
                <div className="flex justify-between text-[8px] text-[var(--text-muted)] font-black mt-1 px-0.5">
                    <span>4 (Kolay)</span>
                    <span>8 (Orta)</span>
                    <span>12 (Derin)</span>
                </div>
            </ConfigSection>

            {/* ── Mantıksal Derinlik ── */}
            <ConfigSection icon="fa-brain" label="Mantıksal Derinlik">
                <CompactToggleGroup
                    label=""
                    selected={(options.difficulty as string) || 'Başlangıç'}
                    onChange={(v) => onChange('difficulty', v)}
                    options={[
                        { value: 'Başlangıç', label: 'Lineer' },
                        { value: 'Orta', label: 'Karar Destekli' },
                        { value: 'Zor', label: 'Karmaşık' }
                    ]}
                />
            </ConfigSection>

            {/* ── Yaş Grubu ── */}
            <ConfigSection icon="fa-user-graduate" label="Yaş Grubu">
                <div className="flex gap-2">
                    {AGE_GROUPS.map(ag => (
                        <button
                            key={ag}
                            type="button"
                            onClick={() => onChange('ageGroup', ag)}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all duration-200 ${
                                ageGroup === ag
                                    ? 'bg-[var(--accent-color)] text-[var(--text-primary)] shadow-lg'
                                    : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] border border-[var(--border-color)]'
                            }`}
                        >
                            {ag}
                        </button>
                    ))}
                </div>
            </ConfigSection>

            {/* ── Renk Teması ── */}
            <ConfigSection icon="fa-palette" label="Renk Teması">
                <div className="flex gap-2">
                    {COLOR_THEMES.map(theme => (
                        <ConfigColorDot
                            key={theme.id}
                            isActive={colorTheme === theme.id}
                            onClick={() => onChange('colorTheme', theme.id)}
                            label={theme.label}
                            dotColor={theme.dot}
                        />
                    ))}
                </div>
            </ConfigSection>

            {/* ── Gelişmiş Seçenekler ── */}
            <ConfigSection icon="fa-sliders" label="Gelişmiş Seçenekler">
                <ConfigToggleRow
                    icon="💡"
                    label="İpucu Balonları"
                    description="Disleksi dostu adım ipuçları"
                    checked={showHints}
                    onChange={(v) => onChange('showHints', v)}
                />
                <ConfigToggleRow
                    icon="⏱️"
                    label="Zaman Tahmini"
                    description="Her adımda dakika rozeti (DEHB desteği)"
                    checked={showTime}
                    onChange={(v) => onChange('showTime', v)}
                />
                <ConfigToggleRow
                    icon="📋"
                    label="Alt Adımlar"
                    description="Süreç adımlarında detaylı liste"
                    checked={showSubSteps}
                    onChange={(v) => onChange('showSubSteps', v)}
                />
            </ConfigSection>

        </div>
    );
};
