// Math Studio — AI Problem Mode Canvas (Multi-page A4 render)

import React from 'react';
import { MathPageConfig, MathProblem, MathProblemConfig } from '../../../types/math';
import { PageShell } from './PageShell';
import { ProblemCard } from './ProblemCard';
import { useProblemPagination } from '../hooks/usePagination';

import { ThemeConfig } from '../constants';

interface ProblemCanvasProps {
    problemConfig: MathProblemConfig;
    pageConfig: MathPageConfig;
    themeConfig: ThemeConfig;
    generatedProblems: MathProblem[];
    instruction?: string;
    studentName?: string;
}

export const ProblemCanvas: React.FC<ProblemCanvasProps> = ({
    problemConfig,
    pageConfig,
    themeConfig,
    generatedProblems,
    instruction,
    studentName,
}) => {
    const { pages, totalPages } = useProblemPagination(generatedProblems, problemConfig.includeSolutionBox, pageConfig.margin);

    if (generatedProblems.length === 0) {
        return (
            <PageShell pageConfig={pageConfig} pageIndex={0} totalPages={1} studentName={studentName} themeConfig={themeConfig}>
                <div className="flex flex-col items-center justify-center py-20 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50">
                    <i className="fa-solid fa-robot text-4xl mb-4 text-zinc-300"></i>
                    <p className="text-sm font-bold">Sol panelden ayarları yapıp üret butonuna basın.</p>
                </div>
            </PageShell>
        );
    }

    // Calculate global index offset for each page
    let globalIndex = 0;

    return (
        <>
            {pages.map((pageItems, pageIdx) => {
                const startIndex = globalIndex;
                globalIndex += pageItems.length;
                return (
                    <PageShell
                        key={pageIdx}
                        pageConfig={pageConfig}
                        pageIndex={pageIdx}
                        totalPages={totalPages}
                        studentName={studentName}
                        themeConfig={themeConfig}
                    >
                        {pageIdx === 0 && instruction && (
                            <div className="mb-6 p-4 bg-accent/10 border-l-4 border-accent rounded-r-lg shadow-sm">
                                <p className="text-accent font-medium italic text-sm">
                                    <i className="fa-solid fa-bullhorn mr-2"></i>
                                    {instruction}
                                </p>
                            </div>
                        )}
                        <div className="flex flex-col gap-4">
                            {pageItems.map((prob, i) => (
                                <ProblemCard
                                    key={prob.id}
                                    problem={prob}
                                    showSolutionBox={problemConfig.includeSolutionBox}
                                    index={startIndex + i}
                                    themeConfig={themeConfig}
                                />
                            ))}
                        </div>
                    </PageShell>
                );
            })}
        </>
    );
};
