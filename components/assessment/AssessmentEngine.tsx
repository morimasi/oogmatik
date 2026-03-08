
import React from 'react';
import { CognitiveDomain, SubTestResult } from '../../types';
import { MatrixMemoryTest } from './tests/MatrixMemoryTest';
import { StroopInteractiveTest } from './tests/StroopInteractiveTest';
import { RapidNamingTest } from './tests/RapidNamingTest';
import { LogicTest } from './tests/LogicTest';
import { PhonologicalLoopTest } from './tests/PhonologicalLoopTest';

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
        default:
            return (
                <div className="flex flex-col items-center justify-center w-full h-full gap-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
                        <i className="fa-solid fa-triangle-exclamation text-2xl text-red-500"></i>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-red-500 mb-2">Test Modülü Bulunamadı</h3>
                        <p className="text-sm text-zinc-400">Domain: {domain}</p>
                    </div>
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
                        className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 rounded-xl text-sm font-bold transition-colors"
                    >
                        Bu Testi Atla
                    </button>
                </div>
            );
    }
};
