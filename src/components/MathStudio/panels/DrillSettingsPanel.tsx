// Math Studio — Drill Settings Panel with Presets, Carry Boxes, and ZPD Guides

import React from 'react';
import { MathDrillConfig } from '../../../types/math';

interface DrillSettingsPanelProps {
  drillConfig: MathDrillConfig;
  setDrillConfig: React.Dispatch<React.SetStateAction<MathDrillConfig>>;
  toggleDrillOp: (op: string) => void;
}

// Toggle switch component for reuse
const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({
  label,
  checked,
  onChange,
}) => (
  <label className="flex items-center justify-between cursor-pointer group p-1">
    <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors font-bold">
      {label}
    </span>
    <div
      className={`w-9 h-5 rounded-full relative transition-colors ${checked ? 'bg-accent' : 'bg-zinc-700'}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="hidden"
      />
      <div
        className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${checked ? 'left-5' : 'left-1'}`}
      ></div>
    </div>
  </label>
);

export const DrillSettingsPanel: React.FC<DrillSettingsPanelProps> = ({
  drillConfig,
  setDrillConfig,
  toggleDrillOp,
}) => {
  const canUseThirdNumber = drillConfig.selectedOperations.some(
    (o) => o === 'add' || o === 'sub' || o === 'mixed'
  );

  // Zorluk seviyesi hazır şablonu
  const applyPreset = (preset: 'easy' | 'medium' | 'hard' | 'expert') => {
    if (preset === 'easy') {
      setDrillConfig(prev => ({
        ...prev,
        digit1: 1,
        digit2: 1,
        digit3: 1,
        allowCarry: false,
        allowBorrow: false,
        allowRemainder: false,
        allowNegative: false,
        useThirdNumber: false,
        cols: 4,
        fontSize: 32,
        difficulty: 'Kolay',
      }));
    } else if (preset === 'medium') {
      setDrillConfig(prev => ({
        ...prev,
        digit1: 2,
        digit2: 2,
        digit3: 1,
        allowCarry: true,
        allowBorrow: true,
        allowRemainder: false,
        allowNegative: false,
        cols: 4,
        fontSize: 28,
        difficulty: 'Orta',
      }));
    } else if (preset === 'hard') {
      setDrillConfig(prev => ({
        ...prev,
        digit1: 3,
        digit2: 2,
        digit3: 2,
        allowCarry: true,
        allowBorrow: true,
        allowRemainder: true,
        allowNegative: false,
        useThirdNumber: true,
        cols: 3,
        fontSize: 26,
        difficulty: 'Zor',
      }));
    } else if (preset === 'expert') {
      setDrillConfig(prev => ({
        ...prev,
        digit1: 4,
        digit2: 3,
        digit3: 2,
        allowCarry: true,
        allowBorrow: true,
        allowRemainder: true,
        allowNegative: false,
        useThirdNumber: true,
        cols: 3,
        fontSize: 24,
        difficulty: 'Uzman',
      }));
    }
  };

  return (
    <div className="p-5 space-y-6 animate-in slide-in-from-left-4">
      {/* Quick Difficulty Presets */}
      <div>
        <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block flex items-center justify-between">
          <span>Hızlı Zorluk Şablonları</span>
          <span className="text-accent text-[9px] font-black">{drillConfig.difficulty || 'Özel'}</span>
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: 'easy' as const, label: 'Kolay', color: 'hover:border-emerald-500' },
            { id: 'medium' as const, label: 'Orta', color: 'hover:border-amber-500' },
            { id: 'hard' as const, label: 'Zor', color: 'hover:border-rose-500' },
            { id: 'expert' as const, label: 'Uzman', color: 'hover:border-purple-500' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => applyPreset(item.id)}
              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                drillConfig.difficulty === item.label
                  ? 'bg-accent text-white border-accent shadow-md shadow-accent/20'
                  : `bg-zinc-900 border-zinc-800 text-zinc-400 ${item.color} hover:text-white`
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Operation Select */}
      <div>
        <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">
          İşlem Türleri
        </label>
        <div className="grid grid-cols-5 gap-2">
          {[
            { id: 'add', icon: 'plus', label: '+' },
            { id: 'sub', icon: 'minus', label: '-' },
            { id: 'mult', icon: 'xmark', label: '×' },
            { id: 'div', icon: 'divide', label: '÷' },
            { id: 'mixed', icon: 'shuffle', label: '⚡' },
          ].map((op) => (
            <button
              key={op.id}
              onClick={() => toggleDrillOp(op.id)}
              className={`aspect-square rounded-xl flex items-center justify-center text-lg transition-all border-2 ${
                drillConfig.selectedOperations.includes(op.id)
                  ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
              }`}
            >
              <i className={`fa-solid fa-${op.icon}`}></i>
            </button>
          ))}
        </div>
      </div>

      {/* Constraints Toggles */}
      <div className="space-y-2 p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
        <h4 className="text-[10px] font-black text-accent/70 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i className="fa-solid fa-sliders"></i> Aritmetik Kurallar
        </h4>

        {drillConfig.selectedOperations.includes('add') && (
          <Toggle
            label="Toplama: Eldeli"
            checked={drillConfig.allowCarry}
            onChange={(v) => setDrillConfig(prev => ({ ...prev, allowCarry: v }))}
          />
        )}

        {drillConfig.selectedOperations.includes('sub') && (
          <>
            <Toggle
              label="Çıkarma: Onluk Bozma"
              checked={drillConfig.allowBorrow}
              onChange={(v) => setDrillConfig(prev => ({ ...prev, allowBorrow: v }))}
            />
            <Toggle
              label="Çıkarma: Negatif"
              checked={drillConfig.allowNegative}
              onChange={(v) => setDrillConfig(prev => ({ ...prev, allowNegative: v }))}
            />
          </>
        )}

        {drillConfig.selectedOperations.includes('div') && (
          <Toggle
            label="Bölme: Kalanlı"
            checked={drillConfig.allowRemainder}
            onChange={(v) => setDrillConfig(prev => ({ ...prev, allowRemainder: v }))}
          />
        )}
      </div>

      {/* Digits Control */}
      <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <h4 className="text-[10px] font-black text-accent/70 uppercase tracking-widest mb-3">
          Basamak Sayısı
        </h4>
        <div className={`grid ${drillConfig.useThirdNumber ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
          <div>
            <label className="block text-[9px] text-zinc-500 mb-1 font-bold uppercase">1. Sayı</label>
            <select
              value={drillConfig.digit1}
              onChange={(e) => setDrillConfig(prev => ({ ...prev, digit1: Number(e.target.value) }))}
              className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none focus:border-accent font-bold"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} B.
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-zinc-500 mb-1 font-bold uppercase">2. Sayı</label>
            <select
              value={drillConfig.digit2}
              onChange={(e) => setDrillConfig(prev => ({ ...prev, digit2: Number(e.target.value) }))}
              className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none focus:border-accent font-bold"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} B.
                </option>
              ))}
            </select>
          </div>
          {drillConfig.useThirdNumber && (
            <div className="animate-in fade-in slide-in-from-left-2">
              <label className="block text-[9px] text-zinc-500 mb-1 font-bold uppercase">
                3. Sayı
              </label>
              <select
                value={drillConfig.digit3}
                onChange={(e) => setDrillConfig(prev => ({ ...prev, digit3: Number(e.target.value) }))}
                className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none focus:border-accent font-bold"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} B.
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Neuro-Pedagogical & Advanced Helpers */}
      <div className="space-y-2 p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i className="fa-solid fa-wand-magic-sparkles"></i> Pedagojik Kılavuzlar
        </h4>
        <Toggle
          label="Elde / Onluk Kutusu (Disleksi & Diskalkuli)"
          checked={Boolean(drillConfig.showCarryBoxes)}
          onChange={(v) => setDrillConfig(prev => ({ ...prev, showCarryBoxes: v }))}
        />
        <Toggle
          label="Dikey Basamak Hizalama Kılavuzu"
          checked={Boolean(drillConfig.showGridGuides)}
          onChange={(v) => setDrillConfig(prev => ({ ...prev, showGridGuides: v }))}
        />
      </div>

      {/* Advanced Toggles */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
          Gelişmiş Seçenekler
        </h4>
        {[
          ...(canUseThirdNumber
            ? [{ label: '3. Sayı Ekle (Zincir İşlem)', key: 'useThirdNumber' as const }]
            : []),
          { label: 'Sayıları Türkçe Okunuşuyla Göster', key: 'showTextRepresentation' as const },
          { label: 'Cevap Anahtarını Sayfaya Ekle', key: 'showAnswer' as const },
        ].map((item) => (
          <label
            key={item.key}
            className="flex items-center justify-between cursor-pointer group bg-zinc-900 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <span className="text-xs text-zinc-300 font-bold group-hover:text-white transition-colors">
              {item.label}
            </span>
            <div
              className={`w-9 h-5 rounded-full relative transition-colors ${drillConfig[item.key] ? 'bg-accent' : 'bg-zinc-700'}`}
            >
              <input
                type="checkbox"
                checked={drillConfig[item.key] as boolean}
                onChange={(e) => setDrillConfig(prev => ({ ...prev, [item.key]: e.target.checked }))}
                className="hidden"
              />
              <div
                className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${drillConfig[item.key] ? 'left-5' : 'left-1'}`}
              ></div>
            </div>
          </label>
        ))}
      </div>

      {/* Layout & Style */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">A4 Düzen & Ergonomi</h4>

        <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800">
          <button
            onClick={() => setDrillConfig(prev => ({ ...prev, orientation: 'vertical' }))}
            className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
              drillConfig.orientation === 'vertical' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Alt Alta
          </button>
          <button
            onClick={() => setDrillConfig(prev => ({ ...prev, orientation: 'horizontal' }))}
            className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
              drillConfig.orientation === 'horizontal' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Yan Yana
          </button>
        </div>

        {/* Auto-fill indicator */}
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <i className="fa-solid fa-check-circle text-emerald-400 text-sm"></i>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
            A4 Sayfasına Otomatik Dolum Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-[9px] text-zinc-500 mb-1.5 font-bold uppercase">
              Sütun Sayısı: {drillConfig.cols}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  onClick={() => setDrillConfig(prev => ({ ...prev, cols: n }))}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all border ${
                    drillConfig.cols === n
                      ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[9px] text-zinc-500 mb-1.5 font-bold uppercase">
              Yazı Büyüklüğü ({drillConfig.fontSize}px)
            </label>
            <input
              type="range"
              min="14"
              max="48"
              value={drillConfig.fontSize}
              onChange={(e) => setDrillConfig(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>

          <div>
            <label className="block text-[9px] text-zinc-500 mb-1.5 font-bold uppercase flex justify-between">
              <span>Soru Aralık Boşluğu ({drillConfig.gap}px)</span>
              <span className="text-accent">{drillConfig.gap}px</span>
            </label>
            <input
              type="range"
              min="4"
              max="40"
              step="2"
              value={drillConfig.gap}
              onChange={(e) => setDrillConfig(prev => ({ ...prev, gap: Number(e.target.value) }))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>

          <div>
            <label className="block text-[9px] text-zinc-500 mb-1.5 font-bold uppercase flex justify-between">
              <span>Yazı Tipi Kalınlığı</span>
              <span className="text-accent">{drillConfig.fontWeight}</span>
            </label>
            <input
              type="range"
              min="100"
              max="800"
              step="100"
              value={drillConfig.fontWeight}
              onChange={(e) => setDrillConfig(prev => ({ ...prev, fontWeight: Number(e.target.value) }))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
