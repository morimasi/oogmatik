
import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions } from '../../types.js';
import {
    NumberPatternData, ShapeNumberPatternData,
    ThematicOddOneOutData, PunctuationMazeData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationPhoneNumberData,
    ArithmeticConnectData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData, VisualNumberPatternData,
    LogicGridPuzzleData, AbcConnectData, MagicPyramidData, NumberCapsuleData,
    OddEvenSudokuData, FutoshikiData, KendokuData, NumberPyramidData
} from '../../types.js';
import { generateMazePath } from '../offlineGenerators/helpers.js';

const PEDAGOGICAL_PROMPT = `
ÜST DÜZEY EĞİTİM İÇERİĞİ OLUŞTURMA YÖNERGESİ (PREMIUM KALİTE):
1.  **Rol:** Sen, "Özel Eğitim ve Üstün Yetenekliler" için materyal hazırlayan uzman bir pedagogsun.
2.  **Çıktı:** Sadece geçerli JSON.
3.  **"instruction":** Öğrenciye hitap et. Net, motive edici ve anlaşılır ol. (Örn: "Sıradaki sayıyı bulmak için kuralı keşfet ve boşluğu doldur.")
4.  **"imagePrompt":** (Çok Önemli) Sen aynı zamanda bir Sanat Yönetmenisin. SVG üretecek bir yapay zeka için detaylı görsel tasviri yaz.
    - **Stil:** "Flat Vector Art Style", "Educational Illustration", "Clean Lines", "Vibrant Colors", "Minimalist Design".
    - **Detay:** Asla "bir şekil" deme. "Turuncu renkli, köşeleri yuvarlatılmış, içinde yıldız deseni olan sevimli bir beşgen vektörü" de.
    - **Amaç:** Görsel, soruyu çözmek için gerekli ipuçlarını net bir şekilde barındırmalı ve çocukların ilgisini çekecek, pozitif, renkli ve net görseller üretmektir. Korkutucu veya karanlık öğelerden kaçın.
5.  **İçerik:**
    - Asla tekrar yapma.
    - "Lorem ipsum" yasak.
    - Mantıksal tutarlılık zorunlu.
    - Zorluk seviyesine tam uygunluk sağla.
`;

export const generateNumberPatternFromAI = async (options: GeneratorOptions): Promise<NumberPatternData[]> => {
    // ... (unchanged)
    const { itemCount, difficulty, worksheetCount, patternType } = options;
    let patternRules = "Basit aritmetik artışlar (örn: +2, +5).";
    if (patternType === 'geometric' || difficulty === 'Orta') patternRules = "Artış/Azalış karışık veya çarpma/bölme içeren diziler.";
    if (patternType === 'complex' || difficulty === 'Zor') patternRules = "İki aşamalı kurallar (x2 +1) veya Fibonacci benzeri diziler.";
    if (difficulty === 'Uzman') patternRules = "Karmaşık diziler, karesel artışlar veya asal sayı dizileri.";
    const prompt = `"${difficulty}" zorluk seviyesinde, ${itemCount} adet Sayı Örüntüsü oluştur. Kural: ${patternRules}. Her örüntü mantıksal bir dizi sayı ve sonunda '?' içermeli. Cevabı (answer) belirt. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet çalışma sayfası verisi üret.`;
    const schema = { type: 'ARRAY', items: singleSchema };
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Sayı Örüntüsü',
        instruction: p.instruction || 'Kuralı bul ve boşluğu doldur.',
        patterns: Array.isArray(p.patterns) ? p.patterns : []
    })) as any;
};

export const generateShapeNumberPatternFromAI = async (options: GeneratorOptions): Promise<ShapeNumberPatternData[]> => {
    // ...
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Şekilli Sayı Örüntüsü (Shape Number Pattern) oluştur. Üçgenlerin köşelerindeki sayılarla (veya merkezindeki) bir matematiksel ilişki kur. Örn: Üst sayı = (Sol alt + Sağ alt) * 2 veya benzeri mantıklı bir kural. Bir şekildeki sayı '?' olsun. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: 'ARRAY', items: singleSchema };
    
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Şekilli Sayı Örüntüsü',
        instruction: p.instruction || 'Şekiller arasındaki ilişkiyi bul.',
        patterns: Array.isArray(p.patterns) ? p.patterns : []
    })) as any;
};

