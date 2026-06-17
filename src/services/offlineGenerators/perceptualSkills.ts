import {
  FindTheDifferenceData,
  VisualOddOneOutData,
  VisualOddOneOutItem,
  GridDrawingData,
  SymmetryDrawingData,
  ShapeCountingData,
} from '../../types';
import { DirectionalCodeReadingData } from '../../types/visual';
import { GeneratorOptions } from '../../types/core';
import {
  getRandomInt,
  shuffle,
  getRandomItems,
  generateConnectedPath,
  SHAPE_TYPES,
  PREDEFINED_GRID_PATTERNS,
  turkishAlphabet,
} from './helpers';
import { getOfflineMetadata } from './metadataHelper';
import { ActivityType } from '../../types';

const mapDifficulty = (diff: string): 'beginner' | 'intermediate' | 'expert' | 'clinical' => {
  switch (diff) {
    case 'Başlangıç':
      return 'beginner';
    case 'Zor':
      return 'expert';
    case 'Uzman':
      return 'clinical';
    default:
      return 'intermediate';
  }
};

// --- GEOMETRIC PATH CONSTANTS ---
const _SHAPE_PATHS: Record<string, string> = {
  triangle: 'M 50 15 L 85 85 L 15 85 Z',
  circle: 'M 50 50 m -35 0 a 35 35 0 1 0 70 0 a 35 35 0 1 0 -70 0',
  square: 'M 20 20 L 80 20 L 80 80 L 20 80 Z',
  star: 'M 50 10 L 61 35 L 88 35 L 66 52 L 75 78 L 50 62 L 25 78 L 34 52 L 12 35 L 39 35 Z',
  hexagon: 'M 50 10 L 85 30 L 85 70 L 50 90 L 15 70 L 15 30 Z',
  pentagon: 'M 50 10 L 90 40 L 75 85 L 25 85 L 10 40 Z',
  diamond: 'M 50 10 L 85 50 L 50 90 L 15 50 Z',
};

const TURKISH_WORDS_EASY = [
  'kedi',
  'masa',
  'elma',
  'kitap',
  'kalem',
  'defter',
  'silgi',
  'okul',
  'top',
  'gül',
];
const TURKISH_WORDS_MEDIUM = [
  'pencere',
  'bilgisayar',
  'öğretmen',
  'öğrenci',
  'kütüphane',
  'merdiven',
  'gökyüzü',
  'arkadaş',
];
const TURKISH_WORDS_HARD = [
  'karakteristik',
  'elektrikli',
  'mükemmeliyet',
  'disiplinli',
  'araştırmacı',
  'profesyonel',
];

