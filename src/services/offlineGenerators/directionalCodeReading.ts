import { GeneratorOptions } from '../../types/core';
import { DirectionalCodeReadingData } from '../../types/visual';
import { getRandomInt, getRandomItems, shuffle } from './helpers';

export const generateOfflineDirectionalCodeReading = async (
  options: GeneratorOptions
): Promise<DirectionalCodeReadingData> => {
  const difficulty = options.difficulty || 'Orta';
  const gridSize = options.gridSize || (difficulty === 'Zor' ? 10 : 8); 
  const puzzleCount = options.puzzleCount || (difficulty === 'Zor' ? 4 : (difficulty === 'Orta' ? 6 : 4));
  const compactMode = true;
  const codeLength = options.codeLength || 15;

  const themes = [
    { intro: '🚀 Uzay istasyonuna acil kargo ulaştırın!', name: 'Uzay Lojistiği', icon: '🚀', color: '#8B5CF6' },
    { intro: '🕵️ Gizli ajanı güvenli bölgeye yönlendirin!', name: 'Gizli Operasyon', icon: '🕵️', color: '#EF4444' },
    { intro: '💎 Define avcısını hazineye ulaştırın!', name: 'Hazine Macerası', icon: '💎', color: '#F59E0B' },
    { intro: '🏥 Acil durum hastaneye ulaşın!', name: 'Acil Yardım', icon: '🏥', color: '#10B981' },
    { intro: '🔬 Laboratuvardan numuneyi güvenli alana taşıyın!', name: 'Bilimsel Görev', icon: '🔬', color: '#3B82F6' },
    { intro: '🚒 İtfaiye aracını yangın bölgesine ulaştırın!', name: 'Kahraman İtfaiyeci', icon: '🚒', color: '#DC2626' }
  ];

  const obstacleDensity = options.obstacleDensity ?? 20;

  const directions = [
    { name: 'right', dx: 1, dy: 0, label: 'Sağ', arrow: '➡️' },
    { name: 'left', dx: -1, dy: 0, label: 'Sol', arrow: '⬅️' },
    { name: 'down', dx: 0, dy: 1, label: 'Aşağı', arrow: '⬇️' },
    { name: 'up', dx: 0, dy: -1, label: 'Yukarı', arrow: '⬆️' },
  ];

  const generatePath = (length: number): { x: number; y: number; dir: string }[] => {
    const maxCells = gridSize * gridSize;
    const effectiveLength = Math.min(length, maxCells - 1);
    const allowRevisit = effectiveLength < length;

    const startX = getRandomInt(0, Math.min(2, gridSize - 1));
    const startY = getRandomInt(0, Math.min(2, gridSize - 1));
    let currentX = startX;
    let currentY = startY;
    const path: { x: number; y: number; dir: string }[] = [];
    const visited = new Set<string>();
    visited.add(`${startX},${startY}`);

    for (let i = 0; i < effectiveLength; i++) {
      const possibleMoves = directions.filter((d) => {
        const nx = currentX + d.dx;
        const ny = currentY + d.dy;
        if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) return false;
        if (allowRevisit) return true;
        return !visited.has(`${nx},${ny}`);
      });

      if (possibleMoves.length === 0) {
        const fallback = directions.filter((d) => {
          const nx = currentX + d.dx;
          const ny = currentY + d.dy;
          return nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize;
        });
        if (fallback.length === 0) break;
        const move = fallback[getRandomInt(0, fallback.length - 1)];
        currentX += move.dx;
        currentY += move.dy;
        path.push({ x: currentX, y: currentY, dir: move.name });
      } else {
        const move = possibleMoves[getRandomInt(0, possibleMoves.length - 1)];
        currentX += move.dx;
        currentY += move.dy;
        visited.add(`${currentX},${currentY}`);
        path.push({ x: currentX, y: currentY, dir: move.name });
      }
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

    const obstacleRatio = obstacleDensity / 100;
    const obstacleCount = Math.floor(gridSize * gridSize * obstacleRatio);
    let placed = 0;
    while (placed < obstacleCount) {
      const x = getRandomInt(0, gridSize - 1);
      const y = getRandomInt(0, gridSize - 1);
      if (!visitedCells.has(`${x},${y}`)) {
        grid[y][x].type = 'obstacle';
        grid[y][x].icon = '🚫';
        placed++;
      }
    }

    grid[clampedStartY][clampedStartX].type = 'start';
    grid[clampedStartY][clampedStartX].icon = '🎯';
    grid[targetPos.y][targetPos.x].type = 'target';
    grid[targetPos.y][targetPos.x].icon = theme.icon || '🏁';

    const instructions = path.reduce((acc: any[], step) => {
      const dir = directions.find(d => d.name === step.dir);
      if (dir) {
        if (acc.length > 0 && acc[acc.length - 1].direction === step.dir) {
          acc[acc.length - 1].count++;
        } else {
          acc.push({
            step: acc.length + 1,
            count: 1,
            direction: step.dir,
            label: `${dir.label}`,
            compactLabel: `${dir.arrow}`
          });
        }
      }
      return acc;
    }, []);

    const totalSteps = instructions.reduce((sum: number, ins: any) => sum + ins.count, 0);

    return {
      id: `puzzle_${puzzleIndex + 1}`,
      title: `${theme.name}`,
      startPos: { x: clampedStartX, y: clampedStartY },
      targetPos,
      grid: grid.map(row => row.map(cell => ({ x: cell.x, y: cell.y, type: cell.type, icon: cell.icon }))),
      instructions: instructions.map(ins => ({
        ...ins,
        compactLabel: `${ins.count}${directions.find(d => d.name === ins.direction)?.arrow || ''}`
      })),
      clinicalMeta: {
        cognitiveLoad: Math.min(1, Math.round((totalSteps / 50 + (1 - obstacleDensity / 100)) * 10) / 10),
        planningComplexity: totalSteps <= 10 ? 'Düşük' : totalSteps <= 20 ? 'Orta' : totalSteps <= 35 ? 'Yüksek' : 'Çok Yüksek',
        estimatedTime: Math.ceil(totalSteps / 5) * 30,
        skillFocus: ['Mekansal Algı', 'Sıralı İşlemleme', 'Yönetici Fonksiyonlar']
      }
    };
  };

  const puzzles = [];
  const selectedThemes = getRandomItems(themes, puzzleCount);
  for (let i = 0; i < puzzleCount; i++) {
    puzzles.push(generateSinglePuzzle(selectedThemes[i % selectedThemes.length], i));
  }

  return {
    id: 'directional_code_ultra_pro_' + Date.now(),
    activityType: 'DIRECTIONAL_CODE_READING' as any,
    title: `🛡️ Şifreli Kod Rota: Ultra Pro Premium`,
    instruction: `Aşağıdaki görevlerde başlangıç (🎯) noktasından başlayarak, kutucuk içindeki yön kodlarını takip et ve bitiş noktasına ulaş. Engellere (🚫) çarpmadan doğru rotayı çiz!`,
    settings: {
      difficulty, gridSize, puzzleCount,
      codeLength,
      obstacleDensity,
      cipherType: options.cipherType || 'arrows',
      aestheticMode: 'ultra-compact',
      compactMode: true
    },
    content: {
      title: 'Ultra Kod Rota Serisi',
      storyIntro: 'Zihinsel koordinasyon ve mekansal planlama becerilerini geliştiren hibrit görevler.',
      puzzles: puzzles,
      ultraMode: { compactLayout: true, showGridLines: true, minimalPadding: true, densePacking: true, premiumStyling: true },
      pedagogicalNote: `Bu etkinlik, öğrencinin yön kavramlarını somutlaştırmasını sağlar ve mekansal navigasyon yeteneğini 'ultra pro' düzeyinde (yoğunlaştırılmış egzersizlerle) pekiştirir.`,
      visualHints: { startIcon: '🎯', targetIcon: '🏁', obstacleIcon: '🚫', pathColor: '#3B82F6', backgroundColor: '#FFFFFF', gridStyle: 'modern' }
    }
  } as any;
};

