import { describe, expect, it } from 'vitest';
import {
  CURSOR_COLORS,
  PRESENCE_STALE_MS,
  REMOTE_EDIT_GRACE_MS,
  ROOM_MAX_BYTES,
  buildRoomLink,
  createRoomCode,
  cursorColorFor,
  documentByteSize,
  isPeerStale,
  isValidRoomCode,
  mergeRemoteDocument,
  normalizeRoomCode,
  parsePresencePayload,
  parseRoomDocumentRecord,
  readRoomCodeFromHash,
  shouldApplyRemote,
  sortPeers,
} from '../src/components/hybrid-editor/collaboration/collabModel';
import { createEmptyDocument, createEmptyPage } from '../src/components/hybrid-editor/types/editor.types';

describe('Hibrit ortak çalışma — oda kodu', () => {
  it('kodu normalleştirir ve geçerliliği ölçer', () => {
    expect(normalizeRoomCode(' ab-12 cd ')).toBe('AB12CD');
    expect(normalizeRoomCode('abcdefghijklmnop')).toHaveLength(12);
    expect(isValidRoomCode('AB12')).toBe(true);
    expect(isValidRoomCode('AB1')).toBe(false);
    expect(isValidRoomCode('')).toBe(false);
  });

  it('karıştırılabilir karakterler olmadan kod üretir', () => {
    const code = createRoomCode(6, () => 0.5);
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]+$/);
    expect(code).not.toMatch(/[IO01]/);
    expect(isValidRoomCode(code)).toBe(true);
  });

  it('paylaşım bağlantısını ve bağlantıdan kodu okur', () => {
    const link = buildRoomLink('https://bdmind.app/#eski', 'ab12cd');
    expect(link).toBe('https://bdmind.app/#ortak=AB12CD');
    expect(readRoomCodeFromHash('#ortak=AB12CD')).toBe('AB12CD');
    expect(readRoomCodeFromHash('#ortak=ab')).toBeNull();
    expect(readRoomCodeFromHash('')).toBeNull();
  });

  it('katılımcı rengini kullanıcıya göre sabit seçer', () => {
    expect(cursorColorFor('user-1')).toBe(cursorColorFor('user-1'));
    expect(CURSOR_COLORS).toContain(cursorColorFor('user-1'));
  });
});

describe('Hibrit ortak çalışma — katılımcı durumu', () => {
  const validPresence = {
    userId: 'user-1',
    name: 'Ayşe Öğretmen',
    color: '#4F46E5',
    pageId: 'page_1',
    selectedIds: ['obj_1', 42, 'obj_2'],
    cursor: { x: 10.44, y: 20.2 },
    joinedAt: 1000,
    updatedAt: 2000,
  };

  it('geçerli kaydı ayrıştırır, seçim listesini temizler', () => {
    const peer = parsePresencePayload('client-1', validPresence);
    expect(peer).not.toBeNull();
    expect(peer?.clientId).toBe('client-1');
    expect(peer?.name).toBe('Ayşe Öğretmen');
    expect(peer?.selectedIds).toEqual(['obj_1', 'obj_2']);
    expect(peer?.cursor).toEqual({ x: 10.4, y: 20.2 });
  });

  it('bozuk kayıtları reddeder', () => {
    expect(parsePresencePayload('client-1', null)).toBeNull();
    expect(parsePresencePayload('', validPresence)).toBeNull();
    expect(parsePresencePayload('client-1', { ...validPresence, userId: '' })).toBeNull();
    expect(parsePresencePayload('client-1', { ...validPresence, cursor: { x: 'a', y: 2 } })?.cursor).toBeNull();
  });

  it('eski katılımcıyı bayat sayar', () => {
    const peer = parsePresencePayload('client-1', validPresence);
    if (!peer) throw new Error('Katılımcı ayrıştırılamadı');
    expect(isPeerStale(peer, peer.updatedAt + PRESENCE_STALE_MS - 1)).toBe(false);
    expect(isPeerStale(peer, peer.updatedAt + PRESENCE_STALE_MS + 1)).toBe(true);
  });

  it('katılımcıları katılım sırasına göre dizer', () => {
    const first = parsePresencePayload('a', { ...validPresence, joinedAt: 10 });
    const second = parsePresencePayload('b', { ...validPresence, joinedAt: 20 });
    if (!first || !second) throw new Error('Katılımcı ayrıştırılamadı');
    expect(sortPeers([second, first]).map((peer) => peer.clientId)).toEqual(['a', 'b']);
  });
});

describe('Hibrit ortak çalışma — belge kaydı', () => {
  it('oda belgesini ayrıştırır ve geçersizleri atar', () => {
    const record = parseRoomDocumentRecord({
      documentJson: '{"schemaVersion":1}',
      clientId: 'client-1',
      authorName: 'Ayşe',
      updatedAtMs: 1234,
    });
    expect(record).toEqual({
      documentJson: '{"schemaVersion":1}',
      clientId: 'client-1',
      authorName: 'Ayşe',
      updatedAtMs: 1234,
    });
    expect(parseRoomDocumentRecord({ documentJson: '' })).toBeNull();
    expect(parseRoomDocumentRecord({})).toBeNull();
  });

  it('bayt boyutunu ve sınır sabitini doğrular', () => {
    expect(documentByteSize('abc')).toBe(3);
    expect(ROOM_MAX_BYTES).toBeLessThan(1024 * 1024);
  });
});

describe('Hibrit ortak çalışma — uzak değişiklik kararı', () => {
  it('yerel düzenleme sürerken uzak değişikliği erteler', () => {
    const now = 10_000;
    expect(
      shouldApplyRemote({
        remoteUpdatedAtMs: now,
        lastAppliedRemoteAt: 0,
        localEditedAt: now - 100,
        now,
      })
    ).toBe(false);
    expect(
      shouldApplyRemote({
        remoteUpdatedAtMs: now,
        lastAppliedRemoteAt: 0,
        localEditedAt: now - REMOTE_EDIT_GRACE_MS - 1,
        now,
      })
    ).toBe(true);
  });

  it('aynı uzak sürümü ikinci kez uygulamaz', () => {
    expect(
      shouldApplyRemote({
        remoteUpdatedAtMs: 500,
        lastAppliedRemoteAt: 500,
        localEditedAt: 0,
        now: 1000,
      })
    ).toBe(false);
  });

  it('uzak içeriği alır, yerel mod ve etkin sayfayı korur', () => {
    const local = createEmptyDocument('Yerel');
    local.mode = 'whiteboard';
    const remote = createEmptyDocument('Uzak');
    // Uzak belge yerel etkin sayfayı da içeriyorsa kullanıcı o sayfada kalır.
    remote.pages = [
      { ...remote.pages[0], id: local.activePageId },
      createEmptyPage(1),
    ];
    remote.activePageId = remote.pages[1].id;

    const merged = mergeRemoteDocument(local, remote);
    expect(merged.title).toBe('Uzak');
    expect(merged.mode).toBe('whiteboard');
    expect(merged.activePageId).toBe(local.activePageId);
    expect(merged.pages).toHaveLength(2);
  });

  it('yerel sayfa uzakta yoksa uzak etkin sayfaya döner', () => {
    const local = createEmptyDocument('Yerel');
    const remote = createEmptyDocument('Uzak');
    const merged = mergeRemoteDocument(local, remote);
    expect(merged.activePageId).toBe(remote.activePageId);
  });
});
