import React from 'react';

interface Props {
  options: Record<string, unknown>;
  onChange: (opts: Record<string, unknown>) => void;
}

export const VisualOddOneOutConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['visualOddOneOut'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Görsel Farklı Olanı Bul</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Öğe Sayısı</label>
        <input
          type="number"
          value={(o.itemCount as number) || 4}
          onChange={(e) =>
            onChange({ ...options, visualOddOneOut: { ...o, itemCount: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={3}
          max={6}
        />
      </div>
    </div>
  );
};

export const GridDrawingConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['gridDrawing'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Grid Çizim</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Grid Boyutu</label>
        <select
          value={(o.gridSize as number) || 10}
          onChange={(e) =>
            onChange({ ...options, gridDrawing: { ...o, gridSize: Number(e.target.value) } })
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

export const SymmetryDrawingConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['symmetryDrawing'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Simetri Çizim</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Simetri Ekseni</label>
        <select
          value={(o.axis as string) || 'vertical'}
          onChange={(e) =>
            onChange({ ...options, symmetryDrawing: { ...o, axis: e.target.value } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value="vertical">Dikey</option>
          <option value="horizontal">Yatay</option>
          <option value="both">Her İkisi</option>
        </select>
      </div>
    </div>
  );
};

export const VisualTrackingLinesConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['visualTrackingLines'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Görsel İzleme Çizgileri</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Çizgi Sayısı</label>
        <input
          type="number"
          value={(o.lineCount as number) || 5}
          onChange={(e) =>
            onChange({
              ...options,
              visualTrackingLines: { ...o, lineCount: Number(e.target.value) },
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

export const AttentionToQuestionConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['attentionToQuestion'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Soruya Dikkat</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Soru Sayısı</label>
        <input
          type="number"
          value={(o.questionCount as number) || 5}
          onChange={(e) =>
            onChange({
              ...options,
              attentionToQuestion: { ...o, questionCount: Number(e.target.value) },
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

export const WordMemoryConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['wordMemory'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Kelime Hafızası</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Kelime Sayısı</label>
        <input
          type="number"
          value={(o.wordCount as number) || 8}
          onChange={(e) =>
            onChange({ ...options, wordMemory: { ...o, wordCount: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={4}
          max={16}
        />
      </div>
    </div>
  );
};

export const VisualMemoryConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['visualMemory'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Görsel Hafıza</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Süre (saniye)</label>
        <input
          type="number"
          value={(o.duration as number) || 5}
          onChange={(e) =>
            onChange({ ...options, visualMemory: { ...o, duration: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={3}
          max={15}
        />
      </div>
    </div>
  );
};

export const CharacterMemoryConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['characterMemory'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Karakter Hafızası</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Karakter Sayısı</label>
        <input
          type="number"
          value={(o.charCount as number) || 6}
          onChange={(e) =>
            onChange({ ...options, characterMemory: { ...o, charCount: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={3}
          max={10}
        />
      </div>
    </div>
  );
};

export const ColorWheelMemoryConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['colorWheelMemory'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Renk Çemberi Hafızası</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Renk Sayısı</label>
        <input
          type="number"
          value={(o.colorCount as number) || 5}
          onChange={(e) =>
            onChange({ ...options, colorWheelMemory: { ...o, colorCount: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={3}
          max={8}
        />
      </div>
    </div>
  );
};

export const ImageComprehensionConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['imageComprehension'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Görsel Anlama</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Görsel Türü</label>
        <select
          value={(o.imageType as string) || 'scene'}
          onChange={(e) =>
            onChange({ ...options, imageComprehension: { ...o, imageType: e.target.value } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value="scene">Manzara</option>
          <option value="object">Nesne</option>
          <option value="character">Karakter</option>
        </select>
      </div>
    </div>
  );
};

export const StroopTestConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['stroopTest'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Stroop Testi</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Soru Sayısı</label>
        <input
          type="number"
          value={(o.trialCount as number) || 10}
          onChange={(e) =>
            onChange({ ...options, stroopTest: { ...o, trialCount: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={5}
          max={20}
        />
      </div>
    </div>
  );
};

export const BurdonTestConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['burdonTest'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Burdon Testi</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Süre (saniye)</label>
        <input
          type="number"
          value={(o.duration as number) || 30}
          onChange={(e) =>
            onChange({ ...options, burdonTest: { ...o, duration: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={15}
          max={60}
        />
      </div>
    </div>
  );
};

export const NumberSearchConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['numberSearch'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Sayı Arama</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Grid Boyutu</label>
        <select
          value={(o.gridSize as number) || 10}
          onChange={(e) =>
            onChange({ ...options, numberSearch: { ...o, gridSize: Number(e.target.value) } })
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

export const ChaoticNumberSearchConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['chaoticNumberSearch'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Kaotik Sayı Arama</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Zorluk</label>
        <select
          value={(o.difficulty as string) || 'Orta'}
          onChange={(e) =>
            onChange({ ...options, chaoticNumberSearch: { ...o, difficulty: e.target.value } })
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

export const FindIdenticalWordConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['findIdenticalWord'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Aynı Kelimeyi Bul</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Kelime Sayısı</label>
        <input
          type="number"
          value={(o.wordCount as number) || 5}
          onChange={(e) =>
            onChange({ ...options, findIdenticalWord: { ...o, wordCount: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={3}
          max={10}
        />
      </div>
    </div>
  );
};

export const LetterGridTestConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['letterGridTest'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Harf Grid Testi</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Grid Boyutu</label>
        <select
          value={(o.gridSize as number) || 8}
          onChange={(e) =>
            onChange({ ...options, letterGridTest: { ...o, gridSize: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value={6}>6x6</option>
          <option value={8}>8x8</option>
          <option value={10}>10x10</option>
        </select>
      </div>
    </div>
  );
};

export const TargetSearchConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['targetSearch'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Hedef Arama</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Hedef Sayısı</label>
        <input
          type="number"
          value={(o.targetCount as number) || 3}
          onChange={(e) =>
            onChange({ ...options, targetSearch: { ...o, targetCount: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={1}
          max={5}
        />
      </div>
    </div>
  );
};

export const VisualInterpretationConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['visualInterpretation'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Görsel Yorumlama</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Görsel Türü</label>
        <select
          value={(o.imageCategory as string) || 'chart'}
          onChange={(e) =>
            onChange({ ...options, visualInterpretation: { ...o, imageCategory: e.target.value } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value="chart">Grafik</option>
          <option value="diagram">Diyagram</option>
          <option value="illustration">İllüstrasyon</option>
        </select>
      </div>
    </div>
  );
};
