import { PatternCompletionData } from '../../types';
import { GeneratorOptions } from '../../types/core';
import { getRandomInt, getRandomItems, shuffle } from './helpers';

export const generateOfflinePatternCompletion = async (
  options: GeneratorOptions
): Promise<PatternCompletionData[]> => {
  const { worksheetCount = 1, difficulty = 'Orta' } = options;
  const opts = options as Record<string, unknown>;

  const puzzleCount = (opts.puzzleCount as number) || 4;
  const gridSize = (opts.gridSize as number) || 3;
  const patternType = (opts.patternType as string) || 'geometric';
  const optionCount = (opts.optionCount as number) || 4;
  const difficultyProgression = (opts.difficultyProgression as string) || 'static';

  const results: PatternCompletionData[] = [];

  const shapes = ['circle', 'square', 'triangle', 'star', 'hexagon', 'diamond', 'pentagon', 'octagon'];
  const colors = [
    '#ef4444', // red
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ];

  for (let w = 0; w < worksheetCount; w++) {
    // Generate multiple puzzles per worksheet based on puzzleCount
    // We'll map them individually in the UI or return a combined architecture later.
    // For now, let's return them as individual activities, 
    // OR we can group them into a single ActivityData if the UI supports it.
    // Looking at the AI version, it seems the UI expects a single Matrix. A4Sheet needs to support multiple.
    // To properly support "dolu dolu" (compact/filled) output with multiple puzzles, 
    // we should return an array of puzzles if the UI iterates. 
    // Wait, the SheetRenderer takes `data` and passes it to `PatternCompletionSheet`.
    // Let's check `PatternCompletionSheet` to see if it supports multiple matrices.
    // If not, we might need a workaround. Let's return the standard format and we will adapt SheetRenderer/PatternCompletionSheet next.

    // Let's create an array of puzzles inside the content object for the new premium format
    const puzzles = [];

    for (let p = 0; p < puzzleCount; p++) {
      // Determine logic type based on difficulty progression
      let currentDifficulty = difficulty;
      if (difficultyProgression === 'gradual') {
         if (p < puzzleCount / 3) currentDifficulty = 'Kolay';
         else if (p < (puzzleCount / 3) * 2) currentDifficulty = 'Orta';
         else currentDifficulty = 'Zor';
      }

      const logicTypes =
        currentDifficulty === 'Kolay'
          ? ['shifting', 'alternating']
          : currentDifficulty === 'Orta'
            ? ['rotation', 'shifting', 'alternating']
            : ['rotation', 'progressive', 'complex_shifting'];

      const logicType = logicTypes[getRandomInt(0, logicTypes.length - 1)];

      const matrix: any[] = [];
      const selectedShapes = getRandomItems(shapes, gridSize);
      const selectedColors = getRandomItems(colors, gridSize);

      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const cellShapes = [];
          const isMissing = x === gridSize - 1 && y === gridSize - 1;

          if (!isMissing) {
            if (patternType === 'color_blocks') {
                const colorIdx = (x + y) % selectedColors.length;
                matrix.push({ x, y, isMissing, color: selectedColors[colorIdx] });
            } else if (patternType === 'logic_sequence') {
                const val = (x + 1) * (y + 1) + p;
                matrix.push({ x, y, isMissing, content: val.toString() });
            } else {
                // Default: geometric
                if (logicType === 'shifting' || logicType === 'complex_shifting') {
                const shapeIdx = (x + y) % selectedShapes.length;
                cellShapes.push({
                    type: selectedShapes[shapeIdx],
                    color: selectedColors[shapeIdx],
                    rotation: 0,
                });
                } else if (logicType === 'rotation') {
                const rotation = ((x * 90) + (y * 90)) % 360;
                cellShapes.push({
                    type: selectedShapes[0],
                    color: selectedColors[0],
                    rotation,
                });
                } else {
                const idx = (x + y) % 2;
                cellShapes.push({
                    type: selectedShapes[idx],
                    color: selectedColors[idx],
                    rotation: 0,
                });
                }
                matrix.push({ x, y, isMissing, shapes: cellShapes });
            }
          } else {
            matrix.push({ x, y, isMissing });
          }
        }
      }

      // Generate options
      const optionsArr = [];
      
      // 1. Correct Option
      const correctShapes = [];
      let correctColor = '';
      let correctContent = '';

      if (patternType === 'color_blocks') {
         correctColor = selectedColors[((gridSize - 1) + (gridSize - 1)) % selectedColors.length];
         optionsArr.push({ id: 'A', isCorrect: true, cell: { x: gridSize - 1, y: gridSize - 1, isMissing: false, color: correctColor } });
      } else if (patternType === 'logic_sequence') {
         correctContent = ((gridSize) * (gridSize) + p).toString();
         optionsArr.push({ id: 'A', isCorrect: true, cell: { x: gridSize - 1, y: gridSize - 1, isMissing: false, content: correctContent } });
      } else {
         if (logicType === 'shifting' || logicType === 'complex_shifting') {
            const shapeIdx = ((gridSize - 1) + (gridSize - 1)) % selectedShapes.length;
            correctShapes.push({ type: selectedShapes[shapeIdx], color: selectedColors[shapeIdx], rotation: 0 });
         } else if (logicType === 'rotation') {
            const rotation = (((gridSize - 1) * 90) + ((gridSize - 1) * 90)) % 360;
            correctShapes.push({ type: selectedShapes[0], color: selectedColors[0], rotation });
         } else {
            const idx = ((gridSize - 1) + (gridSize - 1)) % 2;
            correctShapes.push({ type: selectedShapes[idx], color: selectedColors[idx], rotation: 0 });
         }
         optionsArr.push({ id: 'A', isCorrect: true, cell: { x: gridSize - 1, y: gridSize - 1, isMissing: false, shapes: correctShapes } });
      }

      // 2. Distractors
      const letters = ['B', 'C', 'D', 'E', 'F'];
      for (let odx = 0; odx < optionCount - 1; odx++) {
         if (patternType === 'color_blocks') {
            optionsArr.push({ id: letters[odx], isCorrect: false, cell: { x: gridSize - 1, y: gridSize - 1, isMissing: false, color: colors[getRandomInt(0, colors.length - 1)] } });
         } else if (patternType === 'logic_sequence') {
            optionsArr.push({ id: letters[odx], isCorrect: false, cell: { x: gridSize - 1, y: gridSize - 1, isMissing: false, content: (getRandomInt(10, 99)).toString() } });
         } else {
            optionsArr.push({ 
                id: letters[odx], 
                isCorrect: false, 
                cell: { 
                    x: gridSize - 1, 
                    y: gridSize - 1, 
                    isMissing: false, 
                    shapes: [{ 
                        type: shapes[getRandomInt(0, shapes.length - 1)], 
                        color: colors[getRandomInt(0, colors.length - 1)], 
                        rotation: [0, 90, 180, 270][getRandomInt(0, 3)] 
                    }] 
                } 
            });
         }
      }

      puzzles.push({
          id: `pz_${p}`,
          matrix,
          options: shuffle(optionsArr),
          gridSize: gridSize,
          patternType: patternType
      });
    }

    results.push({
      id: 'pattern_' + Date.now() + '_' + w,
      activityType: 'PATTERN_COMPLETION' as any,
      title: 'Kafayı Çalıştır: Deseni Tamamla',
      instruction: 'Matristeki örüntü kuralını bozmadan soru işaretli yere gelecek parçayı bulun.',
      pedagogicalNote: 'Bu etkinlik öğrencinin görsel algı, uzamsal akıl yürütme ve ardışık mantık kurma becerilerini geliştirir.',
      settings: {
        difficulty,
        patternType,
        gridSize,
        puzzleCount,
        compactLayout: opts.compactLayout !== false
      },
      content: {
        title: 'Matrisi Tamamla',
        instruction: 'Matristeki örüntü kuralını bozmadan soru işaretli yere gelecek parçayı bulun.',
        puzzles: puzzles
      },
    } as any);
  }

  return results;
};

export default generateOfflinePatternCompletion;
