import { GeneratorOptions } from '../../types/core';
import { DirectionalCodeReadingData } from '../../types/visual';
import { getRandomInt, getRandomItems, shuffle } from './helpers';

export const generateOfflineDirectionalCodeReading = async (
  options: GeneratorOptions
): Promise<DirectionalCodeReadingData> => {
  const difficulty = options.difficulty || 'Orta';
  // Ultra Pro Premium: A4 sayfasını tam doldurmak için 4-6 puzzle (Izgara boyutuna göre)
  const gridSize = options.gridSize || (difficulty === 'Zor' ? 10 : 8); 
  const puzzleCount = difficulty === 'Zor' ? 4 : (difficulty === 'Orta' ? 6 : 4);
  const compactMode = true;

  // Ultra premium temalar (Daha zengin içerik)
  const themes = [
    { intro: '🚀 Uzay istasyonuna acil kargo ulaştırın!', name: 'Uzay Lojistiği', icon: '🚀', color: '#8B5CF6' },
    { intro: '🕵️ Gizli ajanı güvenli bölgeye yönlendirin!', name: 'Gizli Operasyon', icon: '🕵️', color: '#EF4444' },
    { intro: '💎 Define avcısını hazineye ulaştırın!', name: 'Hazine Macerası', icon: '💎', color: '#F59E0B' },
    { intro: '🏥 Acil durum hastaneye ulaşın!', name: 'Acil Yardım', icon: '🏥', color: '#10B981' },
    { intro: '🔬 Laboratuvardan numuneyi güvenli alana taşıyın!', name: 'Bilimsel Görev', icon: '🔬', color: '#3B82F6' },
    { intro: '🚒 İtfaiye aracını yangın bölgesine ulaştırın!', name: 'Kahraman İtfaiyeci', icon: '🚒', color: '#DC2626' }
  ];

  const generateSinglePuzzle = (theme: any, puzzleIndex: number) => {
    const grid: any[][] = [];
    for (let y = 0; y < gridSize; y++) {
      const row = [];
      for (let x = 0; x < gridSize; x++) {
        row.push({ x, y, type: 'empty' });
      }
      grid.push(row);
    }

    const config = {
      Başlangıç: { pathLength: 6, obstacles: 0.12 },
      Orta: { pathLength: 10, obstacles: 0.18 },
      Zor: { pathLength: 14, obstacles: 0.22 },
      Uzman: { pathLength: 18, obstacles: 0.28 },
    }[difficulty] || { pathLength: 10, obstacles: 0.18 };

    const startX = getRandomInt(0, 1);
    const startY = getRandomInt(0, 1);
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

    const targetPos = { x: currentX, y: currentY };
    const obstacleCount = Math.floor(gridSize * gridSize * config.obstacles);
    let placed = 0;
    while (placed < obstacleCount) {
      const x = getRandomInt(0, gridSize - 1);
      const y = getRandomInt(0, gridSize - 1);
      if (!visited.has(`${x},${y}`)) {
        grid[y][x].type = 'obstacle';
        grid[y][x].icon = '🚫';
        placed++;
      }
    }

    grid[startY][startX].type = 'start';
    grid[startY][startX].icon = '🎯';
    grid[targetPos.y][targetPos.x].type = 'target';
    grid[targetPos.y][targetPos.x].icon = theme.icon || '🏁';

    const instructions = path.reduce((acc: any[], step, idx) => {
      const dir = directions.find(d => d.name === step.dir);
      if (dir) {
        if (acc.length > 0 && acc[acc.length - 1].direction === step.dir) {
          acc[acc.length - 1].count++;
        } else {
          acc.push({ step: idx + 1, count: 1, direction: step.dir, label: compactMode ? dir.arrow : `${dir.label}` });
        }
      }
      return acc;
    }, []);

    return {
      id: `puzzle_${puzzleIndex + 1}`,
      title: `${theme.name}`,
      startPos: { x: startX, y: startY },
      targetPos,
      grid: grid.map(row => row.map(cell => ({ x: cell.x, y: cell.y, type: cell.type, icon: cell.icon }))),
      instructions: instructions.map(ins => ({ ...ins, compactLabel: `${ins.count}${ins.label}` })),
      clinicalMeta: {
        cognitiveLoad: difficulty === 'Zor' ? 0.9 : 0.7,
        planningComplexity: difficulty,
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
    instruction: `Aşağıdaki görevlerde başlangıç (🎯) noktasından başlayarak, kutucuk içindeki yön oklarını takip et ve bitiş (${puzzles[0].grid[puzzles[0].targetPos.y][puzzles[0].targetPos.x].icon}) noktasına ulaş. Engellere (🚫) çarpmadan doğru rotayı çiz!`,
    settings: {
      difficulty, gridSize, puzzleCount,
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

