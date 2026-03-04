
import React from 'react';
import { ClockReadingData } from '../../../types';
import { PedagogicalHeader, AnalogClock } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const ClockReadingSheet: React.FC<{ data: ClockReadingData }> = ({ data }) => (
    <div className="flex flex-col h-full font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mt-8 flex-1 content-start">
            {(data.clocks || []).map((clock, i) => (
                <div key={i} className="flex flex-col items-center gap-6 p-6 border-2 border-zinc-100 rounded-[2.5rem] bg-white hover:shadow-xl transition-all break-inside-avoid group">
                    <div className="relative group-hover:scale-110 transition-transform duration-500">
                         <AnalogClock 
                            hour={clock.hour} 
                            minute={clock.minute} 
                            showNumbers={data.settings?.showNumbers} 
                            showTicks={data.settings?.showTicks} 
                            showHands={data.settings?.showHands} 
                            className="w-40 h-40 drop-shadow-lg" 
                        />
                         <div className="absolute -top-3 -left-3 w-8 h-8 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-black text-xs border-2 border-white shadow-lg">{i+1}</div>
                    </div>
                    <div className="w-full space-y-3">
                        {clock.problemText && <p className="text-xs font-bold text-zinc-500 text-center leading-tight italic px-2"><EditableText value={clock.problemText} tag="span" /></p>}
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-14 h-10 border-2 border-zinc-800 rounded-lg bg-zinc-50 flex items-center justify-center text-xl font-mono font-black shadow-inner">
                                <EditableText value="" tag="span" placeholder="00" />
                            </div>
                            <span className="font-black text-xl">:</span>
                            <div className="w-14 h-10 border-2 border-zinc-800 rounded-lg bg-zinc-50 flex items-center justify-center text-xl font-mono font-black shadow-inner">
                                <EditableText value="" tag="span" placeholder="00" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