export const generateOfflineShapeCounting = async (
  options: GeneratorOptions
): Promise<ShapeCountingData[]> => {
  const worksheetCount = options.worksheetCount || 1;
  const difficulty = options.difficulty || 'Orta';
  // Nesne yoğunluğu: 5-50 arası tam duyarlı kullanım
  const itemCount = options.itemCount || 30;
  const results: ShapeCountingData[] = [];

  // Zorluk seviyesine göre hedef/çeldirici oranı ve şekil kütüphanesi
  const difficultyConfigs: Record<string, { targetRatio: number; types: string[] }> = {
    Başlangıç: { targetRatio: 0.4, types: ['circle', 'square', 'triangle'] },
    Orta: { targetRatio: 0.35, types: ['circle', 'square', 'triangle', 'star', 'hexagon'] },
    Zor: { targetRatio: 0.25, types: SHAPE_TYPES },
    Uzman: { targetRatio: 0.2, types: SHAPE_TYPES },
  };
  const config = difficultyConfigs[difficulty] || difficultyConfigs['Orta'];

  const targetShape = (options as any).targetShape || 'triangle';

  for (let p = 0; p < worksheetCount; p++) {
    const puzzles: any[] = [];

    // Tek bir ana geniş saha (Görsel Tarama için)
    for (let section = 0; section < 1; section++) {
      const searchField: any[] = [];
      let targetCount = 0;
      
      // Örtüşme (overlapping) kontrolü - her durumda aktif ama yoğunluk arttıkça görsel yük artmalı
      const isOverlapping = (options as any).overlapping !== false;

      for (let i = 0; i < itemCount; i++) {
        const isTarget = Math.random() < config.targetRatio;
        const type = isTarget
          ? targetShape
          : getRandomItems(
              config.types.filter((t) => t !== targetShape),
              1
            )[0];

        if (type === targetShape) targetCount++;

        // Koordinatları yoğunluk arttıkça merkeze veya dağınık yay ( item sayısına göre dengele )
        searchField.push({
          id: `shape-${p}-${section}-${i}`,
          type: type as any,
          x: getRandomInt(5, 95),
          y: getRandomInt(5, 95),
          rotation: getRandomInt(0, 360),
          // Yoğunluk 40+ ise şekilleri biraz küçült ki her şey görülebilsin
          size: (itemCount > 40 ? getRandomInt(12, 28) : getRandomInt(15, 35)) / 10,
          color: 'black',
        });
      }

      // Güvenlik: Eğer hiç hedef üretilmemişse (itemCount çok düşükken olabilir), zorla ekle
      if (targetCount === 0 && itemCount > 0) {
        const idx = getRandomInt(0, searchField.length - 1);
        searchField[idx].type = targetShape as any;
        targetCount = 1;
      }

      puzzles.push({
        id: `section-${p}-${section}`,
        searchField: shuffle(searchField),
        correctCount: targetCount,
        // Klinik zorluk skoru (yoğunluk ve şekil benzerliğine göre)
        clinicalMeta: {
          figureGroundComplexity: Math.min(10, Math.ceil(itemCount / 5)),
          overlappingRatio: isOverlapping ? 0.6 : 0.1,
        },
      });
    }

    const meta = getOfflineMetadata(ActivityType.VISUAL_PERCEPTION);

    results.push({
      title: `Görsel Tarama: ${targetShape === 'triangle' ? 'Üçgen' : targetShape === 'circle' ? 'Daire' : targetShape} Avı`,
      instruction:
        `Aşağıdaki alandaki TÜM ${targetShape.toUpperCase()}LARI bul ve sayısını kutucuğa yaz. Şekiller iç içe geçmiş veya ters dönmüş olabilir!`,
      targetSkills: meta.targetSkills,
      settings: {
        difficulty: mapDifficulty(difficulty || 'Orta'),
        targetShape: targetShape,
        layout: 'single',
        overlapping: (options as any).overlapping !== false,
        isProfessionalMode: true,
        showClinicalNotes: true,
        itemCount: itemCount
      } as any,
      sections: puzzles as any,
    });
  }
  return results;
};


export const generateOfflineGridDrawing = async (
  options: GeneratorOptions
): Promise<GridDrawingData[]> => {
  const worksheetCount = options.worksheetCount || 1;
  const difficulty = options.difficulty || 'Orta';
  const results: GridDrawingData[] = [];

  for (let p = 0; p < worksheetCount; p++) {
    // Ultra Pro Premium: Tek sayfada 4 farklı ızgara görevi (Dolu Dolu)
    const patterns = getRandomItems(Object.keys(PREDEFINED_GRID_PATTERNS), 4);
    const drawings = patterns.map((pName, idx) => ({
      lines: PREDEFINED_GRID_PATTERNS[pName],
      title: `Görev ${idx + 1}: ${pName}`,
      complexityLevel: idx === 0 ? 'easy' : idx < 3 ? 'medium' : 'hard',
    }));

    results.push({
      title: 'Kare Kopyalama (Ultra Pro Matris)',
      instruction:
        'Sol taraftaki desenleri sağdaki boş ızgaralara noktaları ve çizgileri takip ederek kopyalayın. Görsel hafızanı ve el becerini kullan!',
      gridDim: (options.gridSize || 8),
      settings: {
        difficulty: mapDifficulty(difficulty || 'Orta'),
        layout: 'grid_2x2' as any, // 4 puzzle için 2x2 yerleşim
        gridType: 'dots',
        transformMode: 'copy',
        showCoordinates: false,
        isProfessionalMode: true,
        showClinicalNotes: true,
      } as any,
      drawings: drawings as any,
    } as any);
  }
  return results;
};


export const generateOfflineSymmetryDrawing = async (
  options: GeneratorOptions
): Promise<SymmetryDrawingData[]> => {
  const worksheetCount = options.worksheetCount || 1;
  const difficulty = options.difficulty || 'Orta';
  const gridSize = options.gridSize || 8;
  const concept = options.concept || 'mirror_v';
  const results: SymmetryDrawingData[] = [];

  for (let p = 0; p < worksheetCount; p++) {
    // Simetrik çizgiler üret
    const lines = generateConnectedPath(gridSize / 2, 3).map((line) => ({
      x1: line[0][0],
      y1: line[0][1],
      x2: line[1][0],
      y2: line[1][1],
      color: 'black',
    }));

    results.push({
      title: 'Simetri Tamamlama',
      instruction: 'Desenleri simetri eksenine göre aynadaki yansıması olacak şekilde tamamlayın.',
      gridDim: gridSize,
      settings: {
        difficulty: mapDifficulty(difficulty || 'Orta'),
        axis: concept === 'mirror_h' ? 'horizontal' : 'vertical',
        gridType: 'dots',
        layout: 'single',
        showGhostPoints: false,
        showCoordinates: (options as any).showCoordinates !== false,
        isProfessionalMode: true,
      },
      drawings: [
        {
          lines,
          dots: [],
          title: 'Simetri',
        },
      ],
    });
  }
  return results;
};

