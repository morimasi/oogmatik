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
import { GridComponent, ImageDisplay } from './common';

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

export const AnagramSheet: React.FC<{ data: AnagramsData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {(data.anagrams || []).map((item, index) => (
                <div key={index} className="flex flex-col items-center bg-white dark:bg-zinc-700/50 p-4 rounded-lg shadow-sm border" style={{borderColor: 'var(--worksheet-border-color)'}}>
                    <ImageDisplay base64={item.imageBase64} description={item.word} className="w-24 h-24 mb-3" />
                    <p className="font-mono text-xl tracking-widest mb-2">{item.scrambled.toUpperCase()}</p>
                    <div className="w-full h-8 bg-zinc-100 dark:bg-zinc-600 rounded-md border-b-2 border-zinc-400"></div>
                </div>
            ))}
        </div>
        <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
            <p className="font-semibold mb-2">{data.sentencePrompt}</p>
            <div className="w-full h-16 border-b-2 border-dotted border-zinc-400"></div>
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
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Ortadaki kutucuğa öyle bir harf yerleştirin ki, hem soldaki kelimenin sonuna hem de sağdaki kelimenin başına eklendiğinde iki yeni anlamlı kelime oluşsun.</p>
        <div className="space-y-6 max-w-md mx-auto">
            {(data.pairs || []).map((pair, index) => (
                <div key={index} className="flex items-center justify-center gap-2 text-xl font-semibold tracking-widest">
                    <span>{pair.word1.toUpperCase()}</span>
                    <div className="w-10 h-10 border-2 border-zinc-400 rounded-md"></div>
                    <span>{pair.word2.toUpperCase()}</span>
                </div>
            ))}
        </div>
        {data.followUpPrompt && (
            <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <p className="font-semibold mb-2">{data.followUpPrompt}</p>
                <div className="w-full h-12 border-b-2 border-dotted border-zinc-400"></div>
            </div>
        )}
    </div>
);

export const WordLadderSheet: React.FC<{ data: WordLadderData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">İlk kelimeden başlayarak her adımda bir harfi değiştirerek son kelimeye ulaşmaya çalışın.</p>
        {data.theme && <p className="text-center font-semibold text-indigo-600 dark:text-indigo-400 mb-4">Tema: {data.theme}</p>}
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
        {data.mysteryWordChallenge && (
            <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <p className="font-semibold text-center">{data.mysteryWordChallenge.prompt}</p>
                 <div className="flex justify-center gap-2 mt-2">
                    {Array.from({length: data.mysteryWordChallenge.solution.length}).map((_, i) => (
                        <div key={i} className="w-8 h-10 border-b-2 border-zinc-500"></div>
                    ))}
                </div>
            </div>
        )}
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
        {data.funFact && (
            <div className="mt-8 p-4 bg-sky-50 dark:bg-sky-900/30 rounded-lg">
                <p className="text-sm text-center text-sky-800 dark:text-sky-200"><i className="fa-solid fa-lightbulb mr-2"></i>{data.funFact}</p>
            </div>
        )}
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

export const SyllableCompletionSheet: React.FC<{ data: SyllableCompletionData }> = ({ data }) => {
    let storyContent: React.ReactNode = data.storyPrompt;
    if (data.storyTemplate) {
        const parts = data.storyTemplate.split('__WORD__');
        storyContent = (
            <p>
                {parts.map((part, index) => (
                    <React.Fragment key={index}>
                        {part}
                        {index < parts.length - 1 && <span className="inline-block w-24 h-6 border-b-2 border-dotted border-zinc-400 mx-1"></span>}
                    </React.Fragment>
                ))}
            </p>
        );
    }
    return (
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
              </div>
          ))}
      </div>
      <div>
          <h4 className="font-semibold text-center mb-2">Hikayeyi Tamamla</h4>
          <div className="p-4 bg-white dark:bg-zinc-700/30 rounded-lg">{storyContent}</div>
      </div>
    </div>
    )
};

export const SpiralPuzzleSheet: React.FC<{ data: SpiralPuzzleData | PunctuationSpiralPuzzleData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <p className="text-center font-semibold text-indigo-600 dark:text-indigo-400 mb-4">Tema: {data.theme}</p>
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
        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
            <p className="font-semibold mb-2">{data.passwordPrompt}</p>
            <div className="w-full h-8 border-b-2 border-dotted border-zinc-400"></div>
        </div>
    </div>
);

