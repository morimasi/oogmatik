import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Undo/Redo geçmişi + editör klavye kısayolları.
 *
 * - `commit` yeni durumu geçmişe yazar; aynı `coalesceKey` ile kısa aralıkta
 *   gelen değişiklikler (ör. yazarken, sürüklerken) tek adımda birleşir.
 * - `replace` geçmişe dokunmadan canlı durumu günceller (dış kaynak senkronu).
 * - `undo/redo` sunulan durumu değiştirir ve `null` döner (durum yoksa).
 */

export interface HistorySnapshot<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface CommitOptions {
  coalesceKey?: string;
  coalesceMs?: number;
}

export interface EditorHistoryApi<T> {
  present: T;
  canUndo: boolean;
  canRedo: boolean;
  pastCount: number;
  futureCount: number;
  commit: (next: T, options?: CommitOptions) => void;
  replace: (next: T) => void;
  reset: (next: T) => void;
  undo: () => void;
  redo: () => void;
}

export const useEditorHistory = <T>(initial: T, limit = 60): EditorHistoryApi<T> => {
  const [snapshot, setSnapshot] = useState<HistorySnapshot<T>>({
    past: [],
    present: initial,
    future: [],
  });
  const mergeRef = useRef<{ key: string; at: number } | null>(null);

  const commit = useCallback(
    (next: T, options: CommitOptions = {}) => {
      const now = Date.now();
      const { coalesceKey, coalesceMs = 700 } = options;
      setSnapshot((current) => {
        const canMerge =
          !!coalesceKey &&
          mergeRef.current?.key === coalesceKey &&
          now - mergeRef.current.at < coalesceMs &&
          current.past.length > 0;

        mergeRef.current = coalesceKey ? { key: coalesceKey, at: now } : null;

        if (current.present === next) return current;

        return {
          past: canMerge ? current.past : [...current.past, current.present].slice(-limit),
          present: next,
          future: [],
        };
      });
    },
    [limit]
  );

  const replace = useCallback((next: T) => {
    mergeRef.current = null;
    setSnapshot((current) => ({ ...current, present: next }));
  }, []);

  const reset = useCallback((next: T) => {
    mergeRef.current = null;
    setSnapshot({ past: [], present: next, future: [] });
  }, []);

  const undo = useCallback(() => {
    mergeRef.current = null;
    setSnapshot((current) => {
      const previous = current.past[current.past.length - 1];
      if (previous === undefined) return current;
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future].slice(0, limit),
      };
    });
  }, [limit]);

  const redo = useCallback(() => {
    mergeRef.current = null;
    setSnapshot((current) => {
      const next = current.future[0];
      if (next === undefined) return current;
      return {
        past: [...current.past, current.present].slice(-limit),
        present: next,
        future: current.future.slice(1),
      };
    });
  }, [limit]);

  return {
    present: snapshot.present,
    canUndo: snapshot.past.length > 0,
    canRedo: snapshot.future.length > 0,
    pastCount: snapshot.past.length,
    futureCount: snapshot.future.length,
    commit,
    replace,
    reset,
    undo,
    redo,
  };
};

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable ||
    !!target.closest('.ProseMirror')
  );
};

export interface EditorShortcutHandlers {
  onUndo: () => void;
  onRedo: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  enabled?: boolean;
}

/**
 * Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z / Delete / Ctrl+D kısayolları.
 * Metin girişi ve ProseMirror içinde devre dışıdır; orada editörün kendi
 * geçmişi çalışır (belge durumu `onUpdate` ile yine senkron kalır).
 */
export const useEditorShortcuts = ({
  onUndo,
  onRedo,
  onDelete,
  onDuplicate,
  enabled = true,
}: EditorShortcutHandlers): void => {
  useEffect(() => {
    if (!enabled) return undefined;

    const handler = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const mod = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (mod && key === 'z') {
        event.preventDefault();
        if (event.shiftKey) onRedo();
        else onUndo();
        return;
      }
      if (mod && key === 'y') {
        event.preventDefault();
        onRedo();
        return;
      }
      if (mod && key === 'd') {
        event.preventDefault();
        onDuplicate?.();
        return;
      }
      if (!mod && (key === 'delete' || key === 'backspace')) {
        onDelete?.();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, onDelete, onDuplicate, onRedo, onUndo]);
};
