import React, { CSSProperties } from 'react';
import { 
    ActivityType, SingleWorksheetData, WordSearchData, AnagramData, MathPuzzleData, StoryData, 
    StroopTestData, NumberPatternData, SpellingCheckData, LetterGridTestData, NumberSearchData, 
    WordMemoryData, StoryCreationPromptData, FindTheDifferenceData, WordComparisonData, 
    WordsInStoryData, OddOneOutData, ShapeMatchingData, SymbolCipherData, ProverbFillData,
    LetterBridgeData, FindDuplicateData, ShapeType, WordLadderData, FindIdenticalWordData,
    WordFormationData, ReverseWordData, FindLetterPairData, WordGroupingData, VisualMemoryData, StoryAnalysisData,
    CoordinateCipherData, ProverbSearchData, TargetSearchData, ShapeNumberPatternData, GridDrawingData, ColorWheelMemoryData,
    ImageComprehensionData, CharacterMemoryData, StorySequencingData, ChaoticNumberSearchData, BlockPaintingData, MiniWordGridData,
    VisualOddOneOutData, ShapeCountingData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData,
    PasswordFinderData, SyllableCompletionData, SynonymWordSearchData, WordConnectData, SpiralPuzzleData, CrosswordData,
    JumbledWordStoryData, HomonymSentenceData, WordGridPuzzleData, ProverbSayingSortData, HomonymImageMatchData,
    AntonymFlowerPuzzleData, ProverbWordChainData, ThematicOddOneOutData, SynonymAntonymGridData, PunctuationColoringData,
    TargetNumberData, OperationSquareMultDivData, FutoshikiData, ShapeSudokuData, WeightConnectData, PunctuationMazeData, AntonymResfebeData, ThematicWordSearchColorData, ThematicOddOneOutSentenceData, ProverbSentenceFinderData, SynonymSearchAndStoryData, ColumnOddOneOutSentenceData, SynonymAntonymColoringData, PunctuationPhoneNumberData, PunctuationSpiralPuzzleData, ThematicJumbledWordStoryData, SynonymMatchingPatternData, NumberPyramidData, NumberCapsuleData, OddEvenSudokuData, RomanNumeralConnectData, RomanNumeralStarHuntData, RoundingConnectData, RomanNumeralMultiplicationData, ArithmeticConnectData, RomanArabicMatchConnectData, Sudoku6x6ShadedData, KendokuData, DivisionPyramidData, MultiplicationPyramidData, OperationSquareSubtractionData, OperationSquareFillInData, MultiplicationWheelData, ResfebeData, FutoshikiLengthData, MatchstickSymmetryData, WordWebData, StarHuntData, LengthConnectData, VisualNumberPatternData, MissingPartsData, ProfessionConnectData,
    VisualOddOneOutThemedData, LogicGridPuzzleData, ImageAnagramSortData, AnagramImageMatchData, SyllableWordSearchData, WordSearchWithPasswordData, WordWebWithPasswordData, LetterGridWordFindData, WordPlacementPuzzleData, PositionalAnagramData, CrosswordClue
} from '../types';
import Shape from './Shape';

interface WorksheetProps {
  activityType: ActivityType | null;
  data: SingleWorksheetData[] | null;
  styles: CSSProperties;
}

