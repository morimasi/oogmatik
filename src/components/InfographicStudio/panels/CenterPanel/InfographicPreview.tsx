import React from 'react';
import { InfographicActivityResult } from '@/types/infographic';
import { NativeInfographicRenderer } from '@/components/NativeInfographicRenderer';
import { useInfographicStudio } from '../../hooks/useInfographicStudio';

interface InfographicPreviewProps {
    result: InfographicActivityResult;
}

export const InfographicPreview: React.FC<InfographicPreviewProps> = ({ result }) => {
    const { designSchool } = useInfographicStudio();

    return (
        <div className="flex-1 overflow-y-auto w-full h-full p-6">
            <div
                id="infographic-render-area"
                className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-auto min-h-[500px] overflow-hidden border border-slate-200"
            >
                <NativeInfographicRenderer
                    syntax={result.syntax}
                    height="auto"
                    className="min-h-[500px]"
                    designSchool={designSchool}
                />
            </div>

            <div className="mt-4 text-center">
                <p className="text-xs text-slate-400 font-lexend italic">
                    İnfografik Stüdyosu v3 — Native Render Engine
                </p>
            </div>
        </div>
    );
};
