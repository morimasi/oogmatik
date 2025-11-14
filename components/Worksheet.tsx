import React, { CSSProperties } from 'react';
import { 
    ActivityType, WorksheetData, WordSearchData, AnagramData, MathPuzzleData, StoryData, 
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
    AntonymFlowerPuzzleData, ProverbWordChainData, ThematicOddOneOutData, SynonymAntonymGridData, PunctuationColoringData
} from '../types';
import Shape from './Shape';

interface WorksheetProps {
  activityType: ActivityType | null;
  data: WorksheetData;
  styles: CSSProperties;
}

const WordSearchGrid: React.FC<{ data: WordSearchData }> = ({ data }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4 text-center">Kelime Bulmaca</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 bg-white dark:bg-gray-700 p-4 rounded-lg shadow-inner">
        <table className="table-fixed w-full">
          <tbody>
            {data.grid?.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row?.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border border-gray-300 dark:border-gray-600 text-center font-mono text-lg w-10 h-10" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    {cell.toUpperCase()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h4 className="font-bold mb-2 text-teal-600 dark:text-teal-400">Aranacak Kelimeler:</h4>
        <ul className="list-disc list-inside space-y-1">
          {data.words?.map((word, index) => (
            <li key={index} className="capitalize">{word}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const AnagramList: React.FC<{ data: AnagramData[] }> = ({ data }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4 text-center">Anagram Bulmaca</h3>
    <div className="space-y-4 max-w-md mx-auto">
      {data?.map((item, index) => (
        <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
          <p className="font-mono text-xl tracking-widest">{item.scrambled.toUpperCase()}</p>
          <div className="w-2/3 h-8 bg-gray-200 dark:bg-gray-600 rounded-md border-b-2 border-gray-400"></div>
        </div>
      ))}
    </div>
  </div>
);

const MathPuzzleSheet: React.FC<{ data: MathPuzzleData }> = ({ data }) => (
  <div>
    <h3 className="text-xl font-bold mb-6 text-center">{data.title}</h3>
    <div className="space-y-8">
      {data.puzzles?.map((puzzle, index) => (
        <div key={index} className="flex flex-col md:flex-row items-center gap-4 p-4 border rounded-lg bg-white dark:bg-gray-700" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
           <span className="text-2xl font-bold text-teal-500">{index + 1}.</span>
           <div className="flex-1">
             <p className="text-lg font-mono">{puzzle.problem}</p>
             <p className="text-md text-gray-600 dark:text-gray-400 mt-1">{puzzle.question}</p>
           </div>
           <div className="flex items-center gap-2">
                <span className="font-semibold">Cevap:</span>
                <div className="w-24 h-10 border-b-2 border-gray-400"></div>
           </div>
        </div>
      ))}
    </div>
  </div>
);

const StoryComprehensionSheet: React.FC<{ data: StoryData }> = ({ data }) => (
  <div>
    <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-inner mb-8">
        <p className="text-base leading-relaxed whitespace-pre-line">{data.story}</p>
    </div>
    
    <h4 className="text-xl font-semibold mb-4 text-center">Sorular</h4>
    <div className="space-y-6">
        {data.questions?.map((q, index) => (
            <div key={index}>
                <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
                <div className="space-y-2">
                    {q.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center">
                            <div className="w-5 h-5 border-2 border-gray-400 rounded-full mr-3"></div>
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
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Aşağıdaki kelimelerin hangi renkte yazıldığını söylemeye çalışın, kelimenin kendisini okumayın.</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 text-center">
            {data.items?.map((item, index) => (
                <div key={index} className="p-4 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
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
            {data.patterns?.map((p, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-white dark:bg-gray-700" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    <span className="text-lg font-bold text-cyan-500">{index + 1}.</span>
                    <p className="flex-1 text-xl font-mono tracking-wider text-center">{p.sequence}</p>
                    <div className="w-20 h-10 border-b-2 border-gray-400"></div>
                </div>
            ))}
        </div>
    </div>
);

const SpellingCheckSheet: React.FC<{ data: SpellingCheckData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-6 text-center">{data.title}</h3>
        <div className="space-y-6">
            {data.checks?.map((check, index) => (
                <div key={index} className="p-4 rounded-lg bg-white dark:bg-gray-700">
                    <p className="font-semibold mb-3 text-lg">{index + 1}. Aşağıdaki kelimelerden hangisi doğru yazılmıştır?</p>
                    <div className="flex flex-col sm:flex-row justify-around gap-4">
                        {check.options?.map((option, optIndex) => (
                             <div key={optIndex} className="flex items-center">
                                <div className="w-5 h-5 border-2 border-gray-400 rounded-md mr-3"></div>
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
        <p className="text-center mb-4">Aşağıdaki tabloda <strong className="text-teal-500">{data.targetLetters?.join(', ')}</strong> harflerini bulun ve daire içine alın.</p>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-inner">
            <table className="table-fixed w-full">
                <tbody>
                    {data.grid?.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row?.map((cell, cellIndex) => (
                                <td key={cellIndex} className="border border-gray-300 dark:border-gray-600 text-center font-mono text-xs w-5 h-5" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
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
        <p className="text-center mb-4">Aşağıdaki satırlarda <strong className="text-teal-500">{data.targetLetters?.join(', ')}</strong> harflerini bulup yuvarlak içine alalım.</p>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-inner">
            <table className="table-fixed w-full">
                <tbody>
                    {data.grid?.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row?.map((cell, cellIndex) => (
                                <td key={cellIndex} className="border border-gray-300 dark:border-gray-600 text-center font-mono text-xs w-5 h-5" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
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
        <p className="text-center mb-6">Aşağıdaki sayılar arasından <strong className="text-teal-500">{data.range?.start}</strong>'den <strong className="text-teal-500">{data.range?.end}</strong>'e kadar olan sayıları sırasıyla bulun ve işaretleyin.</p>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-x-2 gap-y-4 text-center p-4 bg-white dark:bg-gray-700 rounded-lg">
            {data.numbers?.map((num, index) => (
                <span key={index} className="font-mono text-lg">{num}</span>
            ))}
        </div>
    </div>
);

const WordMemorySheet: React.FC<{ data: WordMemoryData }> = ({ data }) => (
    <div>
        <div className="page">
            <h3 className="text-2xl font-bold mb-4 text-center">{data.memorizeTitle}</h3>
            <p className="text-center mb-6 text-gray-600 dark:text-gray-400">Bu kelimelere bir süre dikkatlice bakın ve ezberlemeye çalışın.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                {data.wordsToMemorize?.map((word, index) => (
                    <div key={index} className="p-4 bg-yellow-100 dark:bg-yellow-800 border-l-4 border-yellow-500 rounded text-center">
                        <p className="text-lg font-semibold">{word}</p>
                    </div>
                ))}
            </div>
        </div>

        <div className="page-break"></div>

        <div className="page">
            <h3 className="text-2xl font-bold mb-4 text-center">{data.testTitle}</h3>
            <p className="text-center mb-6 text-gray-600 dark:text-gray-400">Bir önceki sayfada gördüğünüz kelimeleri bu listeden bulup işaretleyin.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {data.testWords?.map((word, index) => (
                    <div key={index} className="flex items-center bg-white dark:bg-gray-700 p-3 rounded-lg">
                        <div className="w-5 h-5 border-2 border-gray-400 rounded-md mr-3 shrink-0"></div>
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
        <p className="text-center mb-6 text-gray-600 dark:text-gray-400">{data.prompt}</p>
        <div className="text-center mb-8">
            <h4 className="font-semibold mb-2">Anahtar Kelimeler:</h4>
            <div className="flex justify-center flex-wrap gap-3">
                {data.keywords?.map((word, index) => (
                    <span key={index} className="px-4 py-2 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 rounded-full font-medium">{word}</span>
                ))}
            </div>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
            <div className="w-full h-80 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}></div>
        </div>
    </div>
);

const FindTheDifferenceSheet: React.FC<{ data: FindTheDifferenceData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Her satırda diğerlerinden farklı olan kelimeyi bulup işaretleyin.</p>
        <div className="space-y-4 max-w-2xl mx-auto">
            {data.rows?.map((row, index) => (
                <div key={index} className="flex items-center justify-around p-4 border rounded-lg bg-white dark:bg-gray-700" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    {row.items?.map((item, itemIndex) => (
                         <div key={itemIndex} className="flex items-center gap-2">
                             <div className="w-6 h-6 border-2 border-gray-400 rounded-full shrink-0"></div>
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
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Her iki kutucukta da bulunmayan kelimeleri aşağıdaki boş alana yazın.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="p-4 border-4 border-dashed border-sky-300 rounded-lg">
                <h4 className="text-lg font-bold mb-2 text-center text-sky-700 dark:text-sky-300">{data.box1Title}</h4>
                <ul className="space-y-1 text-center">
                    {data.wordList1?.map((word, i) => <li key={i} className="capitalize">{word}</li>)}
                </ul>
            </div>
            <div className="p-4 border-4 border-dashed border-rose-300 rounded-lg">
                <h4 className="text-lg font-bold mb-2 text-center text-rose-700 dark:text-rose-300">{data.box2Title}</h4>
                <ul className="space-y-1 text-center">
                     {data.wordList2?.map((word, i) => <li key={i} className="capitalize">{word}</li>)}
                </ul>
            </div>
        </div>
        <div>
             <h4 className="font-semibold mb-2">Farklı Kelimeler:</h4>
             <div className="w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-2" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}></div>
        </div>
    </div>
);

const WordsInStorySheet: React.FC<{ data: WordsInStoryData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-inner mb-8">
            <p className="text-base leading-relaxed whitespace-pre-line">{data.story}</p>
        </div>
        <h4 className="text-xl font-semibold mb-4 text-center">Aşağıdaki kelimelerden hangileri metinde <strong className="text-red-500">GEÇMEMEKTEDİR</strong>? İşaretleyiniz.</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {data.wordList?.map((item, index) => (
                 <div key={index} className="flex items-center bg-white dark:bg-gray-700 p-3 rounded-lg">
                    <div className="w-5 h-5 border-2 border-gray-400 rounded-md mr-3 shrink-0"></div>
                    <label className="text-md capitalize">{item.word}</label>
                </div>
            ))}
        </div>
    </div>
);

const OddOneOutSheet: React.FC<{ data: OddOneOutData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Aşağıdaki her grupta, anlamsal olarak diğerlerinden farklı olan kelimeyi bulup işaretleyin.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.groups?.map((group, index) => (
                <div key={index} className="p-4 border rounded-lg bg-white dark:bg-gray-700" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    <div className="space-y-3">
                        {group.words?.map((word, wordIndex) => (
                            <div key={wordIndex} className="flex items-center">
                                <div className="w-6 h-6 border-2 border-gray-400 rounded-full mr-4"></div>
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
        {shapes?.map((shape, i) => <Shape key={i} name={shape} className="w-8 h-8 text-gray-700 dark:text-gray-300" />)}
    </div>
);

const ShapeMatchingSheet: React.FC<{ data: ShapeMatchingData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Soldaki şekil gruplarını sağdaki eşleriyle eşleştirin.</p>
        <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-x-16 gap-y-4">
                {/* Left Column */}
                <div className="space-y-4">
                    {data.leftColumn?.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-2 border-2 border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-700">
                            <span className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white font-bold rounded-full">{item.id}</span>
                            <ShapeDisplay shapes={item.shapes} />
                        </div>
                    ))}
                </div>
                {/* Right Column */}
                <div className="space-y-4">
                    {data.rightColumn?.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-2 border-2 border-red-300 rounded-lg bg-red-50 dark:bg-gray-700">
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
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Aşağıdaki anahtarı kullanarak şekillerle yazılmış kelimeleri çözün.</p>
        {/* Key */}
        <div className="flex justify-center items-center gap-4 flex-wrap p-4 bg-yellow-100 dark:bg-gray-700 rounded-lg mb-8 border-2 border-dashed border-yellow-400">
            {data.cipherKey?.map(keyItem => (
                <div key={keyItem.letter} className="flex items-center gap-2">
                    <Shape name={keyItem.shape} className="w-8 h-8" />
                    <span className="font-bold text-xl">=</span>
                    <span className="font-bold text-xl">{keyItem.letter.toUpperCase()}</span>
                </div>
            ))}
        </div>
        {/* Words to solve */}
        <div className="space-y-6 max-w-lg mx-auto">
            {data.wordsToSolve?.map((word, index) => (
                <div key={index} className="flex items-center gap-4">
                    <div className="flex-1 p-2 rounded-lg bg-white dark:bg-gray-700">
                        <ShapeDisplay shapes={word.shapeSequence} />
                    </div>
                    <i className="fa-solid fa-arrow-right text-2xl text-gray-400"></i>
                    <div className="flex-1 flex justify-center gap-1">
                        {Array.from({ length: word.wordLength }).map((_, i) => (
                            <div key={i} className="w-10 h-12 border-b-2 border-gray-500"></div>
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
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Aşağıdaki atasözlerinde boş bırakılan yerleri doğru kelimelerle doldurun.</p>
        <div className="space-y-6 max-w-2xl mx-auto">
            {data.proverbs?.map((proverb, index) => (
                <div key={index} className="flex items-center text-lg">
                    <span>{index + 1}.</span>
                    <p className="ml-2">{proverb.start}</p>
                    <div className="w-32 h-8 mx-2 border-b-2 border-dotted border-gray-500"></div>
                    <p>{proverb.end}</p>
                </div>
            ))}
        </div>
    </div>
);

const LetterBridgeSheet: React.FC<{ data: LetterBridgeData }> = ({ data }) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Ortadaki kutucuğa öyle bir harf yerleştirin ki, hem soldaki kelimenin son harfi, hem de sağdaki kelimenin ilk harfi olsun.</p>
        <div className="space-y-6 max-w-md mx-auto">
            {data.pairs?.map((pair, index) => (
                <div key={index} className="flex items-center justify-center gap-2 text-xl font-semibold tracking-widest">
                    <span>{pair.word1.toUpperCase()}</span>
                    <div className="w-10 h-10 border-2 border-gray-400 rounded-md"></div>
                    <span>{pair.word2.toUpperCase()}</span>
                </div>
            ))}
        </div>
    </div>
);

const FindDuplicateSheet: React.FC<{ data: FindDuplicateData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Aşağıdaki her satırda, iki defa yazılmış olan harf veya rakamı bulup daire içine alın.</p>
        <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-inner">
            <table className="w-full">
                <tbody>
                {data.rows?.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row?.map((char, charIndex) => (
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
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">İlk kelimeden başlayarak her adımda bir harfi değiştirerek son kelimeye ulaşmaya çalışın.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.ladders?.map((ladder, index) => (
                <div key={index} className="p-4 bg-white dark:bg-gray-700 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    <div className="flex flex-col items-center space-y-2 font-mono text-xl tracking-widest">
                        <div className="px-4 py-2 border-2 border-gray-300 rounded-md w-full text-center">{ladder.startWord.toUpperCase()}</div>
                        {Array.from({ length: ladder.steps }).map((_, i) => (
                            <div key={i} className="w-full h-10 border-b-2 border-dotted border-gray-400"></div>
                        ))}
                        <div className="px-4 py-2 border-2 border-gray-300 rounded-md w-full text-center">{ladder.endWord.toUpperCase()}</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const FindIdenticalWordSheet: React.FC<{ data: FindIdenticalWordData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Aşağıdaki her grupta birbirinin aynısı olan kelime çiftini bulup işaretleyin.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.groups?.map((group, index) => (
                <div key={index} className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    <div className="w-6 h-6 border-2 border-gray-400 rounded-full mr-4 shrink-0"></div>
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
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Aşağıdaki harfleri kullanarak anlamlı kelimeler türetin. Joker hakkınızı unutmayın!</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.sets?.map((set, index) => (
                <div key={index} className="p-4 bg-white dark:bg-gray-700 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    <div className="flex justify-center items-center gap-2 flex-wrap mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 border-2 border-dashed border-yellow-400 rounded">
                        {set.letters?.map((letter, i) => (
                            <span key={i} className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded shadow text-2xl font-bold">{letter.toUpperCase()}</span>
                        ))}
                    </div>
                    <p className="text-center text-sm font-semibold mb-3">Joker Hakkı: {set.jokerCount}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                         {Array.from({ length: 10 }).map((_, i) => (
                             <div key={i} className="h-8 border-b-2 border-gray-300 dark:border-gray-600"></div>
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
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Aşağıdaki kelimeleri okuyup, karşılarındaki boşluklara tersten yazın.</p>
        <div className="space-y-4 max-w-lg mx-auto">
            {data.words?.map((word, index) => (
                <div key={index} className="flex items-center justify-between gap-4 p-3 bg-white dark:bg-gray-700 rounded-lg">
                    <p className="font-semibold text-lg w-1/3">{word}</p>
                    <div className="w-2/3 h-8 border-b-2 border-dotted border-gray-500"></div>
                </div>
            ))}
        </div>
    </div>
);

const FindLetterPairSheet: React.FC<{ data: FindLetterPairData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center mb-4">Aşağıdaki tabloda <strong className="text-teal-500">"{data.targetPair}"</strong> harf ikilisini bulun ve daire içine alın.</p>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-inner">
            <table className="table-fixed w-full">
                <tbody>
                    {data.grid?.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row?.map((cell, cellIndex) => (
                                <td key={cellIndex} className="border border-gray-300 dark:border-gray-600 text-center font-mono text-lg w-8 h-8 md:w-10 md:h-10" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
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
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Aşağıdaki kelime havuzunda bulunan kelimeleri, ait oldukları doğru kategori kutucuklarına yazın.</p>
        <div className="mb-8 p-4 bg-yellow-100 dark:bg-yellow-900 border-2 border-dashed border-yellow-400 rounded-lg">
            <h4 className="font-bold text-center mb-2 text-yellow-800 dark:text-yellow-200">Kelime Havuzu</h4>
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2">
                {data.words?.map((word, index) => (
                    <span key={index} className="text-lg capitalize">{word}</span>
                ))}
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.categoryNames?.map((name, index) => (
                <div key={index} className="p-4 bg-white dark:bg-gray-700 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    <h4 className="font-bold text-center mb-3 text-teal-600 dark:text-teal-400">{name}</h4>
                    <div className="space-y-2 h-40">
                         {Array.from({ length: 5 }).map((_, i) => (
                             <div key={i} className="h-8 border-b-2 border-gray-300 dark:border-gray-600"></div>
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
            <p className="text-center mb-6 text-gray-600 dark:text-gray-400">Bu görsellere bir süre dikkatlice bakın ve ezberlemeye çalışın.</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
                {data.itemsToMemorize?.map((item, index) => (
                    <div key={index} className="p-4 bg-yellow-100 dark:bg-yellow-800 border-l-4 border-yellow-500 rounded text-center flex flex-col items-center justify-center aspect-square">
                        <p className="text-4xl sm:text-5xl">{item.split(' ').pop()}</p>
                        <p className="text-sm font-semibold mt-2">{item.split(' ')[0]}</p>
                    </div>
                ))}
            </div>
        </div>
        <div className="page-break"></div>
        <div className="page">
            <h3 className="text-2xl font-bold mb-4 text-center">{data.testTitle}</h3>
            <p className="text-center mb-6 text-gray-600 dark:text-gray-400">Bir önceki sayfada gördüğünüz görselleri bu listeden bulup işaretleyin.</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {data.testItems?.map((item, index) => (
                    <div key={index} className="flex flex-col items-center justify-center text-center bg-white dark:bg-gray-700 p-3 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                        <div className="w-6 h-6 border-2 border-gray-400 rounded-full mb-3 shrink-0"></div>
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
        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-inner mb-8">
            <p className="text-base leading-relaxed whitespace-pre-line">{data.story}</p>
        </div>
        <h4 className="text-xl font-semibold mb-4 text-center">Sorular</h4>
        <div className="space-y-6">
            {data.questions?.map((q, index) => (
                <div key={index} className="p-4 bg-white dark:bg-gray-700 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 italic">İpucu: "{q.context}"</p>
                    <div className="w-full h-8 border-b-2 border-dotted border-gray-400"></div>
                </div>
            ))}
        </div>
    </div>
);

const CoordinateCipherSheet: React.FC<{ data: CoordinateCipherData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Aşağıdaki kelimeleri bulmacada bulun. Sonra, şifre kutucuklarında verilen koordinatlardaki harfleri birleştirerek gizemli kelimeyi çözün.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white dark:bg-gray-700 p-2 rounded-lg shadow-inner">
                <table className="table-fixed w-full">
                    <thead>
                        <tr>
                            <th className="w-6 h-6"></th>
                            {data.grid?.[0]?.map((_, colIndex) => (
                                <th key={colIndex} className="font-mono text-center">{colIndex + 1}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.grid?.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <th className="font-mono text-center">{String.fromCharCode(65 + rowIndex)}</th>
                            {row?.map((cell, cellIndex) => (
                            <td key={cellIndex} className="border border-gray-300 dark:border-gray-600 text-center font-mono text-lg w-8 h-8" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                                {cell.toUpperCase()}
                            </td>
                            ))}
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div>
                <h4 className="font-bold mb-2 text-teal-600 dark:text-teal-400">Aranacak Kelimeler:</h4>
                <ul className="list-disc list-inside space-y-1">
                {data.wordsToFind?.map((word, index) => (
                    <li key={index} className="capitalize">{word}</li>
                ))}
                </ul>
            </div>
        </div>

        <div className="mt-8">
            <h4 className="font-bold mb-4 text-center text-xl">ŞİFRE</h4>
            <div className="flex justify-center flex-wrap gap-3">
                {data.cipherCoordinates?.map((coord, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <div className="w-12 h-12 border-b-2 border-gray-500"></div>
                        <div className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs font-mono rounded-b-md">{coord}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const ProverbSearchSheet: React.FC<{ data: ProverbSearchData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Aşağıdaki tabloda gizlenmiş olan atasözünü bulun ve altındaki boşluğa yazın.</p>
        <div className="max-w-md mx-auto bg-white dark:bg-gray-700 p-4 rounded-lg shadow-inner">
            <table className="table-fixed w-full">
                <tbody>
                    {data.grid?.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row?.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border border-gray-300 dark:border-gray-600 text-center font-mono text-lg w-10 h-10" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                            {cell.toUpperCase()}
                        </td>
                        ))}
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="mt-8">
            <h4 className="font-bold mb-2 text-center text-xl">Atasözü:</h4>
            <div className="w-full h-12 bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-400 rounded-t-lg"></div>
        </div>
    </div>
);

const TargetSearchSheet: React.FC<{ data: TargetSearchData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center mb-6">Aşağıdaki tabloda <strong className="text-teal-500">{data.distractor}</strong>'ların arasında kaç tane <strong className="text-red-500">{data.target}</strong> olduğunu bulun.</p>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-inner max-w-xl mx-auto">
            <table className="table-fixed w-full">
                <tbody>
                    {data.grid?.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row?.map((cell, cellIndex) => (
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
            <div className="w-24 h-16 border-2 border-gray-400 rounded-lg"></div>
        </div>
    </div>
);

const ShapeNumberPatternSheet: React.FC<{ data: ShapeNumberPatternData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Aşağıdaki şekillerde sayılar belirli bir kurala göre yerleştirilmiştir. Bu kuralı bularak soru işareti (?) olan yere hangi sayının gelmesi gerektiğini bulun.</p>
        <div className="space-y-12">
            {data.patterns?.map((pattern, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center justify-center gap-8">
                    {pattern.shapes?.map((shape, shapeIndex) => (
                        <div key={shapeIndex} className="relative w-40 h-40">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="50,5 95,95 5,95" />
                            </svg>
                            {shape.numbers?.length === 4 ? ( // 3 corners + center
                                <>
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-xl">{shape.numbers[0]}</span>
                                    <span className="absolute bottom-4 left-4 font-bold text-xl">{shape.numbers[1]}</span>
                                    <span className="absolute bottom-4 right-4 font-bold text-xl">{shape.numbers[2]}</span>
                                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-2xl text-teal-600 dark:text-teal-400">{shape.numbers[3]}</span>
                                </>
                            ) : ( // 3 corners
                                <>
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-xl">{shape.numbers[0]}</span>
                                    <span className="absolute bottom-4 left-4 font-bold text-xl">{shape.numbers[1]}</span>
                                    <span className="absolute bottom-4 right-4 font-bold text-xl">{shape.numbers[2]}</span>
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
        <svg width={totalSize} height={totalSize} className="bg-yellow-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
            {/* Grid lines */}
            {Array.from({ length: gridDim + 1 }).map((_, i) => (
                <g key={i}>
                    <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} className="stroke-gray-200 dark:stroke-gray-600" strokeWidth="1" />
                    <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} className="stroke-gray-200 dark:stroke-gray-600" strokeWidth="1" />
                </g>
            ))}
            {/* Pattern lines */}
            {lines?.map((line, index) => (
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
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Soldaki görsellerin aynısını sağ taraftaki alana çizin.</p>
            <div className="space-y-8">
                {data.drawings?.map((drawing, index) => (
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
            {items?.map((item, index) => {
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
                <p className="text-center mb-6 text-gray-600 dark:text-gray-400">Aşağıdaki renk çarkına ve görsellere dikkatlice bakın. Sonra sayfayı çevirip görselleri renk çarkına yerleştirin.</p>
                {renderWheel(true)}
            </div>

            <div className="page-break"></div>

            <div className="page">
                <h3 className="text-2xl font-bold mb-4 text-center">{data.testTitle}</h3>
                <p className="text-center mb-6 text-gray-600 dark:text-gray-400">Görselleri ok işaretiyle yerlerine götürün.</p>
                <div className="flex justify-center items-center gap-4 flex-wrap mb-8">
                    {items?.map((item, index) => (
                        <div key={index} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)'}}>
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
            <p className="text-center mb-6 text-gray-600 dark:text-gray-400">Aşağıdaki resmi ve metni dikkatlice inceleyin. Sonraki sayfada bu sahneyle ilgili sorular olacak.</p>
            {data.imageBase64 && (
                <div className="my-6 flex justify-center">
                    <img 
                        src={`data:image/png;base64,${data.imageBase64}`} 
                        alt={data.title} 
                        className="rounded-lg shadow-lg max-w-full h-auto border dark:border-gray-600"
                    />
                </div>
            )}
            <div className="bg-yellow-50 dark:bg-gray-700/50 p-6 rounded-lg border-l-4 border-yellow-400">
                <p className="text-base leading-relaxed whitespace-pre-line italic">{data.sceneDescription}</p>
            </div>
        </div>

        <div className="page-break"></div>

        <div className="page">
            <h3 className="text-2xl font-bold mb-4 text-center">{data.testTitle}</h3>
            <p className="text-center mb-6 text-gray-600 dark:text-gray-400">İncelediğiniz sahneye göre aşağıdaki soruları cevaplayın.</p>
            <div className="space-y-6">
                {data.questions?.map((q, index) => (
                    <div key={index}>
                        <p className="font-semibold mb-2">{index + 1}. {q}</p>
                        <div className="w-full h-8 border-b-2 border-dotted border-gray-400"></div>
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
            <p className="text-center mb-6 text-gray-600 dark:text-gray-400">Bu karakterlere bir süre dikkatlice bakın ve akılda tutmaya çalışın.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {data.charactersToMemorize?.map((char, index) => (
                    <div key={index} className="p-2 bg-yellow-100 dark:bg-yellow-800 border-l-4 border-yellow-500 rounded text-center flex flex-col items-center justify-start">
                        <div className="w-full aspect-square mb-2 bg-white dark:bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                            {char.imageBase64 ? (
                                <img src={`data:image/png;base64,${char.imageBase64}`} alt={char.description} className="w-full h-full object-contain" />
                            ) : (
                                <i className="fa-solid fa-image fa-2x text-gray-400"></i>
                            )}
                        </div>
                        <p className="text-xs flex-grow">{char.description}</p>
                    </div>
                ))}
            </div>
        </div>
        <div className="page-break"></div>
        <div className="page">
            <h3 className="text-2xl font-bold mb-4 text-center">{data.testTitle}</h3>
            <p className="text-center mb-6 text-gray-600 dark:text-gray-400">Bir önceki sayfada gördüğünüz karakterleri bu listeden bulup işaretleyin.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {data.testCharacters?.map((char, index) => (
                     <div key={index} className="flex items-start bg-white dark:bg-gray-700 p-2 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)'}}>
                        <div className="w-5 h-5 border-2 border-gray-400 rounded-md mr-3 mt-1 shrink-0"></div>
                        <div className="flex flex-col flex-1">
                            <div className="w-full aspect-square mb-2 bg-gray-100 dark:bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                                {char.imageBase64 ? (
                                    <img src={`data:image/png;base64,${char.imageBase64}`} alt={char.description} className="w-full h-full object-contain" />
                                ) : (
                                    <i className="fa-solid fa-image fa-2x text-gray-300"></i>
                                )}
                            </div>
                            <label className="text-xs">{char.description}</label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const StorySequencingSheet: React.FC<{ data: StorySequencingData }> = ({ data }) => {
    const shuffledPanels = React.useMemo(() => data.panels?.slice()?.sort(() => Math.random() - 0.5), [data.panels]);

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {shuffledPanels?.map((panel) => (
                    <div key={panel.id} className="p-3 bg-white dark:bg-gray-700 rounded-lg border-2 aspect-square flex flex-col" style={{borderColor: 'var(--worksheet-border-color)'}}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-xl">{panel.id}</span>
                             <i className="fa-regular fa-image text-2xl text-gray-300 dark:text-gray-500"></i>
                        </div>
                        <p className="text-sm flex-1">{panel.description}</p>
                    </div>
                ))}
            </div>
             <div className="flex items-center justify-center gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <React.Fragment key={i}>
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 border-2 border-gray-400 rounded-md"></div>
                            <span className="text-sm mt-1">{i + 1}</span>
                        </div>
                        {i < 5 && <span className="text-gray-400">-</span>}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};


const ChaoticNumberSearchSheet: React.FC<{ data: ChaoticNumberSearchData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="w-full aspect-square bg-white dark:bg-gray-700 rounded-lg shadow-inner relative overflow-hidden p-2 border" style={{borderColor: 'var(--worksheet-border-color)'}}>
            {data.numbers?.map((num, index) => (
                <span 
                    key={index} 
                    className="absolute font-bold flex items-center justify-center"
                    style={{
                        left: `${num.x}%`,
                        top: `${num.y}%`,
                        fontSize: `${num.size}rem`,
                        transform: `rotate(${num.rotation}deg)`,
                        color: num.color,
                        lineHeight: 1,
                    }}
                >
                    {num.value}
                </span>
            ))}
        </div>
    </div>
);

const BlockPaintingSheet: React.FC<{ data: BlockPaintingData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-1" style={{gridTemplateColumns: `repeat(${data.grid.cols}, minmax(0, 1fr))`}}>
            {Array.from({length: data.grid.rows * data.grid.cols}).map((_, i) => (
                <div key={i} className="aspect-square border border-gray-300 dark:border-gray-600"></div>
            ))}
        </div>
        <div className="mt-8 flex justify-center items-start gap-4 flex-wrap">
            {data.shapes?.map((shape, i) => (
                <div key={i} className="flex flex-col items-center">
                    <div className="flex">
                    {shape.pattern?.map((row, r_idx) => (
                        <div key={r_idx} className="flex flex-col">
                            {row?.map((cell, c_idx) => (
                                <div key={`${r_idx}-${c_idx}`} className="w-5 h-5" style={{backgroundColor: cell ? shape.color : 'transparent'}}></div>
                            ))}
                        </div>
                    ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const MiniWordGridSheet: React.FC<{ data: MiniWordGridData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {data.puzzles?.map((puzzle, index) => (
                <div key={index} className="p-2 bg-white dark:bg-gray-700 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)'}}>
                    <div className="flex justify-center items-center mb-2">
                        <span className="w-8 h-8 flex items-center justify-center bg-teal-500 text-white font-bold rounded-full">{index + 1}</span>
                    </div>
                    <table className="table-fixed w-full">
                        <tbody>
                            {puzzle.grid?.map((row, rIdx) => (
                                <tr key={rIdx}>
                                    {row?.map((cell, cIdx) => (
                                        <td key={cIdx} className={`border border-gray-300 dark:border-gray-600 text-center font-mono text-lg w-10 h-10 ${rIdx === puzzle.start?.row && cIdx === puzzle.start?.col ? 'bg-pink-300 dark:bg-pink-700' : ''}`}>
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

const VisualOddOneOutSheet: React.FC<{ data: VisualOddOneOutData }> = ({ data }) => {
    const PieChart: React.FC<{ segments: boolean[] }> = ({ segments }) => {
        const numSegments = segments.length;
        const angleStep = 360 / numSegments;
        return (
            <svg viewBox="0 0 100 100" className="w-12 h-12">
                {segments?.map((isFilled, i) => {
                    const startAngle = i * angleStep;
                    const endAngle = (i + 1) * angleStep;
                    const [startX, startY] = [50 + 50 * Math.cos(startAngle * Math.PI / 180), 50 + 50 * Math.sin(startAngle * Math.PI / 180)];
                    const [endX, endY] = [50 + 50 * Math.cos(endAngle * Math.PI / 180), 50 + 50 * Math.sin(endAngle * Math.PI / 180)];
                    const pathData = `M 50,50 L ${startX},${startY} A 50,50 0 0,1 ${endX},${endY} Z`;
                    return <path key={i} d={pathData} fill={isFilled ? 'yellow' : 'white'} stroke="black" strokeWidth="2" />;
                })}
            </svg>
        );
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
            <div className="space-y-4">
                {data.rows?.map((row, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-4 p-2 bg-white dark:bg-gray-700 rounded-lg">
                        <span className="font-bold">{rIdx + 1}.</span>
                        {row.items?.map((item, iIdx) => (
                            <div key={iIdx}> <PieChart segments={item.segments} /> </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

const ShapeCountingSheet: React.FC<{ data: ShapeCountingData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-2 gap-8">
            {data.figures?.map((figure, index) => (
                <div key={index} className="flex flex-col items-center">
                    <svg viewBox="0 0 100 100" className="w-64 h-64 border p-2">
                        {figure.svgPaths?.map((path, pIndex) => (
                             <path key={pIndex} d={path.d} fill={path.fill} stroke="black" strokeWidth="0.5" />
                        ))}
                    </svg>
                    <div className="w-32 h-10 mt-4 border-b-2 border-dotted border-gray-500"></div>
                </div>
            ))}
        </div>
    </div>
);

const SymmetryDrawingSheet: React.FC<{ data: SymmetryDrawingData }> = ({ data }) => {
    const { gridDim, dots, axis } = data;
    const cellSize = 25;
    const totalSize = gridDim * cellSize;

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
            <div className="flex justify-center">
                 <svg width={totalSize} height={totalSize} className="bg-white dark:bg-gray-700/50">
                    {/* Grid lines */}
                    {Array.from({ length: gridDim + 1 }).map((_, i) => (
                        <g key={`grid-${i}`}>
                            <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} className="stroke-gray-200 dark:stroke-gray-600" />
                            <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} className="stroke-gray-200 dark:stroke-gray-600" />
                        </g>
                    ))}
                    {/* Symmetry Axis */}
                    <line 
                        x1={axis === 'vertical' ? totalSize / 2 : 0}
                        y1={axis === 'vertical' ? 0 : totalSize / 2}
                        x2={axis === 'vertical' ? totalSize / 2 : totalSize}
                        y2={axis === 'vertical' ? totalSize : totalSize / 2}
                        className="stroke-red-500"
                        strokeDasharray="4"
                        strokeWidth="2"
                    />
                    {/* Dots */}
                    {dots?.map((dot, index) => (
                        <circle 
                            key={`dot-${index}`}
                            cx={dot.x * cellSize + cellSize / 2}
                            cy={dot.y * cellSize + cellSize / 2}
                            r="5"
                            className="fill-blue-500"
                        />
                    ))}
                 </svg>
            </div>
        </div>
    );
};

const FindDifferentStringSheet: React.FC<{ data: FindDifferentStringData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-inner">
            <table className="w-full">
                <tbody>
                    {data.rows?.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.items?.map((item, itemIndex) => (
                                <td key={itemIndex} className="text-center font-mono text-lg p-1">
                                    {item}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const DotPaintingSheet: React.FC<{ data: DotPaintingData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <div className="grid grid-cols-2 gap-4 text-center text-sm mb-4">
            <p>{data.prompt1}</p>
            <p>{data.prompt2}</p>
        </div>
        <div className="flex justify-center">
            <svg viewBox={data.svgViewBox} className="w-full h-auto max-w-lg border">
                <g>
                    {data.gridPaths?.map((path, index) => (
                        <path key={index} d={path} fill="none" stroke="lightgray" strokeWidth="0.5" />
                    ))}
                    {data.dots?.map((dot, index) => (
                        <circle key={index} cx={dot.cx} cy={dot.cy} r="2" fill={dot.color} />
                    ))}
                </g>
            </svg>
        </div>
    </div>
);

const AbcConnectSheet: React.FC<{ data: AbcConnectData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.puzzles?.map(puzzle => {
                const grid = Array(puzzle.gridDim).fill(null).map(() => Array(puzzle.gridDim).fill(null));
                puzzle.points.forEach(p => {
                    grid[p.y][p.x] = p.letter;
                });
                return (
                    <div key={puzzle.id} className="flex flex-col items-center">
                        <h4 className="font-bold mb-2">Bulmaca {puzzle.id}</h4>
                        <div className="border border-gray-400">
                            {grid.map((row, rIdx) => (
                                <div key={rIdx} className="flex">
                                    {row.map((cell, cIdx) => (
                                        <div key={cIdx} className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 font-bold">
                                            {cell}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
);

const PasswordFinderSheet: React.FC<{ data: PasswordFinderData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {data.words?.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded-lg border">
                    <div className="w-6 h-6 border rounded shrink-0"></div>
                    <span>{item.word}</span>
                    <span className="ml-auto font-bold text-red-500">{item.passwordLetter}</span>
                </div>
            ))}
        </div>
        <div className="mt-8 flex justify-center items-center gap-2">
            <h4 className="font-bold">Şifre:</h4>
            {Array.from({ length: data.passwordLength }).map((_, i) => (
                <div key={i} className="w-10 h-10 border-b-2 border-gray-500"></div>
            ))}
        </div>
    </div>
);

const SyllableCompletionSheet: React.FC<{ data: SyllableCompletionData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-2">
                {data.wordParts?.map((part, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <span>{part.first}</span>
                        <div className="w-16 h-8 border-b-2 border-dotted"></div>
                        <span>{part.second}</span>
                    </div>
                ))}
            </div>
            <div className="md:w-1/3 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <h4 className="font-bold text-center mb-2">Heceler</h4>
                <div className="grid grid-cols-2 gap-2 text-center">
                    {data.syllables?.map((syl, i) => <span key={i} className="p-1 bg-white dark:bg-gray-700 rounded">{syl}</span>)}
                </div>
            </div>
        </div>
        <div className="mt-8">
            <h4 className="font-bold mb-2">{data.storyPrompt}</h4>
            <div className="w-full h-40 border-2 border-dashed rounded-md p-2"></div>
        </div>
    </div>
);

const SynonymWordSearchSheet: React.FC<{ data: SynonymWordSearchData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <WordSearchGrid data={{ grid: data.grid, words: [] }} />
            </div>
            <div>
                <h4 className="font-bold mb-2 text-teal-600 dark:text-teal-400">Kelimeler:</h4>
                <ul className="space-y-1">
                    {data.wordsToMatch?.map((item, index) => (
                        <li key={index}>{item.word} = <span className="font-semibold">{item.synonym}</span></li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);

const WordConnectSheet: React.FC<{ data: WordConnectData }> = ({ data }) => {
    const cellSize = 50;
    const totalSize = data.gridDim * cellSize;
    const colors = ['#e11d48', '#d946ef', '#2563eb', '#16a34a', '#f97316', '#ca8a04'];
    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
            <div className="flex justify-center">
                <svg width={totalSize} height={totalSize} className="bg-white dark:bg-gray-700 border">
                    {Array.from({ length: data.gridDim + 1 }).map((_, i) => (
                        <g key={i}>
                            <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} className="stroke-gray-200 dark:stroke-gray-600" />
                            <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} className="stroke-gray-200 dark:stroke-gray-600" />
                        </g>
                    ))}
                    {data.points?.map(p => (
                        <text key={p.word} x={p.x * cellSize + cellSize / 2} y={p.y * cellSize + cellSize / 2}
                            textAnchor="middle" dominantBaseline="central"
                            fontSize="12" fill={colors[p.pairId % colors.length]}>{p.word}</text>
                    ))}
                </svg>
            </div>
        </div>
    );
};

const SpiralPuzzleSheet: React.FC<{ data: SpiralPuzzleData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <table className="table-fixed w-full">
                    <tbody>
                        {data.grid?.map((row, rIdx) => (
                            <tr key={rIdx}>
                                {row.map((cell, cIdx) => {
                                    const start = data.wordStarts?.find(s => s.row === rIdx && s.col === cIdx);
                                    return (
                                        <td key={cIdx} className="border w-8 h-8 text-center relative">
                                            {cell}
                                            {start && <span className="absolute top-0 left-0 text-xs font-bold text-red-500">{start.id}</span>}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div>
                <h4 className="font-bold mb-2">İpuçları</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                    {data.clues?.map((clue, i) => <li key={i}>{clue}</li>)}
                </ol>
            </div>
        </div>
    </div>
);

const CrosswordSheet: React.FC<{ data: CrosswordData }> = ({ data }) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="md:col-span-2">
                <table className="table-fixed border-collapse">
                    <tbody>
                        {data.grid?.map((row, rIdx) => (
                            <tr key={rIdx}>
                                {row.map((cell, cIdx) => {
                                    const isPassword = data.passwordCells?.some(p => p.row === rIdx && p.col === cIdx);
                                    const clue = data.clues?.find(c => c.text.startsWith(`${rIdx+1},${cIdx+1}`)); // This is a weak link
                                    return (
                                        <td key={cIdx} className={`w-8 h-8 border text-center ${!cell ? 'bg-black' : ''} ${isPassword ? 'bg-yellow-200' : 'bg-white'}`}>
                                            {cell}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div>
                <h4 className="font-bold mb-2">İpuçları</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                    {data.clues?.map((clue, i) => <li key={i}>{clue.text}</li>)}
                </ol>
            </div>
        </div>
         <div className="mt-8 flex justify-center items-center gap-2">
            <h4 className="font-bold">Şifre:</h4>
            {Array.from({ length: data.passwordLength }).map((_, i) => (
                <div key={i} className="w-10 h-10 border-b-2 border-gray-500 bg-yellow-200"></div>
            ))}
        </div>
    </div>
);

const JumbledWordStorySheet: React.FC<{ data: JumbledWordStoryData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.puzzles?.map((p, i) => (
                <div key={i} className="p-2 border rounded-lg">
                    <div className="flex justify-center gap-1 mb-2">
                        {p.jumbled.map((l, li) => <span key={li} className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded">{l}</span>)}
                    </div>
                    <div className="h-8 border-b-2"></div>
                </div>
            ))}
        </div>
        <div className="mt-8">
            <h4 className="font-bold mb-2">{data.storyPrompt}</h4>
            <div className="w-full h-40 border-2 border-dashed rounded-md p-2"></div>
        </div>
    </div>
);

const HomonymSentenceSheet: React.FC<{ data: HomonymSentenceData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.items?.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg flex items-start gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center shrink-0">
                         {item.imageBase64 && <img src={`data:image/png;base64,${item.imageBase64}`} alt={item.word} className="w-full h-full object-contain" />}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-lg mb-2">{item.word}</h4>
                        <div className="h-8 border-b-2 mb-2"></div>
                        <div className="h-8 border-b-2"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const WordGridPuzzleSheet: React.FC<{ data: WordGridPuzzleData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                 <table className="table-fixed border-collapse">
                    <tbody>
                        {data.grid?.map((row, rIdx) => (
                            <tr key={rIdx}>
                                {row.map((cell, cIdx) => (
                                    <td key={cIdx} className={`w-8 h-8 border text-center font-bold ${!cell ? 'bg-gray-200' : 'bg-white'}`}>
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div>
                <h4 className="font-bold mb-2">Kelimeler</h4>
                <ul className="space-y-1">
                    {data.wordList?.map(w => <li key={w}>{w}</li>)}
                </ul>
            </div>
        </div>
    </div>
);

const ProverbSayingSortSheet: React.FC<{ data: ProverbSayingSortData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="flex justify-center gap-8">
            <div className="w-1/3">
                <h4 className="font-bold text-center border-b-2 mb-2">Atasözü</h4>
                <div className="h-80 space-y-2"></div>
            </div>
            <div className="w-1/3">
                 <h4 className="font-bold text-center border-b-2 mb-2">Özdeyiş</h4>
                 <div className="h-80 space-y-2"></div>
            </div>
        </div>
        <div className="mt-4 p-4 border rounded-lg">
            <h4 className="font-bold text-center mb-2">Cümleler</h4>
            <ul className="list-disc list-inside">
                {data.items?.map(item => <li key={item.text}>{item.text}</li>)}
            </ul>
        </div>
    </div>
);

const HomonymImageMatchSheet: React.FC<{ data: HomonymImageMatchData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="flex justify-center gap-8">
            <div className="space-y-4">
                {data.leftImages?.map(img => (
                    <div key={img.id} className="w-24 h-24 bg-gray-100 rounded border flex items-center justify-center">
                        {img.imageBase64 && <img src={`data:image/png;base64,${img.imageBase64}`} className="w-full h-full object-contain p-1" />}
                    </div>
                ))}
            </div>
            <div className="space-y-4">
                {data.rightImages?.map(img => (
                     <div key={img.id} className="w-24 h-24 bg-gray-100 rounded border flex items-center justify-center">
                        {img.imageBase64 && <img src={`data:image/png;base64,${img.imageBase64}`} className="w-full h-full object-contain p-1" />}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const AntonymFlowerPuzzleSheet: React.FC<{ data: AntonymFlowerPuzzleData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-3 gap-4">
            {data.puzzles?.map((p, i) => (
                <div key={i} className="p-2 border rounded flex flex-col items-center">
                    <div className="font-bold mb-1">{p.centerWord}</div>
                    <div className="flex flex-wrap justify-center gap-1 text-xs">
                        {p.petalLetters.map((l, li) => <span key={li} className="w-5 h-5 border rounded flex items-center justify-center">{l}</span>)}
                    </div>
                    <div className="h-8 border-b-2 mt-1 w-full"></div>
                </div>
            ))}
        </div>
    </div>
);

const ProverbWordChainSheet: React.FC<{ data: ProverbWordChainData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="p-4 border rounded flex flex-wrap justify-center gap-2">
            {data.wordCloud?.map((w, i) => <span key={i} className="px-2 py-1 rounded" style={{backgroundColor: w.color}}>{w.word}</span>)}
        </div>
        <div className="mt-8">
            <ol className="list-decimal list-inside space-y-2">
                {data.solutions?.map((_, i) => <li key={i}><div className="h-8 border-b-2"></div></li>)}
            </ol>
        </div>
    </div>
);

const ThematicOddOneOutSheet: React.FC<{ data: ThematicOddOneOutData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="space-y-4">
            {data.rows?.map((row, i) => (
                <div key={i} className="p-2 border rounded flex justify-around">
                    {row.words.map(w => <span key={w}>{w}</span>)}
                </div>
            ))}
        </div>
    </div>
);

const SynonymAntonymGridSheet: React.FC<{ data: SynonymAntonymGridData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-3 gap-4">
            <div>
                <h4 className="font-bold">Eş Anlamlı</h4>
                <ul>{data.synonyms?.map(s => <li key={s.word}>{s.word}</li>)}</ul>
            </div>
            <div className="col-span-2"><WordSearchGrid data={{grid: data.grid, words:[]}}/></div>
        </div>
    </div>
);

const PunctuationColoringSheet: React.FC<{ data: PunctuationColoringData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{data.prompt}</p>
        <div className="space-y-2">
            {data.sentences?.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded" style={{backgroundColor: s.color}}></div>
                    <span>{s.text}</span>
                </div>
            ))}
        </div>
    </div>
);


const Worksheet: React.FC<WorksheetProps> = ({ activityType, data, styles }) => {
  if (!activityType || !data) {
    return null; // Or some placeholder
  }

  const renderContent = () => {
    switch (activityType) {
        case ActivityType.WORD_SEARCH: return <WordSearchGrid data={data as WordSearchData} />;
        case ActivityType.ANAGRAM: return <AnagramList data={data as AnagramData[]} />;
        case ActivityType.FIND_THE_DIFFERENCE: return <FindTheDifferenceSheet data={data as FindTheDifferenceData} />;
        case ActivityType.MATH_PUZZLE: return <MathPuzzleSheet data={data as MathPuzzleData} />;
        case ActivityType.STORY_COMPREHENSION: return <StoryComprehensionSheet data={data as StoryData} />;
        case ActivityType.STROOP_TEST: return <StroopTestSheet data={data as StroopTestData} />;
        case ActivityType.NUMBER_PATTERN: return <NumberPatternSheet data={data as NumberPatternData} />;
        case ActivityType.SPELLING_CHECK: return <SpellingCheckSheet data={data as SpellingCheckData} />;
        case ActivityType.LETTER_GRID_TEST: return <LetterGridTestSheet data={data as LetterGridTestData} />;
        case ActivityType.NUMBER_SEARCH: return <NumberSearchSheet data={data as NumberSearchData} />;
        case ActivityType.WORD_MEMORY: return <WordMemorySheet data={data as WordMemoryData} />;
        case ActivityType.STORY_CREATION_PROMPT: return <StoryCreationPromptSheet data={data as StoryCreationPromptData} />;
        case ActivityType.WORD_COMPARISON: return <WordComparisonSheet data={data as WordComparisonData} />;
        case ActivityType.WORDS_IN_STORY: return <WordsInStorySheet data={data as WordsInStoryData} />;
        case ActivityType.ODD_ONE_OUT: return <OddOneOutSheet data={data as OddOneOutData} />;
        case ActivityType.SHAPE_MATCHING: return <ShapeMatchingSheet data={data as ShapeMatchingData} />;
        case ActivityType.SYMBOL_CIPHER: return <SymbolCipherSheet data={data as SymbolCipherData} />;
        case ActivityType.PROVERB_FILL_IN_THE_BLANK: return <ProverbFillSheet data={data as ProverbFillData} />;
        case ActivityType.LETTER_BRIDGE: return <LetterBridgeSheet data={data as LetterBridgeData} />;
        case ActivityType.FIND_THE_DUPLICATE_IN_ROW: return <FindDuplicateSheet data={data as FindDuplicateData} />;
        case ActivityType.WORD_LADDER: return <WordLadderSheet data={data as WordLadderData} />;
        case ActivityType.FIND_IDENTICAL_WORD: return <FindIdenticalWordSheet data={data as FindIdenticalWordData} />;
        case ActivityType.WORD_FORMATION: return <WordFormationSheet data={data as WordFormationData} />;
        case ActivityType.REVERSE_WORD: return <ReverseWordSheet data={data as ReverseWordData} />;
        case ActivityType.FIND_LETTER_PAIR: return <FindLetterPairSheet data={data as FindLetterPairData} />;
        case ActivityType.WORD_GROUPING: return <WordGroupingSheet data={data as WordGroupingData} />;
        case ActivityType.VISUAL_MEMORY: return <VisualMemorySheet data={data as VisualMemoryData} />;
        case ActivityType.STORY_ANALYSIS: return <StoryAnalysisSheet data={data as StoryAnalysisData} />;
        case ActivityType.COORDINATE_CIPHER: return <CoordinateCipherSheet data={data as CoordinateCipherData} />;
        case ActivityType.PROVERB_SEARCH: return <ProverbSearchSheet data={data as ProverbSearchData} />;
        case ActivityType.TARGET_SEARCH: return <TargetSearchSheet data={data as TargetSearchData} />;
        case ActivityType.SHAPE_NUMBER_PATTERN: return <ShapeNumberPatternSheet data={data as ShapeNumberPatternData} />;
        case ActivityType.GRID_DRAWING: return <GridDrawingSheet data={data as GridDrawingData} />;
        case ActivityType.COLOR_WHEEL_MEMORY: return <ColorWheelSheet data={data as ColorWheelMemoryData} />;
        case ActivityType.IMAGE_COMPREHENSION: return <ImageComprehensionSheet data={data as ImageComprehensionData} />;
        case ActivityType.CHARACTER_MEMORY: return <CharacterMemorySheet data={data as CharacterMemoryData} />;
        case ActivityType.STORY_SEQUENCING: return <StorySequencingSheet data={data as StorySequencingData} />;
        case ActivityType.CHAOTIC_NUMBER_SEARCH: return <ChaoticNumberSearchSheet data={data as ChaoticNumberSearchData} />;
        case ActivityType.BLOCK_PAINTING: return <BlockPaintingSheet data={data as BlockPaintingData} />;
        case ActivityType.MINI_WORD_GRID: return <MiniWordGridSheet data={data as MiniWordGridData} />;
        case ActivityType.VISUAL_ODD_ONE_OUT: return <VisualOddOneOutSheet data={data as VisualOddOneOutData} />;
        case ActivityType.SHAPE_COUNTING: return <ShapeCountingSheet data={data as ShapeCountingData} />;
        case ActivityType.SYMMETRY_DRAWING: return <SymmetryDrawingSheet data={data as SymmetryDrawingData} />;
        case ActivityType.BURDON_TEST: return <BurdonTestSheet data={data as LetterGridTestData} />;
        case ActivityType.FIND_DIFFERENT_STRING: return <FindDifferentStringSheet data={data as FindDifferentStringData} />;
        case ActivityType.DOT_PAINTING: return <DotPaintingSheet data={data as DotPaintingData} />;
        case ActivityType.ABC_CONNECT: return <AbcConnectSheet data={data as AbcConnectData} />;
        case ActivityType.PASSWORD_FINDER: return <PasswordFinderSheet data={data as PasswordFinderData} />;
        case ActivityType.SYLLABLE_COMPLETION: return <SyllableCompletionSheet data={data as SyllableCompletionData} />;
        case ActivityType.SYNONYM_WORD_SEARCH: return <SynonymWordSearchSheet data={data as SynonymWordSearchData} />;
        case ActivityType.WORD_CONNECT: return <WordConnectSheet data={data as WordConnectData} />;
        case ActivityType.SPIRAL_PUZZLE: return <SpiralPuzzleSheet data={data as SpiralPuzzleData} />;
        case ActivityType.CROSSWORD: return <CrosswordSheet data={data as CrosswordData} />;
        case ActivityType.JUMBLED_WORD_STORY: return <JumbledWordStorySheet data={data as JumbledWordStoryData} />;
        case ActivityType.HOMONYM_SENTENCE_WRITING: return <HomonymSentenceSheet data={data as HomonymSentenceData} />;
        case ActivityType.WORD_GRID_PUZZLE: return <WordGridPuzzleSheet data={data as WordGridPuzzleData} />;
        case ActivityType.PROVERB_SAYING_SORT: return <ProverbSayingSortSheet data={data as ProverbSayingSortData} />;
        case ActivityType.HOMONYM_IMAGE_MATCH: return <HomonymImageMatchSheet data={data as HomonymImageMatchData} />;
        case ActivityType.ANTONYM_FLOWER_PUZZLE: return <AntonymFlowerPuzzleSheet data={data as AntonymFlowerPuzzleData} />;
        case ActivityType.PROVERB_WORD_CHAIN: return <ProverbWordChainSheet data={data as ProverbWordChainData} />;
        case ActivityType.THEMATIC_ODD_ONE_OUT: return <ThematicOddOneOutSheet data={data as ThematicOddOneOutData} />;
        case ActivityType.SYNONYM_ANTONYM_GRID: return <SynonymAntonymGridSheet data={data as SynonymAntonymGridData} />;
        case ActivityType.PUNCTUATION_COLORING: return <PunctuationColoringSheet data={data as PunctuationColoringData} />;
        default:
            return <p>Bu etkinlik türü için bir görünüm bulunamadı.</p>;
    }
  };

  return (
    <div className="worksheet-container bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8" style={styles}>
      {renderContent()}
    </div>
  );
};

export default Worksheet;
