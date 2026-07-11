import React from 'react';
import { CoverPageSettings, WatermarkSettings } from '../../types/fascicle';
import { Student } from '../../types';


interface FascicleCoverPageProps {
  settings: CoverPageSettings;
  student: Student | null;
  fascicleTitle?: string;
  watermarkSettings?: WatermarkSettings;
}

const PASTEL_PALETTES: Record<string, {
  primary: string;
  dark: string;
  light: string;
  accent: string;
  warm: string;
  glow: string;
  text: string;
  title: string;
  gold: string;
  shimmer: string;
}> = {
  lavender: {
    primary: '#9b8df7',
    dark: '#7c6ddf',
    light: '#f0edff',
    accent: '#b8adf9',
    warm: '#e8e3f8',
    glow: 'rgba(155,141,247,0.12)',
    text: '#4a3f7a',
    title: '#2d264d',
    gold: '#c9a84c',
    shimmer: 'rgba(201,168,76,0.15)',
  },
  mint: {
    primary: '#7dcea0',
    dark: '#5aad7c',
    light: '#e6f7ee',
    accent: '#a8e0bf',
    warm: '#d4eddc',
    glow: 'rgba(125,206,160,0.12)',
    text: '#2d5a42',
    title: '#1a3d2a',
    gold: '#c9a84c',
    shimmer: 'rgba(201,168,76,0.12)',
  },
  peach: {
    primary: '#f5c4a0',
    dark: '#e8a87c',
    light: '#fef5ed',
    accent: '#f8d5b8',
    warm: '#fce8d8',
    glow: 'rgba(245,196,160,0.15)',
    text: '#7a503a',
    title: '#4d2f1a',
    gold: '#b8934a',
    shimmer: 'rgba(184,147,74,0.12)',
  },
  blush: {
    primary: '#f2a0b8',
    dark: '#e07a95',
    light: '#fef0f5',
    accent: '#f7b8c8',
    warm: '#fce4ec',
    glow: 'rgba(242,160,184,0.12)',
    text: '#7a3a4a',
    title: '#4d1a2a',
    gold: '#c9a84c',
    shimmer: 'rgba(201,168,76,0.12)',
  },
  sky: {
    primary: '#8ecae6',
    dark: '#5ba8d4',
    light: '#e8f4fa',
    accent: '#b8dced',
    warm: '#dcecf5',
    glow: 'rgba(142,202,230,0.12)',
    text: '#2a4a6a',
    title: '#1a2d4a',
    gold: '#c9a84c',
    shimmer: 'rgba(201,168,76,0.10)',
  },
  buttercup: {
    primary: '#f5d76e',
    dark: '#e8c44a',
    light: '#fef9e8',
    accent: '#f8e38e',
    warm: '#fcf0c8',
    glow: 'rgba(245,215,110,0.15)',
    text: '#6a5a2a',
    title: '#4a3a1a',
    gold: '#c9a84c',
    shimmer: 'rgba(201,168,76,0.20)',
  },
};