export const generateThematicOddOneOutFromAI = async (options: GeneratorOptions): Promise<ThematicOddOneOutData[]> => {
    // ...
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `'${topic}' temalı, "${difficulty}" seviyesinde "Tematik Farklı Olanı Bul" etkinliği. Her satırda 4 kelime/kavram olsun. 3'ü temaya uygun, 1'i farklı (semantik olarak). Her kelime için **İngilizce** 'imagePrompt' oluştur. Stil: "Cute colorful icon set style, flat vector". Ana görsel (imagePrompt) tema ile ilgili zengin bir illüstrasyon olsun. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: 'ARRAY', items: singleSchema };
    
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Farklı Olanı Bul',
        instruction: p.instruction || 'Gruptaki farklı olanı işaretle.',
        rows: Array.isArray(p.rows) ? p.rows : []
    })) as any;
};

export const generatePunctuationMazeFromAI = async (options: GeneratorOptions): Promise<PunctuationMazeData[]> => {
    const { difficulty, worksheetCount } = options;

    // We only ask AI for content, we handle spatial layout manually
    const prompt = `
    "${difficulty}" seviyesinde "Noktalama Labirenti" için içerik oluştur.
    Odaklanılacak İşaret: VİRGÜL (,).
    
    GÖREV:
    1. Virgülün DOĞRU kullanıldığı 15 farklı kısa cümle/kural yaz.
    2. Virgülün YANLIŞ kullanıldığı 15 farklı kısa cümle/kural yaz.
    
    ÇIKTI FORMATI:
    - correctSentences: [string]
    - incorrectSentences: [string]
    - imagePrompt: "Maze puzzle illustration with comma symbol, flat vector style, educational colors."
    - title: "Noktalama Labirenti (Virgül)"
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;

    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING', description: 'Etkinlik başlığı' },
            prompt: { type: 'STRING', description: 'AI talimat metni' },
            instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' },
            imagePrompt: { type: 'STRING', description: 'Görsel üretim promptu (İngilizce)' },
            punctuationMark: { type: 'STRING', description: 'Noktalama işareti' },
            correctSentences: { type: 'ARRAY', description: 'Doğru cümle listesi', items: { type: 'STRING' } },
            incorrectSentences: { type: 'ARRAY', description: 'Yanlış cümle listesi', items: { type: 'STRING' } }
        },
    };

    const schema = { type: 'ARRAY', items: singleSchema };
    const rawResult = await generateWithSchema(prompt, schema);
    let rawData: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(rawData)) rawData = [rawData];

    // Post-process to add spatial grid
    return rawData.filter(p => p && typeof p === 'object').map(data => {
        const rows = 5;
        const cols = 5;
        const { grid, pathIds, distractorIds } = generateMazePath(rows, cols);

        const finalRules: { id: number, text: string, isCorrect: boolean, isPath: boolean }[] = [];
        const corrects = data.correctSentences || [];
        const incorrects = data.incorrectSentences || [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cellId = grid[r][c];
                const isPath = pathIds.includes(cellId);
                const text = isPath
                    ? corrects[cellId % corrects.length]
                    : incorrects[cellId % incorrects.length];

                finalRules.push({
                    id: cellId,
                    text: text || "...",
                    isCorrect: isPath,
                    isPath: isPath
                });
            }
        }
        finalRules.sort((a, b) => a.id - b.id);

        return {
            title: data.title,
            prompt: data.prompt,
            instruction: data.instruction,
            imagePrompt: data.imagePrompt,
            punctuationMark: data.punctuationMark || ',',
            grid,
            rules: finalRules
        };
    }) as unknown as PunctuationMazeData[];
};

