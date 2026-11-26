import React from 'react';
import { ArrowLeft, CheckCircle2, Clock3, Copy, Share2, Trash2, TriangleAlert, Users } from 'lucide-react';
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
import {
  buildRoomLink,
  createRoomCode,
  isValidRoomCode,
  normalizeRoomCode,
  readRoomCodeFromHash,
} from '../components/hybrid-editor/collaboration/collabModel';

const AUTOSAVE_DELAY = 900;
const ROOM_NOTICE_TIMEOUT = 5000;

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

  const [activeRoom, setActiveRoom] = React.useState<string | null>(() =>
    typeof window === 'undefined' ? null : readRoomCodeFromHash(window.location.hash)
  );
  const [roomInput, setRoomInput] = React.useState('');
  const [roomNotice, setRoomNotice] = React.useState<string | null>(null);
  const [editorResetCount, setEditorResetCount] = React.useState(0);
  const [activeDoc, setActiveDoc] = React.useState<HybridDocumentSchema>(bootstrapped.doc);

  React.useEffect(() => {
    if (!roomNotice) return undefined;
    const timer = window.setTimeout(() => setRoomNotice(null), ROOM_NOTICE_TIMEOUT);
    return () => window.clearTimeout(timer);
  }, [roomNotice]);

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

  const syncRoomHash = (code: string | null) => {
    if (typeof window === 'undefined') return;
    const base = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, '', code ? `${base}#ortak=${code}` : base);
  };

  const joinRoom = (raw: string) => {
    const code = normalizeRoomCode(raw);
    if (!isValidRoomCode(code)) {
      setRoomNotice('Oda kodu 4–12 karakter olmalı (harf ve rakam).');
      return;
    }
    setActiveRoom(code);
    setRoomInput('');
    setRoomNotice(`Odaya katıldınız: ${code}`);
    syncRoomHash(code);
  };

  const startRoom = () => joinRoom(createRoomCode());

  const leaveRoom = () => {
    setActiveRoom(null);
    setRoomNotice('Ortak çalışmadan ayrıldınız.');
    syncRoomHash(null);
  };

  const copyRoomLink = async (code: string) => {
    if (typeof window === 'undefined') return;
    const link = buildRoomLink(window.location.href, code);
    try {
      await navigator.clipboard.writeText(link);
      setRoomNotice('Bağlantı kopyalandı.');
    } catch {
      setRoomNotice(`Bağlantı: ${link}`);
    }
  };

  const handleClearDraft = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    clearHybridDraft(undefined, ownerKey);
    const fresh = createEmptyDocument('Hibrit Çalışma');
    latestRef.current = fresh;
    setActiveDoc(fresh);
    setEditorResetCount((count) => count + 1);
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
          {activeRoom ? (
            <span className="flex items-center gap-1.5 rounded-lg border border-indigo-400/40 bg-indigo-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-indigo-600">
              <Users size={11} /> Ortak: {activeRoom}
            </span>
          ) : (
            <div className="flex items-center gap-1">
              <input
                value={roomInput}
                onChange={(event) => setRoomInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') joinRoom(roomInput);
                }}
                maxLength={12}
                placeholder="Oda kodu"
                aria-label="Ortak çalışma oda kodu"
                className="h-8 w-24 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
              />
              <button
                type="button"
                onClick={() => joinRoom(roomInput)}
                disabled={!roomInput.trim()}
                title="Var olan odaya katıl"
                className="flex h-8 items-center gap-1 rounded-lg border border-[var(--border-color)] px-2 text-[9px] font-black uppercase tracking-wider text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Users size={11} /> Katıl
              </button>
              <button
                type="button"
                onClick={startRoom}
                title="Yeni ortak çalışma odası aç"
                className="flex h-8 items-center gap-1 rounded-lg border border-[var(--border-color)] px-2 text-[9px] font-black uppercase tracking-wider text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
              >
                <Share2 size={11} /> Oda aç
              </button>
            </div>
          )}

          {activeRoom && (
            <button
              type="button"
              onClick={() => void copyRoomLink(activeRoom)}
              title="Ortak çalışma bağlantısını kopyala"
              className="flex h-8 items-center gap-1 rounded-lg border border-[var(--border-color)] px-2 text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
            >
              <Copy size={11} /> Davet et
            </button>
          )}

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

          {roomNotice && (
            <p role="status" aria-live="polite" className="max-w-[240px] truncate text-[9px] font-bold text-[var(--text-muted)]">
              {roomNotice}
            </p>
          )}

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
          key={editorResetCount}
          initialDocument={activeDoc}
          onDocumentChange={handleDocumentChange}
          title={activeDoc.title}
          height="100%"
          className="h-full"
          collaboration={
            activeRoom
              ? {
                  roomId: activeRoom,
                  userId: ownerKey ?? 'misafir',
                  displayName: user?.name ?? 'Misafir',
                }
              : undefined
          }
          onCollaborationLeave={leaveRoom}
          onCopyRoomLink={(roomId) => void copyRoomLink(roomId)}
        />
      </div>
    </div>
  );
};

export default HybridEditorPage;
