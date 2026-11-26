import { isRecord, type HybridDocumentSchema } from '../types/editor.types';

/**
 * Hibrit stüdyo gerçek zamanlı işbirliği — saf model katmanı.
 *
 * Ağ/veritabanı erişimi burada yoktur: oda kodu, katılımcı durumu (imleç,
 * seçim), uzak belge kaydı ve "uzak değişiklik uygulanmalı mı" kararları
 * yalnızca veri dönüşümü olarak tutulur. Böylece davranış birim testleriyle
 * doğrulanabilir ve Firestore bağımlılığı tek bir serviste kalır.
 */

export const ROOM_CODE_MIN_LENGTH = 4;
export const ROOM_CODE_MAX_LENGTH = 12;
/** Karıştırılması kolay karakterler (I, O, 0, 1) kod alfabesinde yer almaz. */
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
/** Firestore belge sınırı 1 MiB; güvenli pay bırakılmış üst sınır. */
export const ROOM_MAX_BYTES = 700_000;
/** Bu süre güncellenmeyen katılımcı "ayrıldı" kabul edilir. */
export const PRESENCE_STALE_MS = 45_000;
/** Yerel düzenleme sürerken uzak değişikliği erteleyen bekleme süresi. */
export const REMOTE_EDIT_GRACE_MS = 600;

export const CURSOR_COLORS = [
  '#4F46E5',
  '#0D9488',
  '#E11D48',
  '#F59E0B',
  '#7C3AED',
  '#0284C7',
  '#DB2777',
  '#65A30D',
] as const;

export type CollaborationStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface RemoteCursor {
  x: number;
  y: number;
}

/** Firestore `hybrid_rooms/{roomId}` belgesinin istemciye taşınan alanları. */
export interface RoomDocumentRecord {
  documentJson: string;
  clientId: string;
  authorName: string;
  updatedAtMs: number;
}

/** `hybrid_rooms/{roomId}/presence/{clientId}` belgesi. */
export interface PresencePayload {
  userId: string;
  name: string;
  color: string;
  /** `null` sınırsız tahta, aksi halde sayfa kimliği. */
  pageId: string | null;
  selectedIds: string[];
  cursor: RemoteCursor | null;
  joinedAt: number;
  updatedAt: number;
}

export interface RemotePeer extends PresencePayload {
  clientId: string;
}

const toFiniteNumber = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

export const normalizeRoomCode = (input: string): string =>
  input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, ROOM_CODE_MAX_LENGTH);

export const isValidRoomCode = (code: string): boolean =>
  code.length >= ROOM_CODE_MIN_LENGTH && code.length <= ROOM_CODE_MAX_LENGTH;

export const createRoomCode = (length = 6, random: () => number = Math.random): string => {
  const size = Math.max(ROOM_CODE_MIN_LENGTH, Math.min(ROOM_CODE_MAX_LENGTH, Math.round(length)));
  let code = '';
  for (let index = 0; index < size; index += 1) {
    const pick = Math.floor(random() * ROOM_CODE_ALPHABET.length);
    code += ROOM_CODE_ALPHABET[Math.min(ROOM_CODE_ALPHABET.length - 1, Math.max(0, pick))];
  }
  return code;
};

/** Aynı kullanıcı her oturumda aynı renkle görünür; renkler çakışmayacak kadar dağınık. */
export const cursorColorFor = (seed: string): string => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100_000;
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
};

export const parseCursor = (value: unknown): RemoteCursor | null => {
  if (!isRecord(value)) return null;
  const x = toFiniteNumber(value.x, Number.NaN);
  const y = toFiniteNumber(value.y, Number.NaN);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
};

export const parseRoomDocumentRecord = (data: unknown): RoomDocumentRecord | null => {
  if (!isRecord(data)) return null;
  const documentJson = data.documentJson;
  if (typeof documentJson !== 'string' || documentJson.length === 0) return null;
  return {
    documentJson,
    clientId: typeof data.clientId === 'string' ? data.clientId : '',
    authorName: typeof data.authorName === 'string' ? data.authorName : '',
    updatedAtMs: toFiniteNumber(data.updatedAtMs, 0),
  };
};

