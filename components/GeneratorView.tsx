

import React, { useState, CSSProperties } from 'react';
import { Activity, ActivityType, WorksheetData } from '../types';
import { 
    generateWordSearchFromAI, 
    generateAnagramsFromAI, 
    generateMathPuzzlesFromAI, 
    generateStoryFromAI,
    generateStroopTestFromAI,
    generateNumberPatternsFromAI,
    generateSpellingChecksFromAI,
    generateLetterGridFromAI,
    generateNumberSearchFromAI,
    generateWordMemoryFromAI,
    generateStoryPromptFromAI,
    generateFindTheDifferenceFromAI,
    generateWordComparisonFromAI,
    generateWordsInStoryFromAI,
    generateOddOneOutFromAI,
    generateShapeMatchingFromAI,
    generateSymbolCipherFromAI,
    generateProverbFillFromAI,
    generateLetterBridgeFromAI,
    generateFindDuplicateFromAI,
    generateWordLadderFromAI,
    generateFindIdenticalWordFromAI,
    generateWordFormationFromAI,
    generateReverseWordFromAI,
    generateFindLetterPairFromAI,
} from '../services/geminiService';
import Worksheet from './Worksheet';

interface GeneratorViewProps {
  activity: Activity;
  onBack: () => void;
}

const GeneratorView: React.FC<GeneratorViewProps> = ({ activity, onBack }) => {
  const [generationMode, setGenerationMode] = useState<'ai' | 'algorithmic'>('ai');
  const [topic, setTopic] = useState<string>('Hayvanlar');
  const [itemCount, setItemCount] = useState<number>(8);
  const [gridSize, setGridSize] = useState<number>(12);
  const [targetLetters, setTargetLetters] = useState<string>('a, b, d, g');
  const [targetPair, setTargetPair] = useState<string>('tr');
  const [difficulty, setDifficulty] = useState<'Kolay'|'Orta'|'Zor'>('Orta');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [worksheetData, setWorksheetData] = useState<WorksheetData>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setWorksheetData(null);

    try {
      let data: WorksheetData = null;
      if (generationMode === 'ai') {
        switch (activity.id) {
          case ActivityType.WORD_SEARCH:
            data = await generateWordSearchFromAI(topic, gridSize, itemCount);
            break;
          case ActivityType.ANAGRAM:
            data = await generateAnagramsFromAI(topic, itemCount);
            break;
          case ActivityType.MATH_PUZZLE:
            data = await generateMathPuzzlesFromAI(topic, itemCount);
            break;
          case ActivityType.STORY_COMPREHENSION:
            data = await generateStoryFromAI(topic);
            break;
          case ActivityType.STROOP_TEST:
            data = await generateStroopTestFromAI(itemCount * 2);
            break;
          case ActivityType.NUMBER_PATTERN:
            data = await generateNumberPatternsFromAI(itemCount, difficulty);
            break;
          case ActivityType.SPELLING_CHECK:
            data = await generateSpellingChecksFromAI(topic, itemCount / 2);
            break;
          case ActivityType.LETTER_GRID_TEST:
            data = await generateLetterGridFromAI(gridSize, targetLetters);
            break;
          case ActivityType.NUMBER_SEARCH:
            data = await generateNumberSearchFromAI(1, 50);
            break;
           case ActivityType.WORD_MEMORY:
            data = await generateWordMemoryFromAI(topic, 10, 20); // 10 to memorize, 20 in test
            break;
           case ActivityType.STORY_CREATION_PROMPT:
            data = await generateStoryPromptFromAI(topic, 5);
            break;
           case ActivityType.FIND_THE_DIFFERENCE:
             data = await generateFindTheDifferenceFromAI(topic, itemCount);
             break;
           case ActivityType.WORD_COMPARISON:
             data = await generateWordComparisonFromAI(topic);
             break;
           case ActivityType.WORDS_IN_STORY:
             data = await generateWordsInStoryFromAI(topic);
             break;
           case ActivityType.ODD_ONE_OUT:
             data = await generateOddOneOutFromAI(topic, itemCount / 2);
             break;
           case ActivityType.SHAPE_MATCHING:
             data = await generateShapeMatchingFromAI(itemCount);
             break;
           case ActivityType.SYMBOL_CIPHER:
             data = await generateSymbolCipherFromAI(itemCount / 2);
             break;
            case ActivityType.PROVERB_FILL_IN_THE_BLANK:
                data = await generateProverbFillFromAI(itemCount);
                break;
            case ActivityType.LETTER_BRIDGE:
                data = await generateLetterBridgeFromAI(itemCount);
                break;
            case ActivityType.FIND_THE_DUPLICATE_IN_ROW:
                data = await generateFindDuplicateFromAI(10, 15); // 10 rows, 15 cols
                break;
            case ActivityType.WORD_LADDER:
                data = await generateWordLadderFromAI(itemCount / 2);
                break;
            case ActivityType.FIND_IDENTICAL_WORD:
                data = await generateFindIdenticalWordFromAI(itemCount * 2);
                break;
            case ActivityType.WORD_FORMATION:
                data = await generateWordFormationFromAI(itemCount / 2);
                break;
            case ActivityType.REVERSE_WORD:
                data = await generateReverseWordFromAI(topic, itemCount);
                break;
            case ActivityType.FIND_LETTER_PAIR:
                data = await generateFindLetterPairFromAI(gridSize, targetPair);
                break;
          default:
             alert('Yapay zeka üretici henüz bu etkinlik için mevcut değil.');
             break;
        }
      } else {
        alert('Algoritmik üretici henüz bu etkinlik için mevcut değil.');
      }
      setWorksheetData(data);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSettings = () => {
    const noSettings = [ActivityType.NUMBER_SEARCH, ActivityType.WORD_MEMORY, ActivityType.STORY_CREATION_PROMPT, ActivityType.WORD_COMPARISON, ActivityType.WORDS_IN_STORY, ActivityType.FIND_THE_DUPLICATE_IN_ROW];
    if (noSettings.includes(activity.id) && activity.id !== ActivityType.STORY_CREATION_PROMPT && activity.id !== ActivityType.WORD_MEMORY) {
        // Keep topic for some
        if(![ActivityType.NUMBER_SEARCH, ActivityType.FIND_THE_DUPLICATE_IN_ROW].includes(activity.id)){
             return <div className="mb-4">
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Konu</label>
              <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)}
                className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder="Örn: Meyveler, Uzay"
              />
            </div>
        }
        return <p className="text-sm text-gray-500 dark:text-gray-400">Bu etkinlik için özel ayar bulunmamaktadır.</p>
    }


    const showTopic = ![ActivityType.STROOP_TEST, ActivityType.LETTER_GRID_TEST, ActivityType.NUMBER_SEARCH, ActivityType.NUMBER_PATTERN, ActivityType.SHAPE_MATCHING, ActivityType.SYMBOL_CIPHER, ActivityType.PROVERB_FILL_IN_THE_BLANK, ActivityType.LETTER_BRIDGE, ActivityType.FIND_THE_DUPLICATE_IN_ROW, ActivityType.FIND_IDENTICAL_WORD, ActivityType.WORD_FORMATION, ActivityType.FIND_LETTER_PAIR].includes(activity.id);
    const showItemCount = [ActivityType.WORD_SEARCH, ActivityType.ANAGRAM, ActivityType.MATH_PUZZLE, ActivityType.STROOP_TEST, ActivityType.NUMBER_PATTERN, ActivityType.SPELLING_CHECK, ActivityType.FIND_THE_DIFFERENCE, ActivityType.ODD_ONE_OUT, ActivityType.SHAPE_MATCHING, ActivityType.SYMBOL_CIPHER, ActivityType.PROVERB_FILL_IN_THE_BLANK, ActivityType.LETTER_BRIDGE, ActivityType.WORD_LADDER, ActivityType.FIND_IDENTICAL_WORD, ActivityType.WORD_FORMATION, ActivityType.REVERSE_WORD].includes(activity.id);
    const showGridSize = [ActivityType.WORD_SEARCH, ActivityType.LETTER_GRID_TEST, ActivityType.FIND_LETTER_PAIR].includes(activity.id);
    const showTargetLetters = activity.id === ActivityType.LETTER_GRID_TEST;
    const showTargetPair = activity.id === ActivityType.FIND_LETTER_PAIR;
    const showDifficulty = activity.id === ActivityType.NUMBER_PATTERN;
    
    let itemCountLabel = "Öğe Sayısı";
    if (activity.id === ActivityType.WORD_SEARCH || activity.id === ActivityType.ANAGRAM || activity.id === ActivityType.REVERSE_WORD) itemCountLabel = "Kelime Sayısı";
    if (activity.id === ActivityType.MATH_PUZZLE || activity.id === ActivityType.WORD_LADDER) itemCountLabel = "Bulmaca Sayısı";
    if (activity.id === ActivityType.STROOP_TEST) itemCountLabel = "Renk/Kelime Sayısı";
    if (activity.id === ActivityType.NUMBER_PATTERN) itemCountLabel = "Örüntü Sayısı";
    if (activity.id === ActivityType.SPELLING_CHECK) itemCountLabel = "Soru Sayısı";
    if (activity.id === ActivityType.FIND_THE_DIFFERENCE || activity.id === ActivityType.SHAPE_MATCHING) itemCountLabel = "Satır Sayısı";
    if (activity.id === ActivityType.ODD_ONE_OUT || activity.id === ActivityType.FIND_IDENTICAL_WORD) itemCountLabel = "Grup Sayısı";
    if (activity.id === ActivityType.SYMBOL_CIPHER) itemCountLabel = "Şifreli Kelime Sayısı";
    if (activity.id === ActivityType.PROVERB_FILL_IN_THE_BLANK) itemCountLabel = "Atasözü Sayısı";
    if (activity.id === ActivityType.LETTER_BRIDGE) itemCountLabel = "Kelime Çifti Sayısı";
    if (activity.id === ActivityType.WORD_FORMATION) itemCountLabel = "Harf Seti Sayısı";

    return (
      <>
        {showTopic && <div className="mb-4">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Konu</label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            placeholder="Örn: Meyveler, Uzay"
          />
        </div>}

        {showGridSize && (
          <div className="mb-4">
            <label htmlFor="gridSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tablo Boyutu: {gridSize}x{gridSize}</label>
            <input
              type="range" id="gridSize" min="8" max="20" value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}
        
        {showItemCount && (
            <div className="mb-4">
            <label htmlFor="itemCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{itemCountLabel}: {itemCount}</label>
            <input
                type="range" id="itemCount" min="4" max="16" value={itemCount}
                onChange={(e) => setItemCount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            </div>
        )}

        {showTargetLetters && (
            <div className="mb-4">
                <label htmlFor="targetLetters" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hedef Harfler (virgülle ayırın)</label>
                <input
                    type="text" id="targetLetters" value={targetLetters}
                    onChange={(e) => setTargetLetters(e.target.value)}
                    className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    placeholder="a, b, c"
                />
            </div>
        )}

        {showTargetPair && (
            <div className="mb-4">
                <label htmlFor="targetPair" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hedef İkili</label>
                <input
                    type="text" id="targetPair" value={targetPair} maxLength={2}
                    onChange={(e) => setTargetPair(e.target.value)}
                    className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    placeholder="tr"
                />
            </div>
        )}

        {showDifficulty && (
            <div className="mb-4">
                 <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zorluk</label>
                 <select 
                    id="difficulty" 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value as 'Kolay'|'Orta'|'Zor')}
                    className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                 >
                    <option>Kolay</option>
                    <option>Orta</option>
                    <option>Zor</option>
                 </select>
            </div>
        )}
      </>
    );
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleSave = () => {
      alert('Kaydetme özelliği yakında gelecek! Şimdilik yazdırma menüsünden PDF olarak kaydedebilirsiniz.');
  };

  // FIX: Cast the style object to CSSProperties to allow for custom properties which are not in the standard type definition.
  const worksheetStyles: CSSProperties = {
    fontFamily: 'sans-serif',
    fontSize: '16px',
    '--worksheet-border-color': '#e5e7eb',
    '--worksheet-border-width': '1px',
  } as CSSProperties;

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={onBack} className="mb-6 text-teal-600 dark:text-teal-400 hover:underline">
        <i className="fa-solid fa-arrow-left mr-2"></i>Geri
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-teal-500 dark:bg-teal-600 text-white rounded-full flex items-center justify-center mr-4 shrink-0">
                <i className={`${activity.icon} fa-2x`}></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{activity.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{activity.description}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Üretim Yöntemi</label>
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setGenerationMode('ai')}
                  className={`flex-1 py-2 px-4 rounded-l-md text-sm font-medium focus:outline-none transition-colors ${generationMode === 'ai' ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>Yapay Zeka
                </button>
                <button
                  onClick={() => setGenerationMode('algorithmic')}
                  disabled
                  title="Algoritmik üretici henüz mevcut değil"
                  className={`flex-1 py-2 px-4 rounded-r-md text-sm font-medium focus:outline-none transition-colors ${generationMode === 'algorithmic' ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <i className="fa-solid fa-cogs mr-2"></i>Algoritmik
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-lg font-semibold mb-4">Ayarlar</h3>
              {renderSettings()}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Oluşturuluyor...
                </>
              ) : (
                <><i className="fa-solid fa-play mr-2"></i>Etkinlik Oluştur</>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}
            
            {worksheetData && (
                <>
                    <div className="flex justify-end gap-2 mb-4 print-hidden">
                        <button onClick={handlePrint} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            <i className="fa-solid fa-print mr-2"></i>Yazdır
                        </button>
                         <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            <i className="fa-solid fa-save mr-2"></i>Kaydet
                        </button>
                    </div>
                    {/* FIX: Added missing 'styles' property */}
                    <Worksheet activityType={activity.id} data={worksheetData} styles={worksheetStyles} />
                </>
            )}
            
            {!isLoading && !worksheetData && (
                 <div className="flex flex-col items-center justify-center text-center h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10 border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <i className={`${activity.icon} fa-3x text-gray-400 dark:text-gray-500`}></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Etkinliğiniz Burada Görünecek</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">Başlamak için soldaki panelden ayarları yapılandırın ve "Etkinlik Oluştur" düğmesine tıklayın.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default GeneratorView;
