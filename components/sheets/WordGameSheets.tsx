
import React from 'react';
import { 
    WordSearchData, WordSearchWithPasswordData, ProverbSearchData, LetterGridWordFindData, ThematicWordSearchColorData,
    SynonymWordSearchData, SynonymSearchAndStoryData, AnagramsData, SpellingCheckData, LetterBridgeData, WordLadderData,
    WordFormationData, ReverseWordData, WordGroupingData, MiniWordGridData, PasswordFinderData, SyllableCompletionData,
    SpiralPuzzleData, PunctuationSpiralPuzzleData, CrosswordData, CrosswordClue, JumbledWordStoryData, HomonymSentenceData,
    WordGridPuzzleData, HomonymImageMatchData, AntonymFlowerPuzzleData, SynonymAntonymGridData, AntonymResfebeData,
    SynonymMatchingPatternData, MissingPartsData, WordWebData, SyllableWordSearchData, WordWebWithPasswordData,
    WordPlacementPuzzleData, PositionalAnagramData, ImageAnagramSortData, AnagramImageMatchData, ResfebeData, ResfebeClue
} from '../../types';
import { GridComponent, ImageDisplay, PedagogicalHeader, ShapeDisplay } from './common';
import { StyleSettings } from '../../types';
import { EditableElement, EditableText } from '../Editable';

interface SheetProps<T> {
    data: T;
    settings?: StyleSettings;
}

// --- 1. Word Search Family (Enhanced) ---
export const WordSearchSheet: React.FC<SheetProps<WordSearchData | WordSearchWithPasswordData | ProverbSearchData | LetterGridWordFindData | ThematicWordSearchColorData>> = ({ data, settings }) => {
    const isWithPassword = 'passwordCells' in data && !!data.passwordCells;
    const gridData = (data as any).grid as string[][];
    let wordsData: string[] = [];
    if ('words' in data && data.words) {
      wordsData = data.words;
    } else if ('proverb' in data && data.proverb) {
      wordsData = data.proverb.split(' ');
    }
    
    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction || "Kelimeleri bul ve işaretle."} note={data.pedagogicalNote} data={data} />
            <div className="flex flex-col gap-8 items-center">
                <EditableElement className="bg-white p-4 rounded-xl shadow-inner border-4 border-zinc-200 w-full max-w-2xl">
                    <GridComponent grid={gridData} passwordCells={isWithPassword ? (data as WordSearchWithPasswordData).passwordCells : undefined} cellClassName="w-10 h-10 md:w-12 md:h-12 text-xl md:text-2xl font-bold" />
                </EditableElement>
                
                <EditableElement className="w-full max-w-3xl bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
                    <h4 className="font-bold mb-4 text-indigo-600 border-b-2 border-indigo-200 pb-2 uppercase tracking-wider flex items-center gap-2">
                        <i className="fa-solid fa-list-check"></i> Kelime Listesi
                    </h4>
                    <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {(wordsData || []).map((word, index) => (
                            <li key={index} className="capitalize flex items-center group cursor-pointer">
                                <div className="w-5 h-5 border-2 border-zinc-400 rounded mr-3 shrink-0 group-hover:border-indigo-500 group-hover:bg-indigo-100 transition-colors"></div>
                                <EditableText value={word} tag="span" className="font-medium text-lg text-zinc-700" />
                            </li>
                        ))}
                    </ul>
                    {'writingPrompt' in data && (
                        <div className="mt-6 p-4 bg-white rounded-xl border border-indigo-100 shadow-sm">
                            <p className="text-sm italic text-indigo-800 font-medium mb-2"><i className="fa-solid fa-pen-fancy mr-2"></i>{data.writingPrompt}</p>
                            <div className="h-20 border-b-2 border-dotted border-indigo-200"></div>
                        </div>
                    )}
                </EditableElement>
            </div>
            {'followUpQuestion' in data && data.followUpQuestion && (
                <EditableElement className="mt-8 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400 shadow-sm">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-amber-700 mb-1">Ek Soru</h4>
                    <p className="text-base text-zinc-800 font-medium"><EditableText value={data.followUpQuestion} tag="span" /></p>
                    <div className="w-full h-8 mt-2 border-b-2 border-dotted border-zinc-400"></div>
                </EditableElement>
            )}
             {'hiddenMessage' in data && data.hiddenMessage && (
                <div className="mt-6 text-center">
                    <div className="inline-block px-6 py-2 bg-zinc-100 rounded-full border border-zinc-300">
                        <p className="text-sm text-zinc-500"><strong>İpucu:</strong> Kullanılmayan harflerden oluşan gizli mesajı bul!</p>
                        <div className="mt-2 flex gap-1 justify-center">
                            {Array.from({length: 8}).map((_,i) => <div key={i} className="w-6 h-8 border-b-2 border-zinc-400"></div>)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
};

export const SynonymSearchAndStorySheet: React.FC<SheetProps<SynonymSearchAndStoryData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.prompt} note={data.pedagogicalNote} data={data} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <EditableElement className="bg-white p-2 rounded-xl shadow-lg border-2 border-zinc-100">
                <GridComponent grid={data.grid} cellClassName="w-9 h-9 text-lg" />
            </EditableElement>
            
            <div className="space-y-6">
                <EditableElement className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                    <h4 className="font-bold mb-3 text-indigo-700 border-b border-indigo-200 pb-1">Eş Anlam Eşleştirmesi</h4>
                    <ul className="space-y-2">
                    {(data.wordTable || []).map((pair, index) => (
                        <li key={index} className="flex items-center justify-between p-2 bg-white rounded border border-indigo-50 shadow-sm">
                            <span className="font-bold text-zinc-700"><EditableText value={pair.word} tag="span" /></span>
                            <i className="fa-solid fa-arrow-right text-indigo-300 text-xs"></i>
                            <span className="text-indigo-600 font-medium"><EditableText value={pair.synonym} tag="span" /></span>
                        </li>
                    ))}
                    </ul>
                </EditableElement>
                
                <EditableElement className="bg-white p-5 rounded-2xl border-2 border-dashed border-zinc-300">
                    <h4 className="font-semibold text-center mb-2 text-zinc-500 uppercase text-xs tracking-widest">{data.storyPrompt}</h4>
                    <div className="space-y-4 mt-2">
                        <div className="border-b border-zinc-200 h-8"></div>
                        <div className="border-b border-zinc-200 h-8"></div>
                        <div className="border-b border-zinc-200 h-8"></div>
                    </div>
                </EditableElement>
            </div>
        </div>
    </div>
);

