import React from 'react';
import { 
    WordMemoryData, VisualMemoryData, CharacterMemoryData, ColorWheelMemoryData, ImageComprehensionData
} from '../../../types';
import { ImageDisplay, PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const ScoreTable = ({ rows = 1 }: { rows?: number }) => (
    <div className="mt-8 border-2 border-black rounded-xl overflow-hidden text-xs bg-white text-black break-inside-avoid">
        <div className="grid grid-cols-4 bg-zinc-100 border-b-2 border-black font-bold p-2 text-center">
            <span>Bölüm</span><span>Doğru</span><span>Yanlış</span><span>Net</span>
        </div>
        {Array.from({length: rows}).map((_, i) => (
            <div key={i} className="grid grid-cols-4 border-b border-zinc-300 last:border-b-0 p-2 h-8">
                <span className="font-bold text-center border-r border-zinc-200">{i+1}. Bölüm</span>
                <span className="border-r border-zinc-200"></span><span className="border-r border-zinc-200"></span><span></span>
            </div>
        ))}
    </div>
);

export const WordMemorySheet: React.FC<{ data: WordMemoryData }> = ({ data }) => (
    <div className="w-full font-lexend">
        <div className="min-h-[500px] flex flex-col">
            <PedagogicalHeader title={data.title} instruction="1. AŞAMA: Kelimeleri ezberle." note={data.pedagogicalNote} data={data} />
            <div className="flex-1 flex items-center justify-center">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-2xl">
                    {(data.wordsToMemorize || []).map((word, i) => (
                        <div key={i} className="p-4 border-2 border-black rounded-xl text-center font-black text-lg uppercase">
                            <EditableText value={word.text} tag="span" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <div className="min-h-[500px] flex flex-col pt-12 border-t-4 border-dashed border-zinc-100 mt-12">
            <PedagogicalHeader title="TEST AŞAMASI" instruction="Az önce gördüğün kelimeleri işaretle." />
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-8">
                {(data.testWords || []).map((word, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 border border-zinc-200 rounded-lg">
                        <div className="w-5 h-5 border-2 border-black rounded"></div>
                        <span className="text-sm font-bold truncate uppercase">{word.text}</span>
                    </div>
                ))}
            </div>
            <ScoreTable />
        </div>
    </div>
);

export const VisualMemorySheet: React.FC<{ data: VisualMemoryData }> = ({ data }) => (
    <div className="w-full font-lexend">
        <div className="min-h-[500px] flex flex-col">
            <PedagogicalHeader title={data.title} instruction="Görselleri ve yerlerini ezberle." note={data.pedagogicalNote} data={data} />
            <div className="grid grid-cols-3 md:grid-cols-4 gap-6 mt-8">
                {(data.itemsToMemorize || []).map((item, i) => (
                    <div key={i} className="aspect-square border-2 border-black rounded-2xl p-2 bg-white shadow-sm">
                        <ImageDisplay prompt={item.imagePrompt} description={item.description} className="w-full h-full object-contain" />
                    </div>
                ))}
            </div>
        </div>
        <div className="min-h-[500px] flex flex-col pt-12 border-t-4 border-dashed border-zinc-100 mt-12">
            <PedagogicalHeader title="GÖRSEL TEST" instruction="Gördüğün resimleri işaretle." />
            <div className="grid grid-cols-4 md:grid-cols-5 gap-4 mt-8">
                {(data.testItems || []).map((item, i) => (
                    <div key={i} className="aspect-square border border-zinc-200 rounded-xl p-2 relative grayscale opacity-50">
                        <div className="absolute top-1 right-1 w-4 h-4 border border-black rounded bg-white"></div>
                        <ImageDisplay prompt={item.imagePrompt} className="w-full h-full object-contain" />
                    </div>
                ))}
            </div>
            <ScoreTable />
        </div>
    </div>
);

export const CharacterMemorySheet: React.FC<{ data: CharacterMemoryData }> = ({ data }) => (
    <div className="w-full font-lexend">
        <div className="min-h-[500px] flex flex-col">
            <PedagogicalHeader title={data.title} instruction="Bu karakterleri ve özelliklerini iyi ezberle." note={data.pedagogicalNote} data={data} />
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 items-center justify-center p-4">
                {(data.charactersToMemorize || []).map((char, index) => (
                    <EditableElement key={index} className="flex flex-col items-center bg-white border-2 border-black p-4 rounded-3xl aspect-square justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <ImageDisplay prompt={char.imagePrompt} className="w-32 h-32 rounded-full object-cover border-4 border-black mb-4" />
                        <p className="text-sm font-bold text-center bg-black text-white px-4 py-1 rounded-full"><EditableText value={char.description} tag="span" /></p>
                    </EditableElement>
                ))}
            </div>
        </div>
        <div className="min-h-[500px] flex flex-col pt-12 border-t-4 border-dashed border-zinc-100 mt-12">
            <PedagogicalHeader title="HATIRLAMA TESTİ" instruction="Daha önce gördüğün karakterlerin altındaki kutucuğu işaretle." />
            <div className="flex-1 grid grid-cols-3 md:grid-cols-4 gap-6 p-4 mt-8">
                {(data.testCharacters || []).map((char, index) => (
                    <div key={index} className="flex flex-col items-center border-2 border-zinc-200 p-3 rounded-xl relative bg-white">
                        <div className="absolute top-2 right-2 w-6 h-6 border-2 border-black rounded bg-white"></div>
                        <ImageDisplay prompt={char.imagePrompt} className="w-24 h-24 rounded-full object-cover filter grayscale opacity-50" />
                    </div>
                ))}
            </div>
            <ScoreTable />
        </div>
    </div>
);

export const ColorWheelSheet: React.FC<{ data: ColorWheelMemoryData }> = ({ data }) => {
    const items = data.items || [];
    const radius = 110; const center = 150;
    return (
        <div className="w-full font-lexend">
            <PedagogicalHeader title={data.title} instruction="Renkleri ve nesneleri ezberle." note={data.pedagogicalNote} data={data} />
            <div className="flex items-center justify-center py-12">
                <svg viewBox="0 0 300 300" className="w-80 h-80 overflow-visible drop-shadow-2xl">
                    {items.map((item, i) => {
                        const angle = (i * 360) / items.length;
                        const nextAngle = ((i + 1) * 360) / items.length;
                        const x1 = center + radius * Math.cos((angle - 90) * Math.PI / 180);
                        const y1 = center + radius * Math.sin((angle - 90) * Math.PI / 180);
                        const x2 = center + radius * Math.cos((nextAngle - 90) * Math.PI / 180);
                        const y2 = center + radius * Math.sin((nextAngle - 90) * Math.PI / 180);
                        return (
                            <g key={i}>
                                <path d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`} fill={item.color} stroke="white" strokeWidth="3" />
                                <text x={center + (radius * 0.7) * Math.cos(((angle + (360/items.length)/2) - 90) * Math.PI / 180)} y={center + (radius * 0.7) * Math.sin(((angle + (360/items.length)/2) - 90) * Math.PI / 180)} textAnchor="middle" fontSize="20" fill="white" stroke="black" strokeWidth="0.5" fontWeight="bold">{item.imagePrompt?.substring(0,2)}</text>
                            </g>
                        );
                    })}
                    <circle cx={center} cy={center} r={30} fill="white" stroke="zinc-100" strokeWidth="2" />
                </svg>
            </div>
        </div>
    );
};

export const ImageComprehensionSheet: React.FC<{ data: ImageComprehensionData }> = ({ data }) => (
    <div className="w-full font-lexend">
        <PedagogicalHeader title={data.title} instruction="Metni oku ve sahneyi zihninde canlandır." note={data.pedagogicalNote} data={data} />
        <div className="p-10 bg-indigo-50/30 border-2 border-indigo-100 rounded-[3rem] text-2xl font-medium leading-relaxed font-dyslexic text-zinc-800 text-center my-12 italic">
            <EditableText value={data.sceneDescription} tag="div" />
        </div>
        <div className="space-y-6 mt-12 pt-12 border-t-2 border-dashed border-zinc-100">
            {(data.questions || []).map((q, i) => (
                <div key={i} className="p-6 border-2 border-zinc-900 rounded-3xl bg-white shadow-sm">
                    <p className="font-black text-lg mb-4 flex gap-3"><span className="bg-zinc-900 text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm">{i+1}</span> {q}</p>
                    <div className="h-8 border-b-2 border-dashed border-zinc-200"></div>
                </div>
            ))}
        </div>
    </div>
);