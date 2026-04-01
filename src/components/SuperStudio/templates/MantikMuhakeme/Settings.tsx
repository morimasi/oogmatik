import React from 'react';
import { TemplateSettingsProps } from '../registry';
import { MantikMuhakemeSettings } from './types';

export const MantikMuhakemeSettingsPanel: React.FC<
  TemplateSettingsProps<MantikMuhakemeSettings>
> = ({ settings, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Sıralama Adımı: {(settings as unknown as Record<string, number>).sequenceSteps}
          </label>
          <input
            type="range"
            min="3"
            max="8"
            value={(settings as unknown as Record<string, number>).sequenceSteps}
            onChange={(e) =>
              onChange({
                sequenceSteps: parseInt(e.target.value),
              } as Partial<MantikMuhakemeSettings>)
            }
            className="w-full accent-indigo-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Matris Boyutu
          </label>
          <select
            value={settings.matrixSize}
            onChange={(e) =>
              onChange({ matrixSize: e.target.value as MantikMuhakemeSettings['matrixSize'] })
            }
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent outline-none"
            <option value="3x4">3×4</option>
            <option value="4x4">4×4</option>
            <option value="5x5">5×5</option>
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
              onChange({
                questionCount: parseInt(e.target.value),
              } as Partial<MantikMuhakemeSettings>)
            }
            className="w-full accent-indigo-500"
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
              onChange({ taskCount: parseInt(e.target.value) } as Partial<MantikMuhakemeSettings>)
            }
            className="w-full accent-indigo-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Karmaşıklık
          </label>
          <select
            value={settings.storyComplexity}
            onChange={(e) =>
              onChange({
                storyComplexity: e.target.value as MantikMuhakemeSettings['storyComplexity'],
              })
            }
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="Kolay">Kolay</option>
            <option value="Orta">Orta</option>
            <option value="Zor">Zor</option>
          </select>
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
                  ? 'bg-accent border-accent/60 text-white shadow-lg'
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
          { key: 'logicMatrix', label: 'Mantık Matrisi', desc: 'Sudoku tarzı tablo', icon: '🧩' },
          {
            key: 'detailDetective',
            label: 'Detay Dedektifi',
            desc: 'Mantık hatası bul',
            icon: '🔍',
          },
          {
            key: 'includePatternCompletion',
            label: 'Örüntü Tamamlama',
            desc: 'Desen devam ettir',
            icon: '🔄',
          },
          {
            key: 'includeCausalReasoning',
            label: 'Nedensel Akıl Yürütme',
            desc: 'Sebep-sonuç',
            icon: '🔗',
          },
          {
            key: 'includeAnswerKey',
            label: 'Cevap Anahtarı',
            desc: 'Sayfa sonuna ekle',
            icon: '🔑',
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
              onChange={(e) =>
                onChange({ [key]: e.target.checked } as Partial<MantikMuhakemeSettings>)
              }
              className="form-checkbox text-indigo-500 rounded h-4 w-4 bg-slate-900 border-slate-700 mt-0.5 flex-shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-slate-200 font-semibold group-hover:text-indigo-300 transition-colors leading-tight">
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

export default MantikMuhakemeSettingsPanel;
