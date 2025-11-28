
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    NumberPatternData, ShapeNumberPatternData,
    ThematicOddOneOutData, PunctuationMazeData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationPhoneNumberData,
    ArithmeticConnectData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData, VisualNumberPatternData,
    LogicGridPuzzleData
} from '../../types';
import { generateMazePath } from '../offlineGenerators/helpers';

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
    const singleSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, patterns: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { sequence: { type: Type.STRING }, answer: { type: Type.STRING } }, required: ['sequence', 'answer'] } } }, required: ['title', 'instruction', 'patterns', 'pedagogicalNote', 'imagePrompt'] };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<NumberPatternData[]>;
};

export const generateShapeNumberPatternFromAI = async (options: GeneratorOptions): Promise<ShapeNumberPatternData[]> => {
    // ... (unchanged)
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Şekilli Sayı Örüntüsü (Shape Number Pattern) oluştur. Üçgenlerin köşelerindeki sayılarla (veya merkezindeki) bir matematiksel ilişki kur. Örn: Üst sayı = (Sol alt + Sağ alt) * 2 veya benzeri mantıklı bir kural. Bir şekildeki sayı '?' olsun. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, patterns: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { shapes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING, enum: ['triangle'] }, numbers: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["type", "numbers"] } } }, required: ["shapes"] } } }, required: ["title", "patterns", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ShapeNumberPatternData[]>;
};

