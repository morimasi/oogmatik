// Math Studio — Drill Mode Canvas (A4 render with manual page control)

import React, { useState } from 'react';
import { MathDrillConfig, MathPageConfig, MathOperation } from '../../../types/math';
import { PageShell } from './PageShell';
import { OperationCardVertical, OperationCardHorizontal } from './OperationCard';
import { ThemeConfig } from '../constants';
import { calculateItemsPerPage } from '../utils'; // DRY: merkezi hesaplama

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
    const [pageCount, setPageCount] = useState(1);

    // DRY: utils.ts'deki merkezi calculateItemsPerPage kullanılıyor (tekrar yok)
    const perPage = calculateItemsPerPage(drillConfig, pageConfig.margin);

    // Boş durum — öğretmene yönlendirici placeholder A4
    if (generatedDrills.length === 0) {
        return (
            <PageShell
                pageConfig={pageConfig}
                pageIndex={0}
                totalPages={1}
                studentName={studentName}
                themeConfig={themeConfig}
            >
                <div className="flex flex-col items-center justify-center py-24 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50">
                    <i className="fa-solid fa-calculator text-5xl mb-4 text-zinc-300" />
                    <p className="text-base font-bold mt-2">Sol panelden işlem türünü seçin</p>
                    <p className="text-sm text-zinc-400 mt-1">"Sayfayı Oluştur" butonuna basarak başlayın.</p>
                </div>
            </PageShell>
        );
    }

    // Split drills into pages
    const pages: MathOperation[][] = [];
    for (let i = 0; i < generatedDrills.length; i += perPage) {
        pages.push(generatedDrills.slice(i, i + perPage));
    }
    if (pages.length === 0) pages.push([]);

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
                                    ? <OperationCardVertical
                                        op={op}
                                        fontSize={drillConfig.fontSize}
                                        fontWeight={drillConfig.fontWeight}
                                        showText={drillConfig.showTextRepresentation}
                                        themeConfig={themeConfig}
                                        index={pageIdx * perPage + i}
                                        showAnswer={drillConfig.showAnswer}
                                      />
                                    : <OperationCardHorizontal
                                        op={op}
                                        fontSize={drillConfig.fontSize}
                                        fontWeight={drillConfig.fontWeight}
                                        showText={drillConfig.showTextRepresentation}
                                        themeConfig={themeConfig}
                                        index={pageIdx * perPage + i}
                                        showAnswer={drillConfig.showAnswer}
                                      />
                                }
                            </div>
                        ))}
                    </div>
                </PageShell>
            ))}

            {/* Page Control Bar */}
            <div className="flex items-center gap-4 py-4 px-6 bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold">
                    <i className="fa-solid fa-layer-group" />
                    <span>Sayfa {Math.min(pageCount, totalPages)} / {totalPages}</span>
                </div>

                {canAddPage && (
                    <button
                        onClick={() => setPageCount(prev => prev + 1)}
                        className="flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent border border-accent/30 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent/30 transition-all"
                    >
                        <i className="fa-solid fa-plus" />
                        Sayfa Ekle
                    </button>
                )}

                {pageCount > 1 && (
                    <button
                        onClick={() => setPageCount(prev => Math.max(1, prev - 1))}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-700 transition-all"
                    >
                        <i className="fa-solid fa-minus" />
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
