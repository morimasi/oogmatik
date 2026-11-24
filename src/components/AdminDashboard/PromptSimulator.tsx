import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AppError } from '../../utils/AppError';
import { logger, logError } from '../../utils/logger';
import { PromptTemplate } from '../../types/admin';
import { adminService } from '../../services/adminService';
import { WorksheetData, SingleWorksheetData, ActivityType } from '../../types/core';
import { useToastStore } from '../../store/useToastStore';

// Break circular dependency with lazy loading
const SheetRenderer = lazy(() => import('../SheetRenderer').then((m) => ({ default: m.SheetRenderer })));

const detectActivityType = (promptId: string): ActivityType | null => {
  const rawId = promptId.replace(/^prompt_/i, '').toUpperCase();
  if (rawId in ActivityType) {
    return rawId as ActivityType;
  }
  if (rawId.includes('READING')) return ActivityType.STORY_COMPREHENSION;
  if (rawId.includes('MATH')) return ActivityType.MATH_PUZZLE;
  if (rawId.includes('VISUAL')) return ActivityType.VISUAL_ODD_ONE_OUT;
  return null;
};

interface StressTestSummary {
  totalTests: number;
  successCount: number;
  stabilityScore: number;
}

const PRESET_PROFILES = [
  {
    label: 'Disleksi · 8-10 Yaş · Orta',
    values: {
      profile: 'dyslexia',
      ageGroup: '8-10',
      difficulty: 'Orta',
      blueprint: 'Disleksi dostu hece ve fonolojik farkındalık odaklı, düşük bilişsel yüklü aktivite.',
      topic: 'Doğa ve Hayvanlar',
    },
  },
  {
    label: 'DEHB · 5-7 Yaş · Kolay',
    values: {
      profile: 'adhd',
      ageGroup: '5-7',
      difficulty: 'Kolay',
      blueprint: '5 dakikalık mikro-döngü, net tek adımlı yönerge ve yüksek görsel kontrast.',
      topic: 'Günlük Yaşam',
    },
  },
  {
    label: 'Diskalkuli · 11-13 Yaş · Zor',
    values: {
      profile: 'dyscalculia',
      ageGroup: '11-13',
      difficulty: 'Zor',
      blueprint: 'Somuttan soyuta sayısal akıl yürütme, görsel modelleme ve adım adım çözüm.',
      topic: 'Günlük Problem Çözme',
    },
  },
];

