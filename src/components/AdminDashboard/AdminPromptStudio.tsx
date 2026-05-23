import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { PromptTemplate, PromptSnippet } from '../../types/admin';
import { adminService } from '../../services/adminService';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../../constants';
import { PromptSimulator } from './PromptSimulator';
import { useToastStore } from '../../store/useToastStore';

const CodeEditor = ({
  value,
  onChange,
  readOnly = false,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
}) => {
  const preRef = useRef<HTMLPreElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const highlight = (code: string) => {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(
        /(\{\{)(.*?)(\}\})/g,
        '<span class="text-amber-500 font-bold bg-amber-500/10 px-1 rounded-sm">$1$2$3</span>'
      )
      .replace(
        /\[(.*?)\]/g,
        '<span class="text-emerald-500 font-black tracking-widest uppercase text-[10px] bg-emerald-500/10 px-1">[$1]</span>'
      )
      .replace(
        /(GÖREV:|ROL:|KURALLAR:|ÇIKTI:|PEDAGOJİ:|HEDEF KİTLE:)/gi,
        '<span class="text-rose-500 font-black border-b border-rose-500/30">$1</span>'
      )
      .replace(/"(.*?)"/g, '<span class="text-sky-400">"$1"</span>');
  };

  const syncScroll = () => {
    if (preRef.current && textRef.current) {
      preRef.current.scrollTop = textRef.current.scrollTop;
      preRef.current.scrollLeft = textRef.current.scrollLeft;
    }
  };

  return (
    <div className="relative w-full h-full bg-[#0a0a0a] rounded-xl border border-zinc-800/50 overflow-hidden font-mono text-xs shadow-inner group">
      <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#050505] border-r border-zinc-800/50 flex flex-col items-center pt-4 text-zinc-700 select-none text-[9px]">
        {value.split('\n').map((_, i) => (
          <div key={i} className="h-[22px] leading-[22px]">
            {i + 1}
          </div>
        ))}
      </div>
      <pre
        ref={preRef}
        className="absolute inset-0 left-10 p-4 m-0 pointer-events-none whitespace-pre-wrap break-words leading-[22px] overflow-hidden"
      >
        <code dangerouslySetInnerHTML={{ __html: highlight(value) }} />
      </pre>
      <textarea
        ref={textRef}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange?.(e.target.value)}
        onScroll={syncScroll}
        readOnly={readOnly}
        spellCheck={false}
        className="absolute inset-0 left-10 w-[calc(100%-40px)] p-4 m-0 bg-transparent text-transparent caret-white outline-none resize-none leading-[22px] whitespace-pre-wrap break-words selection:bg-indigo-500/30 custom-scrollbar"
      />
    </div>
  );
};

interface LintWarning {
  type: 'error' | 'warning' | 'info';
  text: string;
}

