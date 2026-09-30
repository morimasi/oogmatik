
import React from 'react';
import { GeneratorOptions } from '../../types';

export const NumberPathLogicConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: string, v: unknown) => void }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-[var(--accent-muted)] dark:bg-[var(--accent-muted)] rounded-[2rem] border border-[var(--border-color)] dark:border-[var(--accent-color)]">
                <label className="text-[10px] font-black text-[var(--accent-color)] uppercase mb-3 block text-center tracking-widest">Zincir Uzunluğu</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { v: 2, l: 'Kısa (2 Adım)' },
                        { v: 3, l: 'Orta (3 Adım)' },
                        { v: 4, l: 'Uzun (4 Adım)' },
                        { v: 5, l: 'Zincir (5+)' }
                    ].map(t => (
                        <button
                            key={t.v}
                            onClick={() => onChange('codeLength', t.v)}
                            className={`py-2 px-1 rounded-xl text-[9px] font-black border transition-all ${options.codeLength === t.v ? 'bg-[var(--accent-color)] text-[var(--text-primary)] border-[var(--accent-color)] shadow-md' : 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)]'}`}
                        >
                            {t.l}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">İşlem Çeşitliliği</label>
                    <select
                        value={options.difficulty}
                        onChange={e => onChange('difficulty', e.target.value)}
                        className="w-full p-2 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-xs font-bold outline-none focus:border-[var(--accent-color)]"
                    >
                        <option value="Başlangıç">Sadece Toplama/Çıkarma (1-10)</option>
                        <option value="Orta">Dört İşlem Karışık (1-20)</option>
                        <option value="Zor">Büyük Sayılar (1-50)</option>
                        <option value="Uzman">Eksik Başlangıç Sayısı</option>
                    </select>
                </div>

                <div className="flex items-center justify-between p-1">
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase">Soru Sayısı</span>
                    <div className="flex gap-2">
                        {[6, 8, 10].map(n => (
                            <button key={n} onClick={() => onChange('itemCount', n)} className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-colors ${options.itemCount === n ? 'bg-[var(--bg-inset)] text-[var(--text-primary)]' : 'bg-[var(--surface-elevated)] text-[var(--text-muted)]'}`}>
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
