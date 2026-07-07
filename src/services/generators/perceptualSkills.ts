import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions } from '../../types.js';
import {
  FindTheDifferenceData,
  WordComparisonData,
  ShapeMatchingData,
  FindIdenticalWordData,
  GridDrawingData,
  SymbolCipherData,
  BlockPaintingData,
  VisualOddOneOutData,
  SymmetryDrawingData,
  FindDifferentStringData,
  DotPaintingData,
  AbcConnectData,
  CoordinateCipherData,
  WordConnectData,
  ProfessionConnectData,
  MatchstickSymmetryData,
  VisualOddOneOutThemedData,
  PunctuationColoringData,
  SynonymAntonymColoringData,
  StarHuntData,
  ShapeType,
  ShapeCountingData,
  MapInstructionData,
} from '../../types';
import { ocrService } from '../ocrService.js';
import { MAP_DETECTIVE_PROMPT, PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts.js';

export const generateVisualOddOneOutFromAI = async (
  options: GeneratorOptions
): Promise<VisualOddOneOutData[]> => {
  const {
    difficulty,
    visualType,
    distractionLevel,
    studentContext,
    aestheticMode,
  } = options as Record<string, unknown>;

  const rowCount = (options as any).rowCount || 14;
  const itemCount = options.itemCount || 6;
  const includeClinicalNotes = options.includeClinicalNotes !== false;

  const typeDesc =
    visualType === 'geometric'
      ? 'Karmaşık Geometrik Şekiller'
      : visualType === 'abstract'
        ? 'Soyut Desenler'
        : visualType === 'character'
          ? 'Ayna Harf ve Rakamlar (b/d, p/q, 6/9 vb.)'
          : 'Karmaşık poligonlar';

  const prompt = `
    ${PEDAGOGICAL_BASE}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    
    GÖREV: [ULTRA-PROFESYONEL TANISAL GÖRSEL AYRIŞTIRMA (ODD-ONE-OUT)]
    
    PARAMETRELER:
    - Mimari Tip: ${typeDesc}.
    - Zorluk: ${difficulty}.
    - Çeldirici Hassasiyeti: ${distractionLevel}.
    - Bilişsel Yük Endeksi: ${options.cognitiveLoad || 5} / 10.
    - Estetik Stil: ${aestheticMode || 'standard'}.
    - Satır Başı Öğe Sayısı: ${itemCount}.
    - Üretilecek Satır Sayısı: ${rowCount} (Dopdolu bir sayfa için KESİNLİKLE bu sayıda satır üret).
    - Öğrenci Profili: ${(studentContext as any)?.diagnosis?.join(', ') || 'Genel Gelişim'}.
    
    🎯 HÜCRE VE GRID KURALLARI:
    1. Üretilecek toplam satır sayısı KESİNLİKLE tam olarak ${rowCount} olmalıdır.
    2. Her bir satırdaki (row) öğe sayısı (items dizisinin uzunluğu) KESİNLİKLE tam olarak ${itemCount} olmalıdır.
    3. settings objesi içerisindeki "itemsPerRow" değeri tam olarak ${itemCount}, ve "rowCount" değeri ${rowCount} olmalıdır.
    4. settings objesi içerisindeki "showClinicalNotes" değeri ${includeClinicalNotes} olmalıdır.
    5. Bilişsel yük endeksine göre şekiller arası görsel benzerliği ayarla.
    6. SVG yolları üretirken (svgPaths) modern, estetik ve tanısal değeri yüksek paternler kullan (örn: ince dönüşler, eksik segmentler).
    7. Estetik stil "${aestheticMode}" ise, görsel karmaşıklığı ve zerafeti buna göre optimize et.
    
    ÇIKTI FORMATI:
    - rows: [{ items: [{ svgPaths: [...], label: string, rotation: number, isMirrored: boolean }], correctIndex: number, reason: string, clinicalMeta: { targetedError: string, cognitiveLoad: number } }]
    `;

  const singleSchema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING', description: 'Etkinlik başlığı' },
      instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' },
      settings: {
        type: 'OBJECT', description: 'Etkinlik ayarları',
        properties: {
          difficulty: { type: 'STRING', description: 'Zorluk seviyesi' },
          layout: { type: 'STRING', description: 'Sayfa düzeni' },
          aestheticMode: { type: 'STRING', description: 'Estetik stil' },
          cognitiveLoad: { type: 'NUMBER', description: 'Bilişsel yük endeksi (1-10)' },
          showClinicalNotes: { type: 'BOOLEAN', description: 'Klinik notları göster' },
          itemsPerRow: { type: 'INTEGER', description: 'Satır başı öğe sayısı' },
          rowCount: { type: 'INTEGER', description: 'Toplam satır sayısı' }
        },
      },
      rows: {
        type: 'ARRAY', description: 'Görsel satır dizisi',
        items: {
          type: 'OBJECT',
          properties: {
            items: {
              type: 'ARRAY', description: 'Satırdaki öğeler',
              items: {
                type: 'OBJECT',
                properties: {
                  svgPaths: {
                    type: 'ARRAY', description: 'SVG yol verileri',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        d: { type: 'STRING', description: 'SVG path d değeri' },
                        fill: { type: 'STRING', description: 'Dolgu rengi' },
                        stroke: { type: 'STRING', description: 'Çizgi rengi' },
                      },
                    },
                  },
                  label: { type: 'STRING', description: 'Öğe etiketi' },
                  rotation: { type: 'NUMBER', description: 'Dönüş açısı' },
                  isMirrored: { type: 'BOOLEAN', description: 'Ayna yansıması durumu' },
                },
              },
            },
            correctIndex: { type: 'INTEGER', description: 'Doğru cevap indeksi' },
            reason: { type: 'STRING', description: 'Farklı olma nedeni' },
            clinicalMeta: {
              type: 'OBJECT', description: 'Klinik meta veriler',
              properties: {
                targetedError: { type: 'STRING', description: 'Hedeflenen hata türü' },
                cognitiveLoad: { type: 'NUMBER', description: 'Bilişsel yük değeri' },
              },
            },
          },
        },
      },
    },
    required: ['title', 'instruction', 'rows'],
  };

  const schema = { type: 'ARRAY', items: singleSchema };
  return generateWithSchema(prompt, schema) as unknown as Promise<VisualOddOneOutData[]>;
};

