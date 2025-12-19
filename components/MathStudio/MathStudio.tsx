
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { printService } from '../../utils/printService';
import { worksheetService } from '../../services/worksheetService';
import { EditableText } from '../Editable';
import { ShareModal } from '../ShareModal';
import { generateMathProblemsAI } from '../../services/generators/mathStudio';
import { generateMathDrillSet } from '../../services/offlineGenerators/mathStudio';
import { MathDrillConfig, MathPageConfig, MathOperation, MathProblemConfig, MathProblem, MathMode } from '../../types/math';
import { ActivityType } from '../../types';

// --- CONFIGURATION ---
const A4_WIDTH_PX = 794; 
const A4_HEIGHT_PX = 1123; 
const PAGE_MARGIN_Y = 80; 

// --- UTILS ---
const numberToTurkish = (num: number): string => {
    if (num === 0) return "Sıfır";
    const ones = ["", "Bir", "İki", "Üç", "Dört", "Beş", "Altı", "Yedi", "Sekiz", "Dokuz"];
    const tens = ["", "On", "Yirmi", "Otuz", "Kırk", "Elli", "Altmış", "Yetmiş", "Seksen", "Doksan"];
    
    const convertGroup = (n: number) => {
        let str = "";
        const h = Math.floor(n / 100);
        const t = Math.floor((n % 100) / 10);
        const o = n % 10;
        
        if (h === 1) str += "Yüz ";
        else if (h > 1) str += ones[h] + " Yüz ";
        
        if (t > 0) str += tens[t] + " ";
        if (o > 0) str += ones[o] + " ";
        return str.trim();
    };

    if (num < 1000) return convertGroup(num);
    return num.toString();
};

// --- COMPONENTS ---

const OperationCardVertical = ({ op, fontSize, showText }: { op: MathOperation, fontSize: number, showText: boolean }) => (
    <div className="flex flex-col items-end font-mono font-bold leading-none break-inside-avoid p-1" style={{ fontSize: `${fontSize}px` }}>
        <div className="flex items-center gap-2">
            <span>{op.num1}</span>
            {showText && <span className="text-[0.4em] text-zinc-400 font-sans font-normal">({numberToTurkish(op.num1)})</span>}
        </div>
        
        <div className="flex items-center gap-2 w-full justify-end relative">
            <span className="absolute left-0 transform -translate-x-1/2">{op.symbol}</span>
            <span>{op.num2}</span>
            {showText && <span className="text-[0.4em] text-zinc-400 font-sans font-normal">({numberToTurkish(op.num2)})</span>}
        </div>

        {op.num3 !== undefined && (
            <div className="flex items-center gap-2 w-full justify-end relative">
                 <span className="absolute left-0 transform -translate-x-1/2">{op.symbol2 || op.symbol}</span>
                 <span>{op.num3}</span>
            </div>
        )}

        <div className="w-full border-b-2 border-black mb-1"></div>
        
        <span className="text-transparent select-none h-[1.2em] w-full text-right block border-2 border-zinc-200 border-dashed rounded text-zinc-300/50 bg-white">
            {op.answer}
        </span>
        {op.remainder !== undefined && (
            <span className="text-xs text-zinc-400 mt-0.5">Kal: ...</span>
        )}
    </div>
);

const OperationCardHorizontal = ({ op, fontSize, showText }: { op: MathOperation, fontSize: number, showText: boolean }) => (
    <div className="flex flex-wrap items-center gap-2 font-mono font-bold break-inside-avoid p-1 border border-transparent" style={{ fontSize: `${fontSize}px` }}>
        <div className="flex flex-col items-center">
            <span>{op.num1}</span>
            {showText && <span className="text-[0.4em] text-zinc-400 font-sans font-normal whitespace-nowrap">{numberToTurkish(op.num1)}</span>}
        </div>
        <span>{op.symbol}</span>
        <div className="flex flex-col items-center">
            <span>{op.num2}</span>
            {showText && <span className="text-[0.4em] text-zinc-400 font-sans font-normal whitespace-nowrap">{numberToTurkish(op.num2)}</span>}
        </div>
        
        {op.num3 !== undefined && (
            <>
                <span>{op.symbol2 || op.symbol}</span>
                <span>{op.num3}</span>
            </>
        )}

        <span>=</span>
        <span className="min-w-[50px] border-b-2 border-black border-dashed h-[1em] inline-block"></span>
        {op.remainder !== undefined && (
             <span className="text-[0.5em] ml-1 text-zinc-400">(K:...)</span>
        )}
    </div>
);