export const CrosswordSheet: React.FC<{ data: CrosswordData }> = ({ data }) => {
    const { title, prompt, grid, clues, passwordCells, passwordLength, theme, passwordPrompt } = data;
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
            <h3 className="text-2xl font-bold mb-2 text-center">{title}</h3>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-2">{prompt}</p>
            <p className="text-center font-semibold text-indigo-600 dark:text-indigo-400 mb-6">Tema: {theme}</p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                <div className="md:col-span-3">
                    <div
                        className="grid border-2 border-zinc-900 dark:border-zinc-500"
                        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, width: '100%', aspectRatio: '1 / 1' }}
                    >
                        {(grid || []).flat().map((cell, index) => {
                            const r = Math.floor(index / gridSize);
                            const c = index % gridSize;
                            const key = `${r}-${c}`;
                            const clueNumber = positionToNumberMap.get(key);
                            return (
                                <div key={key} className={`relative border ${cell === null ? 'bg-zinc-800 dark:bg-zinc-900' : 'bg-white dark:bg-zinc-700/50'} ${(passwordCells || []).some(p => p.row === r && p.col === c) ? 'bg-amber-100 dark:bg-amber-800/40' : ''}`} style={{ borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)' }}>
                                    {clueNumber && <sup className="absolute top-0 left-1 text-[0.6rem] font-bold text-zinc-500 dark:text-zinc-400">{clueNumber}</sup>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="md:col-span-2 text-sm">
                    <div>
                        <h4 className="font-bold text-lg mb-2 text-indigo-600 dark:text-indigo-400">Soldan Sağa</h4>
                        <ul className="space-y-2">
                            {(acrossClues || []).map(clue => (
                                <li key={`across-${clue.id}`} className="flex items-start">
                                    <strong className="mr-2">{clue.id}.</strong>
                                    {clue.imageBase64 ? <ImageDisplay base64={clue.imageBase64} description={clue.text} className="w-16 h-16 mr-2" /> : <span>{clue.text}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-6">
                         <h4 className="font-bold text-lg mb-2 text-violet-600 dark:text-violet-400">Yukarıdan Aşağıya</h4>
                        <ul className="space-y-2">
                            {(downClues || []).map(clue => (
                                <li key={`down-${clue.id}`} className="flex items-start">
                                    <strong className="mr-2">{clue.id}.</strong>
                                    {clue.imageBase64 ? <ImageDisplay base64={clue.imageBase64} description={clue.text} className="w-16 h-16 mr-2" /> : <span>{clue.text}</span>}
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
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-center">
                    <p className="font-semibold">{passwordPrompt}</p>
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
          <div key={index} className="p-4 border rounded-lg bg-white dark:bg-zinc-700/50" style={{borderColor: 'var(--worksheet-border-color)'}}>
            <h4 className="text-2xl font-bold text-center mb-4 capitalize">{item.word}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center">
                    <ImageDisplay base64={item.imageBase64_1} description={item.meaning1} className="w-40 h-40 mb-2" />
                    <p className="text-sm italic text-zinc-500 dark:text-zinc-400 mb-2">{item.meaning1}</p>
                    <div className="w-full h-12 border-b-2 border-dotted border-zinc-400"></div>
                </div>
                 <div className="flex flex-col items-center">
                    <ImageDisplay base64={item.imageBase64_2} description={item.meaning2} className="w-40 h-40 mb-2" />
                    <p className="text-sm italic text-zinc-500 dark:text-zinc-400 mb-2">{item.meaning2}</p>
                    <div className="w-full h-12 border-b-2 border-dotted border-zinc-400"></div>
                </div>
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
                         <span className="flex items-center justify-center w-8 h-8 bg-red-500 text-white font-bold rounded-full">{String.fromCharCode(64 + img.id)}</span>
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
                            {(puzzle.petalLetters || []).map((letter, i) => {
                                const angle = i * angleStep;
                                const petalPath = "M 0 -25 C 15 -25 15 -5 0 -5 C -15 -5 -15 -25 0 -25 Z";
                                return (
                                    <g key={i} transform={`rotate(${angle} 50 50) translate(0 15)`}>
                                        <path transform="translate(50 50)" d={petalPath} className="fill-yellow-300 dark:fill-yellow-700 stroke-yellow-500" strokeWidth="0.5" />
                                        <text x="50" y="32" textAnchor="middle" className="font-bold fill-current">{letter}</text>
                                    </g>
                                );
                            })}
                            <circle cx="50" cy="50" r="18" className="fill-orange-400 stroke-orange-600" strokeWidth="1" />
                            <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="font-bold text-xs fill-current">{puzzle.centerWord}</text>
                        </svg>
                        <div className="w-full h-8 border-b-2 border-dotted border-zinc-400"></div>
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
        <h3 className="text-xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center mb-6">{data.prompt}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white dark:bg-zinc-700/30 p-4 rounded-lg shadow-inner">
                <GridComponent grid={data.grid} />
            </div>
            <div className="space-y-4">
                 <div>
                    <h4 className="font-bold mb-2 text-indigo-600 dark:text-indigo-400">Eş Anlamlılar:</h4>
                    <ul className="list-disc list-inside">
                        {(data.synonyms || []).map((item, index) => <li key={index}>{item.word}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-2 text-rose-600 dark:text-rose-400">Zıt Anlamlılar:</h4>
                     <ul className="list-disc list-inside">
                        {(data.antonyms || []).map((item, index) => <li key={index}>{item.word}</li>)}
                    </ul>
                </div>
            </div>
        </div>
        {data.nuanceQuestion && (
            <div className="mt-8 p-4 bg-sky-50 dark:bg-sky-900/30 rounded-lg">
                <p className="font-semibold mb-2">{data.nuanceQuestion.sentence.replace('__', `_ _ _ _ _`)}</p>
                <p className="text-sm mb-2">Boşluğa hangi kelime daha uygun: <strong>{data.nuanceQuestion.options.join(' mi, ')} mı?</strong></p>
            </div>
        )}
    </div>
);

export const AntonymResfebeSheet: React.FC<{ data: AntonymResfebeData }> = ({ data }) => {
    return (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-2 gap-8">
            {(data.puzzles || []).map((puzzle, i) => (
                <div key={i} className="p-4 border rounded-lg bg-white dark:bg-zinc-700/50">
                    <div className="flex justify-center items-center gap-2 mb-4 h-24">
                        {(puzzle.clues || []).map((clue, j) => {
                            // FIX: Added type assertion to resolve 'unknown' type inference on `clue`.
                            const currentClue = clue as ResfebeClue;
                            if (currentClue.type === 'image') {
                                return <ImageDisplay key={j} base64={puzzle.imageBase64} description={currentClue.value} className="w-20 h-20" />;
                            }
                            return <span key={j} className="text-3xl font-bold">{currentClue.value}</span>;
                        })}
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Kelime:</span>
                        <div className="flex-1 h-8 border-b-2 border-zinc-400"></div>
                    </div>
                     <div className="flex items-center gap-2 mt-2">
                        <span>Zıt Anlamlısı:</span>
                        <div className="flex-1 h-8 border-b-2 border-zinc-400"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
    )
};

export const ResfebeSheet: React.FC<{ data: ResfebeData }> = ({ data }) => {
    return (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-2 gap-8">
            {(data.puzzles || []).map((puzzle, i) => (
                <div key={i} className="p-4 border rounded-lg bg-white dark:bg-zinc-700/50">
                    <div className="flex justify-center items-center gap-2 mb-4 h-24">
                        {(puzzle.clues || []).map((clue, j) => {
                            const currentClue = clue as ResfebeClue;
                            if (currentClue.type === 'image') {
                                return <ImageDisplay key={j} base64={currentClue.imageBase64} description={currentClue.value} className="w-20 h-20" />;
                            }
                            return <span key={j} className="text-3xl font-bold">{currentClue.value}</span>;
                        })}
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Cevap:</span>
                        <div className="flex-1 h-8 border-b-2 border-zinc-400"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
    )
};

// --- Fallback implementations for other sheets ---
const createSimpleSheet = (name: string) => ({ data }: { data: any }) => (
  <div><h3 className="text-xl font-bold mb-4 text-center">{data.title || name}</h3><p className="text-center">{data.prompt || `Bu etkinlik için hızlı modda içerik oluşturuldu.`}</p></div>
);

export const SynonymMatchingPatternSheet = createSimpleSheet('Desen Bulmaca (Eş Anlamlı)');
export const MissingPartsSheet = createSimpleSheet('Eksik Kelimeler');
export const WordWebSheet = createSimpleSheet('Kelime Ağı');
export const SyllableWordSearchSheet = createSimpleSheet('Hece ve Kelime Avı');
export const WordWebWithPasswordSheet = createSimpleSheet('Şifreli Kelime Ağı');
export const WordPlacementPuzzleSheet = createSimpleSheet('Kelime Yerleştirme');
export const PositionalAnagramSheet = createSimpleSheet('Yer Değiştirmeli Anagram');
export const ImageAnagramSortSheet = createSimpleSheet('Resimli Anagram Sıralama');
export const AnagramImageMatchSheet = createSimpleSheet('Anagram Resim Eşleştirme');
// ... other simple fallbacks if needed.