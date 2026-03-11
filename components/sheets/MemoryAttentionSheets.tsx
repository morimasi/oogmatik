
import React from 'react';
import {
    WordMemoryData, VisualMemoryData, NumberSearchData, FindDuplicateData, LetterGridTestData, FindLetterPairData, TargetSearchData,
    ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, StroopTestData, ChaoticNumberSearchData,
    AttentionDevelopmentData, AttentionFocusData
} from '../../types';
import { ImageDisplay, PedagogicalHeader, Shape } from './common';
import { EditableElement, EditableText } from '../Editable';

// --- SHARED COMPONENTS ---

const ScoreTable = ({ rows = 1 }: { rows?: number }) => (
    <div className="mt-8 print:mt-2 border-2 border-black rounded-xl overflow-hidden text-xs bg-white text-black break-inside-avoid">
        <div className="grid grid-cols-4 bg-zinc-100 border-b-2 border-black font-bold p-2 text-center">
            <span>Bölüm</span>
            <span>Doğru</span>
            <span>Yanlış</span>
            <span>Net</span>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 border-b border-zinc-300 last:border-b-0 p-2 h-8">
                <span className="font-bold text-center border-r border-zinc-200">{i + 1}. Bölüm</span>
                <span className="border-r border-zinc-200"></span>
                <span className="border-r border-zinc-200"></span>
                <span></span>
            </div>
        ))}
        <div className="grid grid-cols-4 bg-zinc-100 border-t-2 border-black font-bold p-2 text-center">
            <span>TOPLAM</span>
            <span></span>
            <span></span>
            <span></span>
        </div>
    </div>
);

// --- MEMORY SHEETS (Dual Page Strategy) ---

