
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
const HEADER_HEIGHT = 180;
const FOOTER_HEIGHT = 50;
const PROBLEM_SECTION_HEIGHT = 450; // Approx height for 3-4 word problems
const OPERATION_ROW_HEIGHT = 100; // Height of one row of operations including gap

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
        num1Digits: 2, num2Digits: 1, // Default to 2-digit +/- 1-digit
        includeProblems: false, problemCount: 3, problemSteps: 1, problemTopic: 'Market Alışverişi',
        layoutMode: 'standard', itemCount: 0 // 0 means AUTO
    });

    const [data, setData] = useState<MathStudioData | null>(null);

    // --- SMART FILL LOGIC ---
    const calculateAutoItemCount = () => {
        let availableHeight = A4_HEIGHT_PX - HEADER_HEIGHT - FOOTER_HEIGHT - 60; // 60px padding
        
        if (config.includeProblems) {
            availableHeight -= PROBLEM_SECTION_HEIGHT;
        }
        
        const rows = Math.floor(availableHeight / OPERATION_ROW_HEIGHT);
        // 4 Columns is standard for vertical operations
        const count = Math.max(4, rows * 4); 
        return count;
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            // Determine actual count
            const actualCount = config.itemCount > 0 ? config.itemCount : calculateAutoItemCount();
            
            // Offline Generator for Drill
            const offlineData = generateMathStudioOffline({
                ...config,
                itemCount: actualCount
            });
            
            // AI Generator for Word Problems
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
            <div className="h-14 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center px-4 shrink-0 z-50 shadow-lg">
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
                    <div className="p-5 space-y-8">
                        {/* Mode Switch */}
                        <div className="bg-black/40 p-1 rounded-xl flex border border-zinc-800">
                            <button onClick={() => setMode('fast')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'fast' ? 'bg-zinc-800 text-blue-400 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>HIZLI (Drill)</button>
                            <button onClick={() => setMode('ai')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'ai' ? 'bg-zinc-800 text-indigo-400 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>AI (Karma)</button>
                        </div>

                        {/* Operations */}
                        <section>
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">İşlem Türleri</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    {id:'add', label:'Toplama', sym:'+'}, 
                                    {id:'sub', label:'Çıkarma', sym:'-'}, 
                                    {id:'mult', label:'Çarpma', sym:'x'}, 
                                    {id:'div', label:'Bölme', sym:'÷'}
                                ].map(op => (
                                    <button 
                                        key={op.id} 
                                        onClick={() => setConfig(prev => ({ ...prev, operations: prev.operations.includes(op.id as any) ? prev.operations.filter(x => x !== op.id) : [...prev.operations, op.id as any] }))}
                                        className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${config.operations.includes(op.id as any) ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' : 'bg-zinc-800/50 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}
                                    >
                                        <span>{op.label}</span>
                                        <span className="text-lg leading-none opacity-50">{op.sym}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Digit Config (New) */}
                        <section className="space-y-3 p-4 bg-zinc-800/30 rounded-xl border border-zinc-800">
                             <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Sayı Basamakları</label>
                             
                             <div className="flex items-center justify-between">
                                 <span className="text-xs text-zinc-400 font-bold">1. Sayı (Üst)</span>
                                 <div className="flex gap-1">
                                     {[1, 2, 3, 4].map(d => (
                                         <button 
                                             key={d}
                                             onClick={() => setConfig({...config, num1Digits: d})}
                                             className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${config.num1Digits === d ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'}`}
                                         >{d}</button>
                                     ))}
                                 </div>
                             </div>

                             <div className="flex items-center justify-between">
                                 <span className="text-xs text-zinc-400 font-bold">2. Sayı (Alt)</span>
                                 <div className="flex gap-1">
                                     {[1, 2, 3].map(d => (
                                         <button 
                                             key={d}
                                             onClick={() => setConfig({...config, num2Digits: d})}
                                             className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${config.num2Digits === d ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'}`}
                                         >{d}</button>
                                     ))}
                                 </div>
                             </div>
                        </section>

                        {/* Constraints */}
                        <section className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Kısıtlamalar</label>
                            {[
                                {k:'allowCarry', l:'Eldeli Toplama'},
                                {k:'allowBorrow', l:'Onluk Bozmalı Çıkarma'},
                                {k:'allowRemainder', l:'Kalanlı Bölme'},
                                {k:'findUnknown', l:'Bilinmeyeni Bul (? + 5 = 10)'}
                            ].map(opt => (
                                <label key={opt.k} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer border border-transparent hover:border-zinc-700 transition-all">
                                    <span className="text-xs font-medium text-zinc-300">{opt.l}</span>
                                    <input 
                                        type="checkbox" 
                                        checked={(config as any)[opt.k]} 
                                        onChange={e => setConfig({...config, [opt.k]: e.target.checked})} 
                                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-offset-zinc-900" 
                                    />
                                </label>
                            ))}
                        </section>

                        {/* Problems Toggle */}
                        <section className="pt-4 border-t border-zinc-800">
                            <label className="flex items-center justify-between cursor-pointer mb-4">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sözel Problemler (AI)</span>
                                <div className={`w-10 h-6 rounded-full relative transition-colors ${config.includeProblems ? 'bg-indigo-500' : 'bg-zinc-700'}`}>
                                    <input type="checkbox" checked={config.includeProblems} onChange={e => setConfig({...config, includeProblems: e.target.checked})} className="hidden" />
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.includeProblems ? 'left-5' : 'left-1'}`}></div>
                                </div>
                            </label>
                            
                            {config.includeProblems && (
                                <div className="space-y-3 animate-in slide-in-from-top-2 p-3 bg-indigo-900/20 rounded-xl border border-indigo-500/20">
                                    <input type="text" value={config.problemTopic} onChange={e => setConfig({...config, problemTopic: e.target.value})} className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs placeholder-zinc-600" placeholder="Konu: Market, Okul..." />
                                    <div className="flex gap-2">
                                        <select value={config.problemCount} onChange={e => setConfig({...config, problemCount: Number(e.target.value)})} className="flex-1 p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs">
                                            {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Soru</option>)}
                                        </select>
                                        <select value={config.problemSteps} onChange={e => setConfig({...config, problemSteps: Number(e.target.value) as any})} className="flex-1 p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs">
                                            {[1, 2, 3].map(n => <option key={n} value={n}>{n} İşlemli</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </section>

                        <button onClick={handleGenerate} disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl shadow-xl shadow-blue-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2">
                            {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                            SAYFAYI OLUŞTUR
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 bg-zinc-950 overflow-auto p-8 flex justify-center custom-scrollbar">
                    <div id="math-canvas" className="bg-white text-black shadow-2xl origin-top transition-transform duration-300 scale-90" style={{ width: `${A4_WIDTH_PX}px`, minHeight: `${A4_HEIGHT_PX}px`, padding: '20mm', height: 'auto' }}>
                        {data ? (
                            <div className="worksheet-item h-full flex flex-col">
                                <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
                                
                                {/* Operations Grid - Dynamic Auto Fill Layout */}
                                <div className="grid grid-cols-4 gap-x-8 gap-y-10 mt-8 mb-8 content-start flex-1">
                                    {data.operations.map((op, i) => (
                                        <div key={i} className="flex flex-col items-end text-3xl font-mono font-bold border-b-4 border-black pb-1 relative pr-4">
                                            <div className={`tracking-widest ${op.unknownPos === 'num1' ? 'text-transparent border-2 border-dashed border-zinc-300 bg-zinc-50 rounded px-2 min-w-[1.5em]' : ''}`}>
                                                {op.num1}
                                            </div>
                                            <div className="flex items-center gap-3 w-full justify-end">
                                                <span className="text-2xl opacity-50 absolute left-0 bottom-2">{op.operator}</span>
                                                <div className={`tracking-widest ${op.unknownPos === 'num2' ? 'text-transparent border-2 border-dashed border-zinc-300 bg-zinc-50 rounded px-2 min-w-[1.5em]' : ''}`}>
                                                    {op.num2}
                                                </div>
                                            </div>
                                            <div className="absolute top-full right-0 w-full pt-2 text-right">
                                                 <span className={`${op.unknownPos === 'ans' ? 'text-zinc-200' : 'text-black'}`}>
                                                     {op.unknownPos === 'ans' ? '?' : op.answer}
                                                 </span>
                                                 {op.remainder !== undefined && op.remainder > 0 && <span className="text-sm ml-2 text-zinc-500">(K:{op.remainder})</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Problems Section */}
                                {data.problems.length > 0 && (
                                    <div className="mt-auto border-t-4 border-zinc-200 pt-8 break-inside-avoid">
                                        <h4 className="font-black text-sm mb-6 uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                            <i className="fa-solid fa-brain"></i> Problem Atölyesi
                                        </h4>
                                        <div className="space-y-8">
                                            {data.problems.map((p, i) => (
                                                <div key={i} className="flex gap-6 items-start">
                                                    <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold shrink-0">{i+1}</span>
                                                    <div className="flex-1 space-y-4">
                                                        <p className="text-lg font-medium leading-relaxed font-dyslexic">{p.text}</p>
                                                        <div className="h-32 w-full border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50 relative p-4">
                                                            <span className="absolute top-2 left-3 text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Çözüm Alanı</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Footer */}
                                <div className="mt-8 pt-4 border-t border-zinc-100 flex justify-between text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                                    <span>Bursa Disleksi AI</span>
                                    <span>{new Date().toLocaleDateString('tr-TR')}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale select-none">
                                <i className="fa-solid fa-calculator text-9xl mb-8"></i>
                                <p className="font-black text-3xl uppercase tracking-[0.5em]">Matematik</p>
                                <p className="text-sm font-bold mt-2">Stüdyosu</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onShare={() => {}} />
        </div>
    );
};