export const generateFindTheDifferenceFromAI = async (
  options: GeneratorOptions
): Promise<FindTheDifferenceData[]> => {
  const { difficulty, studentContext } = options;
  const puzzleCount = options.puzzleCount || 1;
  const findDiffType = options.concept || 'visual';
  const gridSize = options.gridSize || (difficulty === 'Başlangıç' ? 4 : difficulty === 'Orta' ? 5 : 6);
  const diffCount = difficulty === 'Başlangıç' ? 3 : difficulty === 'Orta' ? 5 : 8;

  const typeDesc =
    findDiffType === 'word' || findDiffType === 'semantic'
      ? 'Türkçe Kelimeler'
      : findDiffType === 'mirror' || findDiffType === 'char'
        ? 'Ayna harf çiftleri (b/d, p/q, 6/9 vb.)'
        : findDiffType === 'number' || findDiffType === 'numeric'
          ? 'Benzer Rakamlar (6-9, 2-5 vb.)'
          : 'Görsel Emojiler';

  const prompt = `
    ${PEDAGOGICAL_BASE}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    
    GÖREV: [İKİ TABLO ARASINDAKİ FARKLARI BULMA - ULTRA PREMIUM SAAS]
    
    PARAMETRELER:
    - Izgara Boyutu: KESİNLİKLE her grid A ve B için ${gridSize}x${gridSize} olmalı.
    - Veri Tipi: ${typeDesc}.
    - Zorluk: ${difficulty}.
    - Görev Sayısı (puzzleCount): ${puzzleCount} (Tam olarak ${puzzleCount} adet bağımsız bulmaca üret).
    - Hedef Fark Sayısı (bulmaca başına): ${diffCount} fark.
    - Öğrenci Profili: ${(studentContext as any)?.diagnosis?.join(', ') || 'Genel Gelişim'}.
    
    STRATEJİLER VE KURALLAR:
    1. puzzles dizisinde tam olarak ${puzzleCount} adet bağımsız görev üret.
    2. Her bir görev için iki adet grid oluştur: gridA ve gridB. Her grid boyutu ${gridSize}x${gridSize} olmalı.
    3. gridA referans tablodur, gridB ise gridA'dan tam olarak ${diffCount} adet pozisyonda farklı öğe barındırır.
    4. Farklar disleksi/dikkat profiline göre seçilmelidir (örn: b yerine d, m yerine n, 6 yerine 9 gibi).
    5. settings objesindeki puzzleCount=${puzzleCount}, gridSize=${gridSize}, differenceCount=${diffCount}, differenceType="${findDiffType}" olmalıdır.
    6. [KRİTİK]: Tüm metinler, kelimeler ve içerikler %100 TÜRKÇE olmalıdır. İngilizce kelime KESİNLİKLE kullanma.
    `;

  const singleSchema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING', description: 'Etkinlik başlığı' },
      instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' },
      settings: {
        type: 'OBJECT',
        properties: {
          difficulty: { type: 'STRING' },
          layout: { type: 'STRING' },
          differenceType: { type: 'STRING' },
          showClinicalNotes: { type: 'BOOLEAN' },
          puzzleCount: { type: 'INTEGER' },
          gridSize: { type: 'INTEGER' },
          differenceCount: { type: 'INTEGER' },
          aestheticMode: { type: 'STRING' }
        }
      },
      puzzles: {
        type: 'ARRAY',
        description: 'Bulmaca dizisi',
        items: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Bulmaca başlığı' },
            gridA: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } }, description: 'Referans tablo' },
            gridB: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } }, description: 'Farklı tablo' },
            diffCount: { type: 'INTEGER', description: 'Fark sayısı' },
            clinicalMeta: {
              type: 'OBJECT',
              properties: {
                discriminationFactor: { type: 'NUMBER' },
                targetCognitiveSkill: { type: 'STRING' },
                perceptualLoad: { type: 'NUMBER' },
                errorType: { type: 'STRING' }
              }
            }
          },
          required: ['gridA', 'gridB', 'diffCount', 'title']
        }
      }
    },
    required: ['title', 'instruction', 'puzzles']
  };

  const schema = { type: 'ARRAY', items: singleSchema };
  return generateWithSchema(prompt, schema) as unknown as Promise<FindTheDifferenceData[]>;
};
