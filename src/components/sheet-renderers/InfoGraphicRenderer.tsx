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
  // Wrap with orientation-aware wrapper to ensure layout updates for landscape/portrait
  return (
    <A4PrintableWrapper settings={settings}>
      <A4PrintableSheetV2 worksheet={data} hideWrapper={true} settings={settings} />
    </A4PrintableWrapper>
  );
};

export default InfoGraphicRenderer;
