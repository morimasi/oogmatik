
import React from 'react';
import { SpatialGridData } from '../../../types';
import { PedagogicalHeader, CubeStack } from '../common';
import { EditableText } from '../../Editable';

export const SpatialGridSheet = ({ data }: { data: SpatialGridData }) => {
    const rawData = data as any;
    const resolvedData = rawData?.data || rawData;
    const content = resolvedData?.content || rawData?.content || rawData;
    const title = resolvedData.title || rawData.title;
    const instruction = resolvedData.instruction || rawData.instruction;
    const tasks = resolvedData.tasks || rawData.tasks || content.tasks || [];
    const cubeData = resolvedData.cubeData || rawData.cubeData || content.cubeData;

    return (
        <div className="font-lexend p-2">
            <PedagogicalHeader title={title} instruction={instruction} data={resolvedData} />
            <div className="grid grid-cols-1 gap-12 print:gap-3 print:gap-4 print:gap-1 mt-10 print:mt-3 justify-items-center">
                {(tasks || []).map((task: any, idx: number) => (
                    <div key={idx} className="w-full flex flex-col items-center break-inside-avoid">
                        {task.type === 'count-cubes' && cubeData && (
                            <div className="p-10 print:p-3 print:p-4 print:p-1 bg-white border-[3px] border-zinc-900 rounded-[3rem] shadow-xl">
                                <CubeStack counts={cubeData} />
                                <div className="mt-10 print:mt-3 flex items-center justify-center gap-6 print:gap-2">
                                    <span className="font-black text-xl text-zinc-700">Toplam Küp:</span>
                                    <div className="w-24 h-14 border-4 border-zinc-400 rounded-2xl bg-zinc-50 text-center flex items-center justify-center text-2xl font-black italic text-zinc-200">?</div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};



