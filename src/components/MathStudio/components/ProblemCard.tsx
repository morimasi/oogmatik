// Math Studio — AI Problem Card

import React from 'react';
import { MathProblem } from '../../../types/math';
import { EditableText } from '../../Editable';

import { ThemeConfig, BORDER_STYLES, NUMBERING_STYLES } from '../constants';

interface ProblemCardProps {
    problem: MathProblem;
    showSolutionBox: boolean;
    index: number;
    themeConfig: ThemeConfig;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({ problem, showSolutionBox, index, themeConfig }) => {
    // Determine border class based on themeConfig.borderStyle
    let borderClass = 'border-transparent';
    if (themeConfig.borderStyle === 'thin') borderClass = 'border-zinc-200 border';
    else if (themeConfig.borderStyle === 'thick') borderClass = 'border-zinc-800 border-2';
    else if (themeConfig.borderStyle === 'rounded') borderClass = 'border-zinc-300 border-2 rounded-xl';

    // Format number
    const numStr = NUMBERING_STYLES[themeConfig.numberingStyle].format(index + 1);

    return (
        <div className={`w-full mb-4 break-inside-avoid p-3 ${borderClass}`}>
            <div className="flex gap-3">
                {themeConfig.numberingStyle !== 'none' && (
                    <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-md">
                        {numStr}
                    </div>
                )}
                <div className="flex-1">
                    <p className="text-base font-medium text-zinc-900 leading-relaxed text-justify font-dyslexic border-b border-zinc-100 pb-1">
                        <EditableText value={problem.text} tag="span" />
                    </p>

                    {/* AI Generated Image Indicator (Simulation/Placeholder) */}
                    {problem.imagePrompt && (
                        <div className="mt-2 text-xs text-accent bg-accent/10 border border-accent/30 p-2 rounded flex items-center gap-2">
                            <i className="fa-solid fa-image"></i>
                            <span className="italic">Görsel İpucu: {problem.imagePrompt}</span>
                        </div>
                    )}

                    {/* AI Vector SVG Graphic Generator Output */}
                    {problem.svgCode && problem.svgCode.trim() !== "" && (
                        <div className="mt-4 flex justify-center w-full px-2 py-4 bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden vector-math-container">
                            <div
                                className="w-full max-w-xl mx-auto flex justify-center items-center svg-content"
                                dangerouslySetInnerHTML={{ __html: problem.svgCode }}
                            />
                        </div>
                    )}

                    {/* Options (if type needs it or provided) */}
                    {problem.options && problem.options.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-4">
                            {problem.options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full border-2 border-zinc-300 flex items-center justify-center text-[10px] font-bold text-zinc-500">{String.fromCharCode(65 + i)}</div>
                                    <span className="text-sm font-medium">{opt}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Visual Indicator for specific types */}
                    {(problem.type === 'true-false' || problem.type === 'comparison') && (!problem.options || problem.options.length === 0) && (
                        <div className="mt-3 flex gap-4 justify-end border-t border-dashed border-zinc-200 pt-2">
                            {problem.type === 'true-false' && (
                                <>
                                    <div className="px-4 py-1 border-2 border-zinc-300 rounded-lg text-sm font-bold text-zinc-400">DOĞRU</div>
                                    <div className="px-4 py-1 border-2 border-zinc-300 rounded-lg text-sm font-bold text-zinc-400">YANLIŞ</div>
                                </>
                            )}
                            {problem.type === 'comparison' && (
                                <div className="flex items-center gap-2">
                                    {['<', '=', '>'].map(sign => (
                                        <div key={sign} className="w-8 h-8 flex items-center justify-center border-2 border-zinc-300 rounded-lg font-bold text-zinc-500 text-lg">{sign}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

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
};
