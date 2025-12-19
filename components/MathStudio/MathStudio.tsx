
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MathStudioItem, MathComponentType, MathPageConfig } from '../../types/math';
import { generateMathDrillSet } from '../../services/offlineGenerators/mathStudio';
import { useAuth } from '../../context/AuthContext';
import { printService } from '../../utils/printService';
import { EditableText } from '../Editable';
import { ShareModal } from '../ShareModal';
import { generateFromRichPrompt } from '../../services/generators/newActivities';
import { Base10Visualizer, Shape } from '../sheets/common';

// --- VISUAL RENDERERS ---

const ClockRenderer = ({ data }: { data: any }) => {
    const { time, showNumbers, showMinuteMarks } = data;
    let [h, m] = [10, 10];
    if (time && time !== 'random') {
        const parts = time.split(':');
        if (parts.length === 2) {
            h = parseInt(parts[0]);
            m = parseInt(parts[1]);
        }
    }
    
    const r = 40;
    const hDeg = (h % 12) * 30 + m * 0.5;
    const mDeg = m * 6;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-2">
            <svg viewBox="0 0 100 100" className="w-full h-auto max-w-[120px]">
                <circle cx="50" cy="50" r="48" stroke="black" strokeWidth="2" fill="white" />
                {showMinuteMarks && Array.from({length: 60}).map((_, i) => (
                     <line key={i} x1="50" y1="5" x2="50" y2={i % 5 === 0 ? "10" : "7"} transform={`rotate(${i*6} 50 50)`} stroke="black" strokeWidth={i % 5 === 0 ? 2 : 1} />
                ))}
                {showNumbers && [12,1,2,3,4,5,6,7,8,9,10,11].map((n, i) => (
                    <text key={i} x={50 + 35 * Math.sin(n * 30 * Math.PI / 180)} y={50 - 35 * Math.cos(n * 30 * Math.PI / 180)} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="bold">{n}</text>
                ))}
                <line x1="50" y1="50" x2="50" y2="25" transform={`rotate(${hDeg} 50 50)`} stroke="black" strokeWidth="3" strokeLinecap="round" />
                <line x1="50" y1="50" x2="50" y2="15" transform={`rotate(${mDeg} 50 50)`} stroke="black" strokeWidth="2" strokeLinecap="round" />
                <circle cx="50" cy="50" r="3" fill="black" />
            </svg>
            {data.label && <div className="text-sm font-bold mt-1 text-center"><EditableText value={data.label} tag="span" /></div>}
        </div>
    );
};

const FractionRenderer = ({ data }: { data: any }) => {
    const { numerator, denominator, visualType } = data;
    
    if (visualType === 'pie') {
        const slices = [];
        for (let i = 0; i < denominator; i++) {
            const start = (i * 360) / denominator;
            const end = ((i + 1) * 360) / denominator;
            const large = end - start > 180 ? 1 : 0;
            const x1 = 50 + 45 * Math.cos(Math.PI * (start - 90) / 180);
            const y1 = 50 + 45 * Math.sin(Math.PI * (start - 90) / 180);
            const x2 = 50 + 45 * Math.cos(Math.PI * (end - 90) / 180);
            const y2 = 50 + 45 * Math.sin(Math.PI * (end - 90) / 180);
            const d = `M 50 50 L ${x1} ${y1} A 45 45 0 ${large} 1 ${x2} ${y2} Z`;
            slices.push(<path key={i} d={d} fill={i < numerator ? '#60a5fa' : 'white'} stroke="black" strokeWidth="1" />);
        }
        return (
            <div className="w-full h-full flex flex-col items-center justify-center">
                 <svg viewBox="0 0 100 100" className="w-24 h-24">
                     {slices}
                     <circle cx="50" cy="50" r="45" fill="none" stroke="black" strokeWidth="2" />
                 </svg>
                 {data.showLabel && <div className="mt-1 font-bold text-lg">{numerator}/{denominator}</div>}
            </div>
        );
    }
    // Bar
    return (
        <div className="w-full h-full flex flex-col items-center justify-center px-4">
            <div className="flex w-full h-8 border-2 border-black rounded overflow-hidden">
                {Array.from({length: denominator}).map((_, i) => (
                    <div key={i} className={`flex-1 border-r border-black last:border-r-0 ${i < numerator ? 'bg-blue-400' : 'bg-white'}`}></div>
                ))}
            </div>
             {data.showLabel && <div className="mt-1 font-bold text-lg">{numerator}/{denominator}</div>}
        </div>
    );
};

