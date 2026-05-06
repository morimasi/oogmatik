
import React from 'react';
import { ClockReadingData } from '../../../types';
import { PedagogicalHeader, AnalogClock } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const ClockReadingSheet = ({ data }: { data: ClockReadingData }) => {
    const clockCount = data.clocks?.length || 12;
    const gridCols = clockCount > 12 ? 'grid-cols-3' : (clockCount >= 9 ? 'grid-cols-3' : 'grid-cols-2');
    const clockSize = 'w-28 h-28';
    
    return (
        <div className="flex flex-col h-full font-lexend p-2 bg-white">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            <div className={`grid ${gridCols} gap-3 print:gap-1 mt-2 flex-1 content-start w-full max-w-full mx-auto`}>
                {(data.clocks || []).map((clock, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 print:gap-1 p-2 print:p-1 border-[2px] border-zinc-900 rounded-[1.5rem] bg-white hover:shadow-md transition-all break-inside-avoid group relative">
                         <div className="absolute top-1 left-1 w-5 h-5 bg-amber-400 text-amber-900 rounded-full flex items-center justify-center font-black text-[8px] border-2 border-zinc-900 shadow-sm z-10">{i + 1}</div>
                        <div className="relative group-hover:scale-105 transition-transform duration-500">
                            <AnalogClock
                                hour={clock.hour}
                                minute={clock.minute}
                                showNumbers={data.settings?.showNumbers}
                                showTicks={data.settings?.showTicks}
                                showHands={data.settings?.showHands}
                                className={`${clockSize} drop-shadow-sm`}
                            />
                        </div>
                        <div className="w-full space-y-1">
                            {clock.problemText && <p className="text-[8px] font-bold text-zinc-500 text-center leading-tight italic px-1"><EditableText value={clock.problemText} tag="span" /></p>}
                            <div className="flex items-center justify-center gap-1">
                                <div className="w-10 h-7 border-[1.5px] border-zinc-900 rounded-md bg-zinc-50 flex items-center justify-center text-xs font-mono font-black shadow-inner">
                                    <EditableText value="" tag="span" placeholder="00" />
                                </div>
                                <span className="font-black text-sm">:</span>
                                <div className="w-10 h-7 border-[1.5px] border-zinc-900 rounded-md bg-zinc-50 flex items-center justify-center text-xs font-mono font-black shadow-inner">
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




