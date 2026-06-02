
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
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' }, imagePrompt: { type: 'STRING', description: 'Görsel üretim promptu (İngilizce)' }, patterns: { type: 'ARRAY', description: 'Sayı örüntüleri dizisi', items: { type: 'OBJECT', properties: { sequence: { type: 'STRING', description: 'Sayı dizisi (örn: 2,4,6,?)' }, answer: { type: 'STRING', description: 'Doğru cevap' } }, required: ['sequence', 'answer'] } } }, required: ['title', 'instruction', 'patterns', 'pedagogicalNote', 'imagePrompt'] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<NumberPatternData[]>;
};

export const generateShapeNumberPatternFromAI = async (options: GeneratorOptions): Promise<ShapeNumberPatternData[]> => {
    // ... (unchanged)
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Şekilli Sayı Örüntüsü (Shape Number Pattern) oluştur. Üçgenlerin köşelerindeki sayılarla (veya merkezindeki) bir matematiksel ilişki kur. Örn: Üst sayı = (Sol alt + Sağ alt) * 2 veya benzeri mantıklı bir kural. Bir şekildeki sayı '?' olsun. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' }, imagePrompt: { type: 'STRING', description: 'Görsel üretim promptu (İngilizce)' }, patterns: { type: 'ARRAY', description: 'Şekilli örüntüler', items: { type: 'OBJECT', properties: { shapes: { type: 'ARRAY', description: 'Şekil listesi', items: { type: 'OBJECT', properties: { type: { type: 'STRING', description: 'Şekil türü', enum: ['triangle'] }, numbers: { type: 'ARRAY', description: 'Sayı listesi', items: { type: 'STRING' } } }, required: ["type", "numbers"] } } }, required: ["shapes"] } } }, required: ["title", "patterns", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<ShapeNumberPatternData[]>;
};

export const generateThematicOddOneOutFromAI = async (options: GeneratorOptions): Promise<ThematicOddOneOutData[]> => {
    // ... (unchanged)
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `'${topic}' temalı, "${difficulty}" seviyesinde "Tematik Farklı Olanı Bul" etkinliği. Her satırda 4 kelime/kavram olsun. 3'ü temaya uygun, 1'i farklı (semantik olarak). Her kelime için **İngilizce** 'imagePrompt' oluştur. Stil: "Cute colorful icon set style, flat vector". Ana görsel (imagePrompt) tema ile ilgili zengin bir illüstrasyon olsun. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, prompt: { type: 'STRING', description: 'AI talimat metni' }, instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' }, imagePrompt: { type: 'STRING', description: 'Görsel üretim promptu (İngilizce)' }, theme: { type: 'STRING', description: 'Tema adı' }, rows: { type: 'ARRAY', description: 'Kavram satırları', items: { type: 'OBJECT', properties: { words: { type: 'ARRAY', description: 'Kelime ve görsel çiftleri', items: { type: 'OBJECT', properties: { text: { type: 'STRING', description: 'İçerik metni' }, imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' } }, required: ["text", "imagePrompt"] } }, oddWord: { type: 'STRING', description: 'Farklı olan kelime' } }, required: ["words", "oddWord"] } }, sentencePrompt: { type: 'STRING', description: 'Cümle kurma yönergesi' } }, required: ["title", "prompt", "theme", "rows", "sentencePrompt", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<ThematicOddOneOutData[]>;
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
            pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' },
            imagePrompt: { type: 'STRING', description: 'Görsel üretim promptu (İngilizce)' },
            punctuationMark: { type: 'STRING', description: 'Noktalama işareti' },
            correctSentences: { type: 'ARRAY', description: 'Doğru cümle listesi', items: { type: 'STRING' } },
            incorrectSentences: { type: 'ARRAY', description: 'Yanlış cümle listesi', items: { type: 'STRING' } }
        },
        required: ["title", "prompt", "punctuationMark", "correctSentences", "incorrectSentences", "instruction", "pedagogicalNote", "imagePrompt"]
    };

    const schema = { type: 'ARRAY', items: singleSchema };
    const rawData = await generateWithSchema(prompt, schema) as unknown as any[];

    // Post-process to add spatial grid
    return rawData.map(data => {
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
            pedagogicalNote: data.pedagogicalNote,
            imagePrompt: data.imagePrompt,
            punctuationMark: data.punctuationMark || ',',
            grid,
            rules: finalRules
        };
    }) as unknown as PunctuationMazeData[];
};

export const generateThematicOddOneOutSentenceFromAI = async (options: GeneratorOptions): Promise<ThematicOddOneOutSentenceData[]> => {
    // ... (unchanged)
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `'${topic}' temalı, "${difficulty}" seviyesinde "Farklı Olanla Cümle Kur" etkinliği. 5 satır oluştur. Her satırda biri hariç diğerleri temaya uyan kelimeler olsun. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, prompt: { type: 'STRING', description: 'AI talimat metni' }, instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' }, imagePrompt: { type: 'STRING', description: 'Görsel üretim promptu (İngilizce)' }, rows: { type: 'ARRAY', description: 'Kelime satırları', items: { type: 'OBJECT', properties: { words: { type: 'ARRAY', description: 'Kelime listesi', items: { type: 'STRING' } }, oddWord: { type: 'STRING', description: 'Farklı olan kelime' } }, required: ["words", "oddWord"] } }, sentencePrompt: { type: 'STRING', description: 'Cümle kurma yönergesi' } }, required: ["title", "prompt", "rows", "sentencePrompt", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<ThematicOddOneOutSentenceData[]>;
};

