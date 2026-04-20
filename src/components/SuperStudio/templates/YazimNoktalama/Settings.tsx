import React from 'react';
import { TemplateSettingsProps } from '../registry';
import { YazimNoktalamaSettings } from './types';

export const YazimNoktalamaSettingsPanel: React.FC<
  TemplateSettingsProps<YazimNoktalamaSettings>
> = ({ settings, onChange }) => {
  const rulesList = [
    { id: 'buyuk-harf', label: 'Büyük Harf', icon: '🔠' },
    { id: 'kesme-isareti', label: 'Kesme İşareti', icon: '✂️' },
    { id: 'noktalama', label: 'Noktalama', icon: '❗' },
    { id: 'bitisik-ayri', label: 'Bitişik/Ayrı', icon: '🔗' },
  ];

  const toggleRule = (ruleId: YazimNoktalamaSettings['focusRules'][number]) => {
    const currentRules = settings.focusRules || [];
    const newRules = currentRules.includes(ruleId)
      ? currentRules.filter((r) => r !== ruleId)
      : [...currentRules, ruleId];
    onChange({ focusRules: newRules });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Odak Kurallar
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {rulesList.map((rule) => (
            <button
              key={rule.id}
              onClick={() => toggleRule(rule.id as YazimNoktalamaSettings['focusRules'][number])}
              className={`py-2 px-2.5 flex items-center gap-1.5 rounded-lg border text-xs font-medium transition-all ${
                settings.focusRules?.includes(
                  rule.id as YazimNoktalamaSettings['focusRules'][number]
                )
                  ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-900/20'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              <span>{rule.icon}</span> {rule.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Egzersiz: {(settings as unknown as Record<string, number>).exerciseCount}
          </label>
          <input
            type="range"
            min="5"
            max="50"
            value={(settings as unknown as Record<string, number>).exerciseCount}
            onChange={(e) =>
              onChange({
                exerciseCount: parseInt(e.target.value),
              } as Partial<YazimNoktalamaSettings>)
            }
            className="w-full accent-rose-500"
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
              onChange({ taskCount: parseInt(e.target.value) } as Partial<YazimNoktalamaSettings>)
            }
            className="w-full accent-rose-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Paragraf
          </label>
          <select
            value={settings.paragraphLength}
            onChange={(e) =>
              onChange({
                paragraphLength: e.target.value as YazimNoktalamaSettings['paragraphLength'],
              })
            }
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
          >
            <option value="kisa">Kısa</option>
            <option value="orta">Orta</option>
            <option value="uzun">Uzun</option>
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
                  ? 'bg-rose-600 border-rose-400 text-white shadow-lg'
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
          { key: 'showRuleHint', label: 'Kural Kartı', desc: 'Her göreve bilgi notu', icon: '💡' },
          {
            key: 'errorCorrectionMode',
            label: 'Hata Dedektifi',
            desc: 'Hatalı cümle düzeltme',
            icon: '🔍',
          },
          {
            key: 'includeScenarioWriting',
            label: 'Senaryo Yazma',
            desc: 'Durum yazma',
            icon: '📝',
          },
          {
            key: 'includeTestSection',
            label: 'Test Bölümü',
            desc: 'D/Y + çoktan seçmeli',
            icon: '📋',
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
                onChange({ [key]: e.target.checked } as Partial<YazimNoktalamaSettings>)
              }
              className="form-checkbox text-rose-500 rounded h-4 w-4 bg-slate-900 border-slate-700 mt-0.5 flex-shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-slate-200 font-semibold group-hover:text-rose-300 transition-colors leading-tight">
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

export default YazimNoktalamaSettingsPanel;
