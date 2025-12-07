
import { SingleWorksheetData, ActivityType, WorksheetData, StyleSettings } from '../types';

// Configuration for which property holds the list of items to split for each ActivityType
const PAGINATION_CONFIG: Record<ActivityType, string> = {
    [ActivityType.BASIC_OPERATIONS]: 'operations',
    [ActivityType.MATH_PUZZLE]: 'puzzles',
    [ActivityType.REAL_LIFE_MATH_PROBLEMS]: 'problems',
    [ActivityType.NUMBER_PATTERN]: 'patterns',
    [ActivityType.FIND_THE_DIFFERENCE]: 'rows',
    [ActivityType.WORD_COMPARISON]: 'wordList1', // Special case handling needed usually
    [ActivityType.FIND_IDENTICAL_WORD]: 'groups',
    [ActivityType.GRID_DRAWING]: 'drawings',
    [ActivityType.SYMBOL_CIPHER]: 'wordsToSolve',
    [ActivityType.BLOCK_PAINTING]: 'shapes',
    [ActivityType.VISUAL_ODD_ONE_OUT]: 'rows',
    [ActivityType.SYMMETRY_DRAWING]: 'dots',
    [ActivityType.FIND_DIFFERENT_STRING]: 'rows',
    [ActivityType.DOT_PAINTING]: 'dots',
    [ActivityType.ABC_CONNECT]: 'puzzles',
    [ActivityType.COORDINATE_CIPHER]: 'wordsToFind',
    [ActivityType.WORD_CONNECT]: 'points',
    [ActivityType.PROFESSION_CONNECT]: 'points',
    [ActivityType.MATCHSTICK_SYMMETRY]: 'puzzles',
    [ActivityType.VISUAL_ODD_ONE_OUT_THEMED]: 'rows',
    [ActivityType.STAR_HUNT]: 'grid',
    [ActivityType.SHAPE_COUNTING]: 'figures',
    [ActivityType.WORD_SEARCH]: 'words',
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
    [ActivityType.CROSSWORD]: 'clues',
    [ActivityType.JUMBLED_WORD_STORY]: 'puzzles',
    [ActivityType.HOMONYM_SENTENCE_WRITING]: 'items',
    [ActivityType.WORD_GRID_PUZZLE]: 'wordList',
    [ActivityType.PROVERB_SAYING_SORT]: 'items',
    [ActivityType.HOMONYM_IMAGE_MATCH]: 'leftImages',
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
    [ActivityType.PROVERB_SEARCH]: 'proverb',
    [ActivityType.FUTOSHIKI]: 'puzzles',
    [ActivityType.NUMBER_PYRAMID]: 'pyramids',
    [ActivityType.NUMBER_CAPSULE]: 'puzzles',
    [ActivityType.ODD_EVEN_SUDOKU]: 'puzzles',
    [ActivityType.ROMAN_NUMERAL_CONNECT]: 'puzzles',
    [ActivityType.ROMAN_NUMERAL_STAR_HUNT]: 'grid',
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
    [ActivityType.FAMILY_RELATIONS]: 'leftColumn',
    [ActivityType.LOGIC_DEDUCTION]: 'questions',
    [ActivityType.NUMBER_BOX_LOGIC]: 'puzzles',
    [ActivityType.MAP_INSTRUCTION]: 'instructions',
    [ActivityType.MIND_GAMES]: 'puzzles',
    [ActivityType.MIND_GAMES_56]: 'puzzles',
    [ActivityType.STROOP_TEST]: 'items',
    [ActivityType.LETTER_GRID_TEST]: 'grid',
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

// Safe height of content area in pixels (Approximate A4 height minus header/footer/margins)
// A4 is ~1123px high at 96 DPI. Margins ~40px each. Header ~150px.
const A4_CONTENT_HEIGHT_PX = 900; 

// Rough estimation of item heights in pixels (Base height)
const BASE_HEIGHTS: Record<string, number> = {
    'operations': 80, 
    'puzzles': 220,   
    'problems': 160,  
    'questions': 130, 
    'rows': 110,      
    'items': 70,      
    'pairs': 90,      
    'clues': 45,      
    'exercises': 140,
    'tasks': 280,
    'default': 120
};

export const paginationService = {
    /**
     * Splits data into multiple pages based on available space, columns, and font size.
     */
    process: (data: WorksheetData, activityType: ActivityType, settings?: StyleSettings): WorksheetData => {
        if (!data || data.length === 0) return [];
        
        // If Smart Pagination is disabled, return original structure (but cleaned)
        if (settings && !settings.smartPagination) {
            return data;
        }

        const newWorksheetData: WorksheetData = [];
        const splitKey = PAGINATION_CONFIG[activityType];

        // Factors affecting height
        const scale = settings?.scale || 1;
        const fontSize = settings?.fontSize || 16;
        const columns = Math.max(1, settings?.columns || 1);
        const margin = settings?.margin || 20;
        
        // Dynamic Effective Columns logic (same as Worksheet.tsx)
        const effectiveCols = Math.max(1, Math.round(columns / scale));
        
        // Font Factor: Larger font takes more space
        const fontFactor = fontSize / 16; 
        
        // Scale Factor: Smaller scale allows more items on page (conceptually height increases)
        // But since we use transform:scale on the container, the internal pixels remain constant relative to content.
        // However, if we want "Smart Reflow" (more items when zoomed out), we effectively have more virtual height.
        const virtualPageHeight = A4_CONTENT_HEIGHT_PX * (1 / scale);

        for (const page of data) {
            // If not splittable, keep as is
            if (!splitKey || splitKey === 'none' || !page[splitKey] || !Array.isArray(page[splitKey])) {
                newWorksheetData.push(page);
                continue;
            }

            const allItems = page[splitKey];
            if (allItems.length === 0) {
                newWorksheetData.push(page);
                continue;
            }

            const itemBaseHeight = BASE_HEIGHTS[splitKey] || BASE_HEIGHTS['default'];
            // Actual height of one item card
            const itemHeight = itemBaseHeight * fontFactor;
            
            // In a grid, items share the row height.
            // Height consumed per ITEM index = itemHeight / columns
            // e.g. 10 items, 2 cols -> 5 rows. Total height = 5 * itemHeight.
            
            let currentPageItems: any[] = [];
            let currentY = 0;
            const headerHeight = 150 * scale; // Header scales too

            // Helper to calculate height of a row of items
            const getRowHeight = (item: any) => {
                let h = itemHeight;
                // Add bonus for very long text
                if (typeof item === 'object') {
                    const txt = JSON.stringify(item);
                    if (txt.length > 200) h += 40 * fontFactor;
                    if (item.imagePrompt || item.imageBase64) h += 80 * scale; // Images take space
                }
                return h;
            };

            // We process items in chunks of 'effectiveCols' (one row at a time)
            for (let i = 0; i < allItems.length; i += effectiveCols) {
                const rowItems = allItems.slice(i, i + effectiveCols);
                
                // Find max height in this row
                let maxRowHeight = 0;
                rowItems.forEach((item: any) => {
                    const h = getRowHeight(item);
                    if (h > maxRowHeight) maxRowHeight = h;
                });

                // Check if this row fits
                if (currentY + maxRowHeight > virtualPageHeight) {
                    // Page full, push current and reset
                    newWorksheetData.push({
                        ...page,
                        [splitKey]: currentPageItems,
                        title: newWorksheetData.length === 0 || newWorksheetData[newWorksheetData.length-1].title !== page.title ? page.title : `${page.title} (Devam)`
                    });
                    
                    currentPageItems = [...rowItems];
                    currentY = maxRowHeight; // Reset, but account for first row of new page
                } else {
                    currentPageItems.push(...rowItems);
                    currentY += maxRowHeight;
                }
            }

            // Push remaining items
            if (currentPageItems.length > 0) {
                const isContinuation = newWorksheetData.length > 0 && newWorksheetData[newWorksheetData.length-1].title.startsWith(page.title);
                newWorksheetData.push({
                    ...page,
                    [splitKey]: currentPageItems,
                    title: isContinuation ? `${page.title} (Devam)` : page.title
                });
            }
        }

        return newWorksheetData;
    }
};
