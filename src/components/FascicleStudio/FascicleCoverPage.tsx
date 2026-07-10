import React from 'react';
import { CoverPageSettings, WatermarkSettings } from '../../types/fascicle';
import { Student } from '../../types';
import DyslexiaLogo from '../DyslexiaLogo';

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
  },
};

const THEME_CONFIGS: Record<string, {
  label: string;
  getBackground: (palette: typeof PASTEL_PALETTES.lavender) => React.CSSProperties;
  getDecorations: (palette: typeof PASTEL_PALETTES.lavender) => React.ReactNode;
}> = {
  clouds: {
    label: 'Rüya Gibi',
    getBackground: (p) => ({
      background: `linear-gradient(160deg, ${p.light} 0%, #ffffff 40%, ${p.warm} 70%, ${p.light} 100%)`,
    }),
    getDecorations: (p) => (
      <>
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${p.primary}, transparent)` }} />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${p.primary}, transparent)` }} />
        <div className="absolute top-1/4 -left-8 w-24 h-24 rounded-full opacity-10" style={{ background: p.primary }} />
        <div className="absolute top-2/3 right-12 w-16 h-16 rounded-full opacity-10" style={{ background: p.accent }} />
        <div className="absolute top-1/3 right-1/3 w-8 h-8 rounded-full opacity-15" style={{ background: p.warm }} />
        <div className="absolute bottom-1/4 right-1/4 w-12 h-12 rounded-full opacity-10" style={{ background: p.primary }} />
        <svg className="absolute top-12 left-12 w-20 h-20 opacity-8" viewBox="0 0 24 24" fill={p.primary}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <svg className="absolute bottom-20 right-16 w-12 h-12 opacity-8" viewBox="0 0 24 24" fill={p.primary}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </>
    ),
  },
  doodles: {
    label: 'Neşeli Çizgiler',
    getBackground: (p) => ({
      background: `linear-gradient(135deg, ${p.light} 0%, ${p.warm} 50%, #ffffff 100%)`,
    }),
    getDecorations: (p) => (
      <>
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="absolute rounded-full opacity-25" style={{
            width: `${4 + Math.random() * 16}px`,
            height: `${4 + Math.random() * 16}px`,
            background: [p.primary, p.accent, p.warm, p.dark][i % 4],
            top: `${10 + Math.random() * 80}%`,
            left: `${5 + Math.random() * 90}%`,
          }} />
        ))}
        <div className="absolute top-0 left-0 right-0 h-2" style={{ background: `linear-gradient(90deg, ${p.primary}, ${p.accent}, ${p.warm}, ${p.primary})`, opacity: 0.4 }} />
        <div className="absolute bottom-0 left-0 right-0 h-2" style={{ background: `linear-gradient(90deg, ${p.warm}, ${p.accent}, ${p.primary}, ${p.warm})`, opacity: 0.4 }} />
        <div className="absolute top-1/3 -left-6 w-20 h-20 rounded-full opacity-10" style={{ border: `6px dotted ${p.primary}` }} />
        <div className="absolute bottom-1/4 right-8 w-12 h-12 rounded-full opacity-10" style={{ border: `4px dotted ${p.accent}` }} />
        <div className="absolute top-12 right-12" style={{ fontSize: '32px', opacity: 0.15, color: p.primary }}>✦</div>
        <div className="absolute bottom-16 left-16" style={{ fontSize: '24px', opacity: 0.12, color: p.accent }}>✦</div>
        <svg className="absolute top-1/4 right-8 w-10 h-10 opacity-10" viewBox="0 0 24 24" fill="none" stroke={p.primary} strokeWidth="2">
          <path d="M4 4 L20 20 M20 4 L4 20" />
        </svg>
        <svg className="absolute bottom-1/3 left-12 w-8 h-8 opacity-10" viewBox="0 0 24 24" fill="none" stroke={p.accent} strokeWidth="2">
          <path d="M4 4 L20 20 M20 4 L4 20" />
        </svg>
      </>
    ),
  },
  garden: {
    label: 'Doğa Bahçesi',
    getBackground: (p) => ({
      background: `linear-gradient(180deg, ${p.light} 0%, #ffffff 50%, ${p.warm} 100%)`,
    }),
    getDecorations: (p) => (
      <>
        <div className="absolute -bottom-8 left-0 right-0 h-32 opacity-15" style={{
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'%3E%3Cpath d='M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z' fill='${encodeURIComponent(p.primary)}'/%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundPosition: 'bottom',
        }} />
        <div className="absolute top-0 left-0 right-0 h-24 opacity-10" style={{
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'%3E%3Cpath d='M0,60 C200,0 400,120 600,60 C800,0 1000,120 1200,60 L1200,0 L0,0 Z' fill='${encodeURIComponent(p.accent)}'/%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundPosition: 'top',
        }} />
        <svg className="absolute top-16 right-20 w-14 h-14 opacity-15" viewBox="0 0 24 24" fill={p.primary}>
          <path d="M12 2C8 2 4 6 4 10c0 4 8 12 8 12s8-8 8-12c0-4-4-8-8-8zm0 14c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" />
        </svg>
        <svg className="absolute bottom-24 left-16 w-10 h-10 opacity-12" viewBox="0 0 24 24" fill={p.accent}>
          <path d="M12 2C8 2 4 6 4 10c0 4 8 12 8 12s8-8 8-12c0-4-4-8-8-8zm0 14c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" />
        </svg>
        <div className="absolute top-1/3 left-8 w-1 h-20 rounded-full opacity-10" style={{ background: `linear-gradient(180deg, transparent, ${p.primary}, transparent)` }} />
        <div className="absolute top-1/2 right-12 w-1 h-28 rounded-full opacity-10" style={{ background: `linear-gradient(180deg, transparent, ${p.accent}, transparent)` }} />
      </>
    ),
  },
  dots: {
    label: 'Eğlenceli Benekler',
    getBackground: (p) => ({
      background: `radial-gradient(circle at 20% 30%, ${p.light} 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${p.warm} 0%, transparent 50%), ${p.light}`,
    }),
    getDecorations: (p) => (
      <>
        <div className="absolute inset-0 opacity-6" style={{
          backgroundImage: `radial-gradient(circle, ${p.primary} 1.5px, transparent 1.5px)`,
          backgroundSize: '28px 28px',
        }} />
        <div className="absolute top-1/4 -right-8 w-32 h-32 rounded-full opacity-10" style={{ background: p.primary }} />
        <div className="absolute bottom-1/4 -left-8 w-24 h-24 rounded-full opacity-10" style={{ background: p.accent }} />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full opacity-8" style={{ border: `12px solid ${p.primary}` }} />
        <div className="absolute bottom-12 right-1/4 w-10 h-10 rounded-full opacity-10" style={{ background: p.warm }} />
        <div className="absolute top-8 left-1/4 w-6 h-6 rounded-full opacity-12" style={{ background: p.dark }} />
        <div className="absolute bottom-1/3 right-1/3 w-4 h-4 rounded-full opacity-15" style={{ background: p.accent }} />
        <div className="absolute top-2/3 left-12 w-5 h-5 rounded-full opacity-10" style={{ background: p.primary }} />
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
      }}
    >
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
      {themeConfig.getDecorations(palette)}

      {/* Curved top accent line */}
      <div className="absolute top-0 left-0 right-0 z-[1] pointer-events-none">
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" style={{ width: '100%', height: '40px' }}>
          <path d="M0,40 C200,0 400,30 600,20 C800,10 1000,30 1200,10 L1200,0 L0,0 Z" fill={palette.primary} opacity="0.06" />
        </svg>
      </div>

      {/* Curved bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 z-[1] pointer-events-none">
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" style={{ width: '100%', height: '40px' }}>
          <path d="M0,10 C200,30 400,0 600,20 C800,30 1000,10 1200,20 L1200,40 L0,40 Z" fill={palette.primary} opacity="0.06" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full p-[10mm]">
        {/* TOP SECTION: Logo + School */}
        <div className="flex flex-col items-center pt-2">
          <div
            className="w-24 h-24 rounded-[28px] flex items-center justify-center mb-3 bg-white shadow-md overflow-hidden p-3"
            style={{
              border: `3px solid ${palette.primary}30`,
              boxShadow: `0 8px 24px ${palette.glow}`,
            }}
          >
            <DyslexiaLogo className="w-full h-full" />
          </div>
          {settings.schoolName && (
            <h2
              className="text-[11px] font-bold tracking-[0.28em] text-center mb-1"
              style={{ color: palette.text, opacity: 0.7 }}
            >
              {settings.schoolName}
            </h2>
          )}
          <div className="w-16 h-[3px] rounded-full mt-1" style={{ background: `linear-gradient(90deg, transparent, ${palette.primary}60, transparent)` }} />
        </div>

        {/* CENTER SECTION: Branding + Title */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          {/* Premium Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.18em] mb-8"
            style={{
              background: `linear-gradient(135deg, ${palette.light}, ${palette.warm})`,
              border: `1.5px solid ${palette.primary}30`,
              color: palette.dark,
              boxShadow: `0 2px 8px ${palette.glow}`,
            }}
          >
            <span style={{ color: palette.primary }}>★</span>
            Premium Eğitim Materyali
            <span style={{ color: palette.primary }}>★</span>
          </div>

          {/* Main Title */}
          <h1
            className="text-[2.8rem] leading-[1.15] font-extrabold mb-2"
            style={{
              color: palette.title,
              fontFamily: 'Lexend, sans-serif',
              letterSpacing: '-0.02em',
            }}
          >
            {settings.title || 'Özel Eğitim Fasikülü'}
          </h1>

          {/* Decorative Divider */}
          <div className="flex items-center gap-4 my-4">
            <div className="w-16 h-px" style={{ background: `linear-gradient(90deg, transparent, ${palette.primary}50)` }} />
            <div className="w-3 h-3 rounded-full" style={{ background: palette.primary, opacity: 0.6 }} />
            <div className="w-16 h-px" style={{ background: `linear-gradient(90deg, ${palette.primary}50, transparent)` }} />
          </div>

          {/* Subtitle */}
          {settings.subtitle && (
            <h3
              className="text-xs font-semibold tracking-[0.2em] uppercase mb-5 px-4 py-2 rounded-lg"
              style={{
                color: palette.text,
                opacity: 0.7,
                background: palette.warm,
                letterSpacing: '0.15em',
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
                border: `1.5px solid ${palette.primary}25`,
                color: palette.text,
                backdropFilter: 'blur(8px)',
                boxShadow: `0 4px 16px ${palette.glow}`,
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
            boxShadow: `0 4px 20px ${palette.glow}`,
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
                  border: `2px solid ${palette.primary}25`,
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