export const generateThematicOddOneOutFromAI = async (options: GeneratorOptions): Promise<ThematicOddOneOutData[]> => {
    // ... (unchanged)
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `'${topic}' temalı, "${difficulty}" seviyesinde "Tematik Farklı Olanı Bul" etkinliği. Her satırda 4 kelime/kavram olsun. 3'ü temaya uygun, 1'i farklı (semantik olarak). Her kelime için **İngilizce** 'imagePrompt' oluştur. Stil: "Cute colorful icon set style, flat vector". Ana görsel (imagePrompt) tema ile ilgili zengin bir illüstrasyon olsun. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, theme: { type: Type.STRING }, rows: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { words: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, imagePrompt: { type: Type.STRING } }, required: ["text", "imagePrompt"] } }, oddWord: { type: Type.STRING } }, required: ["words", "oddWord"] } }, sentencePrompt: { type: Type.STRING } }, required: ["title", "prompt", "theme", "rows", "sentencePrompt", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: Type.ARRAY, items: singleSchema };
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
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            punctuationMark: { type: Type.STRING },
            correctSentences: { type: Type.ARRAY, items: { type: Type.STRING } },
            incorrectSentences: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "prompt", "punctuationMark", "correctSentences", "incorrectSentences", "instruction", "pedagogicalNote", "imagePrompt"]
    };
    
    const schema = { type: Type.ARRAY, items: singleSchema };
    const rawData = await generateWithSchema(prompt, schema) as any[];

    // Post-process to add spatial grid
    return rawData.map(data => {
        const rows = 5;
        const cols = 5;
        const { grid, pathIds, distractorIds } = generateMazePath(rows, cols);
        
        const finalRules: {id: number, text: string, isCorrect: boolean, isPath: boolean}[] = [];
        const corrects = data.correctSentences || [];
        const incorrects = data.incorrectSentences || [];
        
        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
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
    const singleSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, rows: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { words: { type: Type.ARRAY, items: { type: Type.STRING } }, oddWord: { type: Type.STRING } }, required: ["words", "oddWord"] } }, sentencePrompt: { type: Type.STRING } }, required: ["title", "prompt", "rows", "sentencePrompt", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ThematicOddOneOutSentenceData[]>;
};

export const generateColumnOddOneOutSentenceFromAI = async (options: GeneratorOptions): Promise<ColumnOddOneOutSentenceData[]> => {
    // ... (unchanged)
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Sütunda Farklı Olanı Bul" etkinliği. 4 sütun oluştur. Her sütunda anlamsal olarak uyumsuz bir kelime olsun. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, columns: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { words: { type: Type.ARRAY, items: { type: Type.STRING } }, oddWord: { type: Type.STRING } }, required: ["words", "oddWord"] } }, sentencePrompt: { type: Type.STRING } }, required: ["title", "prompt", "columns", "sentencePrompt", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ColumnOddOneOutSentenceData[]>;
};

export const generatePunctuationPhoneNumberFromAI = async (options: GeneratorOptions): Promise<PunctuationPhoneNumberData[]> => {
    // ... (unchanged)
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "Noktalama Telefonu" bulmacası. 7 adet ipucu ver. Her ipucu bir noktalama işareti kuralını veya sayısını işaret etsin ve bir rakama karşılık gelsin. Örn: "Cümle sonuna konan nokta sayısı = 3". ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, clues: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, text: { type: Type.STRING } }, required: ["id", "text"] } }, solution: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { punctuationMark: { type: Type.STRING }, number: { type: Type.INTEGER } }, required: ["punctuationMark", "number"] } } }, required: ["title", "prompt", "instruction", "clues", "solution", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<PunctuationPhoneNumberData[]>;
};

// ... (other exports like generateArithmeticConnectFromAI, etc. remain unchanged)
export const generateArithmeticConnectFromAI = async (options: GeneratorOptions): Promise<ArithmeticConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde "İşlem Bağlamaca". 10-12 adet aritmetik işlem (veya sonuç sayı) oluştur. Aynı sonuca çıkan işlemleri eşleştirmek üzere gruplandır. Görsel olarak sayıları birbirine bağlayan çizgiler hayal et. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, example: { type: Type.STRING }, expressions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, value: { type: Type.INTEGER }, group: { type: Type.INTEGER }, x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["text", "value", "group", "x", "y"] } } }, required: ["title", "prompt", "example", "expressions", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ArithmeticConnectData[]>;
};

export const generateRomanArabicMatchConnectFromAI = async (options: GeneratorOptions): Promise<RomanArabicMatchConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Romen ve Arap rakamlarını eşleştirme oyunu. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, gridDim: { type: Type.INTEGER }, points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, pairId: { type: Type.INTEGER }, x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["label", "pairId", "x", "y"] } } }, required: ["title", "prompt", "gridDim", "points", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<RomanArabicMatchConnectData[]>;
};

export const generateWeightConnectFromAI = async (options: GeneratorOptions): Promise<WeightConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Ağırlık Eşleştirme. Farklı birimlerdeki (kg, g) eşit ağırlıkları eşleştir. Görseller için **İngilizce** 'imagePrompt' oluştur (tartı, meyve, sebze vb.). Stil: "Flat icon" veya "Vector". ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, gridDim: { type: Type.INTEGER }, points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, pairId: { type: Type.INTEGER }, x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, imagePrompt: { type: Type.STRING } }, required: ["label", "pairId", "x", "y", "imagePrompt"] } } }, required: ["title", "prompt", "gridDim", "points", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<WeightConnectData[]>;
};

export const generateLengthConnectFromAI = async (options: GeneratorOptions): Promise<LengthConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Uzunluk Eşleştirme. Farklı birimlerdeki (m, cm, km) eşit uzunlukları eşleştir. Görseller için **İngilizce** 'imagePrompt' (cetvel, metre, yol vb.). ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, gridDim: { type: Type.INTEGER }, points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, pairId: { type: Type.INTEGER }, x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, imagePrompt: { type: Type.STRING } }, required: ["label", "pairId", "x", "y", "imagePrompt"] } } }, required: ["title", "prompt", "gridDim", "points", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<LengthConnectData[]>;
};

export const generateVisualNumberPatternFromAI = async (options: GeneratorOptions): Promise<VisualNumberPatternData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Görsel Sayı Örüntüsü. Sayıların rengi, boyutu ve değeri bir kurala göre değişsin. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { number: { type: Type.INTEGER }, color: { type: Type.STRING }, size: { type: Type.NUMBER } }, required: ["number", "color", "size"] } }, rule: { type: Type.STRING }, answer: { type: Type.INTEGER } }, required: ["items", "rule", "answer"] } } }, required: ["title", "prompt", "puzzles", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<VisualNumberPatternData[]>;
};

export const generateLogicGridPuzzleFromAI = async (options: GeneratorOptions): Promise<LogicGridPuzzleData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Mantık Tablosu (Logic Grid Puzzle). Kişiler, nesneler ve özellikleri içeren ipuçları ver. Nesneler için **İngilizce** 'imagePrompt' oluştur. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const singleSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, clues: { type: Type.ARRAY, items: { type: Type.STRING } }, people: { type: Type.ARRAY, items: { type: Type.STRING } }, categories: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, imageDescription: { type: Type.STRING }, imagePrompt: { type: Type.STRING } }, required: ["name", "imageDescription", "imagePrompt"] } } }, required: ["title", "items"] } } }, required: ["title", "prompt", "clues", "people", "categories", "instruction", "pedagogicalNote", "imagePrompt"] };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<LogicGridPuzzleData[]>;
};
