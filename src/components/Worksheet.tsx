import React, { useMemo } from 'react';
import { ActivityType, WorksheetData, StyleSettings, StudentProfile, OverlayItem } from '../types';
import { useEditable } from './Editable';
import { ErrorBoundary } from './ErrorBoundary';
import { SheetRenderer } from './SheetRenderer';

interface WorksheetProps {
  activityType: ActivityType | null;
  data: WorksheetData;
  settings: StyleSettings;
  studentProfile?: StudentProfile | null;
  overlayItems?: OverlayItem[];
  showQR?: boolean;
}

const Worksheet = ({ activityType, data, settings, studentProfile, showQR }: WorksheetProps) => {
  const { isEditMode } = useEditable();

  const variableStyle = useMemo(() => {
    const userCols = Math.max(1, settings.columns || 1);
    const baseFontSize = settings.fontSize || 16;
    return {
      '--worksheet-font-size': `${baseFontSize}px`,
      '--worksheet-border-color': settings.borderColor,
      '--worksheet-border-width': `${settings.borderWidth}px`,
      '--worksheet-margin': `${settings.margin}px`,
      '--worksheet-gap': `${Math.max(2, settings.gap)}px`,
      '--worksheet-gutter': `${settings.gutter || 20}px`,
      '--worksheet-font-family': settings.fontFamily || 'Lexend',
      '--worksheet-line-height': settings.lineHeight || 1.4,
      '--worksheet-letter-spacing': `${settings.letterSpacing || 0}px`,
      '--worksheet-word-spacing': `${settings.wordSpacing || 0}px`,
      '--worksheet-paragraph-spacing': `${settings.paragraphSpacing || 20}px`,
      '--content-align': settings.contentAlign || 'center',
      '--font-weight': settings.fontWeight || 'normal',
      '--font-style': settings.fontStyle || 'normal',
      '--grid-columns': `repeat(${userCols}, minmax(0, 1fr))`,
      '--display-title': settings.showTitle ? 'block' : 'none',
      '--display-instruction': settings.showInstruction ? 'block' : 'none',
      '--display-image': settings.showImage ? 'block' : 'none',
      '--worksheet-is-compact': settings.compact ? '1' : '0',
    } as unknown as React.CSSProperties;
  }, [settings]);

  const isLandscape = settings.orientation === 'landscape';
  const paperTextureClass = settings.paperTexture && settings.paperTexture !== 'none' 
    ? `paper-texture-${settings.paperTexture}` 
    : '';

  if (!data || !activityType) return null;

  // Birden fazla çalışma sayfası varsa (worksheetCount > 1), hepsini render et
  const worksheets = Array.isArray(data) ? data : [data];

  if (worksheets.length === 0) return null;

  return (
    <div
      className={`flex flex-col items-center w-full ${isLandscape ? 'app-orientation-landscape' : 'app-orientation-portrait'} ${paperTextureClass}`}
      style={variableStyle}
    >
      {worksheets.map((ws, idx) => (
        <ErrorBoundary key={ws.id || idx}>
          <SheetRenderer
            activityType={activityType}
            data={ws}
            studentProfile={studentProfile}
            settings={settings}
          />
        </ErrorBoundary>
      ))}
    </div>
  );
};

export default Worksheet;
