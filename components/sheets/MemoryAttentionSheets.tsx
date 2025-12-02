
import React from 'react';
import { 
    WordMemoryData, VisualMemoryData, NumberSearchData, FindDuplicateData, LetterGridTestData, FindLetterPairData, TargetSearchData,
    ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, StroopTestData, ChaoticNumberSearchData
} from '../../types';
import { ImageDisplay, PedagogicalHeader, Shape } from './common';
import { EditableElement, EditableText } from '../Editable';

// --- SHARED COMPONENTS ---

const StudentInfoStrip = () => (
    <div className="flex flex-wrap justify-between border-2 border-black p-3 mb-6 rounded-xl bg-white text-black font-bold uppercase text-[10px] tracking-wider gap-4 print:flex w-full">
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

const ScoreTable = ({ rows = 1 }: { rows?: number }) => (
    <div className="mt-8 border-2 border-black rounded-xl overflow-hidden text-xs bg-white text-black break-inside-avoid">
        <div className="grid grid-cols-4 bg-zinc-100 border-b-2 border-black font-bold p-2 text-center">
            <span>Bölüm</span>
            <span>Doğru</span>
            <span>Yanlış</span>
            <span>Net</span>
        </div>
        {Array.from({length: rows}).map((_, i) => (
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

// --- MEMORY SHEETS (Dual Page Strategy) ---

export const WordMemorySheet: React.FC<{ data: WordMemoryData }> = ({ data }) => {
    return (
        <div className="w-full">
            {/* PAGE 1: MEMORIZE */}
            <div className="flex flex-col min-h-[1000px] relative break-after-page print:break-after-page">
                <PedagogicalHeader title={data.title} instruction="1. AŞAMA: Kelimeleri dikkatlice oku ve ezberle." note={data.pedagogicalNote} data={data} />
                <StudentInfoStrip />
                
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full text-center">
                        <h3 className="text-xl font-bold text-black mb-6 uppercase tracking-widest border-b-2 border-black pb-2">Ezberlenecek Liste</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {(data.wordsToMemorize || []).map((word, index) => (
                                <EditableElement key={index} className="p-4 bg-white border-2 border-black rounded-xl flex items-center justify-center">
                                    <p className="text-lg font-black text-black uppercase"><EditableText value={word.text} tag="span" /></p>
                                </EditableElement>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="text-center text-xs text-black mt-4 font-mono uppercase tracking-widest border-t-2 border-black pt-2">
                    Sayfa 1 / 2 - Ezberleme Bölümü (Test İçin Sayfayı Çevirin)
                </div>
            </div>

            {/* PAGE 2: TEST */}
            <div className="flex flex-col min-h-[1000px] relative pt-8">
                <PedagogicalHeader title={`${data.title} - TEST`} instruction="2. AŞAMA: Aklında kalan kelimeleri bul ve kutucuğu işaretle." />
                <StudentInfoStrip />
                
                <div className="flex-1">
                    <div className="bg-white border-4 border-black rounded-3xl p-8 max-w-3xl mx-auto w-full">
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
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

                <div className="text-center text-xs text-black mt-4 font-mono uppercase tracking-widest border-t-2 border-black pt-2">
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
            <div className="flex flex-col min-h-[1000px] relative break-after-page print:break-after-page">
                <PedagogicalHeader title={data.title} instruction="1. AŞAMA: Görselleri dikkatlice incele ve yerlerini ezberle." note={data.pedagogicalNote} data={data} />
                <StudentInfoStrip />
                
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-6 w-full max-w-3xl">
                        {(data.itemsToMemorize || []).map((item, index) => (
                            <EditableElement key={index} className="aspect-square bg-white border-2 border-black rounded-xl p-2 flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                {item.imageBase64 ? (
                                    <ImageDisplay base64={item.imageBase64} description={item.description} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-4xl">{item.imagePrompt || item.description.charAt(0)}</span>
                                )}
                            </EditableElement>
                        ))}
                    </div>
                </div>
                
                <div className="text-center text-xs text-black mt-4 font-mono uppercase tracking-widest border-t-2 border-black pt-2">
                    Sayfa 1 / 2 - Görsel Hafıza
                </div>
            </div>

            {/* PAGE 2: TEST */}
            <div className="flex flex-col min-h-[1000px] relative pt-8">
                <PedagogicalHeader title={`${data.title} - TEST`} instruction="2. AŞAMA: Bir önceki sayfada gördüğün resimleri işaretle." />
                <StudentInfoStrip />
                
                <div className="flex-1">
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-4 w-full">
                        {(data.testItems || []).map((item, index) => (
                            <div key={index} className="aspect-square bg-white border-2 border-zinc-300 rounded-lg p-2 flex flex-col items-center justify-center relative group">
                                <div className="absolute top-1 right-1 w-5 h-5 border-2 border-black rounded bg-white"></div>
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

                <div className="text-center text-xs text-black mt-4 font-mono uppercase tracking-widest border-t-2 border-black pt-2">
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
            <div className="flex flex-col min-h-[1000px] relative break-after-page print:break-after-page">
                <PedagogicalHeader title={data.title} instruction="Bu karakterleri ve özelliklerini iyi ezberle." note={data.pedagogicalNote} data={data} />
                <StudentInfoStrip />
                
                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 items-center justify-center p-4">
                    {(data.charactersToMemorize || []).map((char, index) => (
                        <EditableElement key={index} className="flex flex-col items-center bg-white border-2 border-black p-4 rounded-3xl aspect-square justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                            <ImageDisplay base64={char.imageBase64} description={char.description} className="w-32 h-32 rounded-full object-cover border-4 border-black mb-4" />
                            <p className="text-sm font-bold text-center bg-black text-white px-4 py-1 rounded-full"><EditableText value={char.description} tag="span" /></p>
                        </EditableElement>
                    ))}
                </div>
                <div className="text-center text-xs text-black border-t-2 border-black pt-2">Sayfa 1 / 2</div>
            </div>

            {/* PAGE 2 */}
            <div className="flex flex-col min-h-[1000px] relative pt-8">
                <PedagogicalHeader title={`${data.title} - KİMİ GÖRDÜN?`} instruction="Daha önce gördüğün karakterlerin altındaki kutucuğu işaretle." />
                <StudentInfoStrip />
                
                <div className="flex-1 grid grid-cols-3 md:grid-cols-4 gap-6 p-4">
                    {(data.testCharacters || []).map((char, index) => (
                        <div key={index} className="flex flex-col items-center border-2 border-black p-3 rounded-xl relative bg-white">
                            <div className="w-full flex justify-end mb-2">
                                <div className="w-6 h-6 border-2 border-black rounded bg-white"></div>
                            </div>
                            <ImageDisplay base64={char.imageBase64} description={char.description} className="w-24 h-24 rounded-full object-cover filter grayscale opacity-80" />
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
            <div className="flex flex-col min-h-[1000px] relative break-after-page print:break-after-page">
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
                <div className="text-center text-xs text-black border-t-2 border-black pt-2">Sayfa 1 / 2</div>
            </div>

            {/* PAGE 2 */}
            <div className="flex flex-col min-h-[1000px] relative pt-8">
                <PedagogicalHeader title={`${data.title} - BOŞ ÇEMBER`} instruction="Çemberi aklında kaldığı gibi boya ve nesneleri çiz." />
                <StudentInfoStrip />
                
                <div className="flex-1 flex flex-col items-center justify-center">
                    <svg viewBox="0 0 300 300" className="w-[300px] h-[300px] overflow-visible mb-8">
                        <circle cx={center} cy={center} r={radius} fill="none" stroke="black" strokeWidth="3" />
                        {items.map((_, i) => {
                            const angle = (i * 360) / items.length;
                            const x1 = center + radius * Math.cos((angle - 90) * Math.PI / 180);
                            const y1 = center + radius * Math.sin((angle - 90) * Math.PI / 180);
                            return <line key={i} x1={center} y1={center} x2={x1} y2={y1} stroke="black" strokeWidth="2" />;
                        })}
                        <circle cx={center} cy={center} r={30} fill="white" stroke="black" strokeWidth="3" />
                    </svg>
                    
                    <div className="w-full max-w-lg border-2 border-black p-4 rounded-xl">
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

export const ImageComprehensionSheet: React.FC<{ data: ImageComprehensionData }> = ({ data }) => (
    <div className="w-full">
        {/* Page 1 */}
        <div className="min-h-[1000px] break-after-page print:break-after-page flex flex-col">
            <PedagogicalHeader title={data.title} instruction="Metni oku ve sahneyi zihninde canlandır." note={data.pedagogicalNote} data={data} />
            <StudentInfoStrip />
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="bg-white p-8 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-2xl font-medium leading-loose max-w-2xl text-center font-dyslexic text-black">
                    {data.sceneDescription}
                </div>
            </div>
            <div className="text-center text-xs border-t-2 border-black pt-2 mt-4">Sayfa 1 - Okuma</div>
        </div>
        
        {/* Page 2 */}
        <div className="min-h-[1000px] flex flex-col pt-8">
            <PedagogicalHeader title="HATIRLAMA TESTİ" instruction="Metne bakmadan soruları cevapla." />
            <StudentInfoStrip />
            <div className="flex-1 space-y-8 mt-8">
                {data.questions.map((q, i) => (
                    <EditableElement key={i} className="p-6 border-2 border-black rounded-xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <p className="font-bold text-lg mb-4 flex gap-2"><span className="bg-black text-white w-6 h-6 flex items-center justify-center rounded text-sm">{i+1}</span> {q}</p>
                        <div className="border-b-2 border-black border-dashed h-8 w-full mt-4"></div>
                        <div className="border-b-2 border-black border-dashed h-8 w-full mt-4"></div>
                    </EditableElement>
                ))}
                <ScoreTable rows={1} />
            </div>
        </div>
    </div>
);

// --- ATTENTION & PERCEPTION SHEETS ---

export const BurdonTestSheet: React.FC<{ data: LetterGridTestData }> = ({ data }) => (
    <div className="w-full h-full">
        <PedagogicalHeader title="BURDON DİKKAT TESTİ" instruction={data.instruction || "Sırasıyla a, b, d, g harflerinin altını çizin."} note={data.pedagogicalNote} data={data} />
        <StudentInfoStrip />
        
        <div className="bg-white border-2 border-black rounded-lg p-1">
            {/* Standard Burdon Layout: Blocks of 10/20 chars lines */}
            <div className="font-mono text-xl leading-loose tracking-[0.2em] p-6 text-justify select-none text-black break-all">
                {data.grid.map((row, i) => (
                    <div key={i} className="mb-4 flex gap-4 items-center border-b border-zinc-100 pb-1">
                        <span className="w-6 font-bold text-black text-sm border-r-2 border-black pr-2">{i+1}.</span>
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

        <div className="mt-6 break-inside-avoid">
            <h4 className="font-bold text-sm uppercase mb-2 border-b-2 border-black inline-block">Genel Puanlama</h4>
            <div className="border-2 border-black text-xs bg-white text-black">
                <div className="grid grid-cols-11 border-b-2 border-black font-bold bg-zinc-100">
                    <span className="p-2 border-r border-black">Satır</span>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <span key={n} className="p-2 border-r border-black text-center">{n}</span>)}
                </div>
                <div className="grid grid-cols-11 border-b border-black h-8">
                    <span className="p-2 border-r border-black font-bold bg-zinc-50">Doğru</span>
                    {Array.from({length:10}).map((_,i) => <span key={i} className="p-2 border-r border-black"></span>)}
                </div>
                <div className="grid grid-cols-11 h-8">
                    <span className="p-2 border-r border-black font-bold bg-zinc-50">Yanlış</span>
                    {Array.from({length:10}).map((_,i) => <span key={i} className="p-2 border-r border-black"></span>)}
                </div>
            </div>
        </div>
    </div>
);

export const ChaoticNumberSearchSheet: React.FC<{ data: ChaoticNumberSearchData }> = ({ data }) => (
    <div className="relative h-full flex flex-col w-full">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <StudentInfoStrip />
        
        <div className="flex-1 relative border-4 border-black rounded-3xl overflow-hidden bg-white min-h-[600px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            {/* Target List on Top */}
            <div className="absolute top-0 left-0 w-full bg-black text-white p-2 flex justify-center gap-2 flex-wrap z-10 border-b-4 border-black">
                <span className="font-bold text-sm self-center mr-2 uppercase tracking-wider">Aranacaklar:</span>
                <div className="flex gap-2">
                    <span className="font-black text-lg bg-white text-black px-2 rounded">{data.range.start}</span>
                    <span className="self-center">...</span>
                    <span className="font-black text-lg bg-white text-black px-2 rounded">{data.range.end}</span>
                </div>
            </div>

            {/* Chaotic Numbers - Absolute Positioning */}
            <div className="absolute inset-0 top-12 p-4">
                {data.numbers.map((num, i) => (
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
        
        <div className="mt-6 flex justify-center gap-4">
            <div className="p-4 bg-white border-2 border-black rounded-xl text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-48">
                <p className="font-bold text-black uppercase text-xs mb-2">Başlama</p>
                <div className="h-6 border-b border-black border-dashed"></div>
            </div>
            <div className="p-4 bg-white border-2 border-black rounded-xl text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-48">
                <p className="font-bold text-black uppercase text-xs mb-2">Bitiş</p>
                <div className="h-6 border-b border-black border-dashed"></div>
            </div>
        </div>
    </div>
);

export const StroopTestSheet: React.FC<{ data: StroopTestData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <StudentInfoStrip />
        
        <div className="grid grid-cols-4 gap-6 mt-8">
            {data.items.map((item, index) => (
                <EditableElement key={index} className="aspect-[4/3] bg-white border-4 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] break-inside-avoid relative overflow-hidden">
                    <div className="absolute top-1 left-2 text-[10px] font-bold text-zinc-300">{index+1}</div>
                    <span 
                        className="text-3xl md:text-4xl font-black tracking-wider uppercase"
                        style={{ color: item.color }} // This is the trick: Word says 'BLUE' but color is Red
                    >
                        <EditableText value={item.text} tag="span" />
                    </span>
                </EditableElement>
            ))}
        </div>

        <div className="mt-8 flex justify-between gap-4 border-t-2 border-black pt-6">
            <div className="flex-1 p-4 border-2 border-black rounded-xl bg-white shadow-sm">
                <h4 className="font-bold mb-2 border-b border-black text-center uppercase text-xs">Toplam Hata</h4>
                <div className="h-8"></div>
            </div>
            <div className="flex-1 p-4 border-2 border-black rounded-xl bg-white shadow-sm">
                <h4 className="font-bold mb-2 border-b border-black text-center uppercase text-xs">Düzeltme</h4>
                <div className="h-8"></div>
            </div>
            <div className="flex-1 p-4 border-2 border-black rounded-xl bg-white shadow-sm">
                <h4 className="font-bold mb-2 border-b border-black text-center uppercase text-xs">Süre (sn)</h4>
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
        <ScoreTable rows={1} />
    </div>
);

export const NumberSearchSheet: React.FC<{ data: NumberSearchData }> = ({ data }) => (
    <StandardSheet data={data}>
        <div className="flex flex-wrap gap-3 justify-center font-mono text-xl p-8 border-2 border-black rounded-3xl bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            {data.numbers.map((n, i) => (
                <span key={i} className="w-12 h-12 flex items-center justify-center border-2 border-zinc-100 hover:border-black rounded-lg font-bold text-black transition-all cursor-default select-none">{n}</span>
            ))}
        </div>
    </StandardSheet>
);

export const FindDuplicateSheet: React.FC<{ data: FindDuplicateData }> = ({ data }) => (
    <StandardSheet data={data}>
        <div className="space-y-4">
            {data.rows.map((row, i) => (
                <EditableElement key={i} className="flex justify-between items-center p-3 border-2 border-black rounded-lg bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] break-inside-avoid">
                    <span className="w-8 h-8 bg-black text-white rounded flex items-center justify-center font-bold text-sm mr-4">{i+1}</span>
                    <div className="flex-1 flex justify-between font-mono text-2xl tracking-widest font-bold text-black">
                        {row.map((char, j) => <span key={j} className="hover:text-indigo-600 cursor-pointer">{char}</span>)}
                    </div>
                </EditableElement>
            ))}
        </div>
    </StandardSheet>
);

export const LetterGridTestSheet: React.FC<{ data: LetterGridTestData }> = ({ data }) => (
    <StandardSheet data={data}>
        <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="font-mono text-lg leading-[2.5rem] tracking-[0.5em] break-all text-justify select-none text-black">
                {data.grid.map((row, i) => (
                    <div key={i} className="mb-2 flex items-center border-b border-zinc-100 pb-1">
                        <span className="w-6 font-bold text-zinc-400 text-xs mr-2">{i+1}</span>
                        <div className="flex-1 text-center">
                            {row.join('')}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </StandardSheet>
);

export const FindLetterPairSheet: React.FC<{ data: FindLetterPairData }> = ({ data }) => (
    <StandardSheet data={data}>
        <div className="bg-white border-4 border-black p-4 rounded-xl grid gap-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{gridTemplateColumns: `repeat(${data.grid.length}, 1fr)`}}>
            {data.grid.flat().map((char, i) => (
                <div key={i} className="aspect-square flex items-center justify-center border border-zinc-100 text-lg font-bold text-black hover:bg-zinc-100">{char}</div>
            ))}
        </div>
        <div className="mt-4 text-center">
            <span className="font-bold border-2 border-black px-4 py-2 rounded-full shadow-sm bg-white">Hedef İkili: {data.targetPair}</span>
        </div>
    </StandardSheet>
);

export const TargetSearchSheet: React.FC<{ data: TargetSearchData }> = ({ data }) => (
    <StandardSheet data={data}>
        <div className="bg-white border-4 border-black p-6 rounded-3xl text-black font-mono text-xl tracking-widest text-center leading-loose shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] select-none">
            {data.grid.map((row, i) => (
                <div key={i} className="hover:bg-zinc-50">{row.join(' ')}</div>
            ))}
        </div>
        <div className="mt-4 flex justify-center gap-4">
            <div className="flex items-center gap-2">
                <span className="font-bold text-sm uppercase">Hedef:</span>
                <span className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center font-bold text-xl">{data.target}</span>
            </div>
        </div>
    </StandardSheet>
);
