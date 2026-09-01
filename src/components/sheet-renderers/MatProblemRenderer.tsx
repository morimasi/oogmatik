import React from 'react';
import { MatProblemOnizleme } from '../MatProblemStudyosu/MatProblemOnizleme';
import type { MatProblemSeti, ProblemDizgiAyarlari } from '../../types/matProblem';

interface MatProblemRendererProps {
    data: unknown;
    settings?: unknown;
}

export const MatProblemRenderer: React.FC<MatProblemRendererProps> = ({ data }) => {
    const activeData = Array.isArray(data) ? data[0] : data;
    const problemSetiObj: MatProblemSeti | null = activeData?.data?.[0] || activeData?.data || activeData;
    const dizgiAyarlari: ProblemDizgiAyarlari = problemSetiObj?.dizgiAyarlari || activeData?.dizgiAyarlari || {
        fontAilesi: 'Lexend',
        fontBoyutu: '11pt',
        kenarBoslugu: 'orta',
        sutunDuzeni: 'tek',
        metinHizalama: 'left',
        satirAraligi: 'normal',
    };

    if (!problemSetiObj || !problemSetiObj.problemler || !Array.isArray(problemSetiObj.problemler)) {
        return (
            <div className="p-8 text-center text-gray-400">
                Matematik Problem verisi yüklenemedi.
            </div>
        );
    }

    return (
        <div className="mat-problem-workbook-wrapper w-full bg-white flex justify-center">
            <MatProblemOnizleme
                problemSeti={problemSetiObj}
                dizgiAyarlari={dizgiAyarlari}
                isPrinting={true}
            />
        </div>
    );
};
