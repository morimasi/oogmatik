
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

// --- 1. Word Search Family ---
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
            <div className="flex flex-col gap-8">
                <div className="bg-white p-4 rounded-lg shadow-inner self-center w-full max-w-2xl">
                    <GridComponent grid={gridData} passwordCells={isWithPassword ? (data as WordSearchWithPasswordData).passwordCells : undefined} />
                </div>
                
                <EditableElement>
                    <h4 className="font-bold mb-2 text-indigo-600 border-b-2 border-indigo-200 pb-1">Kelime Listesi:</h4>
                    {/* Use dynamic-grid class which responds to --dynamic-cols var set in Worksheet wrapper */}
                    <ul className="dynamic-grid">
                        {(wordsData || []).map((word, index) => (
                            <li key={index} className="capitalize flex items-center">
                                <div className="w-4 h-4 border border-zinc-400 rounded mr-2 shrink-0"></div>
                                <EditableText value={word} tag="span" />
                            </li>
                        ))}
                    </ul>
                    {'writingPrompt' in data && <div className="mt-6 p-3 bg-indigo-50 rounded border border-indigo-100"><p className="text-sm italic">{data.writingPrompt}</p></div>}
                </EditableElement>
            </div>
            {'followUpQuestion' in data && data.followUpQuestion && (
                <EditableElement className="mt-8 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-amber-700 mb-1">Ek Soru</h4>
                    <p className="text-sm text-zinc-700"><EditableText value={data.followUpQuestion} tag="span" /></p>
                    <div className="w-full h-8 mt-2 border-b-2 border-dotted border-zinc-400"></div>
                </EditableElement>
            )}
             {'hiddenMessage' in data && data.hiddenMessage && (
                <div className="mt-4 text-center text-sm text-zinc-500">
                    <p><strong>İpucu:</strong> Kullanılmayan harflerde gizli bir mesaj olabilir!</p>
                </div>
            )}
        </div>
    )
};

export const SynonymSearchAndStorySheet: React.FC<SheetProps<SynonymSearchAndStoryData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.prompt} note={data.pedagogicalNote} data={data} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-inner">
                <GridComponent grid={data.grid} />
            </div>
            <EditableElement>
                <h4 className="font-bold mb-2 text-indigo-600">Eşleşmeler:</h4>
                <ul className="space-y-2 dynamic-grid">
                {(data.wordTable || []).map((pair, index) => (
                    <li key={index} className="text-sm border-b border-zinc-100 pb-1">
                        <strong><EditableText value={pair.word} tag="span" /></strong> <i className="fa-solid fa-arrow-right text-xs text-zinc-400 mx-1"></i> <EditableText value={pair.synonym} tag="span" />
                    </li>
                ))}
                </ul>
            </EditableElement>
        </div>
        <EditableElement className="mt-8">
            <h4 className="font-semibold text-center mb-2">{data.storyPrompt}</h4>
            <div className="h-40 border-2 border-dashed rounded-lg p-2 bg-zinc-50" style={{borderColor: 'var(--worksheet-border-color)'}}></div>
        </EditableElement>
    </div>
);

export const SynonymWordSearchSheet: React.FC<SheetProps<SynonymWordSearchData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.prompt} note={data.pedagogicalNote} data={data} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-inner">
                <GridComponent grid={data.grid} />
            </div>
            <EditableElement>
                <h4 className="font-bold mb-2 text-indigo-600">Kelimeler:</h4>
                <ul className="space-y-2 text-sm dynamic-grid">
                {(data.wordsToMatch || []).map((pair, index) => (
                    <li key={index} className="p-2 bg-zinc-50 rounded border border-zinc-200">
                        <strong><EditableText value={pair.word} tag="span" /></strong> kelimesinin eş anlamlısını bulun.
                    </li>
                ))}
                </ul>
            </EditableElement>
        </div>
    </div>
);

export const AnagramSheet: React.FC<SheetProps<AnagramsData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} data={data} />
        <div className="dynamic-grid">
            {(data.anagrams || []).map((item, index) => (
                <EditableElement key={index} className="flex flex-col items-center bg-white p-6 rounded-xl shadow-sm border-2 break-inside-avoid" style={{borderColor: 'var(--worksheet-border-color)'}}>
                    <div className="w-32 h-32 mb-4 bg-zinc-50 rounded-lg overflow-hidden">
                        <ImageDisplay base64={item.imageBase64} description={item.word} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex gap-1 mb-4 flex-wrap justify-center">
                        {item.scrambled.split('').map((char, i) => (
                            <span key={i} className="w-10 h-10 flex items-center justify-center bg-amber-100 border-2 border-amber-300 rounded text-xl font-bold uppercase shadow-sm transform hover:-translate-y-1 transition-transform cursor-default">
                                {char}
                            </span>
                        ))}
                    </div>
                    <div className="w-full h-10 bg-zinc-50 rounded-md border-b-2 border-zinc-300 flex items-end px-2 pb-1">
                        <div className="w-full border-b border-dotted border-zinc-400"></div>
                    </div>
                </EditableElement>
            ))}
        </div>
        <EditableElement className="mt-8 p-6 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="font-bold text-indigo-800 mb-3 flex items-center gap-2"><i className="fa-solid fa-pencil"></i> <EditableText value={data.sentencePrompt} tag="span" /></p>
            <div className="w-full h-24 border-2 border-dashed border-indigo-300 rounded-lg bg-white"></div>
        </EditableElement>
    </div>
);

