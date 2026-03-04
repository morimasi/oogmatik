
import React from 'react';
import { CognitiveDomain, SubTestResult } from '../../types';
import { MatrixMemoryTest } from './tests/MatrixMemoryTest';
import { StroopInteractiveTest } from './tests/StroopInteractiveTest';
import { RapidNamingTest } from './tests/RapidNamingTest';
import { LogicTest } from './tests/LogicTest';

interface AssessmentEngineProps {
    domain: CognitiveDomain;
    onComplete: (result: SubTestResult) => void;
}

export const AssessmentEngine: React.FC<AssessmentEngineProps> = ({ domain, onComplete }) => {
    
    // Switch between specific test components based on domain
    switch (domain) {
        case 'visual_spatial_memory':
            return <MatrixMemoryTest onComplete={onComplete} />;
        case 'selective_attention':
            return <StroopInteractiveTest onComplete={onComplete} />;
        case 'processing_speed':
            return <RapidNamingTest onComplete={onComplete} />;
        case 'logical_reasoning':
            return <LogicTest onComplete={onComplete} />;
        default:
            return (
                <div className="text-center">
                    <h3 className="text-xl font-bold text-red-500">Test Modülü Bulunamadı</h3>
                    <button onClick={() => onComplete({
                        testId: domain,
                        name: 'Unknown',
                        score: 0,
                        rawScore: 0,
                        totalItems: 0,
                        avgReactionTime: 0,
                        accuracy: 0,
                        status: 'skipped',
                        timestamp: Date.now()
                    })} className="mt-4 px-4 py-2 bg-zinc-200 rounded">Atla</button>
                </div>
            );
    }
};
