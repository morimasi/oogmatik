import React from 'react';
import { GeneratorOptions } from '../../types';

interface Props {
  options: GeneratorOptions;
  onChange: (key: keyof GeneratorOptions, value: unknown) => void;
}

export const OddEvenSudokuConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options as any).oddEvenSudoku || {};

  const update = (updates: Record<string, unknown>) => {
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

  const update = (updates: Record<string, unknown>) => {
    onChange('capsuleGame' as any, { ...o, ...updates });
  };

  return (
    <div className="space-y-6 p-4">
      <div className="pb-3 border-b border-zinc-100">
        <h4 className="font-black text-emerald-900 uppercase tracking-tight text-lg flex items-center gap-2">
          <i className="fa-solid fa-capsules text-emerald-500"></i> Kapsül Oyunu Pro
        </h4>
        <p className="text-[10px] text-zinc-500 font-medium">Bölge matrisleri, 4 temel işlem ve A4 tam dolgu bulmacaları</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">Matris Boyutu</label>
          <select
            value={(o.gridSize as number) || 4}
            onChange={(e) => update({ gridSize: Number(e.target.value) })}
            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl p-2.5 text-sm font-bold focus:border-emerald-500 transition-colors"
          >
            <option value={3}>3x3 (Mini - Kolay)</option>
            <option value={4}>4x4 (Standart - Orta)</option>
            <option value={5}>5x5 (Zorlu - İleri)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">A4 Bulmaca Sayısı</label>
          <select
            value={(o.puzzleCount as number) || 2}
            onChange={(e) => update({ puzzleCount: Number(e.target.value) })}
            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl p-2.5 text-sm font-bold focus:border-emerald-500 transition-colors"
          >
            <option value={1}>1 Büyük Bulmaca (Tek)</option>
            <option value={2}>2 Bulmaca (Standart Dolgu)</option>
            <option value={4}>4 Bulmaca (Tam Kompakt A4)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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

        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">İşlem Türü</label>
          <select
            value={(o.operation as string) || 'addition'}
            onChange={(e) => update({ operation: e.target.value })}
            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl p-2.5 text-sm font-bold focus:border-emerald-500 transition-colors"
          >
            <option value="addition">Toplama (+)</option>
            <option value="subtraction">Çıkarma (-)</option>
            <option value="multiplication">Çarpma (×)</option>
            <option value="division">Bölme (÷)</option>
          </select>
        </div>
      </div>

      <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
        <h5 className="text-[10px] font-black text-emerald-800 uppercase mb-3 tracking-widest flex items-center gap-1.5">
          <i className="fa-solid fa-palette"></i> Ultra Premium Tema Modları
        </h5>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'crystal', label: 'Kristal', color: 'bg-indigo-600' },
            { id: 'galaxy', label: 'Galaksi', color: 'bg-purple-600' },
            { id: 'antique', label: 'Antik', color: 'bg-amber-700' },
            { id: 'neon', label: 'Neon', color: 'bg-emerald-500' },
            { id: 'cyber', label: 'Siber', color: 'bg-cyan-500' },
            { id: 'forest', label: 'Orman', color: 'bg-emerald-700' },
          ].map(theme => (
            <button
              key={theme.id}
              onClick={() => update({ aestheticMode: theme.id })}
              className={`py-2 px-2 rounded-xl text-[10px] font-black uppercase border-2 flex items-center justify-center gap-1.5 transition-all ${(o.aestheticMode || 'crystal') === theme.id
                ? `${theme.color} border-transparent text-white shadow-md scale-105`
                : 'bg-white border-zinc-200 text-zinc-600 hover:border-emerald-300'
                }`}
            >
              <span className={`w-2 h-2 rounded-full ${theme.color}`}></span>
              <span>{theme.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const MagicPyramidConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options as any).magicPyramid || {};

  const update = (updates: Record<string, unknown>) => {
    onChange('magicPyramid' as any, { ...o, ...updates });
  };

  return (
    <div className="space-y-6 p-4">
      <div className="pb-3 border-b border-zinc-100">
        <h4 className="font-black text-amber-900 uppercase tracking-tight text-lg flex items-center gap-2">
          <i className="fa-solid fa-pyramid text-amber-500"></i> Sihirli Piramit Pro
        </h4>
        <p className="text-[10px] text-zinc-500 font-medium">Ultra premium ritmik sayma, toplama, çarpma ve mantık piramidi</p>
      </div>

      {/* Etkinlik Modu */}
      <div>
        <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">Piramit Mantık Modu</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'rhythmic', label: 'Ritmik Sayma', icon: 'arrow-down-1-9' },
            { id: 'addition', label: 'Toplama Piramidi', icon: 'plus' },
            { id: 'multiplication', label: 'Çarpma / Kat', icon: 'xmark' },
            { id: 'prime', label: 'Asal Sayı Yolu', icon: 'shield-halved' },
            { id: 'even_odd', label: 'Çift Sayı Yolu', icon: 'hashtag' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => update({ mode: mode.id })}
              className={`p-2.5 rounded-xl border-2 font-bold text-xs flex items-center gap-2 transition-all ${(o.mode || 'rhythmic') === mode.id
                ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-200'
                : 'bg-zinc-50 border-zinc-100 text-zinc-600 hover:border-amber-200'
                }`}
            >
              <i className={`fa-solid fa-${mode.icon} text-sm`}></i>
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
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

        {(o.mode || 'rhythmic') === 'rhythmic' && (
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
              <option value={6}>6'şar sayma</option>
              <option value={7}>7'şer sayma</option>
              <option value={8}>8'er sayma</option>
              <option value={9}>9'ar sayma</option>
              <option value={10}>10'ar sayma</option>
            </select>
          </div>
        )}
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-2">
        <label className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-xl cursor-pointer border border-amber-100/50 hover:bg-amber-50 transition-colors">
          <input
            type="checkbox"
            checked={Boolean(o.showHints ?? true)}
            onChange={(e) => update({ showHints: e.target.checked })}
            className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 border-zinc-300"
          />
          <span className="text-sm font-bold text-amber-950">
            İpucu İpuçlarını Göster
            <span className="block text-[10px] text-amber-600 font-normal">Başlangıç ve kilit sayı noktalarını vurgular.</span>
          </span>
        </label>

        <label className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-xl cursor-pointer border border-amber-100/50 hover:bg-amber-50 transition-colors">
          <input
            type="checkbox"
            checked={Boolean(o.compactLayout ?? true)}
            onChange={(e) => update({ compactLayout: e.target.checked })}
            className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 border-zinc-300"
          />
          <span className="text-sm font-bold text-amber-950">
            A4 Tam Dolgu (Kompakt Ultra Yerleşim)
            <span className="block text-[10px] text-amber-600 font-normal">Kâğıdı 4-6 piramitle boşluksuz ve sıfır taşmayla doldurur.</span>
          </span>
        </label>
      </div>

      <div>
        <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">Arka Plan Teması</label>
        <div className="flex gap-2">
          {['classic', 'forest', 'desert', 'ocean'].map(t => (
            <button
              key={t}
              onClick={() => update({ theme: t })}
              className={`flex-1 py-3 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${(o.theme || 'classic') === t
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
