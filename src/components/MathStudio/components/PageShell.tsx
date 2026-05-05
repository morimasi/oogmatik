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
      ? `linear-gradient(${paper.border}${Math.round(paper.patternOpacity * 255).toString(16).padStart(2, '0')} 1px, transparent 1px), linear-gradient(90deg, ${paper.border}${Math.round(paper.patternOpacity * 255).toString(16).padStart(2, '0')} 1px, transparent 1px)`
      : pageConfig.paperType === 'dot'
        ? `radial-gradient(${paper.border}${Math.round(paper.patternOpacity * 255).toString(16).padStart(2, '0')} 1px, transparent 1px)`
        : 'none';

  return (
    <div
      className={`math-canvas-page worksheet-page shadow-2xl relative flex flex-col origin-top overflow-hidden transition-all duration-500`}
      style={{
        width: `${A4_WIDTH_PX}px`,
        minHeight: `${A4_HEIGHT_PX}px`,
        padding: `${pageConfig.margin}px`,
        backgroundImage: bgImage,
        backgroundSize: bgSize,
        backgroundColor: paper.bg,
        color: paper.text,
        fontFamily: font.fontFamily,
        marginBottom: pageIndex < totalPages - 1 ? '40px' : '0',
        border: themeConfig.paperTheme === 'karne' ? `8px double ${paper.border}` : `1px solid ${paper.border}10`,
      }}
    >
      {/* PREMIUM DECORATIVE ELEMENTS */}
      {themeConfig.paperTheme === 'karne' && (
        <>
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-amber-500/30 m-2" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-amber-500/30 m-2" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-amber-500/30 m-2" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-amber-500/30 m-2" />
          <div className="absolute top-4 right-12 opacity-10 pointer-events-none">
             <i className="fa-solid fa-award text-6xl text-amber-600"></i>
          </div>
        </>
      )}

      {/* COMPACT HEADER */}
      <div className="pb-3 mb-6 relative" style={{ borderBottom: `2px solid ${paper.border}` }}>
        <div className="flex justify-between items-end">
          <div className="flex-1">
            <h1
              className="text-2xl font-black uppercase tracking-tighter leading-tight"
              style={{ color: paper.text }}
            >
              <EditableText value={pageConfig.title} />
            </h1>
            <div className="h-1 w-24 mt-1" style={{ backgroundColor: paper.accent }}></div>
          </div>
          
          <div
            className="flex flex-col items-end gap-1 text-[11px] font-bold uppercase tracking-wider"
            style={{ color: paper.text, opacity: 0.7 }}
          >
            {pageConfig.showName && (
              <div className="flex gap-2">
                <span>AD SOYAD:</span>
                <span className="border-b border-dotted min-w-[120px]" style={{ borderColor: paper.border }}>
                  {studentName || ''}
                </span>
              </div>
            )}
            {pageConfig.showDate && (
              <div className="flex gap-2">
                <span>TARİH:</span>
                <span className="border-b border-dotted min-w-[80px]" style={{ borderColor: paper.border }}></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 relative z-10">{children}</div>

      {/* PREMIUM FOOTER */}
      <div
        className="mt-6 pt-3 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest"
        style={{ borderTop: `1px solid ${paper.border}20`, color: paper.text, opacity: 0.5 }}
      >
        <div className="flex items-center gap-2">
           <i className="fa-solid fa-graduation-cap" style={{ color: paper.accent }}></i>
           <span>Bursa Disleksi EduMind • Math Studio PRO</span>
        </div>
        <div className="px-3 py-1 rounded-full bg-zinc-100/50" style={{ backgroundColor: paper.secondary }}>
          SAYFA {pageIndex + 1} / {totalPages}
        </div>
      </div>
    </div>
  );
};