const DrillRenderer = ({ item }: { item: any }) => {
    const { operations, orientation, cols, gap, showAnswer, fontSize } = item.data;
    const isVertical = orientation === 'vertical';

    return (
        <div className="w-full h-full overflow-hidden flex flex-col">
            <div 
                className="grid w-full h-full align-content-start" 
                style={{ 
                    gridTemplateColumns: `repeat(${cols}, 1fr)`, 
                    gap: `${gap}px`,
                    padding: '4px' // Prevent border cut-off
                }}
            >
                {operations.map((op: any, i: number) => (
                    <div 
                        key={i} 
                        className={`flex justify-center items-center font-mono font-bold border border-transparent hover:border-zinc-200 rounded p-2 ${isVertical ? 'flex-col items-end' : 'flex-row gap-2'}`} 
                        style={{fontSize: `${fontSize || 20}px`}}
                    >
                        {isVertical ? (
                            <>
                                <span className="leading-none">{op.n1}</span>
                                <div className="flex items-center justify-between w-full gap-2 leading-none relative">
                                    <span className="absolute left-0 transform -translate-x-1/2">{op.symbol}</span>
                                    <span>{op.n2}</span>
                                </div>
                                <div className="w-full border-b-2 border-black my-1"></div>
                                <span className={`text-indigo-600 ${!showAnswer && 'text-transparent'}`}>{op.ans}</span>
                            </>
                        ) : (
                            <>
                                <span>{op.n1}</span>
                                <span>{op.symbol}</span>
                                <span>{op.n2}</span>
                                <span>=</span>
                                <span className={`text-indigo-600 ${!showAnswer && 'text-transparent border-b-2 border-black min-w-[40px] text-center'}`}>{op.ans}</span>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const WordProblemRenderer = ({ item }: { item: any }) => {
    return (
        <div className="w-full h-full p-4 flex flex-col gap-4">
             <div className="text-lg font-medium leading-relaxed">
                 <EditableText value={item.data.text} tag="p" />
             </div>
             {item.data.showWorkSpace && (
                 <div 
                    className="w-full border-2 border-dashed border-zinc-300 rounded-xl bg-zinc-50 relative flex-1 min-h-[60px]"
                 >
                     <span className="absolute top-2 left-2 text-[10px] text-zinc-400 font-bold uppercase">Çözüm Alanı</span>
                 </div>
             )}
        </div>
    );
}

const NumberLineRenderer = ({ data }: { data: any }) => {
    const { start, end, step, missingCount } = data;
    const count = Math.floor((end - start) / step) + 1;
    // Simple deterministic random for missing
    const missingIndices = new Set();
    while (missingIndices.size < missingCount) {
        missingIndices.add(Math.floor(Math.random() * count));
    }

    return (
        <div className="w-full h-full flex items-center px-6">
            <div className="relative w-full h-1 bg-black flex justify-between items-center">
                <div className="absolute -left-2 w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-black"></div>
                <div className="absolute -right-2 w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-black"></div>
                
                {Array.from({length: count}).map((_, i) => {
                    const val = start + i * step;
                    const isMissing = missingIndices.has(i);
                    return (
                        <div key={i} className="relative flex flex-col items-center group">
                            <div className="w-0.5 h-3 bg-black"></div>
                            <div className="absolute top-4">
                                {isMissing ? (
                                    <div className="w-8 h-8 border-2 border-indigo-600 rounded bg-white flex items-center justify-center text-sm font-bold text-indigo-600">?</div>
                                ) : (
                                    <span className="font-bold text-sm">{val}</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const GeometryRenderer = ({ data }: { data: any }) => {
    const { shape, color, fill, label } = data;
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-2">
            <div className="w-24 h-24" style={{color: color}}>
                <Shape name={shape} className={`w-full h-full ${fill ? 'fill-current opacity-50' : 'fill-none stroke-current stroke-2'}`} />
            </div>
            {label && <div className="mt-2 font-bold text-sm"><EditableText value={label} tag="span" /></div>}
        </div>
    );
};

// --- MAIN STUDIO ---

const A4_WIDTH = 794; 
const A4_HEIGHT = 1123; // Min height

export const MathStudio: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useAuth();
    const [items, setItems] = useState<MathStudioItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [pageConfig, setPageConfig] = useState<MathPageConfig>({
        paperType: 'blank', gridSize: 20, margin: 40, orientation: 'portrait'
    });
    const [isSaved, setIsSaved] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    
    // AI Problem Generation State
    const [aiProblemPrompt, setAiProblemPrompt] = useState({ topic: '', difficulty: 'Orta', count: 1 });
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>('math'); 

    // Dynamic Page Height Calculation
    const pageHeight = useMemo(() => {
        if (items.length === 0) return A4_HEIGHT;
        const maxBottom = Math.max(...items.map(i => i.y + i.h));
        return Math.max(A4_HEIGHT, maxBottom + 50); // +50px padding at bottom
    }, [items]);

    // Default Items
    useEffect(() => {
        addItem('header');
    }, []);

    const addItem = (type: MathComponentType) => {
        const id = crypto.randomUUID();
        // Calculate next Y position (stacked)
        const lastItem = items[items.length - 1];
        const nextY = lastItem ? lastItem.y + lastItem.h + 20 : 40;
        
        // Default Full Width with margins
        const defaultWidth = A4_WIDTH - (pageConfig.margin * 2);

        let newItem: MathStudioItem = {
            id, type, x: pageConfig.margin, y: nextY, w: defaultWidth, h: 100
        };

        if (type === 'header') {
            newItem = { 
                ...newItem, y: 40, h: 100, 
                data: { title: 'MATEMATİK ÇALIŞMASI', subtitle: 'Ad Soyad:', showDate: true } 
            };
        } else if (type === 'operation_drill') {
            newItem = { 
                ...newItem, h: 400, 
                data: { count: 12, cols: 4, gap: 20, fontSize: 24, opType: 'add', difficulty: 'easy', orientation: 'vertical', showAnswer: false, operations: [] },
                settings: { rangeMin: 10, rangeMax: 99, digit1: 2, digit2: 1, allowCarry: true, allowBorrow: true, allowRemainder: false }
            };
            newItem.data.operations = generateMathDrillSet(12, 'add', newItem.settings);
        } else if (type === 'analog_clock') {
            newItem = { ...newItem, w: 150, h: 180, data: { time: '10:10', showNumbers: true, showMinuteMarks: true, label: 'Saat Kaç?' } };
        } else if (type === 'fraction_visual') {
            newItem = { ...newItem, w: 150, h: 150, data: { numerator: 1, denominator: 4, visualType: 'pie', showLabel: true } };
        } else if (type === 'word_problem') {
            newItem = { ...newItem, h: 150, data: { text: "Ali'nin 5 elması var. Ayşe ona 3 elma daha verdi. Toplam kaç elması oldu?", showWorkSpace: true, workspaceHeight: 80 } };
        } else if (type === 'number_line') {
            newItem = { ...newItem, h: 100, data: { start: 0, end: 10, step: 1, missingCount: 2, showTicks: true } };
        } else if (type === 'geometry_shape') {
            newItem = { ...newItem, w: 150, h: 150, data: { shape: 'circle', color: '#000000', fill: false, label: '' } };
        } else if (type === 'base10_block') {
            newItem = { ...newItem, h: 150, data: { number: 123, showLabel: true, layout: 'row' } };
        }

        setItems(prev => [...prev, newItem]);
        setSelectedId(id);
    };

    const updateItem = (id: string, updates: any) => {
        setItems(prev => prev.map(item => {
            if (item.id !== id) return item;
            const updated = { ...item, ...updates };
            
            // Re-generate drills if config changes
            if (item.type === 'operation_drill' && (updates.data?.opType || updates.settings || updates.data?.count)) {
                const s = updated.settings || item.settings;
                const d = updated.data;
                const finalData = { ...item.data, ...updates.data };
                const finalSettings = { ...item.settings, ...updates.settings };
                
                updated.data.operations = generateMathDrillSet(finalData.count, finalData.opType, {
                    min: finalSettings.rangeMin, max: finalSettings.rangeMax, 
                    digit1: finalSettings.digit1, digit2: finalSettings.digit2,
                    allowCarry: finalSettings.allowCarry, allowBorrow: finalSettings.allowBorrow, allowRemainder: finalSettings.allowRemainder
                });
            }
            return updated;
        }));
        setIsSaved(false);
    };
    
    // Feature: Resize Height to Fit Content (Smart Resize)
    const handleFitHeight = (id: string) => {
        const item = items.find(i => i.id === id);
        if (!item || item.type !== 'operation_drill') return;

        const { count, cols, fontSize, orientation, gap } = item.data;
        const rows = Math.ceil(count / cols);
        
        // Estimated height calculation
        const opHeight = orientation === 'vertical' ? (fontSize * 4.5) : (fontSize * 2.5); // Approximate visual height per item
        const totalHeight = (rows * opHeight) + ((rows - 1) * gap) + 40; // +40 padding
        
        updateItem(id, { h: totalHeight });
    };

    const removeItem = (id: string) => {
        if(confirm("Bileşeni silmek istediğinize emin misiniz?")) {
            setItems(prev => prev.filter(i => i.id !== id));
            setSelectedId(null);
        }
    };

    const handleAiGenerateProblem = async () => {
        if (!aiProblemPrompt.topic) return;
        setIsGenerating(true);
        try {
            const result = await generateFromRichPrompt(
                'REAL_LIFE_MATH_PROBLEMS', 
                `Konu: ${aiProblemPrompt.topic}. Zorluk: ${aiProblemPrompt.difficulty}. Tek bir matematik problemi yaz.`, 
                { difficulty: aiProblemPrompt.difficulty as any, worksheetCount: 1, itemCount: 1, mode: 'ai' }
            );
            const problemText = result[0]?.sections?.[0]?.content?.[0]?.text || result[0]?.items?.[0]?.text || "AI tarafından üretilen problem metni buraya gelecek.";
            const id = crypto.randomUUID();
            
            // Auto position at bottom
            const lastItem = items[items.length - 1];
            const nextY = lastItem ? lastItem.y + lastItem.h + 20 : 40;
            
            const newItem: MathStudioItem = {
                id, type: 'word_problem', x: pageConfig.margin, y: nextY, w: A4_WIDTH - (pageConfig.margin * 2), h: 150,
                data: { text: problemText, showWorkSpace: true, workspaceHeight: 80 }
            };
            setItems(prev => [...prev, newItem]);
            setSelectedId(id);
        } catch (e) {
            alert("AI Problem üretimi başarısız.");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- TOOLBAR ---
    const ToolboxCategory = ({ id, label, icon }: { id: string, label: string, icon: string }) => (
        <button 
            onClick={() => setActiveCategory(id)}
            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${activeCategory === id ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800'}`}
        >
            <i className={`fa-solid ${icon}`}></i>
            <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        </button>
    );

    const ToolboxItem = ({ type, label, icon }: { type: MathComponentType, label: string, icon: string }) => (
        <button 
            onClick={() => addItem(type)}
            className="flex flex-col items-center justify-center p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-zinc-700 transition-all group aspect-square"
        >
            <i className={`fa-solid ${icon} text-2xl text-zinc-400 group-hover:text-blue-400 mb-2`}></i>
            <span className="text-[9px] font-bold uppercase text-zinc-500 group-hover:text-zinc-300 text-center leading-tight">{label}</span>
        </button>
    );

    const selectedItem = items.find(i => i.id === selectedId);
    
    return (
        <div className="h-full flex flex-col bg-[#121212] text-white overflow-hidden">
            {/* Header */}
            <div className="h-16 bg-[#18181b] border-b border-zinc-800 flex justify-between items-center px-6 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center"><i className="fa-solid fa-arrow-left"></i></button>
                    <h1 className="font-black text-xl tracking-tight text-blue-500">MATH STUDIO <span className="text-white opacity-50 font-normal text-sm">PRO</span></h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => printService.generatePdf('#math-canvas-root', 'Matematik', { action: 'print' })} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-bold text-sm"><i className="fa-solid fa-print mr-2"></i> Yazdır</button>
                    <button onClick={() => setIsSaved(true)} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm shadow-lg shadow-blue-900/20"><i className="fa-solid fa-save mr-2"></i> Kaydet</button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left: Toolbox Categories */}
                <div className="w-48 bg-[#18181b] border-r border-zinc-800 flex flex-col p-2 gap-1">
                    <div className="mb-4 px-2 pt-2"><p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">ARAÇ KUTUSU</p></div>
                    <ToolboxCategory id="math" label="Sayılar & İşlem" icon="fa-calculator" />
                    <ToolboxCategory id="visual" label="Görsel Materyal" icon="fa-shapes" />
                    <ToolboxCategory id="basic" label="Temel Araçlar" icon="fa-layer-group" />
                    <div className="mt-auto border-t border-zinc-800 pt-4 p-2">
                        <div className="p-3 bg-zinc-800 rounded-xl border border-zinc-700">
                            <p className="text-[10px] text-zinc-400 mb-2">Yapay Zeka Asistanı</p>
                            <input type="text" placeholder="Konu (örn: Uzay)" value={aiProblemPrompt.topic} onChange={e => setAiProblemPrompt({...aiProblemPrompt, topic: e.target.value})} className="w-full p-2 bg-black border border-zinc-600 rounded text-xs mb-2" />
                            <button onClick={handleAiGenerateProblem} disabled={isGenerating} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-[10px] font-bold">{isGenerating ? '...' : 'Problem Üret'}</button>
                        </div>
                    </div>
                </div>

                {/* Left: Toolbox Items (Sub-menu) */}
                <div className="w-40 bg-[#202023] border-r border-zinc-800 flex flex-col p-3 gap-3 overflow-y-auto custom-scrollbar">
                    {activeCategory === 'basic' && (
                        <>
                            <ToolboxItem type="header" label="Başlık Alanı" icon="fa-heading" />
                            <ToolboxItem type="text_block" label="Metin Kutusu" icon="fa-font" />
                        </>
                    )}
                    {activeCategory === 'math' && (
                        <>
                            <ToolboxItem type="operation_drill" label="İşlem Izgarası" icon="fa-table-cells" />
                            <ToolboxItem type="word_problem" label="Sözel Problem" icon="fa-book-open" />
                            <ToolboxItem type="number_line" label="Sayı Doğrusu" icon="fa-left-right" />
                            <ToolboxItem type="base10_block" label="Onluk Blok" icon="fa-cubes" />
                        </>
                    )}
                    {activeCategory === 'visual' && (
                        <>
                            <ToolboxItem type="analog_clock" label="Analog Saat" icon="fa-clock" />
                            <ToolboxItem type="fraction_visual" label="Kesir Pastası" icon="fa-chart-pie" />
                            <ToolboxItem type="geometry_shape" label="Geometrik Şekil" icon="fa-shapes" />
                        </>
                    )}
                </div>

                {/* Center: Canvas */}
                <div className="flex-1 bg-[#09090b] relative overflow-auto flex justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] custom-scrollbar">
                    <div 
                        id="math-canvas-root"
                        className="bg-white text-black shadow-2xl transition-all relative"
                        style={{ 
                            width: `${A4_WIDTH}px`, 
                            minHeight: `${A4_HEIGHT}px`,
                            height: `${pageHeight}px`, // Dynamic Height
                            backgroundImage: pageConfig.paperType === 'grid' 
                                ? 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)' 
                                : pageConfig.paperType === 'dot' 
                                    ? 'radial-gradient(#9ca3af 1px, transparent 1px)' 
                                    : 'none',
                            backgroundSize: pageConfig.paperType === 'dot' ? '20px 20px' : '40px 40px'
                        }}
                        onClick={() => setSelectedId(null)}
                    >
                        {items.map(item => (
                            <div 
                                key={item.id}
                                onClick={(e) => { e.stopPropagation(); setSelectedId(item.id); }}
                                className={`absolute group hover:ring-2 hover:ring-blue-300 transition-shadow cursor-move ${selectedId === item.id ? 'ring-2 ring-blue-600 z-10' : ''}`}
                                style={{ 
                                    left: item.x, top: item.y, width: item.w, height: item.h,
                                }}
                            >
                                {/* Content Renderers */}
                                {item.type === 'header' && (
                                    <div className="w-full h-full flex flex-col justify-end border-b-2 border-black pb-2 px-8">
                                        <h1 className="text-3xl font-black uppercase text-center"><EditableText value={item.data.title} /></h1>
                                        <div className="flex justify-between mt-2 font-bold text-sm">
                                            <span>{item.data.subtitle}</span>
                                            {item.data.showDate && <span>Tarih: ........................</span>}
                                        </div>
                                    </div>
                                )}
                                {item.type === 'operation_drill' && <DrillRenderer item={item} />}
                                {item.type === 'analog_clock' && <ClockRenderer data={item.data} />}
                                {item.type === 'fraction_visual' && <FractionRenderer data={item.data} />}
                                {item.type === 'word_problem' && <WordProblemRenderer item={item} />}
                                {item.type === 'number_line' && <NumberLineRenderer data={item.data} />}
                                {item.type === 'geometry_shape' && <GeometryRenderer data={item.data} />}
                                {item.type === 'base10_block' && <Base10Visualizer number={item.data.number} className="w-full h-full" />}

                                {/* Handles */}
                                {selectedId === item.id && (
                                    <>
                                        <div className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white cursor-pointer shadow-md hover:scale-110" onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}>
                                            <i className="fa-solid fa-times text-xs"></i>
                                        </div>
                                        <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-blue-500 rounded-full cursor-se-resize shadow-md"></div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Properties Panel */}
                <div className="w-80 bg-[#18181b] border-l border-zinc-800 flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="p-4 border-b border-zinc-800 bg-[#202023]">
                        <h3 className="font-bold text-zinc-400 text-xs uppercase tracking-widest">
                            {selectedItem ? 'Bileşen Özellikleri' : 'Sayfa Ayarları'}
                        </h3>
                    </div>

                    <div className="p-4 space-y-6">
                        {!selectedItem ? (
                            <div>
                                <label className="text-xs font-bold text-zinc-500 mb-2 block">Kağıt Tipi</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['blank', 'grid', 'dot'].map(t => (
                                        <button 
                                            key={t}
                                            onClick={() => setPageConfig({...pageConfig, paperType: t as any})}
                                            className={`p-2 rounded border text-xs capitalize ${pageConfig.paperType === t ? 'bg-blue-600 border-blue-600' : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'}`}
                                        >
                                            {t === 'blank' ? 'Boş' : t === 'grid' ? 'Kareli' : 'Noktalı'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {selectedItem.type === 'operation_drill' && (
                                    <>
                                        <div><label className="text-xs font-bold text-zinc-500 mb-2 block">İşlem</label><select value={selectedItem.data.opType} onChange={e => updateItem(selectedItem.id, { data: { ...selectedItem.data, opType: e.target.value } })} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200"><option value="add">Toplama</option><option value="sub">Çıkarma</option><option value="mult">Çarpma</option><option value="div">Bölme</option><option value="mixed">Karışık</option></select></div>
                                        
                                        <div className="bg-zinc-800 p-3 rounded-lg border border-zinc-700 space-y-3">
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Basamak Ayarları</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[9px] text-zinc-500 block mb-1">1. Sayı</label>
                                                    <select value={selectedItem.settings.digit1} onChange={e => updateItem(selectedItem.id, { settings: { ...selectedItem.settings, digit1: Number(e.target.value) } })} className="w-full p-1 bg-zinc-900 border border-zinc-600 rounded text-xs text-zinc-200">
                                                        <option value="1">1 Basamak</option>
                                                        <option value="2">2 Basamak</option>
                                                        <option value="3">3 Basamak</option>
                                                        <option value="4">4 Basamak</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[9px] text-zinc-500 block mb-1">2. Sayı</label>
                                                    <select value={selectedItem.settings.digit2} onChange={e => updateItem(selectedItem.id, { settings: { ...selectedItem.settings, digit2: Number(e.target.value) } })} className="w-full p-1 bg-zinc-900 border border-zinc-600 rounded text-xs text-zinc-200">
                                                        <option value="1">1 Basamak</option>
                                                        <option value="2">2 Basamak</option>
                                                        <option value="3">3 Basamak</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="pt-2 border-t border-zinc-700">
                                                 <label className="flex items-center gap-2 cursor-pointer mb-1"><input type="checkbox" checked={selectedItem.settings.allowCarry} onChange={e => updateItem(selectedItem.id, { settings: { ...selectedItem.settings, allowCarry: e.target.checked } })} /><span className="text-xs">Eldeli / Onluk Bozma</span></label>
                                                 <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={selectedItem.settings.allowRemainder} onChange={e => updateItem(selectedItem.id, { settings: { ...selectedItem.settings, allowRemainder: e.target.checked } })} /><span className="text-xs">Kalanlı Bölme</span></label>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            <div><label className="text-[9px] font-bold text-zinc-500 block">Sütun</label><input type="number" value={selectedItem.data.cols} onChange={e => updateItem(selectedItem.id, { data: { ...selectedItem.data, cols: Number(e.target.value) } })} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200" /></div>
                                            <div><label className="text-[9px] font-bold text-zinc-500 block">Boşluk</label><input type="number" value={selectedItem.data.gap} onChange={e => updateItem(selectedItem.id, { data: { ...selectedItem.data, gap: Number(e.target.value) } })} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200" /></div>
                                        </div>
                                        <div><label className="text-[9px] font-bold text-zinc-500 block">Font</label><input type="number" value={selectedItem.data.fontSize} onChange={e => updateItem(selectedItem.id, { data: { ...selectedItem.data, fontSize: Number(e.target.value) } })} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200" /></div>
                                        
                                        <button onClick={() => handleFitHeight(selectedItem.id)} className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-bold text-white transition-colors flex items-center justify-center gap-2"><i className="fa-solid fa-arrows-up-down"></i> İçeriğe Göre Boyutlandır</button>
                                    </>
                                )}

                                {selectedItem.type === 'number_line' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div><label className="text-[9px] font-bold text-zinc-500 block">Başlangıç</label><input type="number" value={selectedItem.data.start} onChange={e => updateItem(selectedItem.id, { data: { ...selectedItem.data, start: Number(e.target.value) } })} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200" /></div>
                                            <div><label className="text-[9px] font-bold text-zinc-500 block">Bitiş</label><input type="number" value={selectedItem.data.end} onChange={e => updateItem(selectedItem.id, { data: { ...selectedItem.data, end: Number(e.target.value) } })} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200" /></div>
                                        </div>
                                        <div><label className="text-[9px] font-bold text-zinc-500 block">Artış Miktarı</label><input type="number" value={selectedItem.data.step} onChange={e => updateItem(selectedItem.id, { data: { ...selectedItem.data, step: Number(e.target.value) } })} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200" /></div>
                                    </>
                                )}

                                <div className="pt-6 mt-6 border-t border-zinc-800">
                                    <h4 className="text-xs font-bold text-zinc-400 mb-2 uppercase">Konum & Boyut</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="text-[9px] text-zinc-500 block">X</label><input type="number" value={selectedItem.x} onChange={e => updateItem(selectedItem.id, { x: Number(e.target.value) })} className="w-full p-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200" /></div>
                                        <div><label className="text-[9px] text-zinc-500 block">Y</label><input type="number" value={selectedItem.y} onChange={e => updateItem(selectedItem.id, { y: Number(e.target.value) })} className="w-full p-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200" /></div>
                                        <div><label className="text-[9px] text-zinc-500 block">W</label><input type="number" value={selectedItem.w} onChange={e => updateItem(selectedItem.id, { w: Number(e.target.value) })} className="w-full p-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200" /></div>
                                        <div><label className="text-[9px] text-zinc-500 block">H</label><input type="number" value={selectedItem.h} onChange={e => updateItem(selectedItem.id, { h: Number(e.target.value) })} className="w-full p-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200" /></div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onShare={() => {}} />
        </div>
    );
};