export const generateColumnOddOneOutSentenceFromAI = async (options: GeneratorOptions): Promise<ColumnOddOneOutSentenceData[]> => {
    // ... (unchanged)
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Sütunda Farklı Olanı Bul" etkinliği. 4 sütun oluştur. Her sütunda anlamsal olarak uyumsuz bir kelime olsun. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, prompt: { type: 'STRING', description: 'AI talimat metni' }, instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' }, imagePrompt: { type: 'STRING', description: 'Görsel üretim promptu (İngilizce)' }, columns: { type: 'ARRAY', description: 'Sütun satırları', items: { type: 'OBJECT', properties: { words: { type: 'ARRAY', description: 'Kelime listesi', items: { type: 'STRING' } }, oddWord: { type: 'STRING', description: 'Farklı olan kelime' } }, required: ["words", "oddWord"] } }, sentencePrompt: { type: 'STRING', description: 'Cümle kurma yönergesi' } }, required: ["title", "prompt", "columns", "sentencePrompt", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<ColumnOddOneOutSentenceData[]>;
};

export const generatePunctuationPhoneNumberFromAI = async (options: GeneratorOptions): Promise<PunctuationPhoneNumberData[]> => {
    // ... (unchanged)
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Noktalama Telefonu" bulmacası. 7 adet ipucu ver. Her ipucu bir noktalama işareti kuralını veya sayısını işaret etsin ve bir rakama karşılık gelsin. Örn: "Cümle sonuna konan nokta sayısı = 3". ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, prompt: { type: 'STRING', description: 'AI talimat metni' }, instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' }, imagePrompt: { type: 'STRING', description: 'Görsel üretim promptu (İngilizce)' }, clues: { type: 'ARRAY', description: 'İpucu dizisi', items: { type: 'OBJECT', properties: { id: { type: 'INTEGER', description: 'Benzersiz kimlik numarası' }, text: { type: 'STRING', description: 'İçerik metni' } }, required: ["id", "text"] } }, solution: { type: 'ARRAY', description: 'Çözüm dizisi', items: { type: 'OBJECT', properties: { punctuationMark: { type: 'STRING', description: 'Noktalama işareti' }, number: { type: 'INTEGER', description: 'Rakam değeri' } }, required: ["punctuationMark", "number"] } } }, required: ["title", "prompt", "instruction", "clues", "solution", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<PunctuationPhoneNumberData[]>;
};

