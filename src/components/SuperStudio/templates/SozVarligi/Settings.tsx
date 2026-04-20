import React from 'react';
import { TemplateSettingsProps } from '../registry';
import { SozVarligiSettings } from './types';

export const SozVarligiSettingsPanel: React.FC<TemplateSettingsProps<SozVarligiSettings>> = ({
  settings,
  onChange,
}) => {
  const itemTypes = [
    { id: 'deyim', label: 'Deyimler', icon: '🗣️' },
    { id: 'atasozu', label: 'Atasözleri', icon: '📜' },
    { id: 'mecaz', label: 'Mecaz Anlatım', icon: '✨' },
  ];

  const toggleType = (typeId: SozVarligiSettings['itemTypes'][number]) => {
    const currentTypes = settings.itemTypes || [];
    const newTypes = currentTypes.includes(typeId)
      ? currentTypes.filter((t) => t !== typeId)
      : [...currentTypes, typeId];
    onChange({ itemTypes: newTypes });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          İçerik Türleri
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {itemTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => toggleType(type.id as SozVarligiSettings['itemTypes'][number])}
              className={`p-2 flex flex-col items-center gap-1 rounded-lg border transition-all ${
                settings.itemTypes?.includes(type.id as SozVarligiSettings['itemTypes'][number])
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              <span className="text-xl">{type.icon}</span>
              <span className="text-[10px]">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Madde: {(settings as unknown as Record<string, number>).count}
          </label>
          <input
            type="range"
            min="5"
            max="50"
            value={(settings as unknown as Record<string, number>).count}
            onChange={(e) =>
              onChange({ count: parseInt(e.target.value) } as Partial<SozVarligiSettings>)
            }
            className="w-full accent-emerald-500"
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
              onChange({ taskCount: parseInt(e.target.value) } as Partial<SozVarligiSettings>)
            }
            className="w-full accent-emerald-500"
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
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {d === 'standart' ? 'Standart' : d === 'yogun' ? 'Yoğun' : 'Ultra'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          {
            key: 'visualAnalogy',
            label: 'Görsel Benzetme',
            desc: 'Emoji/SVG eşleştirme',
            icon: '🎨',
          },
          {
            key: 'contextualUsage',
            label: 'Bağlamsal Kullanım',
            desc: 'Cümle içi boşluk',
            icon: '📝',
          },
          { key: 'includeMatching', label: 'Eşleştirme', desc: 'Anlam eşleştirme', icon: '🔗' },
          {
            key: 'includeSentenceCreation',
            label: 'Cümle Kurma',
            desc: 'Yaratıcı cümle',
            icon: '✏️',
          },
          {
            key: 'includeScenarioSection',
            label: 'Senaryo Bölümü',
            desc: 'Durum bazlı',
            icon: '🎭',
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
              onChange={(e) => onChange({ [key]: e.target.checked } as Partial<SozVarligiSettings>)}
              className="form-checkbox text-emerald-500 rounded h-4 w-4 bg-slate-900 border-slate-700 mt-0.5 flex-shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-slate-200 font-semibold group-hover:text-emerald-300 transition-colors leading-tight">
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

export default SozVarligiSettingsPanel;