export const AdminPromptStudio = () => {
  const toast = useToastStore();
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [selected, setSelected] = useState<PromptTemplate | null>(null);
  const [snippets, setSnippets] = useState<PromptSnippet[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'history' | 'simulation'>('editor');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveNote, setSaveNote] = useState('');
  const [showRestoreModal, setShowRestoreModal] = useState<{ version: number; template: string; systemInstruction?: string } | null>(null);
  const [showSnippetModal, setShowSnippetModal] = useState<string | null>(null);
  const [snippetEditValue, setSnippetEditValue] = useState('');

  const [, setSimA] = useState({ result: '' });
  const [, setSimB] = useState({ result: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [p, s] = await Promise.all([adminService.getAllPrompts(), adminService.getAllSnippets()]);
    setPrompts(p);
    setSnippets(s);
    setLoading(false);
  };

  const variables = useMemo(() => {
    if (!selected) return [];
    const template = selected.template;
    const matches = template.match(/\{\{(.*?)\}\}/g);
    return matches ? [...new Set(matches.map((m: string) => m.replace(/\{|\}/g, '')))] : [];
  }, [selected]);

  const linter = useMemo(() => {
    if (!selected) return { score: 100, warnings: [] as LintWarning[], tokens: 0 };
    const full = (selected.template + ' ' + selected.systemInstruction).toLowerCase();
    const warnings: LintWarning[] = [];

    if (full.includes('yapma') || full.includes('yasak') || full.includes('hayır')) {
      warnings.push({ type: 'error', text: 'Negatif yükleme tespit edildi. Dislektik zihin "yapmayı bırak" yönergelerini işlerken belleği zorlar. Daima "şunu yap" şeklinde pozitif komutlar verin.' });
    }
    if (!full.includes('json')) {
      warnings.push({ type: 'warning', text: 'Çıktı formatı belirtilmemiş. Uygulama bütünlüğü için JSON dönülmesi zorunlu kılınmalıdır.' });
    }
    if (full.includes('karmaşık') || full.includes('uzun')) {
      warnings.push({ type: 'warning', text: 'Bilişsel yük asimetrisi: "Uzun" veya "Karmaşık" metinler okuma güçlüğü çeken öğrencileri hedeften saptırır.' });
    }
    if (!full.includes('görsel') && !full.includes('imge') && !full.includes('resim')) {
      warnings.push({ type: 'info', text: 'Multisensoriyel yoksunluk: Etkinlik içerisinde görsel bir referans veya imgelem (imagery) istenmemiş.' });
    }

    const exactTokens = Math.floor(full.length / 4.2);
    let score = 100 - warnings.filter(w => w.type === 'error').length * 25 - warnings.filter(w => w.type === 'warning').length * 15;
    if (exactTokens > 1500) score -= 15;

    return { score: Math.max(0, score), warnings, tokens: exactTokens };
  }, [selected?.template, selected?.systemInstruction]);

  const handleSelect = async (act: { id: string; title: string }) => {
    const id = `prompt_${act.id.toLowerCase()}`;
    let p = prompts.find((x: PromptTemplate) => x.id === id);
    if (!p) {
      p = {
        id,
        name: `${act.title} Mimarisi`,
        description: '',
        category: 'custom',
        systemInstruction: 'Sen bir MÖES (Multisensoriyel Özel Eğitim Sistemi) uzmanısın. Disleksi klinik ilkeleriyle düşünür, kısa ve net hedefler koyarsın.',
        template: adminService.getInitialPromptForActivity(act.id),
        variables: [],
        tags: [],
        updatedAt: new Date().toISOString(),
        version: 1,
        history: [],
        modelConfig: { temperature: 0.1, modelName: 'gemini-2.5-flash', thinkingBudget: 0 },
      };
    }
    setSelected(p);
    setSimA(prev => ({ ...prev, result: '' }));
    setSimB(prev => ({ ...prev, result: '' }));
    setActiveTab('editor');
  };

  const handleSaveWithNote = async () => {
    if (!selected || !saveNote.trim()) return;
    setIsSaving(true);
    try {
      const saved = await adminService.savePrompt({ ...selected, variables }, saveNote);
      setPrompts((prev: PromptTemplate[]) => prev.map((p: PromptTemplate) => p.id === saved.id ? saved : p));
      setSelected(saved);
      toast.success('Prompt mimarisi başarıyla kaydedildi');
      setShowSaveModal(false);
      setSaveNote('');
    } catch {
      toast.error('Kaydetme başarısız');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestore = () => {
    if (!showRestoreModal || !selected) return;
    setSelected({
      ...selected,
      template: showRestoreModal.template,
      systemInstruction: showRestoreModal.systemInstruction || selected.systemInstruction,
    });
    toast.success(`DNA v${showRestoreModal.version} geri yüklendi`);
    setShowRestoreModal(null);
  };

  const handleExport = useCallback(() => {
    if (!selected) return;
    const blob = new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selected.id}_v${selected.version}.json`;
    a.click();
    toast.success('Prompt dışa aktarıldı');
  }, [selected, toast]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as PromptTemplate;
        setSelected(imported);
        setPrompts(prev => {
          const exists = prev.find(p => p.id === imported.id);
          if (exists) return prev.map(p => p.id === imported.id ? imported : p);
          return [...prev, imported];
        });
        toast.success('Prompt başarıyla içe aktarıldı');
      } catch {
        toast.error('Geçersiz JSON dosyası');
      }
    };
    reader.readAsText(file);
  }, [toast]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return ACTIVITY_CATEGORIES;
    return ACTIVITY_CATEGORIES.map(cat => ({
      ...cat,
      activities: cat.activities.filter(aId => {
        const act = ACTIVITIES.find(a => a.id === aId);
        return act?.title.toLowerCase().includes(searchQuery.toLowerCase());
      }),
    })).filter(cat => cat.activities.length > 0);
  }, [searchQuery]);

  return (
    <div className="h-[calc(100vh-140px)] flex bg-[#030303] rounded-3xl border border-zinc-900 overflow-hidden shadow-2xl font-lexend">
      {/* L: EXPLORER PANEL */}
      <div className="w-72 border-r border-zinc-900 bg-[#080808] flex flex-col shrink-0">
        <div className="p-5 border-b border-zinc-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-amber-500/70 uppercase tracking-[0.2em]">Prompt Engine</span>
              <h2 className="text-zinc-200 text-sm font-bold">Sinir Ağları</h2>
            </div>
            <label className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-amber-500 cursor-pointer transition-all border border-zinc-800">
              <i className="fa-solid fa-file-import text-xs"></i>
              <input type="file" className="hidden" onChange={handleImport} accept=".json" />
            </label>
          </div>
          <div className="relative">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-xs"></i>
            <input
              type="text"
              placeholder="Aktivite ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 outline-none focus:border-amber-500/50 transition-all placeholder:text-zinc-700"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
          {filteredCategories.map((cat) => (
            <div key={cat.id}>
              <div className="px-3 py-1 text-[9px] font-black text-zinc-600 uppercase tracking-tighter mb-1.5 flex items-center gap-2">
                <i className={cat.icon}></i> {cat.title}
              </div>
              <div className="space-y-0.5">
                {ACTIVITIES.filter((a) => cat.activities.includes(a.id)).map((act) => (
                  <button
                    key={act.id}
                    onClick={() => handleSelect(act)}
                    className={`w-full text-left px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-3 relative overflow-hidden group ${selected?.id === `prompt_${act.id.toLowerCase()}` ? 'bg-zinc-800/80 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}
                  >
                    {selected?.id === `prompt_${act.id.toLowerCase()}` && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                    )}
                    <i className={`fa-solid fa-microchip text-[10px] ${selected?.id === `prompt_${act.id.toLowerCase()}` ? 'text-amber-500' : 'text-zinc-700 group-hover:text-zinc-500'}`}></i>
                    <span className="truncate">{act.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* C: WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
        {selected ? (
          <>
            <div className="h-16 border-b border-zinc-900/80 flex items-center justify-between px-8 bg-[#080808] shrink-0 z-10">
              <div className="flex flex-col">
                <h3 className="font-black text-sm text-zinc-100 uppercase tracking-widest flex items-center gap-3">
                  {selected.name}
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[9px] font-bold">DNA v{selected.version}</span>
                </h3>
                <p className="text-[10px] text-zinc-600 font-mono mt-0.5" title={linter.warnings.map(w => w.text).join('\n')}>
                  Maliyet: ~{linter.tokens} tkns • Skor:{' '}
                  <span className={linter.score >= 90 ? 'text-emerald-500' : linter.score >= 50 ? 'text-amber-500' : 'text-red-500'}>{linter.score}/100</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleExport} className="px-3 py-1.5 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-[9px] font-black text-zinc-500 hover:text-amber-500 transition-all uppercase tracking-widest">
                  <i className="fa-solid fa-download mr-1.5"></i> Dışa Aktar
                </button>
                <div className="flex bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800/50">
                  {[
                    { id: 'editor' as const, label: 'Mimarİ', icon: 'fa-layer-group' },
                    { id: 'simulation' as const, label: 'CANLI SİMÜLASYON', icon: 'fa-flask' },
                    { id: 'history' as const, label: 'Evrİm Geçmİşİ', icon: 'fa-dna' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === t.id ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <i className={`fa-solid ${t.icon}`}></i> {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 relative flex flex-col min-h-0 min-w-0">
              {activeTab === 'editor' && (
                <div className="flex-1 flex gap-6 min-h-0">
                  <div className="flex-1 flex flex-col rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <CodeEditor value={selected.template} onChange={(v) => setSelected({ ...selected, template: v })} />
                  </div>
                  <div className="w-80 flex flex-col gap-5 shrink-0">
                    <div className="h-1/3 bg-[#0a0a0a] rounded-2xl border border-zinc-800/50 p-5 flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-3xl pointer-events-none"></div>
                      <h4 className="flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 z-10">
                        <i className="fa-solid fa-brain"></i> Persona Modeli (System)
                      </h4>
                      <textarea
                        value={selected.systemInstruction}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSelected({ ...selected, systemInstruction: e.target.value })}
                        className="w-full flex-1 bg-transparent text-[11px] font-mono leading-relaxed text-zinc-400 outline-none resize-none custom-scrollbar z-10"
                        placeholder="Modelin temel rolü ve düşünme biçimi..."
                      />
                    </div>
                    <div className="flex-1 bg-[#0a0a0a] rounded-2xl border border-zinc-800/50 p-5 flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl pointer-events-none"></div>
                      <div className="flex items-center justify-between mb-4 z-10">
                        <h4 className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                          <i className="fa-solid fa-stethoscope"></i> Pedagojik Linter
                        </h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded shadow-sm border ${linter.score >= 90 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : linter.score >= 70 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                          {linter.score}/100
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 z-10">
                        {linter.warnings.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-zinc-600 opacity-50">
                            <i className="fa-solid fa-check-circle text-emerald-500 text-4xl mb-3 block"></i>
                            <p className="text-[10px] font-black tracking-widest uppercase">Sıfır Kognitif Yük.</p>
                          </div>
                        ) : (
                          linter.warnings.map((w, i) => (
                            <div key={i} className={`p-3 rounded-lg border flex flex-col gap-1.5 transition-all ${w.type === 'error' ? 'bg-red-500/5 border-red-500/20' : w.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-sky-500/5 border-sky-500/20'}`}>
                              <div className="flex items-center gap-2">
                                <i className={`fa-solid text-[10px] ${w.type === 'error' ? 'fa-triangle-exclamation text-red-500' : w.type === 'warning' ? 'fa-bolt text-amber-500' : 'fa-lightbulb text-sky-500'}`}></i>
                                <span className={`text-[9px] font-black uppercase ${w.type === 'error' ? 'text-red-500' : w.type === 'warning' ? 'text-amber-500' : 'text-sky-500'}`}>
                                  {w.type === 'error' ? 'Kritik İhlal' : w.type === 'warning' ? 'Metodoloji İkazu' : 'Tavsiye'}
                                </span>
                              </div>
                              <p className={`text-[10px] leading-relaxed font-medium ${w.type === 'error' ? 'text-red-400/80' : w.type === 'warning' ? 'text-amber-400/80' : 'text-sky-400/80'}`}>{w.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'simulation' && (
                <div className="flex-1 min-h-0 animate-in fade-in duration-300">
                  <PromptSimulator prompt={selected} />
                </div>
              )}

              {activeTab === 'history' && (
                <div className="h-full space-y-4 overflow-y-auto custom-scrollbar pr-2 max-w-3xl mx-auto w-full">
                  {(selected.history?.length || 0) === 0 && (
                    <div className="text-center p-32 text-zinc-600 flex flex-col items-center gap-4">
                      <i className="fa-solid fa-clock-rotate-left text-5xl opacity-20"></i>
                      <p className="text-[10px] font-black uppercase tracking-widest">Kayıtsız Organizma.</p>
                    </div>
                  )}
                  {[...(selected.history || [])].reverse().map((h, i) => (
                    <div key={i} className="p-6 bg-[#0a0a0a] border border-zinc-800/50 rounded-2xl flex justify-between items-center group hover:border-amber-500/50 transition-all shadow-lg relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-zinc-800 group-hover:bg-amber-500 transition-colors"></div>
                      <div className="pl-4">
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest">DNA V.{h.version}</span>
                          <span className="text-[9px] text-zinc-600 font-mono tracking-widest">{new Date(h.updatedAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-zinc-300 font-medium italic select-all">&quot;{h.changeLog}&quot;</p>
                      </div>
                      <button
                        onClick={() => setShowRestoreModal({ version: h.version, template: h.template, systemInstruction: h.systemInstruction })}
                        className="px-6 py-2.5 bg-zinc-800 hover:bg-amber-500 hover:text-black text-white text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 transition-all transform active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                      >
                        GERİ YÜKLE & UYGULA
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-20 border-t border-zinc-900/80 bg-[#080808] flex items-center px-8 justify-between shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
              <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="text-[8px] text-zinc-600 font-black uppercase mb-0.5 tracking-widest">Aktif Çekirdek</span>
                  <span className="text-[10px] text-zinc-400 font-mono tracking-wider">{selected.id}</span>
                </div>
                <div className="w-px h-6 bg-zinc-800"></div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-zinc-600 font-black uppercase mb-0.5 tracking-widest">Model Engine</span>
                  <span className="text-[10px] text-zinc-400 font-mono tracking-wider">{selected.modelConfig?.modelName || 'gemini-2.5-flash'}</span>
                </div>
              </div>
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={isSaving || linter.score < 50}
                className={`px-12 py-3.5 text-black font-black rounded-2xl text-[11px] uppercase tracking-widest transition-all transform active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-3 ${linter.score < 50 ? 'bg-zinc-800 text-zinc-600' : 'bg-amber-500 hover:bg-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)]'}`}
              >
                {isSaving ? (
                  <><i className="fa-solid fa-dna fa-spin"></i> HÜCRESEL YAZIM</>
                ) : (
                  <><i className="fa-solid fa-bolt"></i> MİMARİYİ ZİHNİNE KAZI</>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-800 p-20 text-center select-none bg-gradient-to-b from-[#050505] to-[#020202]">
            <div className="relative mb-10 group">
              <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-1000"></div>
              <div className="w-32 h-32 border border-zinc-800/50 rounded-full flex items-center justify-center text-4xl relative z-10 bg-black backdrop-blur-md shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
                <i className="fa-solid fa-fingerprint text-zinc-700 animate-pulse"></i>
              </div>
              <svg className="absolute inset-0 w-full h-full text-zinc-800 animate-spin-slow" viewBox="0 0 100 100" style={{ animationDuration: '20s' }}>
                <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5, 10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="10, 20" />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-zinc-400 mb-4 tracking-tighter mix-blend-screen">Kognitif Mimari Laboratuvarı</h3>
            <p className="max-w-md text-[11px] text-zinc-600 leading-relaxed font-medium uppercase tracking-widest">
              Özel eğitim etkinliklerinin yapay zeka tarafından nasıl düşünüleceğini yapılandırmak için sol havuzdan bir aktivite nöronu seçin.
            </p>
          </div>
        )}
      </div>

      {/* R: SNIPPETS */}
      {selected && activeTab === 'editor' && (
        <div className="w-72 border-l border-zinc-900 bg-[#080808] flex flex-col shrink-0 z-10">
          <div className="p-5 border-b border-zinc-900/50 flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Kognitif Bloklar</span>
              <button
                onClick={() => {
                  const newSnip: PromptSnippet = { id: `new_${Date.now()}`, label: 'YENİ BLOK', value: '' };
                  setSnippets([...snippets, newSnip]);
                  setSnippetEditValue('');
                  setShowSnippetModal(newSnip.id);
                }}
                className="text-zinc-600 hover:text-emerald-500 transition-colors"
              >
                <i className="fa-solid fa-plus-circle"></i>
              </button>
            </div>
            <p className="text-[9px] text-zinc-600 font-medium">Sık kullanılan pedagojik parametreler</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 bg-[#050505]">
            {snippets.length === 0 && (
              <div className="text-center p-10 text-zinc-700 text-[9px] uppercase tracking-widest font-black">Havuz Boş</div>
            )}
            {snippets.map((s: PromptSnippet) => (
              <div
                key={s.id}
                className="group p-4 bg-[#0a0a0a] border border-zinc-800/50 rounded-2xl relative hover:border-emerald-500/40 transition-all cursor-pointer shadow-lg overflow-hidden"
                onClick={() => selected && setSelected({ ...selected, template: selected.template + '\n\n' + s.value })}
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 blur-2xl pointer-events-none"></div>
                <h5 className="text-[9px] font-black text-zinc-300 mb-2 uppercase pr-6 leading-tight tracking-wider">{s.label}</h5>
                <p className="text-[9px] text-zinc-500 line-clamp-3 font-mono leading-relaxed relative z-10">&quot;{s.value.substring(0, 100)}...&quot;</p>
                <button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setSnippetEditValue(s.value);
                    setShowSnippetModal(s.id);
                  }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-emerald-500 transition-colors z-20"
                >
                  <i className="fa-solid fa-pen text-[9px]"></i>
                </button>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500/80 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Save Modal ── */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center" onClick={() => setShowSaveModal(false)}>
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black text-zinc-100 uppercase tracking-wider mb-2">Mimari Evrim Kaydı</h3>
            <p className="text-[10px] text-zinc-500 font-medium mb-6">Değişiklik logu girin — bu versiyon geçmişine kaydedilecek.</p>
            <textarea
              value={saveNote}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSaveNote(e.target.value)}
              className="w-full h-24 bg-black border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 outline-none resize-none focus:border-amber-500/50 transition-all"
              placeholder="Derinlemesine kognitif optimizasyon..."
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowSaveModal(false); setSaveNote(''); }} className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">Vazgeç</button>
              <button onClick={handleSaveWithNote} disabled={!saveNote.trim() || isSaving} className="flex-[2] py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30 flex items-center justify-center gap-2">
                {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-dna"></i>}
                {isSaving ? 'Kaydediliyor...' : 'Mimariyi Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Restore Modal ── */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center" onClick={() => setShowRestoreModal(null)}>
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black text-zinc-100 uppercase tracking-wider mb-2">DNA Geri Yükleme</h3>
            <p className="text-sm text-zinc-400 mb-6">Sistemin nöral yolları DNA v{showRestoreModal.version} dizişine döndürülecek. Onaylıyor musunuz?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowRestoreModal(null)} className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">İptal</button>
              <button onClick={handleRestore} className="flex-[2] py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl text-xs font-black uppercase tracking-widest transition-all">GERİ YÜKLE & UYGULA</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Snippet Edit Modal ── */}
      {showSnippetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center" onClick={() => setShowSnippetModal(null)}>
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black text-zinc-100 uppercase tracking-wider mb-6">Blok Düzenle</h3>
            <textarea
              value={snippetEditValue}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSnippetEditValue(e.target.value)}
              className="w-full h-32 bg-black border border-zinc-800 rounded-xl p-4 text-sm font-mono text-zinc-300 outline-none resize-none focus:border-emerald-500/50 transition-all"
              placeholder="Pedagojik parametreler..."
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSnippetModal(null)} className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">İptal</button>
              <button onClick={() => {
                if (showSnippetModal) {
                  const updated = snippets.map(s => s.id === showSnippetModal ? { ...s, value: snippetEditValue } : s);
                  setSnippets(updated);
                  const target = updated.find(s => s.id === showSnippetModal);
                  if (target) adminService.saveSnippet(target);
                  setShowSnippetModal(null);
                }
              }} className="flex-[2] py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl text-xs font-black uppercase tracking-widest transition-all">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};