export const generateOfflineFindTheDifference = async (
  options: GeneratorOptions
): Promise<FindTheDifferenceData[]> => {
  const worksheetCount = options.worksheetCount || 1;
  const difficulty = options.difficulty || 'Orta';
  const itemCount = options.itemCount || 5;
  const findDiffType = options.findDiffType || 'visual';
  const results: FindTheDifferenceData[] = [];

  const EMOJIS = [
    '🍎',
    '🚗',
    '🏠',
    '⭐',
    '🎈',
    '📚',
    '⚽',
    '☀️',
    '🌙',
    '🌲',
    '🌺',
    '🎁',
    '🐱',
    '🐶',
    '🦁',
    '🐢',
    '🦋',
    '🐝',
  ];

  for (let p = 0; p < worksheetCount; p++) {
    const size = difficulty === 'Başlangıç' ? 4 : difficulty === 'Orta' ? 5 : 6;

    // Veri havuzu seçimi
    let sourcePool = EMOJIS;
    if (findDiffType === 'char' || findDiffType === 'linguistic') {
      sourcePool = turkishAlphabet.split('');
    } else if (findDiffType === 'number' || findDiffType === 'numeric') {
      sourcePool = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    } else if (findDiffType === 'word' || findDiffType === 'semantic') {
      sourcePool =
        difficulty === 'Başlangıç'
          ? TURKISH_WORDS_EASY
          : difficulty === 'Orta'
            ? TURKISH_WORDS_MEDIUM
            : TURKISH_WORDS_HARD;
    }

    // İki farklı grid oluştur
    const gridA: string[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => getRandomItems(sourcePool, 1)[0])
    );

    const gridB = gridA.map((row) => [...row]);
    const diffPositions: { r: number; c: number }[] = [];

    // Farkları yerleştir
    while (diffPositions.length < itemCount) {
      const r = getRandomInt(0, size - 1);
      const c = getRandomInt(0, size - 1);
      if (!diffPositions.some((pos) => pos.r === r && pos.c === c)) {
        let newVal = getRandomItems(sourcePool, 1)[0];
        while (newVal === gridA[r][c]) newVal = getRandomItems(sourcePool, 1)[0];
        gridB[r][c] = newVal;
        diffPositions.push({ r, c });
      }
    }

    results.push({
      title: 'DİKKAT VE AYRIŞTIRMA: İKİ TABLO ARASINDAKİ FARKLAR',
      instruction: `Soldaki tablo ile sağdaki tablo arasındaki ${itemCount} farkı bulup sağdakinde işaretleyin.`,
      settings: {
        difficulty: mapDifficulty(difficulty || 'Orta'),
        layout: 'side_by_side',
        itemType: findDiffType as any,
        isProfessionalMode: true,
        showClinicalNotes: true,
        differenceType: findDiffType as any,
      },
      gridA,
      gridB,
      diffCount: itemCount,
      rows: gridB.map((row) => ({
        items: row,
        correctIndex: -1,
        visualDistractionLevel: 'medium',
        clinicalMeta: {
          errorType: 'Görsel Fark',
          isMirrored: false,
        },
      })),
    });
  }
  return results;
};

const TURKISH_WORDS: Record<string, string[]> = {
  'Başlangıç': ['AL', 'EL', 'AT', 'ET', 'OK', 'OL', 'ON', 'AN', 'EN', 'KA', 'KE', 'LA'],
  'Orta': ['KEDİ', 'ELMA', 'OKUL', 'ARKA', 'YOL', 'SU', 'KALP', 'MASA', 'SEL', 'KOLİ', 'KALE', 'ALİ', 'CAN', 'CANO', 'KUM', 'KAM'],
  'Zor': ['KİTAP', 'ARMUT', 'KAPLAN', 'PARK', 'ÜZÜM', 'AĞAÇ', 'DENİZ', 'KARIN', 'ÇANTA', 'YILDIZ', 'BALIK'],
  'Uzman': ['OKYANUS', 'TİYATRO', 'GÖZLÜK', 'KALEMLİK', 'ÇİKOLATA', 'ZAMBAK', 'İSTASYON', 'BİSİKLET'],
};

