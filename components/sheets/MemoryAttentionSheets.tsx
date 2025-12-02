
import React, { useState } from 'react';
import { 
    WordMemoryData, VisualMemoryData, NumberSearchData, FindDuplicateData, LetterGridTestData, FindLetterPairData, TargetSearchData,
    ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, StroopTestData, ChaoticNumberSearchData
} from '../../types';
import { ImageDisplay, PedagogicalHeader, Shape } from './common';
import { EditableElement, EditableText } from '../Editable';

// --- SHARED COMPONENTS ---

const StudentInfoStrip = () => (
    <div className="flex flex-wrap justify-between border-2 border-black p-3 mb-6 rounded-xl bg-white text-black font-bold uppercase text-[10px] tracking-wider gap-4 print:flex">
        <div className="flex-1 min-w-[150px] border-b-2 border-black border-dashed flex flex-col justify-end pb-1 h-10">
            <span className="text-zinc-500 mb-auto">Adı Soyadı</span>
        </div>
        <div className="w-24 border-b-2 border-black border-dashed flex flex-col justify-end pb-1 h-10">
            <span className="text-zinc-500 mb-auto">Tarih</span>
        </div>
        <div className="w-24 border-b-2 border-black border-dashed flex flex-col justify-end pb-1 h-10">
            <span className="text-zinc-500 mb-auto">Süre</span>
        </div>
        <div className="w-24 border-b-2 border-black border-dashed flex flex-col justify-end pb-1 h-10">
            <span className="text-zinc-500 mb-auto">Puan</span>
        </div>
    </div>
);