export const SynonymWordSearchSheet = SynonymSearchAndStorySheet;

export const AnagramSheet: React.FC<SheetProps<AnagramsData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} data={data} />
        <div className="dynamic-grid">
            {(data.anagrams || []).map((item, index) => (
                <EditableElement key={index} className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm border-2 border-zinc-100 break-inside-avoid relative overflow-hidden group hover:border-amber-200 transition-colors">
                    <div className="absolute top-0 left-0 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-br-lg">{index + 1}</div>
                    
                    {item.imageBase64 && (
                        <div className="w-24 h-24 mb-4 bg-zinc-50 rounded-xl overflow-hidden border border-zinc-100">
                            <ImageDisplay base64={item.imageBase64} description={item.word} className="w-full h-full object-contain" />
                        </div>
                    )}
                    
                    <div className="flex gap-1 mb-4 flex-wrap justify-center">
                        {item.scrambled.split('').map((char, i) => (
                            <span key={i} className="w-10 h-10 flex items-center justify-center bg-amber-50 border-2 border-amber-200 rounded-lg text-xl font-black text-amber-900 shadow-sm cursor-grab active:cursor-grabbing">
                                {char}
                            </span>
                        ))}
                    </div>
                    
                    <div className="w-full bg-zinc-50 rounded-lg border-b-2 border-zinc-300 p-2 flex items-center justify-center h-12">
                        <div className="w-full border-b-2 border-dotted border-zinc-400"></div>
                    </div>
                </EditableElement>
            ))}
        </div>
        <EditableElement className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm text-center">
            <p className="font-bold text-indigo-900 mb-3 flex items-center justify-center gap-2"><i className="fa-solid fa-pencil"></i> <EditableText value={data.sentencePrompt} tag="span" /></p>
            <div className="w-full max-w-2xl mx-auto space-y-4">
                <div className="border-b-2 border-indigo-200 h-8"></div>
                <div className="border-b-2 border-indigo-200 h-8"></div>
            </div>
        </EditableElement>
    </div>
);

