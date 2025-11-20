
import React from 'react';
import { 
    WordSearchData, WordSearchWithPasswordData, ProverbSearchData, LetterGridWordFindData, ThematicWordSearchColorData,
    SynonymWordSearchData, SynonymSearchAndStoryData, AnagramsData, SpellingCheckData, LetterBridgeData, WordLadderData,
    WordFormationData, ReverseWordData, WordGroupingData, MiniWordGridData, PasswordFinderData, SyllableCompletionData,
    SpiralPuzzleData, PunctuationSpiralPuzzleData, CrosswordData, CrosswordClue, JumbledWordStoryData, ThematicJumbledWordStoryData, HomonymSentenceData,
    WordGridPuzzleData, HomonymImageMatchData, AntonymFlowerPuzzleData, SynonymAntonymGridData, AntonymResfebeData,
    SynonymMatchingPatternData, MissingPartsData, WordWebData, SyllableWordSearchData, WordWebWithPasswordData,
    WordPlacementPuzzleData, PositionalAnagramData, ImageAnagramSortData, AnagramImageMatchData, ResfebeData, ResfebeClue
} from '../../types';
import { GridComponent, ImageDisplay, PedagogicalHeader } from './common';

// ... (WordSearchSheet, SynonymSearchAndStorySheet, SynonymWordSearchSheet, AnagramSheet, SpellingCheckSheet, LetterBridgeSheet, WordLadderSheet, WordFormationSheet, ReverseWordSheet, WordGroupingSheet, MiniWordGridSheet, PasswordFinderSheet, SyllableCompletionSheet, SpiralPuzzleSheet, CrosswordSheet are unchanged, assume they are present here) ...

export const WordSearchSheet: React.FC<{ data: WordSearchData | WordSearchWithPasswordData | ProverbSearchData | LetterGridWordFindData | ThematicWordSearchColorData }> = ({ data }) => {
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
            <PedagogicalHeader title={data.title} instruction={data.instruction || "Kelimeleri bul ve işaretle."} note={data.pedagogicalNote} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white dark:bg-zinc-700/30 p-4 rounded-lg shadow-inner">
                <GridComponent grid={gridData} passwordCells={isWithPassword ? (data as WordSearchWithPasswordData).passwordCells : undefined} />
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

export const SynonymSearchAndStorySheet: React.FC<{ data: SynonymSearchAndStoryData }> = ({ data }) => {
    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.prompt} note={data.pedagogicalNote} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-white dark:bg-zinc-700/30 p-4 rounded-lg shadow-inner">
                    <GridComponent grid={data.grid} />
                </div>
                <div>
                    <h4 className="font-bold mb-2 text-indigo-600 dark:text-indigo-400">Eşleşmeler:</h4>
                    <ul className="space-y-2">
                    {(data.wordTable || []).map((pair, index) => (
                        <li key={index} className="text-sm border-b border-zinc-100 dark:border-zinc-700 pb-1">
                            <strong>{pair.word}</strong> <i className="fa-solid fa-arrow-right text-xs text-zinc-400 mx-1"></i> {pair.synonym}
                        </li>
                    ))}
                    </ul>
                </div>
            </div>
            <div className="mt-8">
                <h4 className="font-semibold text-center mb-2">{data.storyPrompt}</h4>
                <div className="h-40 border-2 border-dashed rounded-lg p-2 bg-zinc-50 dark:bg-zinc-800/20" style={{borderColor: 'var(--worksheet-border-color)'}}></div>
            </div>
        </div>
    );
};

export const SynonymWordSearchSheet: React.FC<{ data: SynonymWordSearchData }> = ({ data }) => {
    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.prompt} note={data.pedagogicalNote} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-white dark:bg-zinc-700/30 p-4 rounded-lg shadow-inner">
                    <GridComponent grid={data.grid} />
                </div>
                <div>
                    <h4 className="font-bold mb-2 text-indigo-600 dark:text-indigo-400">Kelimeler:</h4>
                    <ul className="space-y-2 text-sm">
                    {(data.wordsToMatch || []).map((pair, index) => (
                        <li key={index} className="p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded border border-zinc-200 dark:border-zinc-700">
                            <strong>{pair.word}</strong> kelimesinin eş anlamlısını bulun.
                        </li>
                    ))}
                    </ul>
                </div>
            </div>
        </div>
    );
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

