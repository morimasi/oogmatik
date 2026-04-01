import React from 'react';
import { TemplateSettingsProps } from '../registry';
import { DilBilgisiSettings } from './types';

export const DilBilgisiSettingsPanel: React.FC<TemplateSettingsProps<DilBilgisiSettings>> = ({
  settings,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Ayna Harfler
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {(['b-d', 'p-q', 'm-n', 'none'] as const).map((pair) => (
              <button
                key={pair}
                onClick={() => onChange({ targetDistractors: pair })}
                className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all ${
                  settings.targetDistractors === pair
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/20'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {pair === 'none' ? 'Yok' : pair.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Grid Boyutu
          </label>
          <select
            value={settings.gridSize}
            onChange={(e) =>
              onChange({ gridSize: e.target.value as DilBilgisiSettings['gridSize'] })
            }
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="none">Tablo Yok</option>
            <option value="3x3">3×3</option>
            <option value="4x4">4×4</option>
            <option value="5x5">5×5</option>
            <option value="6x6">6×6</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Soru: {(settings as unknown as Record<string, number>).questionCount}
          </label>
          <input
            type="range"
            min="3"
            max="20"
            value={(settings as unknown as Record<string, number>).questionCount}
            onChange={(e) =>
              onChange({ questionCount: parseInt(e.target.value) } as Partial<DilBilgisiSettings>)
            }
            className="w-full accent-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Görev: {(settings as unknown as Record<string, number>).taskCount}
          </label>
          <input
            type="range"
            min="3"
            max="8"
            value={(settings as unknown as Record<string, number>).taskCount}
            onChange={(e) =>
              onChange({ taskCount: parseInt(e.target.value) } as Partial<DilBilgisiSettings>)
            }
            className="w-full accent-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Kelime: {(settings as unknown as Record<string, number>).wordCount}
          </label>
          <input
            type="range"
            min="5"
            max="25"
            value={(settings as unknown as Record<string, number>).wordCount}
            onChange={(e) =>
              onChange({ wordCount: parseInt(e.target.value) } as Partial<DilBilgisiSettings>)
            }
            className="w-full accent-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Yerleşim Yoğunluğu
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {(['standart', 'yogun', 'ultra-yogun'] as const).map((d) => (
            <button
              key={d}
              onClick={() => onChange({ layoutDensity: d })}
              className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all ${
                (settings as unknown as Record<string, string>).layoutDensity === d
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {d === 'standart' ? 'Standart' : d === 'yogun' ? 'Yoğun' : 'Ultra Yoğun'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { key: 'syllableSimulation', label: 'Heceleme', desc: '[He-ce-le-me] modu', icon: '🔤' },
          { key: 'camouflageGrid', label: 'Kamuflaj Grid', desc: 'Harfleri gizle', icon: '🔍' },
          { key: 'hintBox', label: 'İpucu Kutusu', desc: 'Kural hatırlatıcı', icon: '💡' },
          {
            key: 'includeAnswerKey',
            label: 'Cevap Anahtarı',
            desc: 'Sayfa sonuna ekle',
            icon: '🔑',
          },
          { key: 'includeWordChain', label: 'Kelime Zinciri', desc: 'Zincir oyunu', icon: '🔗' },
          {
            key: 'includeErrorDetective',
            label: 'Hata Dedektifi',
            desc: 'Hatalı bulma',
            icon: '🕵️',
          },
          { key: 'includeBonusSection', label: 'Bonus Bölüm', desc: 'Ek etkinlik', icon: '⭐' },
        ].map(({ key, label, desc, icon }) => (
          <label
            key={key}
            className="flex items-start gap-2.5 cursor-pointer p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:bg-slate-700/40 hover:border-slate-600 transition-all group"
          >
            <input
              type="checkbox"
              checked={Boolean((settings as unknown as Record<string, unknown>)[key])}
              onChange={(e) => onChange({ [key]: e.target.checked } as Partial<DilBilgisiSettings>)}
              className="form-checkbox text-blue-500 rounded h-4 w-4 bg-slate-900 border-slate-700 mt-0.5 flex-shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-slate-200 font-semibold group-hover:text-blue-300 transition-colors leading-tight">
                {icon} {label}
              </span>
              <span className="text-[10px] text-slate-500 leading-tight">{desc}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default DilBilgisiSettingsPanel;
