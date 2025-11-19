
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    FindTheDifferenceData, StroopTestData, OddOneOutData, FindIdenticalWordData, GridDrawingData, ChaoticNumberSearchData,
    BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, ShapeMatchingData, SymbolCipherData, CoordinateCipherData, AbcConnectData, WordConnectData, ProfessionConnectData, VisualOddOneOutThemedData, MatchstickSymmetryData, PunctuationColoringData, SynonymAntonymColoringData, StarHuntData
} from '../../types';

const SHAPE_TYPES = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon', 'cube', 'sphere', 'pyramid', 'cone', 'heart', 'cloud', 'moon'];

// --- 1. Farkı Bul (Görsel Algı) ---
export const generateFindTheDifferenceFromAI = async (options: GeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { topic, itemCount: rowCount, difficulty, worksheetCount } = options;
    const prompt = `
    '${topic}' temalı ve "${difficulty}" zorluk seviyesinde profesyonel bir "Farkı Bul" (Find the Difference) etkinliği oluştur.
    AMAÇ: Çocuğun görsel ayrım becerisini ve dikkatini ölçmek.
    Her satırda 4 kelime veya metin tabanlı şekil olmalı. Bunlardan 3'ü birbirinin tıpatıp aynısı, 1 tanesi ise çok ince bir farka sahip olmalı.
    
    Zorluk Seviyeleri:
    - Başlangıç: Fark belirgin (örn: "elma" vs "elam").
    - Orta: Harf yer değiştirmesi veya benzer harf kullanımı (örn: "kalem" vs "kelam").
    - Zor/Uzman: Görsel olarak çok benzeyen harfler (b/d, p/q, m/n) veya sadece bir nokta farkı (ı/i, o/ö).

    JSON Çıktısı:
    - title: Etkinlik başlığı (örn: "Dikkatli Gözler: Kelime Avı")
    - instruction: Çocuğa yönelik açık yönerge (örn: "Her satırda diğerlerinden farklı olan kelimeyi bul ve daire içine al.")
    - pedagogicalNote: Öğretmen/ebeveyn için bu etkinliğin hangi beceriyi geliştirdiğine dair kısa not.
    - rows: ${rowCount} adet satır. Her satırda 'items' (4 adet string), 'correctIndex' (farklı olanın indeksi) ve 'visualDistractionLevel' (dikkat dağıtıcı seviyesi).
    
    ${worksheetCount} adet benzersiz sayfa oluştur.
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
                        visualDistractionLevel: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
                    },
                    required: ['items', 'correctIndex', 'visualDistractionLevel']
                }
            }
        },
        required: ['title', 'instruction', 'rows', 'pedagogicalNote']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<FindTheDifferenceData[]>;
};

// --- 3. Şekil Eşleştirme ---
export const generateShapeMatchingFromAI = async (options: GeneratorOptions): Promise<ShapeMatchingData[]> => {
  const { difficulty, worksheetCount, itemCount } = options;
  const prompt = `
    "${difficulty}" seviyesinde profesyonel bir "Şekil Eşleştirme" etkinliği hazırla.
    AMAÇ: Görsel eşleştirme ve form algısını geliştirmek.
    Solda numaralı bir sütun, sağda harfli bir sütun olsun.
    
    Zorluk Seviyeleri:
    - Başlangıç: Basit geometrik şekiller (kare, daire).
    - Orta: Renkli şekiller veya döndürülmüş şekiller.
    - Zor/Uzman: Karmaşık şekil kombinasyonları (örn: kare içinde daire) veya 3 boyutlu şekiller.

    JSON Çıktısı:
    - leftColumn: {id, shapes: [ShapeType], color?}
    - rightColumn: {id, shapes: [ShapeType], color?} (Sol sütundakilerin karıştırılmış hali)
    - complexity: Zorluk derecesi (1-10).
    
    Kullanılabilir Şekiller: ${SHAPE_TYPES.join(', ')}.
    ${worksheetCount} sayfa oluştur.
  `;
  
  const itemSchema = {
      type: Type.OBJECT,
      properties: {
          id: { type: Type.STRING }, // number or letter cast to string
          shapes: { type: Type.ARRAY, items: { type: Type.STRING, enum: SHAPE_TYPES } },
          color: { type: Type.STRING }
      },
      required: ['id', 'shapes']
  };

  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      leftColumn: { type: Type.ARRAY, items: itemSchema },
      rightColumn: { type: Type.ARRAY, items: itemSchema },
      complexity: { type: Type.INTEGER }
    },
    required: ['title', 'instruction', 'leftColumn', 'rightColumn', 'complexity']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  // @ts-ignore - ID types might mismatch slightly in prompt vs implementation but generator handles conversion
  return generateWithSchema(prompt, schema);
};

// --- 4. Aynısını Bul ---
export const generateFindIdenticalWordFromAI = async (options: GeneratorOptions): Promise<FindIdenticalWordData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde "Aynısını Bul" etkinliği.
    Her soruda bir "Hedef Kelime/Şekil Grubu" ve yanında çeldiriciler olsun. Öğrenci hedefle tıpatıp aynı olanı bulmalıdır.
    Çeldiriciler hedefe çok benzemeli (sadece bir harf/şekil farklı olmalı).
    ${worksheetCount} sayfa, her sayfada ${itemCount} grup.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            groups: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        words: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 2, maxItems: 2, description: "First item is target, second is the identical match found in choices." },
                        distractors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Similar but incorrect items" }
                    },
                    required: ['words', 'distractors']
                }
            }
        },
        required: ['title', 'groups', 'instruction']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<FindIdenticalWordData[]>;
};

// --- 5. Ayna Çizimi (Grid Drawing) ---
export const generateGridDrawingFromAI = async (options: GeneratorOptions): Promise<GridDrawingData[]> => {
    const { gridSize, itemCount, difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde ${gridSize}x${gridSize} ızgara üzerinde "Ayna Çizimi" (Copy the Pattern) etkinliği.
    Basit çizgilerden oluşan anlamlı veya soyut desenler oluştur.
    Zorluk arttıkça çizgi sayısı ve karmaşıklığı artsın.
    Çıktı: Koordinat noktaları [x,y] arasındaki çizgiler listesi.
    ${worksheetCount} sayfa.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            drawings: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        lines: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } } },
                        complexityLevel: { type: Type.STRING }
                    },
                    required: ["lines", "complexityLevel"]
                }
            }
        },
        required: ["title", "gridDim", "drawings", "instruction"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<GridDrawingData[]>;
};

// --- 6. Şekil Şifresi (Symbol Cipher) ---
export const generateSymbolCipherFromAI = async (options: GeneratorOptions): Promise<SymbolCipherData[]> => {
  const { itemCount, difficulty, worksheetCount, topic } = options;
  const prompt = `
    '${topic}' temalı ve "${difficulty}" seviyesinde "Şifre Çözme" etkinliği.
    Bir "Anahtar" (Key) tablosu oluştur: Her harf bir şekille eşleşsin.
    Sonra bu anahtarı kullanarak çözülmesi gereken gizli kelimeler/cümleler oluştur.
    Kelimeler temayla ilgili olmalı.
    ${worksheetCount} sayfa.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      cipherKey: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { shape: { type: Type.STRING, enum: SHAPE_TYPES }, letter: { type: Type.STRING }, color: { type: Type.STRING } },
          required: ['shape', 'letter']
        }
      },
      wordsToSolve: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            shapeSequence: { type: Type.ARRAY, items: { type: Type.STRING, enum: SHAPE_TYPES } },
            wordLength: { type: Type.INTEGER },
            answer: { type: Type.STRING }
          },
          required: ['shapeSequence', 'wordLength', 'answer']
        }
      }
    },
    required: ['title', 'cipherKey', 'wordsToSolve', 'instruction']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<SymbolCipherData[]>;
};

