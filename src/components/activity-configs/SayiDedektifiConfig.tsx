import React from 'react';

interface Props {
  options: Record<string, unknown>;
  onChange: (opts: Record<string, unknown>) => void;
}

export const SayiDedektifiConfig: React.FC<Props> = ({ options, onChange }) => {
  const opts = options as Record<string, unknown>;
  const dedek = (opts.sayiDedektifi || {}) as Record<string, unknown>;

  return (
    <div className="space-y-5 p-4">
      <div className="pb-3 border-b border-zinc-200">
        <h4 className="font-bold text-zinc-800">Sayı Dedektifi</h4>
        <p className="text-xs text-zinc-500">İpuçlarını takip ederek sayıyı bul</p>
      </div>
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Zorluk</label>
        <select
          value={(dedek.difficulty as string) || 'Orta'}
          onChange={(e) =>
            onChange({ ...opts, sayiDedektifi: { ...dedek, difficulty: e.target.value } })
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

export default SayiDedektifiConfig;
