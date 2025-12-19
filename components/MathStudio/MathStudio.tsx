
import React, { useState, useRef, useEffect } from 'react';
import { MathStudioConfig, MathStudioData, ActivityType } from '../../types';
import { generateMathProblemsAI } from '../../services/generators/mathStudio';
import { generateMathStudioOffline } from '../../services/offlineGenerators/mathStudio';
import { useAuth } from '../../context/AuthContext';
import { printService } from '../../utils/printService';
import { worksheetService } from '../../services/worksheetService';
import { PedagogicalHeader } from '../sheets/common';
import { ShareModal } from '../ShareModal';

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

export const MathStudio: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [mode, setMode] = useState<'ai' | 'fast'>('fast');
    
    const [config, setConfig] = useState<MathStudioConfig>({
        gradeLevel: '3. Sınıf', studentName: '',
        operations: ['add', 'sub'], isMixed: true,
        allowCarry: true, allowBorrow: true, allowRemainder: false, findUnknown: false,
        num1Digits: 2, num2Digits: 2,
        includeProblems: false, problemCount: 3, problemSteps: 1, problemTopic: 'Market Alışverişi',
        layoutMode: 'standard', itemCount: 20
    });

    const [data, setData] = useState<MathStudioData | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const offlineData = generateMathStudioOffline(config);
            if (mode === 'ai' && (config.includeProblems)) {
                const aiData = await generateMathProblemsAI(config);
                setData({ ...offlineData, ...aiData, operations: offlineData.operations });
            } else {
                setData(offlineData);
            }
            setIsSaved(false);
        } catch (e) {
            alert("Hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user || !data) return;
        setIsSaving(true);
        try {
            await worksheetService.saveWorksheet(
                user.id, data.title, ActivityType.MATH_STUDIO, [data], 'fa-solid fa-calculator', { id: 'math', title: 'Matematik' }
            );
            setIsSaved(true);
        } finally { setIsSaving(false); }
    };

    const handlePrint = (action: 'print' | 'download') => {
        printService.generatePdf('#math-canvas', data?.title || 'Matematik', { action });
    };

    return (
        <div className="h-full flex flex-col bg-[#1a1a1d] text-zinc-100 overflow-hidden font-sans">
            {/* Top Bar */}
            <div className="h-14 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center px-4 shrink-0 z-50">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="w-8 h-8 rounded hover:bg-zinc-800 flex items-center justify-center text-zinc-400"><i className="fa-solid fa-arrow-left"></i></button>
                    <span className="font-black text-sm uppercase tracking-widest text-blue-500">MATH Studio <span className="bg-blue-500/20 text-blue-500 px-1 rounded text-[9px] border border-blue-500/50">PRO</span></span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handlePrint('download')} className="p-2 hover:bg-zinc-800 rounded"><i className="fa-solid fa-file-pdf"></i></button>
                    <button onClick={() => setIsShareModalOpen(true)} className="p-2 hover:bg-zinc-800 rounded"><i className="fa-solid fa-share-nodes"></i></button>
                    <button onClick={handleSave} disabled={isSaving || isSaved} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isSaved ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                        {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : isSaved ? 'Kaydedildi' : 'Arşive Kaydet'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
                    <div className="p-4 space-y-6">
                        {/* Mode Switch */}
                        <div>
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Üretim Modu</label>
                            <div className="flex bg-black p-1 rounded-xl">
                                <button onClick={() => setMode('fast')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'fast' ? 'bg-zinc-800 text-blue-400 shadow-lg' : 'text-zinc-500'}`}>HIZLI (İşlem)</button>
                                <button onClick={() => setMode('ai')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'ai' ? 'bg-zinc-800 text-indigo-400 shadow-lg' : 'text-zinc-500'}`}>AI (Problem)</button>
                            </div>
                        </div>

                        {/* Operations */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">İşlem Ayarları</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['add', 'sub', 'mult', 'div'].map(op => (
                                    <button 
                                        key={op} 
                                        onClick={() => setConfig(prev => ({ ...prev, operations: prev.operations.includes(op as any) ? prev.operations.filter(x => x !== op) : [...prev.operations, op as any] }))}
                                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${config.operations.includes(op as any) ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
                                    >
                                        {op === 'add' ? 'Toplama (+)' : op === 'sub' ? 'Çıkarma (-)' : op === 'mult' ? 'Çarpma (x)' : 'Bölme (÷)'}
                                    </button>
                                ))}
                            </div>
                            <div className="space-y-2 mt-4">
                                <label className="flex items-center justify-between text-xs cursor-pointer group">
                                    <span className="text-zinc-400">Eldeli / Onluk Bozmalı</span>
                                    <input type="checkbox" checked={config.allowCarry} onChange={e => setConfig({...config, allowCarry: e.target.checked, allowBorrow: e.target.checked})} className="accent-blue-500" />
                                </label>
                                <label className="flex items-center justify-between text-xs cursor-pointer group">
                                    <span className="text-zinc-400">Kalanlı Bölme</span>
                                    <input type="checkbox" checked={config.allowRemainder} onChange={e => setConfig({...config, allowRemainder: e.target.checked})} className="accent-blue-500" />
                                </label>
                                <label className="flex items-center justify-between text-xs cursor-pointer group">
                                    <span className="text-zinc-400">Bilinmeyen Sayıyı Bulma</span>
                                    <input type="checkbox" checked={config.findUnknown} onChange={e => setConfig({...config, findUnknown: e.target.checked})} className="accent-blue-500" />
                                </label>
                            </div>
                        </div>

                        {/* Problems */}
                        <div className="pt-4 border-t border-zinc-800 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Problem Çözme</label>
                                <input type="checkbox" checked={config.includeProblems} onChange={e => setConfig({...config, includeProblems: e.target.checked})} className="accent-indigo-500" />
                            </div>
                            {config.includeProblems && (
                                <div className="space-y-3 animate-in slide-in-from-top-2">
                                    <input type="text" value={config.problemTopic} onChange={e => setConfig({...config, problemTopic: e.target.value})} className="w-full p-2 bg-black border border-zinc-700 rounded text-xs" placeholder="Problem Teması" />
                                    <select value={config.problemSteps} onChange={e => setConfig({...config, problemSteps: Number(e.target.value) as any})} className="w-full p-2 bg-black border border-zinc-700 rounded text-xs">
                                        <option value={1}>1 İşlemli (Basit)</option>
                                        <option value={2}>2 İşlemli (Orta)</option>
                                        <option value={3}>3 İşlemli (İleri)</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <button onClick={handleGenerate} disabled={isLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                            {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                            SAYFAYI ÜRET
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 bg-zinc-950 overflow-auto p-10 flex justify-center custom-scrollbar">
                    <div id="math-canvas" className="bg-white text-black shadow-2xl origin-top" style={{ width: `${A4_WIDTH_PX}px`, minHeight: `${A4_HEIGHT_PX}px`, padding: '20mm' }}>
                        {data ? (
                            <div className="worksheet-item">
                                <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
                                
                                {/* Operations Grid */}
                                <div className="grid grid-cols-4 gap-y-8 gap-x-4 mb-10 mt-6">
                                    {data.operations.map((op, i) => (
                                        <div key={i} className="flex flex-col items-end text-2xl font-mono border-b-2 border-black pb-1 relative pr-4">
                                            <div className={op.unknownPos === 'num1' ? 'border-2 border-dashed border-zinc-300 w-12 h-8 text-transparent' : ''}>{op.num1}</div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{op.operator}</span>
                                                <div className={op.unknownPos === 'num2' ? 'border-2 border-dashed border-zinc-300 w-12 h-8 text-transparent' : ''}>{op.num2}</div>
                                            </div>
                                            <div className="absolute top-full right-0 w-full pt-2 text-center text-zinc-300 font-bold text-sm">
                                                {op.unknownPos === 'ans' ? '........' : op.answer}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Problems Section */}
                                {data.problems.length > 0 && (
                                    <div className="mt-10 border-t-2 border-black pt-6">
                                        <h4 className="font-black text-lg mb-4 uppercase bg-zinc-100 inline-block px-2">Problemler</h4>
                                        <div className="space-y-8">
                                            {data.problems.map((p, i) => (
                                                <div key={i} className="space-y-4">
                                                    <p className="text-base font-medium leading-relaxed">{i+1}. {p.text}</p>
                                                    <div className="h-24 w-full border-2 border-dashed border-zinc-200 rounded-xl relative">
                                                        <span className="absolute top-2 left-2 text-[10px] text-zinc-400 uppercase font-bold">Çözüm Alanı</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
                                <i className="fa-solid fa-calculator text-9xl mb-4"></i>
                                <p className="font-black text-2xl uppercase tracking-widest">Matematik Stüdyosu</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onShare={() => {}} />
        </div>
    );
};
