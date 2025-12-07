
import { SingleWorksheetData, ActivityType, WorksheetData } from '../types';

// Configuration for which property holds the list of items to split for each ActivityType
const PAGINATION_CONFIG: Record<ActivityType, string> = {
    [ActivityType.BASIC_OPERATIONS]: 'operations',
    [ActivityType.MATH_PUZZLE]: 'puzzles',
    [ActivityType.REAL_LIFE_MATH_PROBLEMS]: 'problems',
    [ActivityType.NUMBER_PATTERN]: 'patterns',
    [ActivityType.FIND_THE_DIFFERENCE]: 'rows',
    [ActivityType.WORD_COMPARISON]: 'wordList1', // Special case, handled manually if needed
    [ActivityType.FIND_IDENTICAL_WORD]: 'groups',
    [ActivityType.GRID_DRAWING]: 'drawings',
    [ActivityType.SYMBOL_CIPHER]: 'wordsToSolve',
    [ActivityType.BLOCK_PAINTING]: 'shapes', // Not really splittable usually
    [ActivityType.VISUAL_ODD_ONE_OUT]: 'rows',
    [ActivityType.SYMMETRY_DRAWING]: 'dots', // Dots are part of one drawing
    [ActivityType.FIND_DIFFERENT_STRING]: 'rows',
    [ActivityType.DOT_PAINTING]: 'dots', // Not splittable
    [ActivityType.ABC_CONNECT]: 'puzzles',
    [ActivityType.COORDINATE_CIPHER]: 'wordsToFind', // Maybe
    [ActivityType.WORD_CONNECT]: 'points',
    [ActivityType.PROFESSION_CONNECT]: 'points',
    [ActivityType.MATCHSTICK_SYMMETRY]: 'puzzles',
    [ActivityType.VISUAL_ODD_ONE_OUT_THEMED]: 'rows',
    [ActivityType.STAR_HUNT]: 'grid', // Not splittable
    [ActivityType.SHAPE_COUNTING]: 'figures',
    [ActivityType.WORD_SEARCH]: 'words', // Grid is fixed, words list might split?
    [ActivityType.ANAGRAM]: 'anagrams',
    [ActivityType.SPELLING_CHECK]: 'checks',
    [ActivityType.LETTER_BRIDGE]: 'pairs',
    [ActivityType.WORD_LADDER]: 'ladders',
    [ActivityType.WORD_FORMATION]: 'sets',
    [ActivityType.REVERSE_WORD]: 'words',
    [ActivityType.WORD_GROUPING]: 'words',
    [ActivityType.MINI_WORD_GRID]: 'puzzles',
    [ActivityType.PASSWORD_FINDER]: 'words',
    [ActivityType.SYLLABLE_COMPLETION]: 'wordParts',
    [ActivityType.SYNONYM_WORD_SEARCH]: 'wordsToMatch',
    [ActivityType.SPIRAL_PUZZLE]: 'clues',
    [ActivityType.CROSSWORD]: 'clues', // Hard to split grid
    [ActivityType.JUMBLED_WORD_STORY]: 'puzzles',
    [ActivityType.HOMONYM_SENTENCE_WRITING]: 'items',
    [ActivityType.WORD_GRID_PUZZLE]: 'wordList',
    [ActivityType.PROVERB_SAYING_SORT]: 'items',
    [ActivityType.HOMONYM_IMAGE_MATCH]: 'leftImages', // Coupled with rightImages
    [ActivityType.ANTONYM_FLOWER_PUZZLE]: 'puzzles',
    [ActivityType.PROVERB_WORD_CHAIN]: 'solutions',
    [ActivityType.THEMATIC_ODD_ONE_OUT]: 'rows',
    [ActivityType.SYNONYM_ANTONYM_GRID]: 'antonyms',
    [ActivityType.PUNCTUATION_COLORING]: 'sentences',
    [ActivityType.PUNCTUATION_MAZE]: 'rules',
    [ActivityType.ANTONYM_RESFEBE]: 'puzzles',
    [ActivityType.THEMATIC_WORD_SEARCH_COLOR]: 'words',
    [ActivityType.THEMATIC_ODD_ONE_OUT_SENTENCE]: 'rows',
    [ActivityType.SYNONYM_SEARCH_STORY]: 'wordTable',
    [ActivityType.COLUMN_ODD_ONE_OUT_SENTENCE]: 'columns',
    [ActivityType.SYNONYM_ANTONYM_COLORING]: 'wordsOnImage',
    [ActivityType.PUNCTUATION_PHONE_NUMBER]: 'clues',
    [ActivityType.PUNCTUATION_SPIRAL_PUZZLE]: 'clues',
    [ActivityType.SYNONYM_MATCHING_PATTERN]: 'pairs',
    [ActivityType.RESFEBE]: 'puzzles',
    [ActivityType.WORD_WEB]: 'wordsToFind',
    [ActivityType.IMAGE_ANAGRAM_SORT]: 'cards',
    [ActivityType.ANAGRAM_IMAGE_MATCH]: 'puzzles',
    [ActivityType.SYLLABLE_WORD_SEARCH]: 'syllablesToCombine',
    [ActivityType.WORD_SEARCH_WITH_PASSWORD]: 'words',
    [ActivityType.WORD_WEB_WITH_PASSWORD]: 'words',
    [ActivityType.LETTER_GRID_WORD_FIND]: 'words',
    [ActivityType.WORD_PLACEMENT_PUZZLE]: 'wordGroups',
    [ActivityType.POSITIONAL_ANAGRAM]: 'puzzles',
    [ActivityType.PROVERB_SENTENCE_FINDER]: 'solutions',
    [ActivityType.PROVERB_FILL_IN_THE_BLANK]: 'proverbs',
    [ActivityType.PROVERB_SEARCH]: 'proverb', // Single
    [ActivityType.FUTOSHIKI]: 'puzzles',
    [ActivityType.NUMBER_PYRAMID]: 'pyramids',
    [ActivityType.NUMBER_CAPSULE]: 'puzzles',
    [ActivityType.ODD_EVEN_SUDOKU]: 'puzzles',
    [ActivityType.ROMAN_NUMERAL_CONNECT]: 'puzzles',
    [ActivityType.ROMAN_NUMERAL_STAR_HUNT]: 'grid', // Not splittable
    [ActivityType.ROUNDING_CONNECT]: 'numbers',
    [ActivityType.ROMAN_NUMERAL_MULTIPLICATION]: 'puzzles',
    [ActivityType.ARITHMETIC_CONNECT]: 'expressions',
    [ActivityType.ROMAN_ARABIC_MATCH_CONNECT]: 'points',
    [ActivityType.KENDOKU]: 'puzzles',
    [ActivityType.OPERATION_SQUARE_FILL_IN]: 'puzzles',
    [ActivityType.MULTIPLICATION_WHEEL]: 'puzzles',
    [ActivityType.TARGET_NUMBER]: 'puzzles',
    [ActivityType.SHAPE_SUDOKU]: 'puzzles',
    [ActivityType.WEIGHT_CONNECT]: 'points',
    [ActivityType.LENGTH_CONNECT]: 'points',
    [ActivityType.VISUAL_NUMBER_PATTERN]: 'puzzles',
    [ActivityType.LOGIC_GRID_PUZZLE]: 'clues',
    [ActivityType.SHAPE_NUMBER_PATTERN]: 'patterns',
    [ActivityType.FAMILY_RELATIONS]: 'leftColumn', // Coupled
    [ActivityType.LOGIC_DEDUCTION]: 'questions',
    [ActivityType.NUMBER_BOX_LOGIC]: 'puzzles',
    [ActivityType.MAP_INSTRUCTION]: 'instructions',
    [ActivityType.MIND_GAMES]: 'puzzles',
    [ActivityType.MIND_GAMES_56]: 'puzzles',
    [ActivityType.STROOP_TEST]: 'items',
    [ActivityType.LETTER_GRID_TEST]: 'grid', // Hard to split
    [ActivityType.NUMBER_SEARCH]: 'numbers',
    [ActivityType.WORD_MEMORY]: 'wordsToMemorize',
    [ActivityType.VISUAL_MEMORY]: 'itemsToMemorize',
    [ActivityType.FIND_THE_DUPLICATE_IN_ROW]: 'rows',
    [ActivityType.FIND_LETTER_PAIR]: 'grid',
    [ActivityType.TARGET_SEARCH]: 'grid',
    [ActivityType.COLOR_WHEEL_MEMORY]: 'items',
    [ActivityType.IMAGE_COMPREHENSION]: 'questions',
    [ActivityType.CHARACTER_MEMORY]: 'charactersToMemorize',
    [ActivityType.CHAOTIC_NUMBER_SEARCH]: 'numbers',
    [ActivityType.BURDON_TEST]: 'grid',
    [ActivityType.STORY_COMPREHENSION]: 'questions',
    [ActivityType.STORY_CREATION_PROMPT]: 'keywords',
    [ActivityType.WORDS_IN_STORY]: 'vocabWork',
    [ActivityType.STORY_ANALYSIS]: 'analysisQuestions',
    [ActivityType.STORY_SEQUENCING]: 'panels',
    [ActivityType.MISSING_PARTS]: 'storyWithBlanks',
    [ActivityType.READING_FLOW]: 'text',
    [ActivityType.LETTER_DISCRIMINATION]: 'rows',
    [ActivityType.RAPID_NAMING]: 'grid',
    [ActivityType.PHONOLOGICAL_AWARENESS]: 'exercises',
    [ActivityType.MIRROR_LETTERS]: 'rows',
    [ActivityType.SYLLABLE_TRAIN]: 'trains',
    [ActivityType.VISUAL_TRACKING_LINES]: 'paths',
    [ActivityType.BACKWARD_SPELLING]: 'items',
    [ActivityType.CODE_READING]: 'codesToSolve',
    [ActivityType.ATTENTION_TO_QUESTION]: 'grid',
    [ActivityType.ATTENTION_DEVELOPMENT]: 'puzzles',
    [ActivityType.ATTENTION_FOCUS]: 'puzzles',
    [ActivityType.NUMBER_SENSE]: 'exercises',
    [ActivityType.ARITHMETIC_FLUENCY]: 'problems',
    [ActivityType.NUMBER_GROUPING]: 'problems',
    [ActivityType.PROBLEM_SOLVING_STRATEGIES]: 'problems',
    [ActivityType.MATH_LANGUAGE]: 'pairs',
    [ActivityType.TIME_MEASUREMENT_GEOMETRY]: 'pairs',
    [ActivityType.SPATIAL_REASONING]: 'tasks',
    [ActivityType.ESTIMATION_SKILLS]: 'items',
    [ActivityType.FRACTIONS_DECIMALS]: 'pairs',
    [ActivityType.VISUAL_NUMBER_REPRESENTATION]: 'exercises',
    [ActivityType.VISUAL_ARITHMETIC]: 'problems',
    [ActivityType.APPLIED_MATH_STORY]: 'problems',
    [ActivityType.SPATIAL_AWARENESS_DISCOVERY]: 'tasks',
    [ActivityType.POSITIONAL_CONCEPTS]: 'tasks',
    [ActivityType.DIRECTIONAL_CONCEPTS]: 'tasks',
    [ActivityType.VISUAL_DISCRIMINATION_MATH]: 'rows',
    [ActivityType.ODD_ONE_OUT]: 'groups',
    [ActivityType.SHAPE_MATCHING]: 'leftColumn',
    [ActivityType.ASSESSMENT_REPORT]: 'none',
    [ActivityType.WORKBOOK]: 'none',
};

