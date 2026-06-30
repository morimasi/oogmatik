import {
  FindTheDifferenceData,
  VisualOddOneOutData,
  VisualOddOneOutItem,
  GridDrawingData,
  SymmetryDrawingData,
  ShapeCountingData,
  DirectionalTrackingData,
  DirectionalCodeReadingData,
} from '../../types';
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
          x: getRandomInt(15, 85),
          y: getRandomInt(15, 85),
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

export const generateOfflineVisualOddOneOut = async (
  options: GeneratorOptions
): Promise<VisualOddOneOutData[]> => {
  const worksheetCount = options.worksheetCount || 1;
  const difficulty = options.difficulty || 'Orta';
  const puzzleCount = options.puzzleCount || 1; // Yeni: Kaç farklı bulmaca seti olacağı
  const rowCount = (options as any).rowCount || (difficulty === 'Zor' ? 12 : 8);
  const itemsPerRow = options.itemCount || 6;
  const visualType = options.visualType || 'character';
  const cognitiveLoad = (options as any).cognitiveLoad || 5;

  const results: VisualOddOneOutData[] = [];

  const EMOJI_POOL = ['🍎', '🚗', '🏠', '⭐', '🎈', '📚', '⚽', '☀️', '🌙', '🌲', '🌺', '🎁', '🐱', '🐶', '🦁', '🐢', '🦋', '🐝', '🏀', '🚁', '🍔', '🍕', '🍦', '🍩', '🚲', '🚀', '🛸', '🌈', '🔥', '💧'];
  const MATH_SYMBOLS = ['+', '-', '×', '÷', '=', '√', 'π', '∞', '%', '<', '>', '±', '≠', '≈'];
  const ABSTRACT_SYMBOLS = ['▲', '▼', '◀', '▶', '●', '○', '■', '□', '◆', '◇', '⬢', '⬣', '◈', '◉', '◎', '★', '☆', '✦', '✧', '⚛'];

  for (let p = 0; p < worksheetCount; p++) {
    const puzzles = [];
    
    // Her görev seti için döngü
    for (let c = 0; c < puzzleCount; c++) {
      const rows = [];
      for (let i = 0; i < rowCount; i++) {
        // Havuz belirleme
        let pool = EMOJI_POOL;
        if (visualType === 'character') {
          pool = difficulty === 'Zor' ? ['B', 'D', 'P', 'Q', '0', 'O', 'S', '5', 'Z', '2', 'G', '6'] : ['A', 'B', 'C', '1', '2', '3', 'K', 'L', 'M'];
        } else if (visualType === 'abstract') {
          pool = ABSTRACT_SYMBOLS;
        }

        const items = getRandomItems(pool, 2);
        const baseItem = items[0];
        const oddItem = items[1];

        const rowItems = Array(itemsPerRow).fill(baseItem);
        const oddIndex = getRandomInt(0, itemsPerRow - 1);
        rowItems[oddIndex] = oddItem;

        rows.push({
          items: rowItems,
          oddIndex,
          clinicalNote: difficulty === 'Zor' ? 'High Perceptual Load' : 'Base Recognition'
        });
      }
      
      puzzles.push({
        rows,
        title: `Görsel Tarama Görevi #${c + 1}`,
        description: 'Satırlar içindeki farklı olan öğeyi bulun.',
        targetSkill: 'Visual Discrimination'
      });
    }

    results.push({
      title: 'GÖRSEL FARKLIYI BUL: DİKKAT MATRİSİ',
      instruction: 'Her satırda diğerlerinden farklı olan öğeyi yanındaki kutucuğa işaretleyin veya daire içine alın.',
      settings: {
        difficulty: mapDifficulty(difficulty),
        layout: puzzleCount > 1 ? 'grid_compact' : 'single',
        itemType: visualType as any,
        isProfessionalMode: true,
        showClinicalNotes: options.includeClinicalNotes,
        puzzleCount: puzzleCount,
        rowCount: rowCount,
        itemsPerRow: itemsPerRow,
        aestheticMode: (options as any).aestheticMode || 'premium'
      },
      puzzles: puzzles as any
    });
  }

  return results;
};

