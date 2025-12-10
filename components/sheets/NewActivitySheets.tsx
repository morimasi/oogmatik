
import React from 'react';
import { FamilyRelationsData, LogicDeductionData, NumberBoxLogicData, MapInstructionData, MindGamesData, MindGames56Data } from '../../types';
import { PedagogicalHeader, GridComponent, ImageDisplay } from './common';
import { EditableElement, EditableText } from '../Editable';

// --- TURKEY MAP COMPONENT ---
const TurkeyMapSVG = ({ cities }: { cities: { name: string, x: number, y: number }[] }) => {
    // More realistic simplified path for Turkey
    const turkeyPath = "M 137,78 C 150,75 165,72 180,70 L 220,60 L 270,50 L 330,45 L 400,42 L 480,45 L 550,42 L 620,45 L 680,55 L 720,65 L 750,80 L 765,110 L 760,140 L 740,160 L 710,180 L 650,190 L 600,195 L 550,220 L 500,230 L 450,235 L 400,230 L 350,240 L 300,245 L 250,235 L 200,220 L 150,200 L 100,180 L 60,160 L 40,130 L 50,100 L 90,90 Z";

    // Detailed Polygon Points approximating Turkey's shape for a better look
    const realTurkeyPath = "M172,69 L227,53 L336,44 L460,42 L578,44 L677,53 L732,69 L752,95 L755,125 L735,150 L690,165 L630,175 L580,180 L545,215 L490,225 L440,220 L385,235 L335,245 L285,235 L245,220 L205,200 L160,185 L125,170 L95,145 L85,115 L125,95 Z";

    return (
        <div className="relative w-full aspect-[2/1] bg-blue-100 rounded-xl border-4 border-blue-200 overflow-hidden shadow-md">
            {/* Sea Background Texture */}
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
            
            <svg viewBox="0 0 800 400" className="w-full h-full absolute inset-0">
                {/* Land Mass */}
                <path d={realTurkeyPath} fill="#fde68a" stroke="#d97706" strokeWidth="3" className="drop-shadow-lg" />
                
                {/* Internal Decorative Grid (Longitude/Latitude style) */}
                <path d="M 200,50 L 200,250 M 400,40 L 400,250 M 600,40 L 600,200" stroke="#d97706" strokeWidth="0.5" strokeDasharray="5,5" opacity="0.3" />
                <path d="M 100,100 L 750,100 M 100,180 L 700,180" stroke="#d97706" strokeWidth="0.5" strokeDasharray="5,5" opacity="0.3" />

                {/* Cities */}
                {(cities || []).map(city => (
                    <g key={city.name} transform={`translate(${city.x * 8}, ${city.y * 4})`} className="group cursor-pointer">
                        {/* City Marker */}
                        <circle cx="0" cy="0" r="6" fill="#ef4444" stroke="white" strokeWidth="2" className="transition-all duration-300 group-hover:r-8 shadow-sm" />
                        <circle cx="0" cy="0" r="10" fill="transparent" stroke="#ef4444" strokeWidth="1" opacity="0.3" className="animate-ping" />
                        
                        {/* City Label */}
                        <rect x="-30" y="-25" width="60" height="18" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        <text x="0" y="-13" fontSize="10" textAnchor="middle" fontWeight="bold" fill="#374151" className="opacity-0 group-hover:opacity-100 transition-opacity select-none">{city.name}</text>
                        
                        {/* Permanent Label (Small) */}
                        {/* Use foreignObject for editable text if needed, but SVG text is tricky. Keeping as static label for map clarity unless requested */}
                        <text x="0" y="14" fontSize="9" textAnchor="middle" fontWeight="bold" fill="#1f2937" className="select-none pointer-events-none drop-shadow-sm filter bg-white/50">{city.name}</text>
                    </g>
                ))}
            </svg>
            
            {/* Compass */}
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/80 rounded-full border border-zinc-300 flex items-center justify-center shadow-sm">
                <span className="text-xl font-bold text-zinc-700">K</span>
                <div className="absolute w-1 h-3 bg-red-500 -mt-3"></div>
            </div>
        </div>
    );
};