// Helper Components
const ImageDisplay: React.FC<{ base64?: string; description?: string; className?: string }> = ({ base64, description, className = "w-full h-32" }) => {
    if (base64) {
        return <img src={`data:image/png;base64,${base64}`} alt={description || 'Yapay zeka tarafından oluşturulan resim'} className={`${className} object-contain rounded-md bg-zinc-100 dark:bg-zinc-700`} />;
    }
    return (
        <div className={`bg-zinc-100 dark:bg-zinc-700 rounded-md flex flex-col items-center justify-center text-center p-2 ${className}`}>
            <i className="fa-solid fa-image text-3xl text-zinc-400 dark:text-zinc-500"></i>
            {description && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">{description}</p>}
            {!description && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Resim Alanı</p>}
        </div>
    );
};

const GridComponent: React.FC<{ grid: (string | number | null)[][]; passwordCells?: {row: number; col: number}[]; cellClassName?: string, passwordColumnIndex?: number, showLetters?: boolean }> = ({ grid, passwordCells, cellClassName = 'w-10 h-10', passwordColumnIndex, showLetters = true }) => (
    <table className="table-fixed w-full border-collapse">
        <tbody>
            {(grid || []).map((row, rowIndex) => (
            <tr key={rowIndex}>
                {(row || []).map((cell, cellIndex) => {
                    const isPasswordCell = passwordCells?.some(p => p.row === rowIndex && p.col === cellIndex) || passwordColumnIndex === cellIndex;
                    const isBlackCell = cell === null;
                    return (
                        <td key={cellIndex} className={`border text-center font-mono text-lg ${cellClassName} ${isPasswordCell ? 'bg-amber-200 dark:bg-amber-800' : ''} ${isBlackCell ? 'bg-zinc-800 dark:bg-zinc-900' : 'bg-white dark:bg-zinc-700/50'}`} style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                            {showLetters ? (typeof cell === 'string' ? cell.toUpperCase() : cell) : ''}
                        </td>
                    )
                })}
            </tr>
            ))}
        </tbody>
    </table>
);

// Worksheet Components

const WordSearchGrid: React.FC<{ data: WordSearchData | WordSearchWithPasswordData | ProverbSearchData | LetterGridWordFindData | ThematicWordSearchColorData }> = ({ data }) => {
    const isWithPassword = 'passwordCells' in data && !!data.passwordCells;
    const gridData = (data as any).grid as string[][];
    let wordsData: string[] = [];
    if ('words' in data && data.words) {
      wordsData = data.words;
    } else if ('proverb' in data && data.proverb) {
      wordsData = [data.proverb];
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

const SynonymSearchAndStorySheet: React.FC<{ data: SynonymSearchAndStoryData }> = ({ data }) => {
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

const SynonymWordSearchSheet: React.FC<{ data: SynonymWordSearchData }> = ({ data }) => {
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

const AnagramList: React.FC<{ data: AnagramData[] }> = ({ data }) => (
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

const MathPuzzleSheet: React.FC<{ data: MathPuzzleData }> = ({ data }) => (
  <div>
    <h3 className="text-xl font-bold mb-6 text-center">{data.title}</h3>
    <div className="space-y-8">
      {(data.puzzles || []).map((puzzle, index) => (
        <div key={index} className="flex flex-col md:flex-row items-center gap-4 p-4 border rounded-lg bg-white dark:bg-zinc-700/50" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
           <span className="text-2xl font-bold text-indigo-500">{index + 1}.</span>
           <div className="flex-1">
             <p className="text-lg font-mono">{puzzle.problem}</p>
             <p className="text-md text-zinc-600 dark:text-zinc-400 mt-1">{puzzle.question}</p>
           </div>
           <div className="flex items-center gap-2">
                <span className="font-semibold">Cevap:</span>
                <div className="w-24 h-10 border-b-2 border-zinc-400"></div>
           </div>
        </div>
      ))}
    </div>
  </div>
);

const StoryComprehensionSheet: React.FC<{ data: StoryData }> = ({ data }) => (
  <div>
    <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
    <div className="bg-white dark:bg-zinc-700/30 p-6 rounded-lg shadow-inner mb-8">
        <p className="text-base leading-relaxed whitespace-pre-line">{data.story}</p>
    </div>
    
    <h4 className="text-xl font-semibold mb-4 text-center">Sorular</h4>
    <div className="space-y-6">
        {(data.questions || []).map((q, index) => (
            <div key={index}>
                <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
                <div className="space-y-2">
                    {(q.options || []).map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center">
                            <div className="w-5 h-5 border-2 border-zinc-400 rounded-full mr-3"></div>
                            <label>{option}</label>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
  </div>
);

const StroopTestSheet: React.FC<{ data: StroopTestData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Aşağıdaki kelimelerin hangi renkte yazıldığını söylemeye çalışın, kelimenin kendisini okumayın.</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 text-center">
            {(data.items || []).map((item, index) => (
                <div key={index} className="p-4 rounded-lg bg-white dark:bg-zinc-700/50 shadow-sm">
                    <p className="text-2xl font-extrabold" style={{ color: item.color }}>
                        {item.text}
                    </p>
                </div>
            ))}
        </div>
    </div>
);

const NumberPatternSheet: React.FC<{ data: NumberPatternData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-6 text-center">{data.title}</h3>
        <div className="space-y-6 max-w-lg mx-auto">
            {(data.patterns || []).map((p, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-white dark:bg-zinc-700/50" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    <span className="text-lg font-bold text-violet-500">{index + 1}.</span>
                    <p className="flex-1 text-xl font-mono tracking-wider text-center">{p.sequence}</p>
                    <div className="w-20 h-10 border-b-2 border-zinc-400"></div>
                </div>
            ))}
        </div>
    </div>
);

const SpellingCheckSheet: React.FC<{ data: SpellingCheckData }> = ({ data }) => (
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

const LetterGridTestSheet: React.FC<{ data: LetterGridTestData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center mb-4">Aşağıdaki tabloda <strong className="text-indigo-500">{(data.targetLetters || []).join(', ')}</strong> harflerini bulun ve daire içine alın.</p>
        <div className="bg-white dark:bg-zinc-700/30 p-4 rounded-lg shadow-inner">
            <table className="table-fixed w-full">
                <tbody>
                    {(data.grid || []).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {(row || []).map((cell, cellIndex) => (
                                <td key={cellIndex} className="border border-zinc-300 dark:border-zinc-600 text-center font-mono text-xs w-5 h-5" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
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

const BurdonTestSheet: React.FC<{ data: LetterGridTestData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">BURDON DİKKAT TESTİ</h3>
        <div className="mb-4 border-2 p-4 rounded-lg grid grid-cols-2 gap-4" style={{borderColor: 'var(--worksheet-border-color)'}}>
            <div><label className="block text-sm font-semibold">Adı, Soyadı:</label><div className="h-6 mt-1 border-b-2 border-dotted"></div></div>
            <div><label className="block text-sm font-semibold">Bitiş Süresi:</label><div className="h-6 mt-1 border-b-2 border-dotted"></div></div>
            <div><label className="block text-sm font-semibold">Yaşı:</label><div className="h-6 mt-1 border-b-2 border-dotted"></div></div>
            <div><label className="block text-sm font-semibold">Yanlış Çizilen Harf Sayısı:</label><div className="h-6 mt-1 border-b-2 border-dotted"></div></div>
        </div>
        <p className="text-center mb-4">Aşağıdaki satırlarda <strong className="text-indigo-500">{(data.targetLetters || []).join(', ')}</strong> harflerini bulup yuvarlak içine alalım.</p>
        <div className="bg-white dark:bg-zinc-700/30 p-4 rounded-lg shadow-inner">
            <table className="table-fixed w-full">
                <tbody>
                    {(data.grid || []).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {(row || []).map((cell, cellIndex) => (
                                <td key={cellIndex} className="border border-zinc-300 dark:border-zinc-600 text-center font-mono text-xs w-5 h-5" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
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

const NumberSearchSheet: React.FC<{ data: NumberSearchData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center mb-6">Aşağıdaki sayılar arasından <strong className="text-indigo-500">{data.range?.start}</strong>'den <strong className="text-indigo-500">{data.range?.end}</strong>'e kadar olan sayıları sırasıyla bulun ve işaretleyin.</p>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-x-2 gap-y-4 text-center p-4 bg-white dark:bg-zinc-700/50 rounded-lg">
            {(data.numbers || []).map((num, index) => (
                <span key={index} className="font-mono text-lg">{num}</span>
            ))}
        </div>
    </div>
);

const WordMemorySheet: React.FC<{ data: WordMemoryData }> = ({ data }) => (
    <div>
        <div className="page">
            <h3 className="text-2xl font-bold mb-4 text-center">{data.memorizeTitle}</h3>
            <p className="text-center mb-6 text-zinc-600 dark:text-zinc-400">Bu kelimelere bir süre dikkatlice bakın ve ezberlemeye çalışın.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                {(data.wordsToMemorize || []).map((word, index) => (
                    <div key={index} className="p-4 bg-amber-100 dark:bg-amber-800/50 border-l-4 border-amber-500 rounded text-center">
                        <p className="text-lg font-semibold">{word}</p>
                    </div>
                ))}
            </div>
        </div>

        <div className="page-break"></div>

        <div className="page">
            <h3 className="text-2xl font-bold mb-4 text-center">{data.testTitle}</h3>
            <p className="text-center mb-6 text-zinc-600 dark:text-zinc-400">Bir önceki sayfada gördüğünüz kelimeleri bu listeden bulup işaretleyin.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(data.testWords || []).map((word, index) => (
                    <div key={index} className="flex items-center bg-white dark:bg-zinc-700/50 p-3 rounded-lg">
                        <div className="w-5 h-5 border-2 border-zinc-400 rounded-md mr-3 shrink-0"></div>
                        <label className="text-md">{word}</label>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const StoryCreationPromptSheet: React.FC<{ data: StoryCreationPromptData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center mb-6 text-zinc-600 dark:text-zinc-400">{data.prompt}</p>
        <div className="text-center mb-8">
            <h4 className="font-semibold mb-2">Anahtar Kelimeler:</h4>
            <div className="flex justify-center flex-wrap gap-3">
                {(data.keywords || []).map((word, index) => (
                    <span key={index} className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 rounded-full font-medium">{word}</span>
                ))}
            </div>
        </div>
        <div className="bg-white dark:bg-zinc-700/30 p-4 rounded-lg">
            <div className="w-full h-80 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-md" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}></div>
        </div>
    </div>
);

const FindTheDifferenceSheet: React.FC<{ data: FindTheDifferenceData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Her satırda diğerlerinden farklı olan kelimeyi bulup işaretleyin.</p>
        <div className="space-y-4 max-w-2xl mx-auto">
            {(data.rows || []).map((row, index) => (
                <div key={index} className="flex items-center justify-around p-4 border rounded-lg bg-white dark:bg-zinc-700/50" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    {(row.items || []).map((item, itemIndex) => (
                         <div key={itemIndex} className="flex items-center gap-2">
                             <div className="w-6 h-6 border-2 border-zinc-400 rounded-full shrink-0"></div>
                             <span className="text-lg capitalize">{item}</span>
                         </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

const WordComparisonSheet: React.FC<{ data: WordComparisonData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Her iki kutucukta da bulunmayan kelimeleri aşağıdaki boş alana yazın.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="p-4 border-4 border-dashed border-sky-300 rounded-lg">
                <h4 className="text-lg font-bold mb-2 text-center text-sky-700 dark:text-sky-300">{data.box1Title}</h4>
                <ul className="space-y-1 text-center">
                    {(data.wordList1 || []).map((word, i) => <li key={i} className="capitalize">{word}</li>)}
                </ul>
            </div>
            <div className="p-4 border-4 border-dashed border-rose-300 rounded-lg">
                <h4 className="text-lg font-bold mb-2 text-center text-rose-700 dark:text-rose-300">{data.box2Title}</h4>
                <ul className="space-y-1 text-center">
                     {(data.wordList2 || []).map((word, i) => <li key={i} className="capitalize">{word}</li>)}
                </ul>
            </div>
        </div>
        <div>
             <h4 className="font-semibold mb-2">Farklı Kelimeler:</h4>
             <div className="w-full h-40 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-md p-2" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}></div>
        </div>
    </div>
);

const WordsInStorySheet: React.FC<{ data: WordsInStoryData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <div className="bg-white dark:bg-zinc-700/30 p-6 rounded-lg shadow-inner mb-8">
            <p className="text-base leading-relaxed whitespace-pre-line">{data.story}</p>
        </div>
        <h4 className="text-xl font-semibold mb-4 text-center">Aşağıdaki kelimelerden hangileri metinde <strong className="text-red-500">GEÇMEMEKTEDİR</strong>? İşaretleyiniz.</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(data.wordList || []).map((item, index) => (
                 <div key={index} className="flex items-center bg-white dark:bg-zinc-700/50 p-3 rounded-lg">
                    <div className="w-5 h-5 border-2 border-zinc-400 rounded-md mr-3 shrink-0"></div>
                    <label className="text-md capitalize">{item.word}</label>
                </div>
            ))}
        </div>
    </div>
);

const OddOneOutSheet: React.FC<{ data: OddOneOutData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Aşağıdaki her grupta, anlamsal olarak diğerlerinden farklı olan kelimeyi bulup işaretleyin.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(data.groups || []).map((group, index) => (
                <div key={index} className="p-4 border rounded-lg bg-white dark:bg-zinc-700/50" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    <div className="space-y-3">
                        {(group.words || []).map((word, wordIndex) => (
                            <div key={wordIndex} className="flex items-center">
                                <div className="w-6 h-6 border-2 border-zinc-400 rounded-full mr-4"></div>
                                <span className="text-lg capitalize">{word}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ShapeDisplay: React.FC<{ shapes: ShapeType[] }> = ({ shapes }) => (
    <div className="flex items-center justify-center gap-2">
        {(shapes || []).map((shape, i) => <Shape key={i} name={shape} className="w-8 h-8 text-zinc-700 dark:text-zinc-300" />)}
    </div>
);

const ShapeMatchingSheet: React.FC<{ data: ShapeMatchingData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Soldaki şekil gruplarını sağdaki eşleriyle eşleştirin.</p>
        <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-x-16 gap-y-4">
                {/* Left Column */}
                <div className="space-y-4">
                    {(data.leftColumn || []).map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-2 border-2 border-blue-300 rounded-lg bg-blue-50 dark:bg-zinc-700/50">
                            <span className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white font-bold rounded-full">{item.id}</span>
                            <ShapeDisplay shapes={item.shapes} />
                        </div>
                    ))}
                </div>
                {/* Right Column */}
                <div className="space-y-4">
                    {(data.rightColumn || []).map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-2 border-2 border-red-300 rounded-lg bg-red-50 dark:bg-zinc-700/50">
                            <span className="flex items-center justify-center w-8 h-8 bg-red-500 text-white font-bold rounded-full">{item.id}</span>
                            <ShapeDisplay shapes={item.shapes} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const SymbolCipherSheet: React.FC<{ data: SymbolCipherData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Aşağıdaki anahtarı kullanarak şekillerle yazılmış kelimeleri çözün.</p>
        {/* Key */}
        <div className="flex justify-center items-center gap-4 flex-wrap p-4 bg-amber-100 dark:bg-zinc-700/50 rounded-lg mb-8 border-2 border-dashed border-amber-400">
            {(data.cipherKey || []).map(keyItem => (
                <div key={keyItem.letter} className="flex items-center gap-2">
                    <Shape name={keyItem.shape} className="w-8 h-8" />
                    <span className="font-bold text-xl">=</span>
                    <span className="font-bold text-xl">{keyItem.letter.toUpperCase()}</span>
                </div>
            ))}
        </div>
        {/* Words to solve */}
        <div className="space-y-6 max-w-lg mx-auto">
            {(data.wordsToSolve || []).map((word, index) => (
                <div key={index} className="flex items-center gap-4">
                    <div className="flex-1 p-2 rounded-lg bg-white dark:bg-zinc-700/50">
                        <ShapeDisplay shapes={word.shapeSequence} />
                    </div>
                    <i className="fa-solid fa-arrow-right text-2xl text-zinc-400"></i>
                    <div className="flex-1 flex justify-center gap-1">
                        {Array.from({ length: word.wordLength }).map((_, i) => (
                            <div key={i} className="w-10 h-12 border-b-2 border-zinc-500"></div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ProverbFillSheet: React.FC<{ data: ProverbFillData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Aşağıdaki atasözlerinde boş bırakılan yerleri doğru kelimelerle doldurun.</p>
        <div className="space-y-6 max-w-2xl mx-auto">
            {(data.proverbs || []).map((proverb, index) => (
                <div key={index} className="flex items-center text-lg">
                    <span>{index + 1}.</span>
                    <p className="ml-2">{proverb.start}</p>
                    <div className="w-32 h-8 mx-2 border-b-2 border-dotted border-zinc-500"></div>
                    <p>{proverb.end}</p>
                </div>
            ))}
        </div>
    </div>
);

const LetterBridgeSheet: React.FC<{ data: LetterBridgeData }> = ({ data }) => (
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

const FindDuplicateSheet: React.FC<{ data: FindDuplicateData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Aşağıdaki her satırda, iki defa yazılmış olan harf veya rakamı bulup daire içine alın.</p>
        <div className="p-4 bg-white dark:bg-zinc-700/30 rounded-lg shadow-inner">
            <table className="w-full">
                <tbody>
                {(data.rows || []).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {(row || []).map((char, charIndex) => (
                            <td key={charIndex} className="text-center font-mono text-xl p-2">
                                {char}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    </div>
);

const WordLadderSheet: React.FC<{ data: WordLadderData }> = ({ data }) => (
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

const FindIdenticalWordSheet: React.FC<{ data: FindIdenticalWordData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Aşağıdaki her grupta birbirinin aynısı olan kelime çiftini bulup işaretleyin.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(data.groups || []).map((group, index) => (
                <div key={index} className="flex items-center p-3 bg-white dark:bg-zinc-700/50 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    <div className="w-6 h-6 border-2 border-zinc-400 rounded-full mr-4 shrink-0"></div>
                    <div className="flex flex-col">
                        <span className="text-lg">{group.words?.[0]}</span>
                        <span className="text-lg">{group.words?.[1]}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const WordFormationSheet: React.FC<{ data: WordFormationData }> = ({ data }) => (
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

const ReverseWordSheet: React.FC<{ data: ReverseWordData }> = ({ data }) => (
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

const FindLetterPairSheet: React.FC<{ data: FindLetterPairData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center mb-4">Aşağıdaki tabloda <strong className="text-indigo-500">"{data.targetPair}"</strong> harf ikilisini bulun ve daire içine alın.</p>
        <div className="bg-white dark:bg-zinc-700/30 p-4 rounded-lg shadow-inner">
            <table className="table-fixed w-full">
                <tbody>
                    {(data.grid || []).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {(row || []).map((cell, cellIndex) => (
                                <td key={cellIndex} className="border border-zinc-300 dark:border-zinc-600 text-center font-mono text-lg w-8 h-8 md:w-10 md:h-10" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
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

const WordGroupingSheet: React.FC<{ data: WordGroupingData }> = ({ data }) => (
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

const VisualMemorySheet: React.FC<{ data: VisualMemoryData }> = ({ data }) => (
    <div>
        <div className="page">
            <h3 className="text-2xl font-bold mb-4 text-center">{data.memorizeTitle}</h3>
            <p className="text-center mb-6 text-zinc-600 dark:text-zinc-400">Bu görsellere bir süre dikkatlice bakın ve ezberlemeye çalışın.</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
                {(data.itemsToMemorize || []).map((item, index) => (
                    <div key={index} className="p-4 bg-amber-100 dark:bg-amber-800/50 border-l-4 border-amber-500 rounded text-center flex flex-col items-center justify-center aspect-square">
                        <p className="text-4xl sm:text-5xl">{item.split(' ').pop()}</p>
                        <p className="text-sm font-semibold mt-2">{item.split(' ')[0]}</p>
                    </div>
                ))}
            </div>
        </div>
        <div className="page-break"></div>
        <div className="page">
            <h3 className="text-2xl font-bold mb-4 text-center">{data.testTitle}</h3>
            <p className="text-center mb-6 text-zinc-600 dark:text-zinc-400">Bir önceki sayfada gördüğünüz görselleri bu listeden bulup işaretleyin.</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {(data.testItems || []).map((item, index) => (
                    <div key={index} className="flex flex-col items-center justify-center text-center bg-white dark:bg-zinc-700/50 p-3 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                        <div className="w-6 h-6 border-2 border-zinc-400 rounded-full mb-3 shrink-0"></div>
                        <p className="text-4xl sm:text-5xl">{item.split(' ').pop()}</p>
                        <label className="text-xs mt-1">{item.split(' ')[0]}</label>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const StoryAnalysisSheet: React.FC<{ data: StoryAnalysisData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <div className="bg-white dark:bg-zinc-700/30 p-6 rounded-lg shadow-inner mb-8">
            <p className="text-base leading-relaxed whitespace-pre-line">{data.story}</p>
        </div>
        <h4 className="text-xl font-semibold mb-4 text-center">Sorular</h4>
        <div className="space-y-6">
            {(data.questions || []).map((q, index) => (
                <div key={index} className="p-4 bg-white dark:bg-zinc-700/50 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3 italic">İpucu: "{q.context}"</p>
                    <div className="w-full h-8 border-b-2 border-dotted border-zinc-400"></div>
                </div>
            ))}
        </div>
    </div>
);

const CoordinateCipherSheet: React.FC<{ data: CoordinateCipherData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Aşağıdaki kelimeleri bulmacada bulun. Sonra, şifre kutucuklarında verilen koordinatlardaki harfleri birleştirerek gizemli kelimeyi çözün.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white dark:bg-zinc-700/30 p-2 rounded-lg shadow-inner">
                <table className="table-fixed w-full">
                    <thead>
                        <tr>
                            <th className="w-6 h-6"></th>
                            {(data.grid?.[0] || []).map((_, colIndex) => (
                                <th key={colIndex} className="font-mono text-center">{colIndex + 1}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(data.grid || []).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <th className="font-mono text-center">{String.fromCharCode(65 + rowIndex)}</th>
                            {(row || []).map((cell, cellIndex) => (
                            <td key={cellIndex} className="border border-zinc-300 dark:border-zinc-600 text-center font-mono text-lg w-8 h-8" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                                {cell.toUpperCase()}
                            </td>
                            ))}
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div>
                <h4 className="font-bold mb-2 text-indigo-600 dark:text-indigo-400">Aranacak Kelimeler:</h4>
                <ul className="list-disc list-inside space-y-1">
                {(data.wordsToFind || []).map((word, index) => (
                    <li key={index} className="capitalize">{word}</li>
                ))}
                </ul>
            </div>
        </div>

        <div className="mt-8">
            <h4 className="font-bold mb-4 text-center text-xl">ŞİFRE</h4>
            <div className="flex justify-center flex-wrap gap-3">
                {(data.cipherCoordinates || []).map((coord, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <div className="w-12 h-12 border-b-2 border-zinc-500"></div>
                        <div className="px-2 py-1 bg-zinc-200 dark:bg-zinc-600 text-xs font-mono rounded-b-md">{coord}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const ProverbSearchSheet: React.FC<{ data: ProverbSearchData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Aşağıdaki tabloda gizlenmiş olan atasözünü bulun ve altındaki boşluğa yazın.</p>
        <div className="max-w-md mx-auto bg-white dark:bg-zinc-700/30 p-4 rounded-lg shadow-inner">
            <GridComponent grid={data.grid} />
        </div>
        <div className="mt-8">
            <h4 className="font-bold mb-2 text-center text-xl">Atasözü:</h4>
            <div className="w-full h-12 bg-zinc-100 dark:bg-zinc-700/50 border-b-2 border-zinc-400 rounded-t-lg"></div>
        </div>
    </div>
);

const TargetSearchSheet: React.FC<{ data: TargetSearchData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center mb-6">Aşağıdaki tabloda <strong className="text-indigo-500">{data.distractor}</strong>'ların arasında kaç tane <strong className="text-red-500">{data.target}</strong> olduğunu bulun.</p>
        <div className="bg-white dark:bg-zinc-700/30 p-4 rounded-lg shadow-inner max-w-xl mx-auto">
            <table className="table-fixed w-full">
                <tbody>
                    {(data.grid || []).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {(row || []).map((cell, cellIndex) => (
                                <td key={cellIndex} className="text-center font-mono text-xl p-1" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="mt-8 flex justify-center items-center gap-4">
            <h4 className="font-bold text-xl">Toplam {data.target} Sayısı:</h4>
            <div className="w-24 h-16 border-2 border-zinc-400 rounded-lg"></div>
        </div>
    </div>
);

const ShapeNumberPatternSheet: React.FC<{ data: ShapeNumberPatternData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8">Aşağıdaki şekillerde sayılar belirli bir kurala göre yerleştirilmiştir. Bu kuralı bularak soru işareti (?) olan yere hangi sayının gelmesi gerektiğini bulun.</p>
        <div className="space-y-12">
            {(data.patterns || []).map((pattern, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center justify-center gap-8">
                    {(pattern.shapes || []).map((shape, shapeIndex) => (
                        <div key={shapeIndex} className="relative w-40 h-40">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="50,5 95,95 5,95" />
                            </svg>
                            {(shape.numbers || []).length === 4 ? ( // 3 corners + center
                                <>
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-xl">{shape.numbers[0]}</span>
                                    <span className="absolute bottom-4 left-4 font-bold text-xl">{shape.numbers[1]}</span>
                                    <span className="absolute bottom-4 right-4 font-bold text-xl">{shape.numbers[2]}</span>
                                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-2xl text-indigo-600 dark:text-indigo-400">{shape.numbers[3]}</span>
                                </>
                            ) : ( // 3 corners
                                <>
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-xl">{(shape.numbers || [])[0]}</span>
                                    <span className="absolute bottom-4 left-4 font-bold text-xl">{(shape.numbers || [])[1]}</span>
                                    <span className="absolute bottom-4 right-4 font-bold text-xl">{(shape.numbers || [])[2]}</span>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

const GridDrawingSheet: React.FC<{ data: GridDrawingData }> = ({ data }) => {
    const gridDim = data.gridDim;
    const cellSize = 40;
    const totalSize = gridDim * cellSize;

    const renderGrid = (lines: [number, number][][] | null) => (
        <svg width={totalSize} height={totalSize} className="bg-amber-50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600">
            {/* Grid lines */}
            {Array.from({ length: gridDim + 1 }).map((_, i) => (
                <g key={i}>
                    <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
                    <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
                </g>
            ))}
            {/* Pattern lines */}
            {(lines || []).map((line, index) => (
                <line
                    key={index}
                    x1={line[0][0] * cellSize}
                    y1={line[0][1] * cellSize}
                    x2={line[1][0] * cellSize}
                    y2={line[1][1] * cellSize}
                    className="stroke-red-500"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
            ))}
        </svg>
    );

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Soldaki görsellerin aynısını sağ taraftaki alana çizin.</p>
            <div className="space-y-8">
                {(data.drawings || []).map((drawing, index) => (
                    <div key={index} className="grid grid-cols-2 gap-8 items-center justify-items-center">
                        {renderGrid(drawing.lines)}
                        {renderGrid(null)}
                    </div>
                ))}
            </div>
        </div>
    );
};

const ColorWheelSheet: React.FC<{ data: ColorWheelMemoryData }> = ({ data }) => {
    const items = data.items || [];
    const numItems = items.length;
    const angleStep = 360 / numItems;

    const getCoords = (angle: number, radius: number) => [
        50 + radius * Math.cos(angle * Math.PI / 180),
        50 + radius * Math.sin(angle * Math.PI / 180)
    ];

    const renderWheel = (showItems: boolean) => (
        <svg viewBox="0 0 100 100" className="w-full h-full max-w-lg mx-auto">
            <circle cx="50" cy="50" r="48" stroke="var(--worksheet-border-color)" strokeWidth="1" fill="none" />
            {(items || []).map((item, index) => {
                const startAngle = index * angleStep - 90;
                const endAngle = (index + 1) * angleStep - 90;
                const midAngle = startAngle + angleStep / 2;

                const [startX, startY] = getCoords(startAngle, 48);
                const [endX, endY] = getCoords(endAngle, 48);
                const largeArcFlag = angleStep <= 180 ? "0" : "1";
                const pathData = `M 50,50 L ${startX},${startY} A 48,48 0 ${largeArcFlag},1 ${endX},${endY} Z`;
                
                const [textX, textY] = getCoords(midAngle, 28);

                return (
                    <g key={index}>
                        <path d={pathData} fill={item.color} stroke="#fff" strokeWidth="0.5" />
                        {showItems && (
                            <text x={textX} y={textY} textAnchor="middle" dominantBaseline="middle" fontSize="6" className="font-bold">
                                {item.name}
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );

    return (
        <div>
            <div className="page">
                <h3 className="text-2xl font-bold mb-4 text-center">{data.memorizeTitle}</h3>
                <p className="text-center mb-6 text-zinc-600 dark:text-zinc-400">Aşağıdaki renk çarkına ve görsellere dikkatlice bakın. Sonra sayfayı çevirip görselleri renk çarkına yerleştirin.</p>
                {renderWheel(true)}
            </div>

            <div className="page-break"></div>

            <div className="page">
                <h3 className="text-2xl font-bold mb-4 text-center">{data.testTitle}</h3>
                <p className="text-center mb-6 text-zinc-600 dark:text-zinc-400">Görselleri ok işaretiyle yerlerine götürün.</p>
                <div className="flex justify-center items-center gap-4 flex-wrap mb-8">
                    {(items || []).map((item, index) => (
                        <div key={index} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)'}}>
                            <span className="text-lg font-semibold">{item.name}</span>
                        </div>
                    ))}
                </div>
                {renderWheel(false)}
            </div>
        </div>
    );
};

const ImageComprehensionSheet: React.FC<{ data: ImageComprehensionData }> = ({ data }) => (
    <div>
        <div className="page">
            <h3 className="text-2xl font-bold mb-4 text-center">{data.memorizeTitle}</h3>
            <p className="text-center mb-6 text-zinc-600 dark:text-zinc-400">Aşağıdaki resmi ve metni dikkatlice inceleyin. Sonraki sayfada bu sahneyle ilgili sorular olacak.</p>
            <div className="my-6 flex justify-center">
                <ImageDisplay base64={data.imageBase64} description={data.sceneDescription} className="w-full h-80" />
            </div>
            <div className="bg-amber-50 dark:bg-zinc-700/50 p-6 rounded-lg border-l-4 border-amber-400">
                <p className="text-base leading-relaxed whitespace-pre-line italic">{data.sceneDescription}</p>
            </div>
        </div>

        <div className="page-break"></div>

        <div className="page">
            <h3 className="text-2xl font-bold mb-4 text-center">{data.testTitle}</h3>
            <p className="text-center mb-6 text-zinc-600 dark:text-zinc-400">İncelediğiniz sahneyle ilgili aşağıdaki soruları yanıtlayın.</p>
            <div className="space-y-6">
                {(data.questions || []).map((q, index) => (
                    <div key={index} className="p-4 bg-white dark:bg-zinc-700/50 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                        <p className="font-semibold mb-2">{index + 1}. {q}</p>
                        <div className="w-full h-8 border-b-2 border-dotted border-zinc-400"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const CharacterMemorySheet: React.FC<{ data: CharacterMemoryData }> = ({ data }) => (
    <div>
      <div className="page">
        <h3 className="text-2xl font-bold mb-4 text-center">{data.memorizeTitle}</h3>
        <p className="text-center mb-6 text-zinc-600 dark:text-zinc-400">Bu karakterlere dikkatlice bakın ve ezberlemeye çalışın.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(data.charactersToMemorize || []).map((char, index) => (
            <div key={index} className="p-4 bg-amber-100 dark:bg-amber-800/50 border-l-4 border-amber-500 rounded text-center">
              <ImageDisplay base64={char.imageBase64} description={char.description} className="w-24 h-24 mx-auto mb-2" />
              <p className="text-sm font-semibold">{char.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="page-break"></div>
      <div className="page">
        <h3 className="text-2xl font-bold mb-4 text-center">{data.testTitle}</h3>
        <p className="text-center mb-6 text-zinc-600 dark:text-zinc-400">Bir önceki sayfada gördüğünüz karakterleri bu listeden bulup işaretleyin.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(data.testCharacters || []).map((char, index) => (
            <div key={index} className="flex flex-col items-center bg-white dark:bg-zinc-700/50 p-3 rounded-lg">
              <div className="w-5 h-5 border-2 border-zinc-400 rounded-md mb-2 shrink-0"></div>
              <ImageDisplay base64={char.imageBase64} description={char.description} className="w-24 h-24 mx-auto mb-2" />
              <label className="text-xs text-center">{char.description}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
);

const StorySequencingSheet: React.FC<{ data: StorySequencingData }> = ({ data }) => (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
      <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
      <div className="grid grid-cols-2 gap-4">
        {(data.panels || []).map((panel) => (
          <div key={panel.id} className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center text-center" style={{borderColor: 'var(--worksheet-border-color)'}}>
            <div className="w-12 h-12 border-2 rounded-full flex items-center justify-center font-bold text-2xl mb-4">{panel.id}</div>
             <ImageDisplay description={panel.description} className="w-full h-24" />
          </div>
        ))}
      </div>
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-center mb-4">Doğru Sıralama:</h4>
        <div className="flex justify-center gap-4">
          {Array.from({ length: (data.panels || []).length || 0 }).map((_, index) => (
            <div key={index} className="w-16 h-16 border-2 border-zinc-400 rounded-lg flex items-center justify-center text-xl font-bold">{index + 1}.</div>
          ))}
        </div>
      </div>
    </div>
);

const ChaoticNumberSearchSheet: React.FC<{ data: ChaoticNumberSearchData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center mb-6">{data.prompt}</p>
        <div className="relative w-full h-[600px] bg-white dark:bg-zinc-700/30 rounded-lg shadow-inner overflow-hidden border" style={{borderColor: 'var(--worksheet-border-color)'}}>
            {(data.numbers || []).map((num, index) => (
                <span
                    key={index}
                    className="absolute font-bold"
                    style={{
                        left: `${num.x}%`,
                        top: `${num.y}%`,
                        fontSize: `${num.size}rem`,
                        transform: `rotate(${num.rotation}deg)`,
                        color: num.color,
                    }}
                >
                    {num.value}
                </span>
            ))}
        </div>
    </div>
);

const BlockPaintingSheet: React.FC<{ data: BlockPaintingData }> = ({ data }) => {
    const { grid: { rows, cols }, shapes } = data;
    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center mb-6">{data.prompt}</p>
            <div className="flex gap-8 justify-center">
                <div>
                    <h4 className="font-semibold text-center mb-2">Desen</h4>
                    <div className={`grid gap-px bg-zinc-300 dark:bg-zinc-600`} style={{gridTemplateColumns: `repeat(${cols}, 25px)`}}>
                        {Array.from({length: rows * cols}).map((_, i) => (
                            <div key={i} className="w-[25px] h-[25px] bg-white dark:bg-zinc-800"></div>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-center mb-2">Bloklar</h4>
                    <div className="space-y-4">
                        {(shapes || []).map((shape, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className={`grid gap-px`} style={{gridTemplateColumns: `repeat(${(shape.pattern || [[]])[0].length}, 15px)`}}>
                                    {(shape.pattern || []).flat().map((cell, j) => (
                                        <div key={j} className="w-[15px] h-[15px]" style={{backgroundColor: cell ? shape.color : 'transparent'}}></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
};

const MiniWordGridSheet: React.FC<{ data: MiniWordGridData }> = ({ data }) => (
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

const CrosswordSheet: React.FC<{ data: CrosswordData }> = ({ data }) => {
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

const HomonymSentenceSheet: React.FC<{ data: HomonymSentenceData }> = ({ data }) => (
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

// Helper for VisualOddOneOutSheet
const SegmentDisplay: React.FC<{ segments: boolean[] }> = ({ segments }) => {
    const segmentClasses = (isActive: boolean) => isActive ? 'bg-zinc-800 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-700';
    return (
        <div className="grid grid-cols-3 grid-rows-3 w-12 h-16 gap-0.5">
            {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={segmentClasses((segments || [])[i] ?? false)}></div>
            ))}
        </div>
    );
};

const VisualOddOneOutSheet: React.FC<{ data: VisualOddOneOutData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="space-y-6">
            {(data.rows || []).map((row, index) => (
                <div key={index} className="flex items-center justify-around p-4 border rounded-lg bg-white dark:bg-zinc-700/50" style={{borderColor: 'var(--worksheet-border-color)'}}>
                    {(row.items || []).map((item, itemIndex) => (
                        <div key={itemIndex} className="flex flex-col items-center gap-2">
                            <SegmentDisplay segments={item.segments} />
                            <div className="w-6 h-6 border-2 border-zinc-400 rounded-full"></div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

const ShapeCountingSheet: React.FC<{ data: ShapeCountingData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="space-y-8 flex flex-col items-center">
            {(data.figures || []).map((figure, index) => (
                <div key={index} className="flex flex-col items-center">
                    <svg viewBox="0 0 100 100" className="w-64 h-64 border rounded-md" style={{borderColor: 'var(--worksheet-border-color)'}}>
                        {(figure.svgPaths || []).map((path, pathIndex) => (
                            <path key={pathIndex} d={path.d} fill={path.fill} stroke="var(--worksheet-border-color)" strokeWidth="0.5" />
                        ))}
                    </svg>
                </div>
            ))}
             <div className="mt-4 flex items-center gap-4">
                <h4 className="font-bold text-xl">Toplam Üçgen Sayısı:</h4>
                <div className="w-24 h-16 border-2 border-zinc-400 rounded-lg"></div>
            </div>
        </div>
    </div>
);

const SymmetryDrawingSheet: React.FC<{ data: SymmetryDrawingData }> = ({ data }) => {
    const { gridDim, dots, axis } = data;
    const cellSize = 30;
    const totalSize = gridDim * cellSize;

    const renderGrid = (dotsToDraw: { x: number; y: number }[] | null) => (
        <svg width={totalSize} height={totalSize} className="bg-white dark:bg-zinc-700/50 border border-zinc-300 dark:border-zinc-600">
            {/* Grid lines */}
            {Array.from({ length: gridDim + 1 }).map((_, i) => (
                <g key={i}>
                    <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} className="stroke-zinc-200 dark:stroke-zinc-500" strokeWidth="0.5" />
                    <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} className="stroke-zinc-200 dark:stroke-zinc-500" strokeWidth="0.5" />
                </g>
            ))}
            {/* Symmetry axis */}
            <line
                x1={axis === 'vertical' ? totalSize / 2 : 0}
                y1={axis === 'vertical' ? 0 : totalSize / 2}
                x2={axis === 'vertical' ? totalSize / 2 : totalSize}
                y2={axis === 'vertical' ? totalSize : totalSize / 2}
                className="stroke-red-500"
                strokeWidth="2"
                strokeDasharray="4"
            />
            {/* Dots */}
            {(dotsToDraw || []).map((dot, index) => (
                <circle key={index} cx={dot.x * cellSize + cellSize / 2} cy={dot.y * cellSize + cellSize / 2} r="5" className="fill-blue-500" />
            ))}
        </svg>
    );

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-items-center">
                {renderGrid(dots)}
                {renderGrid(null)}
            </div>
        </div>
    );
};

const JumbledWordStorySheet: React.FC<{ data: JumbledWordStoryData | ThematicJumbledWordStoryData }> = ({ data }) => (
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

const FindDifferentStringSheet: React.FC<{ data: FindDifferentStringData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="space-y-4">
            {(data.rows || []).map((row, index) => (
                <div key={index} className="flex items-center justify-around p-3 bg-white dark:bg-zinc-700/50 rounded-lg border" style={{ borderColor: 'var(--worksheet-border-color)' }}>
                    {(row.items || []).map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-2">
                            <span className="font-mono text-lg">{item}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

const DotPaintingSheet: React.FC<{ data: DotPaintingData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-2">{data.prompt1}</p>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt2}</p>
        <div className="flex justify-center">
            <svg viewBox={data.svgViewBox} className="w-full max-w-lg border rounded-lg" style={{ borderColor: 'var(--worksheet-border-color)' }}>
                {(data.gridPaths || []).map((path, index) => (
                    <path key={`grid-${index}`} d={path} className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="0.5" />
                ))}
                {(data.dots || []).map((dot, index) => (
                    <circle key={`dot-${index}`} cx={dot.cx} cy={dot.cy} r="1.5" style={{ fill: dot.color }} />
                ))}
            </svg>
        </div>
    </div>
);

const AbcConnectSheet: React.FC<{ data: AbcConnectData | RomanNumeralConnectData | RomanArabicMatchConnectData | WeightConnectData | LengthConnectData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{'prompt' in data ? data.prompt : ''}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
            {('puzzles' in data && data.puzzles ? data.puzzles : [{...data, id:1}]).map(puzzle => {
                const cellSize = 40;
                const totalSize = puzzle.gridDim * cellSize;
                return (
                    <svg key={'id' in puzzle ? puzzle.id : 1} width={totalSize} height={totalSize} className="bg-white dark:bg-zinc-700/50 border border-zinc-300 dark:border-zinc-600">
                        {Array.from({ length: puzzle.gridDim + 1 }).map((_, i) => (
                            <g key={i}>
                                <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} className="stroke-zinc-200 dark:stroke-zinc-500" strokeWidth="0.5" />
                                <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} className="stroke-zinc-200 dark:stroke-zinc-500" strokeWidth="0.5" />
                            </g>
                        ))}
                        {(puzzle.points || []).map((p, i) => (
                             <text key={i} x={p.x * cellSize + cellSize / 2} y={p.y * cellSize + cellSize / 2} textAnchor="middle" dominantBaseline="middle" className="font-bold text-sm fill-current">{'letter' in p ? p.letter : p.label}</text>
                        ))}
                    </svg>
                )
            })}
        </div>
    </div>
);

const PasswordFinderSheet: React.FC<{ data: PasswordFinderData }> = ({ data }) => (
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

const SyllableCompletionSheet: React.FC<{ data: SyllableCompletionData }> = ({ data }) => (
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

const WordConnectSheet: React.FC<{ data: WordConnectData }> = ({ data }) => {
    const cellSize = 60;
    const totalSize = data.gridDim * cellSize;
    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
            <div className="flex justify-center">
                 <svg width={totalSize} height={totalSize} className="bg-white dark:bg-zinc-700/50 border border-zinc-300 dark:border-zinc-600 rounded-lg">
                    {(data.points || []).map((p, i) => (
                         <text key={i} x={p.x * cellSize + cellSize / 2} y={p.y * cellSize + cellSize / 2} textAnchor="middle" dominantBaseline="middle" className="font-semibold text-sm fill-current">{p.word}</text>
                    ))}
                </svg>
            </div>
        </div>
    )
};

const SpiralPuzzleSheet: React.FC<{ data: SpiralPuzzleData | PunctuationSpiralPuzzleData }> = ({ data }) => (
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

const WordGridPuzzleSheet: React.FC<{ data: WordGridPuzzleData }> = ({ data }) => (
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

const ProverbSayingSortSheet: React.FC<{ data: ProverbSayingSortData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="p-4 bg-amber-100 dark:bg-amber-900/50 border-2 border-dashed border-amber-400 rounded-lg mb-8">
            {(data.items || []).map((item, index) => <p key={index} className="p-1">{index+1}. {item.text}</p>)}
        </div>
        <div className="grid grid-cols-2 gap-8">
            <div className="p-4 border-2 rounded-lg border-sky-400">
                <h4 className="font-bold text-center text-lg text-sky-600 dark:text-sky-300 mb-2">Atasözleri</h4>
                <div className="h-48 space-y-2"></div>
            </div>
            <div className="p-4 border-2 rounded-lg border-rose-400">
                <h4 className="font-bold text-center text-lg text-rose-600 dark:text-rose-300 mb-2">Özdeyişler</h4>
                <div className="h-48 space-y-2"></div>
            </div>
        </div>
    </div>
);

const HomonymImageMatchSheet: React.FC<{ data: HomonymImageMatchData }> = ({ data }) => (
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

const AntonymFlowerPuzzleSheet: React.FC<{ data: AntonymFlowerPuzzleData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {(data.puzzles || []).map((puzzle, index) => (
                <div key={index} className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-2">
                        {/* Petals */}
                        {(puzzle.petalLetters || []).map((letter, i) => {
                            const angle = (i / (puzzle.petalLetters || []).length) * 360;
                            return (
                                <div key={i} className="absolute w-10 h-10 bg-yellow-200 dark:bg-yellow-800 border border-yellow-400 rounded-full flex items-center justify-center font-bold"
                                     style={{ top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${angle}deg) translate(40px) rotate(-${angle}deg)`}}>
                                    {letter}
                                </div>
                            );
                        })}
                        {/* Center */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-orange-400 rounded-full flex items-center justify-center text-center font-semibold text-white p-1 text-sm">{puzzle.centerWord}</div>
                    </div>
                    <div className="w-32 h-8 border-b-2 border-dotted border-zinc-500"></div>
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

const ProverbWordChainSheet: React.FC<{ data: ProverbWordChainData | ProverbSentenceFinderData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="flex justify-center flex-wrap gap-4 p-4 mb-8 border-2 border-dashed rounded-lg" style={{borderColor: 'var(--worksheet-border-color)'}}>
            {(data.wordCloud || []).map((item, index) => (
                <span key={index} className="px-3 py-1.5 rounded-md text-lg" style={{backgroundColor: item.color, color: '#fff'}}>{item.word}</span>
            ))}
        </div>
        <div className="space-y-4">
             {(data.solutions || []).map((_, index) => (
                <div key={index} className="w-full h-10 bg-zinc-100 dark:bg-zinc-700/50 rounded-lg border-b-2 border-zinc-400"></div>
            ))}
        </div>
    </div>
);

const ThematicOddOneOutSheet: React.FC<{ data: ThematicOddOneOutData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-2">{data.prompt}</p>
        <p className="text-center font-semibold text-indigo-600 dark:text-indigo-400 mb-6">Tema: {data.theme}</p>
         <div className="space-y-4">
            {(data.rows || []).map((row, index) => (
                <div key={index} className="flex flex-wrap items-center justify-around p-3 bg-white dark:bg-zinc-700/50 rounded-lg border" style={{ borderColor: 'var(--worksheet-border-color)' }}>
                    {(row.words || []).map((word, wordIndex) => (
                        <div key={wordIndex} className="flex items-center gap-2 m-2">
                             <div className="w-5 h-5 border-2 border-zinc-400 rounded-full shrink-0"></div>
                             <span className="text-lg capitalize">{word}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
        <p className="text-center italic mt-6">{data.sentencePrompt}</p>
        <div className="h-10 mt-2 border-b-2 border-dotted border-zinc-400"></div>
    </div>
);

const SynonymAntonymGridSheet: React.FC<{ data: SynonymAntonymGridData }> = ({ data }) => (
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

const PunctuationColoringSheet: React.FC<{ data: PunctuationColoringData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="flex justify-center mb-8">
            <div className="w-80 h-80 border-2 rounded-lg flex items-center justify-center" style={{borderColor: 'var(--worksheet-border-color)'}}>
                <i className="fa-solid fa-paint-brush fa-5x text-zinc-300 dark:text-zinc-600"></i>
            </div>
        </div>
        <div className="space-y-4">
            {(data.sentences || []).map((sentence, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-white dark:bg-zinc-700/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full" style={{backgroundColor: sentence.color}}></div>
                    <p className="flex-1 text-lg">{sentence.text}</p>
                    <div className="w-8 h-8 border-2 border-zinc-400 rounded-lg"></div>
                </div>
            ))}
        </div>
    </div>
);

const PunctuationMazeSheet: React.FC<{ data: PunctuationMazeData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
         <div className="flex justify-center mb-8">
            <div className="w-80 h-80 border-2 rounded-lg flex items-center justify-center" style={{borderColor: 'var(--worksheet-border-color)'}}>
                <i className="fa-solid fa-mouse fa-5x text-zinc-300 dark:text-zinc-600"></i>
                 <p className="absolute text-5xl font-bold text-zinc-400">{data.punctuationMark}</p>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(data.rules || []).map(rule => (
                <div key={rule.id} className="p-3 bg-zinc-100 dark:bg-zinc-700/50 rounded-lg text-sm border" style={{borderColor: 'var(--worksheet-border-color)'}}>
                   <strong>{rule.id}.</strong> {rule.text}
                </div>
            ))}
        </div>
    </div>
);

const AntonymResfebeSheet: React.FC<{ data: AntonymResfebeData }> = ({ data }) => (
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
                            <ImageDisplay key={i} base64={puzzle.imageBase64} description="resfebe ipucu" className="w-20 h-20" />
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

const ThematicOddOneOutSentenceSheet: React.FC<{ data: ThematicOddOneOutSentenceData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
         <div className="space-y-4">
            {(data.rows || []).map((row, index) => (
                <div key={index} className="flex flex-wrap items-center justify-around p-3 bg-white dark:bg-zinc-700/50 rounded-lg border" style={{ borderColor: 'var(--worksheet-border-color)' }}>
                    {(row.words || []).map((word, wordIndex) => (
                        <div key={wordIndex} className="flex items-center gap-2 m-2">
                             <div className="w-5 h-5 border-2 border-zinc-400 rounded-full shrink-0"></div>
                             <span className="text-lg capitalize">{word}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
        <p className="text-center italic mt-6">{data.sentencePrompt}</p>
        <div className="h-20 mt-2 border-2 border-dashed rounded-lg" style={{borderColor: 'var(--worksheet-border-color)'}}></div>
    </div>
);

const ColumnOddOneOutSentenceSheet: React.FC<{ data: ColumnOddOneOutSentenceData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-4 gap-4 mb-6">
            {(data.columns || []).map((col, i) => (
                <div key={i} className="p-2 border rounded-lg" style={{borderColor: 'var(--worksheet-border-color)'}}>
                    {(col.words || []).map((word, j) => <p key={j} className="text-center p-1">{word}</p>)}
                </div>
            ))}
        </div>
        <p className="text-center italic mt-6">{data.sentencePrompt}</p>
        <div className="h-20 mt-2 border-2 border-dashed rounded-lg" style={{borderColor: 'var(--worksheet-border-color)'}}></div>
    </div>
);

const TargetNumberSheet: React.FC<{ data: TargetNumberData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="space-y-4">
            {(data.puzzles || []).map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg" style={{borderColor: 'var(--worksheet-border-color)'}}>
                    <div className="text-center">
                        <p className="font-bold text-lg">Hedef</p>
                        <div className="w-16 h-16 flex items-center justify-center bg-red-500 text-white font-bold text-2xl rounded-full">{p.target}</div>
                    </div>
                    <div className="flex-1 flex gap-2 justify-center">
                        {(p.givenNumbers || []).map((n, j) => <div key={j} className="w-12 h-12 flex items-center justify-center bg-zinc-200 dark:bg-zinc-600 font-bold text-xl rounded-md">{n}</div>)}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const SynonymAntonymColoringSheet: React.FC<{data: SynonymAntonymColoringData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="flex justify-center mb-8">
            <div className="relative w-80 h-80 border-2 rounded-lg flex items-center justify-center bg-zinc-50 dark:bg-zinc-700/50" style={{borderColor: 'var(--worksheet-border-color)'}}>
                <i className="fa-solid fa-tree fa-6x text-zinc-300 dark:text-zinc-600"></i>
                {(data.wordsOnImage || []).map(item => (
                    <span key={item.word} className="absolute p-2 bg-white/50 dark:bg-zinc-800/50 rounded" style={{left: `${item.x}%`, top: `${item.y}%`}}>{item.word}</span>
                ))}
            </div>
        </div>
         <div className="grid grid-cols-2 gap-4">
            {(data.colorKey || []).map((key, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-white dark:bg-zinc-700/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full" style={{backgroundColor: key.color}}></div>
                    <p>{key.text}</p>
                </div>
            ))}
        </div>
    </div>
);

const PunctuationPhoneNumberSheet: React.FC<{data: PunctuationPhoneNumberData}> = ({data}) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="p-4 bg-zinc-100 dark:bg-zinc-700 rounded-lg mb-8">
            <p className="font-semibold text-center">{data.instruction}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {(data.clues || []).map(clue => <p key={clue.id}><strong>{clue.id}.</strong> {clue.text}</p>)}
            </div>
        </div>
        <div className="flex justify-center items-center gap-2">
            <p className="font-bold text-lg">05</p>
            {Array.from({length: 9}).map((_, i) => <div key={i} className="w-10 h-12 border-b-2 border-zinc-500"></div>)}
        </div>
     </div>
);

const SynonymMatchingPatternSheet: React.FC<{data: SynonymMatchingPatternData}> = ({data}) => (
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

// --- NEWLY IMPLEMENTED SHEETS ---

const FutoshikiSheet: React.FC<{ data: FutoshikiData | FutoshikiLengthData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center">
            {(data.puzzles || []).map((puzzle, index) => {
                const cellSize = 50;
                const gap = 20;
                const totalSize = puzzle.size * cellSize + (puzzle.size - 1) * gap;
                const numbers = 'units' in puzzle ? puzzle.units : puzzle.numbers;

                return (
                    <div key={index} className="flex justify-center">
                        <svg width={totalSize} height={totalSize}>
                            {/* Cells */}
                            {(numbers || []).flat().map((num, i) => {
                                const row = Math.floor(i / puzzle.size);
                                const col = i % puzzle.size;
                                return (
                                    <g key={`cell-${row}-${col}`}>
                                        <rect x={col * (cellSize + gap)} y={row * (cellSize + gap)} width={cellSize} height={cellSize}
                                            className="fill-white dark:fill-zinc-700 stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
                                        <text x={col * (cellSize + gap) + cellSize / 2} y={row * (cellSize + gap) + cellSize / 2}
                                            textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-current">
                                            {num}
                                        </text>
                                    </g>
                                )
                            })}
                            {/* Constraints */}
                            {(puzzle.constraints || []).map((c, i) => {
                                const isHorizontal = c.row1 === c.row2;
                                const x = isHorizontal ? c.col1 * (cellSize + gap) + cellSize + gap / 2 : c.col1 * (cellSize + gap) + cellSize / 2;
                                const y = isHorizontal ? c.row1 * (cellSize + gap) + cellSize / 2 : c.row1 * (cellSize + gap) + cellSize + gap / 2;
                                return (
                                    <text key={`c-${i}`} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-red-500">
                                        {c.symbol}
                                    </text>
                                )
                            })}
                        </svg>
                    </div>
                );
            })}
        </div>
    </div>
);

const NumberPyramidSheet: React.FC<{ data: NumberPyramidData | DivisionPyramidData | MultiplicationPyramidData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 justify-items-center">
            {(data.pyramids || []).map((pyramid, index) => (
                <div key={index}>
                    {'title' in pyramid && <h4 className="font-bold text-center mb-2">{pyramid.title}</h4>}
                    <div className="flex flex-col items-center gap-1">
                        {(pyramid.rows || []).map((row, rIndex) => (
                            <div key={rIndex} className="flex gap-1">
                                {(row || []).map((cell, cIndex) => (
                                    <div key={cIndex} className="w-12 h-12 flex items-center justify-center border-2 rounded-md bg-white dark:bg-zinc-700/50" style={{borderColor: 'var(--worksheet-border-color)'}}>
                                        {cell !== null ? <span className="text-lg font-bold">{cell}</span> : ''}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const NumberCapsuleSheet: React.FC<{ data: NumberCapsuleData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        {/* Placeholder for now - complex to render with just divs */}
        <div className="p-4 bg-zinc-100 dark:bg-zinc-700 text-center rounded-lg">Bu etkinlik için Hızlı Mod görünümü yapım aşamasındadır.</div>
    </div>
);

const OddEvenSudokuSheet: React.FC<{ data: OddEvenSudokuData | Sudoku6x6ShadedData }> = ({ data }) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-1 gap-8 justify-items-center">
            {(data.puzzles || []).map((puzzle, index) => (
                 <div key={index} className="w-96">
                    <div className="grid grid-cols-6 border-2 border-zinc-900 dark:border-zinc-500">
                        {(puzzle.grid || []).flat().map((cell, i) => {
                            const row = Math.floor(i / 6);
                            const col = i % 6;
                            const isConstrained = ('constrainedCells' in puzzle ? puzzle.constrainedCells : puzzle.shadedCells).some(c => c.row === row && c.col === col);
                            const borderRight = (col === 2) ? 'border-r-2 border-zinc-900 dark:border-zinc-500' : '';
                            const borderBottom = (row === 1 || row === 3) ? 'border-b-2 border-zinc-900 dark:border-zinc-500' : '';
                            return(
                                <div key={i} className={`w-16 h-16 flex items-center justify-center border text-2xl font-bold ${isConstrained ? 'bg-zinc-200 dark:bg-zinc-600' : 'bg-white dark:bg-zinc-700'} ${borderRight} ${borderBottom}`} style={{borderColor: 'var(--worksheet-border-color)'}}>
                                    {cell}
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const RomanNumeralStarHuntSheet: React.FC<{data: RomanNumeralStarHuntData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <GridComponent grid={data.grid} cellClassName="w-12 h-12" />
        <p className="text-center font-bold mt-4">Toplam Yıldız Sayısı: {data.starCount}</p>
    </div>
)

const RoundingConnectSheet: React.FC<{data: RoundingConnectData | ArithmeticConnectData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <p className="text-center font-semibold text-indigo-500 mb-6">{data.example}</p>
        <div className="relative w-full h-[400px] border-2 border-dashed rounded-lg p-4" style={{borderColor: 'var(--worksheet-border-color)'}}>
            {('numbers' in data ? data.numbers : data.expressions).map((item, index) => (
                <div key={index} className="absolute p-2 bg-amber-100 dark:bg-amber-800/50 rounded-lg" style={{left: `${item.x}%`, top: `${item.y}%`}}>
                    {'value' in item ? item.value : item.text}
                </div>
            ))}
        </div>
    </div>
);

const RomanNumeralMultiplicationSheet: React.FC<{data: RomanNumeralMultiplicationData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
         <div className="grid grid-cols-2 gap-8 justify-items-center">
            {(data.puzzles || []).map((p, i) => (
                <div key={i} className="grid grid-cols-3 w-48 text-center text-lg font-bold">
                    <div className="w-16 h-16 flex items-center justify-center text-red-500"><i className="fa-solid fa-times"></i></div>
                    <div className="w-16 h-16 flex items-center justify-center border-2 rounded-t-lg">{p.col1}</div>
                    <div className="w-16 h-16 flex items-center justify-center border-2 rounded-t-lg">{p.col2}</div>

                    <div className="w-16 h-16 flex items-center justify-center border-2 rounded-l-lg">{p.row1}</div>
                    <div className="w-16 h-16 flex items-center justify-center border-2 bg-zinc-100 dark:bg-zinc-700/50">{p.results.r1c1}</div>
                    <div className="w-16 h-16 flex items-center justify-center border-2 bg-zinc-100 dark:bg-zinc-700/50">{p.results.r1c2}</div>

                    <div className="w-16 h-16 flex items-center justify-center border-2 rounded-l-lg">{p.row2}</div>
                    <div className="w-16 h-16 flex items-center justify-center border-2 bg-zinc-100 dark:bg-zinc-700/50">{p.results.r2c1}</div>
                    <div className="w-16 h-16 flex items-center justify-center border-2 bg-zinc-100 dark:bg-zinc-700/50">{p.results.r2c2}</div>
                </div>
            ))}
        </div>
    </div>
)

const KendokuSheet: React.FC<{data: KendokuData}> = ({data}) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="p-4 bg-zinc-100 dark:bg-zinc-700 text-center rounded-lg">Bu etkinlik için Hızlı Mod görünümü yapım aşamasındadır.</div>
    </div>
)

const OperationSquareSheet: React.FC<{data: OperationSquareSubtractionData | OperationSquareFillInData | OperationSquareMultDivData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-2 gap-8 justify-items-center">
            {(data.puzzles || []).map((p, i) => <GridComponent key={i} grid={p.grid} cellClassName="w-12 h-12" />)}
        </div>
        {'numbersToUse' in data && (
            <div className="mt-6 text-center">
                <h4 className="font-bold">Kullanılacak Sayılar</h4>
                <p className="font-mono text-lg">{data.puzzles[0].numbersToUse.join(', ')}</p>
            </div>
        )}
    </div>
)

const ResfebeSheet: React.FC<{data: ResfebeData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="space-y-4">
            {(data.puzzles || []).map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1 flex items-center gap-2">
                        {(p.clues || []).map((clue, j) => (
                            clue.type === 'text' ? <span key={j} className="text-3xl font-bold">{clue.value}</span> : <ImageDisplay key={j} base64={clue.imageBase64} className="w-16 h-16" />
                        ))}
                    </div>
                    <span>&rarr;</span>
                    <div className="w-40 h-10 border-b-2"></div>
                </div>
            ))}
        </div>
    </div>
)

const MatchstickSymmetrySheet: React.FC<{data: MatchstickSymmetryData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
         <div className="grid grid-cols-3 gap-8 justify-items-center">
            {(data.puzzles || []).map((p, i) => (
                <div key={i} className="w-24 h-32 border-2 relative">
                    {(p.lines || []).map((line, j) => (
                        <div key={j} className="absolute bg-zinc-800 dark:bg-zinc-200" style={{
                            left: `${line.x1}%`, top: `${line.y1}%`,
                            width: `1px`, height: `1px` /* Placeholder */
                        }}></div>
                    ))}
                </div>
            ))}
         </div>
    </div>
);

const WordWebSheet: React.FC<{data: WordWebData | WordWebWithPasswordData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
         <div className="flex gap-8">
            <div className="w-1/3">
                <h4 className="font-bold mb-2">Kelimeler</h4>
                <ul className="list-disc list-inside">
                    {('wordsToFind' in data ? data.wordsToFind : data.words).map((w,i) => <li key={i}>{w}</li>)}
                </ul>
            </div>
            <div className="flex-1">
                <GridComponent grid={data.grid} showLetters={false} passwordColumnIndex={'passwordColumnIndex' in data ? data.passwordColumnIndex : undefined} />
            </div>
         </div>
         <p className="text-center italic mt-4">{'keyWordPrompt' in data ? data.keyWordPrompt : 'Renkli sütundaki harflerle şifreyi bulun.'}</p>
    </div>
);

const StarHuntSheet: React.FC<{data: StarHuntData}> = ({data}) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="flex justify-center">
            <GridComponent grid={data.grid.map(row => row.map(cell => {
                if(cell === 'star') return '⭐';
                if(cell === 'question') return '?';
                return cell; // This might be a shape name which isn't rendered by GridComponent well
            }))} cellClassName="w-12 h-12" />
        </div>
    </div>
);

const VisualNumberPatternSheet: React.FC<{data: VisualNumberPatternData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        {(data.puzzles || []).map((p, i) => (
            <div key={i} className="p-4 border rounded-lg mb-4">
                <div className="flex justify-center items-center gap-4">
                    {(p.items || []).map((item, j) => (
                        <div key={j} className="flex items-center justify-center rounded-full text-white font-bold"
                        style={{backgroundColor: item.color, width: `${item.size * 3}rem`, height: `${item.size * 3}rem`}}>
                            {item.number}
                        </div>
                    ))}
                    <div className="w-12 h-12 flex items-center justify-center border-2 border-dashed rounded-full font-bold text-2xl">?</div>
                </div>
                <p className="text-sm text-center italic mt-4">Kural: {p.rule}</p>
            </div>
        ))}
    </div>
);

const MissingPartsSheet: React.FC<{data: MissingPartsData}> = ({data}) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-2">
                 {(data.leftParts || []).map(p => <div key={p.id} className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-center">{p.text}</div>)}
            </div>
             <div className="space-y-2">
                 {(data.rightParts || []).map(p => <div key={p.id} className="p-3 bg-rose-100 dark:bg-rose-900/50 rounded-lg text-center">{p.text}</div>)}
            </div>
        </div>
        <h4 className="font-bold text-center mb-2">Örnekler</h4>
         <div className="flex justify-center gap-4">
            {(data.givenParts || []).map(p => <div key={p.word}>{p.parts.join(' + ')} = {p.word}</div>)}
         </div>
    </div>
);

const ProfessionConnectSheet: React.FC<{data: ProfessionConnectData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="relative w-full h-[400px] border-2 border-dashed rounded-lg p-4" style={{borderColor: 'var(--worksheet-border-color)'}}>
            {(data.points || []).map((item, index) => (
                <div key={index} className="absolute text-center" style={{left: `${item.x}%`, top: `${item.y}%`}}>
                    <ImageDisplay base64={item.imageBase64} description={item.imageDescription} className="w-16 h-16 mb-1"/>
                    <p className="font-semibold">{item.label}</p>
                </div>
            ))}
        </div>
    </div>
);

const VisualOddOneOutThemedSheet: React.FC<{data: VisualOddOneOutThemedData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="space-y-6">
            {(data.rows || []).map((row, i) =>(
                <div key={i}>
                    <h4 className="font-bold text-lg mb-2 text-indigo-500">Tema: {row.theme}</h4>
                    <div className="grid grid-cols-4 gap-4">
                        {(row.items || []).map((item, j) => (
                            <div key={j} className="border rounded-lg p-2 text-center">
                                <ImageDisplay base64={item.imageBase64} description={item.description} className="w-full h-24 mb-2" />
                                <div className="w-6 h-6 border-2 mx-auto rounded-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const LogicGridPuzzleSheet: React.FC<{data: LogicGridPuzzleData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="p-4 bg-zinc-100 dark:bg-zinc-700/50 rounded-lg mb-6">
            <h4 className="font-bold mb-2">İpuçları</h4>
            <ul className="list-disc list-inside space-y-1">
                {(data.clues || []).map((clue, i) => <li key={i}>{clue}</li>)}
            </ul>
        </div>
        {/* Placeholder for now - complex grid */}
         <div className="p-4 bg-zinc-100 dark:bg-zinc-700 text-center rounded-lg">Mantık Tablosu görünümü yapım aşamasındadır.</div>
    </div>
)

const ImageAnagramSortSheet: React.FC<{data: ImageAnagramSortData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(data.cards || []).map((card, i) =>(
                <div key={i} className="border p-2 rounded-lg text-center">
                    <ImageDisplay base64={card.imageBase64} description={card.imageDescription} className="w-full h-24 mb-2" />
                    <p className="font-mono text-lg tracking-widest">{card.scrambledWord}</p>
                </div>
            ))}
        </div>
    </div>
)

const AnagramImageMatchSheet: React.FC<{data: AnagramImageMatchData}> = ({data}) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-lg mb-6 flex justify-center gap-4 flex-wrap">
             {(data.wordBank || []).map(w => <span key={w} className="px-3 py-1 bg-white dark:bg-zinc-700 rounded-md">{w}</span>)}
        </div>
        <div className="grid grid-cols-2 gap-4">
            {(data.puzzles || []).map((p, i) =>(
                <div key={i} className="flex items-center gap-4 p-2 border rounded-lg">
                    <ImageDisplay base64={p.imageBase64} description={p.imageDescription} className="w-24 h-24" />
                    <div className="flex-1 h-10 border-b-2 font-mono text-center text-lg">{p.partialAnswer}</div>
                </div>
            ))}
        </div>
    </div>
);

const SyllableWordSearchSheet: React.FC<{data: SyllableWordSearchData}> = ({data}) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        {/* Placeholder for now - too complex */}
        <div className="p-4 bg-zinc-100 dark:bg-zinc-700 text-center rounded-lg">Bu etkinlik için Hızlı Mod görünümü yapım aşamasındadır.</div>
    </div>
);

const WordPlacementPuzzleSheet: React.FC<{data: WordPlacementPuzzleData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
                <GridComponent grid={data.grid} showLetters={false} />
            </div>
            <div className="w-full md:w-1/3 space-y-4">
                {(data.wordGroups || []).map(group => (
                    <div key={group.length}>
                        <h4 className="font-bold">{group.length} Harfli Kelimeler</h4>
                        <ul className="text-sm list-disc list-inside">
                            {(group.words || []).map(w => <li key={w}>{w}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const PositionalAnagramSheet: React.FC<{data: PositionalAnagramData}> = ({data}) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="space-y-4">
            {(data.puzzles || []).map(p => (
                <div key={p.id} className="flex items-center gap-4 p-3 bg-white dark:bg-zinc-700/50 rounded-lg">
                    <span className="font-mono text-lg">{p.scrambled}</span>
                    <span>&rarr;</span>
                    <div className="flex-1 h-8 border-b-2"></div>
                </div>
            ))}
        </div>
    </div>
)

// FIX: Added placeholder components for missing activity types to prevent crashes.
const MultiplicationWheelSheet: React.FC<{ data: MultiplicationWheelData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="p-4 bg-zinc-100 dark:bg-zinc-700 text-center rounded-lg">Bu etkinlik için Hızlı Mod görünümü yapım aşamasındadır.</div>
    </div>
);

const ShapeSudokuSheet: React.FC<{ data: ShapeSudokuData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="p-4 bg-zinc-100 dark:bg-zinc-700 text-center rounded-lg">Bu etkinlik için Hızlı Mod görünümü yapım aşamasındadır.</div>
    </div>
);


const componentMap: { [key in ActivityType]?: React.FC<any> } = {
    [ActivityType.WORD_SEARCH]: WordSearchGrid,
    [ActivityType.ANAGRAM]: AnagramList,
    [ActivityType.MATH_PUZZLE]: MathPuzzleSheet,
    [ActivityType.STORY_COMPREHENSION]: StoryComprehensionSheet,
    [ActivityType.STROOP_TEST]: StroopTestSheet,
    [ActivityType.NUMBER_PATTERN]: NumberPatternSheet,
    [ActivityType.SPELLING_CHECK]: SpellingCheckSheet,
    [ActivityType.LETTER_GRID_TEST]: LetterGridTestSheet,
    [ActivityType.NUMBER_SEARCH]: NumberSearchSheet,
    [ActivityType.WORD_MEMORY]: WordMemorySheet,
    [ActivityType.STORY_CREATION_PROMPT]: StoryCreationPromptSheet,
    [ActivityType.FIND_THE_DIFFERENCE]: FindTheDifferenceSheet,
    [ActivityType.WORD_COMPARISON]: WordComparisonSheet,
    [ActivityType.WORDS_IN_STORY]: WordsInStorySheet,
    [ActivityType.ODD_ONE_OUT]: OddOneOutSheet,
    [ActivityType.SHAPE_MATCHING]: ShapeMatchingSheet,
    [ActivityType.SYMBOL_CIPHER]: SymbolCipherSheet,
    [ActivityType.PROVERB_FILL_IN_THE_BLANK]: ProverbFillSheet,
    [ActivityType.LETTER_BRIDGE]: LetterBridgeSheet,
    [ActivityType.FIND_THE_DUPLICATE_IN_ROW]: FindDuplicateSheet,
    [ActivityType.WORD_LADDER]: WordLadderSheet,
    [ActivityType.FIND_IDENTICAL_WORD]: FindIdenticalWordSheet,
    [ActivityType.WORD_FORMATION]: WordFormationSheet,
    [ActivityType.REVERSE_WORD]: ReverseWordSheet,
    [ActivityType.FIND_LETTER_PAIR]: FindLetterPairSheet,
    [ActivityType.WORD_GROUPING]: WordGroupingSheet,
    [ActivityType.VISUAL_MEMORY]: VisualMemorySheet,
    [ActivityType.STORY_ANALYSIS]: StoryAnalysisSheet,
    [ActivityType.COORDINATE_CIPHER]: CoordinateCipherSheet,
    [ActivityType.PROVERB_SEARCH]: WordSearchGrid,
    [ActivityType.TARGET_SEARCH]: TargetSearchSheet,
    [ActivityType.SHAPE_NUMBER_PATTERN]: ShapeNumberPatternSheet,
    [ActivityType.GRID_DRAWING]: GridDrawingSheet,
    [ActivityType.COLOR_WHEEL_MEMORY]: ColorWheelSheet,
    [ActivityType.IMAGE_COMPREHENSION]: ImageComprehensionSheet,
    [ActivityType.CHARACTER_MEMORY]: CharacterMemorySheet,
    [ActivityType.STORY_SEQUENCING]: StorySequencingSheet,
    [ActivityType.CHAOTIC_NUMBER_SEARCH]: ChaoticNumberSearchSheet,
    [ActivityType.BLOCK_PAINTING]: BlockPaintingSheet,
    [ActivityType.BURDON_TEST]: BurdonTestSheet,
    [ActivityType.MINI_WORD_GRID]: MiniWordGridSheet,
    [ActivityType.SYNONYM_WORD_SEARCH]: SynonymWordSearchSheet,
    [ActivityType.THEMATIC_WORD_SEARCH_COLOR]: WordSearchGrid,
    [ActivityType.SYNONYM_SEARCH_STORY]: SynonymSearchAndStorySheet,
    [ActivityType.WORD_SEARCH_WITH_PASSWORD]: WordSearchGrid,
    [ActivityType.LETTER_GRID_WORD_FIND]: WordSearchGrid,
    [ActivityType.CROSSWORD]: CrosswordSheet,
    [ActivityType.HOMONYM_SENTENCE_WRITING]: HomonymSentenceSheet,
    [ActivityType.JUMBLED_WORD_STORY]: JumbledWordStorySheet,
    [ActivityType.VISUAL_ODD_ONE_OUT]: VisualOddOneOutSheet,
    [ActivityType.SHAPE_COUNTING]: ShapeCountingSheet,
    [ActivityType.SYMMETRY_DRAWING]: SymmetryDrawingSheet,
    [ActivityType.FIND_DIFFERENT_STRING]: FindDifferentStringSheet,
    [ActivityType.DOT_PAINTING]: DotPaintingSheet,
    [ActivityType.ABC_CONNECT]: AbcConnectSheet,
    [ActivityType.PASSWORD_FINDER]: PasswordFinderSheet,
    [ActivityType.SYLLABLE_COMPLETION]: SyllableCompletionSheet,
    [ActivityType.WORD_CONNECT]: WordConnectSheet,
    [ActivityType.SPIRAL_PUZZLE]: SpiralPuzzleSheet,
    [ActivityType.WORD_GRID_PUZZLE]: WordGridPuzzleSheet,
    [ActivityType.PROVERB_SAYING_SORT]: ProverbSayingSortSheet,
    [ActivityType.HOMONYM_IMAGE_MATCH]: HomonymImageMatchSheet,
    [ActivityType.ANTONYM_FLOWER_PUZZLE]: AntonymFlowerPuzzleSheet,
    [ActivityType.PROVERB_WORD_CHAIN]: ProverbWordChainSheet,
    [ActivityType.THEMATIC_ODD_ONE_OUT]: ThematicOddOneOutSheet,
    [ActivityType.SYNONYM_ANTONYM_GRID]: SynonymAntonymGridSheet,
    [ActivityType.PUNCTUATION_COLORING]: PunctuationColoringSheet,
    [ActivityType.PUNCTUATION_MAZE]: PunctuationMazeSheet,
    [ActivityType.ANTONYM_RESFEBE]: AntonymResfebeSheet,
    [ActivityType.THEMATIC_ODD_ONE_OUT_SENTENCE]: ThematicOddOneOutSentenceSheet,
    [ActivityType.PROVERB_SENTENCE_FINDER]: ProverbWordChainSheet, 
    [ActivityType.PUNCTUATION_SPIRAL_PUZZLE]: SpiralPuzzleSheet, 
    [ActivityType.COLUMN_ODD_ONE_OUT_SENTENCE]: ColumnOddOneOutSentenceSheet,
    [ActivityType.TARGET_NUMBER]: TargetNumberSheet,
    [ActivityType.SYNONYM_ANTONYM_COLORING]: SynonymAntonymColoringSheet,
    [ActivityType.PUNCTUATION_PHONE_NUMBER]: PunctuationPhoneNumberSheet,
    [ActivityType.THEMATIC_JUMBLED_WORD_STORY]: JumbledWordStorySheet, 
    [ActivityType.SYNONYM_MATCHING_PATTERN]: SynonymMatchingPatternSheet,
    [ActivityType.FUTOSHIKI]: FutoshikiSheet,
    [ActivityType.NUMBER_PYRAMID]: NumberPyramidSheet,
    [ActivityType.NUMBER_CAPSULE]: NumberCapsuleSheet,
    [ActivityType.ODD_EVEN_SUDOKU]: OddEvenSudokuSheet,
    [ActivityType.ROMAN_NUMERAL_CONNECT]: AbcConnectSheet, 
    [ActivityType.ROMAN_NUMERAL_STAR_HUNT]: RomanNumeralStarHuntSheet,
    [ActivityType.ROUNDING_CONNECT]: RoundingConnectSheet,
    [ActivityType.ROMAN_NUMERAL_MULTIPLICATION]: RomanNumeralMultiplicationSheet,
    [ActivityType.ARITHMETIC_CONNECT]: RoundingConnectSheet, 
    [ActivityType.ROMAN_ARABIC_MATCH_CONNECT]: AbcConnectSheet,
    [ActivityType.SUDOKU_6X6_SHADED]: OddEvenSudokuSheet,
    [ActivityType.KENDOKU]: KendokuSheet,
    [ActivityType.DIVISION_PYRAMID]: NumberPyramidSheet,
    [ActivityType.MULTIPLICATION_PYRAMID]: NumberPyramidSheet,
    [ActivityType.OPERATION_SQUARE_SUBTRACTION]: OperationSquareSheet,
    [ActivityType.OPERATION_SQUARE_FILL_IN]: OperationSquareSheet,
// FIX: Changed type references to component references for MultiplicationWheel and ShapeSudoku.
    [ActivityType.MULTIPLICATION_WHEEL]: MultiplicationWheelSheet,
    [ActivityType.OPERATION_SQUARE_MULT_DIV]: OperationSquareSheet,
    [ActivityType.SHAPE_SUDOKU]: ShapeSudokuSheet,
    [ActivityType.WEIGHT_CONNECT]: AbcConnectSheet,
    [ActivityType.RESFEBE]: ResfebeSheet,
    [ActivityType.FUTOSHIKI_LENGTH]: FutoshikiSheet,
    [ActivityType.MATCHSTICK_SYMMETRY]: MatchstickSymmetrySheet,
    [ActivityType.WORD_WEB]: WordWebSheet,
    [ActivityType.STAR_HUNT]: StarHuntSheet,
    [ActivityType.LENGTH_CONNECT]: AbcConnectSheet,
    [ActivityType.VISUAL_NUMBER_PATTERN]: VisualNumberPatternSheet,
    [ActivityType.MISSING_PARTS]: MissingPartsSheet,
    [ActivityType.PROFESSION_CONNECT]: ProfessionConnectSheet,
    [ActivityType.VISUAL_ODD_ONE_OUT_THEMED]: VisualOddOneOutThemedSheet,
    [ActivityType.LOGIC_GRID_PUZZLE]: LogicGridPuzzleSheet,
    [ActivityType.IMAGE_ANAGRAM_SORT]: ImageAnagramSortSheet,
    [ActivityType.ANAGRAM_IMAGE_MATCH]: AnagramImageMatchSheet,
    [ActivityType.SYLLABLE_WORD_SEARCH]: SyllableWordSearchSheet,
    [ActivityType.WORD_WEB_WITH_PASSWORD]: WordWebSheet,
    [ActivityType.WORD_PLACEMENT_PUZZLE]: WordPlacementPuzzleSheet,
    [ActivityType.POSITIONAL_ANAGRAM]: PositionalAnagramSheet,
};


const Worksheet: React.FC<WorksheetProps> = ({ activityType, data, styles }) => {
  if (!data || data.length === 0) {
    return <div style={styles}></div>;
  }
  
  const renderSingleSheet = (sheetData: SingleWorksheetData, activityType: ActivityType | null) => {
    if (!activityType) {
        return <div className="text-center p-8 bg-amber-100 dark:bg-amber-900/50 rounded-lg">Etkinlik türü seçilmedi.</div>;
    }
    const Component = componentMap[activityType];
    if (Component) {
        return <Component data={sheetData} type={activityType} />;
    }
    return <div className="text-center p-8 bg-red-100 dark:bg-red-900/50 rounded-lg">Etkinlik için bileşen bulunamadı: {activityType}</div>;
  };

  return (
    <div className="worksheet-container" style={styles}>
      {(data || []).map((sheetData, index) => (
        <div key={index} className="worksheet-page p-8 bg-white dark:bg-zinc-800 rounded-xl shadow-lg mb-8 last:mb-0">
          {renderSingleSheet(sheetData, activityType)}
        </div>
      ))}
    </div>
  );
};

export default Worksheet;