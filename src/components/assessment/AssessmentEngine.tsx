
import React from 'react';
import { CognitiveDomain, SubTestResult } from '../../types';
import { MatrixMemoryTest } from './tests/MatrixMemoryTest';
import { StroopInteractiveTest } from './tests/StroopInteractiveTest';
import { RapidNamingTest } from './tests/RapidNamingTest';
import { LogicTest } from './tests/LogicTest';
import { PhonologicalLoopTest } from './tests/PhonologicalLoopTest';
import { VisualSearchTest } from './tests/VisualSearchTest';

interface AssessmentEngineProps {
    domain: CognitiveDomain;
    onComplete: (result: SubTestResult) => void;
}

export const AssessmentEngine: React.FC<AssessmentEngineProps> = ({ domain, onComplete }) => {
    switch (domain) {
        case 'visual_spatial_memory':
            return <MatrixMemoryTest onComplete={onComplete} />;
        case 'selective_attention':
            return <StroopInteractiveTest onComplete={onComplete} />;
        case 'processing_speed':
            return <RapidNamingTest onComplete={onComplete} />;
        case 'logical_reasoning':
            return <LogicTest onComplete={onComplete} />;
        case 'phonological_loop':
            return <PhonologicalLoopTest onComplete={onComplete} />;
        case 'visual_search':
            return <VisualSearchTest onComplete={onComplete} />;
        default:
            return (
                <div className="flex flex-col items-center justify-center w-full h-full gap-8 text-center relative overflow-hidden">
                    {/* Premium Gradient Arka Plan */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-amber-900/20" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-red-400 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-400 rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2" />
                    
                    <div className="relative z-10">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 shadow-2xl shadow-red-500/30 flex items-center justify-center backdrop-blur-sm border border-white/20 animate-pulse">
                            <i className="fa-solid fa-triangle-exclamation text-3xl text-white"></i>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black text-red-600 dark:text-red-400 mb-3">Test Modülü Bulunamadı</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 font-medium bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                            Domain: <span className="font-mono text-red-500">{domain}</span>
                        </p>
                    </div>
                    <div className="relative z-10">
                        <button
                            onClick={() => onComplete({
                                testId: domain,
                                name: domain,
                                score: 0,
                                rawScore: 0,
                                totalItems: 0,
                                avgReactionTime: 0,
                                accuracy: 0,
                                status: 'skipped',
                                timestamp: Date.now()
                            })}
                            className="group px-6 py-3 bg-gradient-to-r from-zinc-200 to-zinc-300 hover:from-zinc-300 hover:to-zinc-400 dark:from-zinc-700 dark:to-zinc-600 dark:hover:from-zinc-600 dark:hover:to-zinc-500 text-zinc-700 dark:text-zinc-200 font-black rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-3"
                        >
                            <i className="fa-solid fa-forward text-lg group-hover:translate-x-1 transition-transform"></i>
                            <span>Bu Testi Atla</span>
                        </button>
                    </div>
                </div>
            );
    }
};
