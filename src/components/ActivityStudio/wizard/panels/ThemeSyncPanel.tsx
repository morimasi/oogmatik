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
      <span className={accessible ? 'text-green-600' : 'text-red-600'}>
        {ratio.toFixed(2)}:1 {accessible ? 'OK WCAG AAA' : 'Below WCAG AAA'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <h4 className="font-bold">Tema Renkleri (WCAG AAA 7:1)</h4>

      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <label htmlFor="primaryColor" className="w-40 text-sm font-semibold">Primary Color</label>
          <input
            id="primaryColor"
            aria-label="Primary Color"
            type="color"
            value={colors.primaryColor}
            onChange={(e) => setColors((prev) => ({ ...prev, primaryColor: e.target.value }))}
            className="h-10 w-10 rounded border"
          />
          <span className="text-xs text-gray-500">{colors.primaryColor}</span>
        </div>

        <div className="flex items-center gap-4">
          <label htmlFor="secondaryColor" className="w-40 text-sm font-semibold">Secondary Color</label>
          <input
            id="secondaryColor"
            aria-label="Secondary Color"
            type="color"
            value={colors.secondaryColor}
            onChange={(e) => setColors((prev) => ({ ...prev, secondaryColor: e.target.value }))}
            className="h-10 w-10 rounded border"
          />
          <span className="text-xs text-gray-500">{colors.secondaryColor}</span>
        </div>

        <div className="flex items-center gap-4">
          <label htmlFor="accentColor" className="w-40 text-sm font-semibold">Accent Color</label>
          <input
            id="accentColor"
            aria-label="Accent Color"
            type="color"
            value={colors.accentColor}
            onChange={(e) => setColors((prev) => ({ ...prev, accentColor: e.target.value }))}
            className="h-10 w-10 rounded border"
          />
          <span className="text-xs text-gray-500">{colors.accentColor}</span>
        </div>

        <div className="flex items-center gap-4">
          <label htmlFor="bgPaper" className="w-40 text-sm font-semibold">Paper Color</label>
          <input
            id="bgPaper"
            aria-label="Paper Color"
            type="color"
            value={colors.bgPaper}
            onChange={(e) => setColors((prev) => ({ ...prev, bgPaper: e.target.value }))}
            className="h-10 w-10 rounded border"
          />
          <span className="text-xs text-gray-500">{colors.bgPaper}</span>
        </div>

        <div className="flex items-center gap-4">
          <label htmlFor="textColor" className="w-40 text-sm font-semibold">Text Color</label>
          <input
            id="textColor"
            aria-label="Text Color"
            type="color"
            value={colors.textColor}
            onChange={(e) => setColors((prev) => ({ ...prev, textColor: e.target.value }))}
            className="h-10 w-10 rounded border"
          />
          <span className="text-xs text-gray-500">{colors.textColor}</span>
        </div>
      </div>

      <div className="mt-4 rounded bg-blue-50 p-4">
        <h5 className="mb-2 text-sm font-semibold">Kontrast Oranlari</h5>
        <ul className="space-y-1 text-sm">
          <li>Primary vs Paper: {renderContrastBadge(contrastChecks.primary_bgPaper)}</li>
          <li>Secondary vs Paper: {renderContrastBadge(contrastChecks.secondary_bgPaper)}</li>
          <li>Accent vs Paper: {renderContrastBadge(contrastChecks.accent_bgPaper)}</li>
          <li>Text vs Paper: {renderContrastBadge(contrastChecks.textColor_bgPaper)}</li>
        </ul>
      </div>

      {colors.bgPaper.toUpperCase() === '#FFFFFF' && (
        <div className="rounded border border-yellow-400 bg-yellow-50 p-3 text-sm">
          Uyari: #FFFFFF yerine #FFFDF7 onerilir.
        </div>
      )}
    </div>
  );
};
