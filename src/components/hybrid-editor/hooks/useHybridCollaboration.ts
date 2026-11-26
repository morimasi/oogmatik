import React from 'react';
import { parseHybridDocumentJson } from '../utils/exportEngine';
import { openRoomSession, type RoomSession } from '../../../services/hybridEditorCollabService';
import {
  REMOTE_EDIT_GRACE_MS,
  cursorColorFor,
  isValidRoomCode,
  mergeRemoteDocument,
  shouldApplyRemote,
  type CollaborationStatus,
  type PresencePayload,
  type RemoteCursor,
  type RemotePeer,
  type RoomDocumentRecord,
} from '../collaboration/collabModel';
import type { HybridDocumentSchema } from '../types/editor.types';

/**
 * Hibrit editörü gerçek zamanlı bir odaya bağlayan kanca.
 *
 * Yayınlama (publish) yönü: yerel belge değişir → 450 ms debounce → oda belgesi.
 * Alma (apply) yönü: uzak kayıt → sürüm/`clientId` kontrolü → yerel görünüm
 * durumu korunarak `onRemoteDocument`. Yerel kullanıcı son 600 ms içinde
 * düzenleme yaptıysa uzak kayıt ertelenir; tuval sürükleme sırasında altından
 * nesne kaymaz. İmleç/seçim bilgisi 120 ms aralıkla yazılır (yazma bütçesi).
 */

const DOCUMENT_PUBLISH_DELAY = 450;
const CURSOR_PUBLISH_INTERVAL = 120;

export interface UseHybridCollaborationOptions {
  enabled: boolean;
  roomId: string;
  userId: string;
  displayName: string;
  document: HybridDocumentSchema;
  onRemoteDocument: (document: HybridDocumentSchema) => void;
}

export interface HybridCollaborationApi {
  status: CollaborationStatus;
  peers: RemotePeer[];
  message: string | null;
  selfColor: string;
  publishCursor: (cursor: RemoteCursor | null, surfaceId: string | null) => void;
  publishSelection: (ids: string[], surfaceId: string | null) => void;
}

