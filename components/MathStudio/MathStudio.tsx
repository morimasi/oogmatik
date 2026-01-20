
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
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
// Reduced margin to fit more content (was 160)
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

interface MathStudioProps {
    onBack: () => void;
    onAddToWorkbook?: (data: any) => void;
}

export const MathStudio: React.FC<MathStudioProps> = ({ onBack, onAddToWorkbook }) => {
    const { user } = useAuth();
    const { students, activeStudent } = useStudent();
    
    // --- STATE ---
    const [mode, setMode] = useState<MathMode>('drill');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    
    const [selectedStudentId, setSelectedStudentId] = useState<string>('anonymous');

    // Sync with global active student
    useEffect(() => {
        if (activeStudent) {
            setSelectedStudentId(activeStudent.id);
            setProblemConfig(prev => ({...prev, studentName: activeStudent.name}));
        }
    }, [activeStudent]);

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
        studentName: activeStudent?.name || '',
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

            // SMART AUTO FILL LOGIC
            if (drillConfig.autoFillPage) {
                const usableHeight = A4_HEIGHT_PX - PAGE_MARGIN_Y - (pageConfig.margin * 2);
                
                // Estimate Item Size (Compact Mode)
                const itemHeight = drillConfig.orientation === 'vertical' 
                    ? (drillConfig.fontSize * (drillConfig.useThirdNumber ? 4.5 : 3.2)) + (drillConfig.showTextRepresentation ? 12 : 0) + 15 
                    : (drillConfig.fontSize * 1.5) + 15;
                
                // Calculate Grid
                const rows = Math.floor(usableHeight / itemHeight);
                const safeCols = drillConfig.orientation === 'vertical' && drillConfig.fontSize > 30 ? 3 : drillConfig.cols; 
                
                targetCount = Math.max(1, rows * safeCols);
            }

            const items = generateMathDrillSet(targetCount, drillConfig.selectedOperations as any, { 
                digit1: drillConfig.digit1,
                digit2: drillConfig.digit2,
                digit3: drillConfig.digit3, 
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
            title: pageConfig.title,
            instruction: "Aşağıdaki matematik problemlerini çözün." // Added mandatory instruction
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
            const studentId = selectedStudentId === 'anonymous' ? undefined : selectedStudentId;

            await worksheetService.saveWorksheet(
                user.id,
                pageConfig.title,
                'MATH_STUDIO' as ActivityType,
                [data],
                'fa-solid fa-calculator',
                { id: 'math-logic', title: 'Matematik' },
                undefined,
                undefined,
                studentId
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
                await printService.generatePdf('#math-canvas', pageConfig.title, { action });
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
        <div className="h-full flex flex-col bg-[#121212] text-white overflow-hidden font-sans absolute inset-0 z-50">
            
            {/* HEADER */}
            <div className="h-16 bg-[#18181b] border-b border-zinc-800 flex justify-between items-center px-6 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition-colors"><i className="fa-solid fa-arrow-left"></i></button>
                    <div>
                        <h1 className="font-black text-xl tracking-tight text-white flex items-center gap-2">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">MATH STUDIO</span>
                            <span className="bg-zinc-800 text-zinc-500 px-1.5 rounded text-[9px] border border-zinc-700 font-bold uppercase tracking-widest">PRO</span>
                        </h1>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex bg-zinc-800 border border-zinc-700 rounded-xl p-1 gap-1">
                        <button onClick={() => setMode('drill')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mode === 'drill' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}>
                            <i className="fa-solid fa-calculator"></i> İşlem Atölyesi
                        </button>
                        <button onClick={() => setMode('problem_ai')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mode === 'problem_ai' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}>
                            <i className="fa-solid fa-robot"></i> AI Problemleri
                        </button>
                    </div>

                    <div className="h-8 w-px bg-zinc-800"></div>

                    <div className="flex gap-2">
                        <button onClick={() => handlePrint('download')} disabled={isPrinting} className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="PDF İndir">
                            {isPrinting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}
                        </button>
                        <button onClick={() => handlePrint('print')} disabled={isPrinting} className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="Yazdır">
                            <i className="fa-solid fa-print"></i>
                        </button>
                        <button onClick={() => setIsShareModalOpen(true)} className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="Paylaş">
                            <i className="fa-solid fa-share-nodes"></i>
                        </button>
                        
                        {onAddToWorkbook && (
                            <button onClick={handleAddToWorkbookClick} className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-emerald-600 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="Kitapçığa Ekle">
                                <i className="fa-solid fa-plus-circle"></i>
                            </button>
                        )}
                        
                        <button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${isSaving ? 'bg-zinc-700 text-zinc-400' : 'bg-white text-black hover:bg-zinc-200'}`}
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
                    
                    {/* ASSIGN STUDENT SECTION */}
                    <div className="p-6 border-b border-zinc-800 bg-zinc-900/30">
                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <i className="fa-solid fa-user-graduate"></i> Öğrenci Atama
                        </h4>
                        <div className="relative">
                            <select 
                                value={selectedStudentId}
                                onChange={(e) => {
                                    const sid = e.target.value;
                                    setSelectedStudentId(sid);
                                    if (sid !== 'anonymous') {
                                        const s = students.find(x => x.id === sid);
                                        if (s) {
                                            setProblemConfig(prev => ({...prev, studentName: s.name}));
                                        }
                                    }
                                }}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-zinc-200 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer font-bold appearance-none"
                            >
                                <option value="anonymous">Anonim (Atanmamış)</option>
                                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                            </select>
                            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none text-[10px]"></i>
                        </div>
                    </div>

                    {/* GLOBAL PAGE SETTINGS */}
                    <div className="p-6 border-b border-zinc-800">
                        <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">Sayfa Ayarları</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase">Başlık</label>
                                <input type="text" value={pageConfig.title} onChange={e => setPageConfig({...pageConfig, title: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-bold" />
                            </div>
                            <div className="flex gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                                <button onClick={() => setPageConfig({...pageConfig, paperType: 'blank'})} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-colors ${pageConfig.paperType==='blank'?'bg-zinc-700 text-white shadow-sm':'text-zinc-500 hover:text-zinc-300'}`}>Boş</button>
                                <button onClick={() => setPageConfig({...pageConfig, paperType: 'grid'})} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-colors ${pageConfig.paperType==='grid'?'bg-zinc-700 text-white shadow-sm':'text-zinc-500 hover:text-zinc-300'}`}>Kareli</button>
                                <button onClick={() => setPageConfig({...pageConfig, paperType: 'dot'})} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-colors ${pageConfig.paperType==='dot'?'bg-zinc-700 text-white shadow-sm':'text-zinc-500 hover:text-zinc-300'}`}>Noktalı</button>
                            </div>
                        </div>
                    </div>

                    {/* DRILL SETTINGS */}
                    {mode === 'drill' && (
                        <div className="p-6 space-y-8 animate-in slide-in-from-left-4">
                            
                            {/* Operation Select */}
                            <div>
                                <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">İşlem Türleri</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {[
                                        {id: 'add', icon: 'plus'}, {id: 'sub', icon: 'minus'}, 
                                        {id: 'mult', icon: 'xmark'}, {id: 'div', icon: 'divide'}
                                    ].map(op => (
                                        <button 
                                            key={op.id}
                                            onClick={() => toggleDrillOp(op.id)}
                                            className={`aspect-square rounded-xl flex items-center justify-center text-lg transition-all border-2 ${drillConfig.selectedOperations.includes(op.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'}`}
                                        >
                                            <i className={`fa-solid fa-${op.icon}`}></i>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Constraints Toggles */}
                            <div className="space-y-3 p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2"><i className="fa-solid fa-sliders"></i> Kurallar</h4>
                                
                                {drillConfig.selectedOperations.includes('add') && (
                                    <label className="flex items-center justify-between cursor-pointer group p-1">
                                        <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors font-bold">Toplama: Eldeli</span>
                                        <div className={`w-9 h-5 rounded-full relative transition-colors ${drillConfig.allowCarry ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                                            <input type="checkbox" checked={drillConfig.allowCarry} onChange={e => setDrillConfig({...drillConfig, allowCarry: e.target.checked})} className="hidden" />
                                            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${drillConfig.allowCarry ? 'left-5' : 'left-1'}`}></div>
                                        </div>
                                    </label>
                                )}
                                
                                {drillConfig.selectedOperations.includes('sub') && (
                                    <>
                                        <label className="flex items-center justify-between cursor-pointer group p-1">
                                            <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors font-bold">Çıkarma: Onluk Bozma</span>
                                            <div className={`w-9 h-5 rounded-full relative transition-colors ${drillConfig.allowBorrow ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                                                <input type="checkbox" checked={drillConfig.allowBorrow} onChange={e => setDrillConfig({...drillConfig, allowBorrow: e.target.checked})} className="hidden" />
                                                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${drillConfig.allowBorrow ? 'left-5' : 'left-1'}`}></div>
                                            </div>
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer group p-1">
                                            <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors font-bold">Çıkarma: Negatif</span>
                                            <div className={`w-9 h-5 rounded-full relative transition-colors ${drillConfig.allowNegative ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                                                <input type="checkbox" checked={drillConfig.allowNegative} onChange={e => setDrillConfig({...drillConfig, allowNegative: e.target.checked})} className="hidden" />
                                                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${drillConfig.allowNegative ? 'left-5' : 'left-1'}`}></div>
                                            </div>
                                        </label>
                                    </>
                                )}
                                
                                {drillConfig.selectedOperations.includes('div') && (
                                    <label className="flex items-center justify-between cursor-pointer group p-1">
                                        <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors font-bold">Bölme: Kalanlı</span>
                                        <div className={`w-9 h-5 rounded-full relative transition-colors ${drillConfig.allowRemainder ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                                            <input type="checkbox" checked={drillConfig.allowRemainder} onChange={e => setDrillConfig({...drillConfig, allowRemainder: e.target.checked})} className="hidden" />
                                            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${drillConfig.allowRemainder ? 'left-5' : 'left-1'}`}></div>
                                        </div>
                                    </label>
                                )}
                            </div>

                            {/* Digits Control */}
                            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Basamak Sayısı</h4>
                                <div className={`grid ${drillConfig.useThirdNumber ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
                                    <div>
                                        <label className="block text-[9px] text-zinc-500 mb-1 font-bold uppercase">1. Sayı</label>
                                        <select value={drillConfig.digit1} onChange={e => setDrillConfig({...drillConfig, digit1: Number(e.target.value)})} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500 font-bold">
                                            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} B.</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] text-zinc-500 mb-1 font-bold uppercase">2. Sayı</label>
                                        <select value={drillConfig.digit2} onChange={e => setDrillConfig({...drillConfig, digit2: Number(e.target.value)})} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500 font-bold">
                                            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} B.</option>)}
                                        </select>
                                    </div>
                                    {drillConfig.useThirdNumber && (
                                        <div className="animate-in fade-in slide-in-from-left-2">
                                            <label className="block text-[9px] text-zinc-500 mb-1 font-bold uppercase">3. Sayı</label>
                                            <select value={drillConfig.digit3} onChange={e => setDrillConfig({...drillConfig, digit3: Number(e.target.value)})} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500 font-bold">
                                                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} B.</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Advanced Toggles */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Gelişmiş</h4>
                                <label className="flex items-center justify-between cursor-pointer group bg-zinc-900 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                                    <span className="text-xs text-zinc-300 font-bold group-hover:text-white transition-colors">Sayfayı Otomatik Doldur</span>
                                    <div className={`w-9 h-5 rounded-full relative transition-colors ${drillConfig.autoFillPage ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                                        <input type="checkbox" checked={drillConfig.autoFillPage} onChange={e => setDrillConfig({...drillConfig, autoFillPage: e.target.checked})} className="hidden" />
                                        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${drillConfig.autoFillPage ? 'left-5' : 'left-1'}`}></div>
                                    </div>
                                </label>

                                <label className="flex items-center justify-between cursor-pointer group bg-zinc-900 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                                    <span className="text-xs text-zinc-300 font-bold group-hover:text-white transition-colors">3. Sayı Ekle (Zincir)</span>
                                    <div className={`w-9 h-5 rounded-full relative transition-colors ${drillConfig.useThirdNumber ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                                        <input type="checkbox" checked={drillConfig.useThirdNumber} onChange={e => setDrillConfig({...drillConfig, useThirdNumber: e.target.checked})} className="hidden" />
                                        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${drillConfig.useThirdNumber ? 'left-5' : 'left-1'}`}></div>
                                    </div>
                                </label>

                                <label className="flex items-center justify-between cursor-pointer group bg-zinc-900 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                                    <span className="text-xs text-zinc-300 font-bold group-hover:text-white transition-colors">Sayıları Yazıyla Göster</span>
                                    <div className={`w-9 h-5 rounded-full relative transition-colors ${drillConfig.showTextRepresentation ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                                        <input type="checkbox" checked={drillConfig.showTextRepresentation} onChange={e => setDrillConfig({...drillConfig, showTextRepresentation: e.target.checked})} className="hidden" />
                                        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${drillConfig.showTextRepresentation ? 'left-5' : 'left-1'}`}></div>
                                    </div>
                                </label>
                            </div>

                            {/* Layout & Style */}
                            <div className="space-y-4 pt-6 border-t border-zinc-800">
                                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Düzen</h4>
                                
                                <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800">
                                    <button onClick={() => setDrillConfig({...drillConfig, orientation: 'vertical'})} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${drillConfig.orientation==='vertical'?'bg-zinc-700 text-white shadow-sm':'text-zinc-500 hover:text-zinc-300'}`}>Alt Alta</button>
                                    <button onClick={() => setDrillConfig({...drillConfig, orientation: 'horizontal'})} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${drillConfig.orientation==='horizontal'?'bg-zinc-700 text-white shadow-sm':'text-zinc-500 hover:text-zinc-300'}`}>Yan Yana</button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-[9px] text-zinc-500 mb-1.5 font-bold uppercase">Soru Adedi</label>
                                        <input 
                                            type="number" 
                                            value={drillConfig.count} 
                                            onChange={e => setDrillConfig({...drillConfig, count: Number(e.target.value)})} 
                                            disabled={drillConfig.autoFillPage}
                                            className={`w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-sm text-white font-bold ${drillConfig.autoFillPage ? 'opacity-50 cursor-not-allowed' : ''}`} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] text-zinc-500 mb-1.5 font-bold uppercase">Sütun Sayısı</label>
                                        <input type="number" value={drillConfig.cols} onChange={e => setDrillConfig({...drillConfig, cols: Number(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-sm text-white font-bold" />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-[9px] text-zinc-500 mb-1.5 font-bold uppercase">Yazı Büyüklüğü ({drillConfig.fontSize}px)</label>
                                    <input type="range" min="16" max="48" value={drillConfig.fontSize} onChange={e => setDrillConfig({...drillConfig, fontSize: Number(e.target.value)})} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI PROBLEM SETTINGS */}
                    {mode === 'problem_ai' && (
                        <div className="p-6 space-y-8 animate-in slide-in-from-left-4">
                            
                            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-5 rounded-[1.5rem] border border-indigo-500/30 shadow-lg">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl shadow-inner border border-white/10">🤖</div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Akıllı Problem Motoru</h4>
                                        <p className="text-[10px] text-indigo-200">Tam kontrollü üretim.</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[9px] font-bold text-indigo-300 uppercase mb-1.5 block">Konu</label>
                                        <input 
                                            type="text" 
                                            value={problemConfig.topic}
                                            onChange={e => setProblemConfig({...problemConfig, topic: e.target.value})}
                                            className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-white/50 font-medium"
                                            placeholder="Örn: Dinozorlar, Market..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-bold text-indigo-300 uppercase mb-2 block">Hangi İşlemler?</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                {id:'add', label:'+'}, {id:'sub', label:'-'}, {id:'mult', label:'x'}, {id:'div', label:'÷'}
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

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[9px] font-bold text-indigo-300 uppercase mb-1.5 block">Sayı Aralığı</label>
                                            <select value={problemConfig.numberRange} onChange={e => setProblemConfig({...problemConfig, numberRange: e.target.value})} className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none font-bold">
                                                <option value="1-10">1 - 10</option>
                                                <option value="1-20">1 - 20</option>
                                                <option value="1-50">1 - 50</option>
                                                <option value="1-100">1 - 100</option>
                                                <option value="100-1000">100 - 1000</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold text-indigo-300 uppercase mb-1.5 block">Adet</label>
                                            <select value={problemConfig.count} onChange={e => setProblemConfig({...problemConfig, count: Number(e.target.value)})} className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none font-bold">
                                                {Array.from({length: 20}, (_, i) => i + 1).map(n => (
                                                    <option key={n} value={n}>{n} Soru</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[9px] font-bold text-indigo-300 uppercase mb-1.5 block">Karmaşıklık</label>
                                            <select value={problemConfig.complexity} onChange={e => setProblemConfig({...problemConfig, complexity: e.target.value as any})} className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none font-bold">
                                                <option value="1-step">Tek İşlem</option>
                                                <option value="2-step">İki Aşamalı</option>
                                                <option value="multi-step">Çok Adımlı</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold text-indigo-300 uppercase mb-1.5 block">Kurgu Tarzı</label>
                                            <select value={problemConfig.problemStyle} onChange={e => setProblemConfig({...problemConfig, problemStyle: e.target.value as any})} className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none font-bold">
                                                <option value="simple">Kısa & Net</option>
                                                <option value="story">Hikayeli</option>
                                                <option value="logic">Mantık</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleGenerateProblems} 
                                        disabled={isGenerating}
                                        className="w-full py-3.5 bg-white text-indigo-900 font-black rounded-xl text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
                                    >
                                        {isGenerating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                                        {isGenerating ? 'Düşünülüyor...' : 'Problemleri Yaz'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 p-4 bg-zinc-900 rounded-xl cursor-pointer border border-zinc-800 hover:border-indigo-500/50 transition-colors">
                                    <input type="checkbox" checked={problemConfig.includeSolutionBox} onChange={e => setProblemConfig({...problemConfig, includeSolutionBox: e.target.checked})} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-black border-zinc-700" />
                                    <span className="text-sm font-bold text-zinc-300">Çözüm ve İşlem Kutusu Ekle</span>
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
                        {/* COMPACT HEADER */}
                        <div className="border-b-2 border-black pb-2 mb-4">
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

                        {/* CONTENT */}
                        <div className="flex-1">
                            {mode === 'drill' && (
                                <div 
                                    className="grid w-full gap-y-8 gap-x-4" 
                                    style={{ 
                                        gridTemplateColumns: `repeat(${drillConfig.cols}, 1fr)`,
                                    }}
                                >
                                    {generatedDrills.map((op, i) => (
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
                                    {generatedProblems.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50">
                                            <i className="fa-solid fa-robot text-4xl mb-4 text-zinc-300"></i>
                                            <p className="text-sm font-bold">Sol panelden ayarları yapıp üret butonuna basın.</p>
                                        </div>
                                    ) : (
                                        generatedProblems.map((prob, i) => (
                                            <ProblemCard key={prob.id} problem={prob} showSolutionBox={problemConfig.includeSolutionBox} index={i} />
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* FOOTER */}
                        <div className="mt-4 pt-2 border-t border-zinc-200 flex justify-between items-center text-[9px] text-zinc-400 font-mono uppercase">
                            <span>Bursa Disleksi AI</span>
                            <span>Sayfa 1</span>
                        </div>
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
