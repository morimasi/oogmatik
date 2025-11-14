import React, { useState, useEffect } from 'react';
import { Activity, ActivityType, WorksheetData } from '../types';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';
import { 
    generateWordSearchFromAI, generateAnagramsFromAI, generateMathPuzzlesFromAI, generateStoryFromAI,
    generateStroopTestFromAI, generateNumberPatternsFromAI, generateSpellingChecksFromAI, generateLetterGridFromAI,
    generateNumberSearchFromAI, generateWordMemoryFromAI, generateStoryPromptFromAI, generateFindTheDifferenceFromAI,
    generateWordComparisonFromAI, generateWordsInStoryFromAI, generateOddOneOutFromAI, generateShapeMatchingFromAI,
    generateSymbolCipherFromAI, generateProverbFillFromAI, generateLetterBridgeFromAI, generateFindDuplicateFromAI,
    generateWordLadderFromAI, generateFindIdenticalWordFromAI, generateWordFormationFromAI, generateReverseWordFromAI,
    generateFindLetterPairFromAI, generateWordGroupingFromAI, generateVisualMemoryFromAI, generateStoryAnalysisFromAI,
    generateCoordinateCipherFromAI, generateProverbSearchFromAI, generateTargetSearchFromAI, generateShapeNumberPatternFromAI,
    generateGridDrawingFromAI, generateColorWheelMemoryFromAI, generateImageComprehensionFromAI, generateCharacterMemoryFromAI,
    generateStorySequencingFromAI, generateChaoticNumberSearchFromAI, generateBlockPaintingFromAI, generateMiniWordGridFromAI,
    generateVisualOddOneOutFromAI, generateShapeCountingFromAI, generateSymmetryDrawingFromAI, generateBurdonTestFromAI,
    generateFindDifferentStringFromAI, generateDotPaintingFromAI, generateAbcConnectFromAI, generatePasswordFinderFromAI,
    generateSyllableCompletionFromAI, generateSynonymWordSearchFromAI, generateWordConnectFromAI, generateSpiralPuzzleFromAI,
    generateCrosswordFromAI, generateJumbledWordStoryFromAI, generateHomonymSentenceFromAI, generateWordGridPuzzleFromAI,
    generateProverbSayingSortFromAI, generateHomonymImageMatchFromAI, generateAntonymFlowerPuzzleFromAI,
    generateProverbWordChainFromAI, generateThematicOddOneOutFromAI, generateSynonymAntonymGridFromAI,
    generatePunctuationColoringFromAI
} from '../services/geminiService';

interface SidebarProps {
  selectedActivity: ActivityType | null;
  onSelectActivity: (id: ActivityType | null) => void;
  setWorksheetData: (data: WorksheetData) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
}

const activitiesById = Object.fromEntries(ACTIVITIES.map(act => [act.id, act]));