const newClientId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const useHybridCollaboration = ({
  enabled,
  roomId,
  userId,
  displayName,
  document,
  onRemoteDocument,
}: UseHybridCollaborationOptions): HybridCollaborationApi => {
  const clientId = React.useMemo(newClientId, []);
  const selfColor = React.useMemo(() => cursorColorFor(userId || clientId), [userId, clientId]);

  const [status, setStatus] = React.useState<CollaborationStatus>('idle');
  const [peers, setPeers] = React.useState<RemotePeer[]>([]);
  const [message, setMessage] = React.useState<string | null>(null);

  const sessionRef = React.useRef<RoomSession | null>(null);
  const documentRef = React.useRef(document);
  documentRef.current = document;

  const remoteDocumentHandlerRef = React.useRef(onRemoteDocument);
  remoteDocumentHandlerRef.current = onRemoteDocument;

  const readyRef = React.useRef(false);
  const lastPublishedJsonRef = React.useRef('');
  const lastAppliedJsonRef = React.useRef('');
  const localEditedAtRef = React.useRef(0);
  const lastAppliedRemoteAtRef = React.useRef(0);
  const pendingRemoteRef = React.useRef<RoomDocumentRecord | null>(null);
  const applyTimerRef = React.useRef<number | null>(null);
  const presenceRef = React.useRef<PresencePayload | null>(null);
  const pendingCursorRef = React.useRef<{ cursor: RemoteCursor | null; surfaceId: string | null } | null>(
    null
  );
  const cursorTimerRef = React.useRef<number | null>(null);
  const lastCursorSentRef = React.useRef(0);

  const surfaceRef = React.useRef<string | null>(null);

  const roomSnapshotHandlerRef = React.useRef<(record: RoomDocumentRecord | null) => void>(
    () => undefined
  );

  const clearApplyTimer = (): void => {
    if (applyTimerRef.current !== null) {
      window.clearTimeout(applyTimerRef.current);
      applyTimerRef.current = null;
    }
  };

  roomSnapshotHandlerRef.current = (record) => {
    if (!record) {
      if (readyRef.current) return;
      readyRef.current = true;
      setStatus('connected');
      // Boş oda: yerel belge tohum olarak yayınlanır (iki istemci aynı anda
      // katılırsa son yazan kazanır; belge bütünlüğü bozulmaz).
      const json = JSON.stringify(documentRef.current);
      lastPublishedJsonRef.current = json;
      void sessionRef.current?.publishDocument(json, displayName).then((result) => {
        if (!result.ok && result.message) setMessage(result.message);
      });
      return;
    }

    readyRef.current = true;
    const parsed = parseHybridDocumentJson(record.documentJson);
    if (!parsed.ok) return;

    const now = Date.now();
    const canApply = shouldApplyRemote({
      remoteUpdatedAtMs: record.updatedAtMs,
      lastAppliedRemoteAt: lastAppliedRemoteAtRef.current,
      localEditedAt: localEditedAtRef.current,
      now,
    });

    if (!canApply) {
      pendingRemoteRef.current = record;
      if (applyTimerRef.current === null) {
        applyTimerRef.current = window.setTimeout(() => {
          applyTimerRef.current = null;
          const pending = pendingRemoteRef.current;
          if (pending) roomSnapshotHandlerRef.current(pending);
        }, REMOTE_EDIT_GRACE_MS + 60);
      }
      return;
    }

    pendingRemoteRef.current = null;
    clearApplyTimer();
    lastAppliedRemoteAtRef.current = record.updatedAtMs;

    const merged = mergeRemoteDocument(documentRef.current, parsed.doc);
    const mergedJson = JSON.stringify(merged);
    lastAppliedJsonRef.current = mergedJson;
    lastPublishedJsonRef.current = mergedJson;
    if (mergedJson === JSON.stringify(documentRef.current)) return;
    remoteDocumentHandlerRef.current(merged);
  };

  /* ------------------------------ Oturum yaşamı ------------------------------ */
  React.useEffect(() => {
    if (!enabled || !isValidRoomCode(roomId)) {
      setStatus('idle');
      setPeers([]);
      return undefined;
    }

    readyRef.current = false;
    lastPublishedJsonRef.current = '';
    lastAppliedJsonRef.current = '';
    lastAppliedRemoteAtRef.current = 0;
    localEditedAtRef.current = 0;
    pendingRemoteRef.current = null;
    setStatus('connecting');
    setMessage(null);

    const presence: PresencePayload = {
      userId: userId || clientId,
      name: displayName || 'Katılımcı',
      color: selfColor,
      pageId: surfaceRef.current,
      selectedIds: [],
      cursor: null,
      joinedAt: Date.now(),
      updatedAt: Date.now(),
    };
    presenceRef.current = presence;

    const session = openRoomSession({
      roomId,
      clientId,
      initialPresence: presence,
      onRoomSnapshot: (record) => roomSnapshotHandlerRef.current(record),
      onPresence: setPeers,
      onStatus: (next, text) => {
        setStatus(next);
        if (text) setMessage(text);
      },
    });
    sessionRef.current = session;

    const handleBeforeUnload = () => session.leave();
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      session.leave();
      sessionRef.current = null;
      readyRef.current = false;
      clearApplyTimer();
      if (cursorTimerRef.current !== null) {
        window.clearTimeout(cursorTimerRef.current);
        cursorTimerRef.current = null;
      }
      pendingCursorRef.current = null;
    };
  }, [enabled, roomId, userId, displayName, selfColor, clientId]);

  /* ------------------------------ Belge yayını ------------------------------ */
  React.useEffect(() => {
    if (!enabled) return undefined;
    const json = JSON.stringify(document);
    if (!readyRef.current) return undefined;
    if (json === lastPublishedJsonRef.current || json === lastAppliedJsonRef.current) {
      return undefined;
    }

    localEditedAtRef.current = Date.now();
    const timer = window.setTimeout(() => {
      if (!sessionRef.current) return;
      if (json === lastPublishedJsonRef.current) return;
      lastPublishedJsonRef.current = json;
      void sessionRef.current.publishDocument(json, displayName).then((result) => {
        if (!result.ok && result.message) setMessage(result.message);
      });
    }, DOCUMENT_PUBLISH_DELAY);

    return () => window.clearTimeout(timer);
  }, [document, enabled, displayName]);

  /* --------------------------------- İmleç --------------------------------- */
  const sendPresence = React.useCallback((partial: Partial<PresencePayload>) => {
    const current = presenceRef.current;
    if (!current) return;
    const next: PresencePayload = { ...current, ...partial };
    presenceRef.current = next;
    sessionRef.current?.publishPresence(next);
  }, []);

  const publishCursor = React.useCallback(
    (cursor: RemoteCursor | null, surfaceId: string | null) => {
      if (surfaceId !== surfaceRef.current) surfaceRef.current = surfaceId;
      pendingCursorRef.current = { cursor, surfaceId };

      const flush = () => {
        const pending = pendingCursorRef.current;
        if (!pending) return;
        lastCursorSentRef.current = Date.now();
        pendingCursorRef.current = null;
        sendPresence({ cursor: pending.cursor, pageId: pending.surfaceId });
      };

      if (cursor === null) {
        if (cursorTimerRef.current !== null) {
          window.clearTimeout(cursorTimerRef.current);
          cursorTimerRef.current = null;
        }
        flush();
        return;
      }

      const elapsed = Date.now() - lastCursorSentRef.current;
      if (elapsed >= CURSOR_PUBLISH_INTERVAL) {
        flush();
        return;
      }
      if (cursorTimerRef.current === null) {
        cursorTimerRef.current = window.setTimeout(() => {
          cursorTimerRef.current = null;
          flush();
        }, CURSOR_PUBLISH_INTERVAL - elapsed);
      }
    },
    [sendPresence]
  );

  const publishSelection = React.useCallback(
    (ids: string[], surfaceId: string | null) => {
      surfaceRef.current = surfaceId;
      sendPresence({
        selectedIds: Array.from(new Set(ids)).slice(0, 200),
        pageId: surfaceId,
      });
    },
    [sendPresence]
  );

  return {
    status,
    peers,
    message,
    selfColor,
    publishCursor,
    publishSelection,
  };
};
