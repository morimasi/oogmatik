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
    <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
            <i className={`fa-solid ${icon} text-[10px] text-accent`}></i>
        </div>
        <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">{title}</h4>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-zinc-800 to-transparent ml-2"></div>
    </div>
);

export const AdvancedPanel: React.FC<AdvancedPanelProps> = ({ themeConfig, setThemeConfig }) => (
    <div className="p-5 space-y-6 animate-in slide-in-from-left-4 border-t border-zinc-800">

        {/* Paper Theme */}
        <div>
            <SectionTitle icon="fa-palette" title="Kağıt Teması" />
            <div className="grid grid-cols-5 gap-2">
                {(Object.entries(PAPER_THEMES) as [PaperTheme, typeof PAPER_THEMES[PaperTheme]][]).map(([key, theme]) => (
                    <button
                        key={key}
                        onClick={() => setThemeConfig({ ...themeConfig, paperTheme: key })}
                        className={`flex flex-col items-center gap-1.5 p-1 rounded-2xl border-2 transition-all duration-300 ${themeConfig.paperTheme === key
                            ? 'border-accent bg-accent/10 shadow-lg scale-105'
                            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
                            }`}
                        title={theme.label}
                    >
                        <div
                            className="w-full aspect-[3/4] rounded-lg border shadow-inner relative overflow-hidden"
                            style={{ backgroundColor: theme.bg, borderColor: `${theme.border}30` }}
                        >
                             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(${theme.border} 1px, transparent 1px)`, backgroundSize: '4px 4px' }}></div>
                             <div className="absolute top-1 left-1 w-2 h-0.5 rounded-full" style={{ backgroundColor: theme.accent }}></div>
                        </div>
                        <span className="text-[7.5px] font-black text-zinc-400 uppercase tracking-tighter leading-tight text-center">{theme.label}</span>
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
                        className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl border-2 transition-all duration-300 ${themeConfig.fontTheme === key
                            ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/10'
                            : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                            }`}
                        style={{ fontFamily: theme.fontFamily }}
                    >
                        <i className={`fa-solid ${theme.icon} text-lg`}></i>
                        <span className="text-[9px] font-black uppercase tracking-widest">{theme.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Border Style */}
        <div>
            <SectionTitle icon="fa-border-none" title="Soru Kenarlığı" />
            <div className="grid grid-cols-4 gap-2">
                {(Object.entries(BORDER_STYLES) as [BorderStyle, typeof BORDER_STYLES[BorderStyle]][]).map(([key, style]) => (
                    <button
                        key={key}
                        onClick={() => setThemeConfig({ ...themeConfig, borderStyle: key })}
                        className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${themeConfig.borderStyle === key
                            ? 'border-amber-500 bg-amber-500/10 text-white'
                            : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700'
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
                        className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${themeConfig.numberingStyle === key
                            ? 'border-indigo-500 bg-indigo-500/10 text-white'
                            : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700'
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
