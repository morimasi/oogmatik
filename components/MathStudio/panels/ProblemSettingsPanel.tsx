// Math Studio — AI Problem Settings Panel

import React from 'react';
import { MathProblemConfig } from '../../../types/math';

interface ProblemSettingsPanelProps {
    problemConfig: MathProblemConfig;
    setProblemConfig: (config: MathProblemConfig) => void;
    toggleProblemOp: (op: string) => void;
    isGenerating: boolean;
    onGenerate: () => void;
}

export const ProblemSettingsPanel: React.FC<ProblemSettingsPanelProps> = ({
    problemConfig, setProblemConfig, toggleProblemOp, isGenerating, onGenerate,
}) => (
    <div className="p-5 space-y-6 animate-in slide-in-from-left-4">

        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-5 rounded-[1.5rem] border border-indigo-500/30 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl shadow-inner border border-white/10">🤖</div>
                <div>
                    <h4 className="font-bold text-white text-sm">Akıllı Problem Motoru</h4>
                    <p className="text-[10px] text-indigo-200">Tam kontrollü AI üretim.</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Topic */}
                <div>
                    <label className="text-[9px] font-bold text-indigo-300 uppercase mb-1.5 block">Konu</label>
                    <input
                        type="text"
                        value={problemConfig.topic}
                        onChange={e => setProblemConfig({ ...problemConfig, topic: e.target.value })}
                        className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-white/50 font-medium"
                        placeholder="Örn: Dinozorlar, Market..."
                    />
                </div>

                {/* Operations */}
                <div>
                    <label className="text-[9px] font-bold text-indigo-300 uppercase mb-2 block">Hangi İşlemler?</label>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { id: 'add', label: '+' }, { id: 'sub', label: '-' }, { id: 'mult', label: 'x' }, { id: 'div', label: '÷' },
                        ].map(op => (
                            <button
                                key={op.id}
                                onClick={() => toggleProblemOp(op.id)}
                                className={`py-2 rounded-lg font-bold text-sm transition-all border ${problemConfig.selectedOperations.includes(op.id) ? 'bg-indigo-500 text-white border-indigo-400 shadow-md' : 'bg-black/20 text-zinc-400 border-white/10 hover:bg-black/40 hover:text-white'}`}
                            >
                                {op.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid: Range + Count */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[9px] font-bold text-indigo-300 uppercase mb-1.5 block">Sayı Aralığı</label>
                        <select value={problemConfig.numberRange} onChange={e => setProblemConfig({ ...problemConfig, numberRange: e.target.value })} className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none font-bold">
                            {['1-10', '1-20', '1-50', '1-100', '100-1000'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-indigo-300 uppercase mb-1.5 block">Adet</label>
                        <select value={problemConfig.count} onChange={e => setProblemConfig({ ...problemConfig, count: Number(e.target.value) })} className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none font-bold">
                            {Array.from({ length: 20 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} Soru</option>)}
                        </select>
                    </div>
                </div>

                {/* Grid: Complexity + Style */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[9px] font-bold text-indigo-300 uppercase mb-1.5 block">Karmaşıklık</label>
                        <select value={problemConfig.complexity} onChange={e => setProblemConfig({ ...problemConfig, complexity: e.target.value as any })} className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none font-bold">
                            <option value="1-step">Tek İşlem</option>
                            <option value="2-step">İki Aşamalı</option>
                            <option value="multi-step">Çok Adımlı</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-indigo-300 uppercase mb-1.5 block">Kurgu Tarzı</label>
                        <select value={problemConfig.problemStyle} onChange={e => setProblemConfig({ ...problemConfig, problemStyle: e.target.value as any })} className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none font-bold">
                            <option value="simple">Kısa & Net</option>
                            <option value="story">Hikayeli</option>
                            <option value="logic">Mantık</option>
                        </select>
                    </div>
                </div>

                {/* Difficulty */}
                <div>
                    <label className="text-[9px] font-bold text-indigo-300 uppercase mb-1.5 block">Zorluk Seviyesi</label>
                    <select value={problemConfig.difficulty} onChange={e => setProblemConfig({ ...problemConfig, difficulty: e.target.value })} className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none font-bold">
                        <option value="Başlangıç">🌱 Başlangıç</option>
                        <option value="Temel">📗 Temel</option>
                        <option value="Orta">📘 Orta</option>
                        <option value="İleri">📕 İleri</option>
                        <option value="Uzman">🏆 Uzman</option>
                    </select>
                </div>

                {/* Generate Button */}
                <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="w-full py-3.5 bg-white text-indigo-900 font-black rounded-xl text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-3"
                >
                    {isGenerating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                    {isGenerating ? 'Düşünülüyor...' : 'Problemleri Yaz'}
                </button>
            </div>
        </div>

        {/* Solution box toggle */}
        <label className="flex items-center gap-3 p-4 bg-zinc-900 rounded-xl cursor-pointer border border-zinc-800 hover:border-indigo-500/50 transition-colors">
            <input type="checkbox" checked={problemConfig.includeSolutionBox} onChange={e => setProblemConfig({ ...problemConfig, includeSolutionBox: e.target.checked })} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-black border-zinc-700" />
            <span className="text-sm font-bold text-zinc-300">Çözüm ve İşlem Kutusu Ekle</span>
        </label>
    </div>
);
