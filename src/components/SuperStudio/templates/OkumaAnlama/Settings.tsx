import React from 'react';
import { TemplateSettingsProps } from '../registry';
import { OkumaAnlamaSettings } from './types';

export const OkumaAnlamaSettingsPanel: React.FC<TemplateSettingsProps<OkumaAnlamaSettings>> = ({
  settings,
  onChange,
}) => {
  const questionTypes: {
    id: OkumaAnlamaSettings['questionTypes'][number];
    label: string;
    icon: string;
  }[] = [
    { id: 'coktan-secmeli', label: 'Çoktan Seçmeli', icon: '🔘' },
    { id: 'bosluk-doldurma', label: 'Boşluk Doldurma', icon: '✏️' },
    { id: 'dogru-yanlis', label: 'Doğru/Yanlış', icon: '✅' },
    { id: 'acik-uc', label: 'Açık Uçlu', icon: '💬' },
    { id: 'eslestirme', label: 'Eşleştirme', icon: '🔗' },
  ];

  const toggleQuestionType = (typeId: OkumaAnlamaSettings['questionTypes'][number]) => {
    const currentTypes = settings.questionTypes || [];
    const newTypes = currentTypes.includes(typeId)
      ? currentTypes.filter((t) => t !== typeId)
      : [...currentTypes, typeId];
    onChange({ questionTypes: newTypes });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Kelime Limiti
          </label>
          <select
            value={settings.cognitiveLoadLimit}
            onChange={(e) =>
              onChange({
                cognitiveLoadLimit: Number(
                  e.target.value
                ) as OkumaAnlamaSettings['cognitiveLoadLimit'],
              })
            }
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent/20 outline-none"
          >
            <option value={6}>Max 6 (Disleksi)</option>
            <option value={8}>Max 8 (Kısa)</option>
            <option value={12}>Max 12 (Orta)</option>
            <option value={15}>Max 15 (Standart)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Metin Uzunluğu
          </label>
          <select
            value={settings.readingLength}
            onChange={(e) =>
              onChange({ readingLength: e.target.value as OkumaAnlamaSettings['readingLength'] })
            }
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent/20 outline-none"
          >
            <option value="kisa">Kısa (80-120)</option>
            <option value="orta">Orta (120-200)</option>
            <option value="uzun">Uzun (200-300)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Yerleşim
          </label>
          <select
            value={settings.layoutDensity}
            onChange={(e) =>
              onChange({ layoutDensity: e.target.value as OkumaAnlamaSettings['layoutDensity'] })
            }
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent/20 outline-none"
          >
            <option value="standart">Standart</option>
            <option value="yogun">Yoğun</option>
            <option value="ultra-yogun">Ultra Yoğun</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Soru Sayısı: {settings.questionCount}
          </label>
          <input
            type="range"
            min="3"
            max="50"
            value={settings.questionCount}
            onChange={(e) => onChange({ questionCount: parseInt(e.target.value) })}
            className="w-full accent-[hsl(var(--accent-h)_var(--accent-s)_var(--accent-l))]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Görev Sayısı: {settings.taskCount}
          </label>
          <input
            type="range"
            min="3"
            max="8"
            value={settings.taskCount}
            onChange={(e) => onChange({ taskCount: parseInt(e.target.value) })}
            className="w-full accent-[hsl(var(--accent-h)_var(--accent-s)_var(--accent-l))]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Soru Tipleri (Çoklu Seçim)
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {questionTypes.map((qt) => (
            <button
              key={qt.id}
              onClick={() => toggleQuestionType(qt.id)}
              className={`py-2 px-1 flex flex-col items-center gap-1 rounded-lg border text-[10px] font-medium transition-all ${
                settings.questionTypes?.includes(qt.id)
                  ? 'bg-accent border-accent/60 text-white shadow-lg shadow-accent/20'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              <span className="text-base">{qt.icon}</span>
              <span className="leading-tight">{qt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { key: 'chunkingEnabled', label: 'Parçalı Okuma', desc: '2-3 cümle + soru', icon: '📖' },
          {
            key: 'visualScaffolding',
            label: 'Görsel Destek',
            desc: 'Emoji ikon desteği',
            icon: '🎨',
          },
          {
            key: 'typographicHighlight',
            label: 'Kök Vurgulama',
            desc: 'Kök kelimeler kalın',
            icon: '✏️',
          },
          { key: 'mindMap5N1K', label: '5N1K Tablosu', desc: 'Metin sonu grid', icon: '📊' },
          {
            key: 'includeWordWork',
            label: 'Kelime Çalışması',
            desc: 'Zor kelime analizi',
            icon: '📝',
          },
          {
            key: 'includeDetectiveTask',
            label: 'Dedektif Görevi',
            desc: 'Hata bulma oyunu',
            icon: '🔍',
          },
          { key: 'includeBonusSection', label: 'Bonus Bölüm', desc: 'Yarışma + tüyo', icon: '⭐' },
          { key: 'includeAnswerKey', label: 'Cevap Anahtarı', desc: 'Sayfa sonuna', icon: '🔑' },
        ].map(({ key, label, desc, icon }) => (
          <label
            key={key}
            className="flex items-start gap-2 cursor-pointer p-2 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:bg-slate-700/40 hover:border-slate-600 transition-all group"
          >
            <input
              type="checkbox"
              checked={Boolean((settings as unknown as Record<string, unknown>)[key])}
              onChange={(e) =>
                onChange({ [key]: e.target.checked } as Partial<OkumaAnlamaSettings>)
              }
              className="form-checkbox text-accent rounded h-3.5 w-3.5 bg-slate-900 border-slate-700 mt-0.5 flex-shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-slate-200 font-semibold group-hover:text-accent/80 transition-colors leading-tight">
                {icon} {label}
              </span>
              <span className="text-[9px] text-slate-500 leading-tight">{desc}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default OkumaAnlamaSettingsPanel;
