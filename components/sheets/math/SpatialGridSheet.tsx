
import React from 'react';
import { SpatialGridData } from '../../../types';
import { PedagogicalHeader, CubeStack } from '../common';
import { EditableText } from '../../Editable';

export const SpatialGridSheet: React.FC<{ data: SpatialGridData }> = ({ data }) => (
    <div className="font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 gap-12 mt-10 justify-items-center">
            {(data.tasks || []).map((task, idx) => (
                <div key={idx} className="w-full flex flex-col items-center break-inside-avoid">
                    {task.type === 'count-cubes' && data.cubeData && (
                        <div className="p-10 bg-white border-[3px] border-zinc-900 rounded-[3rem] shadow-xl">
                            <CubeStack counts={data.cubeData} />
                            <div className="mt-10 flex items-center justify-center gap-6">
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