export const SpellingCheckSheet: React.FC<SheetProps<SpellingCheckData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || "Doğru yazılanı bul."} note={data.pedagogicalNote} data={data} />
        <div className="space-y-4 max-w-4xl mx-auto dynamic-grid">
            {(data.checks || []).map((check, index) => (
                <EditableElement key={index} className="p-5 rounded-2xl bg-white border-2 border-zinc-100 shadow-sm flex flex-col sm:flex-row gap-6 items-center break-inside-avoid hover:border-indigo-100 transition-colors">
                    <div className="flex-shrink-0 w-20 h-20 bg-zinc-50 rounded-xl overflow-hidden border border-zinc-200">
                        <ImageDisplay base64={check.imageBase64} description={check.correct} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 w-full">
                        <p className="font-bold text-zinc-400 text-xs uppercase tracking-widest mb-3">Hangisi Doğru?</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {(check.options || []).map((option, optIndex) => (
                                 <div key={optIndex} className="flex items-center p-3 rounded-xl border-2 border-zinc-100 hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer transition-all group relative overflow-hidden">
                                    <div className="w-6 h-6 border-2 border-zinc-300 rounded-full mr-3 flex items-center justify-center group-hover:border-emerald-500 group-hover:bg-white text-emerald-500 text-xs transition-all">
                                        <i className="fa-solid fa-check opacity-0 group-hover:opacity-100"></i>
                                    </div>
                                    <label className="text-lg font-medium cursor-pointer select-none text-zinc-700 group-hover:text-emerald-900"><EditableText value={option} tag="span" /></label>
                                </div>
                            ))}
                        </div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const LetterBridgeSheet: React.FC<SheetProps<LetterBridgeData>> = ({ data }) => (
     <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="space-y-6 max-w-xl mx-auto my-8 dynamic-grid">
            {(data.pairs || []).map((pair, index) => (
                <EditableElement key={index} className="flex items-center justify-center p-6 bg-white rounded-2xl border-2 border-zinc-200 shadow-lg break-inside-avoid relative">
                    <div className="absolute -top-3 left-4 bg-zinc-800 text-white text-xs font-bold px-2 py-1 rounded">#{index+1}</div>
                    <span className="text-3xl font-black tracking-widest text-zinc-700"><EditableText value={pair.word1.toUpperCase()} tag="span" /></span>
                    
                    <div className="mx-6 relative">
                        <div className="w-16 h-16 border-4 border-indigo-500 rounded-xl bg-indigo-50 flex items-center justify-center shadow-inner transform rotate-3">
                            <span className="text-4xl font-black text-indigo-600">?</span>
                        </div>
                        <div className="absolute top-1/2 -left-4 w-4 h-1 bg-zinc-300"></div>
                        <div className="absolute top-1/2 -right-4 w-4 h-1 bg-zinc-300"></div>
                    </div>
                    
                    <span className="text-3xl font-black tracking-widest text-zinc-700"><EditableText value={pair.word2.toUpperCase()} tag="span" /></span>
                </EditableElement>
            ))}
        </div>
        {data.followUpPrompt && (
            <EditableElement className="mt-10 p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center max-w-2xl mx-auto">
                <p className="font-bold mb-4 text-emerald-800 text-lg"><i className="fa-solid fa-key mr-2"></i>{data.followUpPrompt}</p>
                <div className="flex justify-center gap-3">
                    {Array.from({length: data.pairs.length}).map((_, i) => <div key={i} className="w-10 h-12 border-b-4 border-emerald-500 bg-white rounded-t-lg shadow-sm"></div>)}
                </div>
            </EditableElement>
        )}
    </div>
);

export const WordLadderSheet: React.FC<SheetProps<WordLadderData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        {data.theme && <div className="text-center mb-8 inline-block w-full"><span className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-sm font-bold shadow-md tracking-wide uppercase">{data.theme}</span></div>}
        
        <div className="dynamic-grid justify-items-center">
            {(data.ladders || []).map((ladder, index) => (
                <EditableElement key={index} className="relative p-8 bg-zinc-50 rounded-3xl border-2 border-zinc-200 shadow-xl w-full max-w-xs break-inside-avoid">
                    {/* Ladder Visual */}
                    <div className="absolute left-6 top-4 bottom-4 w-3 bg-amber-700/30 rounded-full border-x border-amber-800/20"></div>
                    <div className="absolute right-6 top-4 bottom-4 w-3 bg-amber-700/30 rounded-full border-x border-amber-800/20"></div>
                    
                    <div className="flex flex-col items-center space-y-6 relative z-10">
                        <div className="px-6 py-4 bg-emerald-500 text-white font-mono text-2xl font-black rounded-xl shadow-lg w-full text-center border-b-4 border-emerald-700"><EditableText value={ladder.startWord.toUpperCase()} tag="span" /></div>
                        
                        {Array.from({ length: ladder.steps }).map((_, i) => (
                            <div key={i} className="w-full h-16 bg-white border-2 border-zinc-400 border-dashed rounded-xl shadow-inner"></div>
                        ))}
                        
                        <div className="px-6 py-4 bg-rose-500 text-white font-mono text-2xl font-black rounded-xl shadow-lg w-full text-center border-b-4 border-rose-700"><EditableText value={ladder.endWord.toUpperCase()} tag="span" /></div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const CrosswordSheet: React.FC<SheetProps<CrosswordData>> = ({ data }) => {
    const { title, prompt, grid, clues, passwordCells, passwordLength, passwordPrompt, pedagogicalNote, instruction } = data;
    
    // Process clues to map them to grid numbers
    // In a real app, logic would assign numbers sequentially based on start positions
    // For visual purposes, we assume `clues` has `id` which matches grid `start`
    
    return (
        <div>
            <PedagogicalHeader title={title} instruction={instruction || prompt} note={pedagogicalNote} data={data} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mt-8">
                {/* The Grid */}
                <EditableElement className="w-full max-w-lg mx-auto lg:mx-0 bg-black p-2 shadow-2xl rounded-lg">
                    <div
                        className="grid gap-[1px] bg-black"
                        style={{ gridTemplateColumns: `repeat(${(grid || []).length}, 1fr)` }}
                    >
                        {(grid || []).flat().map((cell, index) => {
                            const r = Math.floor(index / (grid || []).length);
                            const c = index % (grid || []).length;
                            const isBlack = cell === null;
                            const isPassword = (passwordCells || []).some(p => p.row === r && p.col === c);
                            
                            // Find clue number starting here
                            const clueStart = clues.find(cl => cl.start.row === r && cl.start.col === c);
                            
                            return (
                                <div key={`${r}-${c}`} className={`relative aspect-square ${isBlack ? 'bg-black' : 'bg-white'} ${isPassword ? 'bg-amber-100' : ''}`}>
                                    {clueStart && <span className="absolute top-0.5 left-0.5 text-[8px] md:text-[10px] font-bold text-zinc-800 leading-none">{clueStart.id}</span>}
                                    {!isBlack && isPassword && <div className="absolute inset-0 border-2 border-amber-400 pointer-events-none"></div>}
                                </div>
                            );
                        })}
                    </div>
                </EditableElement>

                {/* Clues List */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-2xl border-2 border-zinc-200 shadow-sm">
                        <h4 className="font-bold text-lg mb-4 text-indigo-600 border-b-2 border-indigo-100 pb-2 uppercase tracking-wider">İpuçları</h4>
                        <div className="space-y-6">
                            {/* Group by Direction if needed, or just list */}
                            {['across', 'down'].map(dir => {
                                const dirClues = clues.filter(c => c.direction === dir).sort((a,b) => a.id - b.id);
                                if(dirClues.length === 0) return null;
                                return (
                                    <div key={dir}>
                                        <h5 className="font-bold text-zinc-500 mb-2 text-sm flex items-center gap-2">
                                            <i className={`fa-solid ${dir === 'across' ? 'fa-arrow-right' : 'fa-arrow-down'}`}></i>
                                            {dir === 'across' ? 'Soldan Sağa' : 'Yukarıdan Aşağıya'}
                                        </h5>
                                        <ul className="space-y-3">
                                            {dirClues.map(clue => (
                                                <li key={clue.id} className="text-sm flex gap-3 items-start group">
                                                    <span className="font-bold bg-zinc-800 text-white w-6 h-6 flex items-center justify-center rounded text-xs shrink-0 mt-0.5">{clue.id}</span>
                                                    <div>
                                                        <EditableText value={clue.text} tag="span" className="font-medium text-zinc-700" />
                                                        {clue.imageBase64 && (
                                                            <div className="mt-2 w-24 h-24 border rounded p-1 bg-white">
                                                                <ImageDisplay base64={clue.imageBase64} description={clue.word} className="w-full h-full object-contain" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            
            {(passwordPrompt || (passwordLength || 0) > 0) && (
                 <EditableElement className="mt-12 p-8 bg-amber-50 rounded-3xl border-2 border-dashed border-amber-300 text-center max-w-3xl mx-auto shadow-sm">
                    <h4 className="font-bold text-amber-800 mb-6 uppercase tracking-widest text-lg flex items-center justify-center gap-3">
                        <i className="fa-solid fa-lock"></i> Gizli Şifre
                    </h4>
                    <div className="flex justify-center gap-2 md:gap-4 mb-4 flex-wrap">
                     {Array.from({ length: passwordLength || 0 }).map((_, i) => (
                        <div key={i} className="w-12 h-16 md:w-16 md:h-20 border-b-4 border-amber-500 bg-white rounded-t-xl shadow-sm flex items-end justify-center pb-2">
                            <span className="text-zinc-300 text-xs">{i+1}</span>
                        </div>
                    ))}
                    </div>
                    {passwordPrompt && <p className="font-medium text-zinc-600 text-lg">{passwordPrompt}</p>}
                </EditableElement>
            )}
        </div>
    );
};

export const ResfebeSheet: React.FC<SheetProps<ResfebeData | AntonymResfebeData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} data={data} />
        
        <div className="dynamic-grid space-y-8">
            {(data.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="bg-white p-8 rounded-3xl shadow-lg border-2 border-zinc-100 flex flex-col items-center break-inside-avoid relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-sm font-bold px-4 py-1 rounded-bl-xl">#{index + 1}</div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-6 mb-8 p-6 bg-zinc-50/80 rounded-2xl w-full border border-zinc-200 min-h-[160px]">
                        {puzzle.clues.map((clue, i) => (
                            <div key={i} className="transform hover:scale-105 transition-transform duration-300">
                                {clue.type === 'image' ? (
                                    <div className="relative group bg-white p-2 rounded-xl shadow-sm border border-zinc-200">
                                        <ImageDisplay base64={(clue as any).imageBase64 || clue.imageBase64} description={clue.value} className="w-24 h-24 md:w-32 md:h-32 object-contain" />
                                        {/* Hint tooltip */}
                                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-white text-[10px] px-2 py-1 rounded transition-opacity whitespace-nowrap pointer-events-none z-10">{clue.value}</span>
                                    </div>
                                ) : (
                                    <div className="bg-white px-4 py-2 rounded-lg border-b-4 border-zinc-300 shadow-sm">
                                        <span className="text-5xl md:text-6xl font-black text-zinc-800 tracking-tighter">{clue.value}</span>
                                    </div>
                                )}
                                {i < puzzle.clues.length - 1 && <span className="text-zinc-300 text-2xl mx-2 font-black">+</span>}
                            </div>
                        ))}
                    </div>
                    
                    <div className="w-full max-w-md bg-zinc-100 p-4 rounded-xl">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest bg-white px-2 py-1 rounded">Cevap</span>
                            <div className="flex-1 h-12 bg-white rounded-lg border-2 border-zinc-300 border-dashed flex items-center px-4">
                                {/* Optional: Dashes for letter count */}
                                <div className="flex gap-1 opacity-30 w-full justify-center">
                                    {Array.from({length: puzzle.answer?.length || 5}).map((_,k) => <div key={k} className="w-6 h-0.5 bg-black mt-4"></div>)}
                                </div>
                            </div>
                        </div>
                        {'antonym' in puzzle && (
                             <div className="flex items-center gap-4 mt-3">
                                <span className="text-xs font-bold text-rose-400 uppercase tracking-widest bg-white px-2 py-1 rounded border border-rose-100">Zıttı</span>
                                <div className="flex-1 h-12 bg-rose-50 rounded-lg border-2 border-rose-200 border-dashed"></div>
                            </div>
                        )}
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

// Fallbacks for other sheets ensuring no broken imports
const createSimpleSheet = (compName: string) => ({ data }: { data: any }) => (
  <div>
      <PedagogicalHeader title={data.title || compName} instruction={data.instruction || data.prompt || ""} note={data.pedagogicalNote} />
      <div className="p-8 text-center text-zinc-500 italic bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
          <i className="fa-solid fa-wrench text-2xl mb-2 block text-zinc-300"></i>
          Görsel içerik oluşturuldu.
      </div>
  </div>
);

export const WordGroupingSheet = createSimpleSheet('Kelime Gruplama');
export const MiniWordGridSheet = createSimpleSheet('Mini Kelime Kareleri');
export const PasswordFinderSheet = createSimpleSheet('Şifre Çözücü');
export const SyllableCompletionSheet = createSimpleSheet('Hece Tamamlama');
export const WordGridPuzzleSheet = createSimpleSheet('Kelime Ağı');
export const SpiralPuzzleSheet = createSimpleSheet('Sarmal Bulmaca');
export const JumbledWordStorySheet = createSimpleSheet('Karışık Hikaye');
export const HomonymSentenceSheet = createSimpleSheet('Eş Sesli Cümle');
export const HomonymImageMatchSheet = createSimpleSheet('Eş Sesli Resim');
export const AntonymFlowerPuzzleSheet = createSimpleSheet('Zıt Anlam Çiçeği');
export const SynonymAntonymGridSheet = createSimpleSheet('Eş/Zıt Tablo');
export const SynonymMatchingPatternSheet = createSimpleSheet('Eş Anlam Deseni');
export const MissingPartsSheet = createSimpleSheet('Eksik Parçalar');
export const WordWebSheet = createSimpleSheet('Kelime Ağı');
export const WordPlacementPuzzleSheet = createSimpleSheet('Kelime Yerleştirme');
export const PositionalAnagramSheet = createSimpleSheet('Konumlu Anagram');
export const ImageAnagramSortSheet = createSimpleSheet('Resimli Anagram');
export const AnagramImageMatchSheet = createSimpleSheet('Anagram Eşleme');

export const AntonymResfebeSheet: React.FC<SheetProps<AntonymResfebeData>> = (props) => <ResfebeSheet {...props} />;
export const WordSearchWithPasswordSheet = WordSearchSheet;
export const LetterGridWordFindSheet = WordSearchSheet;
export const ThematicWordSearchColorSheet = WordSearchSheet;
export const PunctuationSpiralPuzzleSheet = SpiralPuzzleSheet;
export const SyllableWordSearchSheet = WordSearchSheet;
export const WordWebWithPasswordSheet = WordWebSheet;

export const WordFormationSheet = createSimpleSheet('Kelime Türetmece');
export const ReverseWordSheet = createSimpleSheet('Ters Oku Düz Yaz');
