
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { printService } from '../../utils/printService';
import { EditableText } from '../Editable';
import { generateMathProblemsAI } from '../../services/generators/mathStudio';
import { generateMathDrillSet } from '../../services/offlineGenerators/mathStudio';
import { MathDrillConfig, MathPageConfig, MathOperation, MathProblemConfig, MathProblem, MathMode } from '../../types/math';

// --- CONFIGURATION ---
const A4_WIDTH_PX = 794; 
const A4_HEIGHT_PX = 1123; 

// --- COMPONENTS ---

const OperationCardVertical = ({ op, fontSize }: { op: MathOperation, fontSize: number }) => (
    <div className="flex flex-col items-end font-mono font-bold leading-none" style={{ fontSize: `${fontSize}px` }}>
        <span>{op.num1}</span>
        <div className="flex items-center gap-2 w-full justify-end border-b-2 border-black mb-1 relative">
            <span className="absolute left-0 transform -translate-x-1/2">{op.symbol}</span>
            <span>{op.num2}</span>
        </div>
        <span className="text-transparent select-none h-[1em] w-full text-right block border border-zinc-200 border-dashed rounded text-zinc-300/50">
            {op.answer}
        </span>
        {op.remainder !== undefined && (
            <span className="text-xs text-zinc-400 mt-1">Kalan: .</span>
        )}
    </div>
);

const OperationCardHorizontal = ({ op, fontSize }: { op: MathOperation, fontSize: number }) => (
    <div className="flex items-center gap-2 font-mono font-bold" style={{ fontSize: `${fontSize}px` }}>
        <span>{op.num1}</span>
        <span>{op.symbol}</span>
        <span>{op.num2}</span>
        <span>=</span>
        <span className="min-w-[60px] border-b-2 border-black border-dashed h-[1em]"></span>
        {op.remainder !== undefined && (
             <span className="text-sm ml-2 text-zinc-400">(Kal: ...)</span>
        )}
    </div>
);

