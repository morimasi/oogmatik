import React from 'react';
import { ReadingStroopData } from '../../../types';

const FALLBACK_COLORS = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#4f46e5'];

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length < 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

export const ReadingStroopSheet = ({ data }: { data: ReadingStroopData }) => {
  const cols = data.settings?.cols || 4;
  const fontSize = data.settings?.fontSize || 18;
  const grid = Array.isArray(data.grid) ? data.grid : [];

  return (
    <div className="flex flex-col w-full bg-white font-lexend text-black relative overflow-hidden min-h-[297mm] p-3 print:p-2">
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-zinc-300">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xs font-black text-zinc-900 leading-tight truncate">{data.title || 'Sözel Stroop Testi'}</h1>
            <p className="text-[8px] text-zinc-500 leading-tight truncate">{data.instruction || 'Kelimenin RENGİNE odaklan, anlamına değil!'}</p>
          </div>
        </div>
        <span className="text-[7px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-200 leading-none shrink-0">
          Stroop
        </span>
      </div>


      <div className="flex-1 px-1 py-2 print:py-1">
        <div
          className="w-full grid gap-x-2 gap-y-3 print:gap-x-1.5 print:gap-y-1.5 content-start"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {grid.map((item, idx) => {
            const displayColor = item.color || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
            const lightBg = isLightColor(displayColor);
            const textColor = lightBg ? '#1a1a2e' : '#ffffff';
            return (
              <div
                key={idx}
                className="flex items-center justify-center p-1.5 rounded-lg shadow border border-white/20 break-inside-avoid"
                style={{ backgroundColor: displayColor }}
              >
                <span
                  className="font-black tracking-tight uppercase text-center leading-none"
                  style={{ color: textColor, fontSize: `${fontSize}px` }}
                >
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {data.evaluationBox !== false && (
        <div className="mt-auto border-t border-zinc-800 mx-1 pt-1.5 pb-1.5 break-inside-avoid">
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: 'SÜRE', color: 'bg-zinc-50 border-zinc-300 text-zinc-500' },
              { label: 'HATA', color: 'bg-red-50 border-red-300 text-red-600' },
              { label: 'DÜZELTME', color: 'bg-amber-50 border-amber-300 text-amber-700' },
              { label: 'PUAN', color: 'bg-indigo-600 border-indigo-700 text-white' },
            ].map(({ label, color }) => (
              <div key={label} className={`p-1.5 rounded-lg border-2 ${color} shadow-sm`}>
                <h5 className="text-[6px] font-black uppercase tracking-widest mb-0.5">{label}</h5>
                <div className="h-4 border-b border-dashed opacity-40" style={{ borderColor: 'currentColor' }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

