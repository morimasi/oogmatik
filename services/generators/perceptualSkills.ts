
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    FindTheDifferenceData, WordComparisonData, ShapeMatchingData, FindIdenticalWordData, GridDrawingData, SymbolCipherData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, RomanNumeralConnectData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData, WordConnectData, CoordinateCipherData, ProfessionConnectData, MatchstickSymmetryData, VisualOddOneOutThemedData, PunctuationColoringData, SynonymAntonymColoringData, StarHuntData, ShapeType, ShapeCountingData
} from '../../types';

const PEDAGOGICAL_PROMPT = `
ÜST DÜZEY EĞİTİM İÇERİĞİ OLUŞTURMA YÖNERGESİ (PREMIUM KALİTE):
1.  **Rol:** Sen, "Özel Eğitim ve Üstün Yetenekliler" için materyal hazırlayan uzman bir pedagogsun.
2.  **Çıktı:** Sadece geçerli JSON.
3.  **"pedagogicalNote":** Bu alan veli/öğretmen içindir. Etkinliğin hangi spesifik bilişsel beceriyi (örn: görsel algı, şekil-zemin ilişkisi, uzamsal konumlandırma) nasıl desteklediğini akademik ama anlaşılır bir dille açıkla.
4.  **"instruction":** Öğrenciye hitap et. Net, motive edici ve anlaşılır ol.
5.  **"imagePrompt":** (Çok Önemli) Sen aynı zamanda bir Sanat Yönetmenisin. SVG üretecek bir yapay zeka için detaylı görsel tasviri yaz.
    - **Stil:** "Flat Vector Art Style", "Educational Illustration", "Clean Lines", "Vibrant Colors".
    - **Detay:** Asla "bir nesne" deme. "Renkli, eğlenceli ve akılda kalıcı bir desen vektörü" de.
    - **Amaç:** Görsel, algısal ayırt etme becerisini ölçmeli.
6.  **İçerik:**
    - İçerik dolu ve gerçekçi olmalı.
`;

export const generateFindTheDifferenceFromAI = async (options: GeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { difficulty, itemCount, worksheetCount, findDiffType, distractionLevel, studentContext } = options;
    
    const typeDesc = findDiffType === 'linguistic' ? 'Harf ve Hece Ayrıştırma (Ayna harfler b-d vb.)' : 
                   findDiffType === 'numeric' ? 'Sayı Ayrıştırma (6-9 benzerliği vb.)' : 
                   findDiffType === 'semantic' ? 'Kelime/Anlam Ayrıştırma (dere-dede vb.)' : 'Sembolik/Piktografik Ayrıştırma';

    const prompt = `
    [GÖREV: GÖRSEL AYRIŞTIRMA (VISUAL DISCRIMINATION) BATARYASI]
    Öğrenci Profili: ${studentContext?.diagnosis?.join(', ') || 'Genel Gelişim'}.
    
    İÇERİK STRATEJİSİ:
    - Tip: ${typeDesc}.
    - Zorluk: ${difficulty}.
    - Çeldirici Zorluğu: ${distractionLevel}.
    - Satır Başı Öğe: ${difficulty === 'Uzman' ? 6 : 4}.
    
    KURALLAR:
    1. Her satırda (row) birbirine ÇOK benzeyen öğeler kullan.
    2. Farklı olan öğe (target), diğerlerinden sadece küçük bir detayla (örn: bir nokta, rotasyon, bir harf değişimi) ayrılmalıdır.
    3. Disleksik çocukların hata yapma eğiliminde olduğu çiftleri seç (b/d, p/q, 6/9, m/n, u/ü).
    
    ÇIKTI FORMATI:
    - title: "Farkı Bul: [Odak Alanı]"
    - rows: [{ items: string[], correctIndex: number, visualDistractionLevel: string }]
    
    ${PEDAGOGICAL_PROMPT}
    `;

    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            rows: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT, 
                    properties: { 
                        items: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                        correctIndex: { type: Type.INTEGER }, 
                        visualDistractionLevel: { type: Type.STRING } 
                    }, 
                    required: ['items', 'correctIndex'] 
                } 
            }
        },
        required: ['title', 'instruction', 'rows', 'pedagogicalNote']
    };

    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<FindTheDifferenceData[]>;
};

