
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

export const generateVisualOddOneOutFromAI = async (options: GeneratorOptions): Promise<VisualOddOneOutData[]> => {
    const { difficulty, worksheetCount, visualType, distractionLevel, gridSize, studentContext } = options;
    
    const typeDesc = visualType === 'geometric' ? 'Karmaşık Geometrik Şekiller (Düz çizgiler)' : 
                   visualType === 'abstract' ? 'Soyut Desenler ve Eğri Çizgiler (Bezier paths)' : 
                   visualType === 'character' ? 'Ayna Harf ve Rakamlar (b/d, p/q, 6/9 vb.)' : 'Karmaşık poligonlar ve fraktal benzeri yapılar';

    const prompt = `
    [GÖREV: GÖRSEL AYRİT ETME (VISUAL ODD-ONE-OUT) TANISAL ETKİNLİK]
    [MODEL: Gemini 3.0 Flash Preview Multimodal]
    
    PARAMETRELER:
    - Mimari Tip: ${typeDesc}.
    - Zorluk: ${difficulty}.
    - Çeldirici Hassasiyeti: ${distractionLevel}.
    - Satır Başı Öğe Sayısı: ${gridSize || 4}.
    - Öğrenci Profili: ${studentContext?.diagnosis?.join(', ') || 'Genel Gelişim'}.
    
    İÇERİK MİMARİSİ:
    1. Eğer 'character' seçildiyse: 'label' alanına tek karakter (örn: "b") yaz.
    2. Diğer tipler için 'svgPaths' dizisinde 100x100 koordinat sistemine uygun geçerli SVG 'd' yolları döndür.
    3. Her satırda bir adet "Odd One" (Farklı) ve diğerleri birbirinin aynısı "Base" öğeler üret.
    4. Farkı oluştururken ${distractionLevel} seviyesini baz al (renk, rotasyon, bir çizgi eksikliği veya ayna görüntüsü).
    
    ÇIKTI FORMATI:
    - rows: [{ items: [{ svgPaths?: [{ d: string, fill?: string, stroke?: string, strokeWidth?: number }], label?: string, rotation?: number, scale?: number }], correctIndex: number, reason: string }]
    
    ${PEDAGOGICAL_PROMPT}
    `;

    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            difficultyLevel: { type: Type.STRING },
            distractionLevel: { type: Type.STRING },
            rows: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT, 
                    properties: { 
                        items: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    svgPaths: { 
                                        type: Type.ARRAY, 
                                        items: { 
                                            type: Type.OBJECT, 
                                            properties: { 
                                                d: { type: Type.STRING }, 
                                                fill: { type: Type.STRING }, 
                                                stroke: { type: Type.STRING },
                                                strokeWidth: { type: Type.NUMBER }
                                            } 
                                        } 
                                    },
                                    label: { type: Type.STRING },
                                    rotation: { type: Type.NUMBER },
                                    scale: { type: Type.NUMBER },
                                    isMirrored: { type: Type.BOOLEAN }
                                } 
                            } 
                        }, 
                        correctIndex: { type: Type.INTEGER }, 
                        reason: { type: Type.STRING }
                    }, 
                    required: ["items", "correctIndex"] 
                } 
            }
        },
        required: ["title", "instruction", "rows", "pedagogicalNote"]
    };

    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<VisualOddOneOutData[]>;
};

export const generateFindTheDifferenceFromAI = async (options: GeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { difficulty, itemCount, worksheetCount, findDiffType, distractionLevel, studentContext, gridSize } = options;
    
    const typeDesc = findDiffType === 'linguistic' ? 'Harf ve Hece Ayrıştırma (Ayna harfler b-d, p-q, m-n, u-ü vb.)' : 
                   findDiffType === 'numeric' ? 'Sayı Ayrıştırma (6-9, 2-5, 3-8, 1-7 benzerliği vb.)' : 
                   findDiffType === 'semantic' ? 'Kelime/Anlam Ayrıştırma (kale-lale, dere-dede, baba-dada vb.)' : 'Sembolik/Piktografik Ayrıştırma (Ok yönleri, konum farkları)';

    const prompt = `
    [ROL: KIDEMLİ ÖZEL EĞİTİM PROFÖSÖRÜ]
    [GÖREV: GÖRSEL AYRIŞTIRMA (VISUAL DISCRIMINATION) BATARYASI ÜRET]
    [MODEL: Gemini 3.0 Flash Preview Multimodal]
    
    Öğrenci Profili: ${studentContext?.diagnosis?.join(', ') || 'Genel Gelişim'}.
    
    İÇERİK STRATEJİSİ:
    - ODAK ALAN: ${typeDesc}.
    - ZORLUK: ${difficulty}.
    - FARK BELİRGİNLİĞİ: ${distractionLevel}. (Extreme ise farklar neredeyse görünmez olmalı).
    - SATIR BAŞI ÖĞE: ${gridSize || 4}.
    - TOPLAM SATIR (GÖREV): ${itemCount || 8}.
    
    KURALLAR:
    1. Her satırda (row) birbirine ÇOK benzeyen öğeler kullan.
    2. Farklı olan öğe (target), diğerlerinden sadece kritik bir detayla ayrılmalı.
    3. Disleksik çocukların hata yapma eğiliminde olduğu çiftleri seç.
    
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