export const PromptSimulator: React.FC<{ prompt: PromptTemplate }> = ({ prompt }) => {
  const toast = useToastStore();
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [result, setResult] = useState<WorksheetData>(null);
  const [loading, setLoading] = useState(false);
  const [stressLoading, setStressLoading] = useState(false);
  const [stressSummary, setStressSummary] = useState<StressTestSummary | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'json'>('preview');

  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType>(
    detectActivityType(prompt.id) ?? ActivityType.MATH_PUZZLE
  );

  useEffect(() => {
    setSelectedActivityType(detectActivityType(prompt.id) ?? ActivityType.MATH_PUZZLE);
  }, [prompt.id]);

  useEffect(() => {
    const matches = prompt.template.match(/\{\{(.*?)\}\}/g);
    const vars: string[] = matches
      ? [...new Set(matches.map((m: string) => m.replace(/\{|\}/g, '').trim()))]
      : [];

    const initialVars: Record<string, string> = {};
    vars.forEach((v: string) => {
      initialVars[v] = '';
    });
    setVariables(initialVars);
    setResult(null);
    setStressSummary(null);
    setLatencyMs(null);
  }, [prompt.template]);

  const applyPreset = (presetValues: Record<string, string>) => {
    setVariables((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        const lower = key.toLowerCase();
        if (lower.includes('profile') || lower.includes('profil')) next[key] = presetValues.profile;
        else if (lower.includes('age') || lower.includes('yas')) next[key] = presetValues.ageGroup;
        else if (lower.includes('diff') || lower.includes('zorluk')) next[key] = presetValues.difficulty;
        else if (lower.includes('blueprint') || lower.includes('dna')) next[key] = presetValues.blueprint;
        else if (lower.includes('topic') || lower.includes('konu')) next[key] = presetValues.topic;
        else if (!next[key]) next[key] = presetValues.blueprint;
      });
      return next;
    });
    toast.info('Parametreler seçilen klinik profile göre dolduruldu.');
  };

  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const aiResponse = await adminService.testPrompt(prompt, variables);
      logger.info('AI yanıtı alındı', { responseType: typeof aiResponse });

      if (!aiResponse || typeof aiResponse !== 'object') {
        throw new AppError('AI geçerli bir JSON nesnesi döndürmedi.', 'INTERNAL_ERROR', 500);
      }

      setLatencyMs(Math.round(performance.now() - start));
      setResult(aiResponse as unknown as WorksheetData);
      toast.success('Simülasyon tamamlandı.');
    } catch (err: unknown) {
      logError(err instanceof Error ? err : String(err));
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleStressTest = async () => {
    setStressLoading(true);
    setError(null);
    try {
      const summary = await adminService.stressTestPrompt(prompt, variables, 3);
      setStressSummary({
        totalTests: summary.totalTests,
        successCount: summary.successCount,
        stabilityScore: summary.stabilityScore,
      });
      toast.success(`Kararlılık testi tamamlandı: %${Math.round(summary.stabilityScore)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setStressLoading(false);
    }
  };

  const handleCopyJson = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      toast.success('JSON panoya kopyalandı.');
    } catch {
      toast.error('Kopyalama başarısız.');
    }
  };

  const handleDownloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prompt.id}_simulasyon.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Simülasyon JSON indirildi.');
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* SOL PANEL: KONTROL & DEĞİŞKENLER */}
      <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-sliders text-[var(--accent-color)]" />
            <span className="text-xs font-black uppercase tracking-widest">Simülasyon</span>
          </div>
          {latencyMs !== null && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
              {latencyMs}ms
            </span>
          )}
        </div>

        {/* Klinik Profil Hazır Doldurma */}
        {Object.keys(variables).length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block">
              Hızlı Klinik Ön-Doldurma
            </span>
            <div className="flex flex-col gap-1.5">
              {PRESET_PROFILES.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset.values)}
                  className="text-left px-3 py-1.5 rounded-lg bg-[var(--bg-paper)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {Object.keys(variables).length === 0 ? (
          <div className="p-4 bg-[var(--bg-paper)] rounded-xl border border-[var(--border-color)] text-center">
            <span className="text-[10px] text-[var(--text-muted)] font-mono">Değişken yok (Statik Prompt)</span>
          </div>
        ) : (
          Object.keys(variables).map((v: string) => (
            <div key={v} className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--accent-color)] uppercase ml-1 block">{v}</label>
              <input
                type="text"
                value={variables[v]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setVariables({ ...variables, [v]: e.target.value })
                }
                className="w-full bg-[var(--bg-paper)] border border-[var(--border-color)] focus:border-[var(--accent-color)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--text-primary)] outline-none transition-all"
                placeholder="Değer girin..."
              />
            </div>
          ))
        )}

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={handleSimulate}
            disabled={loading || stressLoading}
            className="w-full py-3 bg-[var(--accent-color)] hover:opacity-90 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
          >
            {loading ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-play" />}
            {loading ? 'Üretiliyor...' : 'Simülasyonu Başlat'}
          </button>

          <button
            onClick={handleStressTest}
            disabled={loading || stressLoading}
            className="w-full py-2.5 bg-[var(--bg-paper)] border border-[var(--border-color)] hover:border-amber-500 text-[var(--text-primary)] font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {stressLoading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-gauge-high text-amber-500" />}
            {stressLoading ? '3x Test Ediliyor...' : '3x Kararlılık (Stress) Testi'}
          </button>
        </div>

        {stressSummary && (
          <div className="p-3 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] space-y-1">
            <div className="flex items-center justify-between text-[10px] font-black uppercase">
              <span className="text-[var(--text-muted)]">Kararlılık Skoru</span>
              <span className={stressSummary.stabilityScore >= 80 ? 'text-emerald-500' : 'text-amber-500'}>
                %{Math.round(stressSummary.stabilityScore)}
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-mono">
              {stressSummary.successCount}/{stressSummary.totalTests} başarılı JSON üretimi
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-medium">
            <i className="fa-solid fa-triangle-exclamation mr-2" />
            {error}
          </div>
        )}

        {/* Renderer Override */}
        <div className="mt-2 pt-4 border-t border-[var(--border-color)]">
          <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase block mb-2">
            Render Motoru (Önizleme)
          </label>
          {!detectActivityType(prompt.id) && (
            <p className="text-[9px] text-amber-500 font-bold mb-2">
              Aktivite tipi ID’den algılanamadı; aşağıdan seçin.
            </p>
          )}
          <select
            value={selectedActivityType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedActivityType(e.target.value as ActivityType)
            }
            className="w-full bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg py-2 px-2 text-[10px] text-[var(--text-primary)] outline-none"
          >
            {Object.values(ActivityType).map((t: ActivityType) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SAĞ PANEL: ÖNİZLEME */}
      <div className="flex-1 flex flex-col bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden relative shadow-sm min-h-[420px]">
        <div className="h-12 border-b border-[var(--border-color)] bg-[var(--bg-paper)] flex items-center justify-between px-4 gap-2">
          <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-eye text-emerald-500" /> Canlı Önizleme
          </span>
          <div className="flex items-center gap-2">
            {result && (
              <>
                <button
                  onClick={handleCopyJson}
                  className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[9px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  title="JSON Kopyala"
                >
                  <i className="fa-solid fa-copy mr-1" /> Kopyala
                </button>
                <button
                  onClick={handleDownloadJson}
                  className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[9px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  title="JSON İndir"
                >
                  <i className="fa-solid fa-download mr-1" /> İndir
                </button>
              </>
            )}
            <div className="flex bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)]">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${
                  viewMode === 'preview'
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                GÖRSEL
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${
                  viewMode === 'json'
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                JSON (HAM)
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[var(--bg-paper)] relative custom-scrollbar">
          {!result ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-muted)] select-none p-6 text-center">
              <div className="w-16 h-16 rounded-full border-2 border-[var(--border-color)] flex items-center justify-center text-2xl mb-3">
                <i className="fa-solid fa-flask" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest">Henüz Veri Yok</p>
              <p className="text-[10px] mt-1 max-w-[240px]">
                Simülasyonu başlatarak yapay zekanın ürettiği A4 içeriğini veya ham JSON çıktısını burada test edebilirsiniz.
              </p>
            </div>
          ) : viewMode === 'json' ? (
            <pre className="p-6 text-[11px] font-mono text-emerald-500 whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(result, null, 2)}
            </pre>
          ) : (
            <div className="p-6 transform scale-95 origin-top h-full overflow-y-auto">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-40 text-[var(--text-muted)] text-xs uppercase font-black">
                    <i className="fa-solid fa-circle-notch fa-spin mr-2" />
                    Renderer Yükleniyor...
                  </div>
                }
              >
                <SheetRenderer
                  activityType={selectedActivityType}
                  data={(Array.isArray(result) ? result[0] : result) as SingleWorksheetData}
                  settings={{
                    fontFamily: 'Lexend',
                    fontSize: 16,
                    showTitle: true,
                    showStudentInfo: false,
                    showFooter: true,
                    showAnswers: false,
                    showClues: false,
                    themeBorder: 'simple',
                    scale: 1,
                    borderColor: '#000',
                    borderWidth: 1,
                    margin: 10,
                    columns: 1,
                    gap: 10,
                    orientation: 'portrait',
                    contentAlign: 'center',
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                    visualStyle: 'card',
                    lineHeight: 1.5,
                    letterSpacing: 0,
                    wordSpacing: 0,
                    paragraphSpacing: 10,
                    showMascot: false,
                    showInstruction: true,
                    showImage: false,
                    smartPagination: false,
                    footerText: '',
                  }}
                />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
