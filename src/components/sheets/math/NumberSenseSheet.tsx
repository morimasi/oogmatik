
import React from 'react';
import { NumberSenseData } from '../../../types';
import { PedagogicalHeader, NumberLine, TenFrame, Base10Visualizer } from '../common';
import { EditableText } from '../../Editable';

export const NumberSenseSheet = ({ data }: { data: NumberSenseData }) => {
    const rawData = data as any;
    const resolvedData = rawData?.data || rawData;
    const content = resolvedData?.content || rawData?.content || rawData;
    const title = resolvedData.title || rawData.title;
    const instruction = resolvedData.instruction || rawData.instruction;
    const exercises = resolvedData.exercises || rawData.exercises || content.exercises || [];

    return (
        <div className="flex flex-col font-lexend p-2 bg-white">
            <PedagogicalHeader title={title} instruction={instruction} data={resolvedData} />
            <div className="space-y-12 mt-10 print:mt-3">
                {(exercises || []).map((ex: any, i: number) => (
                    <div key={i} className="p-10 print:p-3 print:p-4 print:p-1 border-[3px] border-zinc-900 rounded-[3rem] break-inside-avoid group">
                        {ex.type === 'missing' && <NumberLine start={ex.values[0]} end={ex.values[ex.values.length - 1]} step={ex.step || 1} missing={[ex.target]} />}
                        {ex.type === 'comparison' && (
                            <div className="flex items-center justify-around py-4 print:py-1">
                                {ex.visualType === 'ten-frame' ? <TenFrame count={ex.values[0]} /> : <Base10Visualizer number={ex.values[0]} className="scale-75" />}
                                <div className="w-16 h-16 rounded-2xl border-4 border-indigo-600 flex items-center justify-center text-indigo-600 font-black text-4xl shadow-xl bg-white rotate-3">?</div>
                                {ex.visualType === 'ten-frame' ? <TenFrame count={ex.values[1]} /> : <Base10Visualizer number={ex.values[1]} className="scale-75" />}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