const THEME_CONFIGS: Record<string, {
  label: string;
  getBackground: (p: typeof PASTEL_PALETTES.lavender) => React.CSSProperties;
  getDecorations: (p: typeof PASTEL_PALETTES.lavender, customSvg?: string) => React.ReactNode;
}> = {
  clouds: {
    label: 'Rüya Gibi',
    getBackground: (p) => ({
      background: `linear-gradient(160deg, ${p.light} 0%, #ffffff 35%, ${p.warm} 65%, ${p.light} 100%)`,
    }),
    getDecorations: (p, customSvg) => (
      <>
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${p.primary}, transparent 70%)` }} />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${p.primary}, transparent 70%)` }} />
        <div className="absolute top-1/4 -left-10 w-28 h-28 rounded-full opacity-10" style={{ background: p.primary }} />
        <div className="absolute top-2/3 right-16 w-20 h-20 rounded-full opacity-10" style={{ background: p.accent }} />
        <div className="absolute top-1/3 right-1/3 w-10 h-10 rounded-full opacity-15" style={{ background: p.warm }} />
        <div className="absolute bottom-1/4 right-1/4 w-14 h-14 rounded-full opacity-10" style={{ background: p.primary }} />
        <svg className="absolute top-10 left-10 w-24 h-24 opacity-8" viewBox="0 0 24 24" fill={p.primary}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <svg className="absolute bottom-24 right-20 w-16 h-16 opacity-8" viewBox="0 0 24 24" fill={p.accent}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        {customSvg && (
          <div className="absolute inset-0 z-[1] pointer-events-none opacity-15 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: customSvg }} />
        )}
      </>
    ),
  },
  doodles: {
    label: 'Neşeli Çizgiler',
    getBackground: (p) => ({
      background: `linear-gradient(135deg, ${p.light} 0%, ${p.warm} 40%, #ffffff 70%, ${p.light} 100%)`,
    }),
    getDecorations: (p, customSvg) => (
      <>
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, transparent, ${p.primary}, ${p.accent}, ${p.warm}, ${p.primary}, transparent)`, opacity: 0.5 }} />
        <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, transparent, ${p.warm}, ${p.accent}, ${p.primary}, ${p.warm}, transparent)`, opacity: 0.5 }} />
        {[
          { t: '12%', l: '8%', s: 12, c: 0 }, { t: '18%', l: '85%', s: 8, c: 1 }, { t: '35%', l: '15%', s: 16, c: 2 },
          { t: '45%', l: '90%', s: 10, c: 3 }, { t: '55%', l: '5%', s: 14, c: 0 }, { t: '65%', l: '88%', s: 9, c: 1 },
          { t: '78%', l: '12%', s: 11, c: 2 }, { t: '85%', l: '80%', s: 7, c: 3 },
          { t: '25%', l: '50%', s: 6, c: 0 }, { t: '72%', l: '55%', s: 13, c: 1 },
        ].map((dot, i) => (
          <div key={i} className="absolute rounded-full opacity-20" style={{
            width: dot.s, height: dot.s,
            background: [p.primary, p.accent, p.warm, p.dark][dot.c % 4],
            top: dot.t, left: dot.l,
          }} />
        ))}
        <div className="absolute top-1/3 -left-8 w-24 h-24 rounded-full opacity-10" style={{ border: `8px dotted ${p.primary}` }} />
        <div className="absolute bottom-1/4 right-10 w-16 h-16 rounded-full opacity-10" style={{ border: `6px dotted ${p.accent}` }} />
        <div className="absolute top-14 right-14 text-3xl opacity-12 select-none" style={{ color: p.primary }}>✦</div>
        <div className="absolute bottom-20 left-16 text-2xl opacity-10 select-none" style={{ color: p.accent }}>✦</div>
        <div className="absolute top-1/2 left-1/2 text-xl opacity-8 select-none" style={{ color: p.warm }}>✦</div>
        <svg className="absolute top-1/4 right-10 w-12 h-12 opacity-10" viewBox="0 0 24 24" fill="none" stroke={p.primary} strokeWidth="1.5">
          <path d="M4 4 L20 20 M20 4 L4 20" />
        </svg>
        <svg className="absolute bottom-1/3 left-14 w-10 h-10 opacity-10" viewBox="0 0 24 24" fill="none" stroke={p.accent} strokeWidth="1.5">
          <path d="M4 4 L20 20 M20 4 L4 20" />
        </svg>
        {customSvg && (
          <div className="absolute inset-0 z-[1] pointer-events-none opacity-15 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: customSvg }} />
        )}
      </>
    ),
  },
  garden: {
    label: 'Doğa Bahçesi',
    getBackground: (p) => ({
      background: `linear-gradient(180deg, ${p.light} 0%, #ffffff 45%, ${p.warm} 85%, ${p.light} 100%)`,
    }),
    getDecorations: (p, customSvg) => (
      <>
        <div className="absolute -bottom-6 left-0 right-0 h-36 opacity-15" style={{
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'%3E%3Cpath d='M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z' fill='${encodeURIComponent(p.primary)}'/%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundPosition: 'bottom',
        }} />
        <div className="absolute top-0 left-0 right-0 h-28 opacity-10" style={{
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'%3E%3Cpath d='M0,60 C200,0 400,120 600,60 C800,0 1000,120 1200,60 L1200,0 L0,0 Z' fill='${encodeURIComponent(p.accent)}'/%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundPosition: 'top',
        }} />
        <svg className="absolute top-20 right-24 w-16 h-16 opacity-12" viewBox="0 0 24 24" fill={p.primary}>
          <path d="M12 2C8 2 4 6 4 10c0 4 8 12 8 12s8-8 8-12c0-4-4-8-8-8zm0 14c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" />
        </svg>
        <svg className="absolute bottom-28 left-20 w-12 h-12 opacity-10" viewBox="0 0 24 24" fill={p.accent}>
          <path d="M12 2C8 2 4 6 4 10c0 4 8 12 8 12s8-8 8-12c0-4-4-8-8-8zm0 14c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" />
        </svg>
        <svg className="absolute top-40 left-12 w-10 h-10 opacity-10" viewBox="0 0 24 24" fill={p.warm}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" stroke={p.dark} strokeWidth="1.5" fill="none" />
        </svg>
        <div className="absolute top-1/3 left-6 w-[2px] h-24 rounded-full opacity-10" style={{ background: `linear-gradient(180deg, transparent, ${p.primary}, transparent)` }} />
        <div className="absolute top-1/2 right-14 w-[2px] h-32 rounded-full opacity-10" style={{ background: `linear-gradient(180deg, transparent, ${p.accent}, transparent)` }} />
        <div className="absolute top-2/3 left-1/3 w-[2px] h-16 rounded-full opacity-8" style={{ background: `linear-gradient(180deg, transparent, ${p.warm}, transparent)` }} />
        {customSvg && (
          <div className="absolute inset-0 z-[1] pointer-events-none opacity-15 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: customSvg }} />
        )}
      </>
    ),
  },
  dots: {
    label: 'Eğlenceli Benekler',
    getBackground: (p) => ({
      background: `radial-gradient(circle at 20% 25%, ${p.light} 0%, transparent 60%), radial-gradient(circle at 80% 75%, ${p.warm} 0%, transparent 60%), radial-gradient(circle at 50% 50%, #ffffff 0%, ${p.light} 100%)`,
    }),
    getDecorations: (p, customSvg) => (
      <>
        <div className="absolute inset-0 opacity-8" style={{
          backgroundImage: `radial-gradient(circle, ${p.primary} 1.2px, transparent 1.2px)`,
          backgroundSize: '24px 24px',
        }} />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle, ${p.dark} 0.8px, transparent 0.8px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '12px 12px',
        }} />
        <div className="absolute top-1/4 -right-10 w-40 h-40 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${p.primary}, transparent 70%)` }} />
        <div className="absolute bottom-1/4 -left-10 w-32 h-32 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${p.accent}, transparent 70%)` }} />
        <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full opacity-8" style={{ border: `14px solid ${p.primary}` }} />
        <div className="absolute bottom-16 right-1/4 w-14 h-14 rounded-full opacity-10" style={{ background: p.warm }} />
        <div className="absolute top-10 left-1/4 w-8 h-8 rounded-full opacity-12" style={{ background: p.dark }} />
        <div className="absolute bottom-1/3 right-1/3 w-5 h-5 rounded-full opacity-15" style={{ background: p.accent }} />
        <div className="absolute top-2/3 left-14 w-6 h-6 rounded-full opacity-10" style={{ background: p.primary }} />
        <div className="absolute top-1/3 right-1/2 w-7 h-7 rounded-full opacity-10" style={{ background: p.warm }} />
        <div className="absolute bottom-1/2 left-1/2 w-4 h-4 rounded-full opacity-12" style={{ background: p.dark }} />
        {customSvg && (
          <div className="absolute inset-0 z-[1] pointer-events-none opacity-15 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: customSvg }} />
        )}
      </>
    ),
  },
};

