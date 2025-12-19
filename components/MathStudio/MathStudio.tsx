
import React, { useState, useEffect, useMemo } from 'react';
import { MathComponentType, MathPageConfig } from '../../types/math';
import { generateMathDrillSet } from '../../services/offlineGenerators/mathStudio';
import { useAuth } from '../../context/AuthContext';
import { printService } from '../../utils/printService';
import { EditableText } from '../Editable';
import { ShareModal } from '../ShareModal';
import { Base10Visualizer, Shape } from '../sheets/common';

// --- HELPER GENERATORS ---

const generateClockData = (count: number, mode: string) => {
    return Array.from({ length: count }, () => {
        let h = Math.floor(Math.random() * 12) + 1;
        let m = 0;
        if (mode === 'easy') m = Math.random() > 0.5 ? 0 : 30;
        else if (mode === 'medium') m = Math.floor(Math.random() * 4) * 15;
        else m = Math.floor(Math.random() * 12) * 5;
        return { h, m };
    });
};

const generateFractionData = (count: number, denominatorLimit: number) => {
    return Array.from({ length: count }, () => {
        const den = Math.floor(Math.random() * (denominatorLimit - 1)) + 2;
        const num = Math.floor(Math.random() * den) + 1;
        return { num, den };
    });
};

const generateShapeData = (count: number) => {
    const shapes = ['circle', 'square', 'triangle', 'hexagon', 'star', 'pentagon'];
    return Array.from({ length: count }, () => ({
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: '#000000'
    }));
};

const generateNumberLineData = (count: number, range: number) => {
    return Array.from({ length: count }, () => {
        const start = Math.floor(Math.random() * (range - 10));
        const step = Math.floor(Math.random() * 3) + 1;
        return { start, end: start + (step * 10), step };
    });
};

// --- VISUAL RENDERERS (ATOMIC) ---

const AtomicClock = ({ h, m, showNumbers, showMinuteMarks, label }: any) => {
    const r = 40;
    const hDeg = (h % 12) * 30 + m * 0.5;
    const mDeg = m * 6;

    return (
        <div className="flex flex-col items-center justify-center p-4 border border-zinc-200 rounded-xl bg-white h-full">
            <svg viewBox="0 0 100 100" className="w-full h-auto max-w-[100px]">
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
            <div className="mt-2 w-16 border-b-2 border-dashed border-zinc-300 h-6"></div>
        </div>
    );
};

const AtomicFraction = ({ num, den, visualType, showLabel }: any) => {
    return (
        <div className="flex flex-col items-center justify-center p-4 border border-zinc-200 rounded-xl bg-white h-full">
             {visualType === 'pie' ? (
                 <svg viewBox="0 0 100 100" className="w-20 h-20 overflow-visible">
                     {Array.from({length: den}).map((_, i) => {
                        const start = (i * 360) / den;
                        const end = ((i + 1) * 360) / den;
                        const large = end - start > 180 ? 1 : 0;
                        const x1 = 50 + 45 * Math.cos(Math.PI * (start - 90) / 180);
                        const y1 = 50 + 45 * Math.sin(Math.PI * (start - 90) / 180);
                        const x2 = 50 + 45 * Math.cos(Math.PI * (end - 90) / 180);
                        const y2 = 50 + 45 * Math.sin(Math.PI * (end - 90) / 180);
                        const d = `M 50 50 L ${x1} ${y1} A 45 45 0 ${large} 1 ${x2} ${y2} Z`;
                        return <path key={i} d={d} fill={i < num ? '#60a5fa' : 'white'} stroke="black" strokeWidth="1" />;
                     })}
                     <circle cx="50" cy="50" r="45" fill="none" stroke="black" strokeWidth="2" />
                 </svg>
             ) : (
                <div className="flex w-full h-8 border-2 border-black rounded overflow-hidden">
                    {Array.from({length: den}).map((_, i) => (
                        <div key={i} className={`flex-1 border-r border-black last:border-r-0 ${i < num ? 'bg-blue-400' : 'bg-white'}`}></div>
                    ))}
                </div>
             )}
             {showLabel && <div className="mt-2 font-bold text-lg">{num}/{den}</div>}
             {!showLabel && <div className="mt-2 w-12 h-8 border border-zinc-300 rounded"></div>}
        </div>
    );
};

