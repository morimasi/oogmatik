import React from 'react';
import { StyleSettings } from '../../types';
import { DropdownPanel, NumberControl } from './ToolbarShared';

interface TypographyModuleProps {
  settings: StyleSettings;
  updateSetting: (key: keyof StyleSettings, value: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

const PREMIUM_FONTS = [
  { name: 'Lexend', description: 'Disleksi Dostu (Standart)', style: { fontFamily: 'Lexend' } },
  { name: 'OpenDyslexic', description: 'Özel Disleksi Formu', style: { fontFamily: 'OpenDyslexic' } },
  { name: 'Inter', description: 'Modern & Net', style: { fontFamily: 'Inter' } },
  { name: 'Comic Neue', description: 'Kolay Okuma', style: { fontFamily: 'Comic Neue' } },
  { name: 'Roboto', description: 'Akademik', style: { fontFamily: 'Roboto' } },
  { name: 'Sersand', description: 'Hümanist Karakter', style: { fontFamily: 'Sersand' } },
];

export const TypographyModule: React.FC<TypographyModuleProps> = ({
  settings,
  updateSetting,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <DropdownPanel
      title="YAZI EDİTÖRÜ"
      icon="fa-font"
      onClose={onClose}
      className="w-80 md:w-96"
    >
      {/* Temel Punto Ayarları */}
      <div className="grid grid-cols-1 gap-1 mb-4">
        <NumberControl
          label="Yazı Boyutu (Punto)"
          icon="fa-text-height"
          value={settings.fontSize}
          onChange={(v: number) => updateSetting('fontSize', v)}
          min={10}
          max={64}
          unit="px"
        />
        <NumberControl
          label="Satır Aralığı"
          icon="fa-arrows-left-right-to-line"
          value={settings.lineHeight}
          onChange={(v: number) => updateSetting('lineHeight', v)}
          min={0.8}
          max={4}
          step={0.1}
          unit="x"
        />
      </div>

      {/* Gelişmiş Boşluk Ayarları */}
      <div className="bg-[var(--surface-glass)]/30 rounded-xl p-3 border border-[var(--border-color)] mb-4 space-y-1">
        <h5 className="text-[9px] font-black text-[var(--text-muted)] uppercase mb-2 tracking-[0.1em]">Gelişmiş Boşluklar</h5>
        <NumberControl
          label="Harf Boşluğu"
          icon="fa-arrows-left-right"
          value={settings.letterSpacing || 0}
          onChange={(v: number) => updateSetting('letterSpacing', v)}
          min={-2}
          max={15}
          step={0.5}
          unit="px"
        />
        <NumberControl
          label="Kelime Boşluğu"
          icon="fa-ellipsis-h"
          value={settings.wordSpacing || 0}
          onChange={(v: number) => updateSetting('wordSpacing', v)}
          min={0}
          max={30}
          unit="px"
        />
        <NumberControl
          label="Paragraf Arası"
          icon="fa-paragraph"
          value={settings.paragraphSpacing || 20}
          onChange={(v: number) => updateSetting('paragraphSpacing', v)}
          min={0}
          max={80}
          unit="px"
        />
      </div>

      {/* Yazı Tipi Seçiçi (WYSIWYG) */}
      <div className="pt-2">
        <label className="text-[10px] font-black uppercase mb-3 block text-[var(--text-muted)] tracking-widest flex items-center gap-2">
          <i className="fa-solid fa-list-ul"></i> Yazı Tipi Kütüphanesi
        </label>
        <div className="grid grid-cols-1 gap-2">
          {PREMIUM_FONTS.map((font) => (
            <button
              key={font.name}
              onClick={() => updateSetting('fontFamily', font.name)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-300 group ${
                settings.fontFamily === font.name
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20 scale-[1.02]'
                  : 'bg-[var(--bg-paper)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-indigo-400/50 hover:bg-white'
              }`}
            >
              <div className="flex flex-col items-start">
                <span className="text-sm font-bold" style={font.style}>
                  {font.name}
                </span>
                <span className={`text-[9px] font-medium ${settings.fontFamily === font.name ? 'text-indigo-100' : 'text-[var(--text-muted)]'}`}>
                  {font.description}
                </span>
              </div>
              <div className={`text-xl opacity-80 ${settings.fontFamily === font.name ? 'text-white' : 'text-[var(--text-muted)]/30 group-hover:text-indigo-400'}`} style={font.style}>
                Aa
              </div>
            </button>
          ))}
        </div>
      </div>
    </DropdownPanel>
  );
};
