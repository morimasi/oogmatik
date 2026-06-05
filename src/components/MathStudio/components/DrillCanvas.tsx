// Math Studio — Drill Mode Canvas (A4 render with manual page control)

import React, { useState } from 'react';
import { MathDrillConfig, MathPageConfig, MathOperation } from '../../../types/math';
import { PageShell } from './PageShell';
import { OperationCardVertical, OperationCardHorizontal } from './OperationCard';
import { ThemeConfig } from '../constants';

interface DrillCanvasProps {
    drillConfig: MathDrillConfig;
    pageConfig: MathPageConfig;
    themeConfig: ThemeConfig;
    generatedDrills: MathOperation[];
    studentName?: string;
}

export const DrillCanvas: React.FC<DrillCanvasProps> = ({
    drillConfig,
    pageConfig,
    themeConfig,
    generatedDrills,
    studentName,
}) => {
    // User controls how many pages to show (default: 1)
    const [pageCount, setPageCount] = useState(1);

    // Calculate items per page
    const perPage = (() => {
        const A4_HEIGHT_PX = 1123;
        const HEADER_HEIGHT = 52;
        const FOOTER_HEIGHT = 32;
        const usableHeight = A4_HEIGHT_PX - HEADER_HEIGHT - FOOTER_HEIGHT - pageConfig.margin * 2;

        const fs = drillConfig.fontSize;
        let lineCount = 4.0;

        const ops = drillConfig.selectedOperations.filter(o => o !== 'mixed');
        const calcHeightForOp = (op: string) => {
            let lc = 4.0;
            if (op === 'div') {
                lc = 7.0;
                if (drillConfig.digit2 >= 2) lc += 2.0;
            } else if (op === 'mult') {
                if (drillConfig.digit2 >= 2) lc += 3.5;
                else lc += 1.5;
            }
            if (drillConfig.useThirdNumber && op !== 'div') lc += 1.0;
            const textExtra = drillConfig.showTextRepresentation ? 16 : 0;
            return fs * lc + textExtra + 24;
        };

        let itemH: number;
        if (ops.length === 0) {
            itemH = calcHeightForOp('add');
        } else if (ops.length === 1) {
            itemH = calcHeightForOp(ops[0]);
        } else {
            itemH = ops.reduce((sum, op) => sum + calcHeightForOp(op), 0) / ops.length;
        }

        if (drillConfig.orientation === 'horizontal') {
            itemH = fs * 2.2 + 20;
        }

        const gapY = drillConfig.gap || 12;
        const rows = Math.floor(usableHeight / (itemH + gapY));
        const cols = Math.max(1, Math.min(8, drillConfig.cols));
        return Math.max(1, Math.floor(rows * cols * 0.95));
    })();

    // Split drills into pages
    const pages: MathOperation[][] = [];
    for (let i = 0; i < generatedDrills.length; i += perPage) {
        pages.push(generatedDrills.slice(i, i + perPage));
    }
    if (pages.length === 0) pages.push([]);

    // Only show up to pageCount pages (user-controlled)
    const visiblePages = pages.slice(0, Math.min(pageCount, pages.length));
    const totalPages = pages.length;

    const hasMorePages = pageCount < totalPages;
    const canAddPage = pageCount < totalPages;

    return (
        <>
            {visiblePages.map((pageItems, pageIdx) => (
                <PageShell
                    key={pageIdx}
                    pageConfig={pageConfig}
                    pageIndex={pageIdx}
                    totalPages={Math.min(pageCount, totalPages)}
                    studentName={studentName}
                    themeConfig={themeConfig}
                >
                    <div
                        className="grid w-full"
                        style={{
                            gridTemplateColumns: `repeat(${drillConfig.cols}, 1fr)`,
                            gap: `${drillConfig.gap}px`,
                        }}
                    >
                        {pageItems.map((op, i) => (
                            <div key={op.id} className="flex justify-center items-start">
                                {drillConfig.orientation === 'vertical'
                                    ? <OperationCardVertical op={op} fontSize={drillConfig.fontSize} fontWeight={drillConfig.fontWeight} showText={drillConfig.showTextRepresentation} themeConfig={themeConfig} index={pageIdx * perPage + i} />
                                    : <OperationCardHorizontal op={op} fontSize={drillConfig.fontSize} fontWeight={drillConfig.fontWeight} showText={drillConfig.showTextRepresentation} themeConfig={themeConfig} index={pageIdx * perPage + i} />
                                }
                            </div>
                        ))}
                    </div>
                </PageShell>
            ))}

            {/* Page Control Bar */}
            <div className="flex items-center gap-4 py-4 px-6 bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold">
                    <i className="fa-solid fa-layer-group"></i>
                    <span>Sayfa {Math.min(pageCount, totalPages)} / {totalPages}</span>
                </div>

                {canAddPage && (
                    <button
                        onClick={() => setPageCount(prev => prev + 1)}
                        className="flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent border border-accent/30 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent/30 transition-all"
                    >
                        <i className="fa-solid fa-plus"></i>
                        Sayfa Ekle
                    </button>
                )}

                {pageCount > 1 && (
                    <button
                        onClick={() => setPageCount(prev => Math.max(1, prev - 1))}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-700 transition-all"
                    >
                        <i className="fa-solid fa-minus"></i>
                        Sayfa Kaldır
                    </button>
                )}

                {hasMorePages && (
                    <span className="text-[10px] text-zinc-500 font-bold">
                        +{totalPages - pageCount} sayfa daha mevcut
                    </span>
                )}
            </div>
        </>
    );
};
