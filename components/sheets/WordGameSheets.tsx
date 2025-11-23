
import React from 'react';
import { 
    WordSearchData, AnagramsData, SpellingCheckData, CrosswordData, CrosswordClue
} from '../../types';
import { GridComponent, ImageDisplay, PedagogicalHeader } from './common';

export const WordSearchSheet: React.FC<{ data: WordSearchData }> = ({ data }) => {
    const gridData = (data as any).grid as string[][];
    let wordsData: string[] = [];
    if ('words' in data && data.words) {
      wordsData = data.words;
    }
    
    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction || "Kelimeleri bul ve işaretle."} note={data.pedagogicalNote} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white dark:bg-zinc-700/30 p-4 rounded-lg shadow-inner">
                <GridComponent grid={gridData} />
            </div>
            <div>
                <h4 className="font-bold mb-2 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-200 dark:border-indigo-800 pb-1">Kelime Listesi:</h4>
                <ul className="grid grid-cols-2 md:grid-cols-1 gap-2">
                {(wordsData || []).map((word, index) => (
                    <li key={index} className="capitalize flex items-center">
                        <div className="w-4 h-4 border border-zinc-400 rounded mr-2"></div>
                        {word}
                    </li>
                ))}
                </ul>
                {'writingPrompt' in data && <div className="mt-6 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded border border-indigo-100 dark:border-indigo-800"><p className="text-sm italic">{data.writingPrompt}</p></div>}
            </div>
            </div>
            {'followUpQuestion' in data && data.followUpQuestion && (
                <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border-l-4 border-amber-400">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-1">Ek Soru</h4>
                    <p className="text-sm text-zinc-700 dark:text-zinc-200">{data.followUpQuestion}</p>
                    <div className="w-full h-8 mt-2 border-b-2 border-dotted border-zinc-400"></div>
                </div>
            )}
             {'hiddenMessage' in data && data.hiddenMessage && (
                <div className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    <p><strong>İpucu:</strong> Kullanılmayan harflerde gizli bir mesaj olabilir!</p>
                </div>
            )}
        </div>
    )
};

export const AnagramSheet: React.FC<{ data: AnagramsData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {(data.anagrams || []).map((item, index) => (
                <div key={index} className="flex flex-col items-center bg-white dark:bg-zinc-700/50 p-6 rounded-xl shadow-sm border-2" style={{borderColor: 'var(--worksheet-border-color)'}}>
                    <ImageDisplay base64={item.imageBase64} description={item.word} className="w-24 h-24 mb-4 rounded-lg shadow-sm" />
                    <div className="flex gap-1 mb-4 flex-wrap justify-center">
                        {item.scrambled.split('').map((char, i) => (
                            <span key={i} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-amber-100 dark:bg-amber-900/50 border-2 border-amber-300 dark:border-amber-700 rounded text-xl font-bold uppercase shadow-sm transform hover:-translate-y-1 transition-transform cursor-default">
                                {char}
                            </span>
                        ))}
                    </div>
                    <div className="w-full h-10 bg-zinc-50 dark:bg-zinc-800 rounded-md border-b-2 border-zinc-300 dark:border-zinc-600 flex items-end px-2 pb-1">
                        <div className="w-full border-b border-dotted border-zinc-400"></div>
                    </div>
                </div>
            ))}
        </div>
        <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800">
            <p className="font-bold text-indigo-800 dark:text-indigo-200 mb-3 flex items-center gap-2"><i className="fa-solid fa-pencil"></i> {data.sentencePrompt}</p>
            <div className="w-full h-24 border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-lg bg-white dark:bg-zinc-800/50"></div>
        </div>
    </div>
);

