import React from 'react';

interface Props {
  options: Record<string, unknown>;
  onChange: (opts: Record<string, unknown>) => void;
}

export const MeyveliToplamaConfig: React.FC<Props> = ({ options, onChange }) => {
  const opts = options as Record<string, unknown>;
  const meyveli = (opts.meyveliToplama || {}) as Record<string, unknown>;

  return (
    <div className="space-y-5 p-4">
      <div className="pb-3 border-b border-zinc-200">
        <h4 className="font-bold text-zinc-800">Meyveli Matematik</h4>
        <p className="text-xs text-zinc-500">Satır ve sütun toplamlarından meyve değerlerini bul</p>
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
          Sayfadaki Bulmaca Sayısı
        </label>
        <select
          value={(meyveli.itemsPerPage as number) || 4}
          onChange={(e) =>
            onChange({
              ...opts,
              meyveliToplama: { ...meyveli, itemsPerPage: Number(e.target.value) },
            })
          }
          className="w-full p-2 border-2 border-zinc-200 rounded-lg"
        >
          <option value={2}>2 Bulmaca (Geniş Format)</option>
          <option value={4}>4 Bulmaca (Standart)</option>
          <option value={6}>6 Bulmaca (Kompakt)</option>
        </select>
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
          <option value={3}>3x3</option>
          <option value={4}>4x4</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Zorluk Seviyesi</label>
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
          <option value="Başlangıç">Başlangıç (3x3, Küçük Sayılar)</option>
          <option value="Orta">Orta (3x3, Orta Sayılar)</option>
          <option value="Zor">Zor (4 Çeşit Meyve, Büyük Sayılar)</option>
        </select>
      </div>
    </div>
  );
};

export default MeyveliToplamaConfig;
