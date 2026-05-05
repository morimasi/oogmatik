import React from 'react';
import A4PrintableWrapper from '../A4Printable/A4PrintableWrapper';
import { A4PrintableSheetV2 } from '../InfographicStudio/panels/CenterPanel/A4PrintableSheetV2';

// Note: import path for A4PrintableSheetV2 should correctly resolve to its location.
// We keep this module lightweight and focused on rendering the A4 printable sheet
// using the orientation-aware wrapper.

type Props = {
  data: any;
  settings?: any;
};

export const InfoGraphicRenderer: React.FC<Props> = ({ data, settings }) => {
  // 1. Eğer data bir CompositeWorksheet (Studio çıktısı) ise direkt render et
  if (data?.widgets) {
    return (
      <A4PrintableWrapper settings={settings}>
        <A4PrintableSheetV2 worksheet={data} hideWrapper={true} settings={settings} />
      </A4PrintableWrapper>
    );
  }

  // 2. Eğer data tekil bir AI sonucu (syntax içerikli) ise, sanal bir worksheet oluştur
  if (data?.syntax) {
    const virtualWorksheet = {
      id: 'v_' + Date.now(),
      title: data.title || 'İnfografik Çalışması',
      topic: data.title,
      difficultyLevel: data.difficultyLevel,
      ageGroup: data.ageGroup,
      widgets: [
        {
          id: 'w1',
          type: 'infographic',
          data: { syntax: data.syntax }
        }
      ]
    };

    return (
      <A4PrintableWrapper settings={settings}>
        <A4PrintableSheetV2 worksheet={virtualWorksheet as any} hideWrapper={true} settings={settings} />
      </A4PrintableWrapper>
    );
  }

  return (
    <div className="p-8 text-center text-slate-400 italic border-2 border-dashed rounded-2xl">
      Geçersiz İnfografik Verisi
    </div>
  );
};

export default InfoGraphicRenderer;
