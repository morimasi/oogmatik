// Math Studio — AI Problem Card

import React from 'react';
import { MathProblem } from '../../../types/math';
import { EditableText } from '../../Editable';

interface ProblemCardProps {
    problem: MathProblem;
    showSolutionBox: boolean;
    index: number;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({ problem, showSolutionBox, index }) => (
    <div className="w-full mb-4 break-inside-avoid">
        <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-md">
                {index + 1}
            </div>
            <div className="flex-1">
                <p className="text-base font-medium text-zinc-900 leading-relaxed text-justify font-dyslexic border-b border-zinc-100 pb-1">
                    <EditableText value={problem.text} tag="span" />
                </p>

                {showSolutionBox && (
                    <div className="mt-2 w-full h-24 border border-zinc-300 border-dashed rounded-lg bg-zinc-50/30 relative flex items-end justify-between p-2">
                        <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest absolute top-1 left-2">Çözüm</span>
                        <div className="text-right w-full">
                            <span className="text-xs font-bold text-zinc-400 mr-2">Cevap:</span>
                            <span className="inline-block w-16 border-b-2 border-zinc-300"></span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
);