export const FascicleCoverPage: React.FC<FascicleCoverPageProps> = ({ settings, student, fascicleTitle, watermarkSettings }) => {
  if (!settings.enabled) return null;

  const palette = PASTEL_PALETTES[settings.primaryColor] || PASTEL_PALETTES.lavender;
  const themeConfig = THEME_CONFIGS[settings.themeStyle] || THEME_CONFIGS.clouds;
  const bgStyle = themeConfig.getBackground(palette);

  return (
    <div
      className="print-exact worksheet-page relative flex flex-col justify-between p-0 mx-auto overflow-hidden w-[210mm] h-[297mm] box-border"
      style={{
        ...bgStyle,
        boxSizing: 'border-box',
        fontFamily: 'Lexend, sans-serif',
        position: 'relative',
      }}
    >
      {/* Premium Gold Corner Accents */}
      <div className="absolute top-0 left-0 w-24 h-24 z-[2] pointer-events-none" style={{
        background: `linear-gradient(135deg, ${palette.gold}30 0%, transparent 50%)`,
      }} />
      <div className="absolute top-0 right-0 w-24 h-24 z-[2] pointer-events-none" style={{
        background: `linear-gradient(225deg, ${palette.gold}30 0%, transparent 50%)`,
      }} />
      <div className="absolute bottom-0 left-0 w-24 h-24 z-[2] pointer-events-none" style={{
        background: `linear-gradient(45deg, ${palette.gold}30 0%, transparent 50%)`,
      }} />
      <div className="absolute bottom-0 right-0 w-24 h-24 z-[2] pointer-events-none" style={{
        background: `linear-gradient(315deg, ${palette.gold}30 0%, transparent 50%)`,
      }} />

      {/* Watermark */}
      {watermarkSettings?.enabled && (
        watermarkSettings.type === 'image' ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden p-12" style={{ opacity: watermarkSettings.opacity / 100 }}>
            <img src="/assets/logo.png" alt="" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden" style={{ transform: `rotate(${watermarkSettings.rotation}deg)` }}>
            <span style={{
              fontSize: `${watermarkSettings.fontSize}px`,
              color: watermarkSettings.color,
              opacity: watermarkSettings.opacity / 100,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              userSelect: 'none',
              fontFamily: 'Lexend, sans-serif',
            }}>
              {watermarkSettings.text}
            </span>
          </div>
        )
      )}

      {/* Theme Decorations */}
      {themeConfig.getDecorations(palette, settings.customSvgDecorations)}

      {/* Curved top accent line */}
      <div className="absolute top-0 left-0 right-0 z-[1] pointer-events-none">
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" style={{ width: '100%', height: '40px' }}>
          <path d="M0,40 C200,0 400,30 600,20 C800,10 1000,30 1200,10 L1200,0 L0,0 Z" fill={palette.primary} opacity="0.05" />
        </svg>
      </div>

      {/* Curved bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 z-[1] pointer-events-none">
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" style={{ width: '100%', height: '40px' }}>
          <path d="M0,10 C200,30 400,0 600,20 C800,30 1000,10 1200,20 L1200,40 L0,40 Z" fill={palette.primary} opacity="0.05" />
        </svg>
      </div>

      {/* Gold shimmer line - top */}
      <div className="absolute top-[3px] left-[10%] right-[10%] h-px z-[2] pointer-events-none" style={{
        background: `linear-gradient(90deg, transparent, ${palette.gold}40, transparent)`,
      }} />

      {/* Gold shimmer line - bottom */}
      <div className="absolute bottom-[3px] left-[10%] right-[10%] h-px z-[2] pointer-events-none" style={{
        background: `linear-gradient(90deg, transparent, ${palette.gold}40, transparent)`,
      }} />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full p-[10mm]">
        {/* TOP SECTION: Logo + School */}
        <div className="flex flex-col items-center pt-2">
          {/* Premium shadow ring around logo */}
          <div className="relative mb-3">
            <div className="absolute inset-0 rounded-[28px]" style={{
              background: `linear-gradient(135deg, ${palette.gold}30, transparent, ${palette.gold}20)`,
              padding: '3px',
            }}>
              <div className="w-full h-full rounded-[28px] bg-white" />
            </div>
            <div
              className="w-24 h-24 rounded-[28px] flex items-center justify-center bg-white shadow-md overflow-hidden p-3 relative"
              style={{
                border: `3px solid ${palette.primary}30`,
                boxShadow: `0 8px 24px ${palette.glow}, 0 0 0 3px ${palette.gold}15`,
              }}
            >
              <img src="/assets/logo.png" alt="Bursa Disleksi Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          {settings.schoolName && (
            <h2
              className="text-[11px] font-bold tracking-[0.28em] text-center mb-1"
              style={{ color: palette.text, opacity: 0.7 }}
            >
              {settings.schoolName}
            </h2>
          )}
          <div className="w-20 h-[3px] rounded-full mt-1" style={{
            background: `linear-gradient(90deg, transparent, ${palette.gold}50, ${palette.primary}60, ${palette.gold}50, transparent)`,
          }} />
        </div>

        {/* CENTER SECTION: Branding + Title */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          {/* Premium Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.18em] mb-8"
            style={{
              background: `linear-gradient(135deg, ${palette.light}, ${palette.warm})`,
              border: `1.5px solid ${palette.gold}40`,
              color: palette.dark,
              boxShadow: `0 2px 8px ${palette.glow}, inset 0 1px 0 ${palette.gold}20`,
            }}
          >
            <span style={{ color: palette.gold }}>✦</span>
            Premium Eğitim Materyali
            <span style={{ color: palette.gold }}>✦</span>
          </div>

          {/* Main Title */}
          <h1
            className="text-[2.8rem] leading-[1.15] font-extrabold mb-2"
            style={{
              color: palette.title,
              fontFamily: 'Lexend, sans-serif',
              letterSpacing: '-0.02em',
              textShadow: `0 2px 4px ${palette.glow}`,
            }}
          >
            {settings.title || 'Özel Eğitim Fasikülü'}
          </h1>

          {/* Premium Decorative Divider */}
          <div className="flex items-center gap-4 my-4">
            <div className="w-12 h-px" style={{ background: `linear-gradient(90deg, transparent, ${palette.gold}50)` }} />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: palette.gold, opacity: 0.6 }} />
              <div className="w-2 h-2 rounded-full" style={{ background: palette.primary, opacity: 0.4 }} />
              <div className="w-2 h-2 rounded-full" style={{ background: palette.gold, opacity: 0.6 }} />
            </div>
            <div className="w-12 h-px" style={{ background: `linear-gradient(90deg, ${palette.gold}50, transparent)` }} />
          </div>

          {/* Subtitle */}
          {settings.subtitle && (
            <h3
              className="text-xs font-semibold tracking-[0.2em] uppercase mb-5 px-5 py-2 rounded-lg"
              style={{
                color: palette.text,
                opacity: 0.7,
                background: `${palette.warm}90`,
                letterSpacing: '0.15em',
                border: `1px solid ${palette.primary}15`,
              }}
            >
              {settings.subtitle}
            </h3>
          )}

          {/* BDMIND Brand */}
          <div className="mt-2 mb-4">
            <span
              className="text-[2.4rem] font-black tracking-[-0.04em] inline-block"
              style={{
                color: palette.dark,
                fontFamily: 'Lexend, sans-serif',
                opacity: 0.9,
                textShadow: `0 1px 3px ${palette.glow}`,
              }}
            >
              BDMIND
            </span>
            <div className="text-[8px] font-bold tracking-[0.45em] mt-1" style={{ color: palette.text, opacity: 0.4 }}>
              EDU-TECH PLATFORM
            </div>
          </div>

          {/* Fascicle Title Badge */}
          {fascicleTitle && fascicleTitle !== 'İsimsiz Fasikül' && (
            <div
              className="mt-4 px-8 py-2.5 rounded-xl text-sm font-bold shadow-sm"
              style={{
                background: '#ffffffd0',
                border: `1.5px solid ${palette.gold}30`,
                color: palette.text,
                backdropFilter: 'blur(8px)',
                boxShadow: `0 4px 16px ${palette.glow}, 0 0 0 1px ${palette.gold}15`,
              }}
            >
              {fascicleTitle}
            </div>
          )}
        </div>

        {/* BOTTOM SECTION: Student Info + Date */}
        <div
          className="rounded-2xl p-5 border shadow-sm"
          style={{
            background: '#ffffffb0',
            borderColor: `${palette.primary}20`,
            backdropFilter: 'blur(12px)',
            boxShadow: `0 4px 20px ${palette.glow}, 0 0 0 1px ${palette.gold}10`,
          }}
        >
          <div className="flex justify-between items-end gap-4">
            {settings.showStudentLine && (
              <div className="flex-1 min-w-0">
                <div className="mb-4">
                  <span className="block text-[10px] font-bold tracking-[0.22em] uppercase mb-1" style={{ color: palette.text, opacity: 0.5 }}>
                    Öğrenci Adı Soyadı
                  </span>
                  <div
                    className="text-xl font-bold pb-1.5 min-h-[32px]"
                    style={{
                      color: palette.title,
                      borderBottom: `2.5px dashed ${palette.primary}50`,
                      fontFamily: 'Lexend, sans-serif',
                    }}
                  >
                    {student ? student.name : '________________________'}
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] font-bold tracking-[0.22em] uppercase mb-1" style={{ color: palette.text, opacity: 0.5 }}>
                    Sınıfı / Grubu
                  </span>
                  <div
                    className="text-base font-bold pb-1.5 min-h-[28px]"
                    style={{
                      color: palette.text,
                      borderBottom: `2.5px dashed ${palette.primary}50`,
                      fontFamily: 'Lexend, sans-serif',
                    }}
                  >
                    {student?.grade ? `${student.grade}. Sınıf` : '________________'}
                  </div>
                </div>
              </div>
            )}

            <div className="text-right flex flex-col items-end shrink-0">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
                style={{
                  background: '#ffffff',
                  border: `2px solid ${palette.gold}30`,
                  boxShadow: `0 4px 12px ${palette.glow}`,
                }}
              >
                <i className="fa-solid fa-qrcode text-2xl" style={{ color: palette.dark, opacity: 0.7 }} />
              </div>
              <div className="text-[8px] font-bold tracking-[0.18em]" style={{ color: palette.text, opacity: 0.4 }}>
                Düzenlenme Tarihi
              </div>
              <div
                className="text-sm font-bold mt-0.5"
                style={{
                  color: palette.text,
                  fontFamily: 'Lexend, sans-serif',
                }}
              >
                {settings.date || new Date().toLocaleDateString('tr-TR')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