// --- 7. Blok Boyama ---
export const generateBlockPaintingFromAI = async (options: GeneratorOptions): Promise<BlockPaintingData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde "Blok Boyama / Piksel Kodlama" etkinliği.
    10x10 bir ızgara düşün. Belirli kareleri boyayarak basit bir resim (kalp, ev, gemi vb.) oluştur.
    Sonra bu resmi oluşturmak için gereken "Kodları" (hangi satırda kaç kare hangi renge boyanacak) veya şekil parçalarını ver.
    ${worksheetCount} sayfa.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            grid: { type: Type.OBJECT, properties: { rows: { type: Type.INTEGER }, cols: { type: Type.INTEGER } }, required: ["rows", "cols"]},
            targetPattern: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
            shapes: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        color: { type: Type.STRING },
                        pattern: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
                        count: { type: Type.INTEGER }
                    },
                    required: ["color", "pattern", "count"]
                }
            }
        },
        required: ["title", "instruction", "grid", "shapes"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<BlockPaintingData[]>;
};

// --- 8. Görsel Farklı Olanı Bul (Visual Odd One Out) ---
export const generateVisualOddOneOutFromAI = async (options: GeneratorOptions): Promise<VisualOddOneOutData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde "Şekillerle Farklı Olanı Bul" etkinliği.
    Her sırada 4 şekil olsun. Şekiller 7-segment veya 9-segment display mantığıyla (çizgilerden oluşan) oluşturulsun.
    3 şekil aynı kurala uysun (örn: hepsi simetrik, hepsi kapalı), 1 tanesi uymasın.
    Mantıksal bir sebebi olsun.
    ${worksheetCount} sayfa.
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
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: { segments: { type: Type.ARRAY, items: { type: Type.BOOLEAN } } },
                                required: ["segments"]
                            }
                        },
                        correctIndex: { type: Type.INTEGER },
                        reason: { type: Type.STRING }
                    },
                    required: ["items", "correctIndex", "reason"]
                }
            }
        },
        required: ["title", "instruction", "rows"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<VisualOddOneOutData[]>;
};

