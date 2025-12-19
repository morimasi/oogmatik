
import React from 'react';
import { ActivityType, SingleWorksheetData } from '../types';
import { PedagogicalHeader, ImageDisplay, GridComponent, ConnectionDot } from './sheets/common';
import { EditableElement, EditableText } from './Editable';
import { StoryComprehensionSheet } from './sheets/ReadingComprehensionSheets';
import { AlgorithmSheet } from './sheets/AlgorithmSheets';

interface SheetRendererProps {
    activityType: ActivityType;
    data: SingleWorksheetData;
}

const StudioRenderer: React.FC<{ data: any }> = ({ data }) => {
    // ... existing studio renderer
    return <div>Studio content...</div>;
};

// --- MATH STUDIO RENDERER (SHARED) ---
const MathStudioRenderer: React.FC<{ data: any }> = ({ data }) => {
    const components = data.components || [];
    
    return (
        <div className="w-full flex flex-col gap-8">
            {components.filter((c: any) => c.isVisible).map((comp: any) => (
                <div key={comp.instanceId} style={{ minHeight: comp.style.h }}>
                    {comp.type === 'header' && (
                         <div className="flex flex-col border-b-2 border-black pb-2 text-black">
                            <h1 className="text-2xl font-black uppercase text-center">{comp.data.title}</h1>
                            <div className="flex justify-between mt-2 text-sm font-bold">
                                <span>Ad Soyad: ........................</span>
                                <span>Tarih: ........................</span>
                            </div>
                        </div>
                    )}
                    
                    {comp.type === 'operation_grid' && (
                        <div className="grid grid-cols-4 gap-y-12 gap-x-4">
                            {comp.data.ops.map((op: any, i: number) => (
                                <div key={i} className="flex flex-col items-end text-2xl font-mono relative pr-4 border-b-2 border-black pb-1 text-black">
                                    <span className="text-[10px] absolute top-0 left-0 text-zinc-300">#{i+1}</span>
                                    <div className={op.unknownPos === 'n1' ? 'border-2 border-dashed border-zinc-200 w-12 h-8 text-transparent' : ''}>{op.n1}</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{op.op}</span>
                                        <div className={op.unknownPos === 'n2' ? 'border-2 border-dashed border-zinc-200 w-12 h-8 text-transparent' : ''}>{op.n2}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {comp.type === 'problem_set' && (
                        <div className="space-y-6 text-black">
                            <h3 className="font-black border-l-4 border-indigo-600 pl-2 uppercase text-sm">Problem Çözme</h3>
                            {comp.data.problems.map((p: any, i: number) => (
                                <div key={i} className="space-y-3">
                                    <p className="text-base font-medium leading-relaxed">{i+1}. {p.text}</p>
                                    <div className="h-24 w-full border-2 border-dashed border-zinc-200 rounded-xl relative">
                                        <span className="text-[10px] text-zinc-300 uppercase font-bold absolute top-2 left-2">Çözüm Alanı</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export const SheetRenderer = React.memo(({ activityType, data }: SheetRendererProps) => {
    if (!data) return null;
    
    // Check if this is Math Studio data (Wrapped in array/object structure)
    if (activityType === ActivityType.MATH_STUDIO || (data.config && data.components)) {
        return <MathStudioRenderer data={data} />;
    }

    if (data.layout && data.storyData) {
        return <StudioRenderer data={data} />;
    }

    if (activityType === 'STORY_COMPREHENSION') {
        return <StoryComprehensionSheet data={data} />;
    }

    if (activityType === 'ALGORITHM_GENERATOR') {
        return <AlgorithmSheet data={data} />;
    }

    return <div className="p-4">İçerik Görüntüleyici: {activityType}</div>;
});