const ProblemCard: React.FC<{ problem: MathProblem, showSolutionBox: boolean }> = ({ problem, showSolutionBox }) => (
    <div className="w-full mb-8 break-inside-avoid">
        <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-1 shadow-md">
                <i className="fa-solid fa-question"></i>
            </div>
            <div className="flex-1">
                <p className="text-lg font-medium text-zinc-900 leading-relaxed text-justify font-dyslexic border-b border-zinc-100 pb-2">
                    <EditableText value={problem.text} tag="span" />
                </p>
                
                {problem.operationHint && (
                     <div className="mt-2 text-xs text-zinc-400 flex items-center gap-2">
                         <i className="fa-solid fa-lightbulb text-yellow-500"></i>
                         <span className="italic">İpucu: {problem.operationHint}</span>
                     </div>
                )}

                {showSolutionBox && (
                    <div className="mt-4 w-full h-32 border-2 border-zinc-200 border-dashed rounded-xl bg-zinc-50/50 relative flex items-end justify-between p-4">
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest absolute top-2 left-3">Çözüm Alanı</span>
                        <div className="text-right w-full">
                            <span className="text-xs font-bold text-zinc-400 mr-2">Cevap:</span>
                            <span className="inline-block w-20 border-b-2 border-zinc-300"></span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
);

export const MathStudio: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useAuth();
    
    // --- STATE ---
    const [mode, setMode] = useState<MathMode>('drill');
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Configs
    const [pageConfig, setPageConfig] = useState<MathPageConfig>({
        paperType: 'blank', gridSize: 20, margin: 40, showDate: true, showName: true, title: 'MATEMATİK ÇALIŞMASI'
    });

    const [drillConfig, setDrillConfig] = useState<MathDrillConfig>({
        operation: 'add', digit1: 2, digit2: 1, count: 20, cols: 5, gap: 30,
        allowCarry: true, allowBorrow: true, allowRemainder: false, allowNegative: false,
        orientation: 'vertical', showAnswer: false, fontSize: 24
    });

    const [problemConfig, setProblemConfig] = useState<MathProblemConfig>({
        topic: 'Uzay Yolculuğu', 
        count: 4, 
        includeSolutionBox: true, 
        studentName: '',
        difficulty: 'Orta',
        selectedOperations: ['add', 'sub'],
        numberRange: '1-20',
        problemStyle: 'simple',
        complexity: '1-step'
    });

    // Data
    const [generatedDrills, setGeneratedDrills] = useState<MathOperation[]>([]);
    const [generatedProblems, setGeneratedProblems] = useState<MathProblem[]>([]);

    // --- EFFECT: Auto Generate Drills on Config Change ---
    useEffect(() => {
        if (mode === 'drill') {
            const items = generateMathDrillSet(drillConfig.count, drillConfig.operation, {
                digit1: drillConfig.digit1,
                digit2: drillConfig.digit2,
                allowCarry: drillConfig.allowCarry,
                allowBorrow: drillConfig.allowBorrow,
                allowRemainder: drillConfig.allowRemainder
            });
            setGeneratedDrills(items);
        }
    }, [drillConfig, mode]);

    // --- HELPER: Update Problem Operations ---
    const toggleOperation = (op: string) => {
        setProblemConfig(prev => {
            const current = prev.selectedOperations;
            const newOps = current.includes(op) ? current.filter(o => o !== op) : [...current, op];
            // Ensure at least one is selected
            if (newOps.length === 0) return prev;
            return { ...prev, selectedOperations: newOps };
        });
    };

    // --- ACTIONS ---

    const handleGenerateProblems = async () => {
        setIsGenerating(true);
        try {
            const result = await generateMathProblemsAI(problemConfig);

            // Map to local format
            const mapped = (result.problems || []).map((p: any, i: number) => ({
                id: `p-${Date.now()}-${i}`,
                text: p.text || "Soru metni yüklenemedi.",
                answer: p.answer || "?",
                operationHint: p.operationHint
            }));

            setGeneratedProblems(mapped);

        } catch (e) {
            console.error(e);
            alert("Problem üretilemedi. API Hatası.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#121212] text-white overflow-hidden font-sans">
            
            {/* HEADER */}
            <div className="h-16 bg-[#18181b] border-b border-zinc-800 flex justify-between items-center px-6 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition-colors"><i className="fa-solid fa-arrow-left"></i></button>
                    <div>
                        <h1 className="font-black text-xl tracking-tight text-white flex items-center gap-2">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">MATH STUDIO</span>
                            <span className="bg-zinc-800 text-zinc-500 px-1.5 rounded text-[9px] border border-zinc-700 font-bold uppercase tracking-widest">PRO</span>
                        </h1>
                    </div>
                </div>
                
                <div className="flex bg-zinc-800 p-1 rounded-lg">
                    <button onClick={() => setMode('drill')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${mode === 'drill' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}>
                        <i className="fa-solid fa-calculator"></i> İşlem Atölyesi
                    </button>
                    <button onClick={() => setMode('problem_ai')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${mode === 'problem_ai' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}>
                        <i className="fa-solid fa-robot"></i> AI Problemleri
                    </button>
                </div>

                <button onClick={() => printService.generatePdf('#math-canvas', pageConfig.title, { action: 'print' })} className="px-4 py-2 bg-zinc-100 hover:bg-white text-black rounded-lg font-bold text-sm transition-colors shadow-lg flex items-center gap-2">
                    <i className="fa-solid fa-print"></i> Yazdır
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                
                {/* LEFT SIDEBAR: CONFIGURATION */}
                <div className="w-80 bg-[#18181b] border-r border-zinc-800 flex flex-col overflow-y-auto custom-scrollbar">
                    
                    {/* GLOBAL PAGE SETTINGS */}
                    <div className="p-5 border-b border-zinc-800">
                        <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">Sayfa Ayarları</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 mb-1">Başlık</label>
                                <input type="text" value={pageConfig.title} onChange={e => setPageConfig({...pageConfig, title: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-indigo-500 outline-none" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setPageConfig({...pageConfig, paperType: 'blank'})} className={`flex-1 py-2 text-[10px] font-bold border rounded ${pageConfig.paperType==='blank'?'bg-zinc-700 border-zinc-500 text-white':'border-zinc-700 text-zinc-500'}`}>Boş</button>
                                <button onClick={() => setPageConfig({...pageConfig, paperType: 'grid'})} className={`flex-1 py-2 text-[10px] font-bold border rounded ${pageConfig.paperType==='grid'?'bg-zinc-700 border-zinc-500 text-white':'border-zinc-700 text-zinc-500'}`}>Kareli</button>
                                <button onClick={() => setPageConfig({...pageConfig, paperType: 'dot'})} className={`flex-1 py-2 text-[10px] font-bold border rounded ${pageConfig.paperType==='dot'?'bg-zinc-700 border-zinc-500 text-white':'border-zinc-700 text-zinc-500'}`}>Noktalı</button>
                            </div>
                        </div>
                    </div>

                    {/* DRILL SETTINGS */}
                    {mode === 'drill' && (
                        <div className="p-5 space-y-6 animate-in slide-in-from-left-4">
                            
                            {/* Operation Select */}
                            <div className="grid grid-cols-5 gap-2">
                                {[
                                    {id: 'add', icon: 'plus'}, {id: 'sub', icon: 'minus'}, 
                                    {id: 'mult', icon: 'xmark'}, {id: 'div', icon: 'divide'}, 
                                    {id: 'mixed', icon: 'shuffle'}
                                ].map(op => (
                                    <button 
                                        key={op.id}
                                        onClick={() => setDrillConfig({...drillConfig, operation: op.id as any})}
                                        className={`aspect-square rounded-xl flex items-center justify-center text-lg transition-all border-2 ${drillConfig.operation === op.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        <i className={`fa-solid fa-${op.icon}`}></i>
                                    </button>
                                ))}
                            </div>

                            {/* Digits Control */}
                            <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Basamak Sayısı</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] text-zinc-500 mb-1 font-bold">1. Sayı</label>
                                        <select value={drillConfig.digit1} onChange={e => setDrillConfig({...drillConfig, digit1: Number(e.target.value)})} className="w-full bg-black border border-zinc-600 rounded p-1.5 text-xs text-white outline-none focus:border-indigo-500">
                                            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Basamak</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] text-zinc-500 mb-1 font-bold">2. Sayı</label>
                                        <select value={drillConfig.digit2} onChange={e => setDrillConfig({...drillConfig, digit2: Number(e.target.value)})} className="w-full bg-black border border-zinc-600 rounded p-1.5 text-xs text-white outline-none focus:border-indigo-500">
                                            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Basamak</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Layout & Style */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Görünüm</h4>
                                
                                <div className="flex bg-zinc-800 rounded-lg p-1 border border-zinc-700">
                                    <button onClick={() => setDrillConfig({...drillConfig, orientation: 'vertical'})} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${drillConfig.orientation==='vertical'?'bg-zinc-600 text-white shadow':'text-zinc-500'}`}>Alt Alta</button>
                                    <button onClick={() => setDrillConfig({...drillConfig, orientation: 'horizontal'})} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${drillConfig.orientation==='horizontal'?'bg-zinc-600 text-white shadow':'text-zinc-500'}`}>Yan Yana</button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-[9px] text-zinc-500 mb-1">Adet</label>
                                        <input type="number" value={drillConfig.count} onChange={e => setDrillConfig({...drillConfig, count: Number(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] text-zinc-500 mb-1">Sütun</label>
                                        <input type="number" value={drillConfig.cols} onChange={e => setDrillConfig({...drillConfig, cols: Number(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white" />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-[9px] text-zinc-500 mb-1">Font Büyüklüğü</label>
                                    <input type="range" min="12" max="48" value={drillConfig.fontSize} onChange={e => setDrillConfig({...drillConfig, fontSize: Number(e.target.value)})} className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI PROBLEM SETTINGS */}
                    {mode === 'problem_ai' && (
                        <div className="p-5 space-y-6 animate-in slide-in-from-left-4">
                            
                            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-4 rounded-2xl border border-indigo-500/30">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">🤖</div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Akıllı Problem Motoru</h4>
                                        <p className="text-[10px] text-indigo-200">Tam kontrollü üretim.</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[9px] font-bold text-indigo-300 uppercase mb-1 block">Konu</label>
                                        <input 
                                            type="text" 
                                            value={problemConfig.topic}
                                            onChange={e => setProblemConfig({...problemConfig, topic: e.target.value})}
                                            className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-white/50"
                                            placeholder="Örn: Dinozorlar, Market..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-bold text-indigo-300 uppercase mb-1 block">Hangi İşlemler?</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                {id:'add', label:'+'}, {id:'sub', label:'-'}, {id:'mult', label:'x'}, {id:'div', label:'÷'}
                                            ].map(op => (
                                                <button
                                                    key={op.id}
                                                    onClick={() => toggleOperation(op.id)}
                                                    className={`py-2 rounded-lg font-bold text-sm transition-all border ${problemConfig.selectedOperations.includes(op.id) ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-black/20 text-zinc-400 border-white/10 hover:bg-black/40'}`}
                                                >
                                                    {op.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[9px] font-bold text-indigo-300 uppercase mb-1 block">Sayı Aralığı</label>
                                            <select value={problemConfig.numberRange} onChange={e => setProblemConfig({...problemConfig, numberRange: e.target.value})} className="w-full p-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none">
                                                <option value="1-10">1 - 10</option>
                                                <option value="1-20">1 - 20</option>
                                                <option value="1-50">1 - 50</option>
                                                <option value="1-100">1 - 100</option>
                                                <option value="100-1000">100 - 1000</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold text-indigo-300 uppercase mb-1 block">Adet</label>
                                            <select value={problemConfig.count} onChange={e => setProblemConfig({...problemConfig, count: Number(e.target.value)})} className="w-full p-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none">
                                                {Array.from({length: 20}, (_, i) => i + 1).map(n => (
                                                    <option key={n} value={n}>{n} Soru</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[9px] font-bold text-indigo-300 uppercase mb-1 block">Karmaşıklık</label>
                                            <select value={problemConfig.complexity} onChange={e => setProblemConfig({...problemConfig, complexity: e.target.value as any})} className="w-full p-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none">
                                                <option value="1-step">Tek İşlem</option>
                                                <option value="2-step">İki Aşamalı</option>
                                                <option value="multi-step">Çok Adımlı</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold text-indigo-300 uppercase mb-1 block">Kurgu Tarzı</label>
                                            <select value={problemConfig.problemStyle} onChange={e => setProblemConfig({...problemConfig, problemStyle: e.target.value as any})} className="w-full p-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none">
                                                <option value="simple">Kısa & Net</option>
                                                <option value="story">Hikayeli</option>
                                                <option value="logic">Mantık</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleGenerateProblems} 
                                        disabled={isGenerating}
                                        className="w-full py-3 bg-white text-indigo-900 font-bold rounded-xl text-sm shadow-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
                                    >
                                        {isGenerating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                                        {isGenerating ? 'Düşünülüyor...' : 'Problemleri Yaz'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 p-3 bg-zinc-800 rounded-xl cursor-pointer border border-zinc-700 hover:border-indigo-500/50 transition-colors">
                                    <input type="checkbox" checked={problemConfig.includeSolutionBox} onChange={e => setProblemConfig({...problemConfig, includeSolutionBox: e.target.checked})} className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500 bg-black border-zinc-600" />
                                    <span className="text-xs font-bold text-zinc-300">Çözüm ve İşlem Kutusu Ekle</span>
                                </label>
                            </div>
                        </div>
                    )}

                </div>

                {/* MAIN CANVAS */}
                <div className="flex-1 bg-[#09090b] relative overflow-auto flex justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] custom-scrollbar">
                    <div 
                        id="math-canvas"
                        className="bg-white text-black shadow-2xl transition-all relative flex flex-col origin-top"
                        style={{ 
                            width: `${A4_WIDTH_PX}px`, 
                            minHeight: `${A4_HEIGHT_PX}px`,
                            height: 'auto',
                            padding: `${pageConfig.margin}px`,
                            backgroundImage: pageConfig.paperType === 'grid' 
                                ? 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)' 
                                : pageConfig.paperType === 'dot' 
                                    ? 'radial-gradient(#9ca3af 1px, transparent 1px)' 
                                    : 'none',
                            backgroundSize: pageConfig.paperType === 'dot' ? '20px 20px' : '40px 40px'
                        }}
                    >
                        {/* HEADER */}
                        <div className="border-b-4 border-black pb-4 mb-8">
                            <h1 className="text-4xl font-black uppercase text-center tracking-tight"><EditableText value={pageConfig.title} /></h1>
                            <div className="flex justify-between mt-4 font-bold text-sm uppercase tracking-wider">
                                {pageConfig.showName && <span>Ad Soyad: ........................................</span>}
                                {pageConfig.showDate && <span>Tarih: ........................</span>}
                            </div>
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1">
                            {mode === 'drill' && (
                                <div 
                                    className="grid w-full gap-y-12 gap-x-4"
                                    style={{ 
                                        gridTemplateColumns: `repeat(${drillConfig.cols}, 1fr)`,
                                    }}
                                >
                                    {generatedDrills.map((op, i) => (
                                        <div key={op.id} className="flex justify-center items-start">
                                            {drillConfig.orientation === 'vertical' 
                                                ? <OperationCardVertical op={op} fontSize={drillConfig.fontSize} />
                                                : <OperationCardHorizontal op={op} fontSize={drillConfig.fontSize} />
                                            }
                                        </div>
                                    ))}
                                </div>
                            )}

                            {mode === 'problem_ai' && (
                                <div className="flex flex-col gap-8">
                                    {generatedProblems.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50">
                                            <i className="fa-solid fa-robot text-4xl mb-4 text-zinc-300"></i>
                                            <p className="text-sm font-bold">Sol panelden ayarları yapıp üret butonuna basın.</p>
                                        </div>
                                    ) : (
                                        generatedProblems.map((prob) => (
                                            <ProblemCard key={prob.id} problem={prob} showSolutionBox={problemConfig.includeSolutionBox} />
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* FOOTER */}
                        <div className="mt-8 pt-4 border-t border-zinc-200 flex justify-between items-center text-[10px] text-zinc-400 font-mono uppercase">
                            <span>Bursa Disleksi AI</span>
                            <span>Sayfa 1</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