export const generateGridDrawingFromAI = async (options: GeneratorOptions): Promise<GridDrawingData[]> => {
    const { gridSize, difficulty, worksheetCount, concept, useSearch } = options;
    
    const prompt = `
    [ROL: ÖZEL ÖĞRENME GÜÇLÜĞÜ PROFESÖRÜ]
    GÖREV: ${gridSize}x${gridSize} boyutunda bir ızgara üzerinde "Kare Kopyalama" (Pattern Copying) etkinliği oluştur.
    
    DÖNÜŞÜM MODU: ${concept || 'copy'} 
    (Yönerge: 'copy' ise birebir, 'mirror_v' ise dikey ayna görüntüsü, 'mirror_h' ise yatay ayna, 'rotate_90' ise 90 derece döndürülmüş hali istenecektir.)
    
    ZORLUK STRATEJİSİ:
    - ${difficulty} seviyesinde bir geometrik desen (çizgiler topluluğu) tasarla.
    - Desen, ızgara üzerindeki nokta koordinatlarını birleştiren [x1, y1] - [x2, y2] segmentlerinden oluşmalıdır.
    - Desenlerin çocukların ilgisini çekecek nesnelere (ev, kedi, roket, yıldız) benzemesini sağla.
    
    KOORDİNAT SİSTEMİ: ${useSearch ? 'A-B-C / 1-2-3 etiketlerini kullanarak koordinat takibi yaptır.' : 'Etiket kullanma, sadece görsel takibe odaklan.'}
    
    ${PEDAGOGICAL_PROMPT}
    `;

    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            transformMode: { type: Type.STRING },
            showCoordinates: { type: Type.BOOLEAN },
            drawings: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT, 
                    properties: { 
                        lines: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } } }, 
                        complexityLevel: { type: Type.STRING },
                        title: { type: Type.STRING }
                    }, 
                    required: ["lines", "complexityLevel"] 
                } 
            }
        },
        required: ["title", "gridDim", "drawings", "instruction", "pedagogicalNote", "transformMode"]
    };

    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<GridDrawingData[]>;
};

export const generateSymmetryDrawingFromAI = async (options: GeneratorOptions): Promise<SymmetryDrawingData[]> => {
    const { difficulty, worksheetCount, gridSize, visualType, useSearch } = options;
    const prompt = `
    [ROL: REHABİLİTASYON UZMANI]
    GÖREV: ${gridSize}x${gridSize} boyutunda "Simetri Tamamlama" (Ayna Çizimi) etkinliği oluştur.
    
    PARAMETRELER:
    - Eksen: ${visualType || 'vertical'} (Dikey veya Yatay simetri hattı).
    - Koordinat Sistemi: ${useSearch ? 'A-B-C ve 1-2-3 etiketleri aktif.' : 'Sadece görsel kılavuz noktaları.'}
    - Zorluk: ${difficulty}.
    
    YAPI:
    - SADECE SİMETRİ EKSENİNİN BİR TARAFINDAKİ (Sol veya Üst) çizgileri ve noktaları (x, y) tanımla. 
    - Öğrenci bu çizgilerin ayna görüntüsünü boş tarafa çizecektir.
    - Çizgiler karmaşık bir figür oluşturmalıdır.
    
    ${PEDAGOGICAL_PROMPT}
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            axis: { type: Type.STRING, enum: ['vertical', 'horizontal'] },
            showCoordinates: { type: Type.BOOLEAN },
            lines: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT, 
                    properties: { x1: { type: Type.INTEGER }, y1: { type: Type.INTEGER }, x2: { type: Type.INTEGER }, y2: { type: Type.INTEGER }, color: { type: Type.STRING } }, 
                    required: ["x1", "y1", "x2", "y2"] 
                } 
            },
            dots: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT, 
                    properties: { x: { type: Type.INTEGER }, y: { type: Type.INTEGER }, color: { type: Type.STRING } }, 
                    required: ["x", "y"] 
                } 
            }
        },
        required: ["title", "instruction", "gridDim", "lines", "axis", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<SymmetryDrawingData[]>;
};

export const generateShapeMatchingFromAI = async (options: GeneratorOptions): Promise<ShapeMatchingData[]> => {
  const { difficulty, worksheetCount } = options;
  const prompt = `
  "${difficulty}" seviyesinde Şekil Eşleştirme. 
  Sol sütun ve Sağ sütun için eşleşen nesneler oluştur.
  Her nesne için 'imageBase64' alanına o nesneyi temsil eden **BASİT, RENKLİ BİR SVG KODU** (<svg>...</svg>) yaz.
  ${PEDAGOGICAL_PROMPT}
  ${worksheetCount} sayfa üret.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      imagePrompt: { type: Type.STRING },
      leftColumn: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, imageBase64: { type: Type.STRING }, color: { type: Type.STRING } }, required: ['id', 'imageBase64'] } },
      rightColumn: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, imageBase64: { type: Type.STRING }, color: { type: Type.STRING } }, required: ['id', 'imageBase64'] } },
      complexity: { type: Type.INTEGER }
    },
    required: ['title', 'instruction', 'leftColumn', 'rightColumn', 'complexity', 'pedagogicalNote', 'imagePrompt']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<ShapeMatchingData[]>;
};

