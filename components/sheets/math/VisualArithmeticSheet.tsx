
import React from 'react';
import { VisualArithmeticData } from '../../../types';
import { PedagogicalHeader, TenFrame, Domino, Base10Visualizer, NumberBond } from '../common';
import { EditableText } from '../../Editable';

export const VisualArithmeticSheet: React.FC<{ data: VisualArithmeticData }> = ({ data }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 content-start flex-1">
            {(data.problems || []).map((prob, i) => {
                const visual = prob.visualType || 'objects';
                return (
                    <div key={i} className="p-8 border-[3px] border-zinc-900 rounded-[3rem] bg-white shadow-sm flex flex-col gap-6 break-inside-avoid group hover:border-indigo-50 transition-all">
                        <div className="flex items-center justify-around">
                            {visual === 'ten-frame' && <TenFrame count={prob.num1} />}
                            {visual === 'dice' && <Domino count={prob.num1} />}
                            {visual === 'blocks' && <Base10Visualizer number={prob.num1} className="scale-75" />}
                            {visual === 'number-bond' && (
                                <NumberBond 
                                    whole={prob.operator === '+' ? prob.answer : prob.num1} 
                                    part1={prob.operator === '+' ? prob.num1 : prob.num2} 
                                    part2={prob.operator === '+' ? prob.num2 : prob.answer} 
                                    isAddition={prob.operator === '+'} 
                                />
                            )}
                            {visual !== 'number-bond' && <span className="text-4xl font-black text-zinc-300">{prob.operator}</span>}
                            {visual !== 'number-bond' && (
                                <>
                                    {visual === 'ten-frame' && <TenFrame count={prob.num2} />}
                                    {visual === 'dice' && <Domino count={prob.num2} />}
                                    {visual === 'blocks' && <Base10Visualizer number={prob.num2} className="scale-75" />}
                                </>
                            )}
                        </div>
                        <div className="h-16 w-full border-2 border-zinc-200 border-dashed rounded-2xl bg-zinc-50/50 flex items-center justify-center text-zinc-200 font-black text-2xl uppercase tracking-widest italic">Çözüm Alanı</div>
                    </div>
                );
            })}
        </div>
    </div>
);