export const generateThematicOddOneOutSentenceFromAI = async (options: GeneratorOptions): Promise<ThematicOddOneOutSentenceData[]> => {
    // ...
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `'${topic}' temalı, "${difficulty}" seviyesinde "Farklı Olanla Cümle Kur" etkinliği. 5 satır oluştur. Her satırda biri hariç diğerleri temaya uyan kelimeler olsun. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: 'ARRAY', items: singleSchema };
    
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Farklı Olanla Cümle Kur',
        instruction: p.instruction || 'Farklı olan kelimeyi bul ve onunla bir cümle kur.',
        rows: Array.isArray(p.rows) ? p.rows : []
    })) as any;
};

export const generateColumnOddOneOutSentenceFromAI = async (options: GeneratorOptions): Promise<ColumnOddOneOutSentenceData[]> => {
    // ...
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Sütunda Farklı Olanı Bul" etkinliği. 4 sütun oluştur. Her sütunda anlamsal olarak uyumsuz bir kelime olsun. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: 'ARRAY', items: singleSchema };
    
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Sütunda Farklı Olanı Bul',
        instruction: p.instruction || 'Her sütundaki farklı olan kelimeyi işaretle.',
        columns: Array.isArray(p.columns) ? p.columns : []
    })) as any;
};

export const generatePunctuationPhoneNumberFromAI = async (options: GeneratorOptions): Promise<PunctuationPhoneNumberData[]> => {
    // ...
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Noktalama Telefonu" bulmacası. 7 adet ipucu ver. Her ipucu bir noktalama işareti kuralını veya sayısını işaret etsin ve bir rakama karşılık gelsin. Örn: "Cümle sonuna konan nokta sayısı = 3". ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: 'ARRAY', items: singleSchema };
    
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Noktalama Telefonu',
        instruction: p.instruction || 'İpuçlarını çözerek telefon numarasını bul.',
        clues: Array.isArray(p.clues) ? p.clues : [],
        solution: Array.isArray(p.solution) ? p.solution : []
    })) as any;
};

// ... (other exports like generateArithmeticConnectFromAI, etc. remain unchanged)
export const generateArithmeticConnectFromAI = async (options: GeneratorOptions): Promise<ArithmeticConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "İşlem Bağlamaca". 10-12 adet aritmetik işlem (veya sonuç sayı) oluştur. Aynı sonuca çıkan işlemleri eşleştirmek üzere gruplandır. Görsel olarak sayıları birbirine bağlayan çizgiler hayal et. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: 'ARRAY', items: singleSchema };
    
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'İşlem Bağlamaca',
        instruction: p.instruction || 'Aynı sonuca sahip işlemleri birbirine bağla.',
        expressions: Array.isArray(p.expressions) ? p.expressions : []
    })) as any;
};

export const generateRomanArabicMatchConnectFromAI = async (options: GeneratorOptions): Promise<RomanArabicMatchConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Romen ve Arap rakamlarını eşleştirme oyunu. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: 'ARRAY', items: singleSchema };
    
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Romen-Arap Rakamı Eşleştirme',
        instruction: p.instruction || 'Rakamları eşleriyle birleştir.',
        points: Array.isArray(p.points) ? p.points : []
    })) as any;
};

export const generateWeightConnectFromAI = async (options: GeneratorOptions): Promise<WeightConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Ağırlık Eşleştirme. Farklı birimlerdeki (kg, g) eşit ağırlıkları eşleştir. Görseller için **İngilizce** 'imagePrompt' oluştur (tartı, meyve, sebze vb.). Stil: "Flat icon" veya "Vector". ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: 'ARRAY', items: singleSchema };
    
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Ağırlık Eşleştirme',
        instruction: p.instruction || 'Aynı ağırlıkları birbirine bağla.',
        points: Array.isArray(p.points) ? p.points : []
    })) as any;
};

export const generateLengthConnectFromAI = async (options: GeneratorOptions): Promise<LengthConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Uzunluk Eşleştirme. Farklı birimlerdeki (m, cm, km) eşit uzunlukları eşleştir. Görseller için **İngilizce** 'imagePrompt' (cetvel, metre, yol vb.). ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: 'ARRAY', items: singleSchema };
    
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Uzunluk Eşleştirme',
        instruction: p.instruction || 'Aynı uzunlukları birbirine bağla.',
        points: Array.isArray(p.points) ? p.points : []
    })) as any;
};

export const generateVisualNumberPatternFromAI = async (options: GeneratorOptions): Promise<VisualNumberPatternData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Görsel Sayı Örüntüsü. Sayıların rengi, boyutu ve değeri bir kurala göre değişsin. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: 'ARRAY', items: singleSchema };
    
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Görsel Sayı Örüntüsü',
        instruction: p.instruction || 'Örüntü kuralını bul ve devam ettir.',
        puzzles: Array.isArray(p.puzzles) ? p.puzzles : []
    })) as any;
};

export const generateLogicGridPuzzleFromAI = async (options: GeneratorOptions): Promise<LogicGridPuzzleData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Mantık Tablosu (Logic Grid Puzzle). Kişiler, nesneler ve özellikleri içeren ipuçları ver. Nesneler için **İngilizce** 'imagePrompt' oluştur. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: 'ARRAY', items: singleSchema };
    
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Mantık Tablosu',
        instruction: p.instruction || 'İpuçlarını kullanarak tabloyu doldur.',
        clues: Array.isArray(p.clues) ? p.clues : [],
        people: Array.isArray(p.people) ? p.people : [],
        categories: Array.isArray(p.categories) ? p.categories : []
    })) as any;
};
export const generateAbcConnectFromAI = async (options: GeneratorOptions): Promise<AbcConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const customSettings = (options as any).abcConnect || {};
    const size = customSettings.gridSize || 5;
    const variant = customSettings.variant || 'roman';
    
    const variantDesc = variant === 'roman' ? 'Romen rakamları ile eşleştirme' : 
                        variant === 'case' ? 'Büyük/küçük harf eşleştirme' : 
                        variant === 'dots' ? 'Nokta sayıları ile eşleştirme' : 
                        'Basit toplama işlemleri ile eşleştirme';

    const prompt = `"${difficulty}" seviyesinde ${size}x${size} boyutunda "ABC Bağlama" (ABC Connect) üret. 
    Varyant: ${variantDesc}.
    Kural: Her sembolün ızgara üzerinde bir başlangıç ve bir bitiş noktası olmalı.
    ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    
    const schema = { type: 'ARRAY', items: singleSchema };
    
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'ABC Bağlama',
        gridDim: size,
        variant: variant
    })) as any;
};

