// Math Studio — Operation Cards (Vertical + Horizontal)

import React from 'react';
import { MathOperation } from '../../../types/math';
import { numberToTurkish } from '../utils';

import { ThemeConfig, BORDER_STYLES, NUMBERING_STYLES, PAPER_THEMES, BorderStyle } from '../constants';

interface OperationCardProps {
  op: MathOperation;
  fontSize: number;
  showText: boolean;
  themeConfig: ThemeConfig;
  index: number;
}

const getCardStyle = (themeConfig: ThemeConfig, borderStyle: BorderStyle) => {
  const paper = PAPER_THEMES[themeConfig.paperTheme];
  const border = BORDER_STYLES[borderStyle];
  
  return {
    border: border.css !== 'none' ? `${border.css} ${paper.border}40` : 'none',
    borderRadius: border.radius || '0',
    padding: border.css !== 'none' ? '1rem' : '0.5rem',
    backgroundColor: border.css !== 'none' ? `${paper.secondary}40` : 'transparent',
    transition: 'all 0.3s ease',
  };
};

export const OperationCardVertical: React.FC<OperationCardProps> = ({
  op,
  fontSize,
  showText,
  themeConfig,
  index,
}) => {
  const paper = PAPER_THEMES[themeConfig.paperTheme];
  const numStr = NUMBERING_STYLES[themeConfig.numberingStyle].format(index + 1);

  if (op.symbol === '÷' || op.symbol === '/') {
    return (
      <div
        className="flex font-mono font-bold leading-none break-inside-avoid relative group"
        style={{ 
          fontSize: `${fontSize}px`,
          ...getCardStyle(themeConfig, themeConfig.borderStyle)
        }}
      >
        {themeConfig.numberingStyle !== 'none' && (
          <div 
            className="absolute -left-9 -top-4 flex items-center justify-center w-7 h-7 rounded-full text-[0.35em] font-sans font-black shadow-sm transition-all duration-300 group-hover:scale-110"
            style={{ 
              backgroundColor: paper.secondary, 
              color: paper.text,
              border: `1.5px solid ${paper.accent}40`,
              boxShadow: `0 3px 6px ${paper.accent}15`
            }}
          >
            {numStr}
          </div>
        )}

        <div className="flex flex-col items-end pr-3 pt-1 border-r-4 min-h-[5.5em] min-w-[3em] pb-8" style={{ borderColor: paper.border }}>
          <div style={{ color: paper.text }}>{op.num1}</div>
        </div>
        <div className="flex flex-col pl-3 pt-1 min-w-[3em]">
          <div className="text-center" style={{ color: paper.text }}>{op.num2}</div>
          <div className="w-full border-b-4 my-2" style={{ borderColor: paper.border }}></div>
          {/* Answer box (stylized) */}
          <div className="w-full h-[1.3em] border-2 border-dashed rounded-lg bg-white/50 flex items-center justify-center shadow-inner" style={{ borderColor: `${paper.accent}40` }}>
            <span className="text-transparent select-none">{op.answer}</span>
          </div>
        </div>
      </div>
    );
  }

  const isMultiplication = op.symbol === '×' || op.symbol === 'x';
  const isMultiDigitMultiplication = isMultiplication && op.num2 >= 10;

  return (
    <div
      className="flex flex-col items-end font-mono font-bold leading-none break-inside-avoid relative group"
      style={{ 
        fontSize: `${fontSize}px`,
        ...getCardStyle(themeConfig, themeConfig.borderStyle)
      }}
    >
      {themeConfig.numberingStyle !== 'none' && (
        <div 
          className="absolute -left-9 -top-4 flex items-center justify-center w-7 h-7 rounded-full text-[0.35em] font-sans font-black shadow-sm transition-all duration-300 group-hover:scale-110"
          style={{ 
            backgroundColor: paper.secondary, 
            color: paper.text,
            border: `1.5px solid ${paper.accent}40`,
            boxShadow: `0 3px 6px ${paper.accent}15`
          }}
        >
          {numStr}
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <span style={{ color: paper.text }}>{op.num1}</span>
        {showText && (
          <span className="text-[0.4em] opacity-40 font-sans font-normal" style={{ color: paper.text }}>
            ({numberToTurkish(op.num1)})
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 w-full justify-end relative">
        <span className="absolute left-0 transform -translate-x-1/2" style={{ color: paper.accent }}>
          {op.symbol === '*' ? '×' : op.symbol}
        </span>
        <span style={{ color: paper.text }}>{op.num2}</span>
        {showText && (
          <span className="text-[0.4em] opacity-40 font-sans font-normal" style={{ color: paper.text }}>
            ({numberToTurkish(op.num2)})
          </span>
        )}
      </div>

      {op.num3 !== undefined && (
        <div className="flex items-center gap-2 w-full justify-end relative">
          <span className="absolute left-0 transform -translate-x-1/2" style={{ color: paper.accent }}>
            {op.symbol2 || op.symbol}
          </span>
          <span style={{ color: paper.text }}>{op.num3}</span>
        </div>
      )}

      <div className="w-full border-b-4 mb-2 mt-1" style={{ borderColor: paper.border }}></div>

      {isMultiDigitMultiplication && (
        <div className="w-full flex flex-col items-end gap-2 mb-2">
          <div className="h-[1.1em] w-3/4 border-b-2 border-dashed" style={{ borderColor: `${paper.text}20` }}></div>
          <div className="h-[1.1em] w-full border-b-2 border-dashed" style={{ borderColor: `${paper.text}20` }}></div>
          <div className="w-full border-b-4 my-1" style={{ borderColor: paper.border }}></div>
        </div>
      )}

      <div className="w-full h-[1.3em] border-2 border-dashed rounded-lg bg-white/50 flex items-center justify-end px-2 shadow-inner" style={{ borderColor: `${paper.accent}40` }}>
        <span className="text-transparent select-none">{op.answer}</span>
      </div>
      
      {op.remainder !== undefined && <span className="text-[0.4em] opacity-30 mt-1" style={{ color: paper.text }}>Kalan: ...</span>}
      <div className={`${isMultiplication ? 'h-6' : 'h-3'} w-full`}></div>
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
  const paper = PAPER_THEMES[themeConfig.paperTheme];
  const numStr = NUMBERING_STYLES[themeConfig.numberingStyle].format(index + 1);

  return (
    <div
      className="flex flex-wrap items-center gap-3 font-mono font-bold break-inside-avoid relative group"
      style={{ 
        fontSize: `${fontSize}px`,
        ...getCardStyle(themeConfig, themeConfig.borderStyle)
      }}
    >
        {themeConfig.numberingStyle !== 'none' && (
          <div 
            className="absolute -left-8 -top-3 flex items-center justify-center w-6 h-6 rounded-full text-[0.35em] font-sans font-black shadow-sm transition-all duration-300 group-hover:scale-110"
            style={{ 
              backgroundColor: paper.secondary, 
              color: paper.text,
              border: `1px solid ${paper.accent}40`,
              boxShadow: `0 2px 4px ${paper.accent}10`
            }}
          >
            {numStr}
          </div>
        )}
      <div className="flex flex-col items-center">
        <span style={{ color: paper.text }}>{op.num1}</span>
        {showText && (
          <span className="text-[0.4em] opacity-40 font-sans font-normal whitespace-nowrap" style={{ color: paper.text }}>
            {numberToTurkish(op.num1)}
          </span>
        )}
      </div>
      <span style={{ color: paper.accent }}>{op.symbol === '*' ? '×' : op.symbol}</span>
      <div className="flex flex-col items-center">
        <span style={{ color: paper.text }}>{op.num2}</span>
        {showText && (
          <span className="text-[0.4em] opacity-40 font-sans font-normal whitespace-nowrap" style={{ color: paper.text }}>
            {numberToTurkish(op.num2)}
          </span>
        )}
      </div>

      {op.num3 !== undefined && (
        <>
          <span style={{ color: paper.accent }}>{op.symbol2 || op.symbol}</span>
          <span style={{ color: paper.text }}>{op.num3}</span>
        </>
      )}

      <span style={{ color: paper.accent }}>=</span>
      <span className="min-w-[60px] border-b-4 border-dashed h-[1.1em] inline-block shadow-inner" style={{ borderColor: `${paper.accent}40` }}></span>
      {op.remainder !== undefined && (
        <span className="text-[0.5em] ml-1 opacity-30" style={{ color: paper.text }}>(K:...)</span>
      )}
    </div>
  );
};
