
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { printService } from '../../utils/printService';
import { EditableText } from '../Editable';
import { generateFromRichPrompt } from '../../services/generators/newActivities';
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

const ProblemCard = ({ problem, showSolutionBox }: { problem: MathProblem, showSolutionBox: boolean }) => (
    <div className="w-full mb-6 break-inside-avoid">
        <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0 mt-1">
                <i className="fa-solid fa-question"></i>
            </div>
            <div className="flex-1">
                <p className="text-lg font-medium text-zinc-900 leading-relaxed text-justify font-dyslexic">
                    <EditableText value={problem.text} tag="span" />
                </p>
                {showSolutionBox && (
                    <div className="mt-4 w-full h-32 border-2 border-zinc-300 border-dashed rounded-xl bg-zinc-50 relative">
                        <span className="absolute top-2 left-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Çözüm Alanı</span>
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
        topic: 'Uzay Yolculuğu', difficulty: 'Orta', count: 4, includeSolutionBox: true, studentName: ''
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

    // --- ACTIONS ---

    const handleGenerateProblems = async () => {
        setIsGenerating(true);
        try {
            const prompt = `
            Konu: ${problemConfig.topic}. Seviye: ${problemConfig.difficulty}. 
            ${problemConfig.studentName ? `Öğrenci Adı: ${problemConfig.studentName}.` : ''}
            ${problemConfig.count} adet ilkokul seviyesinde, eğlenceli matematik problemi yaz.
            Cevapları da belirt.
            `;
            
            // Using existing robust AI handler
            const result = await generateFromRichPrompt(
                'REAL_LIFE_MATH_PROBLEMS', 
                prompt, 
                { difficulty: problemConfig.difficulty as any, worksheetCount: 1, itemCount: problemConfig.count, mode: 'ai' }
            );

            // Extract items from the generic structure
            // Depending on how generateFromRichPrompt structures it, usually in sections or items
            let problems: any[] = [];
            if (result && result.length > 0) {
                 const page = result[0];
                 if (page.sections) {
                     page.sections.forEach((s: any) => {
                         if (s.content) problems.push(...s.content);
                     });
                 } else if (page.items) {
                     problems = page.items;
                 }
            }

            // Map to local format
            const mapped = problems.map((p: any, i: number) => ({
                id: `p-${i}`,
                text: p.text || p.question || "Soru metni yüklenemedi.",
                answer: p.answer || "?",
            })).slice(0, problemConfig.count);

            setGeneratedProblems(mapped);

        } catch (e) {
            console.error(e);
            alert("Problem üretilemedi. Lütfen tekrar deneyin.");
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

                            {/* Constraints Toggles */}
                            <div className="space-y-2 pt-4 border-t border-zinc-800">
                                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Kurallar</h4>
                                {drillConfig.operation === 'add' && (
                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">Eldeli Toplama</span>
                                        <div className={`w-8 h-4 rounded-full relative transition-colors ${drillConfig.allowCarry ? 'bg-green-500' : 'bg-zinc-700'}`}>
                                            <input type="checkbox" checked={drillConfig.allowCarry} onChange={e => setDrillConfig({...drillConfig, allowCarry: e.target.checked})} className="hidden" />
                                            <div className={`w-2 h-2 bg-white rounded-full absolute top-1 transition-all ${drillConfig.allowCarry ? 'left-5' : 'left-1'}`}></div>
                                        </div>
                                    </label>
                                )}
                                {drillConfig.operation === 'sub' && (
                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">Onluk Bozma</span>
                                        <div className={`w-8 h-4 rounded-full relative transition-colors ${drillConfig.allowBorrow ? 'bg-green-500' : 'bg-zinc-700'}`}>
                                            <input type="checkbox" checked={drillConfig.allowBorrow} onChange={e => setDrillConfig({...drillConfig, allowBorrow: e.target.checked})} className="hidden" />
                                            <div className={`w-2 h-2 bg-white rounded-full absolute top-1 transition-all ${drillConfig.allowBorrow ? 'left-5' : 'left-1'}`}></div>
                                        </div>
                                    </label>
                                )}
                                {drillConfig.operation === 'div' && (
                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">Kalanlı Bölme</span>
                                        <div className={`w-8 h-4 rounded-full relative transition-colors ${drillConfig.allowRemainder ? 'bg-green-500' : 'bg-zinc-700'}`}>
                                            <input type="checkbox" checked={drillConfig.allowRemainder} onChange={e => setDrillConfig({...drillConfig, allowRemainder: e.target.checked})} className="hidden" />
                                            <div className={`w-2 h-2 bg-white rounded-full absolute top-1 transition-all ${drillConfig.allowRemainder ? 'left-5' : 'left-1'}`}></div>
                                        </div>
                                    </label>
                                )}
                            </div>
                        </div>
                    )}

                    {/* AI PROBLEM SETTINGS */}
                    {mode === 'problem_ai' && (
                        <div className="p-5 space-y-6 animate-in slide-in-from-left-4">
                            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-4 rounded-2xl border border-indigo-500/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">🤖</div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">AI Problem Üretici</h4>
                                        <p className="text-[10px] text-indigo-200">Konu bazlı özgün sorular.</p>
                                    </div>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Konu (Örn: Uzay, Market, Dinozorlar)" 
                                    value={problemConfig.topic}
                                    onChange={e => setProblemConfig({...problemConfig, topic: e.target.value})}
                                    className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-white/50 mb-3"
                                />
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <select value={problemConfig.difficulty} onChange={e => setProblemConfig({...problemConfig, difficulty: e.target.value as any})} className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none">
                                        <option value="Kolay">Kolay (1. Sınıf)</option>
                                        <option value="Orta">Orta (2-3. Sınıf)</option>
                                        <option value="Zor">Zor (4. Sınıf)</option>
                                    </select>
                                    <select value={problemConfig.count} onChange={e => setProblemConfig({...problemConfig, count: Number(e.target.value)})} className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none">
                                        <option value="2">2 Soru</option>
                                        <option value="4">4 Soru</option>
                                        <option value="6">6 Soru</option>
                                    </select>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Öğrenci Adı (Opsiyonel)" 
                                    value={problemConfig.studentName}
                                    onChange={e => setProblemConfig({...problemConfig, studentName: e.target.value})}
                                    className="w-full p-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-white/30 outline-none mb-4"
                                />
                                <button 
                                    onClick={handleGenerateProblems} 
                                    disabled={isGenerating}
                                    className="w-full py-3 bg-white text-indigo-900 font-bold rounded-xl text-sm shadow-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {isGenerating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                                    {isGenerating ? 'Yazılıyor...' : 'Problemleri Yaz'}
                                </button>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 p-3 bg-zinc-800 rounded-xl cursor-pointer border border-zinc-700">
                                    <input type="checkbox" checked={problemConfig.includeSolutionBox} onChange={e => setProblemConfig({...problemConfig, includeSolutionBox: e.target.checked})} className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500" />
                                    <span className="text-xs font-bold text-zinc-300">Çözüm Kutusu Ekle</span>
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
                                        <div className="text-center py-20 text-zinc-400 italic border-2 border-dashed border-zinc-200 rounded-3xl">
                                            Problem üretmek için sol menüyü kullanın.
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
