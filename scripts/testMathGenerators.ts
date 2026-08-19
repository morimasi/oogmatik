import { ActivityType } from '../src/types/activity';
import { getGeneratorMapping } from '../src/services/generators/registry';

const mathActivities = [
    ActivityType.MATH_BASIC_OPERATIONS,
    ActivityType.MATH_WORD_PROBLEMS,
    ActivityType.NUMBER_PATTERN,
    ActivityType.NUMBER_PYRAMID,
    ActivityType.FUTOSHIKI,
    ActivityType.KENDOKU,
    ActivityType.ODD_EVEN_SUDOKU,
    ActivityType.MAGIC_PYRAMID,
    ActivityType.CAPSULE_GAME,
    ActivityType.ABC_CONNECT,
    ActivityType.CLOCK_READING,
    ActivityType.MONEY_COUNTING,
    ActivityType.FINANCIAL_MARKET_CALCULATOR,
    ActivityType.APARTMENT_LOGIC_PUZZLE,
    ActivityType.MATH_PUZZLE,
    ActivityType.ALGORITHM_GENERATOR
];

async function runMathTest() {
    console.log('--- MATEMATİK & MANTIK JENERATÖR CANLI TESTİ BAŞLIYOR ---\n');
    let passCount = 0;
    let failCount = 0;

    for (const type of mathActivities) {
        try {
            const mapping = await getGeneratorMapping(type);
            if (!mapping || (!mapping.offline && !mapping.ai)) {
                console.error(`❌ [FAIL] ${type}: Jeneratör eşleşmesi bulunamadı!`);
                failCount++;
                continue;
            }

            const generator = mapping.offline || mapping.ai;
            const result = await generator({ difficulty: 'Orta', itemCount: 10, worksheetCount: 1 });
            const unwrapped = Array.isArray(result) ? result[0] : result;

            // İçerik dizisini kontrol et
            const items = unwrapped?.items || unwrapped?.questions || unwrapped?.exercises || unwrapped?.content || unwrapped?.puzzles || unwrapped?.clocks || unwrapped?.steps || unwrapped?.grid || unwrapped?.cells || unwrapped?.cards || unwrapped?.paths || unwrapped?.rungs || unwrapped?.sequences || unwrapped?.levels || unwrapped?.numbers || unwrapped?.problems || unwrapped?.riddles || unwrapped?.pyramids || unwrapped?.wordProblems || unwrapped?.pyramidLayers;
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
    console.log(`Başarılı: ${passCount} / ${mathActivities.length}`);
    console.log(`Hatalı/Boş: ${failCount} / ${mathActivities.length}`);
}

runMathTest();