export const generateOfflineGridDrawing = async (
  options: GeneratorOptions
): Promise<GridDrawingData[]> => {
  const worksheetCount = options.worksheetCount || 1;
  const difficulty = options.difficulty || 'Orta';
  const puzzleCount = options.puzzleCount || 4; // Sayfa başına varyasyon
  const gridSize = options.gridSize || 8; // Kare sayısı (Izgara boyutu)
  
  const results: GridDrawingData[] = [];

  for (let p = 0; p < worksheetCount; p++) {
    // Mevcut desen havuzundan seçim yap
    const availablePatterns = Object.keys(PREDEFINED_GRID_PATTERNS);
    const selectedPatternNames = getRandomItems(availablePatterns, puzzleCount);
    
    const drawings = selectedPatternNames.map((pName, idx) => ({
      lines: PREDEFINED_GRID_PATTERNS[pName],
      title: `Görev ${idx + 1}: ${pName}`,
      complexityLevel: idx % 3 === 0 ? 'easy' : idx % 3 === 1 ? 'medium' : 'hard',
      clinicalMeta: {
        crossingPoints: Math.floor(Math.random() * 5) + 2,
        angleTypes: ['right', 'acute'],
        isSymmetric: false,
      },
    }));

    // Layout belirleme: Varyasyon sayısına göre akıllı yerleşim
    let layout: any = 'grid_2x2';
    if (puzzleCount === 1) layout = 'stacked';
    else if (puzzleCount === 2) layout = 'stacked'; // 2 tane alt alta daha iyi durur
    else if (puzzleCount > 2) layout = 'grid_2x2';

    results.push({
      title: 'KARE KOPYALAMA (MOTOR PREZİSYON)',
      instruction:
        'Sol taraftaki desenleri sağdaki boş ızgaralara noktaları ve çizgileri takip ederek kopyalayın. Dikkatli ve sabırlı ol!',
      gridDim: gridSize,
      settings: {
        difficulty: mapDifficulty(difficulty || 'Orta'),
        layout,
        gridType: 'dots',
        transformMode: (options.concept as any) || 'copy',
        showCoordinates: options.showCoordinates !== false,
        isProfessionalMode: true,
        showClinicalNotes: true,
        puzzleCount,
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
  const axis = options.concept || 'mirror_v'; // mirror_v, mirror_h, diagonal, both
  const puzzleCount = options.puzzleCount || 1;
  const results: SymmetryDrawingData[] = [];

  for (let p = 0; p < worksheetCount; p++) {
    const drawings = [];
    
    for (let d = 0; d < puzzleCount; d++) {
        // Zorluk seviyesine göre çizgi sayısı ve bükülme (node) sayısı
        const nodeCount = difficulty === 'Başlangıç' ? 3 : difficulty === 'Orta' ? 5 : 7;
        const halfSize = Math.floor(gridSize / 2);
        
        // Simetrik çizgiler üret
        const rawLines = generateConnectedPath(halfSize, nodeCount).map((line) => ({
          x1: line[0][0],
          y1: line[0][1],
          x2: line[1][0],
          y2: line[1][1],
          color: 'black',
        }));

        drawings.push({
          lines: rawLines,
          dots: [],
          title: `Görev ${d + 1}`,
          clinicalMeta: {
              complexity: nodeCount,
              targetCognitiveSkill: 'Symmetric Mapping',
              isHighDensity: gridSize > 10
          }
        });
    }

    const layout = puzzleCount === 1 ? 'single' : puzzleCount === 2 ? 'grid_2x1' : 'grid_2x2';

    results.push({
      title: 'SİMETRİ TAMAMLAMA (GÖRSEL AKIL YÜRÜTME)',
      instruction: 'Şekillerin simetri eksenine göre aynadaki yansımasını hatasız bir şekilde tamamlayın.',
      gridDim: gridSize,
      settings: {
        difficulty: mapDifficulty(difficulty || 'Orta'),
        axis: (axis === 'mirror_h' ? 'horizontal' : axis === 'diagonal' ? 'diagonal' : axis === 'both' ? 'both' : 'vertical') as any,
        gridType: 'dots',
        layout: layout as any,
        showGhostPoints: (options as any).showGhostPoints || false,
        showCoordinates: options.showCoordinates !== false,
        isProfessionalMode: true,
        puzzleCount,
        colorMode: 'premium'
      },
      drawings: drawings as any,
    });
  }
  return results;
};

export const generateOfflineFindTheDifference = async (
  options: GeneratorOptions
): Promise<FindTheDifferenceData[]> => {
  const worksheetCount = options.worksheetCount || 1;
  const difficulty = options.difficulty || 'Orta';
  const puzzleCount = options.puzzleCount || 1;
  const gridSize = options.gridSize || (difficulty === 'Başlangıç' ? 4 : difficulty === 'Orta' ? 5 : 6);
  const diffType = options.concept || 'visual'; // visual, mirror, number, word, abstract

  const results: FindTheDifferenceData[] = [];

  // Veri Havuzları
  const EMOJI_POOL = ['🍎', '🚗', '🏠', '⭐', '🎈', '📚', '⚽', '☀️', '🌙', '🌲', '🌺', '🎁', '🐱', '🐶', '🦁', '🐢', '🦋', '🐝', '🏀', '🚁', '🍔', '🍕', '🍦', '🍩', '🚲', '🚀', '🛸', '🌈', '🔥', '💧'];
  const MIRROR_CHARS = [['b', 'd'], ['p', 'q'], ['m', 'n'], ['s', 'ş'], ['c', 'ç'], ['u', 'n'], ['6', '9'], ['3', 'E'], ['5', 'S'], ['z', 's']];
  const ABSTRACT_SYMBOLS = ['▲', '▼', '◀', '▶', '●', '○', '■', '□', '◆', '◇', '⬢', '⬣', '◈', '◉', '◎', '★', '☆', '✦', '✧', '⚛'];

  for (let p = 0; p < worksheetCount; p++) {
    const puzzles = [];
    
    for (let c = 0; c < puzzleCount; c++) {
      const size = gridSize;
      // Güvenli sınır: grid'deki toplam hücre sayısından az olmalı (sonsuz döngü önlemi)
      const rawDiffCount = difficulty === 'Başlangıç' ? 3 : difficulty === 'Orta' ? 5 : 8;
      const diffCount = Math.min(rawDiffCount, Math.floor(size * size * 0.6));
      
      // Havuz Belirleme
      let pool = EMOJI_POOL;
      if (diffType === 'mirror') pool = MIRROR_CHARS.flat();
      else if (diffType === 'abstract') pool = ABSTRACT_SYMBOLS;
      else if (diffType === 'number') pool = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      else if (diffType === 'word') pool = difficulty === 'Başlangıç' ? TURKISH_WORDS_EASY : (difficulty === 'Orta' ? TURKISH_WORDS_MEDIUM : TURKISH_WORDS_HARD);

      // Grid Üretimi
      const gridA: any[][] = Array.from({ length: size }, () => 
        Array.from({ length: size }, () => getRandomItems(pool, 1)[0])
      );

      const gridB = gridA.map(row => [...row]);
      const diffPositions: { r: number; c: number }[] = [];

      while (diffPositions.length < diffCount) {
        const r = getRandomInt(0, size - 1);
        const c = getRandomInt(0, size - 1);
        if (!diffPositions.some(pos => pos.r === r && pos.c === c)) {
          let newVal = getRandomItems(pool, 1)[0];
          // Mirror modunda özellikle eşini koymaya çalış
          if (diffType === 'mirror') {
             const pair = MIRROR_CHARS.find(s => s.includes(gridA[r][c]));
             if (pair) newVal = pair.find(x => x !== gridA[r][c])!;
          }
          while (newVal === gridA[r][c]) newVal = getRandomItems(pool, 1)[0];
          
          gridB[r][c] = newVal;
          diffPositions.push({ r, c });
        }
      }

      puzzles.push({
        gridA,
        gridB,
        diffCount,
        title: `Gövde-Zihin Görevi #${c + 1}`,
        clinicalMeta: {
          discriminationFactor: difficulty === 'Başlangıç' ? 0.6 : 0.85,
          targetCognitiveSkill: 'Saccadic Visual Scan',
          perceptualLoad: (size * size) / 25,
          errorType: diffType === 'mirror' ? 'Mirror Reversal' : 'Visual Substitution'
        }
      });
    }

    const layout = puzzleCount === 1 ? 'side_by_side' : (puzzleCount === 2 ? 'stacked' : 'grid_2x2');

    results.push({
      title: 'FARK BUL: GÖRSEL TARAMA & DİKKAT MATRİSİ',
      instruction: 'Birinci tablo ile ikinci tablo arasındaki farkları bulup sağdakinde işaretleyin.',
      settings: {
        difficulty: mapDifficulty(difficulty || 'Orta'),
        layout: layout as any,
        itemType: (diffType === 'mirror' ? 'char' : diffType as any),
        differenceType: diffType as any,
        isProfessionalMode: true,
        showClinicalNotes: true,
        puzzleCount,
        gridSize,
        differenceCount: puzzles[0].diffCount,
        aestheticMode: 'premium'
      },
      puzzles: puzzles as any
    });
  }
  return results;
};

const TURKISH_PHONOLOGY_WORDS: Record<string, string[]> = {
  'Başlangıç': ['AT', 'EL', 'OK', 'AL', 'İT', 'OT', 'ET', 'AY', 'EY', 'AS', 'AD', 'AK'],
  'Orta': ['KEDİ', 'ELMA', 'OKUL', 'MASA', 'KAPI', 'KİTAP', 'KALEM', 'YAZI', 'BİLGİ', 'DENİZ', 'GÜNEŞ', 'BULUT'],
  'Zor': ['KELEBEK', 'ÇİKOLATA', 'OYUNCAK', 'İSTASYON', 'PENCERE', 'KIRLANGIÇ', 'KAPLUMBAĞA', 'GÖKKUŞAĞI'],
  'Uzman': ['ÜNİVERSİTE', 'BİLGİSAYAR', 'TELEVİZYON', 'KÜTÜPHANE', 'CUMHURİYET', 'MATEMATİK', 'ÖĞRETMEN'],
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
): Promise<DirectionalTrackingData[]> => {
  const { worksheetCount = 1, difficulty = 'Orta', concept = 'letters' } = options;
  const itemCount = options.itemCount || 1; // Sayfa başına puzzle sayısı
  const codeLength = options.codeLength || (difficulty === 'Zor' ? 8 : 5);
  const aestheticMode = (options as any).aestheticMode || 'standard';
  
  const results: DirectionalTrackingData[] = [];
  const rows = options.gridRows || 8;
  const cols = options.gridCols || 8;
  const alphabet = turkishAlphabet.split('');

  for (let p = 0; p < worksheetCount; p++) {
    const puzzles: any[] = [];
    
    for (let q = 0; q < itemCount; q++) {
      // Pick a word based on difficulty and codeLength
      const pool = TURKISH_PHONOLOGY_WORDS[difficulty] || TURKISH_PHONOLOGY_WORDS['Orta'];
      let targetWord = pool[getRandomInt(0, pool.length - 1)];
      
      // If codeLength is strict, try to match it
      if (concept === 'numbers') {
        targetWord = Array.from({ length: codeLength }, () => String(getRandomInt(0, 9))).join('');
      } else if (targetWord.length > codeLength) {
        targetWord = targetWord.substring(0, codeLength);
      } else if (targetWord.length < codeLength && concept === 'letters') {
        // Extend word with random letters if too short
        while (targetWord.length < codeLength) {
            targetWord += alphabet[getRandomInt(0, alphabet.length - 1)];
        }
      }

      const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill(''));
      const used = new Set<string>();
      
      // Start position (avoid edges for better path growth)
      let cr = getRandomInt(1, rows - 2);
      let cc = getRandomInt(1, cols - 2);
      const path: any[] = [];
      
      // Place first char
      grid[cr][cc] = targetWord[0];
      used.add(`${cr},${cc}`);
      path.push({ r: cr, c: cc, char: targetWord[0], direction: 'start' });

      // Path creation
      for (let i = 1; i < targetWord.length; i++) {
        const validDirs = getValidDirections(cr, cc, rows, cols, used);
        if (validDirs.length === 0) break; // Path blocked

        const move = validDirs[getRandomInt(0, validDirs.length - 1)];
        cr += move.dr;
        cc += move.dc;
        grid[cr][cc] = targetWord[i];
        used.add(`${cr},${cc}`);
        path.push({ r: cr, c: cc, char: targetWord[i], direction: move.label });
      }

      // Fill noise
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (!grid[r][c]) {
            grid[r][c] = concept === 'numbers' ? String(getRandomInt(0, 9)) : alphabet[getRandomInt(0, alphabet.length - 1)];
          }
        }
      }

      const finalWord = path.map(pt => pt.char).join('');
      
      puzzles.push({
        id: `dt-${p}-${q}`,
        title: `GÖREVSETİ #${q + 1}`,
        grid,
        path: path.slice(1).map(pt => pt.direction),
        steps: path.slice(1).map((pt, i) => ({
            step: i + 1,
            count: 1,
            dir: pt.direction,
            direction: pt.direction
        })),
        startPos: { r: path[0].r, c: path[0].c },
        targetWord: finalWord,
        cipherAnswer: finalWord,
        answerLength: finalWord.length,
        clinicalMeta: {
            perceptualLoad: (rows * cols) / 64,
            attentionShiftCount: path.length - 1
        }
      });
    }

    results.push({
      title: 'YÖNSEL İZ SÜRME VE ALGORİTMİK DİKKAT',
      instruction: 'Başlangıç noktasından başlayarak okları takip et ve ulaştığın harfleri sırayla şifre kutusuna yaz.',
      settings: {
        difficulty: mapDifficulty(difficulty),
        layout: itemCount > 2 ? 'grid_compact' : 'grid_2x1',
        aestheticMode,
        gridSize: rows,
        contentType: concept as any,
        isProfessionalMode: true,
        showClinicalNotes: true,
        itemCount
      } as any,
      puzzles
    } as any);
  }
  return results;
};


