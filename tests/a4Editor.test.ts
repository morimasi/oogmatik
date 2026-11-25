import { describe, it, expect, beforeEach } from 'vitest';
import type { SingleWorksheetData, WorksheetBlock, WorksheetData } from '../src/types';
import {
  addBlock,
  applyLayoutSettings,
  blockPreview,
  createBlock,
  duplicateBlocks,
  flattenBlocks,
  moveBlocks,
  removeBlocks,
  reorderBlocks,
  resetBlockStyle,
  updateBlockContent,
  updateBlockFlags,
  updateBlockStyle,
} from '../src/services/a4EditorService';
import { useA4EditorStore } from '../src/store/useA4EditorStore';

const makeBlock = (
  id: string,
  type: WorksheetBlock['type'],
  content: Record<string, unknown>,
  extra: Partial<WorksheetBlock> = {}
): WorksheetBlock => ({ id, type, content, ...extra });

const makePage = (blocks: WorksheetBlock[]): SingleWorksheetData => ({
  title: 'Test Etkinliği',
  instruction: 'Yönerge',
  layoutArchitecture: { cols: 1, gap: 20, blocks },
});

const makeData = (): WorksheetData => [
  makePage([
    makeBlock('b1', 'header', { text: 'Başlık' }, { style: { fontSize: 18 } }),
    makeBlock('b2', 'text', { text: 'Metin' }),
    makeBlock('b3', 'question', { text: 'Soru?', options: ['A', 'B'], answer: 'A' }),
  ]),
];

const blocksOf = (data: WorksheetData): WorksheetBlock[] => flattenBlocks(data).map((entry) => entry.block);

describe('a4EditorService — bileşen düzenleme', () => {
  it('stil güncellemesini yalnızca hedef bileşene uygular', () => {
    const data = makeData();
    const next = updateBlockStyle(data, ['b2'], { fontSize: 24, color: '#E11D48' });
    const blocks = blocksOf(next);

    expect(blocks.find((block) => block.id === 'b2')?.style).toEqual({
      fontSize: 24,
      color: '#E11D48',
    });
    expect(blocks.find((block) => block.id === 'b1')?.style).toEqual({ fontSize: 18 });
    // Orijinal veri değişmemeli (immutable)
    expect(blocksOf(data).find((block) => block.id === 'b2')?.style).toBeUndefined();
  });

  it('çoklu seçimde stili tüm seçili bileşenlere uygular', () => {
    const next = updateBlockStyle(makeData(), ['b1', 'b3'], { fontWeight: 'bold' });
    expect(blocksOf(next).find((block) => block.id === 'b1')?.style?.fontWeight).toBe('bold');
    expect(blocksOf(next).find((block) => block.id === 'b3')?.style?.fontWeight).toBe('bold');
    expect(blocksOf(next).find((block) => block.id === 'b2')?.style).toBeUndefined();
  });

  it('içerik yamasını mevcut alanları koruyarak birleştirir', () => {
    const next = updateBlockContent(makeData(), 'b3', { text: 'Yeni soru?' });
    const block = blocksOf(next).find((item) => item.id === 'b3');
    expect(block?.content).toMatchObject({
      text: 'Yeni soru?',
      options: ['A', 'B'],
      answer: 'A',
    });
  });

  it('bileşeni çoğaltırken yeni kimlik üretir ve içeriği derin kopyalar', () => {
    const next = duplicateBlocks(makeData(), ['b3']);
    const blocks = blocksOf(next);
    expect(blocks).toHaveLength(4);

    const original = blocks.find((block) => block.id === 'b3');
    const copy = blocks[3];
    expect(copy.id).not.toBe(original?.id);
    expect(copy.content).toEqual(original?.content);

    // Derin kopya: kopyanın içeriğini değiştirmek orijinali etkilemez
    (copy.content as Record<string, unknown>).options = ['X'];
    expect((original?.content as Record<string, unknown>).options).toEqual(['A', 'B']);
  });

  it('silme ve sıralama işlemleri akış sırasını korur', () => {
    const next = removeBlocks(makeData(), ['b2']);
    expect(blocksOf(next).map((block) => block.id)).toEqual(['b1', 'b3']);

    const moved = moveBlocks(makeData(), ['b3'], -1);
    expect(blocksOf(moved).map((block) => block.id)).toEqual(['b1', 'b3', 'b2']);

    const reordered = reorderBlocks(makeData(), 'b1', 'b3');
    expect(blocksOf(reordered).map((block) => block.id)).toEqual(['b2', 'b3', 'b1']);
  });

  it('gizleme ve kilitleme bayraklarını stil güncellemesi bozmaz', () => {
    const hidden = updateBlockFlags(makeData(), ['b2'], { hidden: true, locked: true });
    const styled = updateBlockStyle(hidden, ['b2'], { backgroundColor: '#FEF3C7' });
    const block = blocksOf(styled).find((item) => item.id === 'b2');
    expect(block?.hidden).toBe(true);
    expect(block?.locked).toBe(true);
    expect(block?.style?.backgroundColor).toBe('#FEF3C7');
  });

  it('stil sıfırlama devralınan stile döndürür', () => {
    const next = resetBlockStyle(makeData(), ['b1']);
    expect(blocksOf(next).find((block) => block.id === 'b1')?.style).toBeUndefined();
  });

  it('yeni bileşeni seçili bileşenin altına ekler', () => {
    const block = createBlock('text', { text: 'Ek metin' });
    const next = addBlock(makeData(), block, 'b1');
    expect(block.id).toBeTruthy();
    expect(blocksOf(next).map((item) => item.id)).toEqual(['b1', block.id, 'b2', 'b3']);
  });

  it('blok desteklemeyen sayfaya bileşen eklemez (şablon bozulmaz)', () => {
    const legacy: WorksheetData = [{ title: 'Eski', instruction: 'Yönerge' }];
    const next = addBlock(legacy, createBlock('text', { text: 'olmamalı' }), null);
    expect(flattenBlocks(next)).toHaveLength(0);
  });

  it('sayfa kolon ayarını mimariye uygular', () => {
    const next = applyLayoutSettings(makeData(), { cols: 2, gap: 32 });
    expect(Array.isArray(next) && next[0].layoutArchitecture).toMatchObject({ cols: 2, gap: 32 });
  });

  it('katman önizleme metnini kısaltır', () => {
    const long = makeBlock('b9', 'text', { text: 'a'.repeat(120) });
    expect(blockPreview(long).length).toBeLessThanOrEqual(49);
  });
});

