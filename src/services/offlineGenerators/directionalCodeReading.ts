import { GeneratorOptions } from '../../types/core';
import { DirectionalCodeReadingData } from '../../types/visual';
import { getRandomInt, getRandomItems, shuffle } from './helpers';

export const generateOfflineDirectionalCodeReading = async (
  options: GeneratorOptions
): Promise<DirectionalCodeReadingData> => {
  const difficulty = options.difficulty || 'Orta';
  const gridSize = options.gridSize || (difficulty === 'Zor' ? 10 : 8); 
  const puzzleCount = options.puzzleCount || (difficulty === 'Zor' ? 4 : (difficulty === 'Orta' ? 2 : 1));
  const codeLength = options.codeLength || 15;
  const obstacleDensity = options.obstacleDensity ?? 20;
  const cipherType = options.cipherType || 'arrows';

  const themes = [
    { intro: '🚀 Uzay istasyonuna acil kargo ulaştırın!', name: 'Uzay Lojistiği', icon: '🚀', obstacleIcon: '☄️', color: '#8B5CF6' },
    { intro: '🕵️ Gizli ajanı güvenli bölgeye yönlendirin!', name: 'Gizli Operasyon', icon: '🕵️', obstacleIcon: '🚧', color: '#EF4444' },
    { intro: '💎 Define avcısını hazineye ulaştırın!', name: 'Hazine Macerası', icon: '💎', obstacleIcon: '🕸️', color: '#F59E0B' },
    { intro: '🏥 Acil durum hastaneye ulaşın!', name: 'Acil Yardım', icon: '🏥', obstacleIcon: '🅿️', color: '#10B981' },
    { intro: '🔬 Laboratuvardan numuneyi güvenli alana taşıyın!', name: 'Bilimsel Görev', icon: '🔬', obstacleIcon: '⚠️', color: '#3B82F6' }
  ];

  const directions = [
    { name: 'right', dx: 1, dy: 0, label: 'Sağ', arrow: '➡️' },
    { name: 'left', dx: -1, dy: 0, label: 'Sol', arrow: '⬅️' },
    { name: 'down', dx: 0, dy: 1, label: 'Aşağı', arrow: '⬇️' },
    { name: 'up', dx: 0, dy: -1, label: 'Yukarı', arrow: '⬆️' },
  ];

  const generatePath = (length: number): { x: number; y: number; dir: string }[] => {
    const startX = getRandomInt(0, Math.min(2, gridSize - 1));
    const startY = getRandomInt(0, Math.min(2, gridSize - 1));
    let currentX = startX;
    let currentY = startY;
    const path: { x: number; y: number; dir: string }[] = [];
    const visited = new Set<string>();
    visited.add(`${startX},${startY}`);

    for (let i = 0; i < length; i++) {
        const possibleMoves = directions.filter(d => {
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
    return path;
  };

  const generateSinglePuzzle = (theme: any, puzzleIndex: number) => {
    const grid: any[][] = [];
    for (let y = 0; y < gridSize; y++) {
      const row = [];
      for (let x = 0; x < gridSize; x++) {
        row.push({ x, y, type: 'empty' });
      }
      grid.push(row);
    }

    const path = generatePath(codeLength);
    const startX = path.length > 0 ? path[0].x - (directions.find(d => d.name === path[0].dir)?.dx || 0) : 0;
    const startY = path.length > 0 ? path[0].y - (directions.find(d => d.name === path[0].dir)?.dy || 0) : 0;
    const clampedStartX = Math.max(0, Math.min(gridSize - 1, startX));
    const clampedStartY = Math.max(0, Math.min(gridSize - 1, startY));
    const targetPos = path.length > 0 ? { x: path[path.length - 1].x, y: path[path.length - 1].y } : { x: 0, y: 0 };

    const visitedCells = new Set<string>();
    visitedCells.add(`${clampedStartX},${clampedStartY}`);
    path.forEach(p => visitedCells.add(`${p.x},${p.y}`));

    const obstacleCount = Math.floor(gridSize * gridSize * (obstacleDensity / 100));
    let placed = 0;
    while (placed < obstacleCount) {
      const x = getRandomInt(0, gridSize - 1);
      const y = getRandomInt(0, gridSize - 1);
      if (!visitedCells.has(`${x},${y}`)) {
        grid[y][x].type = 'obstacle';
        grid[y][x].icon = theme.obstacleIcon || '🚫';
        placed++;
      }
    }

    grid[clampedStartY][clampedStartX].type = 'start';
    grid[targetPos.y][targetPos.x].type = 'target';

    const instructions = path.reduce((acc: any[], step) => {
      const dir = directions.find(d => d.name === step.dir);
      const coordLabel = `${String.fromCharCode(65 + step.x)}${step.y + 1}`;
      
      if (dir) {
        if (acc.length > 0 && acc[acc.length - 1].direction === step.dir && cipherType === 'arrows') {
          acc[acc.length - 1].count++;
        } else {
          acc.push({
            step: acc.length + 1,
            count: 1,
            direction: step.dir,
            label: dir.label,
            arrow: dir.arrow,
            coord: coordLabel
          });
        }
      }
      return acc;
    }, []);

    return {
      id: `pz_${puzzleIndex}`,
      title: theme.name,
      startX: clampedStartX,
      startY: clampedStartY,
      targetX: targetPos.x,
      targetY: targetPos.y,
      grid: grid.map(row => row.map(c => ({ ...c }))),
      instructions,
      clinicalMeta: {
        totalSteps: path.length,
        complexity: (path.length / 10) + (obstacleDensity / 50),
        skills: ['Mekansal Planlama', 'Görsel Tarama', 'Koordinat Takibi']
      }
    };
  };

  const puzzles = [];
  const selectedThemes = getRandomItems(themes, puzzleCount);
  for (let i = 0; i < puzzleCount; i++) {
    puzzles.push(generateSinglePuzzle(selectedThemes[i % selectedThemes.length], i));
  }

  return {
    title: 'ŞİFRE VE ROTA MATRİSİ',
    instruction: 'Başlangıç noktasından itibaren şifreli yönergeyi takip et ve doğru rotayı çiz.',
    settings: {
      difficulty, gridSize, puzzleCount, codeLength, obstacleDensity, cipherType,
      aestheticMode: options.aestheticMode || 'ultra-compact'
    },
    puzzles
  } as any;
};
