import React from 'react';
import { TemplateSettingsProps } from '../registry';
import { KelimeBilgisiSettings } from './types';

export const KelimeBilgisiSettingsPanel: React.FC<TemplateSettingsProps<KelimeBilgisiSettings>> = ({
  settings,
  onChange,
}) => {
  const wordTypesList = [
    { id: 'es-anlamli', label: 'Eş Anlamlı', icon: '🔄', color: 'blue' },
    { id: 'zit-anlamli', label: 'Zıt Anlamlı', icon: '⚡', color: 'red' },
    { id: 'es-sesli', label: 'Eş Sesli', icon: '🎵', color: 'green' },
  ];

  const templateStyles = [
    { id: 'match-card', label: 'Eşleştirme', icon: '🃏' },
    { id: 'fill-blank', label: 'Boşluk Doldur', icon: '✏️' },
    { id: 'word-web', label: 'Kelime Ağı', icon: '🕸️' },
    { id: 'bingo', label: 'Bingo', icon: '🎱' },
  ];

  const toggleWordType = (typeId: string) => {
    const newTypes = settings.wordTypes.includes(typeId as any)
      ? settings.wordTypes.filter((t) => t !== typeId)
      : [...settings.wordTypes, typeId as any];
    onChange({ wordTypes: newTypes });
  };

  const updateAiSettings = (key: string, value: unknown) => {
    onChange({
      aiSettings: { ...settings.aiSettings, [key]: value },
    });
  };

  const updateHizliSettings = (key: string, value: unknown) => {
    onChange({
      hizliSettings: { ...settings.hizliSettings, [key]: value },
    });
  };

  const updateVisualSettings = (key: string, value: boolean) => {
    onChange({
      visualSettings: { ...settings.visualSettings, [key]: value },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Üretim Modu
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onChange({ generationMode: 'ai' })}
            className={`p-3 rounded-xl border-2 transition-all ${
              settings.generationMode === 'ai'
                ? 'bg-gradient-to-br from-purple-600 to-indigo-600 border-purple-400 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-purple-500'
            }`}
          >
            <div className="text-xl mb-1">🤖</div>
            <div className="font-bold text-xs">AI Modu</div>
          </button>
          <button
            onClick={() => onChange({ generationMode: 'hizli' })}
            className={`p-3 rounded-xl border-2 transition-all ${
              settings.generationMode === 'hizli'
                ? 'bg-gradient-to-br from-teal-600 to-emerald-600 border-teal-400 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-teal-500'
            }`}
          >
            <div className="text-xl mb-1">⚡</div>
            <div className="font-bold text-xs">Hızlı Mod</div>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Kelime Türleri
        </label>
        <div className="grid grid-cols-3 gap-2">
          {wordTypesList.map((type) => (
            <button
              key={type.id}
              onClick={() => toggleWordType(type.id)}
              className={`p-2 rounded-lg border transition-all ${
                settings.wordTypes.includes(type.id as any)
                  ? 'bg-purple-600/20 border-purple-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              style={{
                backgroundColor: settings.wordTypes.includes(type.id as any)
                  ? type.color === 'blue'
                    ? 'rgba(59, 130, 246, 0.2)'
                    : type.color === 'red'
                      ? 'rgba(239, 68, 68, 0.2)'
                      : 'rgba(34, 197, 94, 0.2)'
                  : undefined,
                borderColor: settings.wordTypes.includes(type.id as any)
                  ? type.color === 'blue'
                    ? '#3b82f6'
                    : type.color === 'red'
                      ? '#ef4444'
                      : '#22c55e'
                  : undefined,
              }}
            >
              <div className="text-lg mb-0.5">{type.icon}</div>
              <div className="text-[10px] font-medium">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {settings.generationMode === 'ai' && (
        <div className="space-y-3 p-3 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl border border-purple-800/30">
          <h4 className="text-xs font-bold text-purple-300 flex items-center gap-2">
            <span>🤖</span> AI Ayarları
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-medium text-slate-400">Kelime Sayısı</label>
              <input
                type="number"
                min="3"
                max="15"
                value={settings.aiSettings.wordCount}
                onChange={(e) => updateAiSettings('wordCount', parseInt(e.target.value))}
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-medium text-slate-400">Zorluk</label>
              <select
                value={settings.aiSettings.difficulty}
                onChange={(e) => updateAiSettings('difficulty', e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="kolay">Kolay</option>
                <option value="orta">Orta</option>
                <option value="zor">Zor</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { key: 'includeExamples', label: 'Cümle Örnekleri' },
              { key: 'includeMnemonics', label: 'Mnemonik İpuçları' },
              { key: 'themeBased', label: 'Tematik Gruplama' },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer p-1.5 bg-slate-800/50 rounded-lg border border-slate-700"
              >
                <input
                  type="checkbox"
                  checked={settings.aiSettings[key as keyof typeof settings.aiSettings] as boolean}
                  onChange={(e) => updateAiSettings(key, e.target.checked)}
                  className="form-checkbox text-purple-500 rounded h-3.5 w-3.5"
                />
                <span className="text-xs text-slate-300">{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {settings.generationMode === 'hizli' && (
        <div className="space-y-3 p-3 bg-gradient-to-br from-teal-900/20 to-emerald-900/20 rounded-xl border border-teal-800/30">
          <h4 className="text-xs font-bold text-teal-300 flex items-center gap-2">
            <span>⚡</span> Hızlı Şablon
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            {templateStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => updateHizliSettings('templateStyle', style.id)}
                className={`p-2 rounded-lg border transition-all text-xs ${
                  settings.hizliSettings.templateStyle === style.id
                    ? 'bg-teal-600 border-teal-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {style.icon} {style.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-medium text-slate-400">Zorluk</label>
              <select
                value={settings.hizliSettings.difficulty}
                onChange={(e) => updateHizliSettings('difficulty', e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="kolay">Kolay</option>
                <option value="orta">Orta</option>
                <option value="zor">Zor</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-medium text-slate-400">Soru Sayısı</label>
              <input
                type="number"
                min="5"
                max="30"
                value={settings.hizliSettings.questionCount}
                onChange={(e) => updateHizliSettings('questionCount', parseInt(e.target.value))}
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-slate-800/50 rounded-lg border border-slate-700">
            <input
              type="checkbox"
              checked={settings.hizliSettings.includeAnswerKey}
              onChange={(e) => updateHizliSettings('includeAnswerKey', e.target.checked)}
              className="form-checkbox text-teal-500 rounded h-3.5 w-3.5"
            />
            <span className="text-xs text-slate-300">Cevap Anahtarı</span>
          </label>
        </div>
      )}

      <div className="space-y-3 p-3 bg-slate-800/30 rounded-xl border border-slate-700">
        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <span>🎨</span> Görsel Ayarlar
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { key: 'useColorCoding', label: 'Renk Kodlaması' },
            { key: 'useIcons', label: 'Görsel İkonlar' },
            { key: 'useFonts', label: 'Font Vurguları' },
            { key: 'useGrid', label: 'Tablo/Görünümü' },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 cursor-pointer p-1.5 bg-slate-800/50 rounded-lg border border-slate-700"
            >
              <input
                type="checkbox"
                checked={
                  settings.visualSettings[key as keyof typeof settings.visualSettings] as boolean
                }
                onChange={(e) => updateVisualSettings(key, e.target.checked)}
                className="form-checkbox text-blue-500 rounded h-3.5 w-3.5"
              />
              <span className="text-xs text-slate-300">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
              onChange({ taskCount: parseInt(e.target.value) } as Partial<KelimeBilgisiSettings>)
            }
            className="w-full accent-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Yerleşim
          </label>
          <div className="grid grid-cols-3 gap-1">
            {(['standart', 'yogun', 'ultra-yogun'] as const).map((d) => (
              <button
                key={d}
                onClick={() => onChange({ layoutDensity: d })}
                className={`py-1 px-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                  (settings as unknown as Record<string, string>).layoutDensity === d
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {d === 'standart' ? 'S' : d === 'yogun' ? 'Y' : 'U'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { key: 'includeMatching', label: 'Eşleştirme', desc: 'Kart eşleştirme', icon: '🃏' },
          {
            key: 'includeSentenceContext',
            label: 'Cümle Bağlamı',
            desc: 'Cümle içi kullanım',
            icon: '📝',
          },
          { key: 'includeWordSearch', label: 'Kelime Avı', desc: 'Bulmaca tablosu', icon: '🔍' },
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
                onChange({ [key]: e.target.checked } as Partial<KelimeBilgisiSettings>)
              }
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

export default KelimeBilgisiSettingsPanel;