export const FamilyRelationsSheet: React.FC<{ data: FamilyRelationsData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        
        <div className="flex flex-col md:flex-row justify-center gap-16 mt-8 relative">
            <div className="w-full md:w-2/5 space-y-6">
                <h4 className="font-bold text-center border-b-2 pb-2 text-zinc-600">Tanımlar</h4>
                {(data.leftColumn || []).map(item => (
                    <EditableElement key={item.id} className="flex items-center gap-4 p-3 border-2 border-zinc-200 rounded-lg bg-white shadow-sm h-16 justify-between">
                        <span className="flex-1 text-sm text-zinc-700"><EditableText value={item.text} tag="span" /></span>
                        <div className="w-4 h-4 bg-zinc-700 rounded-full cursor-pointer"></div>
                    </EditableElement>
                ))}
            </div>
            <div className="w-full md:w-2/5 space-y-6">
                <h4 className="font-bold text-center border-b-2 pb-2 text-zinc-600">Akrabalar</h4>
                 {(data.rightColumn || []).map(item => (
                    <EditableElement key={item.id} className="flex items-center gap-4 p-3 border-2 border-zinc-200 rounded-lg bg-white shadow-sm h-16">
                        <div className="w-4 h-4 bg-zinc-700 rounded-full cursor-pointer"></div>
                        <span className="flex-1 text-center font-bold text-lg capitalize text-zinc-800"><EditableText value={item.text} tag="span" /></span>
                    </EditableElement>
                ))}
            </div>
        </div>
    </div>
);

export const LogicDeductionSheet: React.FC<{ data: LogicDeductionData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        <div className="space-y-6">
            {(data.questions || []).map((q, index) => (
                <EditableElement key={index} className="p-5 bg-white rounded-xl border border-zinc-200 shadow-sm break-inside-avoid">
                    <div className="flex items-start gap-3 mb-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">{index + 1}</span>
                        <p className="font-medium text-base pt-1 text-zinc-700"><EditableText value={q.riddle} tag="span" /></p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-11">
                        {(q.options || []).map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center group cursor-pointer p-2 border rounded-lg hover:bg-zinc-50 transition-colors">
                                <div className="w-5 h-5 border-2 border-zinc-300 rounded-full mr-3 group-hover:border-indigo-500"></div>
                                <label className="text-base cursor-pointer group-hover:text-indigo-600 capitalize"><EditableText value={option} tag="span" /></label>
                            </div>
                        ))}
                    </div>
                </EditableElement>
            ))}
        </div>
        {data.scoringText && (
            <div className="mt-8 p-4 bg-amber-50 border-l-4 border-amber-400 text-center rounded-r-lg">
                <p className="font-bold text-amber-800"><EditableText value={data.scoringText} tag="span" /></p>
            </div>
        )}
    </div>
);