export const generateMagicPyramidFromAI = async (options: GeneratorOptions): Promise<MagicPyramidData[]> => {
    const { difficulty, worksheetCount } = options;
    const customSettings = (options as any).magicPyramid || {};
    const layers = customSettings.layers || 5;
    const step = customSettings.step || 2;

    const prompt = `"${difficulty}" seviyesinde "Sihirli Piramit" üret. 
    Kural 1: En üstten (apex) başlayarak aşağıya doğru ${step}'er ritmik sayarak ilerlenen bir yol (correctPath) olmalı.
    Kural 2: Piramit ${layers} katmanlı olmalı.
    ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;

    const schema = { type: 'ARRAY', items: singleSchema };
    
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Sihirli Piramit',
        instruction: p.instruction || 'Doğru yolu takip et.',
        pyramids: Array.isArray(p.pyramids) ? p.pyramids : [],
        theme: customSettings.theme || 'classic'
    })) as any;
};

export const generateNumberCapsuleFromAI = async (options: GeneratorOptions): Promise<NumberCapsuleData[]> => {
    const { difficulty, worksheetCount } = options;
    const customSettings = (options as any).capsuleGame || {};
    const size = customSettings.gridSize || 4;
    const operation = customSettings.operation || 'addition';
    const numberSet = customSettings.numberSet || 'mixed';

    const opText = operation === 'multiplication' ? 'çarpma' : operation === 'subtraction' ? 'çıkarma' : operation === 'division' ? 'bölme' : 'toplama';
    const setCondition = numberSet === 'even' ? 'sadece çift sayılar' : numberSet === 'odd' ? 'sadece tek sayılar' : numberSet === 'prime' ? 'sadece asal sayılar' : 'karışık sayılar';

    const prompt = `"${difficulty}" seviyesinde ${size}x${size} boyutunda "Sayı Kapsülleri" (Capsule Game) üret. 
    Kural 1: Izgara dışındaki (rowTargets ve colTargets) hedefler, satır/sütun toplamlarını temsil eder.
    Kural 2: Kapsül (capsules) içindeki sayılar ${opText} işlemine göre kapsül hedefine ulaşmalıdır.
    Kural 3: Sayı havuzu olarak ${setCondition} kullan.
    ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;

    const singleSchema = { 
        type: 'OBJECT', 
        properties: { 
            title: { type: 'STRING', description: 'Etkinlik başlığı' }, 
            instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, 
            grid: { type: 'ARRAY', description: 'Izgara hücre değerleri', items: { type: 'ARRAY', items: { type: 'INTEGER', nullable: true } } }, 
            rowTargets: { type: 'ARRAY', description: 'Satır hedef değerleri', items: { type: 'INTEGER' } }, 
            colTargets: { type: 'ARRAY', description: 'Sütun hedef değerleri', items: { type: 'INTEGER' } }, 
            capsules: { 
                type: 'ARRAY', 
                description: 'Kapsül dizisi', 
                items: { 
                    type: 'OBJECT', 
                    properties: { 
                        id: { type: 'STRING', description: 'Benzersiz kimlik (örn: "15+", "4x")' }, 
                        target: { type: 'INTEGER', description: 'Hedef değer' }, 
                        cells: { 
                            type: 'ARRAY', 
                            description: 'Hücre koordinatları', 
                            items: { 
                                type: 'OBJECT', 
                                properties: { 
                                    x: { type: 'INTEGER', description: 'Sütun indeksi' }, 
                                    y: { type: 'INTEGER', description: 'Satır indeksi' } 
                                } 
                            } 
                        } 
                    }, 
                    required: ["id", "target", "cells"] 
                } 
            } 
        }, 
        required: ["title", "instruction", "grid", "capsules"] 
    };
    const schema = { type: 'ARRAY', items: singleSchema };
    
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Sayı Kapsülleri',
        instruction: p.instruction || 'Rakamları yerleştirerek hedeflere ulaş.',
        capsules: Array.isArray(p.capsules) ? p.capsules : [],
        settings: {
            difficulty,
            gridSize: size,
            operation: operation,
            aestheticMode: customSettings.aestheticMode || 'crystal'
        }
    })) as any;
};

