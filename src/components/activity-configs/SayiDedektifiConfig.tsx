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
      <div className="pb-3 border-b border-[var(--border-color)]">
        <h4 className="font-bold text-zinc-800">Sayı Dedektifi</h4>
        <p className="text-xs text-[var(--text-muted)]">İpuçlarını takip ederek sayıyı bul</p>
      </div>
      <div>
        <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Zorluk</label>
        <select
          value={(dedek.difficulty as string) || 'Orta'}
          onChange={(e) =>
            onChange({ ...opts, sayiDedektifi: { ...dedek, difficulty: e.target.value } })
          }
          className="w-full p-2 border-2 border-[var(--border-color)] rounded-lg text-sm font-bold outline-none focus:border-[var(--accent-color)]"
        >
          <option value="Başlangıç">Başlangıç (1-20)</option>
          <option value="Orta">Orta (10-100)</option>
          <option value="Zor">Zor (50-500)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Bulmaca Sayısı (Sayfa Başı)</label>
        <select
          value={(opts.puzzleCount as number) || 6}
          onChange={(e) =>
            onChange({ ...opts, puzzleCount: parseInt(e.target.value) })
          }
          className="w-full p-2 border-2 border-[var(--border-color)] rounded-lg text-sm font-bold outline-none focus:border-[var(--accent-color)]"
        >
          <option value={4}>4 Kart (Daha Geniş)</option>
          <option value={6}>6 Kart (Kompakt)</option>
          <option value={8}>8 Kart (Yoğun)</option>
        </select>
      </div>
    </div>
  );
};

export default SayiDedektifiConfig;
