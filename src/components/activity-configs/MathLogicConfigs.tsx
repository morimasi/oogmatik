import React from 'react';

interface Props {
  options: Record<string, unknown>;
  onChange: (opts: Record<string, unknown>) => void;
}

export const OddEvenSudokuConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['oddEvenSudoku'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Odd Even Sudoku</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Grid Boyutu</label>
        <select
          value={(o.gridSize as number) || 4}
          onChange={(e) =>
            onChange({ ...options, oddEvenSudoku: { ...o, gridSize: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value={4}>4x4</option>
          <option value={6}>6x6</option>
          <option value={9}>9x9</option>
        </select>
      </div>
    </div>
  );
};

export const KendokuConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['kendoku'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Kendoku</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Grid Boyutu</label>
        <select
          value={(o.gridSize as number) || 4}
          onChange={(e) =>
            onChange({ ...options, kendoku: { ...o, gridSize: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value={4}>4x4</option>
          <option value={5}>5x5</option>
          <option value={6}>6x6</option>
        </select>
      </div>
    </div>
  );
};

export const NumberPyramidConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['numberPyramid'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Sayı Piramidi</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Yükseklik</label>
        <input
          type="number"
          value={(o.height as number) || 3}
          onChange={(e) =>
            onChange({ ...options, numberPyramid: { ...o, height: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={2}
          max={6}
        />
      </div>
    </div>
  );
};

export const VisualArithmeticConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['visualArithmetic'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Görsel Aritmetik</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">İşlem Türü</label>
        <select
          value={(o.operationType as string) || 'mixed'}
          onChange={(e) =>
            onChange({ ...options, visualArithmetic: { ...o, operationType: e.target.value } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value="mixed">Karışık</option>
          <option value="add">Toplama</option>
          <option value="subtract">Çıkarma</option>
          <option value="multiply">Çarpma</option>
        </select>
      </div>
    </div>
  );
};

export const NumberSenseConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['numberSense'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Sayı Hissi</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Zorluk</label>
        <select
          value={(o.difficulty as string) || 'Orta'}
          onChange={(e) =>
            onChange({ ...options, numberSense: { ...o, difficulty: e.target.value } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value="Başlangıç">Başlangıç</option>
          <option value="Orta">Orta</option>
          <option value="Zor">Zor</option>
        </select>
      </div>
    </div>
  );
};

export const LogicGridPuzzleConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['logicGridPuzzle'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Mantık Grid Bulmaca</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Öğe Sayısı</label>
        <input
          type="number"
          value={(o.itemCount as number) || 3}
          onChange={(e) =>
            onChange({ ...options, logicGridPuzzle: { ...o, itemCount: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={2}
          max={5}
        />
      </div>
    </div>
  );
};

export const PunctuationMazeConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['punctuationMaze'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Noktalama Labirenti</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Cümle Sayısı</label>
        <input
          type="number"
          value={(o.sentenceCount as number) || 5}
          onChange={(e) =>
            onChange({
              ...options,
              punctuationMaze: { ...o, sentenceCount: Number(e.target.value) },
            })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={3}
          max={10}
        />
      </div>
    </div>
  );
};

export const MathStudioConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['mathStudio'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Matematik Stüdyosu</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Zorluk</label>
        <select
          value={(o.difficulty as string) || 'Orta'}
          onChange={(e) =>
            onChange({ ...options, mathStudio: { ...o, difficulty: e.target.value } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value="Başlangıç">Başlangıç</option>
          <option value="Orta">Orta</option>
          <option value="Zor">Zor</option>
        </select>
      </div>
    </div>
  );
};

export const RealLifeMathProblemsConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['realLifeMathProblems'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Günlük Matematik</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Problem Sayısı</label>
        <input
          type="number"
          value={(o.problemCount as number) || 5}
          onChange={(e) =>
            onChange({
              ...options,
              realLifeMathProblems: { ...o, problemCount: Number(e.target.value) },
            })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={3}
          max={10}
        />
      </div>
    </div>
  );
};

export const AttentionDevelopmentConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['attentionDevelopment'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Dikkat Gelişimi</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Süre (saniye)</label>
        <input
          type="number"
          value={(o.duration as number) || 60}
          onChange={(e) =>
            onChange({
              ...options,
              attentionDevelopment: { ...o, duration: Number(e.target.value) },
            })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={30}
          max={180}
        />
      </div>
    </div>
  );
};

export const AnagramConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['anagram'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Anagram</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Kelime Sayısı</label>
        <input
          type="number"
          value={(o.wordCount as number) || 5}
          onChange={(e) =>
            onChange({ ...options, anagram: { ...o, wordCount: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={3}
          max={10}
        />
      </div>
    </div>
  );
};

export const CrosswordConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['crossword'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Çapraz Bulmaca</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Izgara Boyutu</label>
        <select
          value={(o.gridSize as number) || 10}
          onChange={(e) =>
            onChange({ ...options, crossword: { ...o, gridSize: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value={8}>8x8</option>
          <option value={10}>10x10</option>
          <option value={12}>12x12</option>
        </select>
      </div>
    </div>
  );
};

export const OddOneOutConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['oddOneOut'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Farklı Olanı Bul</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Öğe Sayısı</label>
        <input
          type="number"
          value={(o.itemCount as number) || 4}
          onChange={(e) =>
            onChange({ ...options, oddOneOut: { ...o, itemCount: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={3}
          max={6}
        />
      </div>
    </div>
  );
};

export const ConceptMatchConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['conceptMatch'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Kavram Eşleştirme</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Eşleşme Sayısı</label>
        <input
          type="number"
          value={(o.matchCount as number) || 5}
          onChange={(e) =>
            onChange({ ...options, conceptMatch: { ...o, matchCount: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={3}
          max={8}
        />
      </div>
    </div>
  );
};

export const EstimationConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['estimation'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Tahmin</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Zorluk</label>
        <select
          value={(o.difficulty as string) || 'Orta'}
          onChange={(e) =>
            onChange({ ...options, estimation: { ...o, difficulty: e.target.value } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value="Başlangıç">Başlangıç</option>
          <option value="Orta">Orta</option>
          <option value="Zor">Zor</option>
        </select>
      </div>
    </div>
  );
};

export const SpatialGridConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['spatialGrid'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Uzaysal Grid</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Grid Boyutu</label>
        <select
          value={(o.gridSize as number) || 5}
          onChange={(e) =>
            onChange({ ...options, spatialGrid: { ...o, gridSize: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value={4}>4x4</option>
          <option value={5}>5x5</option>
          <option value={6}>6x6</option>
        </select>
      </div>
    </div>
  );
};

export const DotPaintingConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['dotPainting'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Nokta Boyama</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Nokta Sayısı</label>
        <input
          type="number"
          value={(o.dotCount as number) || 10}
          onChange={(e) =>
            onChange({ ...options, dotPainting: { ...o, dotCount: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={5}
          max={20}
        />
      </div>
    </div>
  );
};

export const ShapeSudokuConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['shapeSudoku'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Şekil Sudoku</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Grid Boyutu</label>
        <select
          value={(o.gridSize as number) || 4}
          onChange={(e) =>
            onChange({ ...options, shapeSudoku: { ...o, gridSize: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value={4}>4x4</option>
          <option value={6}>6x6</option>
          <option value={9}>9x9</option>
        </select>
      </div>
    </div>
  );
};
