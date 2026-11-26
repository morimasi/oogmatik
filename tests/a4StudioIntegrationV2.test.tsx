import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { SingleWorksheetData, WorksheetBlock, WorksheetData, StyleSettings } from '../src/types';
import {
  addCustomBlock,
  createBlock,
  updatePageHeader,
  flattenBlocks,
} from '../src/services/a4EditorService';
import { useA4EditorStore } from '../src/store/useA4EditorStore';
import { A4PageShell, resolveFontSizePx } from '../src/components/SheetRenderer/A4PageShell';
import { ContentPanel } from '../src/components/A4Editor/ContentPanel';

describe('A4 Tasarımcısı — Universal Entegrasyon & Reaktiflik Testleri', () => {
  beforeEach(() => {
    useA4EditorStore.setState({
      selectedBlockId: null,
      selectedBlockIds: [],
      editingBlockId: null,
      history: [],
      future: [],
      isEditorOpen: false,
      isPrintPreview: false,
    });
  });

  it('addCustomBlock hem bloklu hem legacy şablonlu sayfalara güvenle blok ekler', () => {
    // 1. Bloklu sayfa
    const blockPage: SingleWorksheetData = {
      title: 'Bloklu Sayfa',
      instruction: 'Yönerge',
      layoutArchitecture: { cols: 1, blocks: [] },
    };
    const blockData: WorksheetData = [blockPage];
    const newBlock1 = createBlock('text', { text: 'Ek Metin 1' });
    const next1 = addCustomBlock(blockData, newBlock1);
    expect(flattenBlocks(next1)).toHaveLength(1);
    expect(flattenBlocks(next1)[0].block.id).toBe(newBlock1.id);

    // 2. Legacy sayfa (layoutArchitecture veya blocks yok)
    const legacyPage: SingleWorksheetData = {
      title: 'Legacy Şablon',
      instruction: 'Legacy yönerge',
    };
    const legacyData: WorksheetData = [legacyPage];
    const newBlock2 = createBlock('header', { text: 'Ek Başlık' });
    const next2 = addCustomBlock(legacyData, newBlock2);
    expect(flattenBlocks(next2)).toHaveLength(1);
    expect(flattenBlocks(next2)[0].block.type).toBe('header');
  });

  it('updatePageHeader sayfa başlığı ve yönergesini anında günceller', () => {
    const data: WorksheetData = [
      {
        title: 'Eski Başlık',
        instruction: 'Eski Yönerge',
      },
    ];
    const next = updatePageHeader(data, {
      title: 'Yeni Özelleştirilmiş Başlık',
      instruction: 'Yeni Yönerge Detayı',
    });
    expect(Array.isArray(next) && next[0].title).toBe('Yeni Özelleştirilmiş Başlık');
    expect(Array.isArray(next) && next[0].instruction).toBe('Yeni Yönerge Detayı');
  });

  it('resolveFontSizePx sayı ve metinsel ölçekleri doğru piksel değerlerine çevirir', () => {
    expect(resolveFontSizePx(18)).toBe(18);
    expect(resolveFontSizePx('küçük')).toBe(14);
    expect(resolveFontSizePx('orta')).toBe(16);
    expect(resolveFontSizePx('büyük')).toBe(20);
    expect(resolveFontSizePx(undefined)).toBe(16);
  });

  it('A4PageShell tüm sayfa ayarlarını, tema dokusunu ve öğrenci şeridini DOM niteliklerine yansıtır', () => {
    const settings: StyleSettings = {
      fontSize: 20,
      scale: 1,
      borderColor: '#4f46e5',
      borderWidth: 3,
      margin: 12,
      columns: 2,
      gap: 16,
      orientation: 'landscape',
      themeBorder: 'simple',
      contentAlign: 'left',
      fontWeight: 'bold',
      fontStyle: 'normal',
      visualStyle: 'card',
      lineHeight: 1.8,
      letterSpacing: 0.5,
      wordSpacing: 2,
      paragraphSpacing: 24,
      showMascot: false,
      showStudentInfo: true,
      showTitle: true,
      showInstruction: true,
      showFooter: true,
      showAnswers: false,
      showClues: true,
      footerText: 'Özel Zümre Notu',
      fontFamily: 'Lexend',
      smartPagination: false,
      paperTexture: 'grid',
    };

    const student = {
      id: 's-1',
      name: 'Ali Yılmaz',
      grade: '4-B',
    };

    const html = renderToStaticMarkup(
      <A4PageShell
        settings={settings}
        studentProfile={student as any}
        pageIdx={0}
        totalPages={1}
      >
        <div data-testid="page-content">A4 Test İçeriği</div>
      </A4PageShell>
    );

    expect(html).toContain('paper-texture-grid');
    expect(html).toContain('landscape');
    expect(html).toContain('Ali Yılmaz');
    expect(html).toContain('4-B');
    expect(html).toContain('Özel Zümre Notu');
    expect(html).toContain('A4 Test İçeriği');
    expect(html).toContain('data-a4-styled="true"');
    expect(html).toContain('--worksheet-border-color:#4f46e5');
    expect(html).toContain('--worksheet-border-width:3px');
  });

  it('ContentPanel seçim yokken sayfa başlığı ve yönergesi düzenleme formunu sunar', () => {
    const sampleData: WorksheetData = [
      {
        title: 'Canlı Düzenlenen Etkinlik',
        instruction: 'Tüm soruları dikkatle inceleyin.',
        layoutArchitecture: {
          cols: 1,
          blocks: [
            {
              id: 'b-100',
              type: 'text',
              content: { text: 'Birinci paragraf' },
            },
          ],
        },
      },
    ];

    const html = renderToStaticMarkup(
      <ContentPanel
        selectedCount={0}
        worksheetData={sampleData}
      />
    );

    expect(html).toContain('Sayfa Başlığı &amp; Yönerge');
    expect(html).toContain('Canlı Düzenlenen Etkinlik');
    expect(html).toContain('Tüm soruları dikkatle inceleyin.');
    expect(html).toContain('Bileşen Seç');
  });
});
