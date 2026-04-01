// Math Studio — Advanced Panel (Theme, Answer Key, Numbering)

import React from 'react';
import {
    ThemeConfig,
    PaperTheme, FontTheme, BorderStyle, NumberingStyle,
    PAPER_THEMES, FONT_THEMES, BORDER_STYLES, NUMBERING_STYLES,
} from '../constants';

interface AdvancedPanelProps {
    themeConfig: ThemeConfig;
    setThemeConfig: (config: ThemeConfig) => void;
}

const SectionTitle: React.FC<{ icon: string; title: string }> = ({ icon, title }) => (
    <h4 className="text-[10px] font-black text-accent/70 uppercase tracking-widest mb-3 flex items-center gap-2">
        <i className={`fa-solid ${icon}`}></i> {title}
    </h4>
);

export const AdvancedPanel: React.FC<AdvancedPanelProps> = ({ themeConfig, setThemeConfig }) => (
    <div className="p-5 space-y-6 animate-in slide-in-from-left-4 border-t border-zinc-800">

        {/* Paper Theme */}
        <div>
            <SectionTitle icon="fa-palette" title="Kağıt Teması" />
            <div className="grid grid-cols-5 gap-1.5">
                {(Object.entries(PAPER_THEMES) as [PaperTheme, typeof PAPER_THEMES[PaperTheme]][]).map(([key, theme]) => (
                    <button
                        key={key}
                        onClick={() => setThemeConfig({ ...themeConfig, paperTheme: key })}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${themeConfig.paperTheme === key
                            ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                            : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
                            }`}
                        title={theme.label}
                    >
                        <div
                            className="w-6 h-8 rounded border shadow-sm"
                            style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                        />
                        <span className="text-[8px] font-bold text-zinc-400 leading-tight text-center">{theme.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Font Theme */}
        <div>
            <SectionTitle icon="fa-font" title="Yazı Tipi" />
            <div className="flex gap-2">
                {(Object.entries(FONT_THEMES) as [FontTheme, typeof FONT_THEMES[FontTheme]][]).map(([key, theme]) => (
                    <button
                        key={key}
                        onClick={() => setThemeConfig({ ...themeConfig, fontTheme: key })}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-[10px] font-bold transition-all ${themeConfig.fontTheme === key
                            ? 'border-accent bg-accent/10 text-white'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                            }`}
                    >
                        <i className={`fa-solid ${theme.icon}`}></i>
                        {theme.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Border Style */}
        <div>
            <SectionTitle icon="fa-border-all" title="Soru Kenarlığı" />
            <div className="grid grid-cols-4 gap-2">
                {(Object.entries(BORDER_STYLES) as [BorderStyle, typeof BORDER_STYLES[BorderStyle]][]).map(([key, style]) => (
                    <button
                        key={key}
                        onClick={() => setThemeConfig({ ...themeConfig, borderStyle: key })}
                        className={`py-2 rounded-lg text-[10px] font-bold border-2 transition-all ${themeConfig.borderStyle === key
                            ? 'border-accent bg-accent/10 text-white'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-600'
                            }`}
                    >
                        {style.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Numbering Style */}
        <div>
            <SectionTitle icon="fa-list-ol" title="Numaralandırma" />
            <div className="grid grid-cols-4 gap-2">
                {(Object.entries(NUMBERING_STYLES) as [NumberingStyle, typeof NUMBERING_STYLES[NumberingStyle]][]).map(([key, style]) => (
                    <button
                        key={key}
                        onClick={() => setThemeConfig({ ...themeConfig, numberingStyle: key })}
                        className={`py-2 rounded-lg text-[10px] font-bold border-2 transition-all ${themeConfig.numberingStyle === key
                            ? 'border-accent bg-accent/10 text-white'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-600'
                            }`}
                    >
                        {style.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Theme Preview Mini */}
        <div className="p-3 rounded-xl border border-zinc-700 bg-zinc-900/50">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Önizleme</span>
            <div
                className="mt-2 p-3 rounded-lg border text-sm font-bold"
                style={{
                    backgroundColor: PAPER_THEMES[themeConfig.paperTheme].bg,
                    borderColor: PAPER_THEMES[themeConfig.paperTheme].border,
                    color: PAPER_THEMES[themeConfig.paperTheme].text,
                    fontFamily: FONT_THEMES[themeConfig.fontTheme].fontFamily,
                    borderWidth: themeConfig.borderStyle === 'thick' ? '3px' : themeConfig.borderStyle === 'thin' ? '1px' : '2px',
                    borderRadius: themeConfig.borderStyle === 'rounded' ? '12px' : '4px',
                }}
            >
                {NUMBERING_STYLES[themeConfig.numberingStyle].format(1)}. 24 + 18 = ___
            </div>
        </div>
    </div>
);
