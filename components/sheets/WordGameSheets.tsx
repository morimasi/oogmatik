
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
import { GridComponent, PedagogicalHeader } from './common';
import { EditableElement, EditableText } from '../Editable';

const SHEET_CONTAINER = "w-full";
const COMPACT_LIST = "grid grid-cols-3 gap-2 text-sm";

export const WordSearchSheet: React.FC<{ data: WordSearchData }> = ({ data }) => (
    <div className={SHEET_CONTAINER}>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <div className="flex flex-col items-center gap-4 mt-2">
            <EditableElement className="border-2 border-black p-1">
                <GridComponent grid={data.grid} cellClassName="w-6 h-6 md:w-7 md:h-7 text-sm font-mono font-bold border-zinc-300" />
            </EditableElement>
            
            <EditableElement className="w-full">
                <h4 className="font-bold text-xs uppercase border-b border-black mb-2">Bulunacak Kelimeler</h4>
                <ul className={COMPACT_LIST}>
                    {data.words.map((word, i) => (
                        <li key={i} className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-black"></div>
                            <EditableText value={word} tag="span" />
                        </li>
                    ))}
                </ul>
            </EditableElement>
            
            {data.hiddenMessage && (
                <div className="w-full border-t border-dashed border-black pt-2 text-center">
                    <span className="text-xs font-bold uppercase mr-2">Şifre:</span>
                    <div className="inline-flex gap-1">
                        {Array.from({length: data.hiddenMessage.length}).map((_,i) => <div key={i} className="w-6 h-6 border-b border-black text-center font-bold"><EditableText value="" tag="span" /></div>)}
                    </div>
                </div>
            )}
        </div>
    </div>
);

