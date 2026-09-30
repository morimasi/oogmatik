
import React from 'react';
import { GeneratorOptions } from '../../types';

export const StoryStudioConfig: React.FC<{ options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-[var(--accent-muted)] dark:bg-[var(--accent-muted)] rounded-[2rem] border border-[var(--border-color)] dark:border-[var(--accent-color)] space-y-4">
                <div>
                    <label className="text-[10px] font-black text-[var(--accent-color)] uppercase mb-2 block tracking-widest">Hikaye Teması</label>
                    <input
                        type="text" value={options.topic || ''}
                        onChange={e => onChange('topic', e.target.value)}
                        placeholder="Örn: Uzay Maceraları, Çiftlik..."
                        className="w-full p-3 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--accent-color)] rounded-xl text-sm font-bold outline-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <select value={options.genre || 'Macera'} onChange={e => onChange('genre', e.target.value)} className="p-2 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[10px] font-bold">
                        <option>Macera</option><option>Masal</option><option>Fabl</option><option>Bilim Kurgu</option>
                    </select>
                    <select value={options.tone || 'Eğlenceli'} onChange={e => onChange('tone', e.target.value)} className="p-2 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[10px] font-bold">
                        <option>Eğlenceli</option><option>Öğretici</option><option>Gizemli</option>
                    </select>
                </div>
            </div>

            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] space-y-3">
                <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Dahil Edilecekler</h4>
                {[
                    { k: 'include5N1K', l: '5N 1K Analizi' },
                    { k: 'focusVocabulary', l: 'Sözlükçe (Kritik Kelimeler)' },
                    { k: 'includeCreativeTask', l: 'Yaratıcı Çizim/Yazma Görevi' }
                ].map(item => (
                    <div key={item.k} className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)]">{item.l}</span>
                        <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${(options as Record<string, unknown>)[item.k] !== false ? 'bg-[var(--accent-color)]' : 'bg-[var(--surface-elevated)]'}`} onClick={() => onChange(item.k as any, (options as Record<string, unknown>)[item.k] === false)}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-[var(--bg-paper)] rounded-full transition-all ${(options as Record<string, unknown>)[item.k] !== false ? 'left-4.5' : 'left-0.5'}`}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
