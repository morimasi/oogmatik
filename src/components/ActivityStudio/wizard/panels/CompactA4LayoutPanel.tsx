import React, { useEffect, useMemo, useState } from 'react';
import { getMinFontPT } from '@/services/compactA4LayoutService';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';
import type {
  AgeGroup,
  CompactA4Config,
  LearningDisabilityProfile,
} from '@/types/activityStudio';

interface CompactA4LayoutPanelProps {
  ageGroup?: AgeGroup;
  profile?: LearningDisabilityProfile;
}

const LINE_HEIGHT_OPTIONS: Array<CompactA4Config['lineHeight']> = [1.6, 1.8, 2.0];
const MARGIN_OPTIONS: Array<CompactA4Config['marginMM']> = [10, 12, 15, 20];

function clampLineHeight(value: number): CompactA4Config['lineHeight'] {
  if (value <= 1.7) return 1.6;
  if (value <= 1.9) return 1.8;
  return 2.0;
}

function clampMargin(value: number): CompactA4Config['marginMM'] {
  return MARGIN_OPTIONS.reduce((closest, current) => {
    const currentDiff = Math.abs(current - value);
    const closestDiff = Math.abs(closest - value);
    return currentDiff < closestDiff ? current : closest;
  }, MARGIN_OPTIONS[0]);
}

function clampFont(
  value: number,
  minFont: number
): CompactA4Config['fontSize'] {
  const clamped = Math.max(value, minFont, 11);
  if (clamped >= 14) return 14;
  if (clamped >= 13) return 13;
  if (clamped >= 12) return 12;
  return 11;
}

export const CompactA4LayoutPanel: React.FC<CompactA4LayoutPanelProps> = ({
  ageGroup = '8-10',
  profile = 'dyslexia',
}) => {
  const setCompactA4Config = useActivityStudioStore((state) => state.setCompactA4Config);
  const existingConfig = useActivityStudioStore((state) => state.compactA4Config);
  const minFont = useMemo(() => getMinFontPT(ageGroup, profile), [ageGroup, profile]);

  const [config, setConfig] = useState<CompactA4Config>(() => {
    const initialFont = clampFont(existingConfig?.fontSize ?? 12, minFont);
    return {
      densityLevel: existingConfig?.densityLevel ?? 2,
      fontSize: initialFont,
      lineHeight: existingConfig?.lineHeight ?? 1.8,
      marginMM: existingConfig?.marginMM ?? 15,
      effectiveMinFontPT: minFont,
    };
  });

  useEffect(() => {
    setConfig((prev) => {
      const updated: CompactA4Config = {
        ...prev,
        fontSize: clampFont(prev.fontSize, minFont),
        effectiveMinFontPT: minFont,
      };
      setCompactA4Config(updated);
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minFont]);

  const setAndPersist = (updated: CompactA4Config) => {
    setConfig(updated);
    setCompactA4Config(updated);
  };

  const handleDensityChange = (value: number) => {
    const nextDensity = Math.max(0, Math.min(5, value)) as CompactA4Config['densityLevel'];
    setAndPersist({ ...config, densityLevel: nextDensity, effectiveMinFontPT: minFont });
  };

  const handleFontChange = (value: number) => {
    const nextFont = clampFont(value, minFont);
    setAndPersist({ ...config, fontSize: nextFont, effectiveMinFontPT: minFont });
  };

  const handleLineHeightChange = (value: number) => {
    const nextLineHeight = clampLineHeight(value);
    setAndPersist({ ...config, lineHeight: nextLineHeight, effectiveMinFontPT: minFont });
  };

  const handleMarginChange = (value: number) => {
    const nextMargin = clampMargin(value);
    setAndPersist({ ...config, marginMM: nextMargin, effectiveMinFontPT: minFont });
  };

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-2xl shadow-black/40 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-1.5 w-1.5 rounded-full bg-amber-400"></div>
        <h4 className="text-base font-black font-['Lexend'] text-amber-400 uppercase tracking-tight">Kompakt A4 Düzeni</h4>
      </div>

      <div>
        <label htmlFor="compact-density" className="mb-3 block text-sm font-bold font-['Lexend'] text-zinc-300">
          Yoğunluk Seviyesi: <span className="text-amber-500">{config.densityLevel}</span>
        </label>
        <input
          id="compact-density"
          aria-label="Density Level"
          type="range"
          min={0}
          max={5}
          step={1}
          value={config.densityLevel}
          onChange={(e) => handleDensityChange(Number(e.target.value))}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
      </div>

      <div>
        <label htmlFor="compact-font" className="mb-3 block text-sm font-bold font-['Lexend'] text-zinc-300">
          Yazı Boyutu: <span className="text-amber-500">{config.fontSize}pt</span>
        </label>
        <input
          id="compact-font"
          aria-label="Font Size"
          type="range"
          min={11}
          max={14}
          step={1}
          value={config.fontSize}
          onChange={(e) => handleFontChange(Number(e.target.value))}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <p className="mt-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          {ageGroup} yaş için min {minFont}pt önerilir ({profile})
        </p>
      </div>

      <div>
        <label htmlFor="compact-line-height" className="mb-3 block text-sm font-bold font-['Lexend'] text-zinc-300">
          Satır Aralığı: <span className="text-amber-500">{config.lineHeight}</span>
        </label>
        <input
          id="compact-line-height"
          aria-label="Line Height"
          type="range"
          min={LINE_HEIGHT_OPTIONS[0]}
          max={LINE_HEIGHT_OPTIONS[LINE_HEIGHT_OPTIONS.length - 1]}
          step={0.2}
          value={config.lineHeight}
          onChange={(e) => handleLineHeightChange(Number(e.target.value))}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
      </div>

      <div>
        <label htmlFor="compact-margins" className="mb-3 block text-sm font-bold font-['Lexend'] text-zinc-300">
          Kenar Boşlukları: <span className="text-amber-500">{config.marginMM}mm</span>
        </label>
        <input
          id="compact-margins"
          aria-label="Margins"
          type="range"
          min={10}
          max={20}
          step={1}
          value={config.marginMM}
          onChange={(e) => handleMarginChange(Number(e.target.value))}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
      </div>

      <div
        className="rounded-2xl border border-zinc-700 bg-zinc-800/30 p-5 text-sm text-zinc-200 shadow-inner"
        style={{ fontSize: `${config.fontSize}pt`, lineHeight: config.lineHeight }}
      >
        Oogmatik etkinlik sayfaları özel öğrenme güçlüğü olan çocuklar için okunabilirlik odaklı tasarlandı.
      </div>
    </div>
  );
};
