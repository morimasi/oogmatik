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
import { GridComponent, PedagogicalHeader, ImageDisplay } from './common';
import { EditableElement, EditableText } from '../Editable';

const SHEET_CONTAINER = "w-full h-full flex flex-col";

// --- WORD SEARCH ---
export const WordSearchSheet: React.FC<{ data: WordSearchData }> = ({ data }) => (
    <div className={SHEET_CONTAINER}>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} data={data} />
        
        <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch mt-4 break-inside-avoid min-h-0">
            {/* The Grid - Set to grow to fill space */}
            <EditableElement className="flex-1 bg-white p-2 rounded-xl border-4 border-zinc-800 shadow-lg relative flex items-center justify-center min-h-0 overflow-hidden">
                <div className="absolute -top-3 -left-3 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg"></div>
                <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-lg"></div>
                
                <GridComponent grid={data?.grid || []} cellClassName="w-8 h-8 md:w-10 md:h-10 text-xl font-black font-mono border-zinc-200 hover:bg-yellow-100 cursor-pointer transition-colors text-zinc-800" />
            </EditableElement>
            
            {/* Sidebar: Word List & Tasks */}
            <div className="w-full lg:w-64 flex flex-col gap-4">
                <EditableElement className="bg-indigo-50 p-4 rounded-xl border-2 border-indigo-100 flex-1">
                    <h4 className="font-black text-indigo-800 uppercase text-xs tracking-widest mb-3 border-b-2 border-indigo-200 pb-2">
                        <i className="fa-solid fa-list-check mr-2"></i> Kelime Listesi
                    </h4>
                    <ul className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                        {(data?.words || []).map((word, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm font-bold text-zinc-700">
                                <div className="w-4 h-4 border-2 border-zinc-400 rounded bg-white cursor-pointer hover:bg-green-400 hover:border-green-600 transition-colors"></div>
                                <EditableText value={word} tag="span" />
                            </li>
                        ))}
                    </ul>
                </EditableElement>

                {/* Secret Message / Extra Task */}
                {(data?.hiddenMessage || data?.writingPrompt) && (
                    <EditableElement className="bg-amber-50 p-4 rounded-xl border-2 border-amber-200 border-dashed">
                        {data?.hiddenMessage && (
                            <div className="mb-4">
                                <h4 className="font-bold text-amber-800 text-xs uppercase mb-1">Gizli Şifre</h4>
                                <div className="flex gap-1 flex-wrap">
                                    {Array.from({length: Math.min(10, data.hiddenMessage.length)}).map((_,i) => 
                                        <div key={i} className="w-6 h-8 border-b-2 border-amber-800"></div>
                                    )}
                                </div>
                            </div>
                        )}
                        {data?.writingPrompt && (
                            <div>
                                <h4 className="font-bold text-amber-800 text-xs uppercase mb-1">Yazma Görevi</h4>
                                <p className="text-xs italic mb-2 text-amber-900"><EditableText value={data.writingPrompt} tag="span" /></p>
                                <div className="h-20 border-b border-amber-300 repeating-lines"></div>
                            </div>
                        )}
                    </EditableElement>
                )}
            </div>
        </div>
    </div>
);