export const parsePresencePayload = (clientId: string, data: unknown): RemotePeer | null => {
  if (!clientId || !isRecord(data)) return null;
  const userId = typeof data.userId === 'string' ? data.userId : '';
  if (!userId) return null;

  const rawName = typeof data.name === 'string' ? data.name.trim() : '';
  const selectedIds = Array.isArray(data.selectedIds)
    ? data.selectedIds.filter((id): id is string => typeof id === 'string').slice(0, 200)
    : [];

  return {
    clientId,
    userId,
    name: rawName ? rawName.slice(0, 40) : 'Katılımcı',
    color: typeof data.color === 'string' && data.color ? data.color : cursorColorFor(userId),
    pageId: typeof data.pageId === 'string' ? data.pageId : null,
    selectedIds,
    cursor: parseCursor(data.cursor),
    joinedAt: toFiniteNumber(data.joinedAt, 0),
    updatedAt: toFiniteNumber(data.updatedAt, Date.now()),
  };
};

export const isPeerStale = (peer: RemotePeer, now = Date.now()): boolean =>
  now - peer.updatedAt > PRESENCE_STALE_MS;

export const sortPeers = (peers: RemotePeer[]): RemotePeer[] =>
  [...peers].sort((left, right) => left.joinedAt - right.joinedAt || left.clientId.localeCompare(right.clientId));

/**
 * Uzak belgeyi yerel görünüm durumuyla birleştirir.
 * Mod ve etkin sayfa kullanıcıya özgü gezinme durumudur; uzak katılımcı sayfa
 * değiştirdiğinde yerel kullanıcının ekranı yerinden oynamaz.
 */
export const mergeRemoteDocument = (
  local: HybridDocumentSchema,
  remote: HybridDocumentSchema
): HybridDocumentSchema => {
  const activePageExists = remote.pages.some((page) => page.id === local.activePageId);
  return {
    ...remote,
    mode: local.mode,
    activePageId: activePageExists ? local.activePageId : remote.activePageId,
  };
};

export interface RemoteApplyDecision {
  remoteUpdatedAtMs: number;
  lastAppliedRemoteAt: number;
  localEditedAt: number;
  now: number;
  graceMs?: number;
}

/**
 * Uzak değişiklik şu anda uygulanmalı mı?
 * - Daha önce uygulanmış bir sürüm tekrar uygulanmaz.
 * - Yerel kullanıcı son `graceMs` içinde düzenleme yaptıysa (yazıyor, sürüklüyor)
 *   uygulama ertelenir; tuvalin altından nesne kaymasını engeller.
 */
export const shouldApplyRemote = ({
  remoteUpdatedAtMs,
  lastAppliedRemoteAt,
  localEditedAt,
  now,
  graceMs = REMOTE_EDIT_GRACE_MS,
}: RemoteApplyDecision): boolean => {
  if (remoteUpdatedAtMs <= lastAppliedRemoteAt) return false;
  return now - localEditedAt >= graceMs;
};

export const documentByteSize = (json: string): number => {
  try {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(json).length;
  } catch {
    // TextEncoder yoksa karakter sayısı üst sınır kabul edilir.
  }
  return json.length * 2;
};

/** Paylaşım bağlantısı: mevcut sorgu dizesi korunur, yalnızca hash yenilenir. */
export const buildRoomLink = (baseUrl: string, roomCode: string): string => {
  const [withoutHash] = baseUrl.split('#');
  return `${withoutHash}#ortak=${normalizeRoomCode(roomCode)}`;
};

export const readRoomCodeFromHash = (hash: string): string | null => {
  const match = /ortak=([A-Za-z0-9]{4,12})/.exec(hash);
  if (!match) return null;
  const code = normalizeRoomCode(match[1]);
  return isValidRoomCode(code) ? code : null;
};