export const generateFindIdenticalWordFromAI = async (options: GeneratorOptions): Promise<FindIdenticalWordData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Aynısını Bul. Hedef kelime ve çeldiriciler. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            groups: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { words: { type: Type.ARRAY, items: { type: Type.STRING } }, distractors: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['words', 'distractors'] } }
        },
        required: ['title', 'groups', 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<FindIdenticalWordData[]>;
};

export const generateSymbolCipherFromAI = async (options: GeneratorOptions): Promise<SymbolCipherData[]> => {
  const { difficulty, worksheetCount } = options;
  const prompt = `"${difficulty}" seviyesinde Şekil Şifresi. Anahtar ve şifreli kelimeler. ${PEDAGOGICAL_PROMPT}`;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      imagePrompt: { type: Type.STRING },
      cipherKey: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { shape: { type: Type.STRING }, letter: { type: Type.STRING }, color: { type: Type.STRING } }, required: ['shape', 'letter'] } },
      wordsToSolve: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { shapeSequence: { type: Type.ARRAY, items: { type: Type.STRING } }, wordLength: { type: Type.INTEGER }, answer: { type: Type.STRING } }, required: ['shapeSequence', 'wordLength', 'answer'] } }
    },
    required: ['title', 'cipherKey', 'wordsToSolve', 'instruction', 'pedagogicalNote', 'imagePrompt']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<SymbolCipherData[]>;
};

export const generateBlockPaintingFromAI = async (options: GeneratorOptions): Promise<BlockPaintingData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Blok Boyama. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            grid: { type: Type.OBJECT, properties: { rows: { type: Type.INTEGER }, cols: { type: Type.INTEGER } }, required: ["rows", "cols"]},
            targetPattern: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
            shapes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, color: { type: Type.STRING }, pattern: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } }, count: { type: Type.INTEGER } }, required: ["color", "pattern", "count"] } }
        },
        required: ["title", "instruction", "grid", "shapes", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<BlockPaintingData[]>;
};

export const generateVisualOddOneOutFromAI = async (options: GeneratorOptions): Promise<VisualOddOneOutData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Şekillerle Farklı Olanı Bul. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            rows: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { segments: { type: Type.ARRAY, items: { type: Type.BOOLEAN } } }, required: ["segments"] } }, correctIndex: { type: Type.INTEGER }, reason: { type: Type.STRING } }, required: ["items", "correctIndex", "reason"] } }
        },
        required: ["title", "instruction", "rows", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<VisualOddOneOutData[]>;
};

export const generateFindDifferentStringFromAI = async (options: GeneratorOptions): Promise<FindDifferentStringData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Farklı Diziyi Bul. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            rows: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { items: { type: Type.ARRAY, items: { type: Type.STRING } }, correctIndex: { type: Type.INTEGER } }, required: ["items", "correctIndex"] } }
        },
        required: ["title", "instruction", "rows", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<FindDifferentStringData[]>;
};

export const generateDotPaintingFromAI = async (options: GeneratorOptions): Promise<DotPaintingData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Nokta Boyama (Gizli Resim). ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt1: { type: Type.STRING },
            prompt2: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            svgViewBox: { type: Type.STRING },
            gridPaths: { type: Type.ARRAY, items: { type: Type.STRING } },
            dots: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { cx: { type: Type.NUMBER }, cy: { type: Type.NUMBER }, color: { type: Type.STRING } }, required: ["cx", "cy", "color"] } },
            hiddenImageName: { type: Type.STRING }
        },
        required: ["title", "prompt1", "prompt2", "svgViewBox", "gridPaths", "dots", "hiddenImageName", "instruction", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<DotPaintingData[]>;
};