// ... (other exports like generateArithmeticConnectFromAI, etc. remain unchanged)
export const generateArithmeticConnectFromAI = async (options: GeneratorOptions): Promise<ArithmeticConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "İşlem Bağlamaca". 10-12 adet aritmetik işlem (veya sonuç sayı) oluştur. Aynı sonuca çıkan işlemleri eşleştirmek üzere gruplandır. Görsel olarak sayıları birbirine bağlayan çizgiler hayal et. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, prompt: { type: 'STRING', description: 'AI talimat metni' }, instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' }, imagePrompt: { type: 'STRING', description: 'Görsel üretim promptu (İngilizce)' }, example: { type: 'STRING', description: 'Örnek gösterim' }, expressions: { type: 'ARRAY', description: 'İşlem ifadeleri', items: { type: 'OBJECT', properties: { text: { type: 'STRING', description: 'İçerik metni' }, value: { type: 'INTEGER', description: 'Sayısal değer' }, group: { type: 'INTEGER', description: 'Grup numarası' }, x: { type: 'NUMBER', description: 'Yatay konum (0-100)' }, y: { type: 'NUMBER', description: 'Dikey konum (0-100)' } }, required: ["text", "value", "group", "x", "y"] } } }, required: ["title", "prompt", "example", "expressions", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<ArithmeticConnectData[]>;
};

export const generateRomanArabicMatchConnectFromAI = async (options: GeneratorOptions): Promise<RomanArabicMatchConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Romen ve Arap rakamlarını eşleştirme oyunu. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, prompt: { type: 'STRING', description: 'AI talimat metni' }, instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' }, imagePrompt: { type: 'STRING', description: 'Görsel üretim promptu (İngilizce)' }, gridDim: { type: 'INTEGER', description: 'Izgara boyutu' }, points: { type: 'ARRAY', description: 'Bağlantı noktaları', items: { type: 'OBJECT', properties: { label: { type: 'STRING', description: 'Nokta etiketi' }, pairId: { type: 'INTEGER', description: 'Eşleştirme grup ID' }, x: { type: 'NUMBER', description: 'Yatay konum (0-100)' }, y: { type: 'NUMBER', description: 'Dikey konum (0-100)' } }, required: ["label", "pairId", "x", "y"] } } }, required: ["title", "prompt", "gridDim", "points", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<RomanArabicMatchConnectData[]>;
};

export const generateWeightConnectFromAI = async (options: GeneratorOptions): Promise<WeightConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Ağırlık Eşleştirme. Farklı birimlerdeki (kg, g) eşit ağırlıkları eşleştir. Görseller için **İngilizce** 'imagePrompt' oluştur (tartı, meyve, sebze vb.). Stil: "Flat icon" veya "Vector". ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, prompt: { type: 'STRING', description: 'AI talimat metni' }, instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' }, imagePrompt: { type: 'STRING', description: 'Görsel üretim promptu (İngilizce)' }, gridDim: { type: 'INTEGER', description: 'Izgara boyutu' }, points: { type: 'ARRAY', description: 'Ağırlık noktaları', items: { type: 'OBJECT', properties: { label: { type: 'STRING', description: 'Nokta etiketi' }, pairId: { type: 'INTEGER', description: 'Eşleştirme grup ID' }, x: { type: 'NUMBER', description: 'Yatay konum (0-100)' }, y: { type: 'NUMBER', description: 'Dikey konum (0-100)' }, imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' } }, required: ["label", "pairId", "x", "y", "imagePrompt"] } } }, required: ["title", "prompt", "gridDim", "points", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<WeightConnectData[]>;
};

