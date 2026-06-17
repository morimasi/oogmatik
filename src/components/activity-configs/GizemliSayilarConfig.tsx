import React from 'react';

interface Props {
  options: Record<string, unknown>;
  onChange: (opts: Record<string, unknown>) => void;
}

export const GizemliSayilarConfig: React.FC<Props> = ({ options, onChange }) => {
  const opts = options as Record<string, unknown>;
  const gizemli = (opts.numberLogicRiddles || {}) as Record<string, unknown>;

  const update = (updates: Record<string, any>) => {
    onChange({
      ...opts,
      numberLogicRiddles: { ...gizemli, ...updates }
    });
  };

  return (
    <div className="space-y-6 p-4">
      <div className="pb-3 border-b border-zinc-100">
        <h4 className="font-black text-indigo-900 uppercase tracking-tight text-lg">Gizemli Sayılar</h4>
        <p className="text-[10px] text-zinc-500 font-medium">Sayısal muhakeme ve çıkarım atölyesi</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">Soru Sayısı</label>
          <input
            type="number"
            min={1}
            max={12}
            value={(gizemli.itemCount as number) || 6}
            onChange={(e) => update({ itemCount: Number(e.target.value) })}
            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl p-2.5 text-sm font-bold focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">İpucu Sayısı</label>
          <select
            value={(gizemli.gridSize as number) || 3}
            onChange={(e) => update({ gridSize: Number(e.target.value) })}
            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl p-2.5 text-sm font-bold focus:border-indigo-500"
          >
            <option value={2}>2 İpucu (Kolay)</option>
            <option value={3}>3 İpucu (Orta)</option>
            <option value={4}>4 İpucu (Zor)</option>
            <option value={5}>5 İpucu (Uzman)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">Görsel Tema</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'standard', label: 'Standart' },
              { id: 'detective', label: 'Dedektif' },
              { id: 'neon', label: 'Neon Gece' },
              { id: 'cyber', label: 'Cyberpunk' }
            ].map(theme => (
              <button
                key={theme.id}
                onClick={() => update({ aestheticMode: theme.id })}
                className={`py-2 px-3 rounded-xl border-2 text-[11px] font-black uppercase transition-all ${
                  (gizemli.aestheticMode || 'standard') === theme.id 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'bg-white border-zinc-100 text-zinc-400 hover:border-indigo-200'
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors">
          <input
            type="checkbox"
            checked={(gizemli.showIcons as boolean) !== false}
            onChange={(e) => update({ showIcons: e.target.checked })}
            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300"
          />
          <span className="text-sm font-bold text-zinc-700">İkonları Göster</span>
        </label>
        <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors">
          <input
            type="checkbox"
            checked={(gizemli.showVisualDistraction as boolean) !== false}
            onChange={(e) => update({ showVisualDistraction: e.target.checked })}
            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300"
          />
          <span className="text-sm font-bold text-zinc-700">Çeldirici Sayılar Ekle</span>
        </label>
      </div>
    </div>
  );
};

export default GizemliSayilarConfig;

export default GizemliSayilarConfig;