// Safe height content area in mm (A4 297mm - 40mm margins - 40mm header)
const SAFE_HEIGHT_PX = 900; 

// Rough estimation of item heights in pixels
const ESTIMATED_HEIGHTS: Record<string, number> = {
    'operations': 80, // Basic math op row
    'puzzles': 200,   // Boxed puzzle
    'problems': 150,  // Word problem
    'questions': 120, // Story question
    'rows': 100,      // General row
    'items': 60,      // List item
    'pairs': 80,      // Matching pair
    'clues': 40,      // Crossword clue
    'exercises': 120,
    'tasks': 250,
    'default': 100
};

export const paginationService = {
    /**
     * Splits a single overloaded worksheet page into multiple pages
     * based on estimated content height using a Virtual DOM approach.
     */
    process: (data: WorksheetData, activityType: ActivityType): WorksheetData => {
        // If data is already multipage (e.g. from AI with worksheetCount > 1), process each page
        // But usually AI returns array of pages. If user requested 20 items and AI put them all in page 1,
        // we need to split page 1.
        
        const newWorksheetData: WorksheetData = [];

        for (const page of data) {
            const splitKey = PAGINATION_CONFIG[activityType];
            
            // If no split key defined or array is empty/small, keep page as is
            if (!splitKey || !page[splitKey] || !Array.isArray(page[splitKey]) || page[splitKey].length <= 2) {
                newWorksheetData.push(page);
                continue;
            }

            const items = page[splitKey];
            const itemHeight = ESTIMATED_HEIGHTS[splitKey] || ESTIMATED_HEIGHTS['default'];
            
            // Create a virtual container to measure specifically if needed, 
            // but for performance and stability, we use a robust estimator here.
            // A real DOM measurement for every item can be slow.
            
            let currentPageItems: any[] = [];
            let currentHeight = 0;
            const headerHeight = 150; // Title + Instruction + Margins

            items.forEach((item: any) => {
                // Heuristic height adjustment based on content length
                let estimatedH = itemHeight;
                if (typeof item === 'object') {
                    // Add height for long text or nested arrays
                    const txt = JSON.stringify(item);
                    if (txt.length > 200) estimatedH += 50;
                    if (item.imagePrompt || item.imageBase64) estimatedH += 100;
                }

                if (currentHeight + estimatedH > SAFE_HEIGHT_PX) {
                    // Push current page
                    newWorksheetData.push({
                        ...page,
                        [splitKey]: currentPageItems,
                        title: `${page.title} (Devam)` // Add suffix for continuation pages
                    });
                    // Reset for new page
                    currentPageItems = [item];
                    currentHeight = estimatedH; // Reset height (no header on subsequent pages maybe? or yes)
                } else {
                    currentPageItems.push(item);
                    currentHeight += estimatedH;
                }
            });

            // Push last page
            if (currentPageItems.length > 0) {
                // If it's the first page being pushed (no split happened), keep original title
                const isFirstSplit = newWorksheetData.length === 0 || newWorksheetData[newWorksheetData.length-1].title !== `${page.title} (Devam)`;
                newWorksheetData.push({
                    ...page,
                    [splitKey]: currentPageItems,
                    title: isFirstSplit ? page.title : `${page.title} (Devam)`
                });
            }
        }

        return newWorksheetData;
    }
};