// --- 9. Simetri Çizimi ---
export const generateSymmetryDrawingFromAI = async (options: GeneratorOptions): Promise<SymmetryDrawingData[]> => {
    const { difficulty, worksheetCount, gridSize } = options;
    const prompt = `
    "${difficulty}" seviyesinde "Simetri Tamamlama" etkinliği.
    ${gridSize}x${gridSize} ızgaranın yarısına (veya bir kısmına) noktalar veya çizgiler yerleştir.
    Kullanıcının diğer yarıyı simetrik olarak tamamlaması için verileri oluştur.
    Eksen dikey veya yatay olabilir.
    ${worksheetCount} sayfa.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            dots: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { x: { type: Type.INTEGER }, y: { type: Type.INTEGER }, color: { type: Type.STRING } },
                    required: ["x", "y"]
                }
            },
            lines: {
                 type: Type.ARRAY,
                 items: {
                     type: Type.OBJECT,
                     properties: { x1: { type: Type.INTEGER }, y1: { type: Type.INTEGER }, x2: { type: Type.INTEGER }, y2: { type: Type.INTEGER } },
                     required: ["x1", "y1", "x2", "y2"]
                 }
            },
            axis: { type: Type.STRING, enum: ['vertical', 'horizontal'] },
            isMirrorImage: { type: Type.BOOLEAN }
        },
        required: ["title", "instruction", "gridDim", "dots", "axis"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<SymmetryDrawingData[]>;
};

// --- 10. Farklı Diziyi Bul ---
export const generateFindDifferentStringFromAI = async (options: GeneratorOptions): Promise<FindDifferentStringData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde "Farklı Diziyi Bul" dikkat testi.
    Her satırda 4-5 adet harf/sayı dizisi olsun (örn: "X89K"). Bunlardan biri diğerlerinden tek bir karakterle farklı olsun (örn: "X88K").
    Zorluk seviyesine göre dizi uzunluğunu ve benzerliğini ayarla.
    ${worksheetCount} sayfa.
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
                        correctIndex: { type: Type.INTEGER }
                    },
                    required: ["items", "correctIndex"]
                }
            }
        },
        required: ["title", "instruction", "rows"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<FindDifferentStringData[]>;
};

// --- 11. Nokta Boyama ---
export const generateDotPaintingFromAI = async (options: GeneratorOptions): Promise<DotPaintingData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde "Nokta Boyama" (Dot to Dot / Pixel Art) etkinliği.
    Basit bir gizli resim (kalp, çiçek, ev, araba) tasarla.
    Bu resmi oluşturacak noktaların koordinatlarını (cx, cy) ve renklerini ver.
    Izgara çizgileri için SVG path verilerini sağla.
    ${worksheetCount} sayfa.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt1: { type: Type.STRING, description: "Instruction title" },
            prompt2: { type: Type.STRING, description: "Instruction detail" },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            svgViewBox: { type: Type.STRING },
            gridPaths: { type: Type.ARRAY, items: { type: Type.STRING } },
            dots: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { cx: { type: Type.NUMBER }, cy: { type: Type.NUMBER }, color: { type: Type.STRING } },
                    required: ["cx", "cy", "color"]
                }
            },
            hiddenImageName: { type: Type.STRING }
        },
        required: ["title", "prompt1", "prompt2", "svgViewBox", "gridPaths", "dots", "hiddenImageName"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<DotPaintingData[]>;
};

// --- 12. ABC Bağlama ---
export const generateAbcConnectFromAI = async (options: GeneratorOptions): Promise<AbcConnectData[]> => {
    const { difficulty, worksheetCount, gridSize } = options;
    const prompt = `
    "${difficulty}" seviyesinde ${gridSize}x${gridSize} "Nokta Birleştirme" (Flow Free style) bulmacası.
    Aynı harfleri (A-A, B-B, C-C...) çizgiler kesişmeden birleştirmek gerekir.
    Çözülebilir, mantıklı bir yerleşim oluştur.
    ${worksheetCount} sayfa.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        gridDim: { type: Type.INTEGER },
                        points: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: { label: { type: Type.STRING }, x: { type: Type.INTEGER }, y: { type: Type.INTEGER }, color: { type: Type.STRING } },
                                required: ["label", "x", "y"]
                            }
                        }
                    },
                    required: ["id", "gridDim", "points"]
                }
            }
        },
        required: ["title", "instruction", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<AbcConnectData[]>;
};

