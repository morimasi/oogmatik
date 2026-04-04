/**
 * @file src/components/InfographicStudio/Toolbar/PremiumEditToolbar.tsx
 * @description InfographicStudio v3 Ultra Premium — Premium Edit Toolbar
 *
 * Undo/Redo, Export, Layout Controls, Typography Controls
 */

import React, { useState } from 'react';
import { useInfographicLayoutStore } from '../../../store/useInfographicLayoutStore';

const FmtBtn: React.FC<{
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}> = ({ active, onClick, disabled, children, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 flex items-center justify-center gap-2 transition-all duration-300 ${
      active
        ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20 scale-105 z-10'
        : 'bg-white/80 text-slate-600 border-slate-100 hover:border-accent/30 hover:text-accent hover:bg-white hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed'
    }`}
  >
    {children}
  </button>
);

const SliderControl: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  unit?: string;
}> = ({ label, value, min, max, step = 1, onChange, unit = '' }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-zinc-400 font-bold">{label}</span>
      <span className="text-accent font-black">
        {value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-accent"
    />
  </div>
);

export const PremiumEditToolbar: React.FC = () => {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const { layoutConfig, updateLayout, undo, redo, canUndo, canRedo } = useInfographicLayoutStore();

  const togglePanel = (panel: string) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <div className="sticky top-0 z-50 bg-[var(--bg-paper)]/95 backdrop-blur-md border-b border-[var(--border-color)]">
      <div className="flex items-center gap-2 px-4 py-2 flex-wrap">
        <div className="flex items-center gap-1 border-r border-[var(--border-color)] pr-3">
          <FmtBtn onClick={undo} disabled={!canUndo()} title="Geri Al (Ctrl+Z)">
            <i className="fa-solid fa-undo text-sm"></i>
          </FmtBtn>
          <FmtBtn onClick={redo} disabled={!canRedo()} title="İleri Al (Ctrl+Y)">
            <i className="fa-solid fa-redo text-sm"></i>
          </FmtBtn>
        </div>

        <div className="flex items-center gap-1 border-r border-[var(--border-color)] pr-3">
          <FmtBtn onClick={() => window.print()} title="Yazdır">
            <i className="fa-solid fa-print text-sm"></i>
            <span>Yazdır</span>
          </FmtBtn>
          <FmtBtn onClick={() => updateLayout({})} title="PDF İndir">
            <i className="fa-solid fa-file-pdf text-sm"></i>
            <span>PDF</span>
          </FmtBtn>
        </div>

        <div className="flex items-center gap-1 border-r border-[var(--border-color)] pr-3">
          <FmtBtn
            onClick={() => togglePanel('columns')}
            active={activePanel === 'columns'}
            title="Sütunlar"
          >
            <i className="fa-solid fa-columns text-sm"></i>
          </FmtBtn>
          <FmtBtn onClick={() => togglePanel('grid')} active={activePanel === 'grid'} title="Grid">
            <i className="fa-solid fa-th text-sm"></i>
          </FmtBtn>
          <FmtBtn
            onClick={() => togglePanel('spacing')}
            active={activePanel === 'spacing'}
            title="Boşluklar"
          >
            <i className="fa-solid fa-arrows-left-right text-sm"></i>
          </FmtBtn>
          <FmtBtn
            onClick={() => togglePanel('typography')}
            active={activePanel === 'typography'}
            title="Yazı Tipi"
          >
            <i className="fa-solid fa-font text-sm"></i>
          </FmtBtn>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-zinc-500 font-bold">
            {layoutConfig.pageSize} • {layoutConfig.orientation === 'portrait' ? 'Dikey' : 'Yatay'}
          </span>
        </div>
      </div>

      {activePanel && (
        <div className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30 p-4">
          {activePanel === 'columns' && (
            <div className="max-w-md">
              <SliderControl
                label="Sütun Sayısı"
                value={layoutConfig.columnCount}
                min={1}
                max={4}
                onChange={(v) => updateLayout({ columnCount: v })}
              />
              <SliderControl
                label="Sütun Arası Boşluk"
                value={layoutConfig.gutterWidth}
                min={2}
                max={15}
                onChange={(v) => updateLayout({ gutterWidth: v })}
                unit="mm"
              />
            </div>
          )}

          {activePanel === 'grid' && (
            <div className="max-w-md space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-zinc-300">
                <input
                  type="checkbox"
                  checked={layoutConfig.gridSystem.enabled}
                  onChange={(e) =>
                    updateLayout({
                      gridSystem: { ...layoutConfig.gridSystem, enabled: e.target.checked },
                    })
                  }
                  className="accent-accent"
                />
                Grid sistemi aktif
              </label>
              {layoutConfig.gridSystem.enabled && (
                <div className="grid grid-cols-2 gap-3">
                  <SliderControl
                    label="Satır"
                    value={layoutConfig.gridSystem.rows}
                    min={2}
                    max={6}
                    onChange={(v) =>
                      updateLayout({ gridSystem: { ...layoutConfig.gridSystem, rows: v } })
                    }
                  />
                  <SliderControl
                    label="Sütun"
                    value={layoutConfig.gridSystem.cols}
                    min={2}
                    max={4}
                    onChange={(v) =>
                      updateLayout({ gridSystem: { ...layoutConfig.gridSystem, cols: v } })
                    }
                  />
                  <SliderControl
                    label="Hücre Aralığı"
                    value={layoutConfig.gridSystem.cellGap}
                    min={2}
                    max={10}
                    onChange={(v) =>
                      updateLayout({ gridSystem: { ...layoutConfig.gridSystem, cellGap: v } })
                    }
                    unit="mm"
                  />
                </div>
              )}
            </div>
          )}

          {activePanel === 'spacing' && (
            <div className="max-w-md">
              <SliderControl
                label="İçerik Yoğunluğu"
                value={layoutConfig.contentDensity}
                min={0}
                max={100}
                onChange={(v) => updateLayout({ contentDensity: v })}
                unit="%"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>Rahat (0%)</span>
                <span>Kompakt (100%)</span>
              </div>
            </div>
          )}

          {activePanel === 'typography' && (
            <div className="max-w-md grid grid-cols-2 gap-3">
              <SliderControl
                label="Temel Punto"
                value={layoutConfig.typography.baseFontSize}
                min={9}
                max={16}
                onChange={(v) =>
                  updateLayout({ typography: { ...layoutConfig.typography, baseFontSize: v } })
                }
                unit="pt"
              />
              <SliderControl
                label="Satır Aralığı"
                value={layoutConfig.typography.lineHeight}
                min={1.5}
                max={2.5}
                step={0.1}
                onChange={(v) =>
                  updateLayout({ typography: { ...layoutConfig.typography, lineHeight: v } })
                }
              />
              <SliderControl
                label="Başlık Ölçeği"
                value={layoutConfig.typography.headingScale}
                min={1.2}
                max={2.0}
                step={0.1}
                onChange={(v) =>
                  updateLayout({ typography: { ...layoutConfig.typography, headingScale: v } })
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