// --- ANAGRAMS (SCRABBLE STYLE) ---
export const AnagramSheet: React.FC<{ data: AnagramsData }> = ({ data }) => (
    <div className={SHEET_CONTAINER}>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        
        <div className="dynamic-grid mt-6">
            {(data?.anagrams || []).map((item, i) => (
                <EditableElement key={i} className="flex flex-col gap-3 p-4 border-2 border-zinc-100 bg-white rounded-2xl shadow-sm break-inside-avoid relative overflow-hidden item-card h-full justify-between">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-zinc-50 rounded-bl-full -mr-8 -mt-8"></div>
                    
                    {item?.imagePrompt && (
                        <div className="w-full h-24 mb-2 bg-zinc-50 rounded-lg border border-zinc-100 flex items-center justify-center p-2">
                             <ImageDisplay prompt={item.imagePrompt} description={item.word} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                    )}

                    <div className="flex flex-wrap justify-center gap-2">
                        {(item?.letters || (item?.scrambled ? item.scrambled.split('') : [])).map((char, k) => (
                            <div key={k} className="w-10 h-10 bg-amber-100 border-b-4 border-r-2 border-amber-300 rounded-lg flex items-center justify-center text-xl font-black text-amber-900 shadow-sm relative transform hover:-translate-y-1 transition-transform cursor-grab active:cursor-grabbing">
                                {char}
                                <span className="absolute bottom-0.5 right-1 text-[8px] opacity-50">1</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-end gap-2 mt-2">
                        <i className="fa-solid fa-pen text-zinc-300 mb-1"></i>
                        <div className="flex-1 border-b-2 border-dashed border-zinc-400 h-8"></div>
                    </div>
                </EditableElement>
            ))}
        </div>
        
        {data?.sentencePrompt && (
            <EditableElement className="mt-8 p-6 bg-white border-2 border-zinc-200 rounded-2xl shadow-md notebook-paper">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white"><i className="fa-solid fa-pencil"></i></div>
                    <h4 className="font-bold text-lg"><EditableText value={data.sentencePrompt} tag="span" /></h4>
                </div>
                <div className="space-y-8 pl-12 pt-2">
                    <div className="w-full border-b border-blue-200 h-8"></div>
                    <div className="w-full border-b border-blue-200 h-8"></div>
                    <div className="w-full border-b border-blue-200 h-8"></div>
                </div>
            </EditableElement>
        )}
    </div>
);

// --- WORD LADDER ---
export const WordLadderSheet: React.FC<{ data: WordLadderData }> = ({ data }) => (
    <div className={SHEET_CONTAINER}>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        
        <div className="flex-1 flex justify-center gap-12 items-start mt-8">
            {(data?.ladders || []).map((ladder, i) => (
                <EditableElement key={i} className="flex flex-col items-center">
                    <div className="relative mb-2 z-10">
                        <div className="bg-white border-4 border-black px-6 py-3 rounded-full text-2xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase">
                            <EditableText value={ladder?.endWord} tag="span" />
                        </div>
                    </div>

                    <div className="relative w-40">
                        <svg viewBox={`0 0 100 ${(ladder?.steps || 3) * 60 + 20}`} className="w-full h-full overflow-visible">
                            <line x1="20" y1="0" x2="20" y2="100%" stroke="black" strokeWidth="4" />
                            <line x1="80" y1="0" x2="80" y2="100%" stroke="black" strokeWidth="4" />
                            
                            {Array.from({length: ladder?.steps || 3}).map((_, k) => (
                                <g key={k} transform={`translate(0, ${k * 60 + 30})`}>
                                    <rect x="18" y="-5" width="64" height="10" fill="#e5e7eb" stroke="black" strokeWidth="2" />
                                    {ladder?.intermediateWords && ladder.intermediateWords[k] && (
                                        <text x="110" y="0" fontSize="10" fill="#9ca3af" fontStyle="italic">{ladder.intermediateWords[k].substring(0,1)}...</text>
                                    )}
                                </g>
                            ))}
                        </svg>
                        
                        <div className="absolute inset-0 flex flex-col justify-around py-4">
                            {Array.from({length: ladder?.steps || 3}).map((_, k) => (
                                <div key={k} className="w-24 h-10 bg-white border-2 border-dashed border-zinc-400 self-center flex items-center justify-center font-bold text-zinc-500 uppercase rounded">
                                    <EditableText value="" tag="span" placeholder="? ? ?" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative mt-2 z-10">
                        <div className="bg-black text-white px-6 py-3 rounded-xl text-2xl font-black shadow-xl uppercase">
                            <EditableText value={ladder?.startWord} tag="span" />
                        </div>
                        <div className="text-xs font-bold text-zinc-400 mt-2 text-center">BAŞLANGIÇ</div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

// --- SYLLABLE PUZZLE ---
export const SyllableCompletionSheet: React.FC<{ data: SyllableCompletionData }> = ({ data }) => (
    <div className={SHEET_CONTAINER}>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        
        <div className="dynamic-grid mt-6">
            {(data?.puzzles || []).map((puzzle, i) => (
                <EditableElement key={i} className="flex items-center justify-center p-4 break-inside-avoid">
                    <div className="flex drop-shadow-md">
                        <div className="relative bg-indigo-500 text-white w-24 h-20 flex items-center justify-center text-xl font-bold rounded-l-lg z-10">
                            <span className="mr-2"><EditableText value={puzzle?.syllables && puzzle.syllables[0] ? puzzle.syllables[0] : ''} tag="span" /></span>
                            <div className="absolute right-[-15px] top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-500 rounded-full"></div>
                        </div>
                        <div className="relative bg-white border-2 border-indigo-500 text-indigo-700 w-24 h-20 flex items-center justify-center text-xl font-bold rounded-r-lg -ml-1 pl-4">
                            <div className="absolute left-[-17px] top-1/2 -translate-y-1/2 w-9 h-9 bg-white border-r-2 border-indigo-500 rounded-full inset-shadow"></div>
                            <span><EditableText value={puzzle?.syllables && puzzle.syllables[1] ? puzzle.syllables[1] : ''} tag="span" /></span>
                        </div>
                    </div>
                </EditableElement>
            ))}
        </div>

        {data?.storyPrompt && (
            <EditableElement className="mt-auto p-6 bg-zinc-50 border-t-4 border-indigo-200">
                <div className="flex gap-4">
                    <div className="w-16 h-16 bg-white border-2 border-zinc-200 rounded-xl flex items-center justify-center text-3xl">📝</div>
                    <div className="flex-1">
                        <h4 className="font-bold text-zinc-700 mb-2"><EditableText value={data.storyPrompt} tag="span" /></h4>
                        <div className="w-full border-b border-zinc-300 h-8"></div>
                        <div className="w-full border-b border-zinc-300 h-8"></div>
                    </div>
                </div>
            </EditableElement>
        )}
    </div>
);

// --- LETTER BRIDGE ---
export const LetterBridgeSheet: React.FC<{ data: LetterBridgeData }> = ({ data }) => (
    <div className={SHEET_CONTAINER}>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {(data?.pairs || []).map((p, i) => (
                <EditableElement key={i} className="flex items-center justify-center gap-1 bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 break-inside-avoid">
                    <div className="px-4 py-2 bg-zinc-100 rounded-lg text-xl font-bold text-zinc-600">
                        <EditableText value={p?.word1} tag="span" />
                    </div>
                    
                    <div className="relative w-16 h-12 flex items-center justify-center">
                         <div className="absolute top-1/2 left-0 w-full h-1 bg-black -z-10"></div>
                         <div className="w-10 h-10 bg-white border-2 border-black rounded flex items-center justify-center text-2xl font-black text-indigo-600 shadow-md transform -translate-y-1">
                             <EditableText value="?" tag="span" />
                         </div>
                    </div>

                    <div className="px-4 py-2 bg-zinc-100 rounded-lg text-xl font-bold text-zinc-600">
                        <EditableText value={p?.word2} tag="span" />
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const SpellingCheckSheet: React.FC<{ data: SpellingCheckData }> = ({ data }) => (
    <div className={SHEET_CONTAINER}>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        <div className="dynamic-grid mt-4">
            {(data?.checks || []).map((check, i) => (
                <EditableElement key={i} className="border-2 border-zinc-200 rounded-xl p-4 break-inside-avoid flex flex-col items-center gap-3 bg-white">
                    {check?.imagePrompt && (
                        <div className="w-12 h-12 mb-2 opacity-50">
                             <ImageDisplay prompt={check.imagePrompt} description="hint" className="w-full h-full object-contain" />
                        </div>
                    )}
                    
                    <div className="flex gap-3 justify-center w-full">
                        {(check?.options || []).map((opt, j) => (
                            <div key={j} className="flex-1 py-2 px-3 border-2 border-dashed border-zinc-300 rounded-lg cursor-pointer hover:border-solid hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center font-bold text-lg">
                                <EditableText value={opt} tag="span" />
                            </div>
                        ))}
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

// --- CROSSWORD SHEET ---
export const CrosswordSheet: React.FC<{ data: CrosswordData }> = ({ data }) => (
    <div className={SHEET_CONTAINER}>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} data={data} />
        
        <div className="flex-1 flex flex-col lg:flex-row gap-8 items-start mt-4 break-inside-avoid min-h-0">
            <EditableElement className="flex-1 bg-white p-2 rounded-xl border-4 border-zinc-800 shadow-lg relative min-h-0">
                <GridComponent grid={(data?.grid as any[][]) || []} cellClassName="w-8 h-8 md:w-10 md:h-10 text-xl font-black font-mono border-zinc-200 bg-white text-zinc-800" />
            </EditableElement>
            
            <div className="w-full lg:w-64 flex flex-col gap-6">
                 <EditableElement className="bg-zinc-50 p-4 rounded-xl border-2 border-zinc-200">
                    <h4 className="font-black text-zinc-600 uppercase text-xs tracking-widest mb-3 border-b-2 border-zinc-300 pb-2">
                        İpuçları
                    </h4>
                    <ul className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {(data?.clues || []).map((clue, i) => (
                            <li key={i} className="text-xs text-zinc-700">
                                <span className="font-bold mr-1">{clue?.id}.</span>
                                <EditableText value={clue?.text} tag="span" />
                                <span className="text-[10px] text-zinc-400 ml-1">({clue?.direction === 'across' ? 'Soldan Sağa' : 'Yukarıdan Aşağı'})</span>
                            </li>
                        ))}
                    </ul>
                </EditableElement>
            </div>
        </div>
    </div>
);

// Fallbacks
export const ReverseWordSheet = SpellingCheckSheet as any;
export const WordFormationSheet = SpellingCheckSheet as any;
export const MiniWordGridSheet = WordSearchSheet as any; 
export const PasswordFinderSheet = SpellingCheckSheet as any;
export const WordGridPuzzleSheet = WordSearchSheet as any;
export const SpiralPuzzleSheet = WordSearchSheet as any; 
export const JumbledWordStorySheet = AnagramSheet as any;
export const HomonymSentenceSheet = SpellingCheckSheet as any;
export const HomonymImageMatchSheet = SpellingCheckSheet as any;
export const AntonymFlowerPuzzleSheet = SyllableCompletionSheet as any;
export const SynonymAntonymGridSheet = WordSearchSheet as any;
export const SynonymMatchingPatternSheet = LetterBridgeSheet as any;
export const MissingPartsSheet = SpellingCheckSheet as any;
export const WordWebSheet = WordSearchSheet as any;
export const WordPlacementPuzzleSheet = WordSearchSheet as any;
export const PositionalAnagramSheet = AnagramSheet as any;
export const ImageAnagramSortSheet = AnagramSheet as any;
export const AnagramImageMatchSheet = AnagramSheet as any;
export const ResfebeSheet = SpellingCheckSheet as any; 
export const AntonymResfebeSheet = SpellingCheckSheet as any;
export const PunctuationSpiralPuzzleSheet = WordSearchSheet as any;
export const WordWebWithPasswordSheet = WordSearchSheet as any;
export const WordGroupingSheet = SpellingCheckSheet as any;
export const SynonymSearchAndStorySheet = WordSearchSheet;
export const SynonymWordSearchSheet = WordSearchSheet;
export const WordSearchWithPasswordSheet = WordSearchSheet;
export const LetterGridWordFindSheet = WordSearchSheet;
export const ThematicWordSearchColorSheet = WordSearchSheet;
export const SyllableWordSearchSheet = WordSearchSheet;
export const ProverbSearchSheet = WordSearchSheet;