import React from 'react';
import { ClockReadingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

const ClockSvg = ({
  hour,
  minute,
  showNumbers = true,
  showTicks = true,
  showHands = true,
  blank = false,
  size = 80,
}: {
  hour: number;
  minute: number;
  showNumbers?: boolean;
  showTicks?: boolean;
  showHands?: boolean;
  blank?: boolean;
  size?: number;
}) => {
  const cx = 50, cy = 50, r = 46;
  const ticks = !showTicks ? null : Array.from({ length: 60 }).map((_, i) => {
    const isHour = i % 5 === 0;
    const a = (i * Math.PI) / 30;
    return (
      <line
        key={i}
        x1={cx + (isHour ? 42 : 45) * Math.sin(a)}
        y1={cy - (isHour ? 42 : 45) * Math.cos(a)}
        x2={cx + 48 * Math.sin(a)}
        y2={cy - 48 * Math.cos(a)}
        stroke="#1a1a2e"
        strokeWidth={isHour ? 2 : 0.8}
        strokeLinecap="round"
      />
    );
  });

  const numbers = !showNumbers ? null : Array.from({ length: 12 }).map((_, i) => {
    const num = i + 1;
    const a = (num * Math.PI) / 6;
    return (
      <text
        key={num}
        x={cx + 36 * Math.sin(a)}
        y={cy - 36 * Math.cos(a)}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={9}
        fontWeight="800"
        fontFamily="Lexend, sans-serif"
        fill="#1a1a2e"
      >
        {num}
      </text>
    );
  });

  const hAngle = ((hour + minute / 60) * Math.PI) / 6;
  const mAngle = (minute * Math.PI) / 30;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
      <circle cx={cx} cy={cy} r={r} fill="white" stroke="#1a1a2e" strokeWidth={2.5} />
      {!blank && ticks}
      {!blank && numbers}
      {showHands && !blank && (
        <>
          <line x1={cx} y1={cy} x2={cx + 24 * Math.sin(hAngle)} y2={cy - 24 * Math.cos(hAngle)} stroke="#1a1a2e" strokeWidth={3.5} strokeLinecap="round" />
          <line x1={cx} y1={cy} x2={cx + 34 * Math.sin(mAngle)} y2={cy - 34 * Math.cos(mAngle)} stroke="#1a1a2e" strokeWidth={2} strokeLinecap="round" />
        </>
      )}
      <circle cx={cx} cy={cy} r={3} fill="#1a1a2e" />
    </svg>
  );
};

