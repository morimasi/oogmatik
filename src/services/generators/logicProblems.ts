
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
3.  **"pedagogicalNote":** Bu alan veli/öğretmen içindir. Etkinliğin hangi spesifik bilişsel beceriyi (örn: görsel-uzamsal algı, mantıksal çıkarım, sıralı düşünme) nasıl desteklediğini akademik ama anlaşılır bir dille açıkla.
4.  **"instruction":** Öğrenciye hitap et. Net, motive edici ve anlaşılır ol. (Örn: "Sıradaki sayıyı bulmak için kuralı keşfet ve boşluğu doldur.")
5.  **"imagePrompt":** (Çok Önemli) Sen aynı zamanda bir Sanat Yönetmenisin. SVG üretecek bir yapay zeka için detaylı görsel tasviri yaz.
    - **Stil:** "Flat Vector Art Style", "Educational Illustration", "Clean Lines", "Vibrant Colors", "Minimalist Design".
    - **Detay:** Asla "bir şekil" deme. "Turuncu renkli, köşeleri yuvarlatılmış, içinde yıldız deseni olan sevimli bir beşgen vektörü" de.
    - **Amaç:** Görsel, soruyu çözmek için gerekli ipuçlarını net bir şekilde barındırmalı ve çocukların ilgisini çekecek, pozitif, renkli ve net görseller üretmektir. Korkutucu veya karanlık öğelerden kaçın.
6.  **İçerik:**
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
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING' }, instruction: { type: 'STRING' }, pedagogicalNote: { type: 'STRING' }, imagePrompt: { type: 'STRING' }, patterns: { type: 'ARRAY', items: { type: 'OBJECT', properties: { sequence: { type: 'STRING' }, answer: { type: 'STRING' } }, required: ['sequence', 'answer'] } } }, required: ['title', 'instruction', 'patterns', 'pedagogicalNote', 'imagePrompt'] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<NumberPatternData[]>;
};

export const generateShapeNumberPatternFromAI = async (options: GeneratorOptions): Promise<ShapeNumberPatternData[]> => {
    // ... (unchanged)
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Şekilli Sayı Örüntüsü (Shape Number Pattern) oluştur. Üçgenlerin köşelerindeki sayılarla (veya merkezindeki) bir matematiksel ilişki kur. Örn: Üst sayı = (Sol alt + Sağ alt) * 2 veya benzeri mantıklı bir kural. Bir şekildeki sayı '?' olsun. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING' }, instruction: { type: 'STRING' }, pedagogicalNote: { type: 'STRING' }, imagePrompt: { type: 'STRING' }, patterns: { type: 'ARRAY', items: { type: 'OBJECT', properties: { shapes: { type: 'ARRAY', items: { type: 'OBJECT', properties: { type: { type: 'STRING', enum: ['triangle'] }, numbers: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ["type", "numbers"] } } }, required: ["shapes"] } } }, required: ["title", "patterns", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ShapeNumberPatternData[]>;
};

