import { ActivityType } from '../src/types/activity';
import { getGeneratorMapping } from '../src/services/generators/registry';

const allActivities = [
    // 1. OKUMA & DİL
    ActivityType.FIVE_W_ONE_H,
    ActivityType.SENTENCE_5W1H,
    ActivityType.LOGIC_ERROR_HUNTER,
    ActivityType.COLORFUL_SYLLABLE_READING,
    ActivityType.READING_SUDOKU,
    ActivityType.SYLLABLE_MASTER_LAB,
    ActivityType.READING_STROOP,
    ActivityType.SYNONYM_ANTONYM_MATCH,
    ActivityType.LETTER_VISUAL_MATCHING,
    ActivityType.READING_PYRAMID,
    ActivityType.READING_FLOW,
    ActivityType.PHONOLOGICAL_AWARENESS,
    ActivityType.RAPID_NAMING,
    ActivityType.LETTER_DISCRIMINATION,
    ActivityType.MIRROR_LETTERS,
    ActivityType.SYLLABLE_TRAIN,
    ActivityType.BACKWARD_SPELLING,
    ActivityType.CODE_READING,
    ActivityType.HANDWRITING_PRACTICE,
    ActivityType.MORPHOLOGY_MATRIX,
    ActivityType.ANAGRAM,
    ActivityType.CROSSWORD,
    ActivityType.WORD_SEARCH,

    // 2. GÖRSEL & MEKANSAL
    ActivityType.PATTERN_COMPLETION,
    ActivityType.DIRECTIONAL_CODE_READING,
    ActivityType.MAP_INSTRUCTION,
    ActivityType.FIND_THE_DIFFERENCE,
    ActivityType.VISUAL_ODD_ONE_OUT,
    ActivityType.GRID_DRAWING,
    ActivityType.SYMMETRY_DRAWING,
    ActivityType.SHAPE_COUNTING,
    ActivityType.DIRECTIONAL_TRACKING,
    ActivityType.VISUAL_TRACKING_LINES,
    ActivityType.VISUAL_INTERPRETATION,

    // 3. DİKKAT & HAFIZA
    ActivityType.WORD_MEMORY,
    ActivityType.VISUAL_MEMORY,
    ActivityType.CHARACTER_MEMORY,
    ActivityType.COLOR_WHEEL_MEMORY,
    ActivityType.IMAGE_COMPREHRENSION,
    ActivityType.STROOP_TEST,
    ActivityType.BURDON_TEST,
    ActivityType.NUMBER_SEARCH,
    ActivityType.CHAOTIC_NUMBER_SEARCH,
    ActivityType.FIND_IDENTICAL_WORD,
    ActivityType.LETTER_GRID_TEST,
    ActivityType.TARGET_SEARCH,
    ActivityType.ATTENTION_TO_QUESTION,

    // 4. HİKAYE & SÖZEL MANTIK
    ActivityType.STORY_COMPREHENSION,
    ActivityType.STORY_ANALYSIS,
    ActivityType.STORY_SEQUENCING,
    ActivityType.THEMATIC_ODD_ONE_OUT,
    ActivityType.BRAIN_TEASERS
];

async function runAllTest() {
    console.log(`--- TÜM KATEGORİLER CANLI TESTİ BAŞLIYOR (${allActivities.length} ETKİNLİK) ---\n`);
    let passCount = 0;
    let failCount = 0;

    for (const type of allActivities) {
        try {
            const mapping = await getGeneratorMapping(type);
            if (!mapping || (!mapping.offline && !mapping.ai)) {
                console.error(`❌ [FAIL] ${type}: Jeneratör eşleşmesi bulunamadı!`);
                failCount++;
                continue;
            }

            const options = { difficulty: 'Orta', itemCount: 10, worksheetCount: 1 };
            const generator = mapping.offline || mapping.ai;

            let result;
            if (mapping.offline) {
                result = await mapping.offline(options);
            } else if (mapping.ai) {
                result = await mapping.ai(options);
            }

            const unwrapped = Array.isArray(result) ? result[0] : result;

            // Tüm olası içerik dizi ve nesne anahtarlarını denetle
            const items =
                unwrapped?.items || unwrapped?.questions || unwrapped?.exercises || unwrapped?.content ||
                unwrapped?.puzzles || unwrapped?.clocks || unwrapped?.steps || unwrapped?.grid ||
                unwrapped?.cells || unwrapped?.cards || unwrapped?.paths || unwrapped?.rungs ||
                unwrapped?.sequences || unwrapped?.levels || unwrapped?.numbers || unwrapped?.problems ||
                unwrapped?.riddles || unwrapped?.pyramids || unwrapped?.wordProblems || unwrapped?.pyramidLayers ||
                unwrapped?.trains || unwrapped?.pairs || unwrapped?.words || unwrapped?.rows ||
                unwrapped?.text || unwrapped?.exercises || unwrapped?.codesToSolve || unwrapped?.blocks || unwrapped?.layoutArchitecture?.blocks;

            const hasContent = (Array.isArray(items) && items.length > 0) || (typeof items === 'object' && items !== null);

            if (hasContent) {
                console.log(`✅ [PASS] ${type}: Başarıyla ${Array.isArray(items) ? items.length : 'dolu nesne'} içerik üretildi.`);
                passCount++;
            } else {
                console.error(`⚠️ [WARN] ${type}: Çıktı alındı ancak içerik dizisi boş görünüyor!`, unwrapped);
                failCount++;
            }
        } catch (err: any) {
            console.error(`❌ [ERROR] ${type}: Üretim sırasında hata alındı!`, err?.message || err);
            failCount++;
        }
    }

    console.log(`\n--- TEST TAMAMLANDI ---`);
    console.log(`Başarılı: ${passCount} / ${allActivities.length}`);
    console.log(`Hatalı/Boş: ${failCount} / ${allActivities.length}`);
}

runAllTest();
