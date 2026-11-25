import { describe, expect, it } from 'vitest';
import {
  A4_HEIGHT,
  A4_WIDTH,
  DEFAULT_MARGINS,
  WHITEBOARD_HEIGHT,
  WHITEBOARD_WIDTH,
  createEmptyDocument,
  createEmptyPage,
  emptySnapshot,
} from '../src/components/hybrid-editor/types/editor.types';
import {
  DRAFT_MAX_BYTES,
  clearHybridDraft,
  hybridDraftKey,
  readHybridDraft,
  writeHybridDraft,
  type StorageLike,
} from '../src/services/hybridEditorDraftService';

const memoryStorage = (): StorageLike & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
};

describe('Hibrit editör — belge fabrikaları', () => {
  it('A4 ölçüleri ve varsayılan belge şemasını üretir', () => {
    expect(A4_WIDTH).toBe(794);
    expect(A4_HEIGHT).toBe(1123);

    const doc = createEmptyDocument('Deneme');
    expect(doc.schemaVersion).toBe(1);
    expect(doc.mode).toBe('document');
    expect(doc.title).toBe('Deneme');
    expect(doc.pages).toHaveLength(1);
    expect(doc.pages[0].margins).toEqual(DEFAULT_MARGINS);
    expect(doc.whiteboard.canvas.width).toBe(WHITEBOARD_WIDTH);
    expect(doc.whiteboard.canvas.height).toBe(WHITEBOARD_HEIGHT);
    expect(doc.activePageId).toBe(doc.pages[0].id);
  });

  it('sayfa kimlikleri benzersiz ve numaralandırma doğru', () => {
    const first = createEmptyPage(0);
    const second = createEmptyPage(1);
    expect(first.id).not.toBe(second.id);
    expect(first.name).toBe('Sayfa 1');
    expect(second.name).toBe('Sayfa 2');
    expect(JSON.parse(first.canvas.json)).toMatchObject({ objects: [] });
  });

  it('boş anlık görüntü geçerli Fabric JSON içerir', () => {
    const snapshot = emptySnapshot(100, 200);
    expect(snapshot.width).toBe(100);
    expect(snapshot.height).toBe(200);
    expect(snapshot.zoom).toBe(1);
    expect(JSON.parse(snapshot.json).objects).toEqual([]);
  });
});

describe('Hibrit editör — cihaz taslağı', () => {
  it('yazar, okur ve temizler', () => {
    const storage = memoryStorage();
    const json = JSON.stringify(createEmptyDocument('Taslak'));

    const written = writeHybridDraft(json, { title: 'Taslak' }, storage, 'user-1');
    expect(written.ok).toBe(true);
    expect(storage.data.has(hybridDraftKey('user-1'))).toBe(true);

    const read = readHybridDraft(storage, 'user-1');
    expect(read?.title).toBe('Taslak');
    expect(read?.json).toBe(json);
    expect(read?.bytes).toBeGreaterThan(0);

    expect(clearHybridDraft(storage, 'user-1')).toBe(true);
    expect(readHybridDraft(storage, 'user-1')).toBeNull();
  });

  it('kullanıcıya göre ayrı yuva kullanır', () => {
    const storage = memoryStorage();
    writeHybridDraft('{"a":1}', { title: 'A' }, storage, 'user-a');
    writeHybridDraft('{"b":2}', { title: 'B' }, storage, 'user-b');
    expect(readHybridDraft(storage, 'user-a')?.json).toBe('{"a":1}');
    expect(readHybridDraft(storage, 'user-b')?.json).toBe('{"b":2}');
  });

  it('boyut sınırını aşan taslağı reddeder ve öncekini korur', () => {
    const storage = memoryStorage();
    writeHybridDraft('{"a":1}', { title: 'kucuk' }, storage);

    const tooLarge = 'x'.repeat(DRAFT_MAX_BYTES + 1);
    const result = writeHybridDraft(tooLarge, { title: 'buyuk' }, storage);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('too-large');
    expect(readHybridDraft(storage)?.json).toBe('{"a":1}');
  });

  it('depolama yoksa güvenli biçimde başarısız olur', () => {
    const result = writeHybridDraft('{}', {}, null);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('unavailable');
    expect(readHybridDraft(null)).toBeNull();
  });

  it('bozuk kaydı yok sayar', () => {
    const storage = memoryStorage();
    storage.setItem(hybridDraftKey(), '{bozuk-json');
    expect(readHybridDraft(storage)).toBeNull();
  });
});