const DIRS = [
  { label: 'right', dr: 0, dc: 1 },
  { label: 'down', dr: 1, dc: 0 },
  { label: 'left', dr: 0, dc: -1 },
  { label: 'up', dr: -1, dc: 0 },
];

const getValidDirections = (r: number, c: number, rows: number, cols: number, used: Set<string>) =>
  DIRS.filter((d) => {
    const nr = r + d.dr;
    const nc = c + d.dc;
    return nr >= 0 && nr < rows && nc >= 0 && nc < cols && !used.has(`${nr},${nc}`);
  });

export const generateOfflineDirectionalTracking = async (
  options: GeneratorOptions
): Promise<DirectionalCodeReadingData[]> => {
  const { worksheetCount = 1, difficulty = 'Orta', itemCount = 3, concept = 'letters' } = options;
  const aestheticMode = (options as any).aestheticMode || 'standard';
  const results: DirectionalCodeReadingData[] = [];

  const rows = options.gridRows || options.gridSize || 8;
  const cols = options.gridCols || options.gridSize || 8;
  const pool = concept === 'numbers'
    ? Array.from({ length: 10 }, (_, i) => String(i))
    : turkishAlphabet.split('');
  const wordList = TURKISH_WORDS[difficulty] || TURKISH_WORDS['Orta'];

  for (let p = 0; p < worksheetCount; p++) {
    const puzzles: any[] = [];
    const usedWords = new Set<string>();

    for (let q = 0; q < itemCount; q++) {
      // Pick an unused word
      const available = wordList.filter((w) => !usedWords.has(w));
      const targetWord = available.length > 0
        ? available[getRandomInt(0, available.length - 1)]
        : wordList[getRandomInt(0, wordList.length - 1)];
      usedWords.add(targetWord);

      // Initialize empty grid
      const grid: string[][] = Array.from({ length: rows }, () => Array(rows).fill(''));
      const used = new Set<string>();

      // Pick a start position in the interior (not too close to edges)
      const margin = 2;
      const maxR = rows - margin;
      const maxC = cols - margin;
      let cr = getRandomInt(margin, Math.max(margin, maxR - 1));
      let cc = getRandomInt(margin, Math.max(margin, maxC - 1));

      const path: { r: number; c: number; char: string; direction: string }[] = [];

      // Place first letter
      const firstChar = concept === 'numbers' ? targetWord : targetWord[0];
      grid[cr][cc] = firstChar;
      used.add(`${cr},${cc}`);
      path.push({ r: cr, c: cc, char: firstChar, direction: 'start' });

      // Build path for remaining letters
      const letters = concept === 'numbers'
        ? targetWord.split('')
        : targetWord.substring(1).split('');

      for (const letter of letters) {
        const validDirs = getValidDirections(cr, cc, rows, cols, used);
        if (validDirs.length === 0) break;

        const move = validDirs[getRandomInt(0, validDirs.length - 1)];
        cr += move.dr;
        cc += move.dc;
        grid[cr][cc] = letter;
        used.add(`${cr},${cc}`);
        path.push({ r: cr, c: cc, char: letter, direction: move.label });
      }

      // Fill empty cells with random chars
      const fillPool = concept === 'numbers' ? pool : pool.filter((ch) => ch !== firstChar);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (!grid[r][c]) {
            grid[r][c] = fillPool[getRandomInt(0, fillPool.length - 1)];
          }
        }
      }

      const cipherAnswer = path.map((pt) => pt.char).join('');

      puzzles.push({
        id: `puzzle-${q}-${targetWord}`,
        title: `ŞİFRE ${q + 1}`,
        grid,
        path: path.slice(1).map((pt) => pt.direction),
        steps: path.slice(1).map((pt, i) => ({
          step: i + 1,
          count: 1,
          dir: pt.direction,
          direction: pt.direction,
        })),
        startPos: { r: path[0].r, c: path[0].c },
        targetWord: cipherAnswer,
        cipherAnswer,
        answerLength: cipherAnswer.length,
        clinicalMeta: {
          perceptualLoad: 0.6 + (rows * cols) / 200,
          attentionShiftCount: path.length - 1,
        },
      });
    }

    const layout = itemCount === 1 ? 'single' : itemCount > 2 ? 'grid_compact' : 'grid_2x1';

    results.push({
      title: 'YÖNSEL İZ SÜRME & ŞİFRE ÇÖZÜCÜ',
      instruction: 'Başlangıç noktasından okları takip ederek harfleri topla. Topladığın harfler bir kelime oluşturuyor!',
      settings: {
        difficulty: mapDifficulty(difficulty || 'Orta'),
        layout: layout as any,
        aestheticMode,
        rotationEnabled: false,
        pathComplexity: puzzles[0]?.steps?.length || 5,
        isProfessionalMode: true,
        showClinicalNotes: true,
        gridSize: rows,
        contentType: concept as any,
      } as any,
      puzzles,
    } as any);
  }
  return results;
};

