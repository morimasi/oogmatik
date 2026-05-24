import React, { useState } from 'react';
import { AdTemplate } from '../../../types/adStudio';
import { useAdGenerator } from '../../../hooks/useAdGenerator';

const STORAGE_KEY = 'bdmind_ad_templates';

function loadTemplates(): AdTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AdTemplate[];
  } catch { /* ignore */ }
  return [];
}

function saveTemplates(templates: AdTemplate[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export const TemplateLibrary: React.FC = () => {
  const { settings, updateSettings, setStep } = useAdGenerator();
  const [templates, setTemplates] = useState<AdTemplate[]>(loadTemplates);
  const [templateName, setTemplateName] = useState('');

  React.useEffect(() => { saveTemplates(templates); }, [templates]);

  const saveTemplate = () => {
    if (!templateName.trim()) return;
    const tpl: AdTemplate = {
      id: crypto.randomUUID(),
      name: templateName.trim(),
      description: `${settings.target} · ${settings.format} · ${settings.audience.join(', ')}`,
      settings: {
        target: settings.target,
        audience: settings.audience,
        tone: settings.tone,
        format: settings.format,
        duration: settings.duration,
        toneMix: settings.toneMix,
        language: settings.language,
        urgency: settings.urgency,
        callToAction: settings.callToAction,
        season: settings.season,
        tags: settings.tags,
      },
      createdAt: new Date().toISOString(),
    };
    setTemplates(prev => [...prev, tpl]);
    setTemplateName('');
  };

  const loadTemplate = (tpl: AdTemplate) => {
    updateSettings('target', tpl.settings.target);
    updateSettings('audience', tpl.settings.audience);
    updateSettings('tone', tpl.settings.tone);
    updateSettings('format', tpl.settings.format);
    updateSettings('duration', tpl.settings.duration);
    if (tpl.settings.toneMix) updateSettings('toneMix', tpl.settings.toneMix);
    if (tpl.settings.language) updateSettings('language', tpl.settings.language);
    if (tpl.settings.urgency) updateSettings('urgency', tpl.settings.urgency);
    if (tpl.settings.callToAction) updateSettings('callToAction', tpl.settings.callToAction);
    if (tpl.settings.season) updateSettings('season', tpl.settings.season);
    if (tpl.settings.tags) updateSettings('tags', tpl.settings.tags);
    setStep(5);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const exportAll = () => {
    const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bdmind-sablonlar-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTemplates = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as AdTemplate[];
        if (Array.isArray(imported)) {
          setTemplates(prev => [...prev, ...imported]);
        }
      } catch { /* ignore */ }
    };
    reader.readAsText(file);
  };

  return (
    <div className="rounded-[2rem] bg-white/40 dark:bg-black/20 border border-zinc-200 dark:border-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
          <i className="fa-solid fa-copy text-indigo-500" />
          Şablon Kütüphanesi
          <span className="text-zinc-600 font-mono normal-case tracking-normal">({templates.length})</span>
        </h3>
        <div className="flex gap-1">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-zinc-400 text-[9px] font-bold hover:bg-white/10 cursor-pointer transition-all">
            <i className="fa-solid fa-file-import" /> İçe Aktar
            <input type="file" accept=".json" onChange={importTemplates} className="hidden" />
          </label>
          <button onClick={exportAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-zinc-400 text-[9px] font-bold hover:bg-white/10 transition-all">
            <i className="fa-solid fa-file-export" /> Dışa Aktar
          </button>
        </div>
      </div>

      {/* Save Current */}
      <div className="flex gap-2 mb-4">
        <input
          value={templateName}
          onChange={e => setTemplateName(e.target.value)}
          placeholder="Şablon adı"
          className="flex-1 py-2 px-3 rounded-lg bg-white/5 border border-white/5 text-zinc-300 text-[11px] focus:outline-none focus:border-indigo-500/30 placeholder:text-zinc-600"
        />
        <button
          onClick={saveTemplate}
          disabled={!templateName.trim()}
          className="px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-400 text-[10px] font-bold border border-indigo-500/30 hover:bg-indigo-500/30 transition-all disabled:opacity-50"
        >
          <i className="fa-solid fa-floppy-disk mr-1" /> Kaydet
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 gap-2 text-zinc-500">
          <i className="fa-solid fa-copy text-2xl" />
          <p className="text-[11px] font-medium">Henüz şablon yok</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {templates.map(tpl => (
            <div key={tpl.id} className="rounded-xl bg-white/5 border border-white/5 p-3 hover:bg-indigo-500/5 transition-all group">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-[11px] font-bold text-zinc-300 truncate">{tpl.name}</h4>
                <button onClick={() => deleteTemplate(tpl.id)} className="p-1 rounded bg-white/5 text-zinc-500 hover:text-red-400 text-[8px] opacity-0 group-hover:opacity-100 transition-all">
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
              <p className="text-[8px] text-zinc-500 mb-2">{tpl.description}</p>
              <button
                onClick={() => loadTemplate(tpl)}
                className="w-full py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-[8px] font-bold hover:bg-indigo-500/20 transition-all"
              >
                <i className="fa-solid fa-download mr-1" /> Yükle
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
