/**
 * Toolbar & A4 Studio Entegrasyon Doğrulama Testleri (toolbar.md §21)
 */
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ActionModule } from '../src/components/Toolbar/ActionModule';
import { InsightsPanel } from '../src/components/A4Editor/InsightsPanel';
import { useA4EditorStore } from '../src/store/useA4EditorStore';
import type { StyleSettings, WorksheetData } from '../src/types';

const SAMPLE_SETTINGS: StyleSettings = {
  fontSize: 16,
  scale: 1,
  borderColor: '#000000',
  borderWidth: 2,
  margin: 10,
  columns: 1,
  gap: 12,
  orientation: 'portrait',
  themeBorder: 'simple',
  contentAlign: 'left',
  fontWeight: 'normal',
  fontStyle: 'normal',
  visualStyle: 'card',
  lineHeight: 1.6,
  letterSpacing: 0,
  wordSpacing: 0,
  paragraphSpacing: 16,
  showMascot: false,
  showStudentInfo: false,
  showTitle: true,
  showInstruction: true,
  showFooter: true,
  showAnswers: false,
  showClues: true,
  footerText: '',
  fontFamily: 'Lexend',
  smartPagination: false,
};

const SAMPLE_WORKSHEET: WorksheetData = [
  {
    title: 'Disleksi Okuma Etkinliği',
    instruction: 'Metni dikkatlice okuyun.',
    layoutArchitecture: {
      cols: 1,
      blocks: [
        {
          id: 'blk-1',
          type: 'text',
          content: { text: 'Örnek kısa paragraf.' },
          style: { fontSize: 11, lineHeight: 1.1 },
          pedagogicalNote: 'Okuma akıcılığını destekler.',
        },
      ],
    },
  },
];

describe('toolbar.md v2.1 Entegrasyon Testleri', () => {
  beforeEach(() => {
    useA4EditorStore.setState({
      isEditorOpen: false,
      commandPaletteOpen: false,
      answerKeyMode: 'off',
      printLayout: 'single',
      cutLines: false,
      dirty: false,
      history: [],
      future: [],
    });
  });

  it('ActionModule düzenleme, zoom, dışa aktarma, stüdyo ve kayıt gruplarını render eder', () => {
    const html = renderToStaticMarkup(
      <ActionModule
        settings={SAMPLE_SETTINGS}
        onSave={() => {}}
        worksheetData={SAMPLE_WORKSHEET}
        activityType="STORY_COMPREHENSION"
      />
    );
    expect(html).toContain('PDF');
    expect(html).toContain('YAZDIR');
    expect(html).toContain('YAZDIR V2');
    expect(html).toContain('STÜDYO');
    expect(html).toContain('Geri al (Ctrl+Z)');
    expect(html).toContain('A4 Tasarımcısını Aç');
  });

  it('InsightsPanel düşük punto/satır yüksekliği tespit ettiğinde "Tümünü Düzelt" butonunu gösterir', () => {
    const html = renderToStaticMarkup(
      <InsightsPanel
        worksheetData={SAMPLE_WORKSHEET}
        styleSettings={SAMPLE_SETTINGS}
        activityType="STORY_COMPREHENSION"
      />
    );
    expect(html).toContain('Üretim Denetimi');
    expect(html).toContain('Tümünü Düzelt');
  });
});
