
import React from 'react';
import { useReadingStore } from '../../../store/useReadingStore';

export const AIProductionPanel = () => {
    const { config, setConfig, _isLoading } = useReadingStore();

    const update = (updates: Partial<typeof config>) => setConfig({ ...config, ...updates });

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Tematik İçerik</h4>
                <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">Konu / Tema</label>
                    <textarea
                        value={config.topic}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update({ topic: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700/50 rounded-xl p-3 text-xs text-white min-h-[80px] focus:border-indigo-500/50 transition-all"
                        placeholder="Örn: Ormanda kaybolan bir yavru sincabın arkadaşlarıyla yardımlaşarak yolunu bulması..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">Tür</label>
                        <select value={config.genre} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update({ genre: e.target.value })} className="w-full bg-zinc-900 border border-zinc-700/50 rounded-xl p-3 text-xs text-white">
                            {['Macera', 'Masal', 'Gizem', 'Bilim Kurgu', 'Sosyal Öykü', 'Fabl'].map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">Anlatım Tonu</label>
                        <select value={config.tone} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update({ tone: e.target.value })} className="w-full bg-zinc-900 border border-zinc-700/50 rounded-xl p-3 text-xs text-white">
                            {['Eğlenceli', 'Eğitici', 'Merak Uyandırıcı', 'Dramatik', 'Sakin'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Klinik & Pedagojik Odak</h4>

                <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5 font-mono">Ses/Harf Odağı (Müdahale)</label>
                    <input
                        type="text"
                        value={config.phonemeFocus || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ phonemeFocus: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700/50 rounded-xl p-3 text-xs text-white font-mono placeholder:opacity-30"
                        placeholder="Örn: b-d, s-z, p-b"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => update({ syllableFocus: !config.syllableFocus })}
                        className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-tight transition-all ${config.syllableFocus ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                    >
                        <i className="fa-solid fa-layer-group mr-2"></i>
                        Heceleme Modu
                    </button>
                    <select value={config.textComplexity} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update({ textComplexity: e.target.value as any })} className="w-full bg-zinc-900 border border-zinc-700/50 rounded-xl p-3 text-xs text-white">
                        <option value="simple">Basit Yapı</option>
                        <option value="moderate">Standart</option>
                        <option value="advanced">Zengin Dil</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Bilişsel Görevler</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">5N1K</label>
                        <input type="number" min="0" max="6" value={config.include5N1K ? 6 : 0} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ include5N1K: parseInt(e.target.value) > 0 })} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">Mantık</label>
                        <input type="number" min="0" max="3" value={config.countLogic} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ countLogic: parseInt(e.target.value) })} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white" />
                    </div>
                </div>
                {config.countLogic > 0 && (
                    <div className="flex items-center gap-2 bg-zinc-800/50 p-2 rounded-xl border border-zinc-800">
                        <span className="text-[8px] font-bold text-zinc-500 uppercase shrink-0">Mantık Zorluğu:</span>
                        {['Easy', 'Medium', 'Hard'].map(lvl => (
                            <button
                                key={lvl}
                                onClick={() => update({ logicDifficulty: lvl as any })}
                                className={`flex-1 py-1 rounded text-[8px] font-black transition-all ${config.logicDifficulty === lvl ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}
                            >
                                {lvl === 'Easy' ? 'KOLAY' : lvl === 'Medium' ? 'ORTA' : 'ZOR'}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
