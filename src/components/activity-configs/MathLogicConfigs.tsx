import React from 'react';

interface Props {
  options: GeneratorOptions;
  onChange: (key: keyof GeneratorOptions, value: unknown) => void;
}

export const OddEvenSudokuConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options as any).oddEvenSudoku || {};
  
  const update = (updates: Record<string, any>) => {
    onChange('oddEvenSudoku' as any, { ...o, ...updates });
  };

  return (
    <div className="space-y-6 p-4">
      <div className="pb-3 border-b border-zinc-100">
        <h4 className="font-black text-indigo-900 uppercase tracking-tight text-lg">Tek / Çift Sudoku</h4>
        <p className="text-[10px] text-zinc-500 font-medium">Mantık ve sayı kısıtlamalı ultra premium sudoku</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">Grid Boyutu</label>
          <select
            value={(o.gridSize as number) || 4}
            onChange={(e) => update({ gridSize: Number(e.target.value) })}
            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl p-2.5 text-sm font-bold focus:border-indigo-500 transition-colors"
          >
            <option value={4}>4x4 (Standart)</option>
            <option value={6}>6x6 (Düşündürücü)</option>
            <option value={9}>9x9 (Uzman)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">Görsel Stil</label>
          <select
            value={(o.aestheticMode as string) || 'premium'}
            onChange={(e) => update({ aestheticMode: e.target.value })}
            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl p-2.5 text-sm font-bold focus:border-indigo-500 transition-colors"
          >
            <option value="standard">Standart</option>
            <option value="premium">Premium Glass</option>
            <option value="high-contrast">Yüksek Kontrast</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <label className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl cursor-pointer border border-indigo-100/50 hover:bg-indigo-50 transition-colors">
          <input
            type="checkbox"
            checked={Boolean(o.showPositionNumbers ?? true)}
            onChange={(e) => update({ showPositionNumbers: e.target.checked })}
            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300"
          />
          <span className="text-sm font-bold text-indigo-900">
            Klavuz Numaraları Göster
            <span className="block text-[10px] text-indigo-400 font-normal">Zorluğu azaltmak için koordinat ekler.</span>
          </span>
        </label>
      </div>
    </div>
  );
};

export const CapsuleGameConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options as any).capsuleGame || {};

  const update = (updates: Record<string, any>) => {
    onChange('capsuleGame' as any, { ...o, ...updates });
  };

  return (
    <div className="space-y-6 p-4">
      <div className="pb-3 border-b border-zinc-100">
        <h4 className="font-black text-emerald-900 uppercase tracking-tight text-lg">Kapsül Oyunu</h4>
        <p className="text-[10px] text-zinc-500 font-medium">Bölge toplamları ve matris mantığı</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">Matris Boyutu</label>
          <select
            value={(o.gridSize as number) || 4}
            onChange={(e) => update({ gridSize: Number(e.target.value) })}
            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl p-2.5 text-sm font-bold focus:border-emerald-500 transition-colors"
          >
            <option value={3}>3x3 (Başlangıç)</option>
            <option value={4}>4x4 (Orta Seviye)</option>
            <option value={5}>5x5 (Zorlu)</option>
            <option value={7}>7x7 (İleri Düzey)</option>
            <option value={10}>10x10 (Profesyonel)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">Sayı Seti</label>
          <select
            value={(o.numberSet as string) || 'mixed'}
            onChange={(e) => update({ numberSet: e.target.value })}
            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl p-2.5 text-sm font-bold focus:border-emerald-500 transition-colors"
          >
            <option value="mixed">Karışık (1-10)</option>
            <option value="even">Sadece Çiftler</option>
            <option value="odd">Sadece Tekler</option>
            <option value="prime">Asal Sayılar</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">İşlem Seti</label>
          <div className="flex gap-2">
            {[
              { id: 'addition', label: 'Toplama', icon: 'plus' },
              { id: 'subtraction', label: 'Çıkarma', icon: 'minus' },
              { id: 'multiplication', label: 'Çarpma', icon: 'xmark' },
              { id: 'division', label: 'Bölme', icon: 'divide' }
            ].map(op => (
              <button
                key={op.id}
                onClick={() => update({ operation: op.id })}
                className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl border-2 transition-all ${
                  (o.operation || 'addition') === op.id 
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' 
                  : 'bg-white border-zinc-100 text-zinc-400 hover:border-emerald-200'
                }`}
              >
                <i className={`fa-solid fa-${op.icon} text-sm mb-1`}></i>
                <span className="text-[9px] font-bold">{op.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
        <h5 className="text-[10px] font-black text-emerald-800 uppercase mb-3 tracking-widest">Tema Modları</h5>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'crystal', label: 'Kristal' },
            { id: 'galaxy', label: 'Galaksi' },
            { id: 'antique', label: 'Antik' }
          ].map(theme => (
            <button
              key={theme.id}
              onClick={() => update({ aestheticMode: theme.id })}
              className={`py-2 px-1 rounded-lg text-[10px] font-black uppercase border-2 transition-all ${
                (o.aestheticMode || 'crystal') === theme.id 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105' 
                : 'bg-white border-zinc-100 text-zinc-400 hover:border-emerald-200'
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const MagicPyramidConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options as any).magicPyramid || {};

  const update = (updates: Record<string, any>) => {
    onChange('magicPyramid' as any, { ...o, ...updates });
  };

  return (
    <div className="space-y-6 p-4">
      <div className="pb-3 border-b border-zinc-100">
        <h4 className="font-black text-amber-900 uppercase tracking-tight text-lg">Sihirli Piramit</h4>
        <p className="text-[10px] text-zinc-500 font-medium">Ritmik sayma ve görsel takip labirenti</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">Katman Sayısı</label>
          <select
            value={(o.layers as number) || 5}
            onChange={(e) => update({ layers: Number(e.target.value) })}
            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl p-2.5 text-sm font-bold focus:border-amber-500 transition-colors"
          >
            <option value={4}>4 Katman (Mini)</option>
            <option value={5}>5 Katman (Standart)</option>
            <option value={6}>6 Katman (Mega)</option>
            <option value={7}>7 Katman (Giga)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">Sayma Adımı</label>
          <select
            value={(o.step as number) || 2}
            onChange={(e) => update({ step: Number(e.target.value) })}
            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl p-2.5 text-sm font-bold focus:border-amber-500 transition-colors"
          >
            <option value={1}>1'er sayma</option>
            <option value={2}>2'şer sayma</option>
            <option value={3}>3'er sayma</option>
            <option value={4}>4'er sayma</option>
            <option value={5}>5'er sayma</option>
            <option value={10}>10'ar sayma</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">Arka Plan Teması</label>
        <div className="flex gap-2">
          {['classic', 'forest', 'desert', 'ocean'].map(t => (
            <button
              key={t}
              onClick={() => update({ theme: t })}
              className={`flex-1 py-3 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${
                (o.theme || 'classic') === t
                ? 'bg-amber-500 border-amber-500 text-white shadow-lg'
                : 'bg-zinc-50 border-zinc-100 text-zinc-400'
              }`}
            >
              {t === 'classic' ? 'Kum' : t === 'forest' ? 'Orman' : t === 'desert' ? 'Güneş' : 'Buz'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