export const generateThematicOddOneOutFromAI = async (options: GeneratorOptions): Promise<ThematicOddOneOutData[]> => {
    // ... (unchanged)
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `'${topic}' temalı, "${difficulty}" seviyesinde "Tematik Farklı Olanı Bul" etkinliği. Her satırda 4 kelime/kavram olsun. 3'ü temaya uygun, 1'i farklı (semantik olarak). Her kelime için **İngilizce** 'imagePrompt' oluştur. Stil: "Cute colorful icon set style, flat vector". Ana görsel (imagePrompt) tema ile ilgili zengin bir illüstrasyon olsun. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING' }, prompt: { type: 'STRING' }, instruction: { type: 'STRING' }, pedagogicalNote: { type: 'STRING' }, imagePrompt: { type: 'STRING' }, theme: { type: 'STRING' }, rows: { type: 'ARRAY', items: { type: 'OBJECT', properties: { words: { type: 'ARRAY', items: { type: 'OBJECT', properties: { text: { type: 'STRING' }, imagePrompt: { type: 'STRING' } }, required: ["text", "imagePrompt"] } }, oddWord: { type: 'STRING' } }, required: ["words", "oddWord"] } }, sentencePrompt: { type: 'STRING' } }, required: ["title", "prompt", "theme", "rows", "sentencePrompt", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ThematicOddOneOutData[]>;
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
    - pedagogicalNote: "Bu etkinlik, öğrencinin 'Virgül' noktalama işaretinin kullanım kuralları hakkındaki bilgisini pekiştirirken, aynı zamanda mantıksal çıkarım, analitik düşünme ve problem çözme becerilerini geliştirir. Labirent formatı, soyut kuralları görsel-uzamsal bir bağlamda ele almayı teşvik ederek öğrenmeyi daha ilgi çekici ve kalıcı hale getirir. Öğrencinin dikkatini ve odaklanma yeteneğini artırır."
    - imagePrompt: "Maze puzzle illustration with comma symbol, flat vector style, educational colors."
    - title: "Noktalama Labirenti (Virgül)"
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;

    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            prompt: { type: 'STRING' },
            instruction: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
            imagePrompt: { type: 'STRING' },
            punctuationMark: { type: 'STRING' },
            correctSentences: { type: 'ARRAY', items: { type: 'STRING' } },
            incorrectSentences: { type: 'ARRAY', items: { type: 'STRING' } }
        },
        required: ["title", "prompt", "punctuationMark", "correctSentences", "incorrectSentences", "instruction", "pedagogicalNote", "imagePrompt"]
    };

    const schema = { type: 'ARRAY', items: singleSchema };
    const rawData = await generateWithSchema(prompt, schema) as any[];

    // Post-process to add spatial grid
    return rawData.map(data => {
        const rows = 5;
        const cols = 5;
        const { grid, pathIds, _distractorIds } = generateMazePath(rows, cols);

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
    }) as PunctuationMazeData[];
};

export const generateThematicOddOneOutSentenceFromAI = async (options: GeneratorOptions): Promise<ThematicOddOneOutSentenceData[]> => {
    // ... (unchanged)
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `'${topic}' temalı, "${difficulty}" seviyesinde "Farklı Olanla Cümle Kur" etkinliği. 5 satır oluştur. Her satırda biri hariç diğerleri temaya uyan kelimeler olsun. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING' }, prompt: { type: 'STRING' }, instruction: { type: 'STRING' }, pedagogicalNote: { type: 'STRING' }, imagePrompt: { type: 'STRING' }, rows: { type: 'ARRAY', items: { type: 'OBJECT', properties: { words: { type: 'ARRAY', items: { type: 'STRING' } }, oddWord: { type: 'STRING' } }, required: ["words", "oddWord"] } }, sentencePrompt: { type: 'STRING' } }, required: ["title", "prompt", "rows", "sentencePrompt", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ThematicOddOneOutSentenceData[]>;
};

export const generateColumnOddOneOutSentenceFromAI = async (options: GeneratorOptions): Promise<ColumnOddOneOutSentenceData[]> => {
    // ... (unchanged)
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Sütunda Farklı Olanı Bul" etkinliği. 4 sütun oluştur. Her sütunda anlamsal olarak uyumsuz bir kelime olsun. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING' }, prompt: { type: 'STRING' }, instruction: { type: 'STRING' }, pedagogicalNote: { type: 'STRING' }, imagePrompt: { type: 'STRING' }, columns: { type: 'ARRAY', items: { type: 'OBJECT', properties: { words: { type: 'ARRAY', items: { type: 'STRING' } }, oddWord: { type: 'STRING' } }, required: ["words", "oddWord"] } }, sentencePrompt: { type: 'STRING' } }, required: ["title", "prompt", "columns", "sentencePrompt", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ColumnOddOneOutSentenceData[]>;
};

export const generatePunctuationPhoneNumberFromAI = async (options: GeneratorOptions): Promise<PunctuationPhoneNumberData[]> => {
    // ... (unchanged)
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Noktalama Telefonu" bulmacası. 7 adet ipucu ver. Her ipucu bir noktalama işareti kuralını veya sayısını işaret etsin ve bir rakama karşılık gelsin. Örn: "Cümle sonuna konan nokta sayısı = 3". ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING' }, prompt: { type: 'STRING' }, instruction: { type: 'STRING' }, pedagogicalNote: { type: 'STRING' }, imagePrompt: { type: 'STRING' }, clues: { type: 'ARRAY', items: { type: 'OBJECT', properties: { id: { type: 'INTEGER' }, text: { type: 'STRING' } }, required: ["id", "text"] } }, solution: { type: 'ARRAY', items: { type: 'OBJECT', properties: { punctuationMark: { type: 'STRING' }, number: { type: 'INTEGER' } }, required: ["punctuationMark", "number"] } } }, required: ["title", "prompt", "instruction", "clues", "solution", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<PunctuationPhoneNumberData[]>;
};

