// @ts-nocheck
import React from 'react';
import { PromptTemplate, PromptSnippet, PromptVersion } from '../types/admin';
import { adminService } from '../services/adminService';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../constants';
import { ActivityType } from '../types';

import { PromptSimulator } from './PromptSimulator';

// --- ULTRA-MINIMALIST CODE EDITOR (Lexical Highlighting) ---
const CodeEditor = ({
  value,
  onChange,
  readOnly = false,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
}) => {
  const preRef = (React as any).useRef(null as HTMLPreElement | null);
  const textRef = (React as any).useRef(null as HTMLTextAreaElement | null);

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
        onChange={(e: any) => onChange?.(e.target.value)}
        onScroll={syncScroll}
        readOnly={readOnly}
        spellCheck={false}
        className="absolute inset-0 left-10 w-[calc(100%-40px)] p-4 m-0 bg-transparent text-transparent caret-white outline-none resize-none leading-[22px] whitespace-pre-wrap break-words selection:bg-indigo-500/30 custom-scrollbar"
      />
    </div>
  );
};

// --- CORE COMPONENT ---
export const AdminPromptStudio = () => {
  const [prompts, setPrompts] = (React as any).useState([] as PromptTemplate[]);
  const [selected, setSelected] = (React as any).useState(null as PromptTemplate | null);
  const [snippets, setSnippets] = (React as any).useState([] as PromptSnippet[]);
  const [loading, setLoading] = (React as any).useState(true);
  const [isSaving, setIsSaving] = (React as any).useState(false);
  const [testVars, setTestVars] = (React as any).useState({} as Record<string, string>);
  const [activeTab, setActiveTab] = (React as any).useState(
    'editor' as 'editor' | 'history' | 'simulation'
  );

  // A/B Testing States
  const [simA, setSimA] = (React as any).useState({ result: '', loading: false, temp: 0.1 } as {
    result: string;
    loading: boolean;
    temp: number;
  });
  const [simB, setSimB] = (React as any).useState({ result: '', loading: false, temp: 0.8 } as {
    result: string;
    loading: boolean;
    temp: number;
  });

  (React as any).useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [p, s] = await Promise.all([adminService.getAllPrompts(), adminService.getAllSnippets()]);
    setPrompts(p);
    setSnippets(s);
    setLoading(false);
  };

  const variables = (React as any).useMemo(() => {
    if (!selected) return [];
    const matches = (selected as any).template.match(/\{\{(.*?)\}\}/g);
    return matches ? [...new Set(matches.map((m: string) => m.replace(/\{|\}/g, '')))] : [];
  }, [selected]);

  // Ozel Linter Engine (Pedagogical Load & Constraints)
  const linter = (React as any).useMemo(() => {
    if (!selected) return { score: 100, warnings: [], tokens: 0 };
    const full = (selected.template + ' ' + selected.systemInstruction).toLowerCase();
    const warnings: { type: 'error' | 'warning' | 'info'; text: string }[] = [];

    // Disleksi Kritik Kuralları
    if (full.includes('yapma') || full.includes('yasak') || full.includes('hayır')) {
      warnings.push({
        type: 'error',
        text: 'Negatif yükleme tespit edildi. Dislektik zihin "yapmayı bırak" yönergelerini işlerken belleği zorlar. Daima "şunu yap" şeklinde pozitif komutlar verin.',
      });
    }
    if (!full.includes('json')) {
      warnings.push({
        type: 'warning',
        text: 'Çıktı formatı belirtilmemiş. Uygulama bütünlüğü için JSON dönülmesi zorunlu kılınmalıdır.',
      });
    }
    if (full.includes('karmaşık') || full.includes('uzun')) {
      warnings.push({
        type: 'warning',
        text: 'Bilişsel yük asimetrisi: "Uzun" veya "Karmaşık" metinler okuma güçlüğü çeken öğrencileri hedeften saptırır.',
      });
    }
    if (!full.includes('görsel') && !full.includes('imge') && !full.includes('resim')) {
      warnings.push({
        type: 'info',
        text: 'Multisensoriyel yoksunluk: Etkinlik içerisinde görsel bir referans veya imgelem (imagery) istenmemiş.',
      });
    }

    const exactTokens = Math.floor(full.length / 4.2);
    let score =
      100 -
      warnings.filter((w: any) => w.type === 'error').length * 25 -
      warnings.filter((w: any) => w.type === 'warning').length * 15;
    if (exactTokens > 1500) score -= 15; // Too long for consistent results

    return { score: Math.max(0, score), warnings, tokens: exactTokens };
  }, [selected?.template, selected?.systemInstruction]);

  const handleSelect = async (act: any) => {
    const id = `prompt_${act.id.toLowerCase()}`;
    let p = prompts.find((x: PromptTemplate) => x.id === id);
    if (!p) {
      p = {
        id,
        name: `${act.title} Mimarisi`,
        description: '',
        category: 'custom',
        systemInstruction:
          'Sen bir MÖES (Multisensoriyel Özel Eğitim Sistemi) uzmanısın. Disleksi klinik ilkeleriyle düşünür, kısa ve net hedefler koyarsın.',
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
    setSimA((prev: any) => ({ ...prev, result: '' }));
    setSimB((prev: any) => ({ ...prev, result: '' }));
    setActiveTab('editor');
  };

  const handleSave = async () => {
    if (!selected) return;
    const note = prompt(
      'Mimari Evrim Kaydı (Değişiklik Logu):',
      'Derinlemesine kognitif optimizasyon'
    );
    if (!note) return;
    setIsSaving(true);
    try {
      const saved = await adminService.savePrompt({ ...selected, variables }, note);
      setPrompts((prev: PromptTemplate[]) =>
        prev.map((p: PromptTemplate) => (p.id === saved.id ? saved : p))
      );
      setSelected(saved);
    } finally {
      setIsSaving(false);
    }
  };

  const runSimulation = async (variant: 'A' | 'B') => {
    if (!selected) return;

    variant === 'A'
      ? setSimA((p: any) => ({ ...p, loading: true, result: '' }))
      : setSimB((p: any) => ({ ...p, loading: true, result: '' }));
    const t = variant === 'A' ? simA.temp : simB.temp;

    try {
      // Modify selected config temporarily just to simulate
      const tempSelected = {
        ...selected,
        modelConfig: { ...selected.modelConfig, temperature: t },
      };
      // Simulate variable injection inside the service or here
      const mockResult = await adminService.testPrompt(tempSelected, testVars);
      const strRes = JSON.stringify(mockResult, null, 2);
      variant === 'A'
        ? setSimA((p: any) => ({ ...p, result: strRes }))
        : setSimB((p: any) => ({ ...p, result: strRes }));
    } catch (e: any) {
      variant === 'A'
        ? setSimA((p: any) => ({ ...p, result: `HATA: ${e.message}` }))
        : setSimB((p: any) => ({ ...p, result: `HATA: ${e.message}` }));
    } finally {
      variant === 'A'
        ? setSimA((p: any) => ({ ...p, loading: false }))
        : setSimB((p: any) => ({ ...p, loading: false }));
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-[#030303] rounded-3xl border border-zinc-900 overflow-hidden shadow-2xl font-lexend">
      {/* L: EXPLORER PANEL */}
      <div className="w-64 border-r border-zinc-900 bg-[#080808] flex flex-col shrink-0">
        <div className="p-5 border-b border-zinc-900/50 flex flex-col gap-1">
          <span className="text-[10px] font-black text-amber-500/70 uppercase tracking-[0.2em]">
            Prompt Engine
          </span>
          <h2 className="text-zinc-200 text-sm font-bold">Sinir Ağları</h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
          {ACTIVITY_CATEGORIES.map((cat) => (
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
                    <i
                      className={`fa-solid fa-microchip text-[10px] ${selected?.id === `prompt_${act.id.toLowerCase()}` ? 'text-amber-500' : 'text-zinc-700 group-hover:text-zinc-500'}`}
                    ></i>
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
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[9px] font-bold">
                    DNA v{selected.version}
                  </span>
                </h3>
                <p
                  className="text-[10px] text-zinc-600 font-mono mt-0.5"
                  title={linter.warnings.map((w: any) => w.text).join('\n')}
                >
                  Maliyet: ~{linter.tokens} tkns • Skor:{' '}
                  <span
                    className={
                      linter.score >= 90
                        ? 'text-emerald-500'
                        : linter.score >= 50
                          ? 'text-amber-500'
                          : 'text-red-500'
                    }
                  >
                    {linter.score}/100
                  </span>
                </p>
              </div>
              <div className="flex bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800/50">
                {[
                  { id: 'editor', label: 'Mimarİ', icon: 'fa-layer-group' },
                  { id: 'simulation', label: 'CANLI SİMÜLASYON', icon: 'fa-flask' },
                  { id: 'history', label: 'Evrİm Geçmİşİ', icon: 'fa-dna' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === t.id ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <i className={`fa-solid ${t.icon}`}></i> {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 p-6 relative flex flex-col min-h-0 min-w-0">
              {/* TAB 1: ARCHITECTURE */}
              {activeTab === 'editor' && (
                <div className="flex-1 flex gap-6 min-h-0">
                  <div className="flex-1 flex flex-col rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <CodeEditor
                      value={selected.template}
                      onChange={(v) => setSelected({ ...selected, template: v })}
                    />
                  </div>
                  <div className="w-80 flex flex-col gap-5 shrink-0">
                    <div className="h-1/3 bg-[#0a0a0a] rounded-2xl border border-zinc-800/50 p-5 flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-3xl pointer-events-none"></div>
                      <h4 className="flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 z-10">
                        <i className="fa-solid fa-brain"></i> Persona Modeli (System)
                      </h4>
                      <textarea
                        value={selected.systemInstruction}
                        onChange={(e: any) =>
                          setSelected({ ...selected, systemInstruction: e.target.value })
                        }
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
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded shadow-sm border ${linter.score >= 90 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : linter.score >= 70 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
                        >
                          {linter.score}/100
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 z-10">
                        {linter.warnings.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-zinc-600 opacity-50">
                            <i className="fa-solid fa-check-circle text-emerald-500 text-4xl mb-3 block"></i>
                            <p className="text-[10px] font-black tracking-widest uppercase">
                              Sıfır Kognitif Yük.
                            </p>
                          </div>
                        ) : (
                          linter.warnings.map((w: any, i: number) => (
                            <div
                              key={i}
                              className={`p-3 rounded-lg border flex flex-col gap-1.5 transition-all ${w.type === 'error' ? 'bg-red-500/5 border-red-500/20' : w.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-sky-500/5 border-sky-500/20'}`}
                            >
                              <div className="flex items-center gap-2">
                                <i
                                  className={`fa-solid text-[10px] ${w.type === 'error' ? 'fa-triangle-exclamation text-red-500' : w.type === 'warning' ? 'fa-bolt text-amber-500' : 'fa-lightbulb text-sky-500'}`}
                                ></i>
                                <span
                                  className={`text-[9px] font-black uppercase ${w.type === 'error' ? 'text-red-500' : w.type === 'warning' ? 'text-amber-500' : 'text-sky-500'}`}
                                >
                                  {w.type === 'error'
                                    ? 'Kritik İhlal'
                                    : w.type === 'warning'
                                      ? 'Metodoloji İkazu'
                                      : 'Tavsiye'}
                                </span>
                              </div>
                              <p
                                className={`text-[10px] leading-relaxed font-medium ${w.type === 'error' ? 'text-red-400/80' : w.type === 'warning' ? 'text-amber-400/80' : 'text-sky-400/80'}`}
                              >
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

              {/* TAB 2: LIVE SIMULATION */}
              {activeTab === 'simulation' && (
                <div className="flex-1 min-h-0 animate-in fade-in duration-300">
                  <PromptSimulator prompt={selected} />
                </div>
              )}

              {/* TAB 3: HISTORY */}
              {activeTab === 'history' && (
                <div className="h-full space-y-4 overflow-y-auto custom-scrollbar pr-2 max-w-3xl mx-auto w-full">
                  {(selected.history?.length || 0) === 0 && (
                    <div className="text-center p-32 text-zinc-600 flex flex-col items-center gap-4">
                      <i className="fa-solid fa-clock-rotate-left text-5xl opacity-20"></i>
                      <p className="text-[10px] font-black uppercase tracking-widest">
                        Kayıtsız Organizma.
                      </p>
                    </div>
                  )}
                  {[...(selected.history || [])].reverse().map((h, i) => (
                    <div
                      key={i}
                      className="p-6 bg-[#0a0a0a] border border-zinc-800/50 rounded-2xl flex justify-between items-center group hover:border-amber-500/50 transition-all shadow-lg relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-zinc-800 group-hover:bg-amber-500 transition-colors"></div>
                      <div className="pl-4">
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest">
                            DNA V.{h.version}
                          </span>
                          <span className="text-[9px] text-zinc-600 font-mono tracking-widest">
                            {new Date(h.updatedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 font-medium italic select-all">
                          "{h.changeLog}"
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              'Sistemin nöral yolları eski dna dizişine döndürülecek. Onaylıyor musunuz?'
                            )
                          )
                            setSelected({
                              ...selected,
                              template: h.template,
                              systemInstruction: h.systemInstruction || selected.systemInstruction,
                            });
                        }}
                        className="px-6 py-2.5 bg-zinc-800 hover:bg-amber-500 hover:text-black text-white text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 transition-all transform active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                      >
                        KLONLA & UYGULA
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-20 border-t border-zinc-900/80 bg-[#080808] flex items-center px-8 justify-between shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
              <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="text-[8px] text-zinc-600 font-black uppercase mb-0.5 tracking-widest">
                    Aktif Çekirdek
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono tracking-wider">
                    {selected.id}
                  </span>
                </div>
                <div className="w-px h-6 bg-zinc-800"></div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-zinc-600 font-black uppercase mb-0.5 tracking-widest">
                    Model Engine
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono tracking-wider">
                    {selected.modelConfig?.modelName || 'gemini-2.5-flash'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving || linter.score < 50}
                className={`px-12 py-3.5 text-black font-black rounded-2xl text-[11px] uppercase tracking-widest transition-all transform active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-3 ${linter.score < 50 ? 'bg-zinc-800 text-zinc-600' : 'bg-amber-500 hover:bg-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)]'}`}
              >
                {isSaving ? (
                  <>
                    <i className="fa-solid fa-dna fa-spin"></i> HÜCRESEL YAZIM
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-bolt"></i> MİMARİYİ ZİHNİNE KAZI
                  </>
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
              <svg
                className="absolute inset-0 w-full h-full text-zinc-800 animate-spin-slow"
                viewBox="0 0 100 100"
                style={{ animationDuration: '20s' }}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="5, 10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="10, 20"
                />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-zinc-400 mb-4 tracking-tighter mix-blend-screen">
              Kognitif Mimari Laboratuvarı
            </h3>
            <p className="max-w-md text-[11px] text-zinc-600 leading-relaxed font-medium uppercase tracking-widest">
              Özel eğitim etkinliklerinin yapay zeka tarafından nasıl düşünüleceğini yapılandırmak
              için sol havuzdan bir aktivite nöronu seçin. Negatif dil kullanmaktan kaçının.
            </p>
          </div>
        )}
      </div>

      {/* R: SNIPPETS */}
      {selected && activeTab === 'editor' && (
        <div className="w-72 border-l border-zinc-900 bg-[#080808] flex flex-col shrink-0 z-10">
          <div className="p-5 border-b border-zinc-900/50 flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                Kognitif Bloklar
              </span>
              <button
                onClick={() =>
                  setSnippets([
                    ...snippets,
                    { id: `new_${Date.now()}`, label: 'YENİ BLOK', value: '...' },
                  ])
                }
                className="text-zinc-600 hover:text-emerald-500 transition-colors"
              >
                <i className="fa-solid fa-plus-circle"></i>
              </button>
            </div>
            <p className="text-[9px] text-zinc-600 font-medium">
              Sık kullanılan pedagojik parametreler
            </p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 bg-[#050505]">
            {snippets.length === 0 && (
              <div className="text-center p-10 text-zinc-700 text-[9px] uppercase tracking-widest font-black">
                Havuz Boş
              </div>
            )}
            {snippets.map((s: PromptSnippet) => (
              <div
                key={s.id}
                className="group p-4 bg-[#0a0a0a] border border-zinc-800/50 rounded-2xl relative hover:border-emerald-500/40 transition-all cursor-pointer shadow-lg overflow-hidden"
                onClick={() =>
                  selected &&
                  setSelected({ ...selected, template: selected.template + '\n\n' + s.value })
                }
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 blur-2xl pointer-events-none"></div>
                <h5 className="text-[9px] font-black text-zinc-300 mb-2 uppercase pr-6 leading-tight tracking-wider">
                  {s.label}
                </h5>
                <p className="text-[9px] text-zinc-500 line-clamp-3 font-mono leading-relaxed relative z-10">
                  "{s.value.substring(0, 100)}..."
                </p>
                <button
                  onClick={(e: any) => {
                    e.stopPropagation();
                    const val = prompt('Yönerge İçeriği:', s.value);
                    if (val) adminService.saveSnippet({ ...s, value: val });
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
    </div>
  );
};