export const WordMemorySheet = ({ data }: { data: WordMemoryData }) => {
    return (
        <div className="w-full">
            {/* PAGE 1: MEMORIZE */}
            <div className="flex flex-col min-h-[500px] relative">
                <PedagogicalHeader title={data.title} instruction="1. AŞAMA: Kelimeleri dikkatlice oku ve ezberle." note={data.pedagogicalNote} data={data} />

                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="bg-white border-4 border-black rounded-3xl p-8 print:p-2 print:p-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full text-center">
                        <h3 className="text-xl font-bold text-black mb-6 print:mb-2 uppercase tracking-widest border-b-2 border-black pb-2">Ezberlenecek Liste</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 print:gap-2">
                            {(data.wordsToMemorize || []).map((word, index) => (
                                <EditableElement key={index} className="p-4 print:p-1 bg-white border-2 border-black rounded-xl flex items-center justify-center">
                                    <p className="text-lg font-black text-black uppercase"><EditableText value={word.text} tag="span" /></p>
                                </EditableElement>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* PAGE 2: TEST */}
            <div className="flex flex-col min-h-[500px] relative pt-8 print:pt-2">
                <PedagogicalHeader title={`${data.title} - TEST`} instruction="2. AŞAMA: Aklında kalan kelimeleri bul ve kutucuğu işaretle." />

                <div className="flex-1">
                    <div className="bg-white border-4 border-black rounded-3xl p-8 print:p-2 print:p-3 max-w-3xl mx-auto w-full">
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 print:gap-1">
                            {(data.testWords || []).map((word, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 border-2 border-zinc-200 rounded-lg cursor-pointer">
                                    <div className="w-6 h-6 border-2 border-black rounded flex items-center justify-center shrink-0"></div>
                                    <span className="text-sm font-bold text-black uppercase truncate"><EditableText value={word.text} tag="span" /></span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <ScoreTable />
                </div>
            </div>
        </div>
    );
};

export const VisualMemorySheet = ({ data }: { data: VisualMemoryData }) => {
    return (
        <div className="w-full">
            {/* PAGE 1: MEMORIZE */}
            <div className="flex flex-col min-h-[500px] relative">
                <PedagogicalHeader title={data.title} instruction="1. AŞAMA: Görselleri dikkatlice incele ve yerlerini ezberle." note={data.pedagogicalNote} data={data} />

                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-6 print:gap-2 w-full max-w-3xl">
                        {(data.itemsToMemorize || []).map((item, index) => (
                            <EditableElement key={index} className="aspect-square bg-white border-2 border-black rounded-xl p-2 flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                {/* Fix: Use base64 prop for direct buffer support */}
                                {item.imageBase64 ? (
<<<<<<< HEAD
                                    <ImageDisplay base64={item.imageBase64} description={item.description} className="w-full h-full  object-contain" />
=======
                                    <ImageDisplay base64={item.imageBase64} description={item.description} className="w-full h-full print:h-0 object-contain" />
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
                                ) : (
                                    <span className="text-4xl">{item.imagePrompt || item.description.charAt(0)}</span>
                                )}
                            </EditableElement>
                        ))}
                    </div>
                </div>
            </div>

            {/* PAGE 2: TEST */}
            <div className="flex flex-col min-h-[500px] relative pt-8 print:pt-2">
                <PedagogicalHeader title={`${data.title} - TEST`} instruction="2. AŞAMA: Bir önceki sayfada gördüğün resimleri işaretle." />

                <div className="flex-1">
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-4 print:gap-1 w-full">
                        {(data.testItems || []).map((item, index) => (
                            <div key={index} className="aspect-square bg-white border-2 border-zinc-300 rounded-lg p-2 flex flex-col items-center justify-center relative group">
                                <div className="absolute top-1 right-1 w-5 h-5 border-2 border-black rounded bg-white"></div>
                                {/* Fix: Use base64 prop for direct buffer support */}
                                {item.imageBase64 ? (
                                    <ImageDisplay base64={item.imageBase64} description={item.description} className="w-3/4 h-3/4 object-contain opacity-50 grayscale" />
                                ) : (
                                    <span className="text-3xl opacity-50 grayscale">{item.imagePrompt || item.description.charAt(0)}</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <ScoreTable />
                </div>
            </div>
        </div>
    );
};

export const CharacterMemorySheet = ({ data }: { data: CharacterMemoryData }) => {
    return (
        <div className="w-full">
            {/* PAGE 1 */}
            <div className="flex flex-col min-h-[500px] relative">
                <PedagogicalHeader title={data.title} instruction="Bu karakterleri ve özelliklerini iyi ezberle." note={data.pedagogicalNote} data={data} />

                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 print:gap-2 print:gap-3 print:p-3 items-center justify-center p-4 print:p-1">
                    {(data.charactersToMemorize || []).map((char, index) => (
                        <EditableElement key={index} className="flex flex-col items-center bg-white border-2 border-black p-4 print:p-1 rounded-3xl aspect-square justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                            {/* Fix: Use base64 prop for direct buffer support or prompt if available */}
                            <ImageDisplay base64={char.imageBase64} prompt={char.imagePrompt} description={char.description} className="w-32 h-32 rounded-full object-cover border-4 border-black mb-4 print:mb-1" />
                            <p className="text-sm font-bold text-center bg-black text-white px-4 print:px-1 py-1 rounded-full"><EditableText value={char.description} tag="span" /></p>
                        </EditableElement>
                    ))}
                </div>
            </div>

            {/* PAGE 2 */}
            <div className="flex flex-col min-h-[500px] relative pt-8 print:pt-2">
                <PedagogicalHeader title={`${data.title} - KİMİ GÖRDÜN?`} instruction="Daha önce gördüğün karakterlerin altındaki kutucuğu işaretle." />

                <div className="flex-1 grid grid-cols-3 md:grid-cols-4 gap-6 print:gap-2 p-4 print:p-1">
                    {(data.testCharacters || []).map((char, index) => (
                        <div key={index} className="flex flex-col items-center border-2 border-black p-3 rounded-xl relative bg-white">
                            <div className="w-full flex justify-end mb-2">
                                <div className="w-6 h-6 border-2 border-black rounded bg-white"></div>
                            </div>
                            {/* Fix: Use base64 prop for direct buffer support or prompt if available */}
                            <ImageDisplay base64={char.imageBase64} prompt={char.imagePrompt} description={char.description} className="w-24 h-24 rounded-full object-cover filter grayscale opacity-80" />
                        </div>
                    ))}
                </div>
                <ScoreTable />
            </div>
        </div>
    );
};

export const ColorWheelSheet = ({ data }: { data: ColorWheelMemoryData }) => {
    const items = data.items || [];
    const radius = 120;
    const center = 150;

    return (
        <div className="w-full">
            {/* PAGE 1 */}
            <div className="flex flex-col min-h-[500px] relative">
                <PedagogicalHeader title={data.title} instruction="Renk çemberindeki nesnelerin yerini ve rengini ezberle." note={data.pedagogicalNote} data={data} />

                <div className="flex-1 flex items-center justify-center">
                    <EditableElement className="relative w-[300px] h-[300px]">
<<<<<<< HEAD
                        <svg viewBox="0 0 300 300" className="w-full h-full  overflow-visible">
=======
                        <svg viewBox="0 0 300 300" className="w-full h-full print:h-0 overflow-visible">
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
                            {/* Wheel Segments */}
                            {items.map((item, i) => {
                                const angle = (i * 360) / items.length;
                                const nextAngle = ((i + 1) * 360) / items.length;
                                // Simple arc path logic
                                const x1 = center + radius * Math.cos((angle - 90) * Math.PI / 180);
                                const y1 = center + radius * Math.sin((angle - 90) * Math.PI / 180);
                                const x2 = center + radius * Math.cos((nextAngle - 90) * Math.PI / 180);
                                const y2 = center + radius * Math.sin((nextAngle - 90) * Math.PI / 180);

                                const textAngle = angle + (360 / items.length) / 2;
                                const tx = center + (radius * 0.7) * Math.cos((textAngle - 90) * Math.PI / 180);
                                const ty = center + (radius * 0.7) * Math.sin((textAngle - 90) * Math.PI / 180);

                                return (
                                    <g key={i}>
                                        <path d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`} fill={item.color} stroke="black" strokeWidth="2" />
                                        <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fontSize="24" fill="white" stroke="black" strokeWidth="0.5" fontWeight="bold">
                                            {item.imagePrompt || item.name[0]}
                                        </text>
                                    </g>
                                );
                            })}
                            <circle cx={center} cy={center} r={30} fill="white" stroke="black" strokeWidth="3" />
                        </svg>
                    </EditableElement>
                </div>
            </div>

            {/* PAGE 2 */}
            <div className="flex flex-col min-h-[500px] relative pt-8 print:pt-2">
                <PedagogicalHeader title={`${data.title} - BOŞ ÇEMBER`} instruction="Çemberi aklında kaldığı gibi boya ve nesneleri çiz." />

                <div className="flex-1 flex flex-col items-center justify-center">
                    <svg viewBox="0 0 300 300" className="w-[300px] h-[300px] overflow-visible mb-8 print:mb-2">
                        <circle cx={center} cy={center} r={radius} fill="none" stroke="black" strokeWidth="3" />
                        {items.map((_, i) => {
                            const angle = (i * 360) / items.length;
                            const x1 = center + radius * Math.cos((angle - 90) * Math.PI / 180);
                            const y1 = center + radius * Math.sin((angle - 90) * Math.PI / 180);
                            return <line key={i} x1={center} y1={center} x2={x1} y2={y1} stroke="black" strokeWidth="2" />;
                        })}
                        <circle cx={center} cy={center} r={30} fill="white" stroke="black" strokeWidth="3" />
                    </svg>

                    <div className="w-full max-w-lg border-2 border-black p-4 print:p-1 rounded-xl">
                        <h4 className="font-bold border-b-2 border-black mb-2 uppercase text-sm">Hatırlatma Listesi</h4>
                        <div className="flex flex-wrap gap-2">
                            {items.map((item, i) => (
                                <span key={i} className="border border-black px-2 py-1 rounded text-xs font-bold">{item.name}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ImageComprehensionSheet = ({ data }: { data: ImageComprehensionData }) => (
    <div className="w-full">
        {/* Page 1 */}
        <div className="min-h-[500px] flex flex-col">
            <PedagogicalHeader title={data.title} instruction="Metni oku ve sahneyi zihninde canlandır." note={data.pedagogicalNote} data={data} />

            <div className="flex-1 flex items-center justify-center p-8 print:p-2 print:p-3">
                <div className="bg-white p-8 print:p-2 print:p-3 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-2xl font-medium leading-loose max-w-2xl text-center font-dyslexic text-black">
                    {data.sceneDescription}
                </div>
            </div>
        </div>

        {/* Page 2 */}
        <div className="min-h-[500px] flex flex-col pt-8 print:pt-2">
            <PedagogicalHeader title="HATIRLAMA TESTİ" instruction="Metne bakmadan soruları cevapla." />

            <div className="flex-1 space-y-8 mt-8 print:mt-2">
                {(data.questions || []).map((q, i) => (
                    <EditableElement key={i} className="p-6 print:p-2 border-2 border-black rounded-xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <p className="font-bold text-lg mb-4 print:mb-1 flex gap-2"><span className="bg-black text-white w-6 h-6 flex items-center justify-center rounded text-sm">{i + 1}</span> {q}</p>
                        <div className="border-b-2 border-black border-dashed h-8 w-full mt-4 print:mt-1"></div>
                        <div className="border-b-2 border-black border-dashed h-8 w-full mt-4 print:mt-1"></div>
                    </EditableElement>
                ))}
                <ScoreTable rows={1} />
            </div>
        </div>
    </div>
);

// --- ATTENTION & PERCEPTION SHEETS ---

export const BurdonTestSheet = ({ data }: { data: LetterGridTestData }) => (
<<<<<<< HEAD
    <div className="w-full h-full ">
=======
    <div className="w-full h-full print:h-0">
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
        <PedagogicalHeader title="BURDON DİKKAT TESTİ" instruction={data.instruction || "Sırasıyla a, b, d, g harflerinin altını çizin."} note={data.pedagogicalNote} data={data} />

        <div className="bg-white border-2 border-black rounded-lg p-1">
            {/* Standard Burdon Layout: Blocks of 10/20 chars lines */}
            <div className="font-mono text-xl leading-loose tracking-[0.2em] p-6 print:p-2 text-justify select-none text-black break-all">
                {(data.grid || []).map((row, i) => (
                    <div key={i} className="mb-4 print:mb-1 flex gap-4 print:gap-1 items-center border-b border-zinc-100 pb-1">
                        <span className="w-6 font-bold text-black text-sm border-r-2 border-black pr-2">{i + 1}.</span>
                        <div className="flex-1 text-center font-bold">
                            {row.join('')}
                        </div>
                        {/* Scoring Box Per Line */}
                        <div className="w-16 h-6 border border-black rounded flex items-center justify-center text-[8px] text-zinc-400">
                            Puan
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="mt-6 print:mt-2 break-inside-avoid">
            <h4 className="font-bold text-sm uppercase mb-2 border-b-2 border-black inline-block">Genel Puanlama</h4>
            <div className="border-2 border-black text-xs bg-white text-black">
                <div className="grid grid-cols-11 border-b-2 border-black font-bold bg-zinc-100">
                    <span className="p-2 border-r border-black">Satır</span>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <span key={n} className="p-2 border-r border-black text-center">{n}</span>)}
                </div>
                <div className="grid grid-cols-11 border-b border-black h-8">
                    <span className="p-2 border-r border-black font-bold bg-zinc-50">Doğru</span>
                    {Array.from({ length: 10 }).map((_, i) => <span key={i} className="p-2 border-r border-black"></span>)}
                </div>
                <div className="grid grid-cols-11 h-8">
                    <span className="p-2 border-r border-black font-bold bg-zinc-50">Yanlış</span>
                    {Array.from({ length: 10 }).map((_, i) => <span key={i} className="p-2 border-r border-black"></span>)}
                </div>
            </div>
        </div>
    </div>
);

export const ChaoticNumberSearchSheet = ({ data }: { data: ChaoticNumberSearchData }) => (
<<<<<<< HEAD
    <div className="relative h-full  flex flex-col w-full">
=======
    <div className="relative h-full print:h-0 flex flex-col w-full">
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />

        <div className="flex-1 relative border-4 border-black rounded-3xl overflow-hidden bg-white min-h-[600px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            {/* Target List on Top */}
            <div className="absolute top-0 left-0 w-full bg-black text-white p-2 flex justify-center gap-2 flex-wrap z-10 border-b-4 border-black">
                <span className="font-bold text-sm self-center mr-2 uppercase tracking-wider">Aranacaklar:</span>
                <div className="flex gap-2">
                    <span className="font-black text-lg bg-white text-black px-2 rounded">{data.range?.start || 1}</span>
                    <span className="self-center">...</span>
                    <span className="font-black text-lg bg-white text-black px-2 rounded">{data.range?.end || 20}</span>
                </div>
            </div>

            {/* Chaotic Numbers - Absolute Positioning */}
            <div className="absolute inset-0 top-12 p-4 print:p-1">
                {(data.numbers || []).map((num, i) => (
                    <EditableElement
                        key={i}
                        className="absolute flex items-center justify-center font-black font-dyslexic cursor-crosshair select-none leading-none"
                        style={{
                            left: `${num.x}%`,
                            top: `${num.y}%`,
                            transform: `rotate(${num.rotation}deg) scale(${num.size})`,
                            // Ensure good contrast for print
                            color: 'black',
                            fontSize: '1.2rem',
                            zIndex: Math.floor(Math.random() * 10)
                        }}
                    >
                        {num.value}
                    </EditableElement>
                ))}
            </div>
        </div>

        <div className="mt-6 print:mt-2 flex justify-center gap-4 print:gap-1">
            <div className="p-4 print:p-1 bg-white border-2 border-black rounded-xl text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-48">
                <p className="font-bold text-black uppercase text-xs mb-2">Başlama</p>
                <div className="h-6 border-b border-black border-dashed"></div>
            </div>
            <div className="p-4 print:p-1 bg-white border-2 border-black rounded-xl text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-48">
                <p className="font-bold text-black uppercase text-xs mb-2">Bitiş</p>
                <div className="h-6 border-b border-black border-dashed"></div>
            </div>
        </div>
    </div>
);

// --- REVISED STROOP TEST SHEET ---
export const StroopTestSheet = ({ data }: { data: StroopTestData }) => (
<<<<<<< HEAD
    <div className="flex flex-col h-full  justify-between">
=======
    <div className="flex flex-col h-full print:h-0 justify-between">
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
        <div className="shrink-0 mb-6 print:mb-2">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        </div>

        {/* Main Content: High density grid for A4 filling */}
        <div className="flex-1 grid grid-cols-4 gap-y-8 gap-x-4 items-center content-start min-h-[700px] py-4 print:py-1">
            {(data.items || []).map((item, index) => (
                <EditableElement key={index} className="flex justify-center break-inside-avoid">
                    <span
                        className="text-3xl md:text-4xl font-black tracking-wide uppercase text-center"
                        style={{ color: item.color }}
                    >
                        <EditableText value={item.text} tag="span" />
                    </span>
                </EditableElement>
            ))}
        </div>

        {/* Footer: Professional Evaluation Box */}
        <div className="mt-auto pt-6 print:pt-2 border-t-4 border-black break-inside-avoid">
            <div className="flex justify-between gap-4 print:gap-1">
                <div className="flex-1 p-3 border-2 border-black rounded-lg bg-zinc-50">
                    <h4 className="font-bold text-xs uppercase text-center mb-2">Toplam Süre</h4>
                    <div className="h-8 border-b border-black border-dashed"></div>
                </div>
                <div className="flex-1 p-3 border-2 border-black rounded-lg bg-zinc-50">
                    <h4 className="font-bold text-xs uppercase text-center mb-2">Hata Sayısı</h4>
                    <div className="h-8 border-b border-black border-dashed"></div>
                </div>
                <div className="flex-1 p-3 border-2 border-black rounded-lg bg-zinc-50">
                    <h4 className="font-bold text-xs uppercase text-center mb-2">Düzeltme</h4>
                    <div className="h-8 border-b border-black border-dashed"></div>
                </div>
                <div className="flex-1 p-3 border-2 border-black rounded-lg bg-zinc-50">
                    <h4 className="font-bold text-xs uppercase text-center mb-2">Puan</h4>
                    <div className="h-8 border-b border-black border-dashed"></div>
                </div>
            </div>
            <div className="mt-2 text-[10px] text-center text-zinc-500 font-bold uppercase tracking-widest">
                Klinik Gözlem Notları
            </div>
            <div className="h-16 border-2 border-zinc-200 mt-1 rounded-lg"></div>
        </div>
    </div>
);

// Standard sheets reuse common layouts but with StudentInfoStrip added
const StandardSheet = ({ data, children }: { data: any, children: any }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        {children}
        <ScoreTable rows={1} />
    </div>
);

export const NumberSearchSheet = ({ data }: { data: NumberSearchData }) => (
    <StandardSheet data={data}>
        <div className="flex flex-wrap gap-3 justify-center font-mono text-xl p-8 print:p-2 print:p-3 border-2 border-black rounded-3xl bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            {(data.numbers || []).map((n, i) => (
                <span key={i} className="w-12 h-12 flex items-center justify-center border-2 border-zinc-100 hover:border-black rounded-lg font-bold text-black transition-all cursor-default select-none">{n}</span>
            ))}
        </div>
    </StandardSheet>
);

export const FindDuplicateSheet = ({ data }: { data: FindDuplicateData }) => (
    <StandardSheet data={data}>
        <div className="space-y-4">
            {(data.rows || []).map((row, i) => (
                <EditableElement key={i} className="flex justify-between items-center p-3 border-2 border-black rounded-lg bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] break-inside-avoid">
                    <span className="w-8 h-8 bg-black text-white rounded flex items-center justify-center font-bold text-sm mr-4">{i + 1}</span>
                    <div className="flex-1 flex justify-between font-mono text-2xl tracking-widest font-bold text-black">
                        {row.map((char, j) => <span key={j} className="hover:text-indigo-600 cursor-pointer">{char}</span>)}
                    </div>
                </EditableElement>
            ))}
        </div>
    </StandardSheet>
);

export const LetterGridTestSheet = ({ data }: { data: LetterGridTestData }) => (
    <StandardSheet data={data}>
        <div className="bg-white border-4 border-black p-6 print:p-2 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="font-mono text-lg leading-[2.5rem] tracking-[0.5em] break-all text-justify select-none text-black">
                {(data.grid || []).map((row, i) => (
                    <div key={i} className="mb-2 flex items-center border-b border-zinc-100 pb-1">
                        <span className="w-6 font-bold text-zinc-400 text-xs mr-2">{i + 1}</span>
                        <div className="flex-1 text-center">
                            {row.join('')}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </StandardSheet>
);

export const FindLetterPairSheet = ({ data }: { data: FindLetterPairData }) => {
    /* Fix: FindLetterPairData has a grids array. Use the first grid for single-page display. */
    const grid = data.grids[0]?.grid || [];
    const targetPair = data.grids[0]?.targetPair || '';

    return (
        <StandardSheet data={data}>
            <div className="bg-white border-4 border-black p-4 print:p-1 rounded-xl grid gap-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ gridTemplateColumns: `repeat(${grid.length || 10}, 1fr)` }}>
                {(grid || []).flat().map((char, i) => (
                    <div key={i} className="aspect-square flex items-center justify-center border border-zinc-100 text-lg font-bold text-black hover:bg-zinc-100">{char}</div>
                ))}
            </div>
            <div className="mt-4 print:mt-1 text-center">
                <span className="font-bold border-2 border-black px-4 print:px-1 py-2 rounded-full shadow-sm bg-white">Hedef İkili: {targetPair}</span>
            </div>
        </StandardSheet>
    );
};

export const TargetSearchSheet = ({ data }: { data: TargetSearchData }) => (
    <StandardSheet data={data}>
        <div className="bg-white border-4 border-black p-6 print:p-2 rounded-3xl text-black font-mono text-xl tracking-widest text-center leading-loose shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] select-none">
            {(data.grid || []).map((row, i) => (
                <div key={i} className="hover:bg-zinc-50">{row.join(' ')}</div>
            ))}
        </div>
        <div className="mt-4 print:mt-1 flex justify-center gap-4 print:gap-1">
            <div className="flex items-center gap-2">
                <span className="font-bold text-sm uppercase">Hedef:</span>
                <span className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center font-bold text-xl">{data.target}</span>
            </div>
        </div>
    </StandardSheet>
);

export const AttentionDevelopmentSheet = ({ data }: { data: AttentionDevelopmentData }) => {
    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction || "Yönergeleri takip et ve doğru sayıyı bul."} note={data.pedagogicalNote} data={data} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-2 print:gap-3 print:p-3">
                {(data.puzzles || []).map((puzzle, i) => (
<<<<<<< HEAD
                    <EditableElement key={i} className="bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 rounded-xl p-5 print:p-1 shadow-sm break-inside-avoid flex flex-col h-full ">
=======
                    <EditableElement key={i} className="bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 rounded-xl p-5 print:p-1 shadow-sm break-inside-avoid flex flex-col h-full print:h-0">
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
                        {/* Riddle Text */}
                        <div className="bg-zinc-100 dark:bg-zinc-700/50 p-4 print:p-1 rounded-lg mb-4 print:mb-1 text-center border border-zinc-200 dark:border-zinc-600">
                            <p className="text-lg font-medium text-zinc-800 dark:text-zinc-100"><EditableText value={puzzle.riddle} tag="span" /></p>
                        </div>

                        {/* Boxes Area */}
                        <div className="flex gap-4 print:gap-1 justify-center mb-6 print:mb-2 flex-1 items-center">
                            {puzzle.boxes.map((box, bIdx) => (
                                <div key={bIdx} className="border-2 border-zinc-800 dark:border-zinc-400 p-2 min-w-[80px] text-center bg-white dark:bg-zinc-900">
                                    {box.label && <div className="text-xs text-zinc-400 mb-1 uppercase tracking-wider">{box.label}</div>}
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {box.numbers.map((num, nIdx) => (
                                            <span key={nIdx} className="text-xl font-bold font-mono px-1">{num}{nIdx < box.numbers.length - 1 ? ',' : ''}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Options */}
                        <div className="border-t pt-4 print:pt-1 flex justify-around">
                            {puzzle.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex flex-col items-center gap-1 cursor-pointer group">
                                    <div className="w-8 h-8 rounded-full border-2 border-zinc-300 group-hover:border-indigo-500 group-hover:bg-indigo-50 flex items-center justify-center font-bold text-sm text-zinc-500 group-hover:text-indigo-600 transition-all">
                                        {String.fromCharCode(97 + oIdx)}
                                    </div>
                                    <span className="font-bold text-lg">{opt}</span>
                                </div>
                            ))}
                        </div>
                    </EditableElement>
                ))}
            </div>
            {/* Answer Key Strip (For Print) */}
            <div className="mt-8 print:mt-2 pt-4 print:pt-1 border-t-2 border-dashed border-zinc-300 hidden print:block text-center text-xs text-zinc-400">
                Cevaplar: {(data.puzzles || []).map((p, i) => `${i + 1}) ${p.answer}`).join('  |  ')}
            </div>
        </div>
    );
};

export const AttentionFocusSheet = ({ data }: { data: AttentionFocusData }) => {
    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction || "İpuçlarını oku ve doğru cevabı bul."} note={data.pedagogicalNote} data={data} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-2 print:gap-3 print:p-3">
                {(data.puzzles || []).map((puzzle, i) => (
<<<<<<< HEAD
                    <EditableElement key={i} className="bg-white dark:bg-zinc-800 border-2 border-zinc-400 dark:border-zinc-500 rounded-xl p-5 print:p-1 shadow-md break-inside-avoid flex flex-col h-full  relative">
=======
                    <EditableElement key={i} className="bg-white dark:bg-zinc-800 border-2 border-zinc-400 dark:border-zinc-500 rounded-xl p-5 print:p-1 shadow-md break-inside-avoid flex flex-col h-full print:h-0 relative">
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
                        {/* Riddle Box */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 print:p-1 rounded-lg mb-4 print:mb-1 text-center border border-amber-200 dark:border-amber-800">
                            <p className="text-lg font-medium text-amber-900 dark:text-amber-100 font-dyslexic"><EditableText value={puzzle.riddle} tag="span" /></p>
                        </div>

                        {/* List Boxes */}
                        <div className="flex gap-4 print:gap-1 justify-center mb-6 print:mb-2 flex-1 items-stretch">
                            {puzzle.boxes.map((box, bIdx) => (
                                <div key={bIdx} className="border-2 border-zinc-800 dark:border-zinc-300 p-3 min-w-[100px] text-center bg-white dark:bg-zinc-900 flex flex-col">
                                    {box.title && <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-bold border-b pb-1">{box.title}</div>}
                                    <ul className="flex flex-col gap-1 text-base font-bold text-zinc-800 dark:text-zinc-200">
                                        {box.items.map((item, nIdx) => (
                                            <li key={nIdx} className="py-1"><EditableText value={item} tag="span" /></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Options */}
                        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 print:pt-1 flex flex-wrap justify-center gap-4 print:gap-1">
                            {puzzle.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-2 cursor-pointer group bg-zinc-50 dark:bg-zinc-700/50 px-3 py-1 rounded-full border border-transparent hover:border-indigo-300 transition-all">
                                    <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-600 group-hover:bg-indigo-500 group-hover:text-white flex items-center justify-center font-bold text-xs text-zinc-600 dark:text-zinc-300 transition-colors">
                                        {String.fromCharCode(97 + oIdx)}
                                    </div>
                                    <span className="font-bold text-sm">{opt}</span>
                                </div>
                            ))}
                        </div>
                    </EditableElement>
                ))}
            </div>
            {/* Answer Key Strip (For Print) */}
            <div className="mt-8 print:mt-2 pt-4 print:pt-1 border-t-2 border-dashed border-zinc-300 hidden print:block text-center text-xs text-zinc-400">
                Cevaplar: {(data.puzzles || []).map((p, i) => `${i + 1}) ${p.answer}`).join('  |  ')}
            </div>
        </div>
    );
};



<<<<<<< HEAD

=======
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
