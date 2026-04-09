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
    height: `${height}px`,
  };
  const className = `worksheet-page print-page shadow-2xl mb-8 ${isLandscape ? 'landscape' : ''}`;
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};

export default A4PrintableWrapper;
