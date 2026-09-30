import React from 'react';
import { GeneratorOptions } from '../../types';
import {
    ConfigSection,
    ConfigInput,
    ConfigSelect,
    CompactToggleGroup,
    ConfigCheckbox
} from './SharedConfigComponents';

interface ConfigProps {
    options: GeneratorOptions;
    onChange: (key: keyof GeneratorOptions, value: unknown) => void;
}

/**
 * Eksik Parçaları Tamamlama - Ultra Profesyonel Ayar Paneli (Tema Uyumlu)
 */
export const MissingPartsConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300 font-lexend">
            {/* TEMEL AYARLAR */}
            <ConfigSection icon="fa-circle-info" label="Temal Ayarlar" accent>
                <ConfigInput
                    label="Metin Teması"
                    value={options.topic || ''}
                    onChange={(v) => onChange('topic', v)}
                    placeholder="Örn: Uzay yolculuğu, Deniz altı dünyası, Hayvanlar..."
                />

                <div className="grid grid-cols-3 gap-3">
                    <ConfigSelect
                        label="Zorluk"
                        value={(options.difficulty as string) || 'Orta'}
                        onChange={(v) => onChange('difficulty', v)}
                        options={[
                            { value: 'çok kolay', label: 'Çok Kolay' },
                            { value: 'kolay', label: 'Kolay' },
                            { value: 'Orta', label: 'Orta' },
                            { value: 'Zor', label: 'Zor' },
                            { value: 'uzman', label: 'Uzman' },
                        ]}
                    />
                    <ConfigSelect
                        label="Yaş"
                        value={(options.ageGroup as string) || '8-10'}
                        onChange={(v) => onChange('ageGroup', v)}
                        options={[
                            { value: '5-7', label: '5-7' },
                            { value: '8-10', label: '8-10' },
                            { value: '11-13', label: '11-13' },
                            { value: '14+', label: '14+' },
                        ]}
                    />
                    <ConfigSelect
                        label="Sınıf"
                        value={String(options.gradeLevel || 3)}
                        onChange={(v) => onChange('gradeLevel', parseInt(v, 10))}
                        options={[1, 2, 3, 4, 5, 6, 7, 8].map(g => ({ value: String(g), label: `${g}. Sınıf` }))}
                    />
                </div>
            </ConfigSection>

            {/* ÜRETİM MODU */}
            <ConfigSection icon="fa-bolt" label="Üretim Modu">
                <CompactToggleGroup
                    label="Mod Seçimi"
                    selected={(options.mode as string) || 'ai'}
                    onChange={(v: string) => onChange('mode', v)}
                    options={[
                        { value: 'fast', label: 'Hızlı' },
                        { value: 'ai', label: 'AI' }
                    ]}
                />
            </ConfigSection>

            {/* BOŞLUK AYARLARI */}
            <ConfigSection icon="fa-eraser" label="Boşluk Ayarları">
                <div className="grid grid-cols-2 gap-3">
                    <ConfigSelect
                        label="Boşluk Türü"
                        value={(options.blankType as string) || 'word'}
                        onChange={(v) => onChange('blankType', v)}
                        options={[
                            { value: 'word', label: 'Kelime' },
                            { value: 'phrase', label: 'Kelime Grubu' },
                            { value: 'sentence', label: 'Cümle' },
                            { value: 'number', label: 'Sayı' },
                        ]}
                    />
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block ml-1">Boşluk Sayısı</label>
                        <input
                            type="number"
                            min={5}
                            max={25}
                            value={options.blankCount || 10}
                            onChange={(e) => onChange('blankCount', parseInt(e.target.value, 10))}
                            className="w-full p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <ConfigSelect
                        label="Boşluk Boyutu"
                        value={(options.blankSize as string) || 'medium'}
                        onChange={(v) => onChange('blankSize', v)}
                        options={[
                            { value: 'small', label: 'Küçük' },
                            { value: 'medium', label: 'Orta' },
                            { value: 'large', label: 'Büyük' },
                        ]}
                    />
                    <ConfigSelect
                        label="Boşluk Stili"
                        value={(options.blankStyle as string) || 'underline'}
                        onChange={(v) => onChange('blankStyle', v)}
                        options={[
                            { value: 'underline', label: 'Alt Çizgi' },
                            { value: 'dashed', label: 'Kesik Çizgi' },
                            { value: 'solid', label: 'Dolu' },
                            { value: 'dotted', label: 'Nokta' },
                        ]}
                    />
                </div>

                <div className="space-y-3 pt-3 border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-key text-[var(--accent-color)] text-sm"></i>
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Kelime Havuzu</span>
                    </div>

                    <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                        <ConfigCheckbox
                            checked={options.showWordBank !== false}
                            onChange={(v) => onChange('showWordBank', v)}
                            label="Kelime Havuzu Göster"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] flex items-center">
                            <ConfigCheckbox
                                checked={options.includeDistractors !== false}
                                onChange={(v) => onChange('includeDistractors', v)}
                                label="Çeldirici Ekle"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase">Sayısı:</label>
                            <input
                                type="number"
                                min={1}
                                max={10}
                                value={options.distractorCount || 4}
                                onChange={(e) => onChange('distractorCount', parseInt(e.target.value, 10))}
                                className="flex-1 p-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[9px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-palette text-[var(--accent-color)] text-sm"></i>
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Görsel & Düzen</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { key: 'compactLayout', label: 'Kompakt Layout' },
                            { key: 'useIcons', label: 'İkon Kullan' },
                            { key: 'showReadingRuler', label: 'Okuma Cetveli' },
                            { key: 'syllableColoring', label: 'Hece Renklendirme' },
                            { key: 'showVisualHints', label: 'Görsel İpuçları' },
                            { key: 'showExamples', label: 'Örnek Göster' }
                        ].map(({ key, label }) => (
                            <div key={key} className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                                <ConfigCheckbox
                                    checked={options[key as keyof GeneratorOptions] !== false}
                                    onChange={(v) => onChange(key as keyof GeneratorOptions, v)}
                                    label={label}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <ConfigSelect
                            label="Font"
                            value={(options.fontSize as string) || 'medium'}
                            onChange={(v) => onChange('fontSize', v)}
                            options={[
                                { value: 'small', label: 'Küçük' },
                                { value: 'medium', label: 'Orta' },
                                { value: 'large', label: 'Büyük' },
                            ]}
                        />
                        <ConfigSelect
                            label="Satır"
                            value={(options.lineHeight as string) || 'normal'}
                            onChange={(v) => onChange('lineHeight', v)}
                            options={[
                                { value: 'tight', label: 'Sık' },
                                { value: 'normal', label: 'Normal' },
                                { value: 'relaxed', label: 'Geniş' },
                            ]}
                        />
                        <ConfigSelect
                            label="Sütun"
                            value={(options.columnLayout as string) || 'single'}
                            onChange={(v) => onChange('columnLayout', v)}
                            options={[
                                { value: 'single', label: 'Tek' },
                                { value: 'two-column', label: 'İki' },
                            ]}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-[var(--accent-muted)] rounded-[1.5rem] border border-[var(--accent-color)]/20">
                    <div className="w-8 h-8 bg-[var(--accent-color)] rounded-xl flex items-center justify-center text-[var(--text-primary)] shadow-lg">
                        <i className="fa-solid fa-puzzle-piece text-xs"></i>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-tighter">
                            Ultra Pro Cloze
                        </span>
                        <span className="text-[9px] text-[var(--text-muted)]">
                            Okuma akıcılığı ve bağlam analisti. Tamamen özelleştirilebilir.
                        </span>
                    </div>
                </div>
            </ConfigSection>
        </div>
    );
};
