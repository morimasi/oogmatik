import { GeneratorOptions } from '../../types/core';
import { DirectionalCodeReadingData } from '../../types/visual';
import { getRandomInt, getRandomItems, shuffle } from './helpers';

export const generateOfflineDirectionalCodeReading = async (
  options: GeneratorOptions
): Promise<DirectionalCodeReadingData> => {
  const gridSize = options.gridSize || 8; // Ultra kompakt için 8x8
  const difficulty = options.difficulty || 'Orta';
  const puzzleCount = difficulty === 'Zor' ? 4 : 3; // Ultra dolu sayfa için daha fazla puzzle
  const compactMode = (options as any).compactMode || true;

  // Ultra premium temalar
  const themes = [
    { 
      intro: '🚀 Uzay istasyonuna acil kargo ulaştırın!', 
      name: 'Uzay Lojistiği',
      icon: '🚀',
      color: '#8B5CF6'
    },
    { 
      intro: '🕵️ Gizli ajanı güvenli bölgeye yönlendirin!', 
      name: 'Gizli Operasyon',
      icon: '🕵️',
      color: '#EF4444'
    },
    { 
      intro: '💎 Define avcısını hazineye ulaştırın!', 
      name: 'Hazine Macerası',
      icon: '💎',
      color: '#F59E0B'
    },
    { 
      intro: '🏥 Acil durum hastaneye ulaşın!', 
      name: 'Acil Yardım',
      icon: '🏥',
      color: '#10B981'
    },
    { 
      intro: '🔬 Laboratuvardan numuneyi güvenli alana taşıyın!', 
      name: 'Bilimsel Görev',
      icon: '🔬',
      color: '#3B82F6'
    }
  ];

  const generateSinglePuzzle = (theme: any, puzzleIndex: number) => {
    // 1. Initialize Grid
    const grid: any[][] = [];
    for (let y = 0; y < gridSize; y++) {
      const row = [];
      for (let x = 0; x < gridSize; x++) {
        row.push({ x, y, type: 'empty' });
      }
      grid.push(row);
    }

    // 2. Difficulty-based configuration
    const config = {
      Başlangıç: { pathLength: 6, obstacles: 0.15 },
      Orta: { pathLength: 8, obstacles: 0.20 },
      Zor: { pathLength: 10, obstacles: 0.25 },
      Uzman: { pathLength: 12, obstacles: 0.30 },
    }[difficulty] || { pathLength: 8, obstacles: 0.20 };

    // 3. Generate valid path
    const startX = 0;
    const startY = 0;
    let currentX = startX;
    let currentY = startY;
    const path: { x: number; y: number; dir: string }[] = [];
    const visited = new Set<string>();
    visited.add(`${startX},${startY}`);

    const directions = [
      { name: 'right', dx: 1, dy: 0, label: 'Sağ', arrow: '➡️' },
      { name: 'left', dx: -1, dy: 0, label: 'Sol', arrow: '⬅️' },
      { name: 'down', dx: 0, dy: 1, label: 'Aşağı', arrow: '⬇️' },
      { name: 'up', dx: 0, dy: -1, label: 'Yukarı', arrow: '⬆️' },
    ];

    // Generate path with backtracking
    for (let i = 0; i < config.pathLength; i++) {
      const possibleMoves = directions.filter((d) => {
        const nx = currentX + d.dx;
        const ny = currentY + d.dy;
        return nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && !visited.has(`${nx},${ny}`);
      });

      if (possibleMoves.length === 0) break;

      const move = possibleMoves[getRandomInt(0, possibleMoves.length - 1)];
      currentX += move.dx;
      currentY += move.dy;
      visited.add(`${currentX},${currentY}`);
      path.push({ x: currentX, y: currentY, dir: move.name });
    }

    // Set target position
    const targetPos = { x: currentX, y: currentY };

    // 4. Place obstacles
    const obstacleCount = Math.floor(gridSize * gridSize * config.obstacles);
    let placed = 0;
    
    while (placed < obstacleCount) {
      const x = getRandomInt(0, gridSize - 1);
      const y = getRandomInt(0, gridSize - 1);
      const key = `${x},${y}`;
      
      if (!visited.has(key)) {
        grid[y][x].type = 'obstacle';
        grid[y][x].icon = '🚫';
        placed++;
      }
    }

    // 5. Mark start and target
    grid[startY][startX].type = 'start';
    grid[startY][startX].icon = '🎯';
    grid[targetPos.y][targetPos.x].type = 'target';
    grid[targetPos.y][targetPos.x].icon = '🏁';

    // 6. Generate instructions (compressed for compact mode)
    const instructions = path.reduce((acc: any[], step, idx) => {
      const dir = directions.find(d => d.name === step.dir);
      if (dir) {
        if (acc.length > 0 && acc[acc.length - 1].direction === step.dir) {
          acc[acc.length - 1].count++;
        } else {
          acc.push({
            step: idx + 1,
            count: 1,
            direction: step.dir,
            label: compactMode ? dir.arrow : `${dir.label}`,
          });
        }
      }
      return acc;
    }, []);

    return {
      id: `puzzle_${puzzleIndex + 1}`,
      title: `${theme.name} - Bölüm ${puzzleIndex + 1}`,
      startPos: { x: startX, y: startY },
      targetPos,
      grid: grid.map((row) =>
        row.map((cell) => ({
          x: cell.x,
          y: cell.y,
          type: cell.type,
          icon: cell.icon,
        }))
      ),
      instructions: instructions.map((ins) => ({
        ...ins,
        compactLabel: compactMode ? `${ins.count}${ins.label}` : `${ins.count} adet ${ins.label}`,
      })),
      clinicalMeta: {
        cognitiveLoad: difficulty === 'Zor' ? 0.85 : difficulty === 'Orta' ? 0.7 : 0.55,
        planningComplexity: difficulty === 'Zor' ? 'Yüksek' : difficulty === 'Orta' ? 'Orta' : 'Temel',
        estimatedTime: config.pathLength * 2, // seconds
        skillFocus: ['Mekansal algı', 'Sıralı düşünme', 'Problem çözme'],
      }
    };
  };

  // Generate multiple puzzles for ultra-dense page
  const puzzles = [];
  const selectedThemes = getRandomItems(themes, puzzleCount);
  
  for (let i = 0; i < puzzleCount; i++) {
    puzzles.push(generateSinglePuzzle(selectedThemes[i], i));
  }

  const mainTheme = selectedThemes[0];

  return {
    id: 'directional_code_ultra_' + Date.now(),
    activityType: 'DIRECTIONAL_CODE_READING' as any,
    title: `🎯 Ultra Premium Yönsel İz Sürme`,
    settings: {
      difficulty,
      gridSize,
      obstacleDensity: 20,
      cipherType: 'arrows',
      aestheticMode: 'ultra-compact',
      compactMode: true,
      puzzleCount,
    },
    content: {
      title: mainTheme.name,
      storyIntro: mainTheme.intro,
      puzzles: puzzles,
      ultraMode: {
        compactLayout: true,
        showGridLines: false,
        minimalPadding: true,
        densePacking: true,
        premiumStyling: true,
      },
      pedagogicalNote: `Bu ultra premium etkinlik, ${difficulty} seviyesinde ${puzzleCount} adet yönsel iz sürme görevi içerir. Her görev öğrencinin mekansal algı, sıralı düşünme ve problem çözme becerilerini geliştirmek için özel olarak tasarlanmıştır. Kompakt tasarım sayesinde A4 sayfasında maksimum verimlilik sağlanır.`,
      visualHints: {
        startIcon: '🎯',
        targetIcon: '🏁',
        obstacleIcon: '🚫',
        pathColor: mainTheme.color,
        backgroundColor: '#FAFAFA',
        gridStyle: 'minimal',
      }
    },
  };
};
