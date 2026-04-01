import React from 'react';
import { TemplateSettingsProps } from '../registry';
import { HeceSesSettings } from './types';

export const HeceSesSettingsPanel: React.FC<TemplateSettingsProps<HeceSesSettings>> = ({
  settings,
  onChange,
}) => {
  const eventsList = [
    { id: 'heceleme', label: 'Heceleme' },
    { id: 'yumusama', label: 'Ünsüz Yumuşaması' },
    { id: 'sertlesme', label: 'Ünsüz Benzeşmesi' },
    { id: 'ses-dusmesi', label: 'Ses Düşmesi' },
  ];

  const toggleEvent = (eventId: HeceSesSettings['focusEvents'][number]) => {
    const newEvents = settings.focusEvents.includes(eventId)
      ? settings.focusEvents.filter((e) => e !== eventId)
      : [...settings.focusEvents, eventId];
    onChange({ focusEvents: newEvents });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Ses Olayları
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {eventsList.map((event) => (
            <button
              key={event.id}
              onClick={() => toggleEvent(event.id as HeceSesSettings['focusEvents'][number])}
              className={`py-2 px-2.5 text-xs rounded-lg border font-medium transition-all ${
                settings.focusEvents.includes(event.id as HeceSesSettings['focusEvents'][number])
                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/20'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {event.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Kelime: {(settings as unknown as Record<string, number>).wordCount}
          </label>
          <input
            type="range"
            min="8"
            max="30"
            value={(settings as unknown as Record<string, number>).wordCount}
            onChange={(e) =>
              onChange({ wordCount: parseInt(e.target.value) } as Partial<HeceSesSettings>)
            }
            className="w-full accent-purple-500"
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
              onChange({ taskCount: parseInt(e.target.value) } as Partial<HeceSesSettings>)
            }
            className="w-full accent-purple-500"
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
                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg'
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
          { key: 'syllableHighlight', label: 'Hece Vurgulama', desc: '[ ] ile göster', icon: '🔤' },
          {
            key: 'multisensorySupport',
            label: 'Çok Duyulu Destek',
            desc: 'BÜYÜK harf ipucu',
            icon: '🎯',
          },
          { key: 'includeSyllableCounting', label: 'Hece Sayma', desc: 'Hece tablosu', icon: '🔢' },
          { key: 'includeWordBuilding', label: 'Kelime Kurma', desc: 'Dağınık hece', icon: '🧩' },
          {
            key: 'includeSoundDetection',
            label: 'Ses Algılama',
            desc: 'Ses bulma oyunu',
            icon: '👂',
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
              onChange={(e) => onChange({ [key]: e.target.checked } as Partial<HeceSesSettings>)}
              className="form-checkbox text-purple-500 rounded h-4 w-4 bg-slate-900 border-slate-700 mt-0.5 flex-shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-slate-200 font-semibold group-hover:text-purple-300 transition-colors leading-tight">
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

export default HeceSesSettingsPanel;
