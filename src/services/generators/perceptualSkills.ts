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
  } = options as Record<string, unknown>;

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
    - Öğrenci Profili: ${(studentContext as any)?.diagnosis?.join(', ') || 'Genel Gelişim'}.
    
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
  const customSettings = (options as any).findDifference || {};
  const { difficulty, _worksheetCount, studentContext } = options;
  const itemCount = customSettings.itemCount || options.itemCount || 5;
  const findDiffType = customSettings.findDiffType || options.findDiffType || 'visual';
  const gridSize = customSettings.gridSize || 5;

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
    - Izgara Boyutu: ${gridSize}x${gridSize}.
    - Veri Tipi: ${typeDesc}.
    - Zorluk: ${difficulty}.
    - Hedef Fark Sayısı: ${itemCount}.
    - Öğrenci Profili: ${(studentContext as any)?.diagnosis?.join(', ') || 'Genel Gelişim'}.
    
    STRATEJİ:
    1. İki adet grid oluştur (gridA ve gridB). Boyut mutlaka ${gridSize}x${gridSize} olmalı.
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
      title: { type: 'STRING', description: 'Etkinlik başlığı' },
      instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' },
      gridA: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } }, description: 'Referans tablo' },
      gridB: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } }, description: 'Farklı tablo' },
      diffCount: { type: 'INTEGER', description: 'Fark sayısı' },
      rows: {
        type: 'ARRAY', description: 'Fark satır verileri',
        items: {
          type: 'OBJECT',
          properties: {
            items: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Satır öğeleri' },
            clinicalMeta: { type: 'OBJECT', description: 'Klinik meta veri', properties: { errorType: { type: 'STRING', description: 'Hata türü' } } },
          },
        },
      },
    },
    required: ['title', 'instruction', 'gridA', 'gridB', 'diffCount'],
  };

  const schema = { type: 'ARRAY', items: singleSchema };
  return generateWithSchema(prompt, schema) as unknown as Promise<FindTheDifferenceData[]>;
};
