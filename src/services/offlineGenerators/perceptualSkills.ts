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
  const itemCount = options.itemCount || 30;
  const results: ShapeCountingData[] = [];

  // Zorluk seviyesine göre hedef/çeldirici oranı
  const difficultyConfigs: Record<string, { targetRatio: number; types: string[] }> = {
    Başlangıç: { targetRatio: 0.4, types: ['circle', 'square', 'triangle'] },
    Orta: { targetRatio: 0.3, types: ['circle', 'square', 'triangle', 'star', 'hexagon'] },
    Zor: { targetRatio: 0.2, types: SHAPE_TYPES },
    Uzman: { targetRatio: 0.15, types: SHAPE_TYPES },
  };
  const config = difficultyConfigs[difficulty] || difficultyConfigs['Orta'];

  for (let p = 0; p < worksheetCount; p++) {
    // A4 sayfasında tek bir ana bölge oluştur (Geniş Bakış Açısı için)
    const puzzles: any[] = [];

    for (let section = 0; section < 1; section++) {
      const searchField: any[] = [];
      let targetCount = 0;
      const currentItemCount = itemCount + 20; // Tek sayfa olduğu için yoğunluğu artırıyoruz

      for (let i = 0; i < currentItemCount; i++) {
        const isTarget = Math.random() < config.targetRatio;
        const type = isTarget
          ? 'triangle'
          : getRandomItems(
              config.types.filter((t) => t !== 'triangle'),
              1
            )[0];

        if (type === 'triangle') targetCount++;

        searchField.push({
          id: `s-${section}-${i}`,
          type: type as any,
          x: getRandomInt(2, 98),
          y: getRandomInt(2, 98),
          rotation: getRandomInt(0, 359),
          size: getRandomInt(20, 45) / 10, // 2.0 - 4.5 scale (daha büyük ve net)
          color: 'black',
        });
      }

      puzzles.push({
        id: `section-${section}`,
        searchField: shuffle(searchField),
        correctCount: targetCount,
        difficultyScore: 5,
      });
    }

    results.push({
      title: 'Görsel Tarama: Üçgen Avı (Geniş Saha)',
      instruction:
        'Aşağıdaki geniş alanda bulunan TÜM ÜÇGENLERİ bul ve sayısını kutucuğa yaz. Şekiller farklı boyut ve açılarda olabilir, dikkatli incele!',
      pedagogicalNote:
        'Geniş saha taraması, seçici dikkat ve şekil-zemin ayrıştırma becerilerini en üst düzeyde zorlayan profesyonel bir çalışmadır.',
      settings: {
        difficulty: mapDifficulty(difficulty || 'Orta'),
        targetShape: 'triangle',
        layout: 'single',
        overlapping: true,
        isProfessionalMode: true,
        showClinicalNotes: false,
      },
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
  const gridSize = options.gridSize || 8;
  const concept = options.concept || 'copy';
  const results: GridDrawingData[] = [];

  for (let p = 0; p < worksheetCount; p++) {
    // Seçilen zorluğa/konsepte göre bir desen seç veya üret
    const patternName = getRandomItems(Object.keys(PREDEFINED_GRID_PATTERNS), 1)[0];
    const sourcePattern = PREDEFINED_GRID_PATTERNS[patternName];

    results.push({
      title: 'Kare Kopyalama',
      instruction:
        'Sol taraftaki deseni sağdaki boş ızgaraya noktaları ve çizgileri takip ederek kopyalayın.',
      pedagogicalNote:
        'Görsel-motor koordinasyon, planlama ve mekansal ilişkilendirme becerilerini geliştirir.',
      gridDim: gridSize,
      settings: {
        difficulty: mapDifficulty(difficulty || 'Orta'),
        layout: 'side_by_side',
        gridType: 'dots',
        transformMode: concept as any,
        showCoordinates: (options as any).showCoordinates !== false,
        isProfessionalMode: true,
      },
      drawings: [
        {
          lines: sourcePattern,
          title: patternName,
          complexityLevel: 'medium',
        },
      ],
    });
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
      pedagogicalNote: 'Bilateral koordinasyon, görsel algı ve simetri kavramını güçlendirir.',
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
      pedagogicalNote:
        'Karşılaştırmalı görsel tarama, seçici dikkat ve çalışma belleğini güçlendiren profesyonel dikkat egzersizi.',
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

export const generateOfflineDirectionalTracking = async (
  options: GeneratorOptions
): Promise<DirectionalCodeReadingData[]> => {
  const { worksheetCount = 1, difficulty = 'Orta', itemCount = 2, concept = 'letters' } = options;
  const aestheticMode = (options as any).aestheticMode || 'standard';
  const results: DirectionalCodeReadingData[] = [];

  const rows = options.gridRows || options.gridSize || 6;
  const cols = options.gridCols || options.gridSize || 6;

  for (let p = 0; p < worksheetCount; p++) {
    const puzzles: any[] = [];

    // 2. Determine Difficulty Parameters
    const configMap: Record<string, { pathLength: number; obstacles: number }> = {
      Başlangıç: { pathLength: 4, obstacles: 0.1 },
      Orta: { pathLength: 6, obstacles: 0.2 },
      Zor: { pathLength: 9, obstacles: 0.25 },
      Uzman: { pathLength: 12, obstacles: 0.3 },
    };
    const difficultyKey = difficulty as string;
    const config = configMap[difficultyKey] || configMap['Orta'];

    for (let q = 0; q < itemCount; q++) {
      // İçerik havuzu belirleme (Harfler vs Sayılar)
      let pool = turkishAlphabet.split('');
      if (concept === 'numbers') {
        pool = Array.from({ length: 10 }, (_, i) => String(i));
      }

      const grid: string[][] = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => getRandomItems(pool, 1)[0])
      );

      const path: { r: number; c: number; char: string; direction: string }[] = [];

      // Başlangıç noktasını grid'in biraz daha iç kısımlarından seçerek çok fazla kenara çarpmayı engelle
      let cr = getRandomInt(0, rows - 1);
      let cc = getRandomInt(0, cols - 1);

      const directions = [
        { label: 'right', dr: 0, dc: 1, icon: 'fa-arrow-right' },
        { label: 'left', dr: 0, dc: -1, icon: 'fa-arrow-left' },
        { label: 'down', dr: 1, dc: 0, icon: 'fa-arrow-down' },
        { label: 'up', dr: -1, dc: 0, icon: 'fa-arrow-up' },
      ];

      // Başlangıç noktasını da path'e (0. adım olarak) ekleyelim, sadece yönü "start" olsun
      path.push({ r: cr, c: cc, char: grid[cr][cc], direction: 'start' });

      for (let i = 0; i < config.pathLength; i++) {
        // Geçerli bir yön bulana kadar dene (grid sınırları dışına çıkmamak için)
        const validMoves = directions.filter((d) => {
          const nr = cr + d.dr;
          const nc = cc + d.dc;
          return nr >= 0 && nr < rows && nc >= 0 && nc < cols;
        });

        if (validMoves.length === 0) break; // Sıkışırsa dur (normalde olmaz ama tedbir)

        const move = getRandomItems(validMoves, 1)[0];
        cr += move.dr;
        cc += move.dc;

        path.push({ r: cr, c: cc, char: grid[cr][cc], direction: move.label });
      }

      puzzles.push({
        id: `puzzle-${q}`,
        title: `ŞİFRE BLOĞU 0${q + 1}`,
        grid,
        // İlk eleman (start) yön içermediği için yörünge adımlarından (1. elemandan itibaren) yönleri alıyoruz
        path: path.slice(1).map((p) => p.direction),
        steps: path.slice(1).map((p, i) => ({
          step: i + 1,
          count: 1,
          dir: p.direction,
          direction: p.direction,
        })),
        startPos: { r: path[0].r, c: path[0].c },
        // Başlangıç harfi + takip eden harfler hedef şifreyi oluşturur
        targetWord: path.map((pt) => pt.char).join(''),
        clinicalMeta: {
          perceptualLoad: 0.6 + (rows * cols) / 200,
          attentionShiftCount: config.pathLength,
        },
      });
    }

    // Grid boyutuna ve soru sayısına göre layout belirleme
    let layout = 'grid_2x1';
    if (itemCount === 1) layout = 'single';
    else if (itemCount > 2) layout = 'grid_compact';

    results.push({
      title: 'YÖNSEL İZ SÜRME & ŞİFRE ÇÖZÜCÜ',
      instruction:
        'İşaretli başlangıç vektöründen okların yönünü adım adım takip edin ve bulduğunuz karakterleri sırasıyla şifre alanına yazın.',
      pedagogicalNote:
        'Görsel-mekansal algı, ardışık işlemleme (sequential processing) ve çalışma belleğini zorlayan profesyonel nöro-bilişsel egzersiz.',
      settings: {
        difficulty: mapDifficulty(difficulty || 'Orta'),
        layout: layout as any,
        aestheticMode: aestheticMode,
        rotationEnabled: false,
        pathComplexity: config.pathLength,
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

    results.push({
      activityType: 'VISUAL_ODD_ONE_OUT' as any,
      title: 'GÖRSEL AYRIŞTIRMA VE KETLEME (Premium)',
      instruction:
        'Her satırda diğerlerinden farklı (yönü, şekli veya türü değişik) olan öğeyi bularak işaretleyin.',
      pedagogicalNote:
        'Görsel ayırt etme, yön tayini (spatial orientation) ve ketleme (inhibition) becerilerini geliştiren klinik materyal.',
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
