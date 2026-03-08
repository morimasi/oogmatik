// Math Studio — A4 Page Shell (Reusable page wrapper)

import React from 'react';
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '../constants';
import { MathPageConfig } from '../../../types/math';
import { EditableText } from '../../Editable';

interface PageShellProps {
    pageConfig: MathPageConfig;
    pageIndex: number;
    totalPages: number;
    studentName?: string;
    children: React.ReactNode;
}

/**
 * Reusable A4 page wrapper with:
 * - Compact header band (title left, name + date right)
 * - Background pattern (blank/grid/dot) with dynamic gridSize
 * - Footer with branding + dynamic page number
 */
export const PageShell: React.FC<PageShellProps> = ({
    pageConfig,
    pageIndex,
    totalPages,
    studentName,
    children,
}) => {
    const bgSize = pageConfig.paperType === 'dot'
        ? `${pageConfig.gridSize}px ${pageConfig.gridSize}px`
        : `${pageConfig.gridSize * 2}px ${pageConfig.gridSize * 2}px`;

    const bgImage = pageConfig.paperType === 'grid'
        ? 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)'
        : pageConfig.paperType === 'dot'
            ? 'radial-gradient(#9ca3af 1px, transparent 1px)'
            : 'none';

    return (
        <div
            className="math-canvas-page bg-white text-black shadow-2xl relative flex flex-col origin-top"
            style={{
                width: `${A4_WIDTH_PX}px`,
                minHeight: `${A4_HEIGHT_PX}px`,
                height: 'auto',
                padding: `${pageConfig.margin}px`,
                backgroundImage: bgImage,
                backgroundSize: bgSize,
                marginBottom: pageIndex < totalPages - 1 ? '32px' : '0',
            }}
        >
            {/* COMPACT HEADER — single line band */}
            <div className="border-b-2 border-black pb-2 mb-3">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-black uppercase tracking-tight text-black leading-none">
                        <EditableText value={pageConfig.title} />
                    </h1>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {pageConfig.showName && (
                            <span>Ad: {studentName || '........................'}</span>
                        )}
                        {pageConfig.showDate && (
                            <span>Tarih: ..................</span>
                        )}
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1">
                {children}
            </div>

            {/* FOOTER — thin line */}
            <div className="mt-3 pt-1.5 border-t border-zinc-200 flex justify-between items-center text-[9px] text-zinc-400 font-mono uppercase">
                <span>Bursa Disleksi AI</span>
                <span>Sayfa {pageIndex + 1} / {totalPages}</span>
            </div>
        </div>
    );
};