export const generateLengthConnectFromAI = async (options: GeneratorOptions): Promise<LengthConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Uzunluk Eşleştirme. Farklı birimlerdeki (m, cm, km) eşit uzunlukları eşleştir. Görseller için **İngilizce** 'imagePrompt' (cetvel, metre, yol vb.). ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, prompt: { type: 'STRING', description: 'AI talimat metni' }, instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' }, imagePrompt: { type: 'STRING', description: 'Görsel üretim promptu (İngilizce)' }, gridDim: { type: 'INTEGER', description: 'Izgara boyutu' }, points: { type: 'ARRAY', description: 'Uzunluk noktaları', items: { type: 'OBJECT', properties: { label: { type: 'STRING', description: 'Nokta etiketi' }, pairId: { type: 'INTEGER', description: 'Eşleştirme grup ID' }, x: { type: 'NUMBER', description: 'Yatay konum (0-100)' }, y: { type: 'NUMBER', description: 'Dikey konum (0-100)' }, imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' } }, required: ["label", "pairId", "x", "y", "imagePrompt"] } } }, required: ["title", "prompt", "gridDim", "points", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<LengthConnectData[]>;
};

export const generateVisualNumberPatternFromAI = async (options: GeneratorOptions): Promise<VisualNumberPatternData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Görsel Sayı Örüntüsü. Sayıların rengi, boyutu ve değeri bir kurala göre değişsin. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, prompt: { type: 'STRING', description: 'AI talimat metni' }, instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' }, imagePrompt: { type: 'STRING', description: 'Görsel üretim promptu (İngilizce)' }, puzzles: { type: 'ARRAY', description: 'Görsel bulmacalar', items: { type: 'OBJECT', properties: { items: { type: 'ARRAY', description: 'Örüntü öğeleri', items: { type: 'OBJECT', properties: { number: { type: 'INTEGER', description: 'Sayı değeri' }, color: { type: 'STRING', description: 'Renk kodu (hex)' }, size: { type: 'NUMBER', description: 'Boyut katsayısı' } }, required: ["number", "color", "size"] } }, rule: { type: 'STRING', description: 'Kural açıklaması' }, answer: { type: 'INTEGER', description: 'Doğru cevap' } }, required: ["items", "rule", "answer"] } } }, required: ["title", "prompt", "puzzles", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<VisualNumberPatternData[]>;
};

