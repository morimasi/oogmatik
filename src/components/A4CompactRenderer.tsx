import React from 'react';
import {
  calculateA4Dimensions,
  A4LayoutConfig,
  getTailwindGridClass,
  LAYOUT_PRESETS,
  A4_SIZES,
} from '../services/compactA4LayoutService';

export interface A4CompactRendererProps {
  items: React.ReactNode[];
  layoutConfig?: Partial<A4LayoutConfig>;
  itemsPerPage?: 4 | 6 | 8;
  paperSize?: 'A4' | 'LETTER' | 'B5';
  className?: string;
}

/**
 * Compact A4 Renderer
 * Renders activities in 4/6/8 per page print-friendly layout
 */
export const A4CompactRenderer: React.FC<A4CompactRendererProps> = ({
  items,
  layoutConfig,
  itemsPerPage = 4,
  paperSize = 'A4',
  className = '',
}: A4CompactRendererProps) => {
  const paperDims = A4_SIZES[paperSize as keyof typeof A4_SIZES];
  const presetKey = `compact${itemsPerPage}` as keyof typeof LAYOUT_PRESETS;
  const presetConfig = LAYOUT_PRESETS[presetKey];

  const config: A4LayoutConfig = {
    ...presetConfig,
    itemsPerPage,
    pageWidth: paperDims.width,
    pageHeight: paperDims.height,
    ...layoutConfig,
  };

  const dims = calculateA4Dimensions(config);
  const gridClass = getTailwindGridClass(itemsPerPage as 4 | 6 | 8);

  return (
    <div
      className={`
        print:p-0 print:m-0 print:border-0
        bg-white font-lexend
        ${className}
      `}
      style={{
        width: '100%',
        maxWidth: `${config.pageWidth}mm`,
        minHeight: `${config.pageHeight}mm`,
      }}
    >
      <div
        className={`grid ${gridClass} w-full h-full auto-rows-fr`}
        style={{
          padding: `${config.marginTop}mm ${config.marginRight}mm ${config.marginBottom}mm ${config.marginLeft}mm`,
          gap: `${config.gapBetweenItems}mm`,
        }}
      >
        {items.map((item: React.ReactNode, idx: number) => (
          <div
            key={idx}
            className="
              border border-gray-200
              rounded-lg p-3
              print:page-break-inside-avoid
              print:border-black print:border-1
              bg-white
              flex items-center justify-center
            "
            style={{
              width: `${dims.itemWidth}mm`,
              height: `${dims.itemHeight}mm`,
              maxWidth: '100%',
              maxHeight: '100%',
              overflow: 'hidden',
              pageBreakInside: 'avoid',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

A4CompactRenderer.displayName = 'A4CompactRenderer';
