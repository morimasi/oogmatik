import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { PromptTemplate, PromptSnippet } from '../../types/admin';
import { adminService } from '../../services/adminService';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../../constants';
import { PromptSimulator } from './PromptSimulator';
import { useToastStore } from '../../store/useToastStore';

interface AdminPromptStudioProps {
  initialActivityId?: string | null;
  onClearInitialActivity?: () => void;
}

const AVAILABLE_MODELS = [
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash (Varsayılan)' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite (Hızlı)' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Klinik Derinlik)' },
];

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
        '<span class="text-amber-400 font-bold bg-amber-500/15 px-1 rounded-sm">$1$2$3</span>'
      )
      .replace(
        /\[(.*?)\]/g,
        '<span class="text-emerald-400 font-black tracking-widest uppercase text-[10px] bg-emerald-500/15 px-1">[$1]</span>'
      )
      .replace(
        /(GÖREV:|ROL:|KURALLAR:|ÇIKTI:|PEDAGOJİ:|HEDEF KİTLE:)/gi,
        '<span class="text-rose-400 font-black border-b border-rose-500/30">$1</span>'
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
    <div className="relative w-full h-full min-h-[340px] bg-slate-950 rounded-xl border border-[var(--border-color)] overflow-hidden font-mono text-xs shadow-inner group">
      <div className="absolute left-0 top-0 bottom-0 w-10 bg-slate-900 border-r border-slate-800 flex flex-col items-center pt-4 text-slate-600 select-none text-[9px]">
        {value.split('\n').map((_, i) => (
          <div key={i} className="h-[22px] leading-[22px]">
            {i + 1}
          </div>
        ))}
      </div>
      <pre
        ref={preRef}
        className="absolute inset-0 left-10 p-4 m-0 pointer-events-none whitespace-pre-wrap break-words leading-[22px] overflow-hidden text-slate-200"
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

export const AdminPromptStudio: React.FC<AdminPromptStudioProps> = ({
  initialActivityId,
  onClearInitialActivity,
}) => {
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
  const [showRestoreModal, setShowRestoreModal] = useState<{
    version: number;
    template: string;
    systemInstruction?: string;
  } | null>(null);
  const [showSnippetModal, setShowSnippetModal] = useState<string | null>(null);
  const [snippetEditValue, setSnippetEditValue] = useState('');
  const [snippetEditLabel, setSnippetEditLabel] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([adminService.getAllPrompts(), adminService.getAllSnippets()]);
      setPrompts(p);
      setSnippets(s);
    } catch {
      toast.error('Prompt verileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = useCallback(
    (act: { id: string; title: string }, promptList: PromptTemplate[] = prompts) => {
      const id = `prompt_${act.id.toLowerCase()}`;
      let p = promptList.find((x: PromptTemplate) => x.id === id);
      if (!p) {
        p = {
          id,
          name: `${act.title} Mimarisi`,
          description: '',
          category: 'custom',
          systemInstruction:
            'Sen bir MÖES (Multisensoriyel Özel Eğitim Sistemi) uzmanısın. Disleksi klinik ilkeleriyle düşünür, ZPD uyumlu kısa ve net hedefler koyarsın. Her çıktıda pedagogicalNote alanını doldurursun.',
          template: adminService.getInitialPromptForActivity(act.id),
          variables: [],
          tags: [],
          updatedAt: new Date().toISOString(),
          version: 1,
          history: [],
          modelConfig: { temperature: 0.1, modelName: 'gemini-3.8-flash', thinkingBudget: 0 },
        };
      }
      setSelected(p);
      setActiveTab('editor');
    },
    [prompts]
  );

  // Dışarıdan (Aktivite Yöneticisi vb.) belirli bir aktivite ile açılırsa otomatik seç
  useEffect(() => {
    if (!initialActivityId || loading) return;
    const found = ACTIVITIES.find((a) => a.id === initialActivityId);
    if (found) {
      handleSelect(found, prompts);
    } else {
      handleSelect({ id: initialActivityId, title: initialActivityId }, prompts);
    }
    onClearInitialActivity?.();
  }, [initialActivityId, loading, prompts, handleSelect, onClearInitialActivity]);

  const variables = useMemo(() => {
    if (!selected) return [];
    const matches = selected.template.match(/\{\{(.*?)\}\}/g);
    return matches ? [...new Set(matches.map((m: string) => m.replace(/\{|\}/g, '').trim()))] : [];
  }, [selected]);

  // 10 Ordinaryüs Standartlı Pedagojik Linter
  const linter = useMemo(() => {
    if (!selected) return { score: 100, warnings: [] as LintWarning[], tokens: 0 };
    const rawFull = `${selected.template} ${selected.systemInstruction}`;
    const full = rawFull.toLowerCase();
    const warnings: LintWarning[] = [];

    if (full.includes('yapma') || full.includes('yasak') || full.includes('hayır')) {
      warnings.push({
        type: 'error',
        text: 'Negatif yükleme tespit edildi. Dislektik zihin "yapma" yönergelerini işlerken belleği zorlar; pozitif komutlar kullanın.',
      });
    }
    if (
      full.includes('disleksisi var') ||
      full.includes('hasta') ||
      full.includes('gerizekalı') ||
      full.includes('özürlü')
    ) {
      warnings.push({
        type: 'error',
        text: 'Klinik Kural İhlali (Dr. Ahmet Kaya): Tanı koyucu veya damgalayıcı ifade kesinlikle yasaktır.',
      });
    }
    if (!full.includes('json')) {
      warnings.push({
        type: 'warning',
        text: 'Çıktı formatı belirtilmemiş. Uygulama bütünlüğü için JSON formatı zorunlu kılınmalıdır.',
      });
    }
    if (!rawFull.includes('pedagogicalNote') && !full.includes('pedagojik not')) {
      warnings.push({
        type: 'warning',
        text: 'Pedagojik Zorunluluk (Elif Yıldız): Her AI aktivite çıktısında öğretmen için "pedagogicalNote" alanı istenmelidir.',
      });
    }
    if (full.includes('karmaşık') || full.includes('uzun')) {
      warnings.push({
        type: 'warning',
        text: 'Bilişsel yük asimetrisi: "Uzun" veya "Karmaşık" metinler okuma güçlüğü yaşayan öğrencileri hedeften saptırır.',
      });
    }
    if (!full.includes('görsel') && !full.includes('imge') && !full.includes('resim')) {
      warnings.push({
        type: 'info',
        text: 'Multisensoriyel öneri: Görsel destek veya somut imgelem referansı eklenmesi öğrenmeyi güçlendirir.',
      });
    }

    const exactTokens = Math.floor(full.length / 4.2);
    let score =
      100 -
      warnings.filter((w) => w.type === 'error').length * 25 -
      warnings.filter((w) => w.type === 'warning').length * 15;
    if (exactTokens > 1500) score -= 15;

    return { score: Math.max(0, score), warnings, tokens: exactTokens };
  }, [selected?.template, selected?.systemInstruction]);

  const handleSaveWithNote = async () => {
    if (!selected || !saveNote.trim()) return;
    setIsSaving(true);
    try {
      const saved = await adminService.savePrompt({ ...selected, variables }, saveNote);
      setPrompts((prev: PromptTemplate[]) => {
        const exists = prev.some((p) => p.id === saved.id);
        return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [...prev, saved];
      });
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
    toast.success(`DNA v${showRestoreModal.version} geri yüklendi (yayınlamak için kaydedin)`);
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
    URL.revokeObjectURL(url);
    toast.success('Prompt dışa aktarıldı');
  }, [selected, toast]);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string) as Partial<PromptTemplate>;
          if (!imported.id || typeof imported.template !== 'string') {
            toast.error('Geçersiz Prompt JSON şeması.');
            return;
          }
          const normalized: PromptTemplate = {
            id: imported.id,
            name: imported.name || imported.id,
            description: imported.description || '',
            category: imported.category || 'custom',
            systemInstruction: imported.systemInstruction || '',
            template: imported.template,
            variables: Array.isArray(imported.variables) ? imported.variables : [],
            tags: Array.isArray(imported.tags) ? imported.tags : [],
            updatedAt: new Date().toISOString(),
            version: imported.version || 1,
            history: Array.isArray(imported.history) ? imported.history : [],
            modelConfig: imported.modelConfig || {
              temperature: 0.1,
              modelName: 'gemini-3.8-flash',
              thinkingBudget: 0,
            },
          };
          setSelected(normalized);
          setPrompts((prev) => {
            const exists = prev.some((p) => p.id === normalized.id);
            return exists
              ? prev.map((p) => (p.id === normalized.id ? normalized : p))
              : [...prev, normalized];
          });
          toast.success('Prompt başarıyla içe aktarıldı');
        } catch {
          toast.error('Geçersiz JSON dosyası');
        }
      };
      reader.readAsText(file);
    },
    [toast]
  );

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return ACTIVITY_CATEGORIES;
    return ACTIVITY_CATEGORIES.map((cat) => ({
      ...cat,
      activities: cat.activities.filter((aId) => {
        const act = ACTIVITIES.find((a) => a.id === aId);
        return (
          act?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          aId.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }),
    })).filter((cat) => cat.activities.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-[680px] lg:h-[calc(100vh-140px)] flex flex-col lg:flex-row bg-[var(--bg-paper)] rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-xl font-lexend">
      {/* L: EXPLORER PANEL */}
      <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col shrink-0 max-h-64 lg:max-h-none">
        <div className="p-4 border-b border-[var(--border-color)] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">
                Prompt Engine
              </span>
              <h2 className="text-[var(--text-primary)] text-sm font-black">
                Sinir Ağları ({prompts.length} Kayıtlı)
              </h2>
            </div>
            <label
              className="p-2 bg-[var(--bg-paper)] hover:border-[var(--accent-color)] rounded-xl text-[var(--text-muted)] hover:text-amber-500 cursor-pointer transition-all border border-[var(--border-color)]"
              title="Prompt JSON İçe Aktar"
            >
              <i className="fa-solid fa-file-import text-xs" />
              <input type="file" className="hidden" onChange={handleImport} accept=".json" />
            </label>
          </div>
          <div className="relative">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
            <input
              type="text"
              placeholder="Aktivite ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-amber-500 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
          {loading ? (
            <div className="p-6 text-center text-xs text-[var(--text-muted)]">Yükleniyor...</div>
          ) : (
            filteredCategories.map((cat) => (
              <div key={cat.id}>
                <div className="px-3 py-1 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-1 flex items-center gap-2">
                  <i className={cat.icon} /> {cat.title}
                </div>
                <div className="space-y-0.5">
                  {ACTIVITIES.filter((a) => cat.activities.includes(a.id)).map((act) => {
                    const promptId = `prompt_${act.id.toLowerCase()}`;
                    const isSelected = selected?.id === promptId;
                    const isSavedInDb = prompts.some((p) => p.id === promptId);
                    return (
                      <button
                        key={act.id}
                        onClick={() => handleSelect(act)}
                        className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2.5 relative overflow-hidden group ${
                          isSelected
                            ? 'bg-[var(--bg-paper)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-paper)]/60'
                        }`}
                      >
                        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />}
                        <i
                          className={`fa-solid fa-microchip text-[10px] ${
                            isSelected ? 'text-amber-500' : 'text-[var(--text-muted)]'
                          }`}
                        />
                        <span className="truncate flex-1">{act.title}</span>
                        {isSavedInDb && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                            title="Firestore'da özelleştirilmiş prompt mevcut"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* C: WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-paper)] relative">
        {selected ? (
          <>
            <div className="min-h-16 py-2 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between px-4 md:px-8 bg-[var(--bg-secondary)] shrink-0 z-10 gap-3">
              <div className="flex flex-col">
                <h3 className="font-black text-sm text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2.5">
                  {selected.name}
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[9px] font-bold">
                    DNA v{selected.version}
                  </span>
                </h3>
                <p
                  className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5"
                  title={linter.warnings.map((w) => w.text).join('\n')}
                >
                  Maliyet: ~{linter.tokens} tkns • Skor:{' '}
                  <span
                    className={
                      linter.score >= 90
                        ? 'text-emerald-500 font-bold'
                        : linter.score >= 50
                          ? 'text-amber-500 font-bold'
                          : 'text-red-500 font-bold'
                    }
                  >
                    {linter.score}/100
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExport}
                  className="px-3 py-1.5 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-[10px] font-black text-[var(--text-secondary)] hover:text-amber-500 transition-all uppercase tracking-wider"
                >
                  <i className="fa-solid fa-download mr-1.5" /> Dışa Aktar
                </button>
                <div className="flex bg-[var(--bg-paper)] p-1 rounded-xl border border-[var(--border-color)]">
                  {[
                    { id: 'editor' as const, label: 'Mimari', icon: 'fa-layer-group' },
                    { id: 'simulation' as const, label: 'Simülasyon', icon: 'fa-flask' },
                    { id: 'history' as const, label: 'Geçmiş', icon: 'fa-dna' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        activeTab === t.id
                          ? 'bg-[var(--accent-color)] text-white shadow'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <i className={`fa-solid ${t.icon}`} /> {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 md:p-6 relative flex flex-col min-h-0 min-w-0 overflow-y-auto lg:overflow-hidden">
              {activeTab === 'editor' && (
                <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0">
                  <div className="flex-1 flex flex-col rounded-2xl overflow-hidden shadow-md">
                    <CodeEditor
                      value={selected.template}
                      onChange={(v) => setSelected({ ...selected, template: v })}
                    />
                  </div>
                  <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 overflow-y-auto custom-scrollbar">
                    {/* Model Config */}
                    <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] p-4 space-y-3">
                      <h4 className="flex items-center gap-2 text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest">
                        <i className="fa-solid fa-sliders" /> Model Motoru
                      </h4>
                      <select
                        value={selected.modelConfig?.modelName || 'gemini-3.8-flash'}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            modelConfig: { ...selected.modelConfig, modelName: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-paper)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] outline-none"
                      >
                        {AVAILABLE_MODELS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-bold text-[var(--text-muted)]">
                          Yaratıcılık (Temp): {(selected.modelConfig?.temperature ?? 0.1).toFixed(1)}
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={selected.modelConfig?.temperature ?? 0.1}
                          onChange={(e) =>
                            setSelected({
                              ...selected,
                              modelConfig: {
                                ...selected.modelConfig,
                                temperature: parseFloat(e.target.value),
                              },
                            })
                          }
                          className="w-28 accent-[var(--accent-color)]"
                        />
                      </div>
                    </div>

                    {/* System Instruction */}
                    <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] p-4 flex flex-col">
                      <h4 className="flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">
                        <i className="fa-solid fa-brain" /> Persona Modeli (System)
                      </h4>
                      <textarea
                        value={selected.systemInstruction}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setSelected({ ...selected, systemInstruction: e.target.value })
                        }
                        rows={4}
                        className="w-full bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl p-2.5 text-[11px] font-mono leading-relaxed text-[var(--text-primary)] outline-none resize-none custom-scrollbar"
                        placeholder="Modelin temel rolü ve klinik ilkeleri..."
                      />
                    </div>

                    {/* Pedagojik Linter */}
                    <div className="flex-1 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] p-4 flex flex-col min-h-[160px]">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                          <i className="fa-solid fa-stethoscope" /> Pedagojik Linter
                        </h4>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                            linter.score >= 90
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                              : linter.score >= 70
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                : 'bg-red-500/10 border-red-500/20 text-red-500'
                          }`}
                        >
                          {linter.score}/100
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                        {linter.warnings.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-6 text-[var(--text-muted)]">
                            <i className="fa-solid fa-check-circle text-emerald-500 text-3xl mb-2" />
                            <p className="text-[10px] font-black tracking-widest uppercase">
                              Sıfır Bilişsel Yük Onayı
                            </p>
                          </div>
                        ) : (
                          linter.warnings.map((w, i) => (
                            <div
                              key={i}
                              className={`p-2.5 rounded-lg border flex flex-col gap-1 ${
                                w.type === 'error'
                                  ? 'bg-red-500/10 border-red-500/20'
                                  : w.type === 'warning'
                                    ? 'bg-amber-500/10 border-amber-500/20'
                                    : 'bg-sky-500/10 border-sky-500/20'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <i
                                  className={`fa-solid text-[10px] ${
                                    w.type === 'error'
                                      ? 'fa-triangle-exclamation text-red-500'
                                      : w.type === 'warning'
                                        ? 'fa-bolt text-amber-500'
                                        : 'fa-lightbulb text-sky-500'
                                  }`}
                                />
                                <span
                                  className={`text-[9px] font-black uppercase ${
                                    w.type === 'error'
                                      ? 'text-red-500'
                                      : w.type === 'warning'
                                        ? 'text-amber-500'
                                        : 'text-sky-500'
                                  }`}
                                >
                                  {w.type === 'error'
                                    ? 'Kritik İhlal'
                                    : w.type === 'warning'
                                      ? 'Pedagoji İkazu'
                                      : 'Öneri'}
                                </span>
                              </div>
                              <p className="text-[10px] leading-relaxed font-medium text-[var(--text-secondary)]">
                                {w.text}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'simulation' && (
                <div className="flex-1 min-h-0">
                  <PromptSimulator prompt={selected} />
                </div>
              )}

              {activeTab === 'history' && (
                <div className="h-full space-y-4 overflow-y-auto custom-scrollbar pr-2 max-w-3xl mx-auto w-full">
                  {(selected.history?.length || 0) === 0 && (
                    <div className="text-center p-20 text-[var(--text-muted)] flex flex-col items-center gap-3">
                      <i className="fa-solid fa-clock-rotate-left text-4xl opacity-30" />
                      <p className="text-xs font-black uppercase tracking-widest">
                        Henüz Kayıtlı Versiyon Geçmişi Yok
                      </p>
                    </div>
                  )}
                  {[...(selected.history || [])].reverse().map((h, i) => (
                    <div
                      key={i}
                      className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl flex justify-between items-center group hover:border-amber-500/50 transition-all shadow-sm relative overflow-hidden"
                    >
                      <div className="pl-2">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase">
                            DNA v{h.version}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">
                            {new Date(h.updatedAt).toLocaleString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-primary)] font-medium italic">
                          &quot;{h.changeLog}&quot;
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setShowRestoreModal({
                            version: h.version,
                            template: h.template,
                            systemInstruction: h.systemInstruction,
                          })
                        }
                        className="px-4 py-2 bg-[var(--bg-paper)] border border-[var(--border-color)] hover:bg-amber-500 hover:text-black text-[var(--text-primary)] text-[10px] font-black rounded-xl transition-all"
                      >
                        GERİ YÜKLE
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-16 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center px-6 justify-between shrink-0 z-20">
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-widest">
                    Aktif Çekirdek
                  </span>
                  <span className="text-[10px] text-[var(--text-primary)] font-mono">{selected.id}</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-[var(--border-color)]" />
                <div className="hidden sm:flex flex-col">
                  <span className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-widest">
                    Model Engine
                  </span>
                  <span className="text-[10px] text-[var(--text-primary)] font-mono">
                    {selected.modelConfig?.modelName || 'gemini-3.8-flash'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={isSaving || linter.score < 50}
                className={`px-6 md:px-10 py-2.5 font-black rounded-xl text-[11px] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 flex items-center gap-2 ${
                  linter.score < 50
                    ? 'bg-[var(--bg-paper)] text-[var(--text-muted)] border border-[var(--border-color)]'
                    : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg'
                }`}
              >
                {isSaving ? (
                  <>
                    <i className="fa-solid fa-dna fa-spin" /> Kaydediliyor
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-bolt" /> Mimariyi Kaydet
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] p-12 text-center select-none">
            <div className="w-24 h-24 border border-[var(--border-color)] rounded-full flex items-center justify-center text-3xl mb-6 bg-[var(--bg-secondary)] shadow-inner">
              <i className="fa-solid fa-fingerprint text-amber-500 animate-pulse" />
            </div>
            <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2 tracking-tight">
              Kognitif Mimari Laboratuvarı
            </h3>
            <p className="max-w-md text-xs text-[var(--text-secondary)] leading-relaxed">
              Özel eğitim etkinliklerinin yapay zeka tarafından nasıl üretileceğini yapılandırmak,
              pedagojik linterden geçirmek ve canlı simüle etmek için sol listeden bir aktivite seçin.
            </p>
          </div>
        )}
      </div>

      {/* R: SNIPPETS */}
      {selected && activeTab === 'editor' && (
        <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col shrink-0 z-10 max-h-60 lg:max-h-none">
          <div className="p-4 border-b border-[var(--border-color)] flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                Kognitif Bloklar
              </span>
              <button
                onClick={() => {
                  const newSnip: PromptSnippet = {
                    id: `snip_${Date.now()}`,
                    label: 'YENİ BLOK',
                    value: '',
                  };
                  setSnippets([...snippets, newSnip]);
                  setSnippetEditLabel('YENİ BLOK');
                  setSnippetEditValue('');
                  setShowSnippetModal(newSnip.id);
                }}
                className="text-[var(--text-muted)] hover:text-emerald-500 transition-colors"
                title="Yeni Blok Ekle"
              >
                <i className="fa-solid fa-plus-circle" />
              </button>
            </div>
            <p className="text-[9px] text-[var(--text-muted)] font-medium">
              Tıklayarak şablona pedagojik blok ekleyin
            </p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5 bg-[var(--bg-paper)]">
            {snippets.length === 0 && (
              <div className="text-center p-8 text-[var(--text-muted)] text-[10px] uppercase tracking-widest font-bold">
                Blok Havuzu Boş
              </div>
            )}
            {snippets.map((s: PromptSnippet) => (
              <div
                key={s.id}
                className="group p-3.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl relative hover:border-emerald-500/50 transition-all cursor-pointer shadow-sm"
                onClick={() =>
                  selected &&
                  setSelected({ ...selected, template: `${selected.template}\n\n${s.value}` })
                }
              >
                <h5 className="text-[10px] font-black text-[var(--text-primary)] mb-1 uppercase pr-6 leading-tight">
                  {s.label}
                </h5>
                <p className="text-[9px] text-[var(--text-muted)] line-clamp-3 font-mono leading-relaxed">
                  {s.value.substring(0, 100)}
                </p>
                <button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setSnippetEditLabel(s.label);
                    setSnippetEditValue(s.value);
                    setShowSnippetModal(s.id);
                  }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-emerald-500 transition-colors"
                >
                  <i className="fa-solid fa-pen text-[9px]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Save Modal ── */}
      {showSaveModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => setShowSaveModal(false)}
        >
          <div
            className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-3xl p-8 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">
              Mimari Evrim Kaydı
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-5">
              Değişiklik notu girin — bu versiyon geçmişine ve Firestore’a kaydedilecektir.
            </p>
            <textarea
              value={saveNote}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSaveNote(e.target.value)}
              className="w-full h-24 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 text-sm text-[var(--text-primary)] outline-none resize-none focus:border-amber-500 transition-all"
              placeholder="Örn: ZPD yönergesi ve pedagogicalNote şeması güçlendirildi..."
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveNote('');
                }}
                className="flex-1 py-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl text-xs font-black uppercase tracking-widest"
              >
                Vazgeç
              </button>
              <button
                onClick={handleSaveWithNote}
                disabled={!saveNote.trim() || isSaving}
                className="flex-[2] py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isSaving ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-dna" />}
                {isSaving ? 'Kaydediliyor...' : 'Mimariyi Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Restore Modal ── */}
      {showRestoreModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => setShowRestoreModal(null)}
        >
          <div
            className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-3xl p-8 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">
              DNA Geri Yükleme
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Prompt taslağı DNA v{showRestoreModal.version} sürümüne döndürülecek. Onaylıyor musunuz?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRestoreModal(null)}
                className="flex-1 py-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl text-xs font-black uppercase"
              >
                İptal
              </button>
              <button
                onClick={handleRestore}
                className="flex-[2] py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl text-xs font-black uppercase"
              >
                GERİ YÜKLE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Snippet Edit Modal ── */}
      {showSnippetModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => setShowSnippetModal(null)}
        >
          <div
            className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-3xl p-8 w-full max-w-lg shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-wider">
              Kognitif Blok Düzenle
            </h3>
            <input
              type="text"
              value={snippetEditLabel}
              onChange={(e) => setSnippetEditLabel(e.target.value)}
              placeholder="Blok başlığı..."
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] outline-none"
            />
            <textarea
              value={snippetEditValue}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSnippetEditValue(e.target.value)}
              className="w-full h-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 text-sm font-mono text-[var(--text-primary)] outline-none resize-none"
              placeholder="Pedagojik parametreler..."
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSnippetModal(null)}
                className="flex-1 py-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl text-xs font-black uppercase"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  if (showSnippetModal) {
                    const updated = snippets.map((s) =>
                      s.id === showSnippetModal
                        ? { ...s, label: snippetEditLabel || s.label, value: snippetEditValue }
                        : s
                    );
                    setSnippets(updated);
                    const target = updated.find((s) => s.id === showSnippetModal);
                    if (target) adminService.saveSnippet(target);
                    toast.success('Kognitif blok kaydedildi');
                    setShowSnippetModal(null);
                  }
                }}
                className="flex-[2] py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl text-xs font-black uppercase"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