export const LetterBridgeSheet: React.FC<{ data: LetterBridgeData }> = ({ data }) => (
     <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-6 max-w-lg mx-auto my-8">
            {(data.pairs || []).map((pair, index) => (
                <div key={index} className="flex items-center justify-center p-4 bg-white dark:bg-zinc-700/50 rounded-xl border-2 border-zinc-200 dark:border-zinc-600 shadow-sm">
                    <span className="text-2xl font-bold tracking-widest text-zinc-400">{pair.word1.toUpperCase()}</span>
                    <div className="mx-4 w-14 h-14 border-4 border-dashed border-indigo-400 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                        <i className="fa-solid fa-question text-indigo-300"></i>
                    </div>
                    <span className="text-2xl font-bold tracking-widest text-zinc-400">{pair.word2.toUpperCase()}</span>
                </div>
            ))}
        </div>
        {data.followUpPrompt && (
            <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-200">
                <p className="font-semibold mb-2 text-emerald-800 dark:text-emerald-200">{data.followUpPrompt}</p>
                <div className="w-full h-16 border-b-2 border-dotted border-emerald-400"></div>
            </div>
        )}
    </div>
);

export const WordLadderSheet: React.FC<{ data: WordLadderData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        {data.theme && <div className="text-center mb-6 inline-block w-full"><span className="px-4 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-bold">{data.theme}</span></div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 justify-items-center">
            {(data.ladders || []).map((ladder, index) => (
                <div key={index} className="relative p-6 bg-white dark:bg-zinc-700/50 rounded-2xl border-2 border-zinc-200 dark:border-zinc-600 shadow-lg w-full max-w-xs">
                    {/* Ladder Visual */}
                    <div className="absolute left-4 top-0 bottom-0 w-2 bg-amber-700/20 rounded-full"></div>
                    <div className="absolute right-4 top-0 bottom-0 w-2 bg-amber-700/20 rounded-full"></div>
                    
                    <div className="flex flex-col items-center space-y-4 relative z-10">
                        <div className="px-6 py-3 bg-emerald-500 text-white font-mono text-xl font-bold rounded-lg shadow-md w-4/5 text-center transform -rotate-1">{ladder.startWord.toUpperCase()}</div>
                        
                        {Array.from({ length: ladder.steps }).map((_, i) => (
                            <div key={i} className="px-6 py-3 bg-white dark:bg-zinc-600 border-2 border-dashed border-zinc-300 dark:border-zinc-500 rounded-lg w-4/5 text-center h-12"></div>
                        ))}
                        
                        <div className="px-6 py-3 bg-rose-500 text-white font-mono text-xl font-bold rounded-lg shadow-md w-4/5 text-center transform rotate-1">{ladder.endWord.toUpperCase()}</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const WordFormationSheet: React.FC<{ data: WordFormationData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(data.sets || []).map((set, index) => (
                <div key={index} className="p-6 bg-white dark:bg-zinc-700/50 rounded-xl border-2 border-zinc-200 dark:border-zinc-600 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                        Joker: {set.jokerCount}
                    </div>
                    
                    <div className="flex justify-center items-center gap-2 flex-wrap mb-6 mt-2">
                        {(set.letters || []).map((letter, i) => (
                            <div key={i} className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg border-b-4 border-zinc-300 dark:border-zinc-900 flex items-center justify-center text-2xl font-black text-zinc-700 dark:text-zinc-300 shadow-sm">
                                {letter.toUpperCase()}
                            </div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                         {Array.from({ length: 8 }).map((_, i) => (
                             <div key={i} className="h-8 border-b-2 border-zinc-200 dark:border-zinc-600"></div>
                         ))}
                    </div>
                </div>
            ))}
        </div>
        {data.mysteryWordChallenge && (
            <div className="mt-8 p-6 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-xl border border-violet-100 dark:border-violet-800 text-center">
                <p className="font-bold text-lg text-violet-900 dark:text-violet-200 mb-4"><i className="fa-solid fa-star mr-2 text-yellow-400"></i>{data.mysteryWordChallenge.prompt}</p>
                 <div className="flex justify-center gap-3">
                    {Array.from({length: data.mysteryWordChallenge.solution.length}).map((_, i) => (
                        <div key={i} className="w-10 h-12 border-2 border-violet-300 dark:border-violet-600 rounded-md bg-white dark:bg-zinc-800"></div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

export const ReverseWordSheet: React.FC<{ data: ReverseWordData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {(data.words || []).map((word, index) => (
                <div key={index} className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-zinc-700/50 rounded-xl border border-zinc-200 dark:border-zinc-600 shadow-sm">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg">
                        <p className="font-bold text-xl tracking-wider text-indigo-900 dark:text-indigo-200">{word.split('').reverse().join('').toUpperCase()}</p>
                    </div>
                    <i className="fa-solid fa-arrow-right text-zinc-300"></i>
                    <div className="flex-1 h-10 border-b-2 border-dashed border-zinc-400"></div>
                </div>
            ))}
        </div>
        {data.funFact && (
            <div className="mt-8 p-4 bg-sky-50 dark:bg-sky-900/30 rounded-lg text-center border border-sky-100">
                <p className="text-sm text-sky-800 dark:text-sky-200 font-medium"><i className="fa-solid fa-lightbulb mr-2 text-yellow-500"></i>Biliyor musun? {data.funFact}</p>
            </div>
        )}
    </div>
);

export const WordGroupingSheet: React.FC<{ data: WordGroupingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        
        <div className="mb-8 p-6 bg-white dark:bg-zinc-800 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-600">
            <div className="flex justify-center flex-wrap gap-4">
                {(data.words || []).map((word, index) => (
                    <div key={index} className="flex flex-col items-center p-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg shadow-sm hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-grab w-24">
                        <ImageDisplay base64={word.imageBase64} description={word.text} className="w-16 h-16 mb-1" />
                        <span className="text-sm font-medium">{word.text}</span>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(data.categoryNames || []).map((name, index) => (
                <div key={index} className="bg-white dark:bg-zinc-700/30 rounded-xl border-t-8 border-indigo-400 shadow-md overflow-hidden">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 text-center border-b border-indigo-100 dark:border-indigo-800">
                        <h4 className="font-bold text-lg text-indigo-800 dark:text-indigo-200">{name}</h4>
                    </div>
                    <div className="p-4 space-y-3 min-h-[160px]">
                         {Array.from({ length: 4 }).map((_, i) => (
                             <div key={i} className="h-10 border-b border-zinc-200 dark:border-zinc-600"></div>
                         ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const MiniWordGridSheet: React.FC<{ data: MiniWordGridData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
            {(data.puzzles || []).map((puzzle, index) => (
                <div key={index} className="p-2 bg-white dark:bg-zinc-700/50 rounded-lg shadow-md inline-block border-4 border-zinc-200 dark:border-zinc-600">
                    <GridComponent grid={puzzle.grid} cellClassName="w-12 h-12 text-2xl font-bold" />
                    {/* Start Indicator */}
                    <div className="mt-2 text-center text-xs text-zinc-400">Başlangıç: {puzzle.start.row+1}. Satır, {puzzle.start.col+1}. Sütun</div>
                </div>
            ))}
        </div>
        <div className="mt-8 text-center font-bold text-xl text-indigo-600 dark:text-indigo-400 animate-pulse">
            {data.prompt}
        </div>
    </div>
);

export const PasswordFinderSheet: React.FC<{ data: PasswordFinderData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {(data.words || []).map((item, index) => (
                <div key={index} className="flex items-center p-3 bg-white dark:bg-zinc-700/50 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-600">
                     <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-md flex items-center justify-center text-sm font-bold text-zinc-400 mr-3">{index + 1}</div>
                     <span className="text-xl tracking-wide">{item.word}</span>
                </div>
            ))}
        </div>
         <div className="bg-zinc-100 dark:bg-zinc-800 p-8 rounded-2xl text-center">
            <h4 className="font-bold text-lg mb-4 text-zinc-500 dark:text-zinc-400 uppercase tracking-widest"><i className="fa-solid fa-lock mr-2"></i>Şifre</h4>
            <div className="flex justify-center gap-3">
             {Array.from({ length: data.passwordLength }).map((_, i) => (
                <div key={i} className="w-14 h-16 border-b-4 border-indigo-500 bg-white dark:bg-zinc-700 rounded-t-lg shadow-sm"></div>
            ))}
            </div>
        </div>
    </div>
);

export const SyllableCompletionSheet: React.FC<{ data: SyllableCompletionData }> = ({ data }) => {
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
      <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
      
      <div className="mb-10 p-6 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl text-center">
          <h4 className="font-bold mb-4 text-amber-800 dark:text-amber-200 uppercase tracking-wider">Hece Havuzu</h4>
          <div className="flex justify-center flex-wrap gap-4">
              {(data.syllables || []).map((syllable, index) => (
                  <div key={index} className="w-16 h-16 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-full shadow-md text-xl font-bold border-2 border-amber-100 dark:border-zinc-700 transform hover:scale-110 transition-transform">
                      {syllable}
                  </div>
              ))}
          </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          {(data.wordParts || []).map((part, index) => (
              <div key={index} className="flex items-center justify-center p-4 bg-white dark:bg-zinc-700/50 rounded-xl shadow-sm">
                  <span className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mr-1">{part.first}</span>
                  <span className="text-2xl font-bold text-zinc-300">-</span>
                  <div className="w-16 mx-2 border-b-4 border-zinc-300 dark:border-zinc-500"></div>
              </div>
          ))}
      </div>

      <div className="p-6 bg-white dark:bg-zinc-700/30 rounded-xl border-l-8 border-indigo-500 shadow-sm">
          <h4 className="font-bold mb-4 text-indigo-600 dark:text-indigo-400"><i className="fa-solid fa-book-open mr-2"></i>Hikaye Zamanı</h4>
          {storyContent}
      </div>
    </div>
    )
};

export const SpiralPuzzleSheet: React.FC<{ data: SpiralPuzzleData | PunctuationSpiralPuzzleData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        
        <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="flex-1 w-full bg-white dark:bg-zinc-700/30 p-4 rounded-2xl shadow-inner relative">
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
                 <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800">
                     <h4 className="font-bold text-lg mb-4 text-indigo-800 dark:text-indigo-200 border-b border-indigo-200 pb-2">İpuçları</h4>
                     <ul className="space-y-3">
                         {(data.clues || []).map((clue, index) => (
                             <li key={index} className="flex items-start text-sm">
                                 <span className="font-bold mr-2 bg-white dark:bg-zinc-800 w-6 h-6 flex items-center justify-center rounded-full text-indigo-600 shadow-sm shrink-0">{index + 1}</span>
                                 <span className="mt-0.5">{clue}</span>
                             </li>
                         ))}
                     </ul>
                 </div>
                 
                 <div className="mt-6 p-4 bg-amber-100 dark:bg-amber-900/40 rounded-xl border-l-4 border-amber-500 text-center">
                    <p className="font-bold text-amber-800 dark:text-amber-200 mb-2">ŞİFRE</p>
                    <p className="text-sm mb-3">{data.passwordPrompt}</p>
                    <div className="w-full h-10 border-b-2 border-dashed border-amber-600 dark:border-amber-400"></div>
                </div>
            </div>
        </div>
    </div>
);

export const CrosswordSheet: React.FC<{ data: CrosswordData }> = ({ data }) => {
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
                                    {/* For pedagogical display, show letter if needed or empty input area */}
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

export const JumbledWordStorySheet: React.FC<{ data: JumbledWordStoryData | ThematicJumbledWordStoryData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        
        {'imagePrompt' in data && (data as any).imageBase64 && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-lg border-4 border-white dark:border-zinc-700 transform -rotate-1">
                 <ImageDisplay base64={(data as any).imageBase64} description={data.theme} className="w-full h-48 object-cover" />
            </div>
        )}

        <div className="space-y-6 mb-10">
             {(data.puzzles || []).map((puzzle, index) => (
                 <div key={index} className="p-4 bg-white dark:bg-zinc-700/50 rounded-lg shadow-sm border border-zinc-200 flex items-center gap-4">
                     <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">{index + 1}</span>
                     <div className="flex-1 flex gap-2 justify-center">
                         {puzzle.jumbled.map((letter, i) => (
                             <span key={i} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-600 rounded text-lg font-mono font-bold border-b-2 border-zinc-300">{letter}</span>
                         ))}
                     </div>
                     <div className="w-32 h-10 border-b-2 border-dotted border-zinc-400"></div>
                 </div>
             ))}
        </div>
        
        <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl border-l-4 border-orange-400">
            <h4 className="font-bold text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-2"><i className="fa-solid fa-pen-nib"></i> Hikaye Yaz</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{data.storyPrompt}</p>
            <div className="space-y-3">
                {Array.from({length: 4}).map((_, i) => <div key={i} className="border-b border-orange-200 dark:border-orange-800 h-8"></div>)}
            </div>
        </div>
    </div>
);

export const ResfebeSheet: React.FC<{ data: ResfebeData | AntonymResfebeData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {(data.puzzles || []).map((puzzle, index) => (
                <div key={index} className="bg-white dark:bg-zinc-700/50 p-6 rounded-2xl shadow-md border-2 border-zinc-100 dark:border-zinc-600 flex flex-col items-center">
                    <div className="flex flex-wrap items-center justify-center gap-4 mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl w-full min-h-[120px]">
                        {puzzle.clues.map((clue, i) => (
                            <div key={i} className="transform hover:scale-110 transition-transform">
                                {clue.type === 'image' ? (
                                    <div className="relative group">
                                         {/* FIX: Access imageBase64 from the clue object if it exists, otherwise fallback */}
                                        <ImageDisplay base64={(clue as any).imageBase64} description={clue.value} className="w-20 h-20 object-cover rounded-lg shadow-sm border-2 border-white" />
                                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs px-2 py-1 rounded transition-opacity whitespace-nowrap pointer-events-none">{clue.value}</span>
                                    </div>
                                ) : (
                                    <span className="text-4xl font-black text-zinc-800 dark:text-zinc-100 drop-shadow-md">{clue.value}</span>
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
                </div>
            ))}
        </div>
    </div>
);

export const AntonymFlowerPuzzleSheet: React.FC<{ data: AntonymFlowerPuzzleData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 justify-items-center">
            {(data.puzzles || []).map((puzzle, index) => (
                <div key={index} className="relative w-64 h-64 flex items-center justify-center">
                    {/* Flower Center */}
                    <div className="absolute z-20 w-24 h-24 bg-yellow-400 rounded-full border-4 border-yellow-500 flex items-center justify-center shadow-lg">
                        <span className="text-lg font-bold text-amber-900 text-center leading-tight px-2">{puzzle.centerWord}</span>
                    </div>
                    
                    {/* Petals */}
                    {puzzle.petalLetters.map((letter, i) => {
                        const angle = (i * 360) / puzzle.petalLetters.length;
                        return (
                            <div 
                                key={i}
                                className="absolute w-16 h-16 bg-white dark:bg-pink-200 rounded-full border-2 border-pink-300 flex items-center justify-center shadow-md origin-center transform"
                                style={{
                                    transform: `rotate(${angle}deg) translate(80px) rotate(-${angle}deg)`
                                }}
                            >
                                <span className="text-2xl font-bold text-pink-600 dark:text-pink-800 transform">{letter}</span>
                            </div>
                        )
                    })}
                    
                    {/* Stem */}
                    <div className="absolute top-1/2 left-1/2 w-2 h-40 bg-green-500 -z-10 transform -translate-x-1/2 translate-y-10 rounded-full"></div>
                </div>
            ))}
        </div>
        
        <div className="mt-12 text-center">
             <div className="inline-block p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-300">
                 <p className="text-sm text-zinc-500 mb-2">Bulduğun kelimeleri buraya yaz:</p>
                 <div className="flex gap-4">
                     {data.puzzles.map((_, i) => <div key={i} className="w-32 h-8 border-b-2 border-zinc-400"></div>)}
                 </div>
             </div>
        </div>
    </div>
);

export const WordGridPuzzleSheet: React.FC<{ data: WordGridPuzzleData }> = ({ data }) => (
     <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 bg-zinc-800 p-1 rounded-lg shadow-xl">
                 <GridComponent grid={data.grid} cellClassName="w-10 h-10 bg-white border-zinc-300" showLetters={false} />
            </div>
            
            <div className="w-full md:w-1/3">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-5 rounded-xl border border-indigo-200">
                    <h4 className="font-bold text-indigo-800 dark:text-indigo-200 mb-3 border-b border-indigo-300 pb-1">Kelime Listesi</h4>
                    <ul className="space-y-1">
                        {data.wordList.map((word, i) => (
                            <li key={i} className="flex justify-between text-sm">
                                <span>{word}</span>
                                <span className="text-xs bg-white px-1 rounded text-zinc-400">{word.length}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border border-emerald-200 text-center">
                     <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Ekstra Görev</p>
                     <p className="text-sm">{data.unusedWordPrompt}</p>
                </div>
            </div>
        </div>
    </div>
);

// Stub sheets replaced with SimpleSheet or custom implementations above.
// Keeping SimpleSheet for any remaining generic fallbacks.
const SimpleSheet: React.FC<{ data: any, defaultTitle: string }> = ({ data, defaultTitle }) => (
    <div>
        <PedagogicalHeader title={data.title || defaultTitle} instruction={data.instruction || data.prompt || "Etkinliği tamamlayın."} note={data.pedagogicalNote} />
        <div className="p-4 text-center text-zinc-500 italic">Bu etkinlik için içerik oluşturuldu.</div>
        <pre className="text-xs bg-zinc-100 p-2 rounded max-h-64 overflow-auto">{JSON.stringify(data, null, 2)}</pre>
    </div>
);

export const HomonymSentenceSheet: React.FC<{ data: HomonymSentenceData }> = (props) => <SimpleSheet {...props} defaultTitle="Eş Sesli Cümle" />;
export const HomonymImageMatchSheet: React.FC<{ data: HomonymImageMatchData }> = (props) => <SimpleSheet {...props} defaultTitle="Eş Sesli Resim Eşleştirme" />;
export const SynonymAntonymGridSheet: React.FC<{ data: SynonymAntonymGridData }> = (props) => <SimpleSheet {...props} defaultTitle="Eş/Zıt Anlam Tablosu" />;
export const AntonymResfebeSheet: React.FC<{ data: AntonymResfebeData }> = (props) => <ResfebeSheet {...props} />;
export const SynonymMatchingPatternSheet: React.FC<{ data: SynonymMatchingPatternData }> = (props) => <SimpleSheet {...props} defaultTitle="Eş Anlamlı Desen Bulmaca" />;
export const MissingPartsSheet: React.FC<{ data: MissingPartsData }> = (props) => <SimpleSheet {...props} defaultTitle="Eksik Parçalar" />;
export const WordWebSheet: React.FC<{ data: WordWebData }> = (props) => <SimpleSheet {...props} defaultTitle="Kelime Ağı" />;
export const SyllableWordSearchSheet: React.FC<{ data: SyllableWordSearchData }> = (props) => <SimpleSheet {...props} defaultTitle="Hece & Kelime Avı" />;
export const WordWebWithPasswordSheet: React.FC<{ data: WordWebWithPasswordData }> = (props) => <SimpleSheet {...props} defaultTitle="Şifreli Kelime Ağı" />;
export const WordPlacementPuzzleSheet: React.FC<{ data: WordPlacementPuzzleData }> = (props) => <SimpleSheet {...props} defaultTitle="Kelime Yerleştirme" />;
export const PositionalAnagramSheet: React.FC<{ data: PositionalAnagramData }> = (props) => <SimpleSheet {...props} defaultTitle="Yer Değiştirmeli Anagram" />;
export const ImageAnagramSortSheet: React.FC<{ data: ImageAnagramSortData }> = (props) => <SimpleSheet {...props} defaultTitle="Resimli Anagram Sıralama" />;
export const AnagramImageMatchSheet: React.FC<{ data: AnagramImageMatchData }> = (props) => <SimpleSheet {...props} defaultTitle="Anagram Resim Eşleştirme" />;
