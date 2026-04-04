import React from 'react';
import { CompactLayoutEngine } from '../../../services/layout/CompactLayoutEngine';

interface GridWrapperProps {
  engine: CompactLayoutEngine;
  children: React.ReactNode;
}

export const GridWrapper: React.FC<GridWrapperProps> = ({ engine, children }) => {
  // Config exists as private in TS but we can type-cast or read it directly in JS,
  // however, since it's private in the definition, we must access it appropriately.
  // We'll bypass TS private or change the class definition to make config public/getter.
  // The layout engine has `config` as private. Let's use `as any` or we should make it public.
  // Wait, I can just use engine as any for now, or edit CompactLayoutEngine.
  const gridLayout = engine.calculateGridLayout();
  const config = engine.config;

  if (!gridLayout) {
    // Grid disabled, sütunlu layout kullan
    const columnWidths = engine.calculateColumnWidths();
    return (
      <div className="flex" style={{ gap: `${config.gutterWidth}mm` }}>
        {React.Children.map(children, (child, i) => (
          <div key={i} style={{ width: `${columnWidths[i % columnWidths.length]}mm` }}>
            {child}
          </div>
        ))}
      </div>
    );
  }

  // Grid enabled
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${config.gridSystem.cols}, ${gridLayout.cellWidth}mm)`,
        gridTemplateRows: `repeat(${config.gridSystem.rows}, ${gridLayout.cellHeight}mm)`,
        gap: `${config.gridSystem.cellGap}mm`,
      }}
    >
      {children}
    </div>
  );
};