// ... (other exports like generateArithmeticConnectFromAI, etc. remain unchanged)
export const generateArithmeticConnectFromAI = async (options: GeneratorOptions): Promise<ArithmeticConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "İşlem Bağlamaca". 10-12 adet aritmetik işlem (veya sonuç sayı) oluştur. Aynı sonuca çıkan işlemleri eşleştirmek üzere gruplandır. Görsel olarak sayıları birbirine bağlayan çizgiler hayal et. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING' }, prompt: { type: 'STRING' }, instruction: { type: 'STRING' }, pedagogicalNote: { type: 'STRING' }, imagePrompt: { type: 'STRING' }, example: { type: 'STRING' }, expressions: { type: 'ARRAY', items: { type: 'OBJECT', properties: { text: { type: 'STRING' }, value: { type: 'INTEGER' }, group: { type: 'INTEGER' }, x: { type: 'NUMBER' }, y: { type: 'NUMBER' } }, required: ["text", "value", "group", "x", "y"] } } }, required: ["title", "prompt", "example", "expressions", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ArithmeticConnectData[]>;
};

export const generateRomanArabicMatchConnectFromAI = async (options: GeneratorOptions): Promise<RomanArabicMatchConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Romen ve Arap rakamlarını eşleştirme oyunu. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING' }, prompt: { type: 'STRING' }, instruction: { type: 'STRING' }, pedagogicalNote: { type: 'STRING' }, imagePrompt: { type: 'STRING' }, gridDim: { type: 'INTEGER' }, points: { type: 'ARRAY', items: { type: 'OBJECT', properties: { label: { type: 'STRING' }, pairId: { type: 'INTEGER' }, x: { type: 'NUMBER' }, y: { type: 'NUMBER' } }, required: ["label", "pairId", "x", "y"] } } }, required: ["title", "prompt", "gridDim", "points", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<RomanArabicMatchConnectData[]>;
};

export const generateWeightConnectFromAI = async (options: GeneratorOptions): Promise<WeightConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Ağırlık Eşleştirme. Farklı birimlerdeki (kg, g) eşit ağırlıkları eşleştir. Görseller için **İngilizce** 'imagePrompt' oluştur (tartı, meyve, sebze vb.). Stil: "Flat icon" veya "Vector". ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING' }, prompt: { type: 'STRING' }, instruction: { type: 'STRING' }, pedagogicalNote: { type: 'STRING' }, imagePrompt: { type: 'STRING' }, gridDim: { type: 'INTEGER' }, points: { type: 'ARRAY', items: { type: 'OBJECT', properties: { label: { type: 'STRING' }, pairId: { type: 'INTEGER' }, x: { type: 'NUMBER' }, y: { type: 'NUMBER' }, imagePrompt: { type: 'STRING' } }, required: ["label", "pairId", "x", "y", "imagePrompt"] } } }, required: ["title", "prompt", "gridDim", "points", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<WeightConnectData[]>;
};

export const generateLengthConnectFromAI = async (options: GeneratorOptions): Promise<LengthConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Uzunluk Eşleştirme. Farklı birimlerdeki (m, cm, km) eşit uzunlukları eşleştir. Görseller için **İngilizce** 'imagePrompt' (cetvel, metre, yol vb.). ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING' }, prompt: { type: 'STRING' }, instruction: { type: 'STRING' }, pedagogicalNote: { type: 'STRING' }, imagePrompt: { type: 'STRING' }, gridDim: { type: 'INTEGER' }, points: { type: 'ARRAY', items: { type: 'OBJECT', properties: { label: { type: 'STRING' }, pairId: { type: 'INTEGER' }, x: { type: 'NUMBER' }, y: { type: 'NUMBER' }, imagePrompt: { type: 'STRING' } }, required: ["label", "pairId", "x", "y", "imagePrompt"] } } }, required: ["title", "prompt", "gridDim", "points", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<LengthConnectData[]>;
};

