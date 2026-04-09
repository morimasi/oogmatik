// Math Studio — A4 Page Shell (Reusable page wrapper with Theme support)

import React from 'react';
import {
  A4_WIDTH_PX,
  A4_HEIGHT_PX,
  ThemeConfig,
  PAPER_THEMES,
  FONT_THEMES,
  DEFAULT_THEME_CONFIG,
} from '../constants';
import { MathPageConfig } from '../../../types/math';
import { EditableText } from '../../Editable';

interface PageShellProps {
  pageConfig: MathPageConfig;
  pageIndex: number;
  totalPages: number;
  studentName?: string;
  themeConfig?: ThemeConfig;
  children: React.ReactNode;
}

/**
 * Reusable A4 page wrapper with:
 * - Compact header band (title left, name + date right)
 * - Background pattern (blank/grid/dot) with dynamic gridSize
 * - Theme-aware colors, fonts, and border
 * - Footer with branding + dynamic page number
 */
export const PageShell: React.FC<PageShellProps> = ({
  pageConfig,
  pageIndex,
  totalPages,
  studentName,
  themeConfig = DEFAULT_THEME_CONFIG,
  children,
}) => {
  const paper = PAPER_THEMES[themeConfig.paperTheme];
  const font = FONT_THEMES[themeConfig.fontTheme];

  const bgSize =
    pageConfig.paperType === 'dot'
      ? `${pageConfig.gridSize}px ${pageConfig.gridSize}px`
      : `${pageConfig.gridSize * 2}px ${pageConfig.gridSize * 2}px`;

  const bgImage =
    pageConfig.paperType === 'grid'
      ? 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)'
      : pageConfig.paperType === 'dot'
        ? 'radial-gradient(#9ca3af 1px, transparent 1px)'
        : 'none';

  // Karne theme adds a thick outer border
  const karneClass = themeConfig.paperTheme === 'karne' ? 'border-[3px] border-slate-800' : '';

  return (
    <div
      className={`math-canvas-page worksheet-page shadow-2xl relative flex flex-col origin-top ${karneClass}`}
      style={{
        height: 'auto',
        padding: `${pageConfig.margin}px`,
        backgroundImage: bgImage,
        backgroundSize: bgSize,
        backgroundColor: paper.bg,
        color: paper.text,
        fontFamily: font.fontFamily,
        marginBottom: pageIndex < totalPages - 1 ? '32px' : '0',
      }}
    >
      {/* COMPACT HEADER — single line band */}
      <div className="pb-2 mb-3" style={{ borderBottom: `2px solid ${paper.border}` }}>
        <div className="flex justify-between items-center">
          <h1
            className="text-xl font-black uppercase tracking-tight leading-none"
            style={{ color: paper.text }}
          >
            <EditableText value={pageConfig.title} />
          </h1>
          <div
            className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider"
            style={{ color: paper.text, opacity: 0.5 }}
          >
            {pageConfig.showName && <span>Ad: {studentName || '........................'}</span>}
            {pageConfig.showDate && <span>Tarih: ..................</span>}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1">{children}</div>

      {/* FOOTER — thin line */}
      <div
        className="mt-3 pt-1.5 flex justify-between items-center text-[9px] font-mono uppercase"
        style={{ borderTop: `1px solid ${paper.border}30`, color: paper.text, opacity: 0.4 }}
      >
        <span>Bursa Disleksi AI</span>
        <span>
          Sayfa {pageIndex + 1} / {totalPages}
        </span>
      </div>
    </div>
  );
};