export const SpellingCheckSheet: React.FC<{ data: SpellingCheckData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || "Doğru yazılanı bul."} note={data.pedagogicalNote} />
        <div className="space-y-4 max-w-3xl mx-auto">
            {(data.checks || []).map((check, index) => (
                <div key={index} className="p-5 rounded-xl bg-white dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-shrink-0">
                        <ImageDisplay base64={check.imageBase64} description={check.correct} className="w-24 h-24 rounded-lg" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold mb-4 text-lg">
                            Aşağıdakilerden hangisi doğru yazılmıştır?
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {(check.options || []).map((option, optIndex) => (
                                 <div key={optIndex} className="flex items-center p-3 rounded-lg border-2 border-transparent hover:border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer transition-all group">
                                    <div className="w-5 h-5 border-2 border-zinc-400 rounded-full mr-3 flex items-center justify-center group-hover:border-indigo-500"></div>
                                    <label className="text-lg font-medium cursor-pointer select-none">{option}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const CrosswordSheet: React.FC<{ data: CrosswordData }> = ({ data }) => {
    const { title, prompt, grid, clues, passwordCells, passwordLength, passwordPrompt, pedagogicalNote, instruction } = data;
    const [processedClues, positionToNumberMap] = React.useMemo(() => {
        const processed: CrosswordClue[] = JSON.parse(JSON.stringify(clues || []));
        const uniqueStarts: {row: number, col: number}[] = [];
        (processed || []).forEach(clue => {
            if (!uniqueStarts.some(s => s.row === clue.start.row && s.col === clue.start.col)) {
                uniqueStarts.push(clue.start);
            }
        });
        uniqueStarts.sort((a, b) => (a.row * 100 + a.col) - (b.row * 100 + b.col));
        
        const posMap = new Map<string, number>();
        (uniqueStarts || []).forEach((start, index) => {
            posMap.set(`${start.row}-${start.col}`, index + 1);
        });
        (processed || []).forEach(clue => {
            const key = `${clue.start.row}-${clue.start.col}`;
            clue.id = posMap.get(key)!;
        });
        return [processed, posMap];
    }, [clues]);
    
    const acrossClues = (processedClues || []).filter(c => c.direction === 'across').sort((a, b) => a.id - b.id);
    const downClues = (processedClues || []).filter(c => c.direction === 'down').sort((a, b) => a.id - b.id);
    const gridSize = (grid || []).length;

    return (
        <div>
            <PedagogicalHeader title={title} instruction={instruction || prompt} note={pedagogicalNote} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="w-full max-w-md mx-auto lg:max-w-none">
                    <div
                        className="grid border-4 border-zinc-800 dark:border-zinc-500 bg-zinc-800 dark:bg-zinc-900 shadow-xl"
                        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gap: '1px' }}
                    >
                        {(grid || []).flat().map((cell, index) => {
                            const r = Math.floor(index / gridSize);
                            const c = index % gridSize;
                            const key = `${r}-${c}`;
                            const clueNumber = positionToNumberMap.get(key);
                            const isPassword = (passwordCells || []).some(p => p.row === r && p.col === c);
                            
                            return (
                                <div key={key} className={`relative aspect-square ${cell === null ? 'bg-zinc-900 dark:bg-zinc-950' : 'bg-white dark:bg-zinc-800'} ${isPassword ? 'bg-amber-50 dark:bg-amber-900/30' : ''}`}>
                                    {clueNumber && <span className="absolute top-0.5 left-1 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 z-10 leading-none">{clueNumber}</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="text-sm space-y-8">
                    {acrossClues.length > 0 && (
                        <div className="bg-white dark:bg-zinc-700/30 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <h4 className="font-bold text-lg mb-3 text-indigo-600 dark:text-indigo-400 flex items-center"><i className="fa-solid fa-arrow-right mr-2"></i>Soldan Sağa</h4>
                            <ul className="space-y-3">
                                {acrossClues.map(clue => (
                                    <li key={`across-${clue.id}`} className="flex items-start group">
                                        <span className="font-bold mr-2 w-6 h-6 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center text-xs group-hover:bg-indigo-100 transition-colors">{clue.id}</span>
                                        <div className="flex-1">
                                            {clue.imageBase64 ? <ImageDisplay base64={clue.imageBase64} description={clue.text} className="w-20 h-20 rounded mb-1" /> : <span className="text-zinc-700 dark:text-zinc-300">{clue.text}</span>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {downClues.length > 0 && (
                        <div className="bg-white dark:bg-zinc-700/30 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                             <h4 className="font-bold text-lg mb-3 text-violet-600 dark:text-violet-400 flex items-center"><i className="fa-solid fa-arrow-down mr-2"></i>Yukarıdan Aşağıya</h4>
                            <ul className="space-y-3">
                                {downClues.map(clue => (
                                    <li key={`down-${clue.id}`} className="flex items-start group">
                                        <span className="font-bold mr-2 w-6 h-6 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center text-xs group-hover:bg-violet-100 transition-colors">{clue.id}</span>
                                         <div className="flex-1">
                                            {clue.imageBase64 ? <ImageDisplay base64={clue.imageBase64} description={clue.text} className="w-20 h-20 rounded mb-1" /> : <span className="text-zinc-700 dark:text-zinc-300">{clue.text}</span>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            
            {(passwordPrompt || passwordLength > 0) && (
                 <div className="mt-10 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700 text-center max-w-2xl mx-auto">
                    <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-4 uppercase tracking-widest">Gizli Şifre</h4>
                    <div className="flex justify-center gap-3 mb-4">
                     {Array.from({ length: passwordLength }).map((_, i) => (
                        <div key={i} className="w-12 h-14 border-b-4 border-amber-500 bg-white dark:bg-zinc-800 rounded-t-lg shadow-sm"></div>
                    ))}
                    </div>
                    {passwordPrompt && <p className="font-medium text-zinc-600 dark:text-zinc-400">{passwordPrompt}</p>}
                </div>
            )}
        </div>
    );
};