export const generateVisualNumberPatternFromAI = async (options: GeneratorOptions): Promise<VisualNumberPatternData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Görsel Sayı Örüntüsü. Sayıların rengi, boyutu ve değeri bir kurala göre değişsin. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING' }, prompt: { type: 'STRING' }, instruction: { type: 'STRING' }, pedagogicalNote: { type: 'STRING' }, imagePrompt: { type: 'STRING' }, puzzles: { type: 'ARRAY', items: { type: 'OBJECT', properties: { items: { type: 'ARRAY', items: { type: 'OBJECT', properties: { number: { type: 'INTEGER' }, color: { type: 'STRING' }, size: { type: 'NUMBER' } }, required: ["number", "color", "size"] } }, rule: { type: 'STRING' }, answer: { type: 'INTEGER' } }, required: ["items", "rule", "answer"] } } }, required: ["title", "prompt", "puzzles", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<VisualNumberPatternData[]>;
};

export const generateLogicGridPuzzleFromAI = async (options: GeneratorOptions): Promise<LogicGridPuzzleData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Mantık Tablosu (Logic Grid Puzzle). Kişiler, nesneler ve özellikleri içeren ipuçları ver. Nesneler için **İngilizce** 'imagePrompt' oluştur. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING' }, prompt: { type: 'STRING' }, instruction: { type: 'STRING' }, pedagogicalNote: { type: 'STRING' }, imagePrompt: { type: 'STRING' }, clues: { type: 'ARRAY', items: { type: 'STRING' } }, people: { type: 'ARRAY', items: { type: 'STRING' } }, categories: { type: 'ARRAY', items: { type: 'OBJECT', properties: { title: { type: 'STRING' }, items: { type: 'ARRAY', items: { type: 'OBJECT', properties: { name: { type: 'STRING' }, imageDescription: { type: 'STRING' }, imagePrompt: { type: 'STRING' } }, required: ["name", "imageDescription", "imagePrompt"] } } }, required: ["title", "items"] } } }, required: ["title", "prompt", "clues", "people", "categories", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<LogicGridPuzzleData[]>;
};
export const generateAbcConnectFromAI = async (options: GeneratorOptions): Promise<AbcConnectData[]> => {
    const { difficulty, worksheetCount, gridSize = 5 } = options;
    const prompt = `"${difficulty}" seviyesinde "ABC Bağlama" bulmacası. ${gridSize}x${gridSize} bir ızgara üzerinde rakamları (veya Romen rakamlarını) eşleriyle çizgiler kesişmeden birleştirecek bir yapı kurgula. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING' }, instruction: { type: 'STRING' }, pedagogicalNote: { type: 'STRING' }, gridDim: { type: 'INTEGER' }, variant: { type: 'STRING', enum: ['roman', 'case', 'dots', 'math'] }, paths: { type: 'ARRAY', items: { type: 'OBJECT', properties: { start: { type: 'OBJECT', properties: { x: { type: 'INTEGER' }, y: { type: 'INTEGER' } } }, end: { type: 'OBJECT', properties: { x: { type: 'INTEGER' }, y: { type: 'INTEGER' } } }, value: { type: 'STRING' }, matchValue: { type: 'STRING' }, id: { type: 'STRING' } }, required: ["start", "end", "value", "matchValue", "id"] } } }, required: ["title", "instruction", "gridDim", "paths"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<AbcConnectData[]>;
};

export const generateMagicPyramidFromAI = async (options: GeneratorOptions): Promise<MagicPyramidData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Sihirli Piramit" bulmacası. Tepeden tabana ritmik bir yol oluştur. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING' }, instruction: { type: 'STRING' }, pedagogicalNote: { type: 'STRING' }, pyramids: { type: 'ARRAY', items: { type: 'OBJECT', properties: { layers: { type: 'INTEGER' }, apex: { type: 'INTEGER' }, step: { type: 'INTEGER' }, grid: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'INTEGER' } } }, correctPath: { type: 'ARRAY', items: { type: 'INTEGER' } } }, required: ["layers", "apex", "step", "grid", "correctPath"] } } }, required: ["title", "instruction", "pyramids"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<MagicPyramidData[]>;
};

export const generateNumberCapsuleFromAI = async (options: GeneratorOptions): Promise<NumberCapsuleData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Sayı Kapsülleri" (Capsule Game). Izgara dışındaki hedeflere ulaşacak şekilde rakamları yerleştir. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING' }, instruction: { type: 'STRING' }, pedagogicalNote: { type: 'STRING' }, grid: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'INTEGER', nullable: true } } }, rowTargets: { type: 'ARRAY', items: { type: 'INTEGER' } }, colTargets: { type: 'ARRAY', items: { type: 'INTEGER' } }, capsules: { type: 'ARRAY', items: { type: 'OBJECT', properties: { id: { type: 'STRING' }, target: { type: 'INTEGER' }, cells: { type: 'ARRAY', items: { type: 'OBJECT', properties: { x: { type: 'INTEGER' }, y: { type: 'INTEGER' } } } } }, required: ["id", "target", "cells"] } } }, required: ["title", "instruction", "grid", "capsules"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<NumberCapsuleData[]>;
};

export const generateOddEvenSudokuFromAI = async (options: GeneratorOptions): Promise<OddEvenSudokuData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Tek ve Çift Sudoku". Renklerle (örn: odd=Tek, even=Çift) kısıtlanmış 4x4 veya 6x6 sudoku. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING' }, instruction: { type: 'STRING' }, pedagogicalNote: { type: 'STRING' }, puzzles: { type: 'ARRAY', items: { type: 'OBJECT', properties: { size: { type: 'INTEGER' }, grid: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'INTEGER', nullable: true } } }, oddEvenMask: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING', enum: ['odd', 'even', null], nullable: true } } } }, required: ["size", "grid", "oddEvenMask"] } } }, required: ["title", "instruction", "puzzles"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<OddEvenSudokuData[]>;
};

export const generateFutoshikiFromAI = async (options: GeneratorOptions): Promise<FutoshikiData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Futoşhiki" bulmacası. Büyüktür/Küçüktür işaretlerine göre rakamları yerleştir. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING' }, instruction: { type: 'STRING' }, pedagogicalNote: { type: 'STRING' }, puzzles: { type: 'ARRAY', items: { type: 'OBJECT', properties: { size: { type: 'INTEGER' }, grid: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'INTEGER', nullable: true } } }, constraints: { type: 'ARRAY', items: { type: 'OBJECT', properties: { r1: { type: 'INTEGER' }, c1: { type: 'INTEGER' }, r2: { type: 'INTEGER' }, c2: { type: 'INTEGER' }, relation: { type: 'STRING', enum: ['<', '>'] } } } } }, required: ["size", "grid"] } } }, required: ["title", "instruction", "puzzles"] };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<FutoshikiData[]>;
};

export const generateKendokuFromAI = async (options: GeneratorOptions): Promise<KendokuData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Kendoku" (Can-Can) bulmacası. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING' }, instruction: { type: 'STRING' }, pedagogicalNote: { type: 'STRING' }, puzzles: { type: 'ARRAY', items: { type: 'OBJECT', properties: { size: { type: 'INTEGER' }, grid: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'INTEGER', nullable: true } } }, cages: { type: 'ARRAY', items: { type: 'OBJECT', properties: { target: { type: 'INTEGER' }, op: { type: 'STRING' }, cells: { type: 'ARRAY', items: { type: 'OBJECT', properties: { r: { type: 'INTEGER' }, c: { type: 'INTEGER' } } } } } } } }, required: ["size", "grid", "cages"] } } }, required: ["title", "instruction", "puzzles"] };
    return generateWithSchema(prompt, { type: 'ARRAY', items: singleSchema });
};

export const generateNumberPyramidFromAI = async (options: GeneratorOptions): Promise<NumberPyramidData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Sayı Piramidi". Alt iki kutucuğun toplamı üsttekini verecek şekilde pyramid üret. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: 'OBJECT', properties: { title: { type: 'STRING' }, instruction: { type: 'STRING' }, pedagogicalNote: { type: 'STRING' }, pyramids: { type: 'ARRAY', items: { type: 'OBJECT', properties: { rows: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'INTEGER', nullable: true } } } }, required: ["rows"] } } }, required: ["title", "instruction", "pyramids"] };
    return generateWithSchema(prompt, { type: 'ARRAY', items: singleSchema });
};