const AtomicNumberLine = ({ start, end, step }: any) => {
    const count = Math.floor((end - start) / step) + 1;
    return (
        <div className="w-full h-24 flex items-center px-4 border border-zinc-200 rounded-xl bg-white mb-4">
            <div className="relative w-full h-1 bg-black flex justify-between items-center">
                <div className="absolute -left-2 w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-black"></div>
                <div className="absolute -right-2 w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-black"></div>
                
                {Array.from({length: count}).map((_, i) => {
                    const val = start + i * step;
                    const isMissing = Math.random() > 0.7; // Randomly hide
                    return (
                        <div key={i} className="relative flex flex-col items-center">
                            <div className="w-0.5 h-3 bg-black"></div>
                            <div className="absolute top-4 font-bold text-sm">
                                {isMissing ? <div className="w-6 h-6 border rounded bg-zinc-50"></div> : val}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AtomicDrill = ({ op, orientation, fontSize, showAnswer }: any) => {
    const isVertical = orientation === 'vertical';
    return (
        <div className={`flex justify-center items-center font-mono font-bold border border-zinc-200 rounded-xl bg-white p-4 h-full ${isVertical ? 'flex-col items-end' : 'flex-row gap-2'}`} style={{fontSize: `${fontSize}px`}}>
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
                    <span className={`text-indigo-600 ${!showAnswer ? 'text-transparent border-b-2 border-black min-w-[40px] text-center' : ''}`}>{op.ans}</span>
                </>
            )}
        </div>
    );
};

// --- MAIN STUDIO ---

const A4_WIDTH = 794; 
const A4_HEIGHT = 1123; 

// Initial Config State
const DEFAULT_CONFIG = {
    // General
    count: 20,
    cols: 4,
    gap: 16,
    
    // Drill
    opType: 'add',
    orientation: 'vertical',
    fontSize: 24,
    showAnswer: false,
    rangeMin: 10,
    rangeMax: 99,
    
    // Clock
    clockMode: 'medium', // easy, medium, hard
    showMinuteMarks: true,
    
    // Fraction
    fractionType: 'pie',
    
    // Shape
    shapeType: 'mixed'
};

export const MathStudio: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useAuth();
    
    // State
    const [activeTool, setActiveTool] = useState<MathComponentType | null>(null); // 'operation_drill', 'analog_clock' etc.
    const [activeCategory, setActiveCategory] = useState<string>('math');
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [generatedData, setGeneratedData] = useState<any[]>([]);
    
    const [pageConfig, setPageConfig] = useState<MathPageConfig>({
        paperType: 'blank', gridSize: 20, margin: 40, orientation: 'portrait'
    });
    const [isSaved, setIsSaved] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [headerText, setHeaderText] = useState({ title: 'MATEMATİK ÇALIŞMASI', subtitle: 'Ad Soyad:' });

    // --- GENERATION EFFECT ---
    useEffect(() => {
        if (!activeTool) return;

        let data: any[] = [];

        if (activeTool === 'operation_drill') {
            data = generateMathDrillSet(config.count, config.opType as any, {
                min: config.rangeMin, max: config.rangeMax,
                digit1: 0, digit2: 0, // auto
                allowCarry: true, allowBorrow: true, allowRemainder: false
            });
        } else if (activeTool === 'analog_clock') {
            data = generateClockData(config.count, config.clockMode);
        } else if (activeTool === 'fraction_visual') {
            data = generateFractionData(config.count, 12);
        } else if (activeTool === 'geometry_shape') {
            data = generateShapeData(config.count);
        } else if (activeTool === 'number_line') {
            data = generateNumberLineData(config.count, config.rangeMax);
        } else if (activeTool === 'base10_block') {
            data = Array.from({length: config.count}, () => ({ number: Math.floor(Math.random() * 100) + 1 }));
        }

        setGeneratedData(data);
        setIsSaved(false);
    }, [activeTool, config]);

    // Initialize with Drill
    useEffect(() => {
        if (!activeTool) setActiveTool('operation_drill');
    }, []);

    // --- RENDERERS ---

    const renderCanvasContent = () => {
        if (!activeTool || generatedData.length === 0) return null;

        // Custom Layout for Number Lines (List View)
        if (activeTool === 'number_line') {
             return (
                 <div className="flex flex-col gap-6 w-full">
                     {generatedData.map((item, i) => (
                         <AtomicNumberLine key={i} {...item} />
                     ))}
                 </div>
             );
        }

        // Grid Layout for others
        return (
            <div 
                className="grid w-full"
                style={{
                    gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
                    gap: `${config.gap}px`
                }}
            >
                {generatedData.map((item, i) => (
                    <div key={i} className="w-full aspect-square md:aspect-auto">
                        {activeTool === 'operation_drill' && <AtomicDrill op={item} {...config} />}
                        {activeTool === 'analog_clock' && <AtomicClock {...item} showMinuteMarks={config.showMinuteMarks} showNumbers={true} />}
                        {activeTool === 'fraction_visual' && <AtomicFraction {...item} visualType={config.fractionType} showLabel={true} />}
                        {activeTool === 'geometry_shape' && (
                             <div className="flex flex-col items-center justify-center p-2 border border-zinc-200 rounded-xl bg-white h-full">
                                 <div className="w-20 h-20 text-black">
                                     <Shape name={item.shape} className="w-full h-full stroke-2" />
                                 </div>
                                 <div className="mt-2 w-16 border-b border-black"></div>
                             </div>
                        )}
                        {activeTool === 'base10_block' && (
                            <div className="flex flex-col items-center justify-center p-2 border border-zinc-200 rounded-xl bg-white h-full overflow-hidden">
                                <Base10Visualizer number={item.number} className="scale-75 origin-center" />
                                <div className="mt-2 w-12 border-b border-black text-center font-bold text-transparent">.</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
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
            onClick={() => setActiveTool(type)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all group aspect-square ${activeTool === type ? 'bg-indigo-600 border-indigo-500 ring-2 ring-indigo-400/30' : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'}`}
        >
            <i className={`fa-solid ${icon} text-2xl mb-2 ${activeTool === type ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}></i>
            <span className={`text-[9px] font-bold uppercase text-center leading-tight ${activeTool === type ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>{label}</span>
        </button>
    );
    
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
                </div>

                {/* Left: Toolbox Items (Sub-menu) */}
                <div className="w-40 bg-[#202023] border-r border-zinc-800 flex flex-col p-3 gap-3 overflow-y-auto custom-scrollbar">
                    {activeCategory === 'math' && (
                        <>
                            <ToolboxItem type="operation_drill" label="İşlem Izgarası" icon="fa-table-cells" />
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
                        className="bg-white text-black shadow-2xl transition-all relative flex flex-col"
                        style={{ 
                            width: `${A4_WIDTH}px`, 
                            minHeight: `${A4_HEIGHT}px`,
                            height: 'auto', // Allow growth
                            padding: `${pageConfig.margin}px`,
                            backgroundImage: pageConfig.paperType === 'grid' 
                                ? 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)' 
                                : pageConfig.paperType === 'dot' 
                                    ? 'radial-gradient(#9ca3af 1px, transparent 1px)' 
                                    : 'none',
                            backgroundSize: pageConfig.paperType === 'dot' ? '20px 20px' : '40px 40px'
                        }}
                    >
                        {/* Header Area */}
                        <div className="w-full flex flex-col justify-end border-b-2 border-black pb-2 mb-8">
                            <h1 className="text-3xl font-black uppercase text-center"><EditableText value={headerText.title} onChange={v => setHeaderText(prev => ({...prev, title: v}))} /></h1>
                            <div className="flex justify-between mt-2 font-bold text-sm">
                                <span><EditableText value={headerText.subtitle} onChange={v => setHeaderText(prev => ({...prev, subtitle: v}))} /></span>
                                <span>Tarih: ........................</span>
                            </div>
                        </div>

                        {/* Dynamic Content Grid */}
                        <div className="flex-1">
                            {renderCanvasContent()}
                        </div>
                        
                        {/* Footer Padding */}
                        <div className="h-10 mt-8 text-center text-xs text-zinc-300">Sayfa 1</div>
                    </div>
                </div>

                {/* Right: Properties Panel */}
                <div className="w-80 bg-[#18181b] border-l border-zinc-800 flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="p-4 border-b border-zinc-800 bg-[#202023]">
                        <h3 className="font-bold text-zinc-400 text-xs uppercase tracking-widest">
                            Ayarlar
                        </h3>
                    </div>

                    <div className="p-4 space-y-6">
                        
                        {/* COMMON SETTINGS */}
                        <div className="space-y-4 border-b border-zinc-800 pb-6">
                             <div>
                                <label className="text-xs font-bold text-zinc-500 mb-2 block">Adet (Soru Sayısı)</label>
                                <input type="range" min="1" max="60" value={config.count} onChange={e => setConfig({...config, count: Number(e.target.value)})} className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                                <div className="text-right text-xs text-zinc-300 font-mono mt-1">{config.count} Adet</div>
                            </div>
                            
                            {activeTool !== 'number_line' && (
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 mb-2 block">Sütun Sayısı</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[1, 2, 3, 4].map(c => (
                                            <button key={c} onClick={() => setConfig({...config, cols: c})} className={`py-1 rounded text-xs font-bold ${config.cols === c ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>{c}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                             <div>
                                <label className="text-xs font-bold text-zinc-500 mb-2 block">Kağıt Tipi</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['blank', 'grid', 'dot'].map(t => (
                                        <button 
                                            key={t}
                                            onClick={() => setPageConfig({...pageConfig, paperType: t as any})}
                                            className={`p-1 rounded text-[10px] capitalize ${pageConfig.paperType === t ? 'bg-zinc-200 text-black' : 'bg-zinc-800 text-zinc-500'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* SPECIFIC SETTINGS */}
                        {activeTool === 'operation_drill' && (
                            <div className="space-y-4">
                                <div><label className="text-xs font-bold text-zinc-500 mb-2 block">İşlem</label><select value={config.opType} onChange={e => setConfig({...config, opType: e.target.value})} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200"><option value="add">Toplama</option><option value="sub">Çıkarma</option><option value="mult">Çarpma</option><option value="div">Bölme</option><option value="mixed">Karışık</option></select></div>
                                
                                <div className="flex items-center gap-4">
                                     <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={config.orientation === 'vertical'} onChange={() => setConfig({...config, orientation: 'vertical'})} /><span className="text-xs text-zinc-300">Alt Alta</span></label>
                                     <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={config.orientation === 'horizontal'} onChange={() => setConfig({...config, orientation: 'horizontal'})} /><span className="text-xs text-zinc-300">Yan Yana</span></label>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div><label className="text-[9px] font-bold text-zinc-500 block">Min Sayı</label><input type="number" value={config.rangeMin} onChange={e => setConfig({...config, rangeMin: Number(e.target.value)})} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200" /></div>
                                    <div><label className="text-[9px] font-bold text-zinc-500 block">Max Sayı</label><input type="number" value={config.rangeMax} onChange={e => setConfig({...config, rangeMax: Number(e.target.value)})} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200" /></div>
                                </div>
                            </div>
                        )}

                        {activeTool === 'analog_clock' && (
                             <div><label className="text-xs font-bold text-zinc-500 mb-2 block">Zorluk</label><select value={config.clockMode} onChange={e => setConfig({...config, clockMode: e.target.value})} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200"><option value="easy">Tam ve Yarım</option><option value="medium">Çeyrekler</option><option value="hard">Tüm Dakikalar</option></select></div>
                        )}
                        
                        {activeTool === 'fraction_visual' && (
                             <div><label className="text-xs font-bold text-zinc-500 mb-2 block">Görsel</label><select value={config.fractionType} onChange={e => setConfig({...config, fractionType: e.target.value})} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200"><option value="pie">Pasta</option><option value="bar">Çubuk</option></select></div>
                        )}

                    </div>
                </div>
            </div>
            
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onShare={() => {}} />
        </div>
    );
};