export const generateAbcConnectFromAI = async (options: GeneratorOptions): Promise<AbcConnectData[]> => {
    const { difficulty, worksheetCount, gridSize } = options;
    const prompt = `"${difficulty}" seviyesinde Nokta Birleştirme (Flow Free). ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, gridDim: { type: Type.INTEGER }, points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, x: { type: Type.INTEGER }, y: { type: Type.INTEGER }, color: { type: Type.STRING } }, required: ["label", "x", "y"] } } }, required: ["id", "gridDim", "points"] } }
        },
        required: ["title", "instruction", "puzzles", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<AbcConnectData[]>;
};

export const generateCoordinateCipherFromAI = async (options: GeneratorOptions): Promise<CoordinateCipherData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Koordinat Şifreleme. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            wordsToFind: { type: Type.ARRAY, items: { type: Type.STRING } },
            cipherCoordinates: { type: Type.ARRAY, items: { type: Type.STRING } },
            decodedMessage: { type: Type.STRING }
        },
        required: ['title', 'instruction', 'grid', 'wordsToFind', 'cipherCoordinates', 'decodedMessage', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<CoordinateCipherData[]>;
};

export const generateWordConnectFromAI = async (options: GeneratorOptions): Promise<WordConnectData[]> => {
    const { topic, difficulty, worksheetCount, itemCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde, '${topic || 'Genel'}' temalı "Kelime Bağlama" (Eşleştirme) etkinliği.
    ${itemCount || 5} adet kelime çifti oluştur.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, 
            gridDim: { type: Type.INTEGER }, 
            points: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT, 
                    properties: { 
                        word: { type: Type.STRING }, 
                        imagePrompt: { type: Type.STRING }, 
                        pairId: { type: Type.INTEGER }, 
                        x: { type: Type.INTEGER }, 
                        y: { type: Type.INTEGER }, 
                        color: { type: Type.STRING } 
                    }, 
                    required: ['word', 'pairId', 'x', 'y'] 
                } 
            }
        },
        required: ['title', 'instruction', 'points', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<WordConnectData[]>;
};

export const generateProfessionConnectFromAI = async (options: GeneratorOptions): Promise<ProfessionConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde Meslek Eşleştirme. Meslekler ve araçları için **İngilizce** 'imagePrompt'.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
     const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, imageDescription: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, pairId: { type: Type.INTEGER } }, required: ["label", "imageDescription", "imagePrompt", "x", "y", "pairId"] } }
        },
        required: ["title", "instruction", "points", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<ProfessionConnectData[]>;
};

export const generateMatchstickSymmetryFromAI = async (options: GeneratorOptions): Promise<MatchstickSymmetryData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Kibrit Simetrisi. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, axis: { type: Type.STRING, enum: ['vertical', 'horizontal'] }, lines: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x1: { type: Type.NUMBER }, y1: { type: Type.NUMBER }, x2: { type: Type.NUMBER }, y2: { type: Type.NUMBER }, color: { type: Type.STRING } }, required: ["x1", "y1", "x2", "y2"] } } }, required: ["id", "lines", "axis"] } }
        },
        required: ["title", "instruction", "puzzles", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<MatchstickSymmetryData[]>;
};

export const generateVisualOddOneOutThemedFromAI = async (options: GeneratorOptions): Promise<VisualOddOneOutThemedData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `
    '${topic}' temalı, "${difficulty}" seviyesinde Görsel Farklı Olanı Bul.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
     const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            rows: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { theme: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, isOdd: { type: Type.BOOLEAN } }, required: ["description", "imagePrompt", "isOdd"] } } }, required: ["theme", "items"] } }
        },
        required: ["title", "instruction", "rows", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<VisualOddOneOutThemedData[]>;
};

export const generatePunctuationColoringFromAI = async (options: GeneratorOptions): Promise<PunctuationColoringData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Noktalama Boyama. ${PEDAGOGICAL_PROMPT}`;
     const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            sentences: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, color: { type: Type.STRING }, correctMark: { type: Type.STRING } }, required: ["text", "color", "correctMark"] } }
        },
        required: ["title", "instruction", "sentences", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<PunctuationColoringData[]>;
};

export const generateSynonymAntonymColoringFromAI = async (options: GeneratorOptions): Promise<SynonymAntonymColoringData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Eş/Zıt Anlam Boyama. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            colorKey: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, color: { type: Type.STRING } }, required: ["text", "color"] } },
            wordsOnImage: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["word", "x", "y"] } }
        },
        required: ["title", "instruction", "colorKey", "wordsOnImage", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<SynonymAntonymColoringData[]>;
};

export const generateStarHuntFromAI = async (options: GeneratorOptions): Promise<StarHuntData[]> => {
    const { difficulty, worksheetCount, gridSize } = options;
    const prompt = `"${difficulty}" seviyesinde Yıldız Avı. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            targetCount: { type: Type.INTEGER }
        },
        required: ["title", "instruction", "grid", "targetCount", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<StarHuntData[]>;
};

/* Removed duplicate generateShapeCountingFromAI as it is already defined in mathGeometry.ts */
