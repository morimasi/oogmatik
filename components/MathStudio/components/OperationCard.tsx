// Math Studio — Operation Cards (Vertical + Horizontal)

import React from 'react';
import { MathOperation } from '../../../types/math';
import { numberToTurkish } from '../utils';

interface OperationCardProps {
    op: MathOperation;
    fontSize: number;
    showText: boolean;
}

export const OperationCardVertical: React.FC<OperationCardProps> = ({ op, fontSize, showText }) => (
    <div className="flex flex-col items-end font-mono font-bold leading-none break-inside-avoid p-1" style={{ fontSize: `${fontSize}px` }}>
        <div className="flex items-center gap-2">
            <span>{op.num1}</span>
            {showText && <span className="text-[0.4em] text-zinc-400 font-sans font-normal">({numberToTurkish(op.num1)})</span>}
        </div>

        <div className="flex items-center gap-2 w-full justify-end relative">
            <span className="absolute left-0 transform -translate-x-1/2">{op.symbol}</span>
            <span>{op.num2}</span>
            {showText && <span className="text-[0.4em] text-zinc-400 font-sans font-normal">({numberToTurkish(op.num2)})</span>}
        </div>

        {op.num3 !== undefined && (
            <div className="flex items-center gap-2 w-full justify-end relative">
                <span className="absolute left-0 transform -translate-x-1/2">{op.symbol2 || op.symbol}</span>
                <span>{op.num3}</span>
            </div>
        )}

        <div className="w-full border-b-2 border-black mb-1"></div>

        <span className="text-transparent select-none h-[1.2em] w-full text-right block border-2 border-zinc-200 border-dashed rounded text-zinc-300/50 bg-white">
            {op.answer}
        </span>
        {op.remainder !== undefined && (
            <span className="text-xs text-zinc-400 mt-0.5">Kal: ...</span>
        )}
    </div>
);

export const OperationCardHorizontal: React.FC<OperationCardProps> = ({ op, fontSize, showText }) => (
    <div className="flex flex-wrap items-center gap-2 font-mono font-bold break-inside-avoid p-1 border border-transparent" style={{ fontSize: `${fontSize}px` }}>
        <div className="flex flex-col items-center">
            <span>{op.num1}</span>
            {showText && <span className="text-[0.4em] text-zinc-400 font-sans font-normal whitespace-nowrap">{numberToTurkish(op.num1)}</span>}
        </div>
        <span>{op.symbol}</span>
        <div className="flex flex-col items-center">
            <span>{op.num2}</span>
            {showText && <span className="text-[0.4em] text-zinc-400 font-sans font-normal whitespace-nowrap">{numberToTurkish(op.num2)}</span>}
        </div>

        {op.num3 !== undefined && (
            <>
                <span>{op.symbol2 || op.symbol}</span>
                <span>{op.num3}</span>
            </>
        )}

        <span>=</span>
        <span className="min-w-[50px] border-b-2 border-black border-dashed h-[1em] inline-block"></span>
        {op.remainder !== undefined && (
            <span className="text-[0.5em] ml-1 text-zinc-400">(K:...)</span>
        )}
    </div>
);
