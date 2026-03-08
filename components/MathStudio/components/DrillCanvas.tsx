// Math Studio — Drill Mode Canvas (Multi-page A4 render)

import React from 'react';
import { MathDrillConfig, MathPageConfig, MathOperation } from '../../../types/math';
import { PageShell } from './PageShell';
import { OperationCardVertical, OperationCardHorizontal } from './OperationCard';
import { useDrillPagination } from '../hooks/usePagination';

interface DrillCanvasProps {
    drillConfig: MathDrillConfig;
    pageConfig: MathPageConfig;
    generatedDrills: MathOperation[];
    studentName?: string;
}

export const DrillCanvas: React.FC<DrillCanvasProps> = ({
    drillConfig,
    pageConfig,
    generatedDrills,
    studentName,
}) => {
    const { pages, totalPages } = useDrillPagination(generatedDrills, drillConfig, pageConfig.margin);

    return (
        <>
            {pages.map((pageItems, pageIdx) => (
                <PageShell
                    key={pageIdx}
                    pageConfig={pageConfig}
                    pageIndex={pageIdx}
                    totalPages={totalPages}
                    studentName={studentName}
                >
                    <div
                        className="grid w-full"
                        style={{
                            gridTemplateColumns: `repeat(${drillConfig.cols}, 1fr)`,
                            gap: `${drillConfig.gap}px`,
                        }}
                    >
                        {pageItems.map((op) => (
                            <div key={op.id} className="flex justify-center items-start">
                                {drillConfig.orientation === 'vertical'
                                    ? <OperationCardVertical op={op} fontSize={drillConfig.fontSize} showText={drillConfig.showTextRepresentation} />
                                    : <OperationCardHorizontal op={op} fontSize={drillConfig.fontSize} showText={drillConfig.showTextRepresentation} />
                                }
                            </div>
                        ))}
                    </div>
                </PageShell>
            ))}
        </>
    );
};
