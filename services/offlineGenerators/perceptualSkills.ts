import {
  FindTheDifferenceData,
  VisualOddOneOutData,
  VisualOddOneOutItem,
  GridDrawingData,
  SymmetryDrawingData,
  ShapeCountingData,
  DirectionalTrackingData,
  GeneratorOptions,
  SearchFieldItem,
  ShapeType,
} from '../../types';
import {
  getRandomInt,
  shuffle,
  getRandomItems,
  generateConnectedPath,
  SHAPE_TYPES,
  PREDEFINED_GRID_PATTERNS,
  generateSymmetricPattern,
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
const SHAPE_PATHS: Record<string, string> = {
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
  const { worksheetCount, difficulty, itemCount = 30 } = options;
  const results: ShapeCountingData[] = [];

  // Zorluk seviyesine göre hedef/çeldirici oranı
  const config = {
    Başlangıç: { targetRatio: 0.4, types: ['circle', 'square', 'triangle'] },
    Orta: { targetRatio: 0.3, types: ['circle', 'square', 'triangle', 'star', 'hexagon'] },
    Zor: { targetRatio: 0.2, types: SHAPE_TYPES },
    Uzman: { targetRatio: 0.15, types: SHAPE_TYPES },
  }[difficulty] || { targetRatio: 0.3, types: ['circle', 'square', 'triangle', 'star'] };

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
  const { worksheetCount, difficulty, gridSize = 8, concept = 'copy' } = options;
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
  const { worksheetCount, difficulty, gridSize = 8, concept = 'mirror_v' } = options;
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
  const { worksheetCount, difficulty, itemCount = 5, findDiffType = 'visual' } = options;
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
    if (findDiffType === 'char') {
      sourcePool = turkishAlphabet.split('');
    } else if (findDiffType === 'word') {
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
      },
      // GridA ve GridB'yi taşıyacak yapı
      gridA,
      gridB,
      diffCount: itemCount,
      // Legacy render desteği için rows (opsiyonel)
      rows: gridB.map((row, r) => ({
        items: row,
        correctIndex: -1,
        clinicalMeta: {
          errorType: 'Görsel Fark',
          isMirrorTask: false,
        },
      })),
    } as any);
  }
  return results;
};

export const generateOfflineDirectionalTracking = async (
  options: GeneratorOptions
): Promise<DirectionalTrackingData[]> => {
  const { worksheetCount, difficulty, codeLength = 5 } = options;
  const results: DirectionalTrackingData[] = [];

  for (let p = 0; p < worksheetCount; p++) {
    const size = 6;
    const grid: string[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => getRandomItems(turkishAlphabet.split(''), 1)[0])
    );

    const path: { r: number; c: number; char: string; direction: string }[] = [];
    let cr = getRandomInt(0, size - 3),
      cc = getRandomInt(0, size - 3);

    const directions = [
      { label: 'SAĞ', dr: 0, dc: 1, icon: 'fa-arrow-right' },
      { label: 'SOL', dr: 0, dc: -1, icon: 'fa-arrow-left' },
      { label: 'AŞAĞI', dr: 1, dc: 0, icon: 'fa-arrow-down' },
      { label: 'YUKARI', dr: -1, dc: 0, icon: 'fa-arrow-up' },
    ];

    for (let i = 0; i < codeLength; i++) {
      const move = directions[getRandomInt(0, 3)];
      const nr = Math.max(0, Math.min(size - 1, cr + move.dr));
      const nc = Math.max(0, Math.min(size - 1, cc + move.dc));
      path.push({ r: nr, c: nc, char: grid[nr][nc], direction: move.label });
      cr = nr;
      cc = nc;
    }

    results.push({
      title: 'Yönsel İz Sürme',
      instruction:
        'Okları ve yönergeleri takip ederek ızgara üzerindeki harfleri topla ve gizli şifreyi oluştur.',
      pedagogicalNote: 'Yönsel algı, takip ve mekansal kodlama becerilerini destekler.',
      puzzles: [
        {
          title: 'Rota 1',
          grid,
          path: path.map((p) => p.direction),
          startPos: { r: path[0].r, c: path[0].c },
          targetWord: path.map((pt) => pt.char).join(''),
        },
      ],
    });
  }
  return results;
};

export const generateOfflineVisualOddOneOut = async (
  options: GeneratorOptions
): Promise<VisualOddOneOutData[]> => {
  const { worksheetCount, difficulty } = options;
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
  ];

  for (let p = 0; p < worksheetCount; p++) {
    const rows: any[] = [];

    // Profesyonel bol içerik: Satır sayısı başlangıçta 8'den başlasın, uzman seviyesinde 15'e çıksın.
    const rowCount = difficulty === 'Başlangıç' ? 8 : difficulty === 'Orta' ? 12 : 15;
    // Sütun (öğe) sayısı zorluğa göre artabilir
    const itemCount = difficulty === 'Başlangıç' ? 5 : difficulty === 'Orta' ? 6 : 8;

    for (let r = 0; r < rowCount; r++) {
      // Karışık olarak harf veya emoji seti seç
      const useEmoji = Math.random() > 0.7;
      const set = getRandomItems(useEmoji ? emojiSets : letterSets, 1)[0];
      const isReversed = Math.random() > 0.5;
      const baseChar = isReversed ? set[1] : set[0];
      const oddChar = isReversed ? set[0] : set[1];

      const items: VisualOddOneOutItem[] = [];
      let correctIndex = getRandomInt(0, itemCount - 1);

      for (let i = 0; i < itemCount; i++) {
        items.push({
          label: i === correctIndex ? oddChar : baseChar,
          rotation: difficulty === 'Uzman' && !useEmoji ? getRandomInt(-15, 15) : 0,
          scale: 1,
          isMirrored: false,
        });
      }

      rows.push({
        items,
        correctIndex,
        reason: `'${baseChar}' arasına '${oddChar}' gizlenmiş.`,
        clinicalMeta: {
          discriminationFactor: 0.9,
          isMirrorTask: ['b', 'd', 'p', 'q', 'u', 'n', '3', 'E'].includes(baseChar),
          targetCognitiveSkill: 'Visual Discrimination',
        },
      });
    }

    results.push({
      title: 'GÖRSEL AYRIŞTIRMA VE KETLEME',
      instruction:
        'Her satırda diğerlerinden farklı (yönü, şekli veya türü değişik) olan öğeyi bularak işaretleyin.',
      pedagogicalNote:
        'Görsel ayırt etme, yön tayini (spatial orientation) ve ketleme (inhibition) becerilerini geliştiren klinik materyal.',
      settings: {
        difficulty: mapDifficulty(difficulty || 'Orta'),
        layout: itemCount >= 6 ? 'ultra_dense' : 'grid_compact',
        itemType: 'character',
        isProfessionalMode: true,
        showClinicalNotes: true,
        subType: 'character_discrimination',
      },
      rows,
    });
  }
  return results;
};