export const NumberBoxLogicSheet: React.FC<{ data: NumberBoxLogicData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        <div className="space-y-12">
            {(data.puzzles || []).map((puzzle, pIdx) => (
                <div key={pIdx} className="break-inside-avoid p-4 bg-zinc-50 rounded-xl border">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <EditableElement className="p-4 border-4 border-blue-300 rounded-xl bg-blue-50 shadow-md">
                            <h4 className="font-bold text-center text-blue-800 border-b-2 border-blue-200 pb-2 mb-2">Kutu 1</h4>
                            <div className="grid grid-cols-2 gap-2 text-center text-3xl font-bold text-blue-900">
                                {(puzzle.box1 || []).map((n, i) => <div key={i} className="p-3 bg-white rounded-lg shadow-sm"><EditableText value={n} tag="span" /></div>)}
                            </div>
                        </EditableElement>
                         <EditableElement className="p-4 border-4 border-red-300 rounded-xl bg-red-50 shadow-md">
                            <h4 className="font-bold text-center text-red-800 border-b-2 border-red-200 pb-2 mb-2">Kutu 2</h4>
                            <div className="grid grid-cols-2 gap-2 text-center text-3xl font-bold text-red-900">
                                 {(puzzle.box2 || []).map((n, i) => <div key={i} className="p-3 bg-white rounded-lg shadow-sm"><EditableText value={n} tag="span" /></div>)}
                            </div>
                        </EditableElement>
                    </div>
                    <div className="space-y-4">
                        {(puzzle.questions || []).map((q, qIdx) => (
                            <EditableElement key={qIdx} className="p-4 bg-white rounded-lg border border-zinc-200 shadow-sm">
                                <p className="font-semibold mb-3 text-zinc-700"><EditableText value={q.text} tag="span" /></p>
                                <div className="flex justify-around flex-wrap gap-3">
                                    {(q.options || []).map((opt, oIdx) => (
                                        <div key={oIdx} className="flex items-center gap-2 cursor-pointer">
                                            <div className="w-5 h-5 rounded-full border-2 border-zinc-400"></div>
                                            <span className="font-bold"><EditableText value={opt} tag="span" /></span>
                                        </div>
                                    ))}
                                </div>
                            </EditableElement>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const MapInstructionSheet: React.FC<{ data: MapInstructionData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <EditableElement className="order-last lg:order-first">
                <h4 className="font-bold border-b-2 pb-2 mb-4 text-zinc-700">Yönergeler</h4>
                <ul className="space-y-3">
                    {(data.instructions || []).map((inst, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-800 text-white flex items-center justify-center text-xs font-bold shadow-sm">{i + 1}</span>
                            <span className="text-sm text-zinc-800"><EditableText value={inst} tag="span" /></span>
                        </li>
                    ))}
                </ul>
            </EditableElement>
            <EditableElement>
                <TurkeyMapSVG cities={data.cities || []} />
            </EditableElement>
        </div>
    </div>
);

// --- VISUAL COMPONENTS FOR MIND GAMES ---

const HexagonPuzzle = ({ numbers }: { numbers: (number|string)[] }) => {
    // Numbers array: [Top-Left, Top-Right, Right, Bottom-Right, Bottom-Left, Left, Center]
    const center = numbers[6];
    const outers = numbers.slice(0, 6);
    
    return (
        <div className="relative w-56 h-56 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                 {/* Connections */}
                 {outers.map((_, i) => {
                     const angle = i * 60 - 90; // Start top
                     const rad = angle * Math.PI / 180;
                     const cx = 100 + 70 * Math.cos(rad);
                     const cy = 100 + 70 * Math.sin(rad);
                     return <line key={i} x1="100" y1="100" x2={cx} y2={cy} stroke="#cbd5e1" strokeWidth="2" />;
                 })}
                 
                 {/* Central Hexagon */}
                 <polygon points="100,60 135,80 135,120 100,140 65,120 65,80" fill="#f0f9ff" stroke="#0284c7" strokeWidth="3" />
                 {/* Using foreignObject for editable text inside SVG would be complex, here assuming static for visual structure but values passed are editable strings if wrapper handles it. 
                     Since this is inside EditableElement parent, we rely on parent. But for inner values... */}
                 <text x="100" y="105" textAnchor="middle" className="text-2xl font-bold fill-sky-700" dominantBaseline="middle">{center}</text>
                 
                 {/* Outer Circles */}
                 {outers.map((val, i) => {
                     const angle = i * 60 - 90; // Start top
                     const rad = angle * Math.PI / 180;
                     const cx = 100 + 70 * Math.cos(rad);
                     const cy = 100 + 70 * Math.sin(rad);
                     return (
                         <g key={i}>
                             <circle cx={cx} cy={cy} r="18" fill="white" stroke="#64748b" strokeWidth="2" />
                             <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle" className={`font-bold ${val === '?' ? 'fill-red-500 text-xl' : 'fill-slate-700'}`}>
                                 {val}
                             </text>
                         </g>
                     )
                 })}
            </svg>
        </div>
    );
};

const FunctionMachine = ({ input, output, rule }: { input: number, output: string | number, rule?: string }) => (
    <div className="flex items-center gap-4 p-6 bg-zinc-100 rounded-xl border-2 border-zinc-300 w-full max-w-md mx-auto">
        <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-zinc-400 uppercase mb-2">Giriş</span>
            <div className="w-16 h-16 bg-white rounded-full border-4 border-emerald-400 flex items-center justify-center text-2xl font-bold shadow-sm text-emerald-700">
                <EditableText value={input} tag="span" />
            </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center px-2 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-300 -z-10"></div>
            <div className="px-4 py-3 bg-zinc-800 text-white rounded-lg text-sm font-mono shadow-lg z-10 flex flex-col items-center">
                <span className="text-[10px] text-zinc-400 mb-1">KURAL</span>
                <span className="font-bold text-lg tracking-wider"><EditableText value={rule || "?"} tag="span" /></span>
            </div>
            <i className="fa-solid fa-chevron-right absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400"></i>
        </div>
        
        <div className="flex flex-col items-center">
             <span className="text-xs font-bold text-zinc-400 uppercase mb-2">Çıkış</span>
             <div className={`w-16 h-16 bg-white rounded-full border-4 flex items-center justify-center text-2xl font-bold shadow-sm ${output === '?' ? 'border-rose-400 text-rose-600 border-dashed' : 'border-indigo-400 text-indigo-700'}`}>
                 <EditableText value={output} tag="span" />
             </div>
        </div>
    </div>
);

export const MindGamesSheet: React.FC<{ data: MindGamesData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(data.puzzles || []).map((puzzle, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-800 p-6 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col items-center break-inside-avoid relative overflow-hidden min-h-[300px]">
                    <div className="absolute top-0 left-0 bg-zinc-100 dark:bg-zinc-700 px-4 py-1 rounded-br-xl text-xs font-bold text-zinc-500 border-b border-r border-zinc-200">
                        #{idx + 1}
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center w-full my-4">
                        {/* 1. Shape Math (Triangle) */}
                        {puzzle.type === 'shape_math' && puzzle.shape === 'triangle' && (
                            <EditableElement className="relative w-64 h-56">
                                <svg viewBox="0 0 100 86" className="w-full h-full overflow-visible">
                                    <polygon points="50,0 100,86 0,86" fill="none" stroke="#374151" strokeWidth="2" className="dark:stroke-zinc-400"/>
                                    {[
                                        {x: 50, y: 0, val: puzzle.numbers?.[0]},
                                        {x: 0, y: 86, val: puzzle.numbers?.[1]},
                                        {x: 100, y: 86, val: puzzle.numbers?.[2]}
                                    ].map((pos, i) => (
                                        <g key={i}>
                                            <circle cx={pos.x} cy={pos.y} r="12" fill="white" stroke="#374151" strokeWidth="2" className="dark:fill-zinc-800 dark:stroke-zinc-400"/>
                                            <text x={pos.x} y={pos.y} dominantBaseline="central" textAnchor="middle" className="text-xs font-bold fill-zinc-800 dark:fill-zinc-200">{pos.val}</text>
                                        </g>
                                    ))}
                                    
                                    <circle cx="50" cy="50" r="16" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" className="dark:fill-indigo-900 dark:stroke-indigo-500"/>
                                    <text x="50" y="50" dominantBaseline="central" textAnchor="middle" className="text-lg font-bold fill-indigo-800 dark:fill-indigo-200">{puzzle.numbers?.[3] || '?'}</text>
                                </svg>
                            </EditableElement>
                        )}

                        {/* 2. Matrix Logic */}
                        {puzzle.type === 'matrix_logic' && puzzle.grid && (
                             <EditableElement className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded-lg border-2 border-zinc-300 dark:border-zinc-600">
                                 <GridComponent grid={puzzle.grid as any} cellClassName="w-16 h-16 text-2xl font-bold flex items-center justify-center border-2 border-zinc-300 dark:border-zinc-600" />
                             </EditableElement>
                        )}

                        {/* 3. Number Pyramid */}
                        {puzzle.type === 'number_pyramid' && puzzle.numbers && (
                             <EditableElement className="flex flex-col items-center gap-2">
                                <div className="w-16 h-16 border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-xl rounded-lg shadow-sm text-indigo-700 dark:text-indigo-300">
                                    <EditableText value={puzzle.numbers[5] || '?'} tag="span" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-16 h-16 border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 flex items-center justify-center font-bold text-lg rounded-lg shadow-sm"><EditableText value={puzzle.numbers[3]} tag="span" /></div>
                                    <div className="w-16 h-16 border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 flex items-center justify-center font-bold text-lg rounded-lg shadow-sm"><EditableText value={puzzle.numbers[4]} tag="span" /></div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-16 h-16 border-2 border-zinc-400 dark:border-zinc-500 bg-zinc-50 dark:bg-zinc-700 flex items-center justify-center font-bold text-lg rounded-lg shadow-inner"><EditableText value={puzzle.numbers[0]} tag="span" /></div>
                                    <div className="w-16 h-16 border-2 border-zinc-400 dark:border-zinc-500 bg-zinc-50 dark:bg-zinc-700 flex items-center justify-center font-bold text-lg rounded-lg shadow-inner"><EditableText value={puzzle.numbers[1]} tag="span" /></div>
                                    <div className="w-16 h-16 border-2 border-zinc-400 dark:border-zinc-500 bg-zinc-50 dark:bg-zinc-700 flex items-center justify-center font-bold text-lg rounded-lg shadow-inner"><EditableText value={puzzle.numbers[2]} tag="span" /></div>
                                </div>
                             </EditableElement>
                        )}
                        
                        {/* 4. Hexagon Logic */}
                        {puzzle.type === 'hexagon_logic' && puzzle.numbers && (
                            <EditableElement>
                                <HexagonPuzzle numbers={puzzle.numbers} />
                            </EditableElement>
                        )}

                        {/* 5. Function Machine */}
                        {puzzle.type === 'function_machine' && (
                            <EditableElement>
                                <FunctionMachine input={puzzle.input || 0} output={puzzle.output || '?'} rule={puzzle.rule} />
                            </EditableElement>
                        )}
                    </div>
                    
                    <EditableElement className="text-center w-full bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-700 mt-auto">
                        {puzzle.question && <p className="text-sm font-semibold mb-1 text-zinc-700 dark:text-zinc-300"><EditableText value={puzzle.question} tag="span" /></p>}
                        {puzzle.hint && <p className="text-xs text-zinc-500 dark:text-zinc-400 italic"><i className="fa-solid fa-lightbulb text-yellow-500 mr-1"></i><EditableText value={puzzle.hint} tag="span" /></p>}
                    </EditableElement>
                </div>
            ))}
        </div>
    </div>
);

export const MindGames56Sheet: React.FC<{ data: MindGames56Data }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        
        <div className="space-y-6">
            {(data.puzzles || []).map((puzzle, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-800 rounded-2xl border-l-8 border-indigo-500 shadow-md p-6 break-inside-avoid">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                            {idx + 1}
                        </div>
                        <h4 className="text-lg font-bold text-zinc-800 dark:text-zinc-100"><EditableText value={puzzle.title} tag="span" /></h4>
                    </div>

                    {/* Layout Logic */}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left: Content */}
                        <EditableElement className="flex-1 space-y-4">
                            <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-line text-base leading-relaxed">
                                <EditableText value={puzzle.question} tag="span" />
                            </p>
                            
                            {puzzle.hint && (
                                <div className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-xs rounded-full border border-amber-200 dark:border-amber-800 font-medium">
                                    <i className="fa-solid fa-lightbulb mr-1"></i> İpucu: <EditableText value={puzzle.hint} tag="span" />
                                </div>
                            )}
                        </EditableElement>

                        {/* Right: Visual & Input */}
                        <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
                            {puzzle.imagePrompt && (
                                <EditableElement className="w-full h-32 bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                     <ImageDisplay base64={puzzle.imageBase64} description={puzzle.title} className="w-full h-full object-contain" />
                                </EditableElement>
                            )}
                            
                            <EditableElement className="w-full p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-center">
                                <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Cevap</p>
                                <div className="h-8 border-b-2 border-zinc-400 dark:border-zinc-500 w-3/4 mx-auto"><EditableText value="" tag="div" className="w-full h-full" /></div>
                            </EditableElement>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Answer Key for Print */}
        {/* Removed for cleanup, typically print key is handled separately or in teacher view */}
    </div>
);
