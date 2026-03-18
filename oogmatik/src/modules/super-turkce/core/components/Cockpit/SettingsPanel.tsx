/**
 * 2.2 ŞARTLI AYARLAR PANELİ (Settings Panel)
 * 
 * Seçilen her bileşen için dinamik form render sistemi.
 * Tip bazlı widget'lar (number, select, toggle, range).
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActivityFormatDef, SettingDef } from '../../types/activity-formats';

interface SettingsPanelProps {
  format: ActivityFormatDef;
  settings: Record<string, any>;
  onSettingChange: (key: string, value: any) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  format,
  settings,
  onSettingChange,
}) => {
  if (!format.settings || format.settings.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="mt-3 border-t border-brand-200/50 pt-3"
    >
      <div className="bg-gradient-to-br from-white to-brand-50/30 rounded-xl p-4 border border-brand-100 shadow-sm">
        <label className="text-[11px] font-bold text-brand-600 uppercase tracking-wide mb-3 block">
          <i className="fa-solid fa-sliders mr-1.5"></i>
          {format.label} - İnce Ayarlar
        </label>

        <div className="space-y-3">
          {format.settings.map((setting: SettingDef, idx: number) => (
            <SettingWidget
              key={idx}
              setting={setting}
              value={settings[setting.key] ?? setting.defaultValue}
              onChange={(value) => onSettingChange(setting.key, value)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// AYAR WIDGET'LARI (Setting Widgets)
// ============================================

interface SettingWidgetProps {
  setting: SettingDef;
  value: any;
  onChange: (value: any) => void;
}

const SettingWidget: React.FC<SettingWidgetProps> = ({ setting, value, onChange }: SettingWidgetProps) => {
  switch (setting.type) {
    case 'toggle':
      return <ToggleWidget setting={setting} value={!!value} onChange={onChange} />;
    case 'select':
      return <SelectWidget setting={setting} value={value} onChange={onChange} />;
    case 'range':
      return <RangeWidget setting={setting} value={Number(value)} onChange={onChange} />;
    case 'number':
      return <NumberWidget setting={setting} value={Number(value)} onChange={onChange} />;
    default:
      return null;
  }
};

// ============================================
// TOGGLE WIDGET
// ============================================

const ToggleWidget: React.FC<SettingWidgetProps> = ({ setting, value, onChange }: SettingWidgetProps) => {
  return (
    <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-200">
      <label className="text-xs font-semibold text-slate-700">{setting.label}</label>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-brand-500' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

// ============================================
// SELECT WIDGET
// ============================================

const SelectWidget: React.FC<SettingWidgetProps> = ({ setting, value, onChange }: SettingWidgetProps) => {
  if (!setting.options || setting.options.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-500 uppercase">{setting.label}</label>
      <select
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-brand-500 transition-all font-medium"
      >
        {setting.options.map((opt: string, idx: number) => (
          <option key={idx} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

// ============================================
// RANGE WIDGET
// ============================================

const RangeWidget: React.FC<SettingWidgetProps> = ({ setting, value, onChange }: SettingWidgetProps) => {
  const min = setting.min ?? 1;
  const max = setting.max ?? 10;
  const step = setting.step ?? 1;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500 uppercase">{setting.label}</label>
        <span className="text-sm font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md min-w-[2rem] text-center">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
      />
      <div className="flex justify-between text-[9px] text-slate-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

// ============================================
// NUMBER WIDGET
// ============================================

const NumberWidget: React.FC<SettingWidgetProps> = ({ setting, value, onChange }: SettingWidgetProps) => {
  const min = setting.min ?? 0;
  const max = setting.max ?? 100;

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-500 uppercase">{setting.label}</label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-bold transition-colors"
        >
          <i className="fa-solid fa-minus text-xs"></i>
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-8 text-center bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-brand-500"
        />
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-bold transition-colors"
        >
          <i className="fa-solid fa-plus text-xs"></i>
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
