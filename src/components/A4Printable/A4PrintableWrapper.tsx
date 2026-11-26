import React from 'react';
import { useOrientationDimensions } from '../../hooks/useOrientationDimensions';

type Props = {
  settings?: { orientation?: string };
  children: React.ReactNode;
};

export const A4PrintableWrapper: React.FC<Props> = ({ settings, children }) => {
  const { isLandscape, width, height } = useOrientationDimensions(settings?.orientation);
  const style: React.CSSProperties = {
    width: `${width}px`,
    minHeight: `${height}px`,
  };
  const className = `worksheet-page print-page shadow-2xl mb-6 print:mb-0 print:min-h-0 print:h-auto ${isLandscape ? 'landscape' : ''}`;
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};

export default A4PrintableWrapper;