const Sidebar: React.FC<SidebarProps> = ({ selectedActivity, onSelectActivity, setWorksheetData, setIsLoading, setError, isLoading }) => {
  const [openCategory, setOpenCategory] = useState<string | null>(ACTIVITY_CATEGORIES[0]?.id || null);
  
  // Settings State
  const [topic, setTopic] = useState<string>('Hayvanlar');
  const [itemCount, setItemCount] = useState<number>(8);
  const [gridSize, setGridSize] = useState<number>(12);
  const [targetLetters, setTargetLetters] = useState<string>('a, b, d, g');
  const [targetPair, setTargetPair] = useState<string>('tr');
  const [difficulty, setDifficulty] = useState<'Kolay'|'Orta'|'Zor'>('Orta');
  const [targetChar, setTargetChar] = useState<string>('7');
  const [distractorChar, setDistractorChar] = useState<string>('Z');
  
  const currentActivity = ACTIVITIES.find(act => act.id === selectedActivity);

  useEffect(() => {
    // Reset data when activity is deselected
    if (!selectedActivity) {
      setWorksheetData(null);
      setError(null);
    }
  }, [selectedActivity, setWorksheetData, setError]);

  const handleToggleCategory = (categoryId: string) => {
    setOpenCategory(prevOpenCategory => (prevOpenCategory === categoryId ? null : categoryId));
  };

  const handleGenerate = async () => {
    if (!selectedActivity) return;
    setIsLoading(true);
    setError(null);
    setWorksheetData(null);

    try {
      let data: WorksheetData = null;
      switch (selectedActivity) {
        case ActivityType.WORD_SEARCH: data = await generateWordSearchFromAI(topic, gridSize, itemCount); break;
        case ActivityType.ANAGRAM: data = await generateAnagramsFromAI(topic, itemCount); break;
        case ActivityType.MATH_PUZZLE: data = await generateMathPuzzlesFromAI(topic, itemCount); break;
        case ActivityType.STORY_COMPREHENSION: data = await generateStoryFromAI(topic); break;
        case ActivityType.STROOP_TEST: data = await generateStroopTestFromAI(itemCount * 2); break;
        case ActivityType.NUMBER_PATTERN: data = await generateNumberPatternsFromAI(itemCount, difficulty); break;
        case ActivityType.SPELLING_CHECK: data = await generateSpellingChecksFromAI(topic, itemCount / 2); break;
        case ActivityType.LETTER_GRID_TEST: data = await generateLetterGridFromAI(gridSize, targetLetters); break;
        case ActivityType.NUMBER_SEARCH: data = await generateNumberSearchFromAI(1, 50); break;
        case ActivityType.WORD_MEMORY: data = await generateWordMemoryFromAI(topic, 10, 20); break;
        case ActivityType.STORY_CREATION_PROMPT: data = await generateStoryPromptFromAI(topic, 5); break;
        case ActivityType.FIND_THE_DIFFERENCE: data = await generateFindTheDifferenceFromAI(topic, itemCount); break;
        case ActivityType.WORD_COMPARISON: data = await generateWordComparisonFromAI(topic); break;
        case ActivityType.WORDS_IN_STORY: data = await generateWordsInStoryFromAI(topic); break;
        case ActivityType.ODD_ONE_OUT: data = await generateOddOneOutFromAI(topic, itemCount / 2); break;
        case ActivityType.SHAPE_MATCHING: data = await generateShapeMatchingFromAI(itemCount); break;
        case ActivityType.SYMBOL_CIPHER: data = await generateSymbolCipherFromAI(itemCount / 2); break;
        case ActivityType.PROVERB_FILL_IN_THE_BLANK: data = await generateProverbFillFromAI(itemCount); break;
        case ActivityType.LETTER_BRIDGE: data = await generateLetterBridgeFromAI(itemCount); break;
        case ActivityType.FIND_THE_DUPLICATE_IN_ROW: data = await generateFindDuplicateFromAI(10, 15); break;
        case ActivityType.WORD_LADDER: data = await generateWordLadderFromAI(itemCount / 2); break;
        case ActivityType.FIND_IDENTICAL_WORD: data = await generateFindIdenticalWordFromAI(itemCount * 2); break;
        case ActivityType.WORD_FORMATION: data = await generateWordFormationFromAI(itemCount / 2); break;
        case ActivityType.REVERSE_WORD: data = await generateReverseWordFromAI(topic, itemCount); break;
        case ActivityType.FIND_LETTER_PAIR: data = await generateFindLetterPairFromAI(gridSize, targetPair); break;
        case ActivityType.WORD_GROUPING: data = await generateWordGroupingFromAI(topic, 15, 3); break;
        case ActivityType.VISUAL_MEMORY: data = await generateVisualMemoryFromAI(topic, 8, 16); break;
        case ActivityType.STORY_ANALYSIS: data = await generateStoryAnalysisFromAI(topic); break;
        case ActivityType.COORDINATE_CIPHER: data = await generateCoordinateCipherFromAI(topic, gridSize, itemCount); break;
        case ActivityType.PROVERB_SEARCH: data = await generateProverbSearchFromAI(gridSize); break;
        case ActivityType.TARGET_SEARCH: data = await generateTargetSearchFromAI(gridSize, targetChar, distractorChar); break;
        case ActivityType.SHAPE_NUMBER_PATTERN: data = await generateShapeNumberPatternFromAI(3); break;
        case ActivityType.GRID_DRAWING: data = await generateGridDrawingFromAI(4, 4); break;
        case ActivityType.COLOR_WHEEL_MEMORY: data = await generateColorWheelMemoryFromAI(itemCount); break;
        case ActivityType.IMAGE_COMPREHENSION: data = await generateImageComprehensionFromAI(topic, itemCount); break;
        case ActivityType.CHARACTER_MEMORY: data = await generateCharacterMemoryFromAI(topic, 8, 16); break;
        case ActivityType.STORY_SEQUENCING: data = await generateStorySequencingFromAI(topic); break;
        case ActivityType.CHAOTIC_NUMBER_SEARCH: data = await generateChaoticNumberSearchFromAI(1, 50); break;
        case ActivityType.BLOCK_PAINTING: data = await generateBlockPaintingFromAI(); break;
        case ActivityType.MINI_WORD_GRID: data = await generateMiniWordGridFromAI(); break;
        case ActivityType.VISUAL_ODD_ONE_OUT: data = await generateVisualOddOneOutFromAI(); break;
        case ActivityType.SHAPE_COUNTING: data = await generateShapeCountingFromAI(); break;
        case ActivityType.SYMMETRY_DRAWING: data = await generateSymmetryDrawingFromAI(); break;
        case ActivityType.BURDON_TEST: data = await generateBurdonTestFromAI(); break;
        case ActivityType.FIND_DIFFERENT_STRING: data = await generateFindDifferentStringFromAI(); break;
        case ActivityType.DOT_PAINTING: data = await generateDotPaintingFromAI(); break;
        case ActivityType.ABC_CONNECT: data = await generateAbcConnectFromAI(); break;
        case ActivityType.PASSWORD_FINDER: data = await generatePasswordFinderFromAI(); break;
        case ActivityType.SYLLABLE_COMPLETION: data = await generateSyllableCompletionFromAI(topic); break;
        case ActivityType.SYNONYM_WORD_SEARCH: data = await generateSynonymWordSearchFromAI(); break;
        case ActivityType.WORD_CONNECT: data = await generateWordConnectFromAI(); break;
        case ActivityType.SPIRAL_PUZZLE: data = await generateSpiralPuzzleFromAI(); break;
        case ActivityType.CROSSWORD: data = await generateCrosswordFromAI(); break;
        case ActivityType.JUMBLED_WORD_STORY: data = await generateJumbledWordStoryFromAI(topic); break;
        case ActivityType.HOMONYM_SENTENCE_WRITING: data = await generateHomonymSentenceFromAI(); break;
        case ActivityType.WORD_GRID_PUZZLE: data = await generateWordGridPuzzleFromAI(topic); break;
        case ActivityType.PROVERB_SAYING_SORT: data = await generateProverbSayingSortFromAI(); break;
        case ActivityType.HOMONYM_IMAGE_MATCH: data = await generateHomonymImageMatchFromAI(); break;
        case ActivityType.ANTONYM_FLOWER_PUZZLE: data = await generateAntonymFlowerPuzzleFromAI(); break;
        case ActivityType.PROVERB_WORD_CHAIN: data = await generateProverbWordChainFromAI(); break;
        case ActivityType.THEMATIC_ODD_ONE_OUT: data = await generateThematicOddOneOutFromAI(topic); break;
        case ActivityType.SYNONYM_ANTONYM_GRID: data = await generateSynonymAntonymGridFromAI(); break;
        case ActivityType.PUNCTUATION_COLORING: data = await generatePunctuationColoringFromAI(); break;
        default:
           setError('Yapay zeka üretici henüz bu etkinlik için mevcut değil.');
           break;
      }
      setWorksheetData(data);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSettings = (activity: Activity) => {
    const noSettingsActivities = [
        ActivityType.PASSWORD_FINDER, ActivityType.SYNONYM_WORD_SEARCH, ActivityType.WORD_CONNECT, ActivityType.SPIRAL_PUZZLE, ActivityType.CROSSWORD,
        ActivityType.BURDON_TEST, ActivityType.FIND_DIFFERENT_STRING, ActivityType.DOT_PAINTING, ActivityType.ABC_CONNECT,
        ActivityType.BLOCK_PAINTING, ActivityType.MINI_WORD_GRID, ActivityType.VISUAL_ODD_ONE_OUT, ActivityType.SHAPE_COUNTING, 
        ActivityType.SYMMETRY_DRAWING, ActivityType.GRID_DRAWING, ActivityType.CHAOTIC_NUMBER_SEARCH, ActivityType.NUMBER_SEARCH,
        ActivityType.FIND_THE_DUPLICATE_IN_ROW, ActivityType.SHAPE_NUMBER_PATTERN, ActivityType.HOMONYM_SENTENCE_WRITING,
        ActivityType.PROVERB_SAYING_SORT, ActivityType.HOMONYM_IMAGE_MATCH, ActivityType.ANTONYM_FLOWER_PUZZLE,
        ActivityType.PROVERB_WORD_CHAIN, ActivityType.SYNONYM_ANTONYM_GRID, ActivityType.PUNCTUATION_COLORING
    ];
    
    if (noSettingsActivities.includes(activity.id)) {
        return <p className="text-sm text-gray-500 dark:text-gray-400 p-4 text-center">Bu etkinlik için özel ayar bulunmamaktadır.</p>
    }

    const themeActivities = [ActivityType.SYLLABLE_COMPLETION, ActivityType.JUMBLED_WORD_STORY, ActivityType.WORD_GRID_PUZZLE, ActivityType.THEMATIC_ODD_ONE_OUT];
    if (themeActivities.includes(activity.id)) {
        return <div className="p-4"><label htmlFor="topic" className="block text-sm font-medium">Tema</label>
        <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)}
       className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
       placeholder="Örn: Birey ve Toplum"
     /></div>
   }


    const showTopic = ![ActivityType.STROOP_TEST, ActivityType.LETTER_GRID_TEST, ActivityType.NUMBER_PATTERN, ActivityType.SHAPE_MATCHING, ActivityType.SYMBOL_CIPHER, ActivityType.PROVERB_FILL_IN_THE_BLANK, ActivityType.LETTER_BRIDGE, ActivityType.FIND_IDENTICAL_WORD, ActivityType.WORD_FORMATION, ActivityType.FIND_LETTER_PAIR, ActivityType.PROVERB_SEARCH, ActivityType.TARGET_SEARCH, ActivityType.COLOR_WHEEL_MEMORY].includes(activity.id);
    const showItemCount = [ActivityType.WORD_SEARCH, ActivityType.ANAGRAM, ActivityType.MATH_PUZZLE, ActivityType.STROOP_TEST, ActivityType.NUMBER_PATTERN, ActivityType.SPELLING_CHECK, ActivityType.FIND_THE_DIFFERENCE, ActivityType.ODD_ONE_OUT, ActivityType.SHAPE_MATCHING, ActivityType.SYMBOL_CIPHER, ActivityType.PROVERB_FILL_IN_THE_BLANK, ActivityType.LETTER_BRIDGE, ActivityType.WORD_LADDER, ActivityType.FIND_IDENTICAL_WORD, ActivityType.WORD_FORMATION, ActivityType.REVERSE_WORD, ActivityType.COORDINATE_CIPHER, ActivityType.COLOR_WHEEL_MEMORY, ActivityType.IMAGE_COMPREHENSION].includes(activity.id);
    const showGridSize = [ActivityType.WORD_SEARCH, ActivityType.LETTER_GRID_TEST, ActivityType.FIND_LETTER_PAIR, ActivityType.COORDINATE_CIPHER, ActivityType.PROVERB_SEARCH, ActivityType.TARGET_SEARCH].includes(activity.id);
    const showTargetLetters = activity.id === ActivityType.LETTER_GRID_TEST;
    const showTargetPair = activity.id === ActivityType.FIND_LETTER_PAIR;
    const showDifficulty = activity.id === ActivityType.NUMBER_PATTERN;
    const showTargetSearchChars = activity.id === ActivityType.TARGET_SEARCH;
    
    let itemCountLabel = "Öğe Sayısı";
    if ([ActivityType.WORD_SEARCH, ActivityType.ANAGRAM, ActivityType.REVERSE_WORD].includes(activity.id)) itemCountLabel = "Kelime Sayısı";
    if ([ActivityType.MATH_PUZZLE, ActivityType.WORD_LADDER, ActivityType.WORD_FORMATION].includes(activity.id)) itemCountLabel = "Bulmaca/Set Sayısı";
    if ([ActivityType.FIND_THE_DIFFERENCE, ActivityType.SHAPE_MATCHING].includes(activity.id)) itemCountLabel = "Satır Sayısı";
    if ([ActivityType.ODD_ONE_OUT, ActivityType.FIND_IDENTICAL_WORD].includes(activity.id)) itemCountLabel = "Grup Sayısı";
    if (activity.id === ActivityType.COORDINATE_CIPHER) itemCountLabel = "Şifre Uzunluğu";
    if (activity.id === ActivityType.IMAGE_COMPREHENSION) itemCountLabel = "Soru Sayısı";
    
    return (
      <>
        {showTopic && <div className="mb-4">
          <label htmlFor="topic" className="block text-sm font-medium">Konu</label>
          <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)}
            className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            placeholder="Örn: Piknik, Okul"
          />
        </div>}

        {showGridSize && <div className="mb-4">
            <label htmlFor="gridSize" className="block text-sm font-medium">Tablo Boyutu: {gridSize}x{gridSize}</label>
            <input type="range" id="gridSize" min="8" max="20" value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer" />
        </div>}
        
        {showItemCount && <div className="mb-4">
            <label htmlFor="itemCount" className="block text-sm font-medium">{itemCountLabel}: {itemCount}</label>
            <input type="range" id="itemCount" min="4" max="10" value={itemCount} onChange={(e) => setItemCount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer" />
        </div>}

        {showTargetLetters && <div className="mb-4">
            <label htmlFor="targetLetters" className="block text-sm font-medium">Hedef Harfler (virgülle ayırın)</label>
            <input type="text" id="targetLetters" value={targetLetters} onChange={(e) => setTargetLetters(e.target.value)}
                className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder="a, b, c" />
        </div>}

        {showTargetPair && <div className="mb-4">
            <label htmlFor="targetPair" className="block text-sm font-medium">Hedef İkili</label>
            <input type="text" id="targetPair" value={targetPair} maxLength={2} onChange={(e) => setTargetPair(e.target.value)}
                className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder="tr" />
        </div>}

        {showTargetSearchChars && (
            <>
                <div className="mb-4">
                    <label htmlFor="targetChar" className="block text-sm font-medium">Hedef Karakter</label>
                    <input type="text" id="targetChar" value={targetChar} maxLength={1} onChange={(e) => setTargetChar(e.target.value)}
                        className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                </div>
                <div className="mb-4">
                    <label htmlFor="distractorChar" className="block text-sm font-medium">Diğer Karakter</label>
                    <input type="text" id="distractorChar" value={distractorChar} maxLength={1} onChange={(e) => setDistractorChar(e.target.value)}
                        className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                </div>
            </>
        )}

        {showDifficulty && <div className="mb-4">
             <label htmlFor="difficulty" className="block text-sm font-medium">Zorluk</label>
             <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as 'Kolay'|'Orta'|'Zor')}
                className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm">
                <option>Kolay</option>
                <option>Orta</option>
                <option>Zor</option>
             </select>
        </div>}
      </>
    );
  };

  return (
    <aside className="w-full md:w-1/3 lg:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col print-hidden shrink-0">
        <div className="flex-1 overflow-y-auto">
            {!currentActivity ? (
                 <div className="p-3">
                    <h2 className="text-sm font-semibold mb-3 px-2 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Etkinlikler</h2>
                    <nav className="space-y-1">
                        {ACTIVITY_CATEGORIES.map((category) => {
                            const categoryActivities = category.activities
                                .map(actId => ACTIVITIES.filter(a => a.id === actId))
                                .flat()
                                .filter((value, index, self) => self.findIndex(a => a.title === value.title) === index);
                            
                            if (categoryActivities.length === 0) return null;
                            const isOpen = openCategory === category.id;
                            return (
                                <div key={category.id}>
                                    <button
                                        onClick={() => handleToggleCategory(category.id)}
                                        className="w-full flex items-center justify-between text-left p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        aria-expanded={isOpen}
                                    >
                                        <div className="flex items-center">
                                            <i className={`${category.icon} w-6 text-center text-gray-500 dark:text-gray-400 mr-3`}></i>
                                            <span className="font-semibold text-sm">{category.title}</span>
                                        </div>
                                        <i className={`fa-solid fa-chevron-right text-xs text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}></i>
                                    </button>
                                    {isOpen && (
                                        <ul className="pl-6 py-1 mt-1 border-l-2 border-teal-500/50 dark:border-teal-400/50 ml-3 space-y-1">
                                            {ACTIVITIES.filter(activity => category.activities.includes(activity.id)).map((activity) => (
                                                <li key={`${activity.id}-${activity.title}`}>
                                                    <button
                                                        onClick={() => onSelectActivity(activity.id)}
                                                        className="w-full text-left py-1.5 px-3 text-sm rounded-md hover:bg-teal-50 dark:hover:bg-teal-900/50 text-gray-700 dark:text-gray-300 transition-colors focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                    >
                                                        {activity.title}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>
            ) : (
                <div className="p-4">
                     <button onClick={() => onSelectActivity(null)} className="mb-4 text-sm text-teal-600 dark:text-teal-400 hover:underline">
                        <i className="fa-solid fa-arrow-left mr-2"></i>Tüm Etkinlikler
                    </button>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                         <div className="flex items-center">
                            <div className="w-12 h-12 bg-teal-500 text-white rounded-lg flex items-center justify-center mr-4 shrink-0">
                                <i className={`${currentActivity.icon} fa-xl`}></i>
                            </div>
                            <div>
                                <h3 className="font-bold">{currentActivity.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{currentActivity.description}</p>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Ayarlar</h3>
                    {renderSettings(currentActivity)}
                </div>
            )}
        </div>
        
        {currentActivity && (
             <div className="p-4 border-t border-gray-200 dark:border-gray-700">
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
        )}
    </aside>
  );
};

export default Sidebar;