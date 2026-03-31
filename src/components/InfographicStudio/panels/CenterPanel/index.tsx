import React from 'react';
import { EmptyState } from './EmptyState';
import { A4PrintableSheetV2 } from './A4PrintableSheetV2';
import { CompositeWorksheet } from '../../../../types/worksheet';

interface CenterPanelProps {
    result: CompositeWorksheet | null;
    isGenerating: boolean;
}

export const CenterPanel: React.FC<CenterPanelProps> = ({ result, isGenerating }) => {
    return (
        <div className="flex-1 h-full bg-slate-950/40 relative flex flex-col">
            {/* Gelecekteki araç çubuğu / formatlama paneli buraya gelebilir */}

            <div className="flex-1 flex items-center justify-center overflow-hidden">
                {isGenerating ? (
                    <div className="flex flex-col items-center justify-center p-8 text-white/50 space-y-4">
                        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="font-medium animate-pulse">Composite Worksheet AI ile Üretiliyor...</p>
                    </div>
                ) : result ? (
                    <A4PrintableSheetV2 worksheet={result} />
                ) : (
                    <EmptyState />
                )}
            </div>
        </div>
    );
};