export const generateOddEvenSudokuFromAI = async (options: GeneratorOptions): Promise<OddEvenSudokuData[]> => {
    const { difficulty, worksheetCount } = options;
    const customSettings = (options as any).oddEvenSudoku || {};
    const size = customSettings.gridSize || 4;

    const prompt = `"${difficulty}" seviyesinde ${size}x${size} boyutunda "Tek ve Çift Sudoku" üret. 
    Kural 1: Standart Sudoku kuralları geçerlidir (satır ve sütunda rakam tekrarı yok).
    Kural 2: oddEvenMask dizisindeki 'odd' değerleri için sadece TEK, 'even' değerleri için sadece ÇİFT sayılar gelmelidir. 
    ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;

    const schema = { type: 'ARRAY', items: singleSchema };
    
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Tek/Çift Sudoku',
        instruction: p.instruction || 'Sudoku kurallarına göre doldur.',
        puzzles: Array.isArray(p.puzzles) ? p.puzzles : [],
        settings: {
            difficulty,
            gridSize: size,
            aestheticMode: customSettings.aestheticMode || 'standard',
            showPositionNumbers: customSettings.showPositionNumbers ?? true
        }
    })) as any;
};

export const generateFutoshikiFromAI = async (options: GeneratorOptions): Promise<FutoshikiData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Futoşhiki" bulmacası. Büyüktür/Küçüktür işaretlerine göre rakamları yerleştir. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: 'ARRAY', items: singleSchema };
    
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Futoşhiki',
        instruction: p.instruction || 'İşaretlere göre rakamları yerleştir.',
        puzzles: Array.isArray(p.puzzles) ? p.puzzles : []
    })) as any;
};

export const generateKendokuFromAI = async (options: GeneratorOptions): Promise<KendokuData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Kendoku" (Can-Can) bulmacası. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: 'ARRAY', items: singleSchema };
    
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Kendoku',
        instruction: p.instruction || 'Mantıksal olarak doldur.',
        puzzles: Array.isArray(p.puzzles) ? p.puzzles : []
    })) as any;
};

export const generateNumberPyramidFromAI = async (options: GeneratorOptions): Promise<NumberPyramidData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Sayı Piramidi". Alt iki kutucuğun toplamı üsttekini verecek şekilde pyramid üret. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: 'ARRAY', items: singleSchema };
    
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Sayı Piramidi',
        instruction: p.instruction || 'Toplamları bularak piramidi tamamla.',
        pyramids: Array.isArray(p.pyramids) ? p.pyramids : []
    })) as any;
};
