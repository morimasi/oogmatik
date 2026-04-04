// Math Studio — Operation Cards (Vertical + Horizontal)

import React from 'react';
import { MathOperation } from '../../../types/math';
import { numberToTurkish } from '../utils';

import { ThemeConfig, BORDER_STYLES, NUMBERING_STYLES } from '../constants';

interface OperationCardProps {
  op: MathOperation;
  fontSize: number;
  showText: boolean;
  themeConfig: ThemeConfig;
  index: number;
}

const getBorderClass = (style: string) => {
  if (style === 'thin') return 'border border-zinc-300 p-2';
  if (style === 'thick') return 'border-2 border-zinc-800 p-2';
  if (style === 'rounded') return 'border-2 border-zinc-400 rounded-xl p-2';
  return 'border border-transparent p-1';
};

export const OperationCardVertical: React.FC<OperationCardProps> = ({
  op,
  fontSize,
  showText,
  themeConfig,
  index,
}) => {
  const numStr = NUMBERING_STYLES[themeConfig.numberingStyle].format(index + 1);

  if (op.symbol === '÷' || op.symbol === '/') {
    return (
      <div
        className={`flex font-mono font-bold leading-none break-inside-avoid relative ${getBorderClass(themeConfig.borderStyle)}`}
        style={{ fontSize: `${fontSize}px` }}
      >
        {themeConfig.numberingStyle !== 'none' && (
          <span className="absolute -left-4 -top-2 text-[0.4em] text-zinc-400 font-sans">
            {numStr}.
          </span>
        )}

        <div className="flex flex-col items-end pr-2 pt-1 border-r-2 border-black min-h-[3.5em] min-w-[2.5em]">
          <div>{op.num1}</div>
          {/* Boş alan (çocuğun işlem adımları için) */}
        </div>
        <div className="flex flex-col pl-2 pt-1 min-w-[2.5em]">
          <div className="text-center">{op.num2}</div>
          <div className="w-full border-b-2 border-black my-1"></div>
          {/* Cevap kutusu */}
          <div className="w-full h-[1.2em] border-2 border-zinc-200 border-dashed rounded bg-white flex items-center justify-center">
            <span className="text-transparent select-none">{op.answer}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-end font-mono font-bold leading-none break-inside-avoid relative ${getBorderClass(themeConfig.borderStyle)}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      {themeConfig.numberingStyle !== 'none' && (
        <span className="absolute -left-4 -top-2 text-[0.4em] text-zinc-400 font-sans">
          {numStr}.
        </span>
      )}
      <div className="flex items-center gap-2">
        <span>{op.num1}</span>
        {showText && (
          <span className="text-[0.4em] text-zinc-400 font-sans font-normal">
            ({numberToTurkish(op.num1)})
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 w-full justify-end relative">
        <span className="absolute left-0 transform -translate-x-1/2">{op.symbol}</span>
        <span>{op.num2}</span>
        {showText && (
          <span className="text-[0.4em] text-zinc-400 font-sans font-normal">
            ({numberToTurkish(op.num2)})
          </span>
        )}
      </div>

      {op.num3 !== undefined && (
        <div className="flex items-center gap-2 w-full justify-end relative">
          <span className="absolute left-0 transform -translate-x-1/2">
            {op.symbol2 || op.symbol}
          </span>
          <span>{op.num3}</span>
        </div>
      )}

      <div className="w-full border-b-2 border-black mb-1"></div>

      <span className="text-transparent select-none h-[1.2em] w-full text-right block border-2 border-zinc-200 border-dashed rounded bg-white">
        {op.answer}
      </span>
      {op.remainder !== undefined && <span className="text-xs text-zinc-400 mt-0.5">Kal: ...</span>}
    </div>
  );
};

export const OperationCardHorizontal: React.FC<OperationCardProps> = ({
  op,
  fontSize,
  showText,
  themeConfig,
  index,
}) => {
  const numStr = NUMBERING_STYLES[themeConfig.numberingStyle].format(index + 1);

  return (
    <div
      className={`flex flex-wrap items-center gap-2 font-mono font-bold break-inside-avoid relative ${getBorderClass(themeConfig.borderStyle)}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      {themeConfig.numberingStyle !== 'none' && (
        <span className="absolute -left-3 -top-3 text-[0.4em] text-zinc-400 font-sans">
          {numStr}.
        </span>
      )}
      <div className="flex flex-col items-center">
        <span>{op.num1}</span>
        {showText && (
          <span className="text-[0.4em] text-zinc-400 font-sans font-normal whitespace-nowrap">
            {numberToTurkish(op.num1)}
          </span>
        )}
      </div>
      <span>{op.symbol}</span>
      <div className="flex flex-col items-center">
        <span>{op.num2}</span>
        {showText && (
          <span className="text-[0.4em] text-zinc-400 font-sans font-normal whitespace-nowrap">
            {numberToTurkish(op.num2)}
          </span>
        )}
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
};