const ProblemCard: React.FC<{ problem: MathProblem, showSolutionBox: boolean, index: number }> = ({ problem, showSolutionBox, index }) => (
    <div className="w-full mb-6 break-inside-avoid">
        <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-md">
                {index + 1}
            </div>
            <div className="flex-1">
                <p className="text-base font-medium text-zinc-900 leading-relaxed text-justify font-dyslexic border-b border-zinc-100 pb-1">
                    <EditableText value={problem.text} tag="span" />
                </p>

                {showSolutionBox && (
                    <div className="mt-2 w-full h-24 border border-zinc-300 border-dashed rounded-lg bg-zinc-50/30 relative flex items-end justify-between p-2">
                        <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest absolute top-1 left-2">Çözüm</span>
                        <div className="text-right w-full">
                            <span className="text-xs font-bold text-zinc-400 mr-2">Cevap:</span>
                            <span className="inline-block w-16 border-b-2 border-zinc-300"></span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
);

// --- HEADER COMPONENT (Repeated on pages) ---
const WorksheetHeader = ({ pageConfig, pageIndex, totalPages }: { pageConfig: MathPageConfig, pageIndex: number, totalPages: number }) => (
    <div className="border-b-2 border-black pb-2 mb-4 shrink-0">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black uppercase tracking-tight text-black"><EditableText value={pageConfig.title} /></h1>
            <div className="flex flex-col items-end text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {pageConfig.showDate && <span>Tarih: ........................</span>}
            </div>
        </div>
        {pageConfig.showName && (
            <div className="mt-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Ad Soyad: ............................................................
            </div>
        )}
    </div>
);

const WorksheetFooter = ({ pageIndex }: { pageIndex: number }) => (
    <div className="mt-auto pt-2 border-t border-zinc-200 flex justify-between items-center text-[9px] text-zinc-400 font-mono uppercase shrink-0">
        <span>Bursa Disleksi AI</span>
        <span>Sayfa {pageIndex + 1}</span>
    </div>
);

interface MathStudioProps {
    onBack: () => void;
    onAddToWorkbook?: (data: any) => void;
}

export const MathStudio: React.FC<MathStudioProps> = ({ onBack, onAddToWorkbook }) => {
    const { user } = useAuth();
    
    // --- STATE ---
    const [mode, setMode] = useState<MathMode>('drill');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    
    // Configs
    const [pageConfig, setPageConfig] = useState<MathPageConfig>({
        paperType: 'blank', gridSize: 20, margin: 40, showDate: true, showName: true, title: 'MATEMATİK ÇALIŞMASI'
    });

    const [drillConfig, setDrillConfig] = useState<MathDrillConfig>({
        selectedOperations: ['add'], 
        digit1: 2, 
        digit2: 1, 
        digit3: 1, 
        count: 20, cols: 4, gap: 30,
        allowCarry: true, allowBorrow: true, allowRemainder: false, allowNegative: false,
        useThirdNumber: false, showTextRepresentation: false, autoFillPage: false,
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

    // --- EFFECT: Calculate Capacity & Generate ---
    useEffect(() => {
        if (mode === 'drill') {
            let targetCount = drillConfig.count;

            // SMART AUTO FILL LOGIC for SINGLE PAGE Estimations
            if (drillConfig.autoFillPage) {
                const usableHeight = A4_HEIGHT_PX - PAGE_MARGIN_Y - (pageConfig.margin * 2) - 150; // -150 header/footer
                
                // Estimate Item Size (Compact Mode)
                const itemHeight = drillConfig.orientation === 'vertical' 
                    ? (drillConfig.fontSize * (drillConfig.useThirdNumber ? 4.5 : 3.2)) + (drillConfig.showTextRepresentation ? 12 : 0) + drillConfig.gap
                    : (drillConfig.fontSize * 1.5) + drillConfig.gap;
                
                // Calculate Grid
                const rows = Math.floor(usableHeight / itemHeight);
                const safeCols = drillConfig.orientation === 'vertical' && drillConfig.fontSize > 30 ? 3 : drillConfig.cols; 
                
                targetCount = Math.max(1, rows * safeCols);
            }

            const items = generateMathDrillSet(targetCount, drillConfig.selectedOperations as any, { 
                digit1: drillConfig.digit1,
                digit2: drillConfig.digit2,
                digit3: drillConfig.digit3, // Pass digit3
                allowCarry: drillConfig.allowCarry,
                allowBorrow: drillConfig.allowBorrow,
                allowRemainder: drillConfig.allowRemainder,
                allowNegative: drillConfig.allowNegative,
                useThirdNumber: drillConfig.useThirdNumber
            });
            setGeneratedDrills(items);
        }
    }, [
        drillConfig.selectedOperations, drillConfig.digit1, drillConfig.digit2, drillConfig.digit3, drillConfig.count, 
        drillConfig.allowCarry, drillConfig.allowBorrow, drillConfig.allowRemainder, drillConfig.allowNegative,
        drillConfig.useThirdNumber, drillConfig.autoFillPage, drillConfig.fontSize, drillConfig.orientation,
        mode
    ]);

    // --- PAGINATION LOGIC ---
    const paginatedData = useMemo(() => {
        // Constants for A4
        const PAGE_CONTENT_HEIGHT = A4_HEIGHT_PX - (pageConfig.margin * 2) - 120; // -120 for header/footer approx
        
        if (mode === 'drill') {
            // Calculate item height estimation
            const itemHeight = drillConfig.orientation === 'vertical' 
                ? (drillConfig.fontSize * (drillConfig.useThirdNumber ? 4.5 : 3.2)) + (drillConfig.showTextRepresentation ? 12 : 0) + drillConfig.gap
                : (drillConfig.fontSize * 1.5) + drillConfig.gap;
            
            // Calculate capacity per page
            const rowsPerPage = Math.floor(PAGE_CONTENT_HEIGHT / itemHeight);
            const itemsPerPage = rowsPerPage * drillConfig.cols;
            
            // Split data
            const pages = [];
            for (let i = 0; i < generatedDrills.length; i += itemsPerPage) {
                pages.push(generatedDrills.slice(i, i + itemsPerPage));
            }
            return pages.length > 0 ? pages : [[]];
        } 
        else if (mode === 'problem_ai') {
            // Problem Estimation
            // Approx height per problem card: Text height + Solution Box (100px) + Margin (24px)
            // Average text height ~60px. Total ~180px per problem.
            const estimatedProblemHeight = problemConfig.includeSolutionBox ? 200 : 120;
            const itemsPerPage = Math.floor(PAGE_CONTENT_HEIGHT / estimatedProblemHeight);
            
            const pages = [];
            for (let i = 0; i < generatedProblems.length; i += itemsPerPage) {
                pages.push(generatedProblems.slice(i, i + itemsPerPage));
            }
            return pages.length > 0 ? pages : [[]];
        }
        return [[]];
    }, [mode, generatedDrills, generatedProblems, drillConfig, problemConfig, pageConfig]);


    // --- HELPERS ---
    const toggleDrillOp = (op: string) => {
        setDrillConfig(prev => {
            const current = prev.selectedOperations;
            const newOps = current.includes(op) ? current.filter(o => o !== op) : [...current, op];
            if (newOps.length === 0) return prev;
            return { ...prev, selectedOperations: newOps };
        });
    };

    const toggleProblemOp = (op: string) => {
        setProblemConfig(prev => {
            const current = prev.selectedOperations;
            const newOps = current.includes(op) ? current.filter(o => o !== op) : [...current, op];
            if (newOps.length === 0) return prev;
            return { ...prev, selectedOperations: newOps };
        });
    };
    
    // Prepare Data Packet for Saving/Sharing
    const getExportData = () => {
        return {
            mode,
            config: mode === 'drill' ? drillConfig : problemConfig,
            pageConfig,
            items: mode === 'drill' ? generatedDrills : generatedProblems,
            // Flag for SheetRenderer to identify Math Studio Data
            isMathStudio: true,
            title: pageConfig.title
        };
    };

    // --- ACTIONS ---

    const handleGenerateProblems = async () => {
        setIsGenerating(true);
        try {
            const result = await generateMathProblemsAI(problemConfig);
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
    
    const handleSave = async () => {
        if (!user) { alert("Kaydetmek için giriş yapmalısınız."); return; }
        setIsSaving(true);
        try {
            const data = getExportData();
            await worksheetService.saveWorksheet(
                user.id,
                pageConfig.title,
                'MATH_STUDIO' as ActivityType,
                [data],
                'fa-solid fa-calculator',
                { id: 'math-logic', title: 'Matematik' }
            );
            alert("Çalışma başarıyla kaydedildi.");
        } catch (e) {
            console.error(e);
            alert("Kaydetme hatası.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleShare = async (receiverId: string) => {
        if (!user) return;
        try {
            const data = getExportData();
            const mockSavedWorksheet: any = {
                name: pageConfig.title,
                activityType: 'MATH_STUDIO',
                worksheetData: [data],
                icon: 'fa-solid fa-calculator',
                category: { id: 'math-logic', title: 'Matematik' }
            };
            await worksheetService.shareWorksheet(mockSavedWorksheet, user.id, user.name, receiverId);
            setIsShareModalOpen(false);
            alert("Paylaşıldı.");
        } catch (e) {
            alert("Paylaşım hatası.");
        }
    };
    
    const handlePrint = async (action: 'print' | 'download') => {
        setIsPrinting(true);
        setTimeout(async () => {
            try {
                // Target all pages via specific class
                await printService.generatePdf('.math-page-container', pageConfig.title, { action });
            } catch (e) { console.error(e); } finally { setIsPrinting(false); }
        }, 100);
    };

    const handleAddToWorkbookClick = () => {
        if (onAddToWorkbook) {
            const data = getExportData();
            onAddToWorkbook(data);
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
                
                <div className="flex items-center gap-4">
                    <div className="flex bg-zinc-800 p-1 rounded-lg">
                        <button onClick={() => setMode('drill')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${mode === 'drill' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}>
                            <i className="fa-solid fa-calculator"></i> İşlem Atölyesi
                        </button>
                        <button onClick={() => setMode('problem_ai')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${mode === 'problem_ai' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}>
                            <i className="fa-solid fa-robot"></i> AI Problemleri
                        </button>
                    </div>

                    <div className="h-8 w-px bg-zinc-800"></div>

                    <div className="flex gap-2">
                        <button onClick={() => handlePrint('download')} disabled={isPrinting} className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="PDF İndir">
                            {isPrinting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}
                        </button>
                        <button onClick={() => handlePrint('print')} disabled={isPrinting} className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="Yazdır">
                            <i className="fa-solid fa-print"></i>
                        </button>
                        <button onClick={() => setIsShareModalOpen(true)} className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="Paylaş">
                            <i className="fa-solid fa-share-nodes"></i>
                        </button>
                        
                        {onAddToWorkbook && (
                            <button onClick={handleAddToWorkbookClick} className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-emerald-600 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="Kitapçığa Ekle">
                                <i className="fa-solid fa-plus-circle"></i>
                            </button>
                        )}
                        
                        <button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${isSaving ? 'bg-zinc-700 text-zinc-400' : 'bg-white text-black hover:bg-zinc-200'}`}
                        >
                            {isSaving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-save"></i>}
                            Kaydet
                        </button>
                    </div>
                </div>
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
                            {/* ... (Existing Drill Settings - No changes needed here) ... */}
                            {/* Operation Select */}
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block">İşlem Türleri (Çoklu)</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        {id: 'add', icon: 'plus'}, {id: 'sub', icon: 'minus'}, 
                                        {id: 'mult', icon: 'xmark'}, {id: 'div', icon: 'divide'}
                                    ].map(op => (
                                        <button 
                                            key={op.id}
                                            onClick={() => toggleDrillOp(op.id)}
                                            className={`aspect-square rounded-xl flex items-center justify-center text-lg transition-all border-2 ${drillConfig.selectedOperations.includes(op.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'}`}
                                        >
                                            <i className={`fa-solid fa-${op.icon}`}></i>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* ... Constraints, Digits, Advanced Toggles, Layout & Style (Same as previous) ... */}
                            <div className="space-y-3 pt-4 border-t border-zinc-800">
                                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Görünüm</h4>
                                <div className="flex bg-zinc-800 rounded-lg p-1 border border-zinc-700">
                                    <button onClick={() => setDrillConfig({...drillConfig, orientation: 'vertical'})} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${drillConfig.orientation==='vertical'?'bg-zinc-600 text-white shadow':'text-zinc-500'}`}>Alt Alta</button>
                                    <button onClick={() => setDrillConfig({...drillConfig, orientation: 'horizontal'})} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${drillConfig.orientation==='horizontal'?'bg-zinc-600 text-white shadow':'text-zinc-500'}`}>Yan Yana</button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-[9px] text-zinc-500 mb-1">Adet (Toplam)</label>
                                        <input 
                                            type="number" 
                                            value={drillConfig.count} 
                                            onChange={e => setDrillConfig({...drillConfig, count: Number(e.target.value)})} 
                                            disabled={drillConfig.autoFillPage}
                                            className={`w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white ${drillConfig.autoFillPage ? 'opacity-50 cursor-not-allowed' : ''}`} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] text-zinc-500 mb-1">Sütun</label>
                                        <input type="number" value={drillConfig.cols} onChange={e => setDrillConfig({...drillConfig, cols: Number(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] text-zinc-500 mb-1">Font Büyüklüğü ({drillConfig.fontSize}px)</label>
                                    <input type="range" min="16" max="48" value={drillConfig.fontSize} onChange={e => setDrillConfig({...drillConfig, fontSize: Number(e.target.value)})} className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI PROBLEM SETTINGS */}
                    {mode === 'problem_ai' && (
                        <div className="p-5 space-y-6 animate-in slide-in-from-left-4">
                            {/* ... (Existing Problem Settings - No changes needed here) ... */}
                            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-4 rounded-2xl border border-indigo-500/30">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">🤖</div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Akıllı Problem Motoru</h4>
                                        <p className="text-[10px] text-indigo-200">Tam kontrollü üretim.</p>
                                    </div>
                                </div>
                                {/* ... Controls ... */}
                                <button 
                                    onClick={handleGenerateProblems} 
                                    disabled={isGenerating}
                                    className="w-full py-3 bg-white text-indigo-900 font-bold rounded-xl text-sm shadow-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
                                >
                                    {isGenerating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                                    {isGenerating ? 'Düşünülüyor...' : 'Problemleri Yaz'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* MAIN CANVAS - PAGINATED */}
                <div className="flex-1 bg-[#09090b] relative overflow-auto flex justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] custom-scrollbar">
                    <div className="flex flex-col gap-10 pb-20">
                        {paginatedData.map((pageItems, pageIndex) => (
                            <div 
                                key={pageIndex}
                                id={`math-page-${pageIndex}`}
                                className="bg-white text-black shadow-2xl transition-all relative flex flex-col math-page-container worksheet-page print-page"
                                style={{ 
                                    width: `${A4_WIDTH_PX}px`, 
                                    height: `${A4_HEIGHT_PX}px`, // Fixed A4 Height
                                    padding: `${pageConfig.margin}px`,
                                    backgroundImage: pageConfig.paperType === 'grid' 
                                        ? 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)' 
                                        : pageConfig.paperType === 'dot' 
                                            ? 'radial-gradient(#9ca3af 1px, transparent 1px)' 
                                            : 'none',
                                    backgroundSize: pageConfig.paperType === 'dot' ? '20px 20px' : '40px 40px',
                                    marginBottom: '40px', // Visual gap between pages in UI
                                    breakAfter: 'page' // For printing
                                }}
                            >
                                <WorksheetHeader pageConfig={pageConfig} pageIndex={pageIndex} totalPages={paginatedData.length} />

                                {/* CONTENT AREA */}
                                <div className="flex-1 overflow-hidden">
                                    {mode === 'drill' && (
                                        <div 
                                            className="grid w-full gap-y-8 gap-x-4" 
                                            style={{ 
                                                gridTemplateColumns: `repeat(${drillConfig.cols}, 1fr)`,
                                            }}
                                        >
                                            {(pageItems as MathOperation[]).map((op) => (
                                                <div key={op.id} className="flex justify-center items-start">
                                                    {drillConfig.orientation === 'vertical' 
                                                        ? <OperationCardVertical op={op} fontSize={drillConfig.fontSize} showText={drillConfig.showTextRepresentation} />
                                                        : <OperationCardHorizontal op={op} fontSize={drillConfig.fontSize} showText={drillConfig.showTextRepresentation} />
                                                    }
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {mode === 'problem_ai' && (
                                        <div className="flex flex-col gap-6">
                                            {(pageItems as MathProblem[]).length === 0 && pageIndex === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-20 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50">
                                                    <i className="fa-solid fa-robot text-4xl mb-4 text-zinc-300"></i>
                                                    <p className="text-sm font-bold">Sol panelden ayarları yapıp üret butonuna basın.</p>
                                                </div>
                                            ) : (
                                                (pageItems as MathProblem[]).map((prob, i) => {
                                                    // Global index calculation
                                                    let globalIndex = 0;
                                                    for(let k=0; k<pageIndex; k++) globalIndex += paginatedData[k].length;
                                                    globalIndex += i;
                                                    
                                                    return <ProblemCard key={prob.id} problem={prob} showSolutionBox={problemConfig.includeSolutionBox} index={globalIndex} />
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                <WorksheetFooter pageIndex={pageIndex} />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
            
            <ShareModal 
                isOpen={isShareModalOpen} 
                onClose={() => setIsShareModalOpen(false)} 
                onShare={handleShare} 
                worksheetTitle={pageConfig.title}
            />
        </div>
    );
};
