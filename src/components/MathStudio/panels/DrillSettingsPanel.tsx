// Math Studio — Drill Settings Panel (Operations, digits, constraints, layout)

import React from 'react';
import { MathDrillConfig } from '../../../types/math';
import { COLS_MIN, COLS_MAX, COUNT_MIN, COUNT_MAX } from '../constants';
import { clamp } from '../utils';

interface DrillSettingsPanelProps {
  drillConfig: MathDrillConfig;
  setDrillConfig: (config: MathDrillConfig) => void;
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
}) => (
  <div className="p-5 space-y-6 animate-in slide-in-from-left-4">
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
            className={`aspect-square rounded-xl flex items-center justify-center text-lg transition-all border-2 ${drillConfig.selectedOperations.includes(op.id) ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'}`}
          >
            <i className={`fa-solid fa-${op.icon}`}></i>
          </button>
        ))}
      </div>
    </div>

    {/* Constraints Toggles */}
    <div className="space-y-2 p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
      <h4 className="text-[10px] font-black text-accent/70 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i className="fa-solid fa-sliders"></i> Kurallar
      </h4>

      {drillConfig.selectedOperations.includes('add') && (
        <Toggle
          label="Toplama: Eldeli"
          checked={drillConfig.allowCarry}
          onChange={(v) => setDrillConfig({ ...drillConfig, allowCarry: v })}
        />
      )}

      {drillConfig.selectedOperations.includes('sub') && (
        <>
          <Toggle
            label="Çıkarma: Onluk Bozma"
            checked={drillConfig.allowBorrow}
            onChange={(v) => setDrillConfig({ ...drillConfig, allowBorrow: v })}
          />
          <Toggle
            label="Çıkarma: Negatif"
            checked={drillConfig.allowNegative}
            onChange={(v) => setDrillConfig({ ...drillConfig, allowNegative: v })}
          />
        </>
      )}

      {drillConfig.selectedOperations.includes('div') && (
        <Toggle
          label="Bölme: Kalanlı"
          checked={drillConfig.allowRemainder}
          onChange={(v) => setDrillConfig({ ...drillConfig, allowRemainder: v })}
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
            onChange={(e) => setDrillConfig({ ...drillConfig, digit1: Number(e.target.value) })}
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
            onChange={(e) => setDrillConfig({ ...drillConfig, digit2: Number(e.target.value) })}
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
              onChange={(e) => setDrillConfig({ ...drillConfig, digit3: Number(e.target.value) })}
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

    {/* Advanced Toggles */}
    <div className="space-y-2">
      <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
        Gelişmiş
      </h4>
      {[
        { label: '3. Sayı Ekle (Zincir)', key: 'useThirdNumber' as const },
        { label: 'Sayıları Yazıyla Göster', key: 'showTextRepresentation' as const },
        { label: 'Cevap Anahtarı Ekle', key: 'showAnswer' as const },
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
              onChange={(e) => setDrillConfig({ ...drillConfig, [item.key]: e.target.checked })}
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
      <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Düzen</h4>

      <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800">
        <button
          onClick={() => setDrillConfig({ ...drillConfig, orientation: 'vertical' })}
          className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${drillConfig.orientation === 'vertical' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Alt Alta
        </button>
        <button
          onClick={() => setDrillConfig({ ...drillConfig, orientation: 'horizontal' })}
          className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${drillConfig.orientation === 'horizontal' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Yan Yana
        </button>
      </div>

      <Toggle
        label="SAYFAYI TAM DOLDUR (PRO)"
        checked={drillConfig.autoFillPage}
        onChange={(v) => setDrillConfig({ ...drillConfig, autoFillPage: v })}
      />

      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-[9px] text-zinc-500 mb-1.5 font-bold uppercase">
            Sütun Sayısı
          </label>
          <input
            type="number"
            min={COLS_MIN}
            max={COLS_MAX}
            value={drillConfig.cols}
            onChange={(e) =>
              setDrillConfig({
                ...drillConfig,
                cols: clamp(Number(e.target.value), COLS_MIN, COLS_MAX),
              })
            }
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-sm text-white font-bold outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="block text-[9px] text-zinc-500 mb-1.5 font-bold uppercase">
          Yazı Büyüklüğü ({drillConfig.fontSize}px)
        </label>
        <input
          type="range"
          min="14"
          max="48"
          value={drillConfig.fontSize}
          onChange={(e) => setDrillConfig({ ...drillConfig, fontSize: Number(e.target.value) })}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-accent"
        />
      </div>
    </div>
  </div>
);