export const generateOfflineVisualOddOneOut = async (
  options: GeneratorOptions
): Promise<VisualOddOneOutData[]> => {
  const worksheetCount = options.worksheetCount || 1;
  const difficulty = options.difficulty || 'Orta';
  const visualType = options.visualType || 'mixed';
  const results: VisualOddOneOutData[] = [];

  // Görsel benzerlik ve yön karışıklığı yaratan setler (Özellikle disleksi için)
  const letterSets = [
    ['b', 'd'],
    ['p', 'q'],
    ['m', 'n'],
    ['s', 'ş'],
    ['c', 'ç'],
    ['O', 'Q'],
    ['E', 'F'],
    ['6', '9'],
    ['3', 'E'],
    ['5', 'S'],
    ['u', 'n'],
    ['f', 't'],
    ['v', 'y'],
    ['a', 'e'],
    ['g', 'ğ'],
    ['ı', 'i'],
    ['o', 'ö'],
    ['u', 'ü'],
  ];

  const emojiSets = [
    ['🙂', '🙃'],
    ['🚗', '🚙'],
    ['🍎', '🍅'],
    ['☀️', '🏵️'],
    ['🌲', '🌳'],
    ['🐶', '🐻'],
    ['⚽', '🏀'],
    ['🎈', '🪀'],
    ['🏠', '🏡'],
    ['🚲', '🛵'],
    ['🐱', '🐯'],
    ['🐟', '🐬'],
    ['🚀', '🛸'],
    ['🌜', '🌛'],
    ['🌻', '🌷'],
  ];

  for (let p = 0; p < worksheetCount; p++) {
    const rows: any[] = [];

    // Profesyonel bol içerik: A4'ü dolduracak şekilde optimize edildi
    const rowCount = difficulty === 'Başlangıç' ? 10 : difficulty === 'Orta' ? 14 : 18;
    const itemCount =
      options.itemCount || (difficulty === 'Başlangıç' ? 5 : difficulty === 'Orta' ? 6 : 8);

    for (let r = 0; r < rowCount; r++) {
      const isCharType = visualType === 'character';
      const isVisualType =
        visualType === 'geometric' || visualType === 'abstract' || visualType === 'complex';

      const useEmoji = isVisualType ? true : isCharType ? false : Math.random() > 0.6;
      const set = getRandomItems(useEmoji ? emojiSets : letterSets, 1)[0];
      const isReversed = Math.random() > 0.5;
      const baseChar = isReversed ? set[1] : set[0];
      const oddChar = isReversed ? set[0] : set[1];

      const items: VisualOddOneOutItem[] = [];
      const correctIndex = getRandomInt(0, itemCount - 1);

      for (let i = 0; i < itemCount; i++) {
        items.push({
          label: i === correctIndex ? oddChar : baseChar,
          rotation:
            (difficulty === 'Zor' || difficulty === 'Uzman') && !useEmoji
              ? getRandomInt(-10, 10)
              : 0,
          scale: 1,
          isMirrored: false,
        });
      }

      rows.push({
        items,
        correctIndex,
        reason: `'${baseChar}' arasına '${oddChar}' gizlenmiş.`,
        clinicalMeta: {
          discriminationFactor: 0.85,
          isMirrorTask: ['b', 'd', 'p', 'q', 'u', 'n', '3', 'E', '6', '9'].includes(baseChar),
          targetCognitiveSkill: 'Visual Discrimination',
          errorType: 'Görsel Farklılık',
        },
      });
    }

    const meta = getOfflineMetadata(ActivityType.VISUAL_ODD_ONE_OUT);

    results.push({
      activityType: 'VISUAL_ODD_ONE_OUT' as any,
      title: 'GÖRSEL AYRIŞTIRMA VE KETLEME (Premium)',
      instruction:
        'Her satırda diğerlerinden farklı (yönü, şekli veya türü değişik) olan öğeyi bularak işaretleyin.',
      targetSkills: meta.targetSkills,
      settings: {
        difficulty: mapDifficulty(difficulty || 'Orta'),
        layout: itemCount >= 7 ? 'ultra_dense' : 'grid_compact',
        itemType: 'character',
        isProfessionalMode: true,
        showClinicalNotes: true,
        subType: 'character_discrimination',
      },
      rows,
    } as any);
  }
  return results;
};