export const SpellingCheckSheet: React.FC<SheetProps<SpellingCheckData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || "Doğru yazılanı bul."} note={data.pedagogicalNote} data={data} />
        <div className="space-y-4 max-w-3xl mx-auto dynamic-grid">
            {(data.checks || []).map((check, index) => (
                <EditableElement key={index} className="p-5 rounded-xl bg-white border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center break-inside-avoid">
                    <div className="flex-shrink-0 w-24 h-24 bg-zinc-50 rounded-lg overflow-hidden">
                        <ImageDisplay base64={check.imageBase64} description={check.correct} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 w-full">
                        <p className="font-semibold mb-4 text-lg">
                            Aşağıdakilerden hangisi doğru yazılmıştır?
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {(check.options || []).map((option, optIndex) => (
                                 <div key={optIndex} className="flex items-center p-3 rounded-lg border-2 border-transparent hover:border-indigo-200 hover:bg-indigo-50 cursor-pointer transition-all group">
                                    <div className="w-5 h-5 border-2 border-zinc-400 rounded-full mr-3 flex items-center justify-center group-hover:border-indigo-500"></div>
                                    <label className="text-lg font-medium cursor-pointer select-none"><EditableText value={option} tag="span" /></label>
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
        <div className="space-y-6 max-w-lg mx-auto my-8 dynamic-grid">
            {(data.pairs || []).map((pair, index) => (
                <EditableElement key={index} className="flex items-center justify-center p-4 bg-white rounded-xl border-2 border-zinc-200 shadow-sm break-inside-avoid">
                    <span className="text-2xl font-bold tracking-widest text-zinc-400"><EditableText value={pair.word1.toUpperCase()} tag="span" /></span>
                    <div className="mx-4 w-14 h-14 border-4 border-dashed border-indigo-400 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <i className="fa-solid fa-question text-indigo-300"></i>
                    </div>
                    <span className="text-2xl font-bold tracking-widest text-zinc-400"><EditableText value={pair.word2.toUpperCase()} tag="span" /></span>
                </EditableElement>
            ))}
        </div>
        {data.followUpPrompt && (
            <div className="mt-8 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="font-semibold mb-2 text-emerald-800">{data.followUpPrompt}</p>
                <div className="w-full h-16 border-b-2 border-dotted border-emerald-400"></div>
            </div>
        )}
    </div>
);

export const WordLadderSheet: React.FC<SheetProps<WordLadderData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        {data.theme && <div className="text-center mb-6 inline-block w-full"><span className="px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">{data.theme}</span></div>}
        
        <div className="dynamic-grid justify-items-center">
            {(data.ladders || []).map((ladder, index) => (
                <EditableElement key={index} className="relative p-6 bg-white rounded-2xl border-2 border-zinc-200 shadow-lg w-full max-w-xs break-inside-avoid">
                    {/* Ladder Visual */}
                    <div className="absolute left-4 top-0 bottom-0 w-2 bg-amber-700/20 rounded-full"></div>
                    <div className="absolute right-4 top-0 bottom-0 w-2 bg-amber-700/20 rounded-full"></div>
                    
                    <div className="flex flex-col items-center space-y-4 relative z-10">
                        <div className="px-6 py-3 bg-emerald-500 text-white font-mono text-xl font-bold rounded-lg shadow-md w-4/5 text-center transform -rotate-1"><EditableText value={ladder.startWord.toUpperCase()} tag="span" /></div>
                        
                        {Array.from({ length: ladder.steps }).map((_, i) => (
                            <div key={i} className="px-6 py-3 bg-white border-2 border-dashed border-zinc-300 rounded-lg w-4/5 text-center h-12"></div>
                        ))}
                        
                        <div className="px-6 py-3 bg-rose-500 text-white font-mono text-xl font-bold rounded-lg shadow-md w-4/5 text-center transform rotate-1"><EditableText value={ladder.endWord.toUpperCase()} tag="span" /></div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const WordFormationSheet: React.FC<SheetProps<WordFormationData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="dynamic-grid">
            {(data.sets || []).map((set, index) => (
                <EditableElement key={index} className="p-6 bg-white rounded-xl border-2 border-zinc-200 shadow-sm relative overflow-hidden break-inside-avoid">
                    <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                        Joker: {set.jokerCount}
                    </div>
                    
                    <div className="flex justify-center items-center gap-2 flex-wrap mb-6 mt-2">
                        {(set.letters || []).map((letter, i) => (
                            <div key={i} className="w-12 h-12 bg-zinc-100 rounded-lg border-b-4 border-zinc-300 flex items-center justify-center text-2xl font-black text-zinc-700 shadow-sm">
                                {letter.toUpperCase()}
                            </div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                         {Array.from({ length: 8 }).map((_, i) => (
                             <div key={i} className="h-8 border-b-2 border-zinc-200"></div>
                         ))}
                    </div>
                </EditableElement>
            ))}
        </div>
        {data.mysteryWordChallenge && (
            <div className="mt-8 p-6 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl border border-violet-100 text-center">
                <p className="font-bold text-lg text-violet-900 mb-4"><i className="fa-solid fa-star mr-2 text-yellow-400"></i>{data.mysteryWordChallenge.prompt}</p>
                 <div className="flex justify-center gap-3">
                    {Array.from({length: data.mysteryWordChallenge.solution.length}).map((_, i) => (
                        <div key={i} className="w-10 h-12 border-2 border-violet-300 rounded-md bg-white"></div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

export const ReverseWordSheet: React.FC<SheetProps<ReverseWordData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="dynamic-grid max-w-4xl mx-auto">
            {(data.words || []).map((word, index) => (
                <EditableElement key={index} className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-zinc-200 shadow-sm break-inside-avoid">
                    <div className="bg-indigo-50 px-4 py-2 rounded-lg">
                        <p className="font-bold text-xl tracking-wider text-indigo-900"><EditableText value={word.split('').reverse().join('').toUpperCase()} tag="span" /></p>
                    </div>
                    <i className="fa-solid fa-arrow-right text-zinc-300"></i>
                    <div className="flex-1 h-10 border-b-2 border-dashed border-zinc-400"></div>
                </EditableElement>
            ))}
        </div>
        {data.funFact && (
            <div className="mt-8 p-4 bg-sky-50 rounded-lg text-center border border-sky-100">
                <p className="text-sm text-sky-800 font-medium"><i className="fa-solid fa-lightbulb mr-2 text-yellow-500"></i>Biliyor musun? {data.funFact}</p>
            </div>
        )}
    </div>
);

export const WordGroupingSheet: React.FC<SheetProps<WordGroupingData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <EditableElement className="mb-8 p-6 bg-white rounded-2xl border-2 border-dashed border-zinc-300">
            <div className="flex justify-center flex-wrap gap-4">
                {(data.words || []).map((word, index) => (
                    <div key={index} className="flex flex-col items-center p-2 bg-zinc-100 rounded-lg shadow-sm hover:bg-indigo-100 transition-colors cursor-grab w-32 break-inside-avoid">
                        <div className="w-24 h-24 mb-2 bg-white rounded overflow-hidden">
                            <ImageDisplay base64={word.imageBase64} description={word.text} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-sm font-bold text-center"><EditableText value={word.text} tag="span" /></span>
                    </div>
                ))}
            </div>
        </EditableElement>
        
        <div className="dynamic-grid">
            {(data.categoryNames || []).map((name, index) => (
                <EditableElement key={index} className="bg-white rounded-xl border-t-8 border-indigo-400 shadow-md overflow-hidden break-inside-avoid">
                    <div className="bg-indigo-50 p-3 text-center border-b border-indigo-100">
                        <h4 className="font-bold text-lg text-indigo-800"><EditableText value={name} tag="span" /></h4>
                    </div>
                    <div className="p-4 space-y-3 min-h-[160px]">
                         {Array.from({ length: 4 }).map((_, i) => (
                             <div key={i} className="h-10 border-b border-zinc-200"></div>
                         ))}
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const MiniWordGridSheet: React.FC<SheetProps<MiniWordGridData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="dynamic-grid justify-items-center">
            {(data.puzzles || []).map((puzzle, index) => (
                <div key={index} className="p-2 bg-white rounded-lg shadow-md inline-block border-4 border-zinc-200 break-inside-avoid">
                    <GridComponent grid={puzzle.grid} cellClassName="w-12 h-12 text-2xl font-bold" />
                    {/* Start Indicator */}
                    <div className="mt-2 text-center text-xs text-zinc-400">Başlangıç: {puzzle.start.row+1}. Satır, {puzzle.start.col+1}. Sütun</div>
                </div>
            ))}
        </div>
        <div className="mt-8 text-center font-bold text-xl text-indigo-600 animate-pulse">
            {data.prompt}
        </div>
    </div>
);

export const PasswordFinderSheet: React.FC<SheetProps<PasswordFinderData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="dynamic-grid mb-10">
            {(data.words || []).map((item, index) => (
                <EditableElement key={index} className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-zinc-200 break-inside-avoid">
                     <div className="w-8 h-8 bg-zinc-100 rounded-md flex items-center justify-center text-sm font-bold text-zinc-400 mr-3">{index + 1}</div>
                     <span className="text-xl tracking-wide"><EditableText value={item.word} tag="span" /></span>
                </EditableElement>
            ))}
        </div>
         <EditableElement className="bg-zinc-100 p-8 rounded-2xl text-center">
            <h4 className="font-bold text-lg mb-4 text-zinc-500 uppercase tracking-widest"><i className="fa-solid fa-lock mr-2"></i>Şifre</h4>
            <div className="flex justify-center gap-3">
             {Array.from({ length: data.passwordLength }).map((_, i) => (
                <div key={i} className="w-14 h-16 border-b-4 border-indigo-500 bg-white rounded-t-lg shadow-sm"></div>
            ))}
            </div>
        </EditableElement>
    </div>
);

export const SyllableCompletionSheet: React.FC<SheetProps<SyllableCompletionData>> = ({ data }) => {
    let storyContent: React.ReactNode = data.storyPrompt;
    if (data.storyTemplate) {
        const parts = data.storyTemplate.split('__WORD__');
        storyContent = (
            <p className="text-lg leading-loose">
                {parts.map((part, index) => (
                    <React.Fragment key={index}>
                        {part}
                        {index < parts.length - 1 && <span className="inline-block w-32 h-8 border-b-2 border-dotted border-indigo-400 mx-1 align-baseline"></span>}
                    </React.Fragment>
                ))}
            </p>
        );
    }
    return (
    <div>
      <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
      
      <EditableElement className="mb-10 p-6 bg-amber-50 border-2 border-amber-200 rounded-2xl text-center">
          <h4 className="font-bold mb-4 text-amber-800 uppercase tracking-wider">Hece Havuzu</h4>
          <div className="flex justify-center flex-wrap gap-4">
              {(data.syllables || []).map((syllable, index) => (
                  <div key={index} className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-md text-xl font-bold border-2 border-amber-100 transform hover:scale-110 transition-transform">
                      {syllable}
                  </div>
              ))}
          </div>
      </EditableElement>

      <div className="dynamic-grid mb-10">
          {(data.wordParts || []).map((part, index) => (
              <EditableElement key={index} className="flex items-center justify-center p-4 bg-white rounded-xl shadow-sm break-inside-avoid">
                  <span className="text-2xl font-bold text-zinc-800 mr-1"><EditableText value={part.first} tag="span" /></span>
                  <span className="text-2xl font-bold text-zinc-300">-</span>
                  <div className="w-16 mx-2 border-b-4 border-zinc-300"></div>
              </EditableElement>
          ))}
      </div>

      <div className="p-6 bg-white rounded-xl border-l-8 border-indigo-500 shadow-sm">
          <h4 className="font-bold mb-4 text-indigo-600"><i className="fa-solid fa-book-open mr-2"></i>Hikaye Zamanı</h4>
          {storyContent}
      </div>
    </div>
    )
};

export const SpiralPuzzleSheet: React.FC<SheetProps<SpiralPuzzleData | PunctuationSpiralPuzzleData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="flex-1 w-full bg-white p-4 rounded-2xl shadow-inner relative">
                 <GridComponent grid={data.grid} cellClassName="w-10 h-10 md:w-12 md:h-12 text-lg" />
                 {/* Visual cue for spiral start */}
                 {(data.wordStarts || []).map((start, idx) => (
                     <div key={idx} className="absolute w-4 h-4 bg-indigo-500 rounded-full border-2 border-white shadow-sm z-10" 
                          style={{
                              top: `${(start.row * 48) + 16 + 8}px`, // Approx positioning based on cell size logic needs refinement for responsive
                              left: `${(start.col * 48) + 16 + 8}px` 
                          }}
                          title={`Kelime ${start.id} Başlangıcı`}
                     >
                         <span className="absolute -top-6 -left-2 text-xs font-bold text-indigo-600 bg-white px-1 rounded">{start.id}</span>
                     </div>
                 ))}
            </div>
            
            <div className="w-full lg:w-1/3">
                 <EditableElement className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                     <h4 className="font-bold text-lg mb-4 text-indigo-800 border-b border-indigo-200 pb-2">İpuçları</h4>
                     <ul className="space-y-3">
                         {(data.clues || []).map((clue, index) => (
                             <li key={index} className="flex items-start text-sm">
                                 <span className="font-bold mr-2 bg-white w-6 h-6 flex items-center justify-center rounded-full text-indigo-600 shadow-sm shrink-0">{index + 1}</span>
                                 <span className="mt-0.5"><EditableText value={clue} tag="span" /></span>
                             </li>
                         ))}
                     </ul>
                 </EditableElement>
                 
                 <div className="mt-6 p-4 bg-amber-100 rounded-xl border-l-4 border-amber-500 text-center">
                    <p className="font-bold text-amber-800 mb-2">ŞİFRE</p>
                    <p className="text-sm mb-3">{data.passwordPrompt}</p>
                    <div className="w-full h-10 border-b-2 border-dashed border-amber-600"></div>
                </div>
            </div>
        </div>
    </div>
);

export const CrosswordSheet: React.FC<SheetProps<CrosswordData>> = ({ data }) => {
    const { title, prompt, grid, clues, passwordCells, passwordLength, theme, passwordPrompt, pedagogicalNote, instruction } = data;
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
            <PedagogicalHeader title={title} instruction={instruction || prompt} note={pedagogicalNote} data={data} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="w-full max-w-md mx-auto lg:max-w-none">
                    <div
                        className="grid border-4 border-zinc-800 bg-zinc-800 shadow-xl"
                        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gap: '1px' }}
                    >
                        {(grid || []).flat().map((cell, index) => {
                            const r = Math.floor(index / gridSize);
                            const c = index % gridSize;
                            const key = `${r}-${c}`;
                            const clueNumber = positionToNumberMap.get(key);
                            const isPassword = (passwordCells || []).some(p => p.row === r && p.col === c);
                            
                            return (
                                <div key={key} className={`relative aspect-square ${cell === null ? 'bg-zinc-900' : 'bg-white'} ${isPassword ? 'bg-amber-50' : ''}`}>
                                    {clueNumber && <span className="absolute top-0.5 left-1 text-[10px] font-bold text-zinc-700 z-10 leading-none">{clueNumber}</span>}
                                    {/* For pedagogical display, show letter if needed or empty input area */}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="text-sm space-y-8">
                    {acrossClues.length > 0 && (
                        <EditableElement className="bg-white p-5 rounded-xl border border-zinc-200">
                            <h4 className="font-bold text-lg mb-3 text-indigo-600 flex items-center"><i className="fa-solid fa-arrow-right mr-2"></i>Soldan Sağa</h4>
                            <ul className="space-y-3">
                                {acrossClues.map(clue => (
                                    <li key={`across-${clue.id}`} className="flex items-start group">
                                        <span className="font-bold mr-2 w-6 h-6 bg-zinc-100 rounded flex items-center justify-center text-xs group-hover:bg-indigo-100 transition-colors">{clue.id}</span>
                                        <div className="flex-1">
                                            {clue.imageBase64 ? <ImageDisplay base64={clue.imageBase64} description={clue.text} className="w-20 h-20 rounded mb-1" /> : <span className="text-zinc-700"><EditableText value={clue.text} tag="span" /></span>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </EditableElement>
                    )}
                    
                    {downClues.length > 0 && (
                        <EditableElement className="bg-white p-5 rounded-xl border border-zinc-200">
                             <h4 className="font-bold text-lg mb-3 text-violet-600 flex items-center"><i className="fa-solid fa-arrow-down mr-2"></i>Yukarıdan Aşağıya</h4>
                            <ul className="space-y-3">
                                {downClues.map(clue => (
                                    <li key={`down-${clue.id}`} className="flex items-start group">
                                        <span className="font-bold mr-2 w-6 h-6 bg-zinc-100 rounded flex items-center justify-center text-xs group-hover:bg-violet-100 transition-colors">{clue.id}</span>
                                         <div className="flex-1">
                                            {clue.imageBase64 ? <ImageDisplay base64={clue.imageBase64} description={clue.text} className="w-20 h-20 rounded mb-1" /> : <span className="text-zinc-700"><EditableText value={clue.text} tag="span" /></span>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </EditableElement>
                    )}
                </div>
            </div>
            
            {(passwordPrompt || passwordLength > 0) && (
                 <div className="mt-10 p-6 bg-amber-50 rounded-xl border-2 border-dashed border-amber-300 text-center max-w-2xl mx-auto">
                    <h4 className="font-bold text-amber-800 mb-4 uppercase tracking-widest">Gizli Şifre</h4>
                    <div className="flex justify-center gap-3 mb-4">
                     {Array.from({ length: passwordLength }).map((_, i) => (
                        <div key={i} className="w-12 h-14 border-b-4 border-amber-500 bg-white rounded-t-lg shadow-sm"></div>
                    ))}
                    </div>
                    {passwordPrompt && <p className="font-medium text-zinc-600">{passwordPrompt}</p>}
                </div>
            )}
        </div>
    );
};

export const JumbledWordStorySheet: React.FC<SheetProps<JumbledWordStoryData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <div className="space-y-6 mb-10 dynamic-grid">
             {(data.puzzles || []).map((puzzle, index) => (
                 <EditableElement key={index} className="p-4 bg-white rounded-lg shadow-sm border border-zinc-200 flex items-center gap-4 break-inside-avoid">
                     <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">{index + 1}</span>
                     <div className="flex-1 flex gap-2 justify-center">
                         {puzzle.jumbled.map((letter, i) => (
                             <span key={i} className="px-3 py-1 bg-zinc-100 rounded text-lg font-mono font-bold border-b-2 border-zinc-300">{letter}</span>
                         ))}
                     </div>
                     <div className="w-32 h-10 border-b-2 border-dotted border-zinc-400"></div>
                 </EditableElement>
             ))}
        </div>
        
        <EditableElement className="p-6 bg-orange-50 rounded-xl border-l-4 border-orange-400">
            <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2"><i className="fa-solid fa-pen-nib"></i> Hikaye Yaz</h4>
            <p className="text-sm text-zinc-600 mb-4">{data.storyPrompt}</p>
            <div className="space-y-3">
                {Array.from({length: 4}).map((_, i) => <div key={i} className="border-b border-orange-200 h-8"></div>)}
            </div>
        </EditableElement>
    </div>
);

export const ResfebeSheet: React.FC<SheetProps<ResfebeData | AntonymResfebeData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} data={data} />
        
        <div className="dynamic-grid">
            {(data.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="bg-white p-6 rounded-2xl shadow-md border-2 border-zinc-100 flex flex-col items-center break-inside-avoid">
                    <div className="flex flex-wrap items-center justify-center gap-4 mb-6 p-4 bg-zinc-50 rounded-xl w-full min-h-[120px]">
                        {puzzle.clues.map((clue, i) => (
                            <div key={i} className="transform hover:scale-110 transition-transform">
                                {clue.type === 'image' ? (
                                    <div className="relative group">
                                         {/* FIX: Access imageBase64 from the clue object if it exists, otherwise fallback */}
                                        <ImageDisplay base64={(clue as any).imageBase64} description={clue.value} className="w-24 h-24 object-contain rounded-lg shadow-sm border-2 border-white bg-white" />
                                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs px-2 py-1 rounded transition-opacity whitespace-nowrap pointer-events-none">{clue.value}</span>
                                    </div>
                                ) : (
                                    <span className="text-4xl font-black text-zinc-800 drop-shadow-md">{clue.value}</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="w-full flex items-center gap-2">
                        <span className="text-sm text-zinc-400 font-bold">CEVAP:</span>
                        <div className="flex-1 h-10 border-b-2 border-dashed border-zinc-400"></div>
                    </div>
                    {'antonym' in puzzle && (
                         <div className="w-full flex items-center gap-2 mt-2">
                            <span className="text-sm text-rose-400 font-bold">ZITTI:</span>
                            <div className="flex-1 h-10 border-b-2 border-dashed border-rose-300"></div>
                        </div>
                    )}
                </EditableElement>
            ))}
        </div>
    </div>
);

export const AntonymFlowerPuzzleSheet: React.FC<SheetProps<AntonymFlowerPuzzleData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <div className="dynamic-grid justify-items-center">
            {(data.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="relative w-64 h-64 flex items-center justify-center break-inside-avoid">
                    {/* Flower Center */}
                    <div className="absolute z-20 w-24 h-24 bg-yellow-400 rounded-full border-4 border-yellow-500 flex items-center justify-center shadow-lg">
                        <span className="text-lg font-bold text-amber-900 text-center leading-tight px-2"><EditableText value={puzzle.centerWord} tag="span" /></span>
                    </div>
                    
                    {/* Petals */}
                    {puzzle.petalLetters.map((letter, i) => {
                        const angle = (i * 360) / puzzle.petalLetters.length;
                        return (
                            <div 
                                key={i}
                                className="absolute w-16 h-16 bg-white rounded-full border-2 border-pink-300 flex items-center justify-center shadow-md origin-center transform"
                                style={{
                                    transform: `rotate(${angle}deg) translate(80px) rotate(-${angle}deg)`
                                }}
                            >
                                <span className="text-2xl font-bold text-pink-600 transform">{letter}</span>
                            </div>
                        )
                    })}
                    
                    {/* Stem */}
                    <div className="absolute top-1/2 left-1/2 w-2 h-40 bg-green-500 -z-10 transform -translate-x-1/2 translate-y-10 rounded-full"></div>
                </EditableElement>
            ))}
        </div>
        
        <div className="mt-12 text-center">
             <div className="inline-block p-4 bg-zinc-100 rounded-lg border-2 border-dashed border-zinc-300">
                 <p className="text-sm text-zinc-500 mb-2">Bulduğun kelimeleri buraya yaz:</p>
                 <div className="flex gap-4">
                     {data.puzzles.map((_, i) => <div key={i} className="w-32 h-8 border-b-2 border-zinc-400"></div>)}
                 </div>
             </div>
        </div>
    </div>
);

export const WordGridPuzzleSheet: React.FC<SheetProps<WordGridPuzzleData>> = ({ data }) => (
     <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 bg-zinc-800 p-1 rounded-lg shadow-xl">
                 <GridComponent grid={data.grid} cellClassName="w-10 h-10 bg-white border-zinc-300" showLetters={false} />
            </div>
            
            <div className="w-full md:w-1/3">
                <EditableElement className="bg-indigo-50 p-5 rounded-xl border border-indigo-200">
                    <h4 className="font-bold text-indigo-800 mb-3 border-b border-indigo-300 pb-1">Kelime Listesi</h4>
                    <ul className="space-y-1">
                        {data.wordList.map((word, i) => (
                            <li key={i} className="flex justify-between text-sm">
                                <span><EditableText value={word} tag="span" /></span>
                                <span className="text-xs bg-white px-1 rounded text-zinc-400">{word.length}</span>
                            </li>
                        ))}
                    </ul>
                </EditableElement>
                <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                     <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Ekstra Görev</p>
                     <p className="text-sm">{data.unusedWordPrompt}</p>
                </div>
            </div>
        </div>
    </div>
);

export const HomonymSentenceSheet: React.FC<SheetProps<HomonymSentenceData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="space-y-8 dynamic-grid">
            {(data.items || []).map((item, idx) => (
                <EditableElement key={idx} className="p-6 bg-white rounded-xl shadow-sm border-l-8 border-indigo-500 break-inside-avoid">
                    <h4 className="text-2xl font-bold text-indigo-600 mb-4 border-b pb-2"><EditableText value={item.word} tag="span" /></h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">1</div>
                                <span className="font-medium"><EditableText value={item.meaning1} tag="span" /></span>
                            </div>
                            <ImageDisplay base64={item.imageBase64_1} description={item.meaning1} className="h-40 w-full object-contain rounded mb-2 border" />
                            <div className="border-b-2 border-dashed border-zinc-300 h-8 w-full mt-auto"></div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center font-bold text-rose-700">2</div>
                                <span className="font-medium"><EditableText value={item.meaning2} tag="span" /></span>
                            </div>
                            <ImageDisplay base64={item.imageBase64_2} description={item.meaning2} className="h-40 w-full object-contain rounded mb-2 border" />
                            <div className="border-b-2 border-dashed border-zinc-300 h-8 w-full mt-auto"></div>
                        </div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const HomonymImageMatchSheet: React.FC<SheetProps<HomonymImageMatchData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="flex justify-between items-center mb-8 gap-8">
            <div className="flex-1 grid grid-cols-1 gap-4">
                {data.leftImages.map((img, i) => (
                    <EditableElement key={i} className="border p-2 rounded-lg shadow-sm bg-white">
                        <ImageDisplay base64={img.imageBase64} description={img.word} className="h-32 w-full object-contain" />
                    </EditableElement>
                ))}
            </div>
            
            <EditableElement className="flex flex-col items-center justify-center p-4 bg-zinc-100 rounded-xl border-2 border-dashed border-zinc-400">
                <h4 className="font-bold mb-4 text-zinc-500 uppercase">Ortak Kelime</h4>
                <div className="flex gap-2 mb-4">
                    {data.wordScramble.letters.map((l, i) => (
                        <div key={i} className="w-10 h-10 bg-white border rounded flex items-center justify-center font-bold text-lg shadow-sm">
                            {l}
                        </div>
                    ))}
                </div>
                <div className="w-32 h-10 border-b-2 border-zinc-800"></div>
            </EditableElement>

            <div className="flex-1 grid grid-cols-1 gap-4">
                {data.rightImages.map((img, i) => (
                    <EditableElement key={i} className="border p-2 rounded-lg shadow-sm bg-white">
                        <ImageDisplay base64={img.imageBase64} description={img.word} className="h-32 w-full object-contain" />
                    </EditableElement>
                ))}
            </div>
        </div>
    </div>
);

export const SynonymAntonymGridSheet: React.FC<SheetProps<SynonymAntonymGridData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-white p-4 rounded-lg border border-zinc-300">
                <GridComponent grid={data.grid} />
            </div>
            <div className="w-full md:w-1/3 space-y-6">
                <EditableElement className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <h4 className="font-bold text-emerald-800 mb-2">Eş Anlamlısını Bul:</h4>
                    <ul className="list-disc list-inside text-sm">
                        {data.synonyms.map(s => <li key={s.word}>{s.word}</li>)}
                    </ul>
                </EditableElement>
                <EditableElement className="bg-rose-50 p-4 rounded-lg border border-rose-200">
                    <h4 className="font-bold text-rose-800 mb-2">Zıt Anlamlısını Bul:</h4>
                    <ul className="list-disc list-inside text-sm">
                        {data.antonyms.map(a => <li key={a.word}>{a.word}</li>)}
                    </ul>
                </EditableElement>
            </div>
        </div>
    </div>
);

export const SynonymMatchingPatternSheet: React.FC<SheetProps<SynonymMatchingPatternData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="grid grid-cols-2 gap-y-8 gap-x-12 max-w-3xl mx-auto relative">
            <div className="absolute inset-0 pointer-events-none flex justify-center">
                <div className="w-0 border-r-2 border-dashed border-zinc-200"></div>
            </div>
            
            {data.pairs.map((pair, i) => (
                <React.Fragment key={i}>
                    <EditableElement className="p-4 bg-white border rounded-lg shadow-sm text-center font-medium flex items-center justify-between group hover:border-indigo-300 cursor-pointer">
                        <span><EditableText value={pair.word} tag="span" /></span>
                        <div className="w-3 h-3 bg-zinc-300 rounded-full group-hover:bg-indigo-500 transition-colors"></div>
                    </EditableElement>
                    <EditableElement className="p-4 bg-white border rounded-lg shadow-sm text-center font-medium flex items-center justify-between flex-row-reverse group hover:border-indigo-300 cursor-pointer">
                        <span><EditableText value={pair.synonym} tag="span" /></span>
                        <div className="w-3 h-3 bg-zinc-300 rounded-full group-hover:bg-indigo-500 transition-colors"></div>
                    </EditableElement>
                </React.Fragment>
            ))}
        </div>
    </div>
);

export const MissingPartsSheet: React.FC<SheetProps<MissingPartsData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="flex justify-between gap-8 max-w-4xl mx-auto">
            <div className="flex-1 flex flex-col gap-3">
                <h4 className="text-center font-bold mb-2">Başlangıç</h4>
                {data.leftParts.map((part, i) => (
                    <EditableElement key={i} className="p-3 bg-sky-50 border border-sky-200 rounded text-center font-bold text-lg shadow-sm"><EditableText value={part.text} tag="span" />-</EditableElement>
                ))}
            </div>
            <div className="flex-1 flex flex-col gap-3">
                <h4 className="text-center font-bold mb-2">Bitiş</h4>
                {data.rightParts.map((part, i) => (
                    <EditableElement key={i} className="p-3 bg-orange-50 border border-orange-200 rounded text-center font-bold text-lg shadow-sm">-<EditableText value={part.text} tag="span" /></EditableElement>
                ))}
            </div>
        </div>
        <div className="mt-8 p-4 border-2 border-dashed border-zinc-300 rounded-xl text-center">
            <p className="text-zinc-500 text-sm mb-4">Bulduğun kelimeleri buraya yaz:</p>
            <div className="grid grid-cols-2 gap-4">
                {Array.from({length: data.leftParts.length}).map((_, i) => <div key={i} className="border-b border-zinc-400 h-8"></div>)}
            </div>
        </div>
    </div>
);

export const WordWebSheet: React.FC<SheetProps<WordWebData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="flex flex-col items-center">
            <div className="mb-6 bg-white p-2 border rounded shadow-lg">
                <GridComponent grid={data.grid} cellClassName="w-8 h-8 text-sm" />
            </div>
            <EditableElement className="w-full max-w-2xl">
                <h4 className="font-bold mb-2 border-b">Kelimeler</h4>
                <div className="flex flex-wrap gap-2">
                    {data.wordsToFind.map(w => <span key={w} className="px-2 py-1 bg-zinc-100 rounded text-xs">{w}</span>)}
                </div>
                <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="font-bold text-yellow-800">Soru:</p>
                    <p>{data.keyWordPrompt}</p>
                    <div className="w-full border-b border-yellow-600/30 mt-4 h-4"></div>
                </div>
            </EditableElement>
        </div>
    </div>
);

export const SyllableWordSearchSheet: React.FC<SheetProps<SyllableWordSearchData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <EditableElement className="mb-8 p-4 bg-purple-50 rounded-xl border border-purple-100 text-center">
            <h4 className="font-bold text-purple-800 mb-3">Hece Havuzu</h4>
            <div className="flex justify-center flex-wrap gap-3">
                {data.syllablesToCombine.map((syl, i) => (
                    <div key={i} className="w-12 h-12 rounded-full bg-white border-2 border-purple-200 flex items-center justify-center font-bold shadow-sm">{syl}</div>
                ))}
            </div>
        </EditableElement>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <GridComponent grid={data.grid} />
            </div>
            <div className="space-y-6">
                <EditableElement className="bg-white p-4 rounded-lg border shadow-sm">
                    <h4 className="font-bold mb-2">Birleştirilecek Kelimeler:</h4>
                    {data.wordsToCreate.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2 text-lg">
                            <span className="font-mono bg-zinc-100 px-2 rounded">{item.syllable1}</span>
                            +
                            <span className="font-mono bg-zinc-100 px-2 rounded">{item.syllable2}</span>
                            =
                            <div className="w-24 border-b-2 border-zinc-300"></div>
                        </div>
                    ))}
                </EditableElement>
                <EditableElement className="bg-zinc-50 p-4 rounded-lg border">
                    <h4 className="font-bold mb-2">Bulmacadaki Diğer Kelimeler:</h4>
                    <div className="flex flex-wrap gap-2 text-sm">
                        {data.wordsToFindInSearch.map(w => <span key={w} className="px-2 py-1 bg-white border rounded">{w}</span>)}
                    </div>
                </EditableElement>
            </div>
        </div>
    </div>
);

export const WordWebWithPasswordSheet: React.FC<SheetProps<WordWebWithPasswordData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="flex justify-center">
            <GridComponent grid={data.grid} passwordColumnIndex={data.passwordColumnIndex} />
        </div>
        <EditableElement className="mt-8 text-center">
            <h4 className="font-bold mb-4">Yerleştirilecek Kelimeler</h4>
            <div className="flex flex-wrap justify-center gap-3">
                {data.words.map(w => <span key={w} className="px-3 py-1 bg-zinc-100 rounded-full border">{w} ({w.length})</span>)}
            </div>
        </EditableElement>
    </div>
);

export const WordPlacementPuzzleSheet: React.FC<SheetProps<WordPlacementPuzzleData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
                <GridComponent grid={data.grid} showLetters={false} cellClassName="w-8 h-8 bg-white" />
            </div>
            <div className="w-full md:w-1/3 space-y-4">
                {data.wordGroups.map((group, i) => (
                    <EditableElement key={i} className="p-4 bg-zinc-50 rounded border">
                        <h4 className="font-bold mb-2 border-b pb-1">{group.length} Harfli Kelimeler</h4>
                        <ul className="space-y-1 text-sm">
                            {group.words.map(w => <li key={w}>{w.toUpperCase()}</li>)}
                        </ul>
                    </EditableElement>
                ))}
                <div className="p-4 bg-red-50 border border-red-200 rounded text-center">
                    <p className="text-xs font-bold text-red-600 uppercase mb-1">Soru</p>
                    <p className="text-sm">{data.unusedWordPrompt}</p>
                </div>
            </div>
        </div>
    </div>
);

export const PositionalAnagramSheet: React.FC<SheetProps<PositionalAnagramData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="space-y-6 max-w-2xl mx-auto">
            {data.puzzles.map((puzzle, i) => (
                <EditableElement key={i} className="p-4 bg-white border rounded-xl shadow-sm break-inside-avoid">
                    <div className="flex justify-center gap-2 mb-4">
                        {puzzle.scrambled.split('').map((char, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                                <div className="w-10 h-10 border-2 border-zinc-300 rounded flex items-center justify-center font-bold text-xl mb-1">{char}</div>
                                <span className="text-xs text-zinc-400">{idx+1}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                        <span className="font-bold text-zinc-500">Cevap:</span>
                        <div className="flex gap-2">
                             {Array.from({length: puzzle.answer.length}).map((_, k) => <div key={k} className="w-8 h-8 border-b-2 border-zinc-400"></div>)}
                        </div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const ImageAnagramSortSheet: React.FC<SheetProps<ImageAnagramSortData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="dynamic-grid">
            {data.cards.map((card, i) => (
                <EditableElement key={i} className="border-2 border-zinc-200 rounded-xl p-3 bg-white flex flex-col items-center text-center break-inside-avoid">
                    <div className="w-full aspect-square bg-zinc-100 rounded-lg mb-2 overflow-hidden">
                        <ImageDisplay base64={card.imageBase64} description={card.imageDescription} className="w-full h-full object-contain" />
                    </div>
                    <p className="font-mono text-lg font-bold tracking-widest mb-2 bg-zinc-100 px-2 rounded"><EditableText value={card.scrambledWord} tag="span" /></p>
                    <div className="w-full h-8 border-b border-dotted border-zinc-400"></div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const AnagramImageMatchSheet: React.FC<SheetProps<AnagramImageMatchData>> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <EditableElement className="mb-8 p-4 bg-zinc-100 rounded-lg text-center">
            <span className="font-bold mr-2">Kelime Bankası:</span>
            {data.wordBank.map(w => <span key={w} className="inline-block mx-2 px-2 py-1 bg-white rounded shadow-sm">{w}</span>)}
        </EditableElement>

        <div className="dynamic-grid">
            {data.puzzles.map((puzzle, i) => (
                <EditableElement key={i} className="flex items-center gap-4 p-4 border rounded-xl bg-white break-inside-avoid">
                    <div className="w-24 h-24 bg-zinc-50 rounded border">
                        <ImageDisplay base64={puzzle.imageBase64} description={puzzle.imageDescription} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-zinc-500 mb-1">Bu nedir?</p>
                        <p className="font-mono text-xl tracking-widest mb-2">{puzzle.partialAnswer}</p>
                        <div className="h-8 border-b border-zinc-300 w-full"></div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const AntonymResfebeSheet: React.FC<SheetProps<AntonymResfebeData>> = (props) => <ResfebeSheet {...props} />;

// Aliases for sheets that reuse existing components
export const WordSearchWithPasswordSheet = WordSearchSheet;
export const LetterGridWordFindSheet = WordSearchSheet;
