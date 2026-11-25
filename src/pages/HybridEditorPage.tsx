import React from 'react';
import { ArrowLeft, CheckCircle2, Clock3, Trash2, TriangleAlert } from 'lucide-react';
import { HybridEditor } from '../components/hybrid-editor';
import type { HybridDocumentSchema } from '../components/hybrid-editor';
import { createEmptyDocument } from '../components/hybrid-editor/types/editor.types';
import { parseHybridDocumentJson } from '../components/hybrid-editor/utils/exportEngine';
import {
  clearHybridDraft,
  readHybridDraft,
  writeHybridDraft,
  type DraftStorageMeta,
} from '../services/hybridEditorDraftService';
import { useAuthStore } from '../store/useAuthStore';

const AUTOSAVE_DELAY = 900;

type SaveState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; meta: DraftStorageMeta }
  | { kind: 'error'; message: string };

const formatTime = (timestamp: number): string =>
  new Date(timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

/**
 * Hibrit Belge & Vektör Stüdyosu — editörü uygulama kabuğuna bağlayan sayfa.
 * Otomatik taslak kaydı ve açılışta geri yükleme burada yönetilir.
 */
const HybridEditorPage = ({ onBack }: { onBack?: () => void }) => {
  const { user } = useAuthStore();
  const ownerKey = user?.id ?? null;

  const bootstrapped = React.useMemo<{ doc: HybridDocumentSchema; restoredAt: number | null }>(
    () => {
      const draft = readHybridDraft(undefined, ownerKey);
      if (draft) {
        const parsed = parseHybridDocumentJson(draft.json);
        if (parsed.ok) return { doc: parsed.doc, restoredAt: draft.savedAt };
      }
      return { doc: createEmptyDocument('Hibrit Çalışma'), restoredAt: null };
    },
    [ownerKey]
  );

  const [saveState, setSaveState] = React.useState<SaveState>(
    bootstrapped.restoredAt
      ? {
          kind: 'saved',
          meta: {
            savedAt: bootstrapped.restoredAt,
            title: bootstrapped.doc.title,
            bytes: 0,
          },
        }
      : { kind: 'idle' }
  );
  const latestRef = React.useRef<HybridDocumentSchema>(bootstrapped.doc);
  const timerRef = React.useRef<number | null>(null);

  const flush = React.useCallback(() => {
    const doc = latestRef.current;
    const result = writeHybridDraft(JSON.stringify(doc), { title: doc.title }, undefined, ownerKey);
    setSaveState(
      result.ok ? { kind: 'saved', meta: result.meta } : { kind: 'error', message: result.message }
    );
  }, [ownerKey]);

  const handleDocumentChange = React.useCallback(
    (doc: HybridDocumentSchema) => {
      latestRef.current = doc;
      setSaveState({ kind: 'saving' });
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        flush();
      }, AUTOSAVE_DELAY);
    },
    [flush]
  );

  React.useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
        flush();
      }
    },
    [flush]
  );

  const handleClearDraft = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    clearHybridDraft(undefined, ownerKey);
    setSaveState({ kind: 'idle' });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--bg-primary)]">
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-[var(--border-color)] bg-[var(--bg-paper)]/80 px-4 py-2.5 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 items-center gap-1.5 rounded-xl border border-[var(--border-color)] px-2.5 text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
        >
          <ArrowLeft size={13} /> Geri
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-sm font-black tracking-tight text-[var(--text-primary)]">
            Hibrit Belge &amp; Vektör Stüdyosu
          </h1>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Word + FreeHand + sınırsız tahta
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span
            role="status"
            aria-live="polite"
            className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-wider ${
              saveState.kind === 'error'
                ? 'border-amber-400/40 bg-amber-500/10 text-amber-600'
                : saveState.kind === 'saved'
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-600'
                  : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)]'
            }`}
          >
            {saveState.kind === 'saving' && (
              <>
                <Clock3 size={11} /> Kaydediliyor…
              </>
            )}
            {saveState.kind === 'saved' && (
              <>
                <CheckCircle2 size={11} /> Taslak {formatTime(saveState.meta.savedAt)}
              </>
            )}
            {saveState.kind === 'error' && (
              <>
                <TriangleAlert size={11} /> {saveState.message}
              </>
            )}
            {saveState.kind === 'idle' && (
              <>
                <Clock3 size={11} /> Otomatik kayıt açık
              </>
            )}
          </span>

          <button
            type="button"
            onClick={handleClearDraft}
            title="Bu cihazdaki otomatik taslağı sil"
            className="flex h-8 items-center gap-1 rounded-lg border border-[var(--border-color)] px-2 text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)] transition-colors hover:border-rose-400 hover:text-rose-500"
          >
            <Trash2 size={12} /> Taslağı sil
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 p-3">
        <HybridEditor
          initialDocument={bootstrapped.doc}
          onDocumentChange={handleDocumentChange}
          title={bootstrapped.doc.title}
          height="100%"
          className="h-full"
        />
      </div>
    </div>
  );
};

export default HybridEditorPage;