// --- 13. Koordinat Şifreleme ---
export const generateCoordinateCipherFromAI = async (options: GeneratorOptions): Promise<CoordinateCipherData[]> => {
    const { topic, gridSize, itemCount, difficulty, worksheetCount } = options;
    const prompt = `
    '${topic}' temalı, "${difficulty}" seviyesinde Koordinat Şifreleme.
    Bir ızgaraya harfler yerleştir. Şifreli bir mesaj oluştur (Örn: "OKUMAYI SEVİYORUM").
    Bu mesajı oluşturmak için gereken koordinatları (A1, B3 gibi) sıralı olarak ver.
    ${worksheetCount} sayfa.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            wordsToFind: { type: Type.ARRAY, items: { type: Type.STRING } },
            cipherCoordinates: { type: Type.ARRAY, items: { type: Type.STRING } },
            decodedMessage: { type: Type.STRING }
        },
        required: ['title', 'instruction', 'grid', 'wordsToFind', 'cipherCoordinates', 'decodedMessage']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<CoordinateCipherData[]>;
};

// --- 14. Kelime Bağlama ---
export const generateWordConnectFromAI = async (options: GeneratorOptions): Promise<WordConnectData[]> => {
     // Handled by Logic or Word Games mostly, but mapped here for Visual Skills category
     // Using a simplified prompt as implementation exists elsewhere often.
     return [];
};

// --- 15. Meslek Eşleştirme (Görsel) ---
export const generateProfessionConnectFromAI = async (options: GeneratorOptions): Promise<ProfessionConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde Meslek ve Araç eşleştirme etkinliği.
    Meslek adı ve o mesleğe ait bir aletin görselini (imagePrompt) içeren çiftler oluştur.
    Kullanıcı bunları çizgilerle eşleştirmeli.
    ${worksheetCount} sayfa.
    `;
     const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            points: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        imageDescription: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING }, // Will be converted to base64
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        pairId: { type: Type.INTEGER }
                    },
                    required: ["label", "imageDescription", "imagePrompt", "x", "y", "pairId"]
                }
            }
        },
        required: ["title", "instruction", "points"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ProfessionConnectData[]>;
};

