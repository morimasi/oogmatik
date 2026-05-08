import React from 'react';
import { StyleSettings } from '../../types';
import { DropdownPanel, NumberControl, Toggle } from './ToolbarShared';

interface ClinicalFocusModuleProps {
  settings: StyleSettings;
  updateSetting: (key: keyof StyleSettings, value: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

const RULER_COLORS = [
  { color: '#6366f1', label: 'İndigo' },
  { color: '#10b981', label: 'Zümrüt' },
  { color: '#f59e0b', label: 'Kehribar' },
  { color: '#ef4444', label: 'Kırmızı' },
  { color: '#000000', label: 'Siyah' },
];

export const ClinicalFocusModule: React.FC<ClinicalFocusModuleProps> = ({
  settings,
  updateSetting,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <DropdownPanel
      title="KLİNİK ODAK ARAÇLARI"
      icon="fa-eye"
      onClose={onClose}
      className="w-72 md:w-80"
    >
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl p-4 border border-amber-500/10 shadow-sm">
           <Toggle
            label="Odak Modu (Takip Cetveli)"
            icon="fa-highlighter"
            checked={settings.focusMode}
            onChange={(v: boolean) => updateSetting('focusMode', v)}
          />
          <p className="text-[9px] text-[var(--text-muted)] mt-2 font-medium leading-relaxed italic">
            * Takip cetveli, disleksi ve dikkat dağınıklığı olan öğrencilerin satır takibini kolaylaştırır.
          </p>
        </div>

        {settings.focusMode && (
          <div className="space-y-5 pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="space-y-2">
                 <NumberControl
                    label="Cetvel Yüksekliği"
                    icon="fa-arrows-up-down"
                    value={settings.rulerHeight || 80}
                    onChange={(v: number) => updateSetting('rulerHeight', v)}
                    min={40}
                    max={300}
                    unit="px"
                />
                <NumberControl
                    label="Maske Opaklığı"
                    icon="fa-circle-half-stroke"
                    value={settings.maskOpacity || 0.4}
                    onChange={(v: number) => updateSetting('maskOpacity', v)}
                    min={0.1}
                    max={0.9}
                    step={0.1}
                />
            </div>
            
            <div className="bg-[var(--bg-paper)] p-3 rounded-2xl border border-[var(--border-color)]">
              <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest block mb-3 flex items-center gap-2">
                <i className="fa-solid fa-palette"></i> Cetvel Rengi
              </label>
              <div className="flex gap-3 justify-center">
                {RULER_COLORS.map((c) => (
                  <button
                    key={c.color}
                    title={c.label}
                    onClick={() => updateSetting('rulerColor', c.color)}
                    className={`w-7 h-7 rounded-full border-2 transition-all duration-300 ${
                      settings.rulerColor === c.color 
                        ? 'border-[var(--text-primary)] scale-125 shadow-lg' 
                        : 'border-transparent hover:scale-110 shadow-sm'
                    }`}
                    style={{ backgroundColor: c.color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DropdownPanel>
  );
};
