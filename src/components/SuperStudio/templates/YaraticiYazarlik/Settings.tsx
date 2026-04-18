import React from 'react';
import { TemplateSettingsProps } from '../registry';
import { YaraticiYazarlikSettings } from './types';

export const YaraticiYazarlikSettingsPanel: React.FC<
  TemplateSettingsProps<YaraticiYazarlikSettings>
> = ({ settings, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Hikaye Zarı: {(settings as unknown as Record<string, number>).storyDiceCount}
          </label>
          <input
            type="range"
            min="1"
            max="6"
            value={(settings as unknown as Record<string, number>).storyDiceCount}
            onChange={(e) =>
              onChange({
                storyDiceCount: parseInt(e.target.value),
              } as Partial<YaraticiYazarlikSettings>)
            }
            className="w-full accent-amber-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Cloze Formatı
          </label>
          <select
            value={settings.clozeFormat}
            onChange={(e) =>
              onChange({ clozeFormat: e.target.value as YaraticiYazarlikSettings['clozeFormat'] })
            }
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="none">Yok</option>
            <option value="fiil">Fiil</option>
            <option value="sifat">Sıfat</option>
            <option value="rastgele">Rastgele</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Min Cümle: {(settings as unknown as Record<string, number>).minSentences}
          </label>
          <input
            type="range"
            min="3"
            max="15"
            value={(settings as unknown as Record<string, number>).minSentences}
            onChange={(e) =>
              onChange({
                minSentences: parseInt(e.target.value),
              } as Partial<YaraticiYazarlikSettings>)
            }
            className="w-full accent-amber-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Soru: {(settings as unknown as Record<string, number>).questionCount}
          </label>
          <input
            type="range"
            min="3"
            max="50"
            value={(settings as unknown as Record<string, number>).questionCount}
            onChange={(e) =>
              onChange({
                questionCount: parseInt(e.target.value),
              } as Partial<YaraticiYazarlikSettings>)
            }
            className="w-full accent-amber-500"
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
              onChange({ taskCount: parseInt(e.target.value) } as Partial<YaraticiYazarlikSettings>)
            }
            className="w-full accent-amber-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Yazma Promptu: {(settings as unknown as Record<string, number>).writingPrompts}
          </label>
          <input
            type="range"
            min="2"
            max="8"
            value={(settings as unknown as Record<string, number>).writingPrompts}
            onChange={(e) =>
              onChange({
                writingPrompts: parseInt(e.target.value),
              } as Partial<YaraticiYazarlikSettings>)
            }
            className="w-full accent-amber-500"
          />
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
                    ? 'bg-amber-600 border-amber-400 text-white shadow-lg'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {d === 'standart' ? 'Standart' : d === 'yogun' ? 'Yoğun' : 'Ultra'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { key: 'emotionRadar', label: 'Duygu Radarı', desc: 'Duygu eşleştirme', icon: '🎭' },
          { key: 'includeWordBank', label: 'Kelime Bankası', desc: 'Yazma kelimeleri', icon: '📚' },
          { key: 'includeStoryMap', label: 'Hikaye Haritası', desc: 'Şablon planlama', icon: '🗺️' },
          {
            key: 'includePeerReview',
            label: 'Akran Değerlendirme',
            desc: 'Geri bildirim',
            icon: '👥',
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
                onChange({ [key]: e.target.checked } as Partial<YaraticiYazarlikSettings>)
              }
              className="form-checkbox text-amber-500 rounded h-4 w-4 bg-slate-900 border-slate-700 mt-0.5 flex-shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-slate-200 font-semibold group-hover:text-amber-300 transition-colors leading-tight">
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

export default YaraticiYazarlikSettingsPanel;
