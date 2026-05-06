
import React from 'react';
import { ClockReadingData } from '../../../types';
import { PedagogicalHeader, AnalogClock } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const ClockReadingSheet = ({ data }: { data: ClockReadingData }) => {
    const clockCount = data.clocks?.length || 12;
    const gridCols = clockCount > 12 ? 'grid-cols-4' : (clockCount >= 9 ? 'grid-cols-3' : 'grid-cols-2');
    const clockSize = clockCount > 12 ? 'w-24 h-24' : (clockCount >= 9 ? 'w-32 h-32' : 'w-40 h-40');
    
    return (
        <div className="flex flex-col h-full font-lexend p-2 bg-white">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            <div className={`grid ${gridCols} gap-4 print:gap-2 mt-4 flex-1 content-start w-full max-w-full mx-auto`}>
                {(data.clocks || []).map((clock, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 print:gap-1 p-3 print:p-1 border-[3px] border-zinc-900 rounded-[2rem] bg-white hover:shadow-lg transition-all break-inside-avoid group">
                        <div className="relative group-hover:scale-105 transition-transform duration-500">
                            <AnalogClock
                                hour={clock.hour}
                                minute={clock.minute}
                                showNumbers={data.settings?.showNumbers}
                                showTicks={data.settings?.showTicks}
                                showHands={data.settings?.showHands}
                                className={`${clockSize} drop-shadow-md`}
                            />
                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-amber-400 text-amber-900 rounded-full flex items-center justify-center font-black text-[10px] border-2 border-zinc-900 shadow-sm">{i + 1}</div>
                        </div>
                        <div className="w-full space-y-2">
                            {clock.problemText && <p className="text-[10px] font-bold text-zinc-500 text-center leading-tight italic px-1"><EditableText value={clock.problemText} tag="span" /></p>}
                            <div className="flex items-center justify-center gap-1.5">
                                <div className="w-10 h-8 border-2 border-zinc-900 rounded-lg bg-zinc-50 flex items-center justify-center text-sm font-mono font-black shadow-inner">
                                    <EditableText value="" tag="span" placeholder="00" />
                                </div>
                                <span className="font-black text-lg">:</span>
                                <div className="w-10 h-8 border-2 border-zinc-900 rounded-lg bg-zinc-50 flex items-center justify-center text-sm font-mono font-black shadow-inner">
                                    <EditableText value="" tag="span" placeholder="00" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};