// --- 16. Kibrit Simetrisi ---
export const generateMatchstickSymmetryFromAI = async (options: GeneratorOptions): Promise<MatchstickSymmetryData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde Kibrit Çöpü Simetri bulmacası.
    Izgara üzerinde kibrit çöplerinden (çizgilerden) oluşan yarım bir şekil (ev, yıldız, balık vb.) tasarla.
    Kullanıcının diğer yarısını tamamlaması gerekir.
    ${worksheetCount} sayfa.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        axis: { type: Type.STRING, enum: ['vertical', 'horizontal'] },
                        lines: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: { x1: { type: Type.NUMBER }, y1: { type: Type.NUMBER }, x2: { type: Type.NUMBER }, y2: { type: Type.NUMBER }, color: { type: Type.STRING } },
                                required: ["x1", "y1", "x2", "y2"]
                            }
                        }
                    },
                    required: ["id", "lines", "axis"]
                }
            }
        },
        required: ["title", "instruction", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<MatchstickSymmetryData[]>;
};

// --- 17. Tematik Görsel Fark ---
export const generateVisualOddOneOutThemedFromAI = async (options: GeneratorOptions): Promise<VisualOddOneOutThemedData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `
    '${topic}' temalı, "${difficulty}" seviyesinde "Farklı Olanı Bul".
    Her satırda 4 resim olsun. 3'ü temaya uygun, 1'i temaya uygun olmayan veya farklı bir kategoriden olsun.
    Her öğe için İngilizce 'imagePrompt' oluştur.
    ${worksheetCount} sayfa.
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
                        theme: { type: Type.STRING },
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: { description: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, isOdd: { type: Type.BOOLEAN } },
                                required: ["description", "imagePrompt", "isOdd"]
                            }
                        }
                    },
                    required: ["theme", "items"]
                }
            }
        },
        required: ["title", "instruction", "rows"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<VisualOddOneOutThemedData[]>;
};

export const generatePunctuationColoringFromAI = async (options: GeneratorOptions): Promise<PunctuationColoringData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde Noktalama İşaretlerine Göre Boyama etkinliği.
    Birkaç cümle ver. Cümlenin sonuna gelmesi gereken noktalama işaretine göre (Nokta=Kırmızı, Soru İşareti=Mavi vb.) yanında verilen şeklin boyanmasını iste.
    ${worksheetCount} sayfa.
    `;
     const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            sentences: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { text: { type: Type.STRING }, color: { type: Type.STRING }, correctMark: { type: Type.STRING } },
                    required: ["text", "color", "correctMark"]
                }
            }
        },
        required: ["title", "instruction", "sentences"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<PunctuationColoringData[]>;
};

export const generateSynonymAntonymColoringFromAI = async (options: GeneratorOptions): Promise<SynonymAntonymColoringData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde Eş/Zıt Anlamlı Kelime Boyama.
    Bir gizli resim (pixel art gibi koordinatlı) oluştur.
    Her hücrede bir kelime olsun. Renk anahtarı: "Siyah'ın zıttı olanlar Kırmızıya", "Al'ın eş anlamlısı olanlar Maviye" gibi yönergeler içersin.
    ${worksheetCount} sayfa.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            colorKey: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { text: { type: Type.STRING }, color: { type: Type.STRING } },
                    required: ["text", "color"]
                }
            },
            wordsOnImage: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { word: { type: Type.STRING }, x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
                    required: ["word", "x", "y"]
                }
            }
        },
        required: ["title", "instruction", "colorKey", "wordsOnImage"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<SynonymAntonymColoringData[]>;
};

export const generateStarHuntFromAI = async (options: GeneratorOptions): Promise<StarHuntData[]> => {
    const { difficulty, worksheetCount, gridSize } = options;
    const prompt = `
    "${difficulty}" seviyesinde Yıldız Avı (Star Battle logic puzzle) benzeri bir oyun.
    ${gridSize}x${gridSize} ızgara. Her satırda ve sütunda belirli sayıda (örn: 2) yıldız olmalı.
    Yıldızlar birbirine (çapraz dahil) değmemeli.
    Çözülmüş ızgarayı ver.
    ${worksheetCount} sayfa.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            targetCount: { type: Type.INTEGER }
        },
        required: ["title", "instruction", "grid", "targetCount"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<StarHuntData[]>;
};

// --- Diğerleri (Stroop, Chaotic Number vb. mevcut yapı korunarak return) ---
export const generateStroopTestFromAI = async (options: any) => [] as any; // Assuming handled elsewhere or simple implementation
export const generateChaoticNumberSearchFromAI = async (options: any) => [] as any;