const ScoreTable = ({ rows = 10 }: { rows?: number }) => (
    <div className="mt-8 border-2 border-black rounded-xl overflow-hidden text-xs bg-white text-black">
        <div className="grid grid-cols-4 bg-zinc-100 border-b-2 border-black font-bold p-2 text-center">
            <span>Bölüm</span>
            <span>Doğru</span>
            <span>Yanlış</span>
            <span>Net</span>
        </div>
        {Array.from({length: Math.min(rows, 5)}).map((_, i) => (
            <div key={i} className="grid grid-cols-4 border-b border-zinc-300 last:border-b-0 p-2 h-8">
                <span className="font-bold text-center border-r border-zinc-200">{i+1}. Bölüm</span>
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

// --- MEMORY SHEETS (Dual Page) ---

export const WordMemorySheet: React.FC<{ data: WordMemoryData }> = ({ data }) => {
    return (
        <div className="w-full">
            {/* PAGE 1: MEMORIZE */}
            <div className="flex flex-col min-h-[900px] relative break-after-page">
                <PedagogicalHeader title={data.title} instruction="1. Sayfa: Kelimeleri dikkatlice oku ve ezberle." note={data.pedagogicalNote} data={data} />
                <StudentInfoStrip />
                
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="bg-amber-50 border-4 border-amber-200 rounded-3xl p-8 shadow-sm max-w-2xl w-full text-center">
                        <h3 className="text-xl font-bold text-amber-800 mb-6 uppercase tracking-widest border-b-2 border-amber-200 pb-2">Ezberlenecek Kelimeler</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {(data.wordsToMemorize || []).map((word, index) => (
                                <EditableElement key={index} className="p-4 bg-white border-2 border-amber-100 rounded-xl shadow-[2px_2px_0px_0px_rgba(251,191,36,1)] flex items-center justify-center">
                                    <p className="text-lg font-black text-zinc-800 uppercase"><EditableText value={word.text} tag="span" /></p>
                                </EditableElement>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="text-center text-xs text-zinc-400 mt-4 font-mono uppercase tracking-widest border-t pt-2">
                    Sayfa 1 / 2 - Ezberleme Bölümü
                </div>
            </div>

            {/* PAGE 2: TEST */}
            <div className="flex flex-col min-h-[900px] relative pt-8">
                <PedagogicalHeader title={`${data.title} - TEST`} instruction="2. Sayfa: Aklında kalan kelimeleri bul ve işaretle." />
                <StudentInfoStrip />
                
                <div className="flex-1">
                    <div className="bg-white border-4 border-zinc-200 rounded-3xl p-8 max-w-3xl mx-auto w-full">
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                            {(data.testWords || []).map((word, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-zinc-50 cursor-pointer">
                                    <div className="w-5 h-5 border-2 border-zinc-400 rounded-full shrink-0"></div>
                                    <span className="text-sm font-bold text-zinc-700 uppercase truncate"><EditableText value={word.text} tag="span" /></span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <ScoreTable />
                </div>

                <div className="text-center text-xs text-zinc-400 mt-4 font-mono uppercase tracking-widest border-t pt-2">
                    Sayfa 2 / 2 - Hatırlama Testi
                </div>
            </div>
        </div>
    );
};

export const VisualMemorySheet: React.FC<{ data: VisualMemoryData }> = ({ data }) => {
    return (
        <div className="w-full">
            {/* PAGE 1: MEMORIZE */}
            <div className="flex flex-col min-h-[900px] relative break-after-page">
                <PedagogicalHeader title={data.title} instruction="1. Sayfa: Görselleri dikkatlice incele ve ezberle." note={data.pedagogicalNote} data={data} />
                <StudentInfoStrip />
                
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-6 w-full max-w-3xl">
                        {(data.itemsToMemorize || []).map((item, index) => (
                            <EditableElement key={index} className="aspect-square bg-white border-2 border-black rounded-xl p-2 flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                {item.imageBase64 ? (
                                    <ImageDisplay base64={item.imageBase64} description={item.description} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-4xl">{item.description.split(' ').pop()}</span> // Emoji fallback
                                )}
                            </EditableElement>
                        ))}
                    </div>
                </div>
                
                <div className="text-center text-xs text-zinc-400 mt-4 font-mono uppercase tracking-widest border-t pt-2">
                    Sayfa 1 / 2 - Görsel Hafıza
                </div>
            </div>

            {/* PAGE 2: TEST */}
            <div className="flex flex-col min-h-[900px] relative pt-8">
                <PedagogicalHeader title={`${data.title} - TEST`} instruction="2. Sayfa: Gördüğün resimleri işaretle." />
                <StudentInfoStrip />
                
                <div className="flex-1">
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-4 w-full">
                        {(data.testItems || []).map((item, index) => (
                            <div key={index} className="aspect-square bg-white border-2 border-zinc-200 rounded-lg p-2 flex flex-col items-center justify-center opacity-80 hover:opacity-100 hover:border-black transition-all cursor-pointer relative group">
                                <div className="absolute top-1 right-1 w-4 h-4 border-2 border-zinc-300 rounded bg-white group-hover:border-indigo-500"></div>
                                {item.imageBase64 ? (
                                    <ImageDisplay base64={item.imageBase64} description={item.description} className="w-3/4 h-3/4 object-contain opacity-50 group-hover:opacity-100 filter grayscale group-hover:grayscale-0" />
                                ) : (
                                    <span className="text-3xl filter grayscale group-hover:grayscale-0">{item.description.split(' ').pop()}</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <ScoreTable />
                </div>

                <div className="text-center text-xs text-zinc-400 mt-4 font-mono uppercase tracking-widest border-t pt-2">
                    Sayfa 2 / 2 - Hatırlama Testi
                </div>
            </div>
        </div>
    );
};

export const CharacterMemorySheet: React.FC<{ data: CharacterMemoryData }> = ({ data }) => {
    return (
        <div className="w-full">
            {/* PAGE 1 */}
            <div className="flex flex-col min-h-[900px] relative break-after-page">
                <PedagogicalHeader title={data.title} instruction="Karakterlerin özelliklerini (şapka, gözlük, renk) ezberle." note={data.pedagogicalNote} data={data} />
                <StudentInfoStrip />
                
                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 items-center justify-center p-4">
                    {(data.charactersToMemorize || []).map((char, index) => (
                        <EditableElement key={index} className="flex flex-col items-center bg-zinc-50 border-2 border-zinc-300 p-4 rounded-full aspect-square justify-center shadow-lg">
                            <ImageDisplay base64={char.imageBase64} description={char.description} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-sm mb-2" />
                            <p className="text-xs font-bold text-center bg-white px-3 py-1 rounded-full border border-zinc-200 shadow-sm"><EditableText value={char.description} tag="span" /></p>
                        </EditableElement>
                    ))}
                </div>
                <div className="footer-line">Sayfa 1 / 2</div>
            </div>

            {/* PAGE 2 */}
            <div className="flex flex-col min-h-[900px] relative pt-8">
                <PedagogicalHeader title={`${data.title} - KİMİ GÖRDÜN?`} instruction="Daha önce gördüğün karakterleri işaretle." />
                <StudentInfoStrip />
                
                <div className="flex-1 grid grid-cols-3 md:grid-cols-4 gap-4 p-4">
                    {(data.testCharacters || []).map((char, index) => (
                        <div key={index} className="flex flex-col items-center border border-zinc-200 p-2 rounded-xl relative">
                            <div className="absolute top-2 left-2 w-5 h-5 border-2 border-zinc-400 rounded bg-white"></div>
                            <ImageDisplay base64={char.imageBase64} description={char.description} className="w-24 h-24 rounded-full object-cover filter grayscale opacity-70" />
                        </div>
                    ))}
                </div>
                <ScoreTable />
            </div>
        </div>
    );
};

export const ColorWheelSheet: React.FC<{ data: ColorWheelMemoryData }> = ({ data }) => {
    const items = data.items || [];
    const radius = 120;
    const center = 150;

    return (
        <div className="w-full">
            {/* PAGE 1 */}
            <div className="flex flex-col min-h-[900px] relative break-after-page">
                <PedagogicalHeader title={data.title} instruction="Renk çemberindeki nesnelerin yerini ve rengini ezberle." note={data.pedagogicalNote} data={data} />
                <StudentInfoStrip />
                
                <div className="flex-1 flex items-center justify-center">
                    <EditableElement className="relative w-[300px] h-[300px]">
                        <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible">
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
                                        <path d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`} fill={item.color} stroke="white" strokeWidth="2" />
                                        <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fontSize="24" fill="white" fontWeight="bold" style={{textShadow: '1px 1px 2px black'}}>
                                            {item.imagePrompt || item.name[0]}
                                        </text>
                                    </g>
                                );
                            })}
                            <circle cx={center} cy={center} r={30} fill="white" stroke="black" strokeWidth="2" />
                        </svg>
                    </EditableElement>
                </div>
            </div>

            {/* PAGE 2 */}
            <div className="flex flex-col min-h-[900px] relative pt-8">
                <PedagogicalHeader title={`${data.title} - BOŞ ÇEMBER`} instruction="Çemberi aklında kaldığı gibi boya ve nesneleri çiz." />
                <StudentInfoStrip />
                
                <div className="flex-1 flex flex-col items-center justify-center">
                    <svg viewBox="0 0 300 300" className="w-[300px] h-[300px] overflow-visible mb-8">
                        <circle cx={center} cy={center} r={radius} fill="none" stroke="black" strokeWidth="2" />
                        {items.map((_, i) => {
                            const angle = (i * 360) / items.length;
                            const x1 = center + radius * Math.cos((angle - 90) * Math.PI / 180);
                            const y1 = center + radius * Math.sin((angle - 90) * Math.PI / 180);
                            return <line key={i} x1={center} y1={center} x2={x1} y2={y1} stroke="black" strokeWidth="2" />;
                        })}
                        <circle cx={center} cy={center} r={30} fill="white" stroke="black" strokeWidth="2" />
                    </svg>
                    
                    <div className="w-full max-w-lg">
                        <h4 className="font-bold border-b border-black mb-2">Hatırlatma Listesi</h4>
                        <div className="flex flex-wrap gap-2">
                            {items.map((item, i) => (
                                <span key={i} className="border border-zinc-300 px-2 py-1 rounded text-xs text-zinc-400">{item.name}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- ATTENTION & PERCEPTION SHEETS ---

export const BurdonTestSheet: React.FC<{ data: LetterGridTestData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title="BURDON DİKKAT TESTİ" instruction={data.instruction || "Sırasıyla a, b, d, g harflerinin altını çizin."} note={data.pedagogicalNote} data={data} />
        <StudentInfoStrip />
        
        <div className="bg-white border-2 border-black rounded-lg p-1">
            <div className="font-mono text-lg leading-loose tracking-widest break-all p-4 text-justify select-none">
                {data.grid.map((row, i) => (
                    <div key={i} className="mb-2 flex justify-between">
                        <span className="w-6 font-bold text-zinc-400 text-xs mt-1">{i+1}</span>
                        <div className="flex-1 flex justify-between">
                            {row.map((char, j) => (
                                <span key={j} className="inline-block w-6 text-center">{char}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="mt-6">
            <h4 className="font-bold text-sm uppercase mb-2">Puanlama Tablosu</h4>
            <div className="border border-black text-xs">
                <div className="grid grid-cols-11 border-b border-black font-bold bg-zinc-100">
                    <span className="p-1 border-r border-black">Satır</span>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <span key={n} className="p-1 border-r border-black text-center">{n}</span>)}
                </div>
                <div className="grid grid-cols-11 border-b border-black">
                    <span className="p-1 border-r border-black font-bold">Doğru</span>
                    {Array.from({length:10}).map((_,i) => <span key={i} className="p-1 border-r border-black"></span>)}
                </div>
                <div className="grid grid-cols-11">
                    <span className="p-1 border-r border-black font-bold">Yanlış</span>
                    {Array.from({length:10}).map((_,i) => <span key={i} className="p-1 border-r border-black"></span>)}
                </div>
            </div>
        </div>
    </div>
);

export const ChaoticNumberSearchSheet: React.FC<{ data: ChaoticNumberSearchData }> = ({ data }) => (
    <div className="relative h-full flex flex-col">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <StudentInfoStrip />
        
        <div className="flex-1 relative border-4 border-black rounded-3xl overflow-hidden bg-white min-h-[600px]">
            {/* Target List on Top */}
            <div className="absolute top-0 left-0 w-full bg-zinc-100 border-b-2 border-black p-2 flex justify-center gap-2 flex-wrap z-10">
                <span className="font-bold text-sm self-center mr-2">HEDEFLER:</span>
                {Array.from({length: 10}).map((_, i) => (
                    <div key={i} className="w-8 h-8 bg-white border border-black rounded-full flex items-center justify-center font-bold shadow-sm">{data.range.start + i}</div>
                ))}
                <span className="self-center">... {data.range.end}</span>
            </div>

            {/* Chaotic Numbers */}
            <div className="absolute inset-0 top-16 p-4">
                {data.numbers.map((num, i) => (
                    <EditableElement 
                        key={i} 
                        className="absolute flex items-center justify-center font-black font-dyslexic cursor-crosshair select-none"
                        style={{
                            left: `${num.x}%`,
                            top: `${num.y}%`,
                            transform: `rotate(${num.rotation}deg) scale(${num.size})`,
                            color: num.color || 'black',
                            zIndex: Math.floor(Math.random() * 10)
                        }}
                    >
                        {num.value}
                    </EditableElement>
                ))}
            </div>
        </div>
        
        <div className="mt-4 p-4 bg-zinc-100 border-2 border-dashed border-zinc-400 rounded-xl text-center">
            <p className="font-bold">Toplam Bulunan Sayı:</p>
            <div className="w-32 h-10 border-b-2 border-black mx-auto mt-2"></div>
        </div>
    </div>
);

export const StroopTestSheet: React.FC<{ data: StroopTestData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <StudentInfoStrip />
        
        <div className="grid grid-cols-4 gap-6 mt-8">
            {data.items.map((item, index) => (
                <EditableElement key={index} className="aspect-[4/3] bg-white border-4 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] break-inside-avoid">
                    <span 
                        className="text-4xl font-black tracking-wider uppercase"
                        style={{ color: item.color }} // This is the trick: Word says 'BLUE' but color is Red
                    >
                        <EditableText value={item.text} tag="span" />
                    </span>
                </EditableElement>
            ))}
        </div>

        <div className="mt-8 flex justify-between gap-8">
            <div className="flex-1 p-4 border-2 border-black rounded-xl">
                <h4 className="font-bold mb-2 border-b border-black">Hata Sayısı</h4>
                <div className="h-8"></div>
            </div>
            <div className="flex-1 p-4 border-2 border-black rounded-xl">
                <h4 className="font-bold mb-2 border-b border-black">Düzeltme Sayısı</h4>
                <div className="h-8"></div>
            </div>
            <div className="flex-1 p-4 border-2 border-black rounded-xl">
                <h4 className="font-bold mb-2 border-b border-black">Toplam Süre</h4>
                <div className="h-8"></div>
            </div>
        </div>
    </div>
);

// Standard sheets reuse common layouts but with StudentInfoStrip added
const StandardSheet = ({ data, children }: any) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <StudentInfoStrip />
        {children}
        <ScoreTable rows={5} />
    </div>
);

export const NumberSearchSheet: React.FC<{ data: NumberSearchData }> = ({ data }) => (
    <StandardSheet data={data}>
        <div className="flex flex-wrap gap-2 justify-center font-mono text-xl p-6 border-2 border-black rounded-xl bg-white">
            {data.numbers.map((n, i) => (
                <span key={i} className="w-10 h-10 flex items-center justify-center border border-zinc-100 hover:bg-zinc-100 rounded">{n}</span>
            ))}
        </div>
    </StandardSheet>
);

export const FindDuplicateSheet: React.FC<{ data: FindDuplicateData }> = ({ data }) => (
    <StandardSheet data={data}>
        <div className="space-y-4">
            {data.rows.map((row, i) => (
                <EditableElement key={i} className="flex justify-between items-center p-3 border-2 border-black rounded-lg bg-white shadow-sm">
                    <span className="w-6 font-bold">{i+1}.</span>
                    <div className="flex-1 flex justify-around font-mono text-2xl tracking-widest">
                        {row.map((char, j) => <span key={j}>{char}</span>)}
                    </div>
                </EditableElement>
            ))}
        </div>
    </StandardSheet>
);

export const LetterGridTestSheet: React.FC<{ data: LetterGridTestData }> = ({ data }) => (
    <StandardSheet data={data}>
        <div className="bg-white border-2 border-black p-4 rounded-xl font-mono text-lg tracking-widest leading-loose text-justify">
            {data.grid.map((row, i) => (
                <div key={i}>{row.join('  ')}</div>
            ))}
        </div>
    </StandardSheet>
);

export const FindLetterPairSheet: React.FC<{ data: FindLetterPairData }> = ({ data }) => (
    <StandardSheet data={data}>
        <div className="bg-white border-2 border-black p-4 rounded-xl grid gap-2" style={{gridTemplateColumns: `repeat(${data.grid.length}, 1fr)`}}>
            {data.grid.flat().map((char, i) => (
                <div key={i} className="aspect-square flex items-center justify-center border border-zinc-100 text-xl font-bold">{char}</div>
            ))}
        </div>
    </StandardSheet>
);

export const TargetSearchSheet: React.FC<{ data: TargetSearchData }> = ({ data }) => (
    <StandardSheet data={data}>
        <div className="bg-zinc-900 p-6 rounded-xl text-white font-mono text-lg tracking-widest text-center leading-loose">
            {data.grid.map((row, i) => (
                <div key={i}>{row.join(' ')}</div>
            ))}
        </div>
    </StandardSheet>
);

export const ImageComprehensionSheet: React.FC<{ data: ImageComprehensionData }> = ({ data }) => (
    <div className="w-full">
        {/* Page 1 */}
        <div className="min-h-[900px] break-after-page flex flex-col">
            <PedagogicalHeader title={data.title} instruction="Metni oku ve sahneyi zihninde canlandır." note={data.pedagogicalNote} data={data} />
            <StudentInfoStrip />
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="bg-white p-8 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-xl font-medium leading-relaxed max-w-2xl text-center font-dyslexic">
                    {data.sceneDescription}
                </div>
            </div>
            <div className="text-center text-xs border-t pt-2 mt-4">Sayfa 1 - Okuma</div>
        </div>
        
        {/* Page 2 */}
        <div className="min-h-[900px] flex flex-col pt-8">
            <PedagogicalHeader title="HATIRLAMA TESTİ" instruction="Soruları cevapla." />
            <StudentInfoStrip />
            <div className="flex-1 space-y-6">
                {data.questions.map((q, i) => (
                    <EditableElement key={i} className="p-4 border-2 border-black rounded-xl bg-white shadow-sm">
                        <p className="font-bold mb-4">{i+1}. {q}</p>
                        <div className="border-b-2 border-dashed border-zinc-400 h-8 w-full"></div>
                    </EditableElement>
                ))}
                <ScoreTable rows={3} />
            </div>
        </div>
    </div>
);
