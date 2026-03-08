// Math Studio — Answer Key Page

import React from 'react';
import { MathOperation, MathProblem, MathPageConfig } from '../../../types/math';
import { PageShell } from './PageShell';

import { ThemeConfig } from '../constants';

interface AnswerKeyPageProps {
    pageConfig: MathPageConfig;
    themeConfig: ThemeConfig;
    drillAnswers?: MathOperation[];
    problemAnswers?: MathProblem[];
    totalContentPages: number;
}

/**
 * Renders a separate A4 page with the answer key.
 * Drill mode: compact grid of question# → answer
 * Problem mode: list of question# → answer + steps
 */
export const AnswerKeyPage: React.FC<AnswerKeyPageProps> = ({
    pageConfig,
    themeConfig,
    drillAnswers,
    problemAnswers,
    totalContentPages,
}) => {
    const pageIndex = totalContentPages; // Answer key is the last page
    const totalPages = totalContentPages + 1;

    return (
        <PageShell pageConfig={pageConfig} pageIndex={pageIndex} totalPages={totalPages} studentName="CEVAP ANAHTARI" themeConfig={themeConfig}>
            <div className="mb-4">
                <h2 className="text-lg font-black uppercase tracking-tight text-indigo-700 flex items-center gap-2">
                    <i className="fa-solid fa-key"></i> Cevap Anahtarı
                </h2>
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Bu sayfayı öğrenciden ayrı tutun.</p>
            </div>

            {drillAnswers && drillAnswers.length > 0 && (
                <div className="grid grid-cols-5 gap-1">
                    {drillAnswers.map((op, i) => (
                        <div key={op.id} className="flex items-center gap-2 text-xs p-1.5 bg-zinc-50 rounded border border-zinc-100">
                            <span className="font-black text-zinc-400 w-6">{i + 1}.</span>
                            <span className="font-bold text-indigo-700">
                                {op.answer}
                                {op.remainder !== undefined && <span className="text-zinc-400 ml-1">(K:{op.remainder})</span>}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {problemAnswers && problemAnswers.length > 0 && (
                <div className="space-y-3">
                    {problemAnswers.map((prob, i) => (
                        <div key={prob.id} className="flex gap-3 text-sm border-b border-zinc-100 pb-2">
                            <span className="font-black text-indigo-600 w-6 shrink-0">{i + 1}.</span>
                            <div className="flex-1">
                                <span className="font-bold text-zinc-800">Cevap: {prob.answer}</span>
                                {prob.operationHint && (
                                    <span className="text-xs text-zinc-400 ml-2">({prob.operationHint})</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </PageShell>
    );
};