const OptionClock = ({ hour, minute, selected, onSelect, showNumbers, showTicks, size = 64 }: {
  hour: number; minute: number; selected: boolean; onSelect: () => void;
  showNumbers?: boolean; showTicks?: boolean; size?: number;
}) => (
  <button
    onClick={onSelect}
    className={`p-1 rounded-xl border-2 transition-all ${selected ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}
  >
    <ClockSvg hour={hour} minute={minute} showNumbers={showNumbers} showTicks={showTicks} size={size} />
  </button>
);

export const ClockReadingSheet = ({ data }: { data: ClockReadingData }) => {
  const variant = data.variant || 'analog-to-digital';
  const subVariant = data.subVariant || 'standard';
  const settings = data.settings || {};
  const clocks = data.clocks || [];
  const clockCount = clocks.length;
  const cols = clockCount > 12 ? 4 : clockCount > 8 ? 3 : 2;

  const showNumbers = settings.showNumbers !== false;
  const showTicks = settings.showTicks !== false;

  const hideMinuteHand = variant === 'analog-to-digital' && subVariant === 'no-minute';
  const hideHourHand = variant === 'analog-to-digital' && subVariant === 'no-hour';
  const clockBlank = variant === 'digital-to-analog' && subVariant === 'blank';
  const clockNumbersOnly = variant === 'digital-to-analog' && subVariant === 'numbers-only';
  const isVerbalMatch = variant === 'verbal-match';

  return (
    <div className="flex flex-col bg-white font-['Lexend'] min-h-[297mm] p-4 print:p-3">
      <PedagogicalHeader title={data.title} instruction={data.instruction} data={data} />

      <div className="flex-1 grid gap-2 mt-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {clocks.map((clock, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1.5 p-2.5 print:p-2 border-2 border-zinc-800 rounded-2xl bg-white break-inside-avoid group relative"
          >
            <div className="absolute -top-2 -left-2 w-5 h-5 bg-zinc-800 text-white rounded-full flex items-center justify-center font-black text-[7px] border-2 border-white shadow-sm z-10">
              {i + 1}
            </div>

            {/* Analog-to-Digital: show clock + digital boxes */}
            {variant === 'analog-to-digital' && (
              <>
                <div className="transition-transform group-hover:scale-105 duration-500">
                  <ClockSvg
                    hour={clock.hour}
                    minute={clock.minute}
                    showNumbers={showNumbers}
                    showTicks={showTicks}
                    showHands={!hideMinuteHand && !hideHourHand}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-9 h-7 border-2 border-zinc-800 rounded-md bg-zinc-50 flex items-center justify-center text-xs font-mono font-black shadow-inner">
                    <EditableText value="" tag="span" placeholder="00" className="text-zinc-800" />
                  </div>
                  <span className="font-black text-sm text-zinc-800">:</span>
                  <div className="w-9 h-7 border-2 border-zinc-800 rounded-md bg-zinc-50 flex items-center justify-center text-xs font-mono font-black shadow-inner">
                    <EditableText value="" tag="span" placeholder="00" className="text-zinc-800" />
                  </div>
                </div>
              </>
            )}

            {/* Digital-to-Analog: show time text + blank clock */}
            {variant === 'digital-to-analog' && (
              <>
                <div className="bg-zinc-900 text-amber-400 font-mono font-black text-lg px-3 py-1 rounded-lg border-2 border-zinc-800 shadow-inner tracking-widest">
                  {clock.timeString || `${String(clock.hour).padStart(2, '0')}:${String(clock.minute).padStart(2, '0')}`}
                </div>
                <div className="transition-transform group-hover:scale-105 duration-500">
                  <ClockSvg
                    hour={clock.hour}
                    minute={clock.minute}
                    showNumbers={clockNumbersOnly ? false : showNumbers}
                    showTicks={clockBlank ? false : (clockNumbersOnly ? false : showTicks)}
                    showHands={false}
                    blank={clockBlank}
                  />
                </div>
              </>
            )}

            {/* Verbal Match: show verbal text + selectable clock options */}
            {isVerbalMatch && (
              <>
                <div className="text-[9px] font-bold text-zinc-600 text-center leading-tight bg-zinc-100 px-2 py-1 rounded-lg border border-zinc-200 w-full">
                  {clock.verbalTime || `${clock.hour}:${String(clock.minute).padStart(2, '0')}`}
                  {clock.problemText && <span className="block text-[7px] font-medium text-amber-600 mt-0.5">{clock.problemText}</span>}
                </div>
                {clock.options && clock.options.length > 0 && (
                  <div className="grid grid-cols-2 gap-1 w-full mt-1">
                    {clock.options.map((opt, oi) => {
                      const [h, m] = opt.split(':').map(Number);
                      const isCorrect = h === clock.hour && m === clock.minute;
                      return (
                        <div
                          key={oi}
                          className={`p-1 rounded-lg border-2 transition-all ${isCorrect ? 'border-emerald-500 bg-emerald-50' : 'border-zinc-200 bg-white'}`}
                        >
                          <ClockSvg hour={h || 0} minute={m || 0} showNumbers={showNumbers} showTicks={showTicks} size={52} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Evaluation Footer */}
      <div className="mt-2 pt-2 grid grid-cols-4 gap-2 px-3 pb-3 rounded-t-2xl bg-zinc-900 text-white">
        <div className="col-span-1 flex flex-col justify-center">
          <span className="text-[8px] font-black uppercase leading-tight text-zinc-400">
            ZAMANSAL<br />ALGI
          </span>
        </div>
        {[
          { label: 'SÜRE', val: '__:__', unit: 'dk' },
          { label: 'DOĞRU', val: '__', unit: '/' + clockCount },
          { label: 'PUAN', val: '___', unit: 'p' },
        ].map((item) => (
          <div key={item.label} className="bg-white/10 border border-white/10 rounded-lg p-2 flex flex-col justify-between">
            <span className="text-[7px] font-black text-zinc-500 uppercase">{item.label}</span>
            <div className="flex items-end gap-0.5">
              <span className="text-sm font-black text-white">{item.val}</span>
              <span className="text-[6px] font-bold text-zinc-500 mb-0.5">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
