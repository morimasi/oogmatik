import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebaseClient';
import { logInfo, logWarn } from '../utils/logger';
import { toAppError } from '../utils/AppError';
import {
  ROOM_MAX_BYTES,
  documentByteSize,
  isPeerStale,
  isValidRoomCode,
  parsePresencePayload,
  parseRoomDocumentRecord,
  sortPeers,
  type CollaborationStatus,
  type PresencePayload,
  type RemotePeer,
  type RoomDocumentRecord,
} from '../components/hybrid-editor/collaboration/collabModel';

/**
 * Hibrit stüdyo — Firestore tabanlı gerçek zamanlı oda taşıması.
 *
 * Projede kimlik doğrulama, kalıcılık ve canlı dinleme zaten Firebase üzerinde
 * çalıştığı için ortak çalışma ayrı bir WebSocket/Durable Object sunucusu
 * gerektirmez:
 * - `hybrid_rooms/{roomId}` → paylaşılan belge anlık görüntüsü (JSON metni)
 * - `hybrid_rooms/{roomId}/presence/{clientId}` → imleç, seçim, sayfa, renk
 *
 * Belge yazımı tek bir belge üzerinden "son yazan kazanır" mantığıyla yapılır;
 * çakışma kararı `shouldApplyRemote` ile çağıran tarafta verilir. Bağlantı
 * kurulamazsa oturum `error` durumuna düşer ve düzenleme yerel olarak sürer.
 */

export const HYBRID_ROOM_COLLECTION = 'hybrid_rooms';
export const HYBRID_PRESENCE_COLLECTION = 'presence';
const HEARTBEAT_MS = 15_000;

export interface PublishDocumentResult {
  ok: boolean;
  message?: string;
}

export interface RoomSessionHandlers {
  /** Oda belgesi her anlık görüntüde; oda boşsa `null` gelir. */
  onRoomSnapshot: (record: RoomDocumentRecord | null) => void;
  onPresence: (peers: RemotePeer[]) => void;
  onStatus: (status: CollaborationStatus, message?: string) => void;
}

export interface RoomSessionOptions extends RoomSessionHandlers {
  roomId: string;
  clientId: string;
  initialPresence: PresencePayload;
}

export interface RoomSession {
  publishDocument: (documentJson: string, authorName: string) => Promise<PublishDocumentResult>;
  publishPresence: (payload: PresencePayload) => void;
  leave: () => void;
}

const closedSession = (message: string, onStatus: RoomSessionHandlers['onStatus']): RoomSession => {
  onStatus('error', message);
  return {
    publishDocument: async () => ({ ok: false, message }),
    publishPresence: () => undefined,
    leave: () => undefined,
  };
};

export const openRoomSession = (options: RoomSessionOptions): RoomSession => {
  const { roomId, clientId, onRoomSnapshot, onPresence, onStatus, initialPresence } = options;

  if (!isValidRoomCode(roomId)) {
    return closedSession('Oda kodu geçersiz (4–12 karakter).', onStatus);
  }

  try {
    const roomRef = doc(db, HYBRID_ROOM_COLLECTION, roomId);
    const presenceCollection = collection(
      db,
      HYBRID_ROOM_COLLECTION,
      roomId,
      HYBRID_PRESENCE_COLLECTION
    );
    const presenceRef = doc(
      db,
      HYBRID_ROOM_COLLECTION,
      roomId,
      HYBRID_PRESENCE_COLLECTION,
      clientId
    );

    let closed = false;
    let receivedFirstSnapshot = false;
    let lastPresence: PresencePayload = {
      ...initialPresence,
      joinedAt: Date.now(),
      updatedAt: Date.now(),
    };

    const reportError = (error: unknown, context: string) => {
      const appError = toAppError(error, 'Ortak çalışma bağlantısı kurulamadı.');
      logWarn(`[HybridCollab] ${context}`, {
        code: appError.code,
        reason: appError.userMessage,
      });
      if (!closed) onStatus('error', appError.userMessage);
    };

    const unsubRoom = onSnapshot(
      roomRef,
      (snapshot) => {
        if (closed) return;
        if (!receivedFirstSnapshot) {
          receivedFirstSnapshot = true;
          onStatus('connected');
          logInfo(`[HybridCollab] Odaya bağlanıldı: ${roomId}`);
        }
        if (!snapshot.exists()) {
          onRoomSnapshot(null);
          return;
        }
        const record = parseRoomDocumentRecord(snapshot.data());
        if (!record) return;
        // Kendi yazımızın yankısı uygulanmaz; yeniden yayın döngüsü doğmaz.
        if (record.clientId === clientId) return;
        onRoomSnapshot(record);
      },
      (error) => reportError(error, 'Oda dinleyicisi')
    );

    const unsubPresence = onSnapshot(
      presenceCollection,
      (snapshot) => {
        if (closed) return;
        const now = Date.now();
        const peers = snapshot.docs
          .map((item) => parsePresencePayload(item.id, item.data()))
          .filter(
            (peer): peer is RemotePeer =>
              !!peer && peer.clientId !== clientId && !isPeerStale(peer, now)
          );
        onPresence(sortPeers(peers));
      },
      (error) => reportError(error, 'Katılımcı dinleyicisi')
    );

    const writePresence = (next: PresencePayload) => {
      if (closed) return;
      const payload: PresencePayload = { ...next, updatedAt: Date.now() };
      lastPresence = payload;
      void setDoc(
        presenceRef,
        {
          userId: payload.userId,
          name: payload.name,
          color: payload.color,
          pageId: payload.pageId,
          selectedIds: payload.selectedIds,
          cursor: payload.cursor,
          joinedAt: payload.joinedAt,
          updatedAt: payload.updatedAt,
        },
        { merge: true }
      ).catch((error) => reportError(error, 'Katılımcı durumu yazılamadı'));
    };

    writePresence(lastPresence);

    const heartbeat = window.setInterval(() => writePresence(lastPresence), HEARTBEAT_MS);

    return {
      publishDocument: async (documentJson, authorName) => {
        if (closed) return { ok: false, message: 'Ortak çalışma oturumu kapalı.' };
        const bytes = documentByteSize(documentJson);
        if (bytes > ROOM_MAX_BYTES) {
          return {
            ok: false,
            message: 'Belge ortak çalışma sınırını aşıyor; görselleri küçültün.',
          };
        }
        try {
          await setDoc(
            roomRef,
            {
              documentJson,
              clientId,
              authorName: authorName.slice(0, 40),
              updatedAtMs: Date.now(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
          return { ok: true };
        } catch (error) {
          const appError = toAppError(error, 'Ortak çalışma belgesi yazılamadı.');
          logWarn('[HybridCollab] Belge yazımı başarısız', {
            code: appError.code,
            reason: appError.userMessage,
          });
          return { ok: false, message: appError.userMessage };
        }
      },
      publishPresence: (payload) => writePresence(payload),
      leave: () => {
        if (closed) return;
        closed = true;
        window.clearInterval(heartbeat);
        unsubRoom();
        unsubPresence();
        void deleteDoc(presenceRef).catch(() => undefined);
      },
    };
  } catch (error) {
    const appError = toAppError(error, 'Ortak çalışma başlatılamadı.');
    logWarn('[HybridCollab] Oturum başlatılamadı', {
      code: appError.code,
      reason: appError.userMessage,
    });
    return closedSession(appError.userMessage, onStatus);
  }
};
