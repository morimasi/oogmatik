import React from 'react';

interface Props {
  options: Record<string, unknown>;
  onChange: (opts: Record<string, unknown>) => void;
}

export const MeyveliToplamaConfig: React.FC<Props> = ({ options, onChange }) => {
  const opts = options as Record<string, unknown>;
  const meyveli = (opts.meyveliToplama || {}) as Record<string, unknown>;

  const fruits = ['Elma', 'Armut', 'Üzüm', 'Portakal', 'Limon', 'Çilek', 'Kivi', 'Şeftali'];

  return (
    <div className="space-y-5 p-4">
      <div className="pb-3 border-b border-zinc-200">
        <h4 className="font-bold text-zinc-800">Meyveli Toplama</h4>
        <p className="text-xs text-zinc-500">Meyveleri sayarak işlemleri tamamla</p>
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
          Izgara Boyutu
        </label>
        <select
          value={(meyveli.gridSize as number) || 3}
          onChange={(e) =>
            onChange({
              ...opts,
              meyveliToplama: { ...meyveli, gridSize: Number(e.target.value) },
            })
          }
          className="w-full p-2 border-2 border-zinc-200 rounded-lg"
        >
          <option value={2}>2x2</option>
          <option value={3}>3x3</option>
          <option value={4}>4x4</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Hedef Toplam</label>
        <input
          type="number"
          value={(meyveli.maxSum as number) || 15}
          onChange={(e) =>
            onChange({
              ...opts,
              meyveliToplama: { ...meyveli, maxSum: Number(e.target.value) },
            })
          }
          className="w-full p-2 border-2 border-zinc-200 rounded-lg"
          min={5}
          max={50}
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Zorluk</label>
        <select
          value={(meyveli.difficulty as string) || 'Orta'}
          onChange={(e) =>
            onChange({
              ...opts,
              meyveliToplama: { ...meyveli, difficulty: e.target.value },
            })
          }
          className="w-full p-2 border-2 border-zinc-200 rounded-lg"
        >
          <option value="Başlangıç">Başlangıç</option>
          <option value="Orta">Orta</option>
          <option value="Zor">Zor</option>
        </select>
      </div>
    </div>
  );
};

export default MeyveliToplamaConfig;