export const generateLogicGridPuzzleFromAI = async (options: GeneratorOptions): Promise<LogicGridPuzzleData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Mantık Tablosu (Logic Grid Puzzle). Kişiler, nesneler ve özellikleri içeren ipuçları ver. Nesneler için **İngilizce** 'imagePrompt' oluştur. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, prompt: { type: 'STRING', description: 'AI talimat metni' }, instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' }, imagePrompt: { type: 'STRING', description: 'Görsel üretim promptu (İngilizce)' }, clues: { type: 'ARRAY', description: 'İpucu listesi', items: { type: 'STRING' } }, people: { type: 'ARRAY', description: 'Kişi listesi', items: { type: 'STRING' } }, categories: { type: 'ARRAY', description: 'Kategori listesi', items: { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Kategori başlığı' }, items: { type: 'ARRAY', description: 'Kategori öğeleri', items: { type: 'OBJECT', properties: { name: { type: 'STRING', description: 'Öğe adı' }, imageDescription: { type: 'STRING', description: 'Görsel açıklaması' }, imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' } }, required: ["name", "imageDescription", "imagePrompt"] } } }, required: ["title", "items"] } } }, required: ["title", "prompt", "clues", "people", "categories", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<LogicGridPuzzleData[]>;
};
export const generateAbcConnectFromAI = async (options: GeneratorOptions): Promise<AbcConnectData[]> => {
    const { difficulty, worksheetCount, gridSize = 5 } = options;
    const prompt = `"${difficulty}" seviyesinde "ABC Bağlama" bulmacası. ${gridSize}x${gridSize} bir ızgara üzerinde rakamları (veya Romen rakamlarını) eşleriyle çizgiler kesişmeden birleştirecek bir yapı kurgula. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' }, gridDim: { type: 'INTEGER', description: 'Izgara boyutu' }, variant: { type: 'STRING', description: 'Bulmaca çeşidi', enum: ['roman', 'case', 'dots', 'math'] }, paths: { type: 'ARRAY', description: 'Bağlantı yolları', items: { type: 'OBJECT', properties: { start: { type: 'OBJECT', description: 'Başlangıç noktası', properties: { x: { type: 'INTEGER', description: 'Sütun indeksi' }, y: { type: 'INTEGER', description: 'Satır indeksi' } } }, end: { type: 'OBJECT', description: 'Bitiş noktası', properties: { x: { type: 'INTEGER', description: 'Sütun indeksi' }, y: { type: 'INTEGER', description: 'Satır indeksi' } } }, value: { type: 'STRING', description: 'Bağlantı değeri' }, matchValue: { type: 'STRING', description: 'Eşleşen değer' }, id: { type: 'STRING', description: 'Benzersiz kimlik' } }, required: ["start", "end", "value", "matchValue", "id"] } } }, required: ["title", "instruction", "gridDim", "paths"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<AbcConnectData[]>;
};

export const generateMagicPyramidFromAI = async (options: GeneratorOptions): Promise<MagicPyramidData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Sihirli Piramit" bulmacası. Tepeden tabana ritmik bir yol oluştur. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' }, pyramids: { type: 'ARRAY', description: 'Piramit dizisi', items: { type: 'OBJECT', properties: { layers: { type: 'INTEGER', description: 'Katman sayısı' }, apex: { type: 'INTEGER', description: 'Tepe değeri' }, step: { type: 'INTEGER', description: 'Adım/artış miktarı' }, grid: { type: 'ARRAY', description: 'Piramit ızgarası', items: { type: 'ARRAY', items: { type: 'INTEGER' } } }, correctPath: { type: 'ARRAY', description: 'Doğru yol dizisi', items: { type: 'INTEGER' } } }, required: ["layers", "apex", "step", "grid", "correctPath"] } } }, required: ["title", "instruction", "pyramids"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<MagicPyramidData[]>;
};

export const generateNumberCapsuleFromAI = async (options: GeneratorOptions): Promise<NumberCapsuleData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Sayı Kapsülleri" (Capsule Game). Izgara dışındaki hedeflere ulaşacak şekilde rakamları yerleştir. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' }, grid: { type: 'ARRAY', description: 'Izgara hücre değerleri', items: { type: 'ARRAY', items: { type: 'INTEGER', nullable: true } } }, rowTargets: { type: 'ARRAY', description: 'Satır hedef değerleri', items: { type: 'INTEGER' } }, colTargets: { type: 'ARRAY', description: 'Sütun hedef değerleri', items: { type: 'INTEGER' } }, capsules: { type: 'ARRAY', description: 'Kapsül dizisi', items: { type: 'OBJECT', properties: { id: { type: 'STRING', description: 'Benzersiz kimlik' }, target: { type: 'INTEGER', description: 'Hedef değer' }, cells: { type: 'ARRAY', description: 'Hücre koordinatları', items: { type: 'OBJECT', properties: { x: { type: 'INTEGER', description: 'Sütun indeksi' }, y: { type: 'INTEGER', description: 'Satır indeksi' } } } } }, required: ["id", "target", "cells"] } } }, required: ["title", "instruction", "grid", "capsules"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<NumberCapsuleData[]>;
};

export const generateOddEvenSudokuFromAI = async (options: GeneratorOptions): Promise<OddEvenSudokuData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Tek ve Çift Sudoku". Renklerle (örn: odd=Tek, even=Çift) kısıtlanmış 4x4 veya 6x6 sudoku. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' }, puzzles: { type: 'ARRAY', description: 'Sudoku bulmacaları', items: { type: 'OBJECT', properties: { size: { type: 'INTEGER', description: 'Izgara boyutu' }, grid: { type: 'ARRAY', description: 'Izgara hücre değerleri', items: { type: 'ARRAY', items: { type: 'INTEGER', nullable: true } } }, oddEvenMask: { type: 'ARRAY', description: 'Tek/çift maskesi', items: { type: 'ARRAY', items: { type: 'STRING', enum: ['odd', 'even', null], nullable: true } } } }, required: ["size", "grid", "oddEvenMask"] } } }, required: ["title", "instruction", "puzzles"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<OddEvenSudokuData[]>;
};

export const generateFutoshikiFromAI = async (options: GeneratorOptions): Promise<FutoshikiData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Futoşhiki" bulmacası. Büyüktür/Küçüktür işaretlerine göre rakamları yerleştir. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' }, puzzles: { type: 'ARRAY', description: 'Futoshiki bulmacaları', items: { type: 'OBJECT', properties: { size: { type: 'INTEGER', description: 'Izgara boyutu' }, grid: { type: 'ARRAY', description: 'Izgara hücre değerleri', items: { type: 'ARRAY', items: { type: 'INTEGER', nullable: true } } }, constraints: { type: 'ARRAY', description: 'Kısıtlama kuralları', items: { type: 'OBJECT', properties: { r1: { type: 'INTEGER', description: 'Başlangıç satırı' }, c1: { type: 'INTEGER', description: 'Başlangıç sütunu' }, r2: { type: 'INTEGER', description: 'Bitiş satırı' }, c2: { type: 'INTEGER', description: 'Bitiş sütunu' }, relation: { type: 'STRING', description: 'İlişki işareti', enum: ['<', '>'] } } } } }, required: ["size", "grid"] } } }, required: ["title", "instruction", "puzzles"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<FutoshikiData[]>;
};

export const generateKendokuFromAI = async (options: GeneratorOptions): Promise<KendokuData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Kendoku" (Can-Can) bulmacası. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' }, puzzles: { type: 'ARRAY', description: 'Kendoku bulmacaları', items: { type: 'OBJECT', properties: { size: { type: 'INTEGER', description: 'Izgara boyutu' }, grid: { type: 'ARRAY', description: 'Izgara hücre değerleri', items: { type: 'ARRAY', items: { type: 'INTEGER', nullable: true } } }, cages: { type: 'ARRAY', description: 'Kafes grupları', items: { type: 'OBJECT', properties: { target: { type: 'INTEGER', description: 'Hedef değer' }, op: { type: 'STRING', description: 'İşlem türü' }, cells: { type: 'ARRAY', description: 'Hücre koordinatları', items: { type: 'OBJECT', properties: { r: { type: 'INTEGER', description: 'Satır indeksi' }, c: { type: 'INTEGER', description: 'Sütun indeksi' } } } } } } } }, required: ["size", "grid", "cages"] } } }, required: ["title", "instruction", "puzzles"] };
    return generateWithSchema(prompt, { type: 'ARRAY', items: singleSchema }) as unknown as Promise<KendokuData[]>;
};

export const generateNumberPyramidFromAI = async (options: GeneratorOptions): Promise<NumberPyramidData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Sayı Piramidi". Alt iki kutucuğun toplamı üsttekini verecek şekilde pyramid üret. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' }, pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' }, pyramids: { type: 'ARRAY', description: 'Sayı piramitleri', items: { type: 'OBJECT', properties: { rows: { type: 'ARRAY', description: 'Piramit satırları', items: { type: 'ARRAY', items: { type: 'INTEGER', nullable: true } } } }, required: ["rows"] } } }, required: ["title", "instruction", "pyramids"] };
    return generateWithSchema(prompt, { type: 'ARRAY', items: singleSchema }) as unknown as Promise<NumberPyramidData[]>;
};
