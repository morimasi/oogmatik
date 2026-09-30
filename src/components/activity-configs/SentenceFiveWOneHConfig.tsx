import React from 'react';
import { GeneratorOptions } from '../../types';

interface ToggleOption {
    value: string | number;
    label: string;
}

interface CompactToggleGroupProps {
    label: string;
    selected: string | number;
    onChange: (value: string | number) => void;
    options: ToggleOption[];
}

const CompactToggleGroup: React.FC<CompactToggleGroupProps> = ({ label, selected, onChange, options }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase block">{label}</label>
        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)]">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] shadow-sm text-[var(--accent-color)] dark:text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-[var(--text-secondary)]'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

interface ConfigProps {
    options: GeneratorOptions;
    onChange: (key: keyof GeneratorOptions, value: unknown) => void;
}

/**
 * Cümlede 5N1K - Ultra Profesyonel Ayar Paneli
 */
export const SentenceFiveWOneHConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-[var(--accent-muted)] dark:bg-[var(--accent-muted)] rounded-[2rem] border border-[var(--border-color)] dark:border-[var(--accent-color)] space-y-4">
                <div>
                    <label className="text-[10px] font-black text-[var(--accent-color)] dark:text-[var(--accent-color)] uppercase tracking-widest mb-2 block">Özel Tema / Konu Odaklı</label>
                    <input
                        type="text"
                        value={options.topic || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('topic', e.target.value)}
                        placeholder="Örn: Orman macerası, Robotlar, Bilim..."
                        className="w-full p-4 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] rounded-2xl text-sm font-bold outline-none focus:border-[var(--accent-color)] text-[var(--text-primary)] placeholder-zinc-400 shadow-inner"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Cümle Sayısı</label>
                        <input
                            type="number"
                            min={1}
                            max={20}
                            value={options.itemCount || 5}
                            onChange={(e) => onChange('itemCount', parseInt(e.target.value))}
                            className="w-full p-3 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Yaş Grubu</label>
                        <select
                            value={options.ageGroup || '8-10'}
                            onChange={(e) => onChange('ageGroup', e.target.value)}
                            className="w-full p-3 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold"
                        >
                            <option value="5-7">5-7 Yaş</option>
                            <option value="8-10">8-10 Yaş</option>
                            <option value="11-13">11-13 Yaş</option>
                            <option value="14+">14+ Yaş</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] space-y-5 shadow-inner">
                <CompactToggleGroup
                    label="Zorluk Seviyesi"
                    selected={options.difficulty || 'Orta'}
                    onChange={(v) => onChange('difficulty', v)}
                    options={[
                        { value: 'Kolay', label: 'Basit' },
                        { value: 'Orta', label: 'Standart' },
                        { value: 'Zor', label: 'Karmaşık' }
                    ]}
                />

                <div className="grid grid-cols-1 gap-4">
                     <CompactToggleGroup
                        label="Cümle Karmaşıklığı"
                        selected={((options as Record<string, unknown>).complexity as string) || 'birleşik'}
                        onChange={(v) => onChange('complexity', v)}
                        options={[
                            { value: 'basit', label: 'Basit' },
                            { value: 'birleşik', label: 'Birleşik' },
                            { value: 'karmasik', label: 'Karmaşık' }
                        ]}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase block">Pedagojik Profil Odaklı</label>
                    <select
                        value={((options as Record<string, unknown>).profile as string) || 'dyslexia'}
                        onChange={(e) => onChange('profile', e.target.value)}
                        className="w-full p-4 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] rounded-2xl text-xs font-bold shadow-sm outline-none focus:border-[var(--accent-color)]"
                    >
                        <option value="dyslexia">Disleksi (Kısa & Net)</option>
                        <option value="adhd">DEHB (Dinamik & İlgi Çekici)</option>
                        <option value="dyscalculia">Diskalkuli (Sayısal Olmayan)</option>
                    </select>
                </div>

                <div className="space-y-4 pt-2 border-t border-[var(--border-color)]">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-[var(--text-primary)]">Kompakt Yerleşim</span>
                            <span className="text-[10px] text-[var(--text-muted)]">A4'e sığır, boşlukları azaltır.</span>
                        </div>
                        <button 
                            onClick={() => onChange('compact', !(options as Record<string, unknown>).compact)}
                            className={`w-12 h-6 rounded-full transition-all relative ${(options as Record<string, unknown>).compact ? 'bg-[var(--accent-color)]' : 'bg-[var(--surface-elevated)]'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-[var(--bg-paper)] rounded-full transition-all ${(options as Record<string, unknown>).compact ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-[var(--text-primary)]">Görsel İkonlar</span>
                            <span className="text-[10px] text-[var(--text-muted)]">Sorularda yardımcı ikonlar kullanır.</span>
                        </div>
                        <button 
                            onClick={() => onChange('useIcons', !options.useIcons)}
                            className={`w-12 h-6 rounded-full transition-all relative ${options.useIcons ? 'bg-[var(--accent-color)]' : 'bg-[var(--surface-elevated)]'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-[var(--bg-paper)] rounded-full transition-all ${options.useIcons ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-[var(--text-primary)]">Yüklemi Göster</span>
                            <span className="text-[10px] text-[var(--text-muted)]">Soruların yanına cümlenin yüklemini ekler.</span>
                        </div>
                        <button 
                            onClick={() => onChange('showPredicate', !(options as Record<string, unknown>).showPredicate)}
                            className={`w-12 h-6 rounded-full transition-all relative ${(options as Record<string, unknown>).showPredicate ? 'bg-[var(--accent-color)]' : 'bg-[var(--surface-elevated)]'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-[var(--bg-paper)] rounded-full transition-all ${(options as Record<string, unknown>).showPredicate ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-[var(--accent-muted)] dark:bg-[var(--accent-color)] rounded-[1.5rem] border border-[var(--border-color)] dark:border-[var(--accent-color)]">
                    <div className="w-8 h-8 bg-[var(--accent-color)] rounded-xl flex items-center justify-center text-[var(--text-primary)] shadow-lg">
                        <i className="fa-solid fa-crown text-xs"></i>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[var(--accent-color)] dark:text-[var(--accent-color)] uppercase tracking-tighter">Ultra Premium Mod Aktif</span>
                        <span className="text-[9px] text-[var(--text-muted)] text-[var(--text-primary)]">En yüksek AI kalitesi ve yoğun içerik.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
