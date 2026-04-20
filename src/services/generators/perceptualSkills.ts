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
    gridSize,
    studentContext,
    layout,
    aestheticMode,
  } = options;

  const typeDesc =
    visualType === 'geometric'
      ? 'Karmaşık Geometrik Şekiller'
      : visualType === 'abstract'
        ? 'Soyut Desenler'
        : visualType === 'character'
          ? 'Ayna Harf ve Rakamlar (b/d, p/q, 6/9 vb.)'
          : 'Karmaşık poligonlar';

  // Sayfa doluluk oranını belirle
  const rowCount = layout === 'ultra_full' ? 16 : layout === 'ultra_dense' ? 12 : 8;

  const prompt = `
    ${PEDAGOGICAL_BASE}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    
    GÖREV: [ULTRA-PROFESYONEL TANISAL GÖRSEL AYRIŞTIRMA (ODD-ONE-OUT)]
    
    PARAMETRELER:
    - Mimari Tip: ${typeDesc}.
    - Zorluk: ${difficulty}.
    - Çeldirici Hassasiyeti: ${distractionLevel}.
    - Bilişsel Yük Endeksi: ${options.cognitiveLoad || 5} / 10.
    - Düzen: ${layout || 'Standart'}.
    - Estetik Stil: ${aestheticMode || 'standard'}.
    - Satır Başı Öğe Sayısı: ${gridSize || 4}.
    - Üretilecek Satır Sayısı: ${rowCount} (Dopdolu bir sayfa için KESİNLİKLE bu sayıda satır üret).
    - Öğrenci Profili: ${studentContext?.diagnosis?.join(', ') || 'Genel Gelişim'}.
    
    STRATEJİ:
    1. Bilişsel yük endeksine göre şekiller arası görsel benzerliği ayarla.
    2. SVG yolları üretirken (svgPaths) modern, estetik ve tanısal değeri yüksek paternler kullan (örn: ince dönüşler, eksik segmentler).
    3. [KRİTİK]: Sayfayı tamamen doldurmak için tam ${rowCount} adet satır (row) oluştur.
    4. Estetik stil "${aestheticMode}" ise, görsel karmaşıklığı ve zerafeti buna göre optimize et.
    
    ÇIKTI FORMATI:
    - rows: [{ items: [{ svgPaths: [...], label: string, rotation: number, isMirrored: boolean }], correctIndex: number, reason: string, clinicalMeta: { targetedError: string, cognitiveLoad: number } }]
    `;

  const singleSchema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      instruction: { type: 'STRING' },
      settings: {
        type: 'OBJECT',
        properties: {
          difficulty: { type: 'STRING' },
          layout: { type: 'STRING' },
          aestheticMode: { type: 'STRING' },
          cognitiveLoad: { type: 'NUMBER' },
          showClinicalNotes: { type: 'BOOLEAN' },
        },
      },
      rows: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            items: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  svgPaths: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        d: { type: 'STRING' },
                        fill: { type: 'STRING' },
                        stroke: { type: 'STRING' },
                      },
                    },
                  },
                  label: { type: 'STRING' },
                  rotation: { type: 'NUMBER' },
                  isMirrored: { type: 'BOOLEAN' },
                },
              },
            },
            correctIndex: { type: 'INTEGER' },
            reason: { type: 'STRING' },
            clinicalMeta: {
              type: 'OBJECT',
              properties: {
                targetedError: { type: 'STRING' },
                cognitiveLoad: { type: 'NUMBER' },
              },
            },
          },
        },
      },
    },
    required: ['title', 'instruction', 'rows'],
  };

  const schema = { type: 'ARRAY', items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<VisualOddOneOutData[]>;
};

export const generateFindTheDifferenceFromAI = async (
  options: GeneratorOptions
): Promise<FindTheDifferenceData[]> => {
  const { difficulty, _worksheetCount, findDiffType, itemCount = 5, studentContext } = options;

  const typeDesc =
    findDiffType === 'word' || findDiffType === 'semantic'
      ? 'Türkçe Kelimeler'
      : findDiffType === 'char' || findDiffType === 'linguistic'
        ? 'Karıştırılan Harfler'
        : findDiffType === 'number' || findDiffType === 'numeric'
          ? 'Benzer Rakamlar (6-9, 2-5 vb.)'
          : 'Görsel Emojiler';

  const prompt = `
    ${PEDAGOGICAL_BASE}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    
    GÖREV: [İKİ TABLO ARASINDAKİ FARKLARI BULMA]
    
    PARAMETRELER:
    - Veri Tipi: ${typeDesc}.
    - Zorluk: ${difficulty}.
    - Hedef Fark Sayısı: ${itemCount}.
    - Öğrenci Profili: ${studentContext?.diagnosis?.join(', ') || 'Genel Gelişim'}.
    
    STRATEJİ:
    1. İki adet grid oluştur (gridA ve gridB).
    2. gridA referans tablodur, gridB ise ${itemCount} adet fark barındırır.
    3. Farklar disleksi/dikkat profiline göre seçilmelidir (örn: b yerine d, m yerine n).
    4. [KRİTİK]: Tüm metinler, kelimeler ve içerikler %100 TÜRKÇE olmalıdır. İngilizce kelime KESİNLİKLE kullanma.
    
    ÇIKTI FORMATI:
    - gridA: [[string, ...], ...]
    - gridB: [[string, ...], ...]
    - diffCount: number
    - rows: [{ items: [...], clinicalMeta: { errorType: "..." } }] (gridB'nin satır yansıması)
    `;

  const singleSchema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      instruction: { type: 'STRING' },
      gridA: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } },
      gridB: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } },
      diffCount: { type: 'INTEGER' },
      rows: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            items: { type: 'ARRAY', items: { type: 'STRING' } },
            clinicalMeta: { type: 'OBJECT', properties: { errorType: { type: 'STRING' } } },
          },
        },
      },
    },
    required: ['title', 'instruction', 'gridA', 'gridB', 'diffCount'],
  };

  const schema = { type: 'ARRAY', items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<FindTheDifferenceData[]>;
};