describe('useA4EditorStore — geçmiş, seçim ve canlı düzenleme', () => {
  let data: WorksheetData;
  const bridgeSet = (next: WorksheetData) => {
    data = next;
  };

  beforeEach(() => {
    data = makeData();
    useA4EditorStore.setState({
      history: [],
      future: [],
      mergeKey: null,
      mergeAt: 0,
      dirty: false,
      lastSavedAt: null,
      selectedBlockId: null,
      selectedBlockIds: [],
      isEditorOpen: false,
      isPrintPreview: false,
      copiedStyle: null,
    });
    useA4EditorStore.getState().registerBridge({
      get: () => data,
      set: bridgeSet,
    });
  });

  it('mutasyonu köprüye yazar ve kirli durumu işaretler', () => {
    useA4EditorStore.getState().updateBlockStyle(['b2'], { fontSize: 22 });
    expect(blocksOf(data).find((block) => block.id === 'b2')?.style?.fontSize).toBe(22);
    expect(useA4EditorStore.getState().dirty).toBe(true);
    expect(useA4EditorStore.getState().history).toHaveLength(1);
  });

  it('geri al ve yinele tutarlı çalışır', () => {
    const store = useA4EditorStore.getState();
    store.updateBlockStyle(['b2'], { fontSize: 22 });
    const styled = data;

    expect(useA4EditorStore.getState().undo()).toBe(true);
    expect(blocksOf(data)[1].style?.fontSize).toBeUndefined();
    expect(useA4EditorStore.getState().future).toHaveLength(1);

    expect(useA4EditorStore.getState().redo()).toBe(true);
    expect(blocksOf(data)[1].style?.fontSize).toBe(22);
    expect(data).toEqual(styled);
  });

  it('boş geçmişte geri al false döner ve veriyi değiştirmez', () => {
    const before = data;
    expect(useA4EditorStore.getState().undo()).toBe(false);
    expect(data).toBe(before);
  });

  it('kısa aralıktaki aynı tür düzenlemeleri tek geçmiş adımında birleştirir', () => {
    const store = useA4EditorStore.getState();
    store.updateBlockStyle(['b2'], { fontSize: 20 });
    store.updateBlockStyle(['b2'], { fontSize: 21 });
    expect(useA4EditorStore.getState().history).toHaveLength(1);

    useA4EditorStore.getState().undo();
    expect(blocksOf(data)[1].style?.fontSize).toBeUndefined();
  });

  it('çoğaltma işlemi seçili kimliği korur ve yeni bileşen ekler', () => {
    useA4EditorStore.setState({ selectedBlockIds: ['b3'], selectedBlockId: 'b3' });
    useA4EditorStore.getState().applyBlockAction('duplicate', ['b3']);
    expect(blocksOf(data)).toHaveLength(4);
    expect(useA4EditorStore.getState().selectedBlockId).toBe('b3');
  });

  it('çoklu seçim eklemeli çalışır', () => {
    const store = useA4EditorStore.getState();
    store.setSelectedBlockId('b1');
    store.setSelectedBlockId('b2', true);
    expect(useA4EditorStore.getState().selectedBlockIds).toEqual(['b1', 'b2']);

    store.setSelectedBlockId('b2', true);
    expect(useA4EditorStore.getState().selectedBlockIds).toEqual(['b1']);
  });

  it('kilitleme ve gizleme işlemleri veriyi günceller', () => {
    useA4EditorStore.getState().applyBlockAction('lock', ['b1']);
    useA4EditorStore.getState().applyBlockAction('hide', ['b1']);
    const block = blocksOf(data).find((item) => item.id === 'b1');
    expect(block?.locked).toBe(true);
    expect(block?.hidden).toBe(true);

    useA4EditorStore.getState().applyBlockAction('unlock', ['b1']);
    useA4EditorStore.getState().applyBlockAction('show', ['b1']);
    expect(blocksOf(data).find((item) => item.id === 'b1')?.locked).toBe(false);
  });

  it('kaydetme durumunu temizler', () => {
    useA4EditorStore.getState().updateBlockContent('b1', { text: 'Güncel' });
    expect(useA4EditorStore.getState().dirty).toBe(true);
    useA4EditorStore.getState().markSaved();
    expect(useA4EditorStore.getState().dirty).toBe(false);
    expect(useA4EditorStore.getState().lastSavedAt).toBeTypeOf('number');
  });

  it('baskı önizlemesi seçimi temizler', () => {
    const store = useA4EditorStore.getState();
    store.setSelectedBlockId('b1');
    store.setPrintPreview(true);
    expect(useA4EditorStore.getState().isPrintPreview).toBe(true);
    expect(useA4EditorStore.getState().selectedBlockIds).toEqual([]);
  });
});
