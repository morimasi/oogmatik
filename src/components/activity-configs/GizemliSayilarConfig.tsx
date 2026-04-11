import React from 'react';

interface Props {
  options: Record<string, unknown>;
  onChange: (opts: Record<string, unknown>) => void;
}

export const GizemliSayilarConfig: React.FC<Props> = ({ options, onChange }) => {
  const opts = options as Record<string, unknown>;
  const gizemli = (opts.gizemliSayilar || {}) as Record<string, unknown>;

  return (
    <div className="space-y-5 p-4">
      <div className="pb-3 border-b border-zinc-200">
        <h4 className="font-bold text-zinc-800">Gizemli Sayılar</h4>
        <p className="text-xs text-zinc-500">İpuçlarını takip ederek gizli sayıyı bul</p>
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Sayı Aralığı</label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={(gizemli.numberRange as number[])?.[0] || 1}
            onChange={(e) =>
              onChange({
                ...opts,
                gizemliSayilar: {
                  ...gizemli,
                  numberRange: [
                    Number(e.target.value),
                    (gizemli.numberRange as number[])?.[1] || 100,
                  ],
                },
              })
            }
            className="w-20 p-2 border-2 border-zinc-200 rounded-lg text-center font-bold"
            min={1}
            max={500}
          />
          <span className="text-zinc-400">-</span>
          <input
            type="number"
            value={(gizemli.numberRange as number[])?.[1] || 100}
            onChange={(e) =>
              onChange({
                ...opts,
                gizemliSayilar: {
                  ...gizemli,
                  numberRange: [
                    (gizemli.numberRange as number[])?.[0] || 1,
                    Number(e.target.value),
                  ],
                },
              })
            }
            className="w-20 p-2 border-2 border-zinc-200 rounded-lg text-center font-bold"
            min={1}
            max={500}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">İpucu Sayısı</label>
        <input
          type="number"
          min={2}
          max={6}
          value={(gizemli.clueCount as number) || 3}
          onChange={(e) =>
            onChange({
              ...opts,
              gizemliSayilar: { ...gizemli, clueCount: Number(e.target.value) },
            })
          }
          className="w-full p-2 border-2 border-zinc-200 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Zorluk</label>
        <select
          value={(gizemli.difficulty as string) || 'Orta'}
          onChange={(e) =>
            onChange({
              ...opts,
              gizemliSayilar: { ...gizemli, difficulty: e.target.value },
            })
          }
          className="w-full p-2 border-2 border-zinc-200 rounded-lg"
        >
          <option value="Başlangıç">Başlangıç</option>
          <option value="Orta">Orta</option>
          <option value="Zor">Zor</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={(gizemli.includeDigitClue as boolean) ?? true}
            onChange={(e) =>
              onChange({
                ...opts,
                gizemliSayilar: { ...gizemli, includeDigitClue: e.target.checked },
              })
            }
            className="w-4 h-4 accent-indigo-500"
          />
          <span className="text-sm">Rakam toplamı ipucu</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={(gizemli.includeMultiStep as boolean) ?? false}
            onChange={(e) =>
              onChange({
                ...opts,
                gizemliSayilar: { ...gizemli, includeMultiStep: e.target.checked },
              })
            }
            className="w-4 h-4 accent-indigo-500"
          />
          <span className="text-sm">Çok adımlı ipuçları</span>
        </label>
      </div>
    </div>
  );
};

export default GizemliSayilarConfig;
