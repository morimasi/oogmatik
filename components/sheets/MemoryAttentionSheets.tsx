
import React from 'react';
import { 
    VisualMemoryData, LetterGridTestData, StroopTestData
} from '../../types';
import { ImageDisplay, PedagogicalHeader } from './common';

export const VisualMemorySheet: React.FC<{ data: VisualMemoryData }> = ({ data }) => (
    <div>
        <div className="page relative">
            <PedagogicalHeader title={data.title} instruction={data.instruction || data.memorizeTitle} note={data.pedagogicalNote} />
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
                {(data.itemsToMemorize || []).map((item, index) => (
                    <div key={index} className="p-4 bg-white dark:bg-zinc-800 border-2 border-indigo-200 rounded-xl text-center flex flex-col items-center justify-center aspect-square shadow-md">
                        <p className="text-5xl mb-2">{item.description.split(' ').pop()}</p>
                        <p className="text-xs font-semibold text-zinc-500 uppercase">{item.description.split(' ').slice(0, -1).join(' ')}</p>
                    </div>
                ))}
            </div>
            <div className="absolute bottom-0 w-full text-center text-sm text-zinc-400 italic print:block hidden">
                --- Katlama Çizgisi ---
            </div>
        </div>
        <div className="page-break"></div>
        <div className="page">
            <h3 className="text-2xl font-bold mb-4 text-center mt-8">{data.testTitle}</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {(data.testItems || []).map((item, index) => (
                    <div key={index} className="flex flex-col items-center justify-center text-center bg-white dark:bg-zinc-700/50 p-3 rounded-lg border cursor-pointer hover:bg-zinc-50" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                        <div className="w-6 h-6 border-2 border-zinc-400 rounded-full mb-3 shrink-0"></div>
                        <p className="text-4xl">{item.description.split(' ').pop()}</p>
                        <label className="text-xs mt-1 font-medium">{item.description.split(' ').slice(0, -1).join(' ')}</label>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const LetterGridTestSheet: React.FC<{ data: LetterGridTestData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || "Hedef harfleri bul."} note={data.pedagogicalNote} />
        <div className="bg-white dark:bg-zinc-700/30 p-6 rounded-xl shadow-inner flex justify-center">
            <table className="border-collapse">
                <tbody>
                    {(data.grid || []).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {(row || []).map((cell, cellIndex) => (
                                <td key={cellIndex} className="border border-zinc-300 dark:border-zinc-600 text-center font-mono text-lg w-8 h-8 p-1 hover:bg-yellow-100 cursor-pointer">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export const BurdonTestSheet: React.FC<{ data: LetterGridTestData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title="BURDON DİKKAT TESTİ" instruction={data.instruction || "a, b, d, g harflerini bul ve çiz."} note={data.pedagogicalNote} />
        <div className="mb-6 border-2 p-4 rounded-lg grid grid-cols-2 gap-4 bg-zinc-50 print:bg-white" style={{borderColor: 'var(--worksheet-border-color)'}}>
            <div><label className="block text-sm font-bold uppercase text-zinc-500">Adı Soyadı:</label><div className="h-8 mt-1 border-b-2 border-zinc-300"></div></div>
            <div><label className="block text-sm font-bold uppercase text-zinc-500">Süre:</label><div className="h-8 mt-1 border-b-2 border-zinc-300"></div></div>
        </div>
        <div className="bg-white dark:bg-zinc-700/30 p-4 rounded-lg">
            <table className="w-full border-separate border-spacing-y-2">
                <tbody>
                    {(data.grid || []).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td className="text-xs text-zinc-400 w-4">{rowIndex+1}</td>
                            {(row || []).map((cell, cellIndex) => (
                                <td key={cellIndex} className="text-center font-serif text-lg w-6 h-8">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export const StroopTestSheet: React.FC<{ data: StroopTestData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || "Rengi söyle!"} note={data.pedagogicalNote} />
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-8 text-center mt-8">
            {(data.items || []).map((item, index) => (
                <div key={index} className="p-6 rounded-xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center h-32">
                    <p className="text-4xl sm:text-5xl font-black tracking-wide" style={{ color: item.color, textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
                        {item.text}
                    </p>
                </div>
            ))}
        </div>
    </div>
);
