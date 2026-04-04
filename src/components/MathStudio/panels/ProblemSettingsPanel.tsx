// Math Studio — AI Problem Settings Panel

import React from 'react';
import { MathProblemConfig } from '../../../types/math';

interface ProblemSettingsPanelProps {
    problemConfig: MathProblemConfig;
    setProblemConfig: (config: MathProblemConfig) => void;
    toggleProblemOp: (op: string) => void;
    toggleProblemType: (type: 'standard' | 'fill-in' | 'true-false' | 'comparison') => void;
    isGenerating: boolean;
    onGenerate: () => void;
}

export const ProblemSettingsPanel: React.FC<ProblemSettingsPanelProps> = ({
    problemConfig, setProblemConfig, toggleProblemOp, toggleProblemType, isGenerating, onGenerate,
}) => (
    <div className="p-5 space-y-6 animate-in slide-in-from-left-4">

        <div className="bg-gradient-to-br from-accent/20 to-accent/10 p-5 rounded-[1.5rem] border border-accent/30 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl shadow-inner border border-white/10">🤖</div>
                <div>
                    <h4 className="font-bold text-white text-sm">Akıllı Problem Motoru</h4>
                    <p className="text-[10px] text-white/70">Gelişmiş AI destekli özgün içerik.</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Topic */}
                <div>
                    <label className="text-[9px] font-bold text-white/70 uppercase mb-1.5 block">Konu</label>
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
                    <label className="text-[9px] font-bold text-white/70 uppercase mb-2 block">Hangi İşlemler?</label>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { id: 'add', label: '+' }, { id: 'sub', label: '-' }, { id: 'mult', label: 'x' }, { id: 'div', label: '÷' },
                        ].map(op => (
                            <button
                                key={op.id}
                                onClick={() => toggleProblemOp(op.id)}
                                className={`py-2 rounded-lg font-bold text-sm transition-all border ${problemConfig.selectedOperations.includes(op.id) ? 'bg-accent text-white border-accent/80 shadow-md' : 'bg-black/20 text-zinc-400 border-white/10 hover:bg-black/40 hover:text-white'}`}
                            >
                                {op.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid: Range + Count */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[9px] font-bold text-white/70 uppercase mb-1.5 block">Sayı Aralığı</label>
                        <select value={problemConfig.numberRange} onChange={e => setProblemConfig({ ...problemConfig, numberRange: e.target.value })} className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none font-bold">
                            {['1-10', '1-20', '1-50', '1-100', '100-1000'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-white/70 uppercase mb-1.5 block">Adet</label>
                        <select value={problemConfig.count} onChange={e => setProblemConfig({ ...problemConfig, count: Number(e.target.value) })} className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none font-bold">
                            {Array.from({ length: 20 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} Soru</option>)}
                        </select>
                    </div>
                </div>

                {/* Grid: Complexity + Style */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[9px] font-bold text-white/70 uppercase mb-1.5 block">Karmaşıklık</label>
                        <select value={problemConfig.complexity} onChange={e => setProblemConfig({ ...problemConfig, complexity: e.target.value as any })} className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none font-bold">
                            <option value="1-step">Tek İşlem</option>
                            <option value="2-step">İki Aşamalı</option>
                            <option value="multi-step">Çok Adımlı</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-white/70 uppercase mb-1.5 block">Kurgu Tarzı</label>
                        <select value={problemConfig.problemStyle} onChange={e => setProblemConfig({ ...problemConfig, problemStyle: e.target.value as any })} className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none font-bold">
                            <option value="simple">Kısa & Net</option>
                            <option value="story">Hikayeli</option>
                            <option value="logic">Mantık</option>
                        </select>
                    </div>
                </div>

                {/* Difficulty Focus */}
                <div>
                    <label className="text-[9px] font-bold text-white/70 uppercase mb-1.5 block">Pedagojik Zorluk Kalibrasyonu</label>
                    <div className="space-y-2">
                        {[
                            { level: 'Başlangıç', emoji: '🌱', desc: 'Tek Adım, Somut' },
                            { level: 'Temel', emoji: '📗', desc: '2 Adım, Günlük' },
                            { level: 'Orta', emoji: '📘', desc: 'Hikayeli, Orta' },
                            { level: 'İleri', emoji: '📕', desc: 'Mantık + Aritmetik' },
                            { level: 'Uzman', emoji: '🏆', desc: 'Stratejik, Tuzaklı' }
                        ].map(diff => (
                            <label key={diff.level} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-colors ${problemConfig.difficulty === diff.level ? 'bg-accent/20 border-accent' : 'bg-black/20 border-white/5 hover:border-white/20'}`}>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="difficulty"
                                        value={diff.level}
                                        checked={problemConfig.difficulty === diff.level}
                                        onChange={e => setProblemConfig({ ...problemConfig, difficulty: e.target.value })}
                                        className="w-4 h-4 text-accent bg-black/50 border-white/20 focus:ring-accent/5"
                                    />
                                    <span className="text-sm font-bold text-white">{diff.emoji} {diff.level}</span>
                                </div>
                                <span className="text-[10px] text-zinc-400 pr-2">{diff.desc}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Form fields exist below... */}
            </div>
        </div>

        <div className="space-y-2">
            {/* Visual Prompts Toggle */}
            <label className="flex items-center gap-3 p-4 bg-zinc-900 rounded-xl cursor-pointer border border-zinc-800 hover:border-accent/50 transition-colors">
                <input type="checkbox" checked={problemConfig.generateImages} onChange={e => setProblemConfig({ ...problemConfig, generateImages: e.target.checked })} className="w-5 h-5 rounded text-accent focus:ring-accent/5 bg-black border-zinc-700" />
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-300">İngilizce Görsel Desteği (imagePrompt)</span>
                    <span className="text-[10px] text-zinc-500">Kapak görselleri veya ipucu için DALL-E tarzı komut üret</span>
                </div>
            </label>

            {/* Solution box toggle */}
            <label className="flex items-center gap-3 p-4 bg-zinc-900 rounded-xl cursor-pointer border border-zinc-800 hover:border-accent/50 transition-colors">
                <input type="checkbox" checked={problemConfig.includeSolutionBox} onChange={e => setProblemConfig({ ...problemConfig, includeSolutionBox: e.target.checked })} className="w-5 h-5 rounded text-accent focus:ring-accent/5 bg-black border-zinc-700" />
                <span className="text-sm font-bold text-zinc-300">Çözüm ve İşlem Kutusu Ekle</span>
            </label>
        </div>
    </div>
);
