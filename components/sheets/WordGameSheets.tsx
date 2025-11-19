import React from 'react';
import { 
    WordSearchData, WordSearchWithPasswordData, ProverbSearchData, LetterGridWordFindData, ThematicWordSearchColorData,
    SynonymWordSearchData, SynonymSearchAndStoryData, AnagramData, SpellingCheckData, LetterBridgeData, WordLadderData,
    WordFormationData, ReverseWordData, WordGroupingData, MiniWordGridData, PasswordFinderData, SyllableCompletionData,
    SpiralPuzzleData, PunctuationSpiralPuzzleData, CrosswordData, CrosswordClue, JumbledWordStoryData, ThematicJumbledWordStoryData, HomonymSentenceData,
    WordGridPuzzleData, HomonymImageMatchData, AntonymFlowerPuzzleData, SynonymAntonymGridData, AntonymResfebeData,
    SynonymMatchingPatternData, MissingPartsData, WordWebData, SyllableWordSearchData, WordWebWithPasswordData,
    WordPlacementPuzzleData, PositionalAnagramData, ImageAnagramSortData, AnagramImageMatchData, ResfebeData, ResfebeClue
} from '../../types';
import { GridComponent, ImageDisplay } from './common';

export const WordSearchSheet: React.FC<{ data: WordSearchData | WordSearchWithPasswordData | ProverbSearchData | LetterGridWordFindData | ThematicWordSearchColorData }> = ({ data }) => {
    const isWithPassword = 'passwordCells' in data && !!data.passwordCells;
    const gridData = (data as any).grid as string[][];
    let wordsData: string[] = [];
    if ('words' in data && data.words) {
      wordsData = data.words;
    } else if ('proverb' in data && data.proverb) {
      // FIX: The 'proverb' property is a single string. Split it into an array of words to match the 'string[]' type of wordsData.
      wordsData = data.proverb.split(' ');
    }
    
    return (
        <div>
            <h3 className="text-lg font-semibold mb-4 text-center">{data.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white dark:bg-zinc-700/30 p-4 rounded-lg shadow-inner">
                <GridComponent grid={gridData} passwordCells={isWithPassword ? (data as WordSearchWithPasswordData).passwordCells : undefined} />
            </div>
            <div>
                <h4 className="font-bold mb-2 text-indigo-600 dark:text-indigo-400">Aranacak Kelimeler:</h4>
                <ul className="list-disc list-inside space-y-1">
                {(wordsData || []).map((word, index) => (
                    <li key={index} className="capitalize">{word}</li>
                ))}
                </ul>
                {'writingPrompt' in data && <p className="mt-4 text-sm italic">{data.writingPrompt}</p>}
            </div>
            </div>
        </div>
    )
};

export const SynonymSearchAndStorySheet: React.FC<{ data: SynonymSearchAndStoryData }> = ({ data }) => {
    return (
        <div>
            <h3 className="text-xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center mb-6">{data.prompt}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-white dark:bg-zinc-700/30 p-4 rounded-lg shadow-inner">
                    <GridComponent grid={data.grid} />
                </div>
                <div>
                    <h4 className="font-bold mb-2 text-indigo-600 dark:text-indigo-400">Kelimeler:</h4>
                    <ul className="space-y-1">
                    {(data.wordTable || []).map((pair, index) => (
                        <li key={index}><strong>{pair.word}:</strong> {pair.synonym}</li>
                    ))}
                    </ul>
                </div>
            </div>
            <div className="mt-8">
                <h4 className="font-semibold text-center mb-2">{data.storyPrompt}</h4>
                <div className="h-40 border-2 border-dashed rounded-lg p-2" style={{borderColor: 'var(--worksheet-border-color)'}}></div>
            </div>
        </div>
    );
};

export const SynonymWordSearchSheet: React.FC<{ data: SynonymWordSearchData }> = ({ data }) => {
    return (
        <div>
            <h3 className="text-xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center mb-6">{data.prompt}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-white dark:bg-zinc-700/30 p-4 rounded-lg shadow-inner">
                    <GridComponent grid={data.grid} />
                </div>
                <div>
                    <h4 className="font-bold mb-2 text-indigo-600 dark:text-indigo-400">Kelimeler:</h4>
                    <ul className="space-y-1">
                    {(data.wordsToMatch || []).map((pair, index) => (
                        <li key={index}><strong>{pair.word}</strong> kelimesinin eş anlamlısını bulun.</li>
                    ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export const AnagramSheet: React.FC<{ data: AnagramData[] }> = ({ data }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4 text-center">Anagram Bulmaca</h3>
    <div className="space-y-4 max-w-md mx-auto">
      {(data || []).map((item, index) => (
        <div key={index} className="flex items-center justify-between bg-white dark:bg-zinc-700/50 p-3 rounded-lg shadow-sm">
          <p className="font-mono text-xl tracking-widest">{item.scrambled.toUpperCase()}</p>
          <div className="w-2/3 h-8 bg-zinc-200 dark:bg-zinc-600 rounded-md border-b-2 border-zinc-400"></div>
        </div>
      ))}
    </div>
  </div>
);

export const SpellingCheckSheet: React.FC<{ data: SpellingCheckData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-6 text-center">{data.title}</h3>
        <div className="space-y-6">
            {(data.checks || []).map((check, index) => (
                <div key={index} className="p-4 rounded-lg bg-white dark:bg-zinc-700/50">
                    <p className="font-semibold mb-3 text-lg">{index + 1}. Aşağıdaki kelimelerden hangisi doğru yazılmıştır?</p>
                    <div className="flex flex-col sm:flex-row justify-around gap-4">
                        {(check.options || []).map((option, optIndex) => (
                             <div key={optIndex} className="flex items-center">
                                <div className="w-5 h-5 border-2 border-zinc-400 rounded-md mr-3"></div>
                                <label className="text-lg">{option}</label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const LetterBridgeSheet: React.FC<{ data: LetterBridgeData }> = ({ data }) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Ortadaki kutucuğa öyle bir harf yerleştirin ki, hem soldaki kelimenin son harfi, hem de sağdaki kelimenin ilk harfi olsun.</p>
        <div className="space-y-6 max-w-md mx-auto">
            {(data.pairs || []).map((pair, index) => (
                <div key={index} className="flex items-center justify-center gap-2 text-xl font-semibold tracking-widest">
                    <span>{pair.word1.toUpperCase()}</span>
                    <div className="w-10 h-10 border-2 border-zinc-400 rounded-md"></div>
                    <span>{pair.word2.toUpperCase()}</span>
                </div>
            ))}
        </div>
    </div>
);

export const WordLadderSheet: React.FC<{ data: WordLadderData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">İlk kelimeden başlayarak her adımda bir harfi değiştirerek son kelimeye ulaşmaya çalışın.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(data.ladders || []).map((ladder, index) => (
                <div key={index} className="p-4 bg-white dark:bg-zinc-700/50 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    <div className="flex flex-col items-center space-y-2 font-mono text-xl tracking-widest">
                        <div className="px-4 py-2 border-2 border-zinc-300 rounded-md w-full text-center">{ladder.startWord.toUpperCase()}</div>
                        {Array.from({ length: ladder.steps }).map((_, i) => (
                            <div key={i} className="w-full h-10 border-b-2 border-dotted border-zinc-400"></div>
                        ))}
                        <div className="px-4 py-2 border-2 border-zinc-300 rounded-md w-full text-center">{ladder.endWord.toUpperCase()}</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const WordFormationSheet: React.FC<{ data: WordFormationData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Aşağıdaki harfleri kullanarak anlamlı kelimeler türetin. Joker hakkınızı unutmayın!</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(data.sets || []).map((set, index) => (
                <div key={index} className="p-4 bg-white dark:bg-zinc-700/50 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    <div className="flex justify-center items-center gap-2 flex-wrap mb-4 p-3 bg-amber-100 dark:bg-amber-900/50 border-2 border-dashed border-amber-400 rounded">
                        {(set.letters || []).map((letter, i) => (
                            <span key={i} className="flex items-center justify-center w-10 h-10 bg-white dark:bg-zinc-600 rounded shadow text-2xl font-bold">{letter.toUpperCase()}</span>
                        ))}
                    </div>
                    <p className="text-center text-sm font-semibold mb-3">Joker Hakkı: {set.jokerCount}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                         {Array.from({ length: 10 }).map((_, i) => (
                             <div key={i} className="h-8 border-b-2 border-zinc-300 dark:border-zinc-600"></div>
                         ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const ReverseWordSheet: React.FC<{ data: ReverseWordData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Aşağıdaki kelimeleri okuyup, karşılarındaki boşluklara tersten yazın.</p>
        <div className="space-y-4 max-w-lg mx-auto">
            {(data.words || []).map((word, index) => (
                <div key={index} className="flex items-center justify-between gap-4 p-3 bg-white dark:bg-zinc-700/50 rounded-lg">
                    <p className="font-semibold text-lg w-1/3">{word}</p>
                    <div className="w-2/3 h-8 border-b-2 border-dotted border-zinc-500"></div>
                </div>
            ))}
        </div>
    </div>
);

export const WordGroupingSheet: React.FC<{ data: WordGroupingData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Aşağıdaki kelime havuzunda bulunan kelimeleri, ait oldukları doğru kategori kutucuklarına yazın.</p>
        <div className="mb-8 p-4 bg-amber-100 dark:bg-amber-900/50 border-2 border-dashed border-amber-400 rounded-lg">
            <h4 className="font-bold text-center mb-2 text-amber-800 dark:text-amber-200">Kelime Havuzu</h4>
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2">
                {(data.words || []).map((word, index) => (
                    <span key={index} className="text-lg capitalize">{word}</span>
                ))}
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(data.categoryNames || []).map((name, index) => (
                <div key={index} className="p-4 bg-white dark:bg-zinc-700/50 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    <h4 className="font-bold text-center mb-3 text-indigo-600 dark:text-indigo-400">{name}</h4>
                    <div className="space-y-2 h-40">
                         {Array.from({ length: 5 }).map((_, i) => (
                             <div key={i} className="h-8 border-b-2 border-zinc-300 dark:border-zinc-600"></div>
                         ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const MiniWordGridSheet: React.FC<{ data: MiniWordGridData }> = ({ data }) => (
    <div>
        <h3 className="text-xl font-bold mb-2 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-2 gap-8">
            {(data.puzzles || []).map((puzzle, index) => (
                <div key={index} className="p-4 bg-white dark:bg-zinc-700/50 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)'}}>
                    <table className="table-fixed w-full">
                        <tbody>
                            {(puzzle.grid || []).map((row, rIndex) => (
                                <tr key={rIndex}>
                                    {(row || []).map((cell, cIndex) => (
                                        <td key={cIndex} className={`border text-center font-mono text-xl w-10 h-10 ${puzzle.start.row === rIndex && puzzle.start.col === cIndex ? 'bg-amber-200 dark:bg-amber-800' : ''}`} style={{borderColor: 'var(--worksheet-border-color)'}}>
                                            {cell.toUpperCase()}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    </div>
);

export const PasswordFinderSheet: React.FC<{ data: PasswordFinderData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-2 gap-4 mb-8">
            {(data.words || []).map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-700/50 rounded-lg">
                     <div className="w-5 h-5 border-2 border-zinc-400 rounded-md shrink-0"></div>
                     <span className="text-lg">{item.word}</span>
                </div>
            ))}
        </div>
         <div className="mt-8">
            <h4 className="font-semibold text-center mb-2">Şifre:</h4>
            <div className="flex justify-center gap-2">
             {Array.from({ length: data.passwordLength }).map((_, i) => (
                <div key={i} className="w-10 h-12 border-b-2 border-zinc-500 bg-amber-100 dark:bg-amber-800/40"></div>
            ))}
            </div>
        </div>
    </div>
);

export const SyllableCompletionSheet: React.FC<{ data: SyllableCompletionData }> = ({ data }) => (
    <div>
      <h3 className="text-xl font-bold mb-2 text-center">{data.title}</h3>
      <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
      <div className="mb-8 p-4 bg-amber-100 dark:bg-amber-900/50 border-2 border-dashed border-amber-400 rounded-lg">
          <h4 className="font-bold text-center mb-3 text-amber-800 dark:text-amber-200">Heceler</h4>
          <div className="flex justify-center flex-wrap gap-3">
              {(data.syllables || []).map((syllable, index) => (
                  <span key={index} className="px-3 py-1 bg-white dark:bg-zinc-700 rounded-md shadow-sm">{syllable}</span>
              ))}
          </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {(data.wordParts || []).map((part, index) => (
              <div key={index} className="flex items-center justify-center p-3 text-lg">
                  <span>{part.first}</span>
                  <div className="w-16 mx-2 border-b-2 border-dotted border-zinc-400"></div>
                  <span>{part.second}</span>
              </div>
          ))}
      </div>
      <div>
          <h4 className="font-semibold text-center mb-2">{data.storyPrompt}</h4>
          <div className="h-40 border-2 border-dashed rounded-lg p-2" style={{borderColor: 'var(--worksheet-border-color)'}}></div>
      </div>
    </div>
);

export const SpiralPuzzleSheet: React.FC<{ data: SpiralPuzzleData | PunctuationSpiralPuzzleData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-zinc-700/30 p-2 rounded-lg shadow-inner">
                 <GridComponent grid={data.grid} />
            </div>
            <div>
                 <h4 className="font-bold text-lg mb-2 text-indigo-600 dark:text-indigo-400">İpuçları</h4>
                 <ul className="space-y-2">
                     {(data.clues || []).map((clue, index) => (
                         <li key={index}><strong>{index + 1}.</strong> {clue}</li>
                     ))}
                 </ul>
            </div>
        </div>
    </div>
);

export const CrosswordSheet: React.FC<{ data: CrosswordData }> = ({ data }) => {
    const { title, prompt, grid, clues, passwordCells, passwordLength } = data;

    // Re-number clues to follow standard crossword convention (shared number for same start cell)
    const processedClues: CrosswordClue[] = JSON.parse(JSON.stringify(clues || [])); 

    const uniqueStarts: {row: number, col: number}[] = [];
    (processedClues || []).forEach(clue => {
        if (!uniqueStarts.some(s => s.row === clue.start.row && s.col === clue.start.col)) {
            uniqueStarts.push(clue.start);
        }
    });

    uniqueStarts.sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
    });
    
    const positionToNumberMap = new Map<string, number>();
    (uniqueStarts || []).forEach((start, index) => {
        positionToNumberMap.set(`${start.row}-${start.col}`, index + 1);
    });

    (processedClues || []).forEach(clue => {
        const key = `${clue.start.row}-${clue.start.col}`;
        clue.id = positionToNumberMap.get(key)!;
    });

    const acrossClues = (processedClues || []).filter(c => c.direction === 'across').sort((a, b) => a.id - b.id);
    const downClues = (processedClues || []).filter(c => c.direction === 'down').sort((a, b) => a.id - b.id);

    const isPasswordCell = (r: number, c: number) => {
        return (passwordCells || []).some(p => p.row === r && p.col === c);
    };

    const gridSize = (grid || []).length;

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-center">{title}</h3>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{prompt}</p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                <div className="md:col-span-3">
                    <div
                        className="grid border-2 border-zinc-900 dark:border-zinc-500"
                        style={{
                            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                            width: '100%',
                            aspectRatio: '1 / 1',
                        }}
                    >
                        {(grid || []).map((row, r) =>
                            (row || []).map((cell, c) => {
                                const key = `${r}-${c}`;
                                const clueNumber = positionToNumberMap.get(key);
                                const isBlack = cell === null;
                                const isPassword = isPasswordCell(r, c);

                                if (isBlack) {
                                    return <div key={key} className="bg-zinc-800 dark:bg-zinc-900"></div>;
                                }

                                return (
                                    <div
                                        key={key}
                                        className={`relative border bg-white dark:bg-zinc-700/50 ${isPassword ? 'bg-amber-100 dark:bg-amber-800/40' : ''}`}
                                        style={{ borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)' }}
                                    >
                                        {clueNumber && (
                                            <sup className="absolute top-0 left-1 text-[0.6rem] font-bold text-zinc-500 dark:text-zinc-400">
                                                {clueNumber}
                                            </sup>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="md:col-span-2 text-sm">
                    <div>
                        <h4 className="font-bold text-lg mb-2 text-indigo-600 dark:text-indigo-400">Soldan Sağa</h4>
                        <ul className="space-y-2">
                            {(acrossClues || []).map(clue => (
                                <li key={`across-${clue.id}`}>
                                    <strong>{clue.id}.</strong> {clue.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-6">
                         <h4 className="font-bold text-lg mb-2 text-violet-600 dark:text-violet-400">Yukarıdan Aşağıya</h4>
                        <ul className="space-y-2">
                            {(downClues || []).map(clue => (
                                <li key={`down-${clue.id}`}>
                                    <strong>{clue.id}.</strong> {clue.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
             <div className="mt-8">
                <h4 className="font-semibold text-center mb-2">Şifre:</h4>
                <div className="flex justify-center gap-2">
                 {Array.from({ length: passwordLength }).map((_, i) => (
                    <div key={i} className="w-10 h-12 border-b-2 border-zinc-500 bg-amber-100 dark:bg-amber-800/40"></div>
                ))}
                </div>
            </div>
        </div>
    );
};

export const JumbledWordStorySheet: React.FC<{ data: JumbledWordStoryData | ThematicJumbledWordStoryData }> = ({ data }) => (
    <div>
        <h3 className="text-xl font-bold mb-2 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="mb-8 p-4 bg-amber-100 dark:bg-amber-900/50 border-2 border-dashed border-amber-400 rounded-lg">
            <h4 className="font-bold text-center mb-3 text-amber-800 dark:text-amber-200">Tema: {data.theme}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(data.puzzles || []).map((puzzle, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <span className="font-mono tracking-widest">{(puzzle.jumbled || []).join('')}</span>
                        <span>&rarr;</span>
                        <div className="flex-1 h-8 border-b-2 border-zinc-400"></div>
                    </div>
                ))}
            </div>
        </div>
        <div>
            <h4 className="font-semibold text-center mb-2">{data.storyPrompt}</h4>
            <div className="h-48 border-2 border-dashed rounded-lg p-2" style={{borderColor: 'var(--worksheet-border-color)'}}></div>
        </div>
    </div>
);

export const HomonymSentenceSheet: React.FC<{ data: HomonymSentenceData }> = ({ data }) => (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
      <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
      <div className="space-y-8">
        {(data.items || []).map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 border rounded-lg bg-white dark:bg-zinc-700/50" style={{borderColor: 'var(--worksheet-border-color)'}}>
            <div className="flex flex-col items-center">
              <ImageDisplay base64={item.imageBase64} description={item.word} className="w-40 h-40" />
              <p className="text-xl font-bold mt-2 capitalize">{item.word}</p>
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="h-12 border-b-2 border-dotted border-zinc-400"></div>
              <div className="h-12 border-b-2 border-dotted border-zinc-400"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
);

export const WordGridPuzzleSheet: React.FC<{ data: WordGridPuzzleData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="flex flex-col md:flex-row gap-8">
             <div className="flex-1">
                 <GridComponent grid={data.grid} showLetters={false} />
            </div>
            <div className="w-full md:w-1/3">
                 <h4 className="font-bold text-lg mb-2 text-indigo-600 dark:text-indigo-400">Kelimeler ({data.theme})</h4>
                 <div className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg space-y-2">
                    {(data.wordList || []).map((word, i) => <p key={i} className="text-center font-semibold">{word}</p>)}
                </div>
                <p className="text-sm italic mt-4">{data.unusedWordPrompt}</p>
                <div className="h-10 mt-2 border-b-2 border-dotted border-zinc-400"></div>
            </div>
        </div>
    </div>
);

export const HomonymImageMatchSheet: React.FC<{ data: HomonymImageMatchData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="flex justify-center gap-8 md:gap-16 items-center mb-8">
            <div className="space-y-4">
                {(data.leftImages || []).map(img => (
                    <div key={img.id} className="flex items-center gap-4">
                         <span className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white font-bold rounded-full">{img.id}</span>
                        <ImageDisplay base64={img.imageBase64} description={img.word} className="w-24 h-24" />
                    </div>
                ))}
            </div>
            <div className="space-y-4">
                 {(data.rightImages || []).map(img => (
                    <div key={img.id} className="flex items-center gap-4">
                        <ImageDisplay base64={img.imageBase64} description={img.word} className="w-24 h-24" />
                         <span className="flex items-center justify-center w-8 h-8 bg-red-500 text-white font-bold rounded-full">{img.id}</span>
                    </div>
                ))}
            </div>
        </div>
         <div className="flex justify-center items-center gap-4 p-4 bg-zinc-100 dark:bg-zinc-700/50 rounded-lg">
             <p className="font-mono text-xl tracking-widest">{(data.wordScramble?.letters || []).join(' ')}</p>
             <i className="fa-solid fa-arrow-right text-2xl text-zinc-400"></i>
             <div className="w-40 h-10 border-b-2 border-zinc-400"></div>
         </div>
    </div>
);

export const AntonymFlowerPuzzleSheet: React.FC<{ data: AntonymFlowerPuzzleData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 justify-items-center">
            {(data.puzzles || []).map((puzzle, index) => {
                const numPetals = puzzle.petalLetters?.length || 6;
                const angleStep = 360 / numPetals;

                return (
                    <div key={index} className="flex flex-col items-center">
                        <svg viewBox="0 0 100 100" className="w-32 h-32 mb-2">
                            {/* Petals */}
                            {(puzzle.petalLetters || []).map((letter, i) => {
                                const angle = i * angleStep;
                                // SVG path for a petal shape
                                const petalPath = "M 0 -25 C 15 -25 15 -5 0 -5 C -15 -5 -15 -25 0 -25 Z";
                                return (
                                    <g key={i} transform={`rotate(${angle} 50 50) translate(0 15)`}>
                                        <path transform="translate(50 50)" d={petalPath} className="fill-yellow-300 dark:fill-yellow-700 stroke-yellow-500" strokeWidth="0.5" />
                                        <text x="50" y="32" textAnchor="middle" className="font-bold fill-current">{letter}</text>
                                    </g>
                                );
                            })}
                            {/* Center */}
                            <circle cx="50" cy="50" r="18" className="fill-orange-400 stroke-orange-600" strokeWidth="1" />
                            <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="text-[7px] font-semibold fill-white text-center">{puzzle.centerWord}</text>
                        </svg>
                        <div className="w-32 h-8 border-b-2 border-dotted border-zinc-500"></div>
                    </div>
                );
            })}
        </div>
        <div className="mt-8">
            <h4 className="font-semibold text-center mb-2">Şifre:</h4>
            <div className="flex justify-center gap-2">
             {Array.from({ length: data.passwordLength }).map((_, i) => (
                <div key={i} className="w-10 h-12 border-b-2 border-zinc-500 bg-amber-100 dark:bg-amber-800/40"></div>
            ))}
            </div>
        </div>
    </div>
);

export const SynonymAntonymGridSheet: React.FC<{ data: SynonymAntonymGridData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white dark:bg-zinc-700/30 p-2 rounded-lg shadow-inner">
                 <GridComponent grid={data.grid} />
            </div>
            <div>
                 <h4 className="font-bold text-lg mb-2 text-sky-600 dark:text-sky-400">Eş Anlamlılar</h4>
                 <ul className="list-disc list-inside space-y-1 mb-4">
                     {(data.synonyms || []).map((item, i) => <li key={i}>{item.word}</li>)}
                 </ul>
                 <h4 className="font-bold text-lg mb-2 text-rose-600 dark:text-rose-400">Zıt Anlamlılar</h4>
                 <ul className="list-disc list-inside space-y-1">
                     {(data.antonyms || []).map((item, i) => <li key={i}>{item.word}</li>)}
                 </ul>
            </div>
        </div>
    </div>
);

export const AntonymResfebeSheet: React.FC<{ data: AntonymResfebeData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="space-y-6">
            {(data.puzzles || []).map((puzzle, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-4 bg-white dark:bg-zinc-700/50 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)'}}>
                    <div className="flex justify-center items-center gap-2">
                        {(puzzle.clues || []).map((clue, i) => (
                            clue.type === 'text' ? 
                            <span key={i} className="text-3xl font-bold">{clue.value}</span> :
                            <ImageDisplay key={i} base64={clue.imageBase64} description="resfebe ipucu" className="w-20 h-20" />
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <span>&rarr;</span>
                        <div className="flex-1 h-10 border-b-2 border-zinc-400"></div>
                    </div>
                </div>
            ))}
        </div>
        <p className="text-center italic mt-6">{data.antonymsPrompt}</p>
    </div>
);

export const ResfebeSheet: React.FC<{ data: ResfebeData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
         <div className="space-y-6">
            {(data.puzzles || []).map((puzzle, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-4 bg-white dark:bg-zinc-700/50 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)'}}>
                    <div className="flex justify-center items-center gap-2">
                        {/* FIX: Explicitly cast `clue` to ResfebeClue to help TypeScript inference. */}
                        {(puzzle.clues || []).map((clue: ResfebeClue, i: number) => (
                            clue.type === 'text' ? 
                            <span key={i} className="text-3xl font-bold">{clue.value}</span> :
                            <ImageDisplay key={i} base64={(clue as ResfebeClue).imageBase64} description="resfebe ipucu" className="w-20 h-20" />
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <span>&rarr;</span>
                        <div className="flex-1 h-10 border-b-2 border-zinc-400"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const SynonymMatchingPatternSheet: React.FC<{data: SynonymMatchingPatternData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <p className="text-center font-semibold text-indigo-600 dark:text-indigo-400 mb-6">Tema: {data.theme}</p>
        <div className="grid grid-cols-2 gap-8">
            <ul className="space-y-2">
                {(data.pairs || []).map((p, i) => <li key={i} className="p-3 bg-white dark:bg-zinc-700/50 rounded-lg text-center">{p.word}</li>)}
            </ul>
             <ul className="space-y-2">
                {(data.pairs || []).map((p, i) => <li key={i} className="p-3 bg-white dark:bg-zinc-700/50 rounded-lg text-center">{p.synonym}</li>)}
            </ul>
        </div>
    </div>
);

export const MissingPartsSheet: React.FC<{ data: MissingPartsData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
);

export const WordWebSheet: React.FC<{ data: WordWebData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
);

export const SyllableWordSearchSheet: React.FC<{ data: SyllableWordSearchData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
);

export const WordWebWithPasswordSheet: React.FC<{ data: WordWebWithPasswordData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
);

export const LetterGridWordFindSheet: React.FC<{ data: LetterGridWordFindData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
);

export const WordPlacementPuzzleSheet: React.FC<{ data: WordPlacementPuzzleData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
);

export const PositionalAnagramSheet: React.FC<{ data: PositionalAnagramData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
);

export const ImageAnagramSortSheet: React.FC<{ data: ImageAnagramSortData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(data.cards || []).map((card, index) => (
                <div key={index} className="p-2 border rounded-lg flex flex-col items-center text-center bg-white dark:bg-zinc-700/50" style={{borderColor: 'var(--worksheet-border-color)'}}>
                    <ImageDisplay base64={card.imageBase64} description={card.imageDescription} className="w-24 h-24 mb-2"/>
                    <p className="font-mono tracking-widest text-lg">{card.scrambledWord}</p>
                    <div className="w-full h-8 mt-1 border-b-2 border-dotted border-zinc-400"></div>
                </div>
            ))}
        </div>
    </div>
);

export const AnagramImageMatchSheet: React.FC<{ data: AnagramImageMatchData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="mb-8 p-4 bg-amber-100 dark:bg-amber-900/50 border-2 border-dashed border-amber-400 rounded-lg">
            <h4 className="font-bold text-center mb-3 text-amber-800 dark:text-amber-200">Kelime Bankası</h4>
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2">
                {(data.wordBank || []).map((word, index) => (
                    <span key={index} className="text-lg">{word}</span>
                ))}
            </div>
        </div>
         <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {(data.puzzles || []).map((puzzle, index) => (
                <div key={index} className="flex flex-col items-center p-3 bg-white dark:bg-zinc-700/50 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)'}}>
                     <ImageDisplay base64={puzzle.imageBase64} description={puzzle.imageDescription} className="w-24 h-24 mb-2"/>
                     <p className="font-mono text-lg tracking-[0.2em]">{puzzle.partialAnswer}</p>
                </div>
            ))}
        </div>
    </div>
);
