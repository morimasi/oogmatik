import React, { useEffect, useMemo, useState } from 'react';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';
import { getContrastRatio, isAccessibleContrast } from '@/services/themeContrastService';
import type { ThemeConfig } from '@/types/activityStudio';

type ThemeColors = Omit<ThemeConfig, 'contrastChecks'>;

const DEFAULT_COLORS: ThemeColors = {
  primaryColor: '#1F2937',
  secondaryColor: '#6366F1',
  accentColor: '#EC4899',
  bgPaper: '#FFFDF7',
  textColor: '#1A1A2E',
};

export const ThemeSyncPanel: React.FC = () => {
  const themeConfig = useActivityStudioStore((state) => state.themeConfig);
  const setThemeConfig = useActivityStudioStore((state) => state.setThemeConfig);
  const [colors, setColors] = useState<ThemeColors>({
    primaryColor: themeConfig?.primaryColor ?? DEFAULT_COLORS.primaryColor,
    secondaryColor: themeConfig?.secondaryColor ?? DEFAULT_COLORS.secondaryColor,
    accentColor: themeConfig?.accentColor ?? DEFAULT_COLORS.accentColor,
    bgPaper: themeConfig?.bgPaper ?? DEFAULT_COLORS.bgPaper,
    textColor: themeConfig?.textColor ?? DEFAULT_COLORS.textColor,
  });

  const contrastChecks = useMemo(
    () => ({
      primary_bgPaper: getContrastRatio(colors.primaryColor, colors.bgPaper),
      secondary_bgPaper: getContrastRatio(colors.secondaryColor, colors.bgPaper),
      accent_bgPaper: getContrastRatio(colors.accentColor, colors.bgPaper),
      textColor_bgPaper: getContrastRatio(colors.textColor, colors.bgPaper),
    }),
    [colors]
  );

  useEffect(() => {
    setThemeConfig({
      ...colors,
      contrastChecks,
    });
  }, [colors, contrastChecks, setThemeConfig]);

  const renderContrastBadge = (ratio: number) => {
    const accessible = isAccessibleContrast(ratio, 'AAA');
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-black ${accessible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
        {ratio.toFixed(2)}:1 {accessible ? '✓ GEÇER' : '✗ YETERSİZ'}
      </span>
    );
  };

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-2xl shadow-black/40 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-1.5 w-1.5 rounded-full bg-amber-400"></div>
        <h4 className="text-base font-black font-['Lexend'] text-amber-400 uppercase tracking-tight">Tema Renkleri (WCAG AAA 7:1)</h4>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-800/30 p-3">
          <label htmlFor="primaryColor" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Birincil Renk</label>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-zinc-500">{colors.primaryColor}</span>
            <input
              id="primaryColor"
              type="color"
              value={colors.primaryColor}
              onChange={(e) => setColors((prev) => ({ ...prev, primaryColor: e.target.value }))}
              className="h-8 w-8 rounded-lg cursor-pointer bg-transparent border-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-800/30 p-3">
          <label htmlFor="secondaryColor" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">İkincil Renk</label>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-zinc-500">{colors.secondaryColor}</span>
            <input
              id="secondaryColor"
              type="color"
              value={colors.secondaryColor}
              onChange={(e) => setColors((prev) => ({ ...prev, secondaryColor: e.target.value }))}
              className="h-8 w-8 rounded-lg cursor-pointer bg-transparent border-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-800/30 p-3">
          <label htmlFor="accentColor" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Vurgu Rengi</label>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-zinc-500">{colors.accentColor}</span>
            <input
              id="accentColor"
              type="color"
              value={colors.accentColor}
              onChange={(e) => setColors((prev) => ({ ...prev, accentColor: e.target.value }))}
              className="h-8 w-8 rounded-lg cursor-pointer bg-transparent border-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-800/30 p-3">
          <label htmlFor="bgPaper" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Kağıt Rengi</label>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-zinc-500">{colors.bgPaper}</span>
            <input
              id="bgPaper"
              type="color"
              value={colors.bgPaper}
              onChange={(e) => setColors((prev) => ({ ...prev, bgPaper: e.target.value }))}
              className="h-8 w-8 rounded-lg cursor-pointer bg-transparent border-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-800/30 p-3">
          <label htmlFor="textColor" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Metin Rengi</label>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-zinc-500">{colors.textColor}</span>
            <input
              id="textColor"
              type="color"
              value={colors.textColor}
              onChange={(e) => setColors((prev) => ({ ...prev, textColor: e.target.value }))}
              className="h-8 w-8 rounded-lg cursor-pointer bg-transparent border-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-800/20 p-5 shadow-inner">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
          <h5 className="text-xs font-black uppercase tracking-widest text-zinc-500">Kontrast Analizi</h5>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[9px] font-bold text-zinc-500">WCAG AAA Standardı</span>
        </div>
        <ul className="space-y-2.5 text-xs">
          <li className="flex items-center justify-between font-medium text-zinc-300">
            <span>Ana Renk vs Kağıt</span>
            {renderContrastBadge(contrastChecks.primary_bgPaper)}
          </li>
          <li className="flex items-center justify-between font-medium text-zinc-300">
            <span>İkincil vs Kağıt</span>
            {renderContrastBadge(contrastChecks.secondary_bgPaper)}
          </li>
          <li className="flex items-center justify-between font-medium text-zinc-300">
            <span>Vurgu vs Kağıt</span>
            {renderContrastBadge(contrastChecks.accent_bgPaper)}
          </li>
          <li className="flex items-center justify-between font-bold text-amber-400">
            <span>Metin vs Kağıt</span>
            {renderContrastBadge(contrastChecks.textColor_bgPaper)}
          </li>
        </ul>
      </div>

      {colors.bgPaper.toUpperCase() === '#FFFFFF' && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
          <div className="mt-0.5 text-amber-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <p className="text-xs font-medium text-amber-500/80 leading-relaxed">
            Erişilebilirlik Önerisi: Saf beyaz (#FFFFFF) yerine göz yorgunluğunu azaltan <span className="font-bold text-amber-500">#FFFDF7</span> tonunu kullanmanızı öneririz.
          </p>
        </div>
      )}
    </div>
  );
};