export const AnagramSheet: React.FC<{ data: AnagramsData }> = ({ data }) => (
    <div className={SHEET_CONTAINER}>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-4">
            {data.anagrams.map((item, i) => (
                <EditableElement key={i} className="flex items-center justify-between border-b border-zinc-300 pb-2 break-inside-avoid">
                    <span className="font-mono text-lg tracking-widest font-bold uppercase"><EditableText value={item.scrambled} tag="span" /></span>
                    <div className="w-24 h-6 border-b border-black text-center"><EditableText value="" tag="span" /></div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const CrosswordSheet: React.FC<{ data: CrosswordData }> = ({ data }) => (
    <div className={SHEET_CONTAINER}>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex flex-col md:flex-row gap-6 mt-4">
            <EditableElement className="w-full md:w-1/2">
                 <div className="grid gap-px bg-black border border-black" style={{ gridTemplateColumns: `repeat(${data.grid.length}, 1fr)` }}>
                    {data.grid.flat().map((cell, i) => {
                        // Calc coordinates
                        const r = Math.floor(i / data.grid.length);
                        const c = i % data.grid.length;
                        const clueNum = data.clues.find(cl => cl.start.row === r && cl.start.col === c)?.id;
                        return (
                            <div key={i} className={`aspect-square relative flex items-center justify-center font-bold uppercase ${cell === null ? 'bg-black' : 'bg-white'}`}>
                                {clueNum && <span className="absolute top-0 left-0 text-[6px] font-bold pl-0.5">{clueNum}</span>}
                                {cell !== null && <EditableText value="" tag="span" />}
                            </div>
                        )
                    })}
                 </div>
            </EditableElement>
            <div className="w-full md:w-1/2 text-xs">
                <div className="mb-4">
                    <h5 className="font-bold border-b border-black mb-1">Soldan Sağa</h5>
                    <ul className="space-y-1">
                        {data.clues.filter(c => c.direction === 'across').map(c => <li key={c.id}><strong>{c.id}.</strong> <EditableText value={c.text} tag="span" /></li>)}
                    </ul>
                </div>
                <div>
                    <h5 className="font-bold border-b border-black mb-1">Yukarıdan Aşağıya</h5>
                    <ul className="space-y-1">
                        {data.clues.filter(c => c.direction === 'down').map(c => <li key={c.id}><strong>{c.id}.</strong> <EditableText value={c.text} tag="span" /></li>)}
                    </ul>
                </div>
            </div>
        </div>
    </div>
);

export const SpellingCheckSheet: React.FC<{ data: SpellingCheckData }> = ({ data }) => (
    <div className={SHEET_CONTAINER}>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-2 gap-4 mt-2">
            {data.checks.map((check, i) => (
                <EditableElement key={i} className="border border-zinc-300 rounded p-2 break-inside-avoid">
                    <div className="flex gap-2 justify-center">
                        {check.options.map((opt, j) => (
                            <div key={j} className="px-2 py-1 border border-zinc-200 rounded cursor-pointer hover:bg-zinc-100">
                                <EditableText value={opt} tag="span" />
                            </div>
                        ))}
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

// Compact List Renderers for other types
const SimpleWordList = ({ items, title }: any) => (
    <div className={SHEET_CONTAINER}>
        <h4 className="font-bold text-sm border-b border-black mb-2">{title}</h4>
        <div className="grid grid-cols-2 gap-4">
            {items.map((item: any, i: number) => (
                <EditableElement key={i} className="flex justify-between border-b border-zinc-200 pb-1">
                    <span><EditableText value={item.text || item.word} tag="span" /></span>
                    <div className="w-20 border-b border-black"></div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const WordLadderSheet = ({ data }: { data: WordLadderData }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} />
        <div className="flex justify-center gap-8 mt-4">
            {data.ladders.map((l, i) => (
                <div key={i} className="flex flex-col gap-2 items-center">
                    <div className="font-bold border border-black px-2"><EditableText value={l.startWord} tag="span" /></div>
                    {Array.from({length: l.steps}).map((_, k) => <div key={k} className="w-20 h-6 border-b border-black text-center"><EditableText value="" tag="span" /></div>)}
                    <div className="font-bold border border-black px-2"><EditableText value={l.endWord} tag="span" /></div>
                </div>
            ))}
        </div>
    </div>
);

// Fallbacks mapped to simple list
export const LetterBridgeSheet = ({ data }: { data: LetterBridgeData }) => (
     <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} />
        <div className="grid grid-cols-2 gap-8 mt-4 font-mono text-lg">
            {data.pairs.map((p, i) => (
                <div key={i} className="flex justify-center gap-1">
                    <span><EditableText value={p.word1} tag="span" /></span>
                    <span className="w-6 border-b border-black inline-block text-center font-bold"><EditableText value="" tag="span" /></span>
                    <span><EditableText value={p.word2} tag="span" /></span>
                </div>
            ))}
        </div>
     </div>
);

export const ReverseWordSheet = ({ data }: { data: ReverseWordData }) => (
    <div>
         <PedagogicalHeader title={data.title} instruction={data.instruction} />
         <div className="grid grid-cols-3 gap-6 mt-4">
             {data.words.map((w, i) => (
                 <div key={i} className="flex flex-col items-center gap-2">
                     <span className="font-mono text-lg"><EditableText value={w} tag="span" /></span>
                     <div className="w-full h-6 border border-zinc-300 rounded text-center"><EditableText value="" tag="span" /></div>
                 </div>
             ))}
         </div>
    </div>
);

export const SynonymSearchAndStorySheet = WordSearchSheet;
export const SynonymWordSearchSheet = WordSearchSheet;
export const WordSearchWithPasswordSheet = WordSearchSheet;
export const LetterGridWordFindSheet = WordSearchSheet;
export const ThematicWordSearchColorSheet = WordSearchSheet;
export const SyllableWordSearchSheet = WordSearchSheet;
export const ProverbSearchSheet = WordSearchSheet;

// Placeholders for structure
export const MiniWordGridSheet = SimpleWordList;
export const PasswordFinderSheet = SimpleWordList;
export const WordGridPuzzleSheet = SimpleWordList;
export const SpiralPuzzleSheet = SimpleWordList;
export const JumbledWordStorySheet = SimpleWordList;
export const HomonymSentenceSheet = SimpleWordList;
export const HomonymImageMatchSheet = SimpleWordList;
export const AntonymFlowerPuzzleSheet = SimpleWordList;
export const SynonymAntonymGridSheet = SimpleWordList;
export const SynonymMatchingPatternSheet = SimpleWordList;
export const MissingPartsSheet = SimpleWordList;
export const WordWebSheet = SimpleWordList;
export const WordPlacementPuzzleSheet = SimpleWordList;
export const PositionalAnagramSheet = SimpleWordList;
export const ImageAnagramSortSheet = SimpleWordList;
export const AnagramImageMatchSheet = SimpleWordList;
export const ResfebeSheet = SimpleWordList;
export const AntonymResfebeSheet = SimpleWordList;
export const PunctuationSpiralPuzzleSheet = SimpleWordList;
export const WordWebWithPasswordSheet = SimpleWordList;
export const WordFormationSheet = SimpleWordList;
export const WordGroupingSheet = SimpleWordList;
export const SyllableCompletionSheet = SimpleWordList;
