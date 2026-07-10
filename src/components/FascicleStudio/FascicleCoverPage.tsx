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

const COLOR_PALETTE: Record<string, {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  blobColor: string;
  borderColor: string;
  textAccent: string;
  glassBg: string;
  glassBorder: string;
}> = {
  indigo: {
    primary: '#4f46e5',
    primaryLight: '#eef2ff',
    primaryDark: '#3730a3',
    accent: '#818cf8',
    gradientFrom: '#eef2ff',
    gradientVia: '#e0e7ff',
    gradientTo: '#ffffff',
    blobColor: 'rgba(99,102,241,0.12)',
    borderColor: '#4f46e5',
    textAccent: '#4f46e5',
    glassBg: 'rgba(255,255,255,0.75)',
    glassBorder: 'rgba(79,70,229,0.15)',
  },
  blue: {
    primary: '#2563eb',
    primaryLight: '#eff6ff',
    primaryDark: '#1e40af',
    accent: '#60a5fa',
    gradientFrom: '#eff6ff',
    gradientVia: '#dbeafe',
    gradientTo: '#ffffff',
    blobColor: 'rgba(37,99,235,0.12)',
    borderColor: '#2563eb',
    textAccent: '#2563eb',
    glassBg: 'rgba(255,255,255,0.75)',
    glassBorder: 'rgba(37,99,235,0.15)',
  },
  emerald: {
    primary: '#059669',
    primaryLight: '#ecfdf5',
    primaryDark: '#047857',
    accent: '#34d399',
    gradientFrom: '#ecfdf5',
    gradientVia: '#d1fae5',
    gradientTo: '#ffffff',
    blobColor: 'rgba(5,150,105,0.12)',
    borderColor: '#059669',
    textAccent: '#059669',
    glassBg: 'rgba(255,255,255,0.75)',
    glassBorder: 'rgba(5,150,105,0.15)',
  },
  rose: {
    primary: '#e11d48',
    primaryLight: '#fff1f2',
    primaryDark: '#be123c',
    accent: '#fb7185',
    gradientFrom: '#fff1f2',
    gradientVia: '#ffe4e6',
    gradientTo: '#ffffff',
    blobColor: 'rgba(225,29,72,0.12)',
    borderColor: '#e11d48',
    textAccent: '#e11d48',
    glassBg: 'rgba(255,255,255,0.75)',
    glassBorder: 'rgba(225,29,72,0.15)',
  },
  amber: {
    primary: '#d97706',
    primaryLight: '#fffbeb',
    primaryDark: '#b45309',
    accent: '#fbbf24',
    gradientFrom: '#fffbeb',
    gradientVia: '#fef3c7',
    gradientTo: '#ffffff',
    blobColor: 'rgba(217,119,6,0.12)',
    borderColor: '#d97706',
    textAccent: '#d97706',
    glassBg: 'rgba(255,255,255,0.75)',
    glassBorder: 'rgba(217,119,6,0.15)',
  },
  violet: {
    primary: '#7c3aed',
    primaryLight: '#f5f3ff',
    primaryDark: '#6d28d9',
    accent: '#a78bfa',
    gradientFrom: '#f5f3ff',
    gradientVia: '#ede9fe',
    gradientTo: '#ffffff',
    blobColor: 'rgba(124,58,237,0.12)',
    borderColor: '#7c3aed',
    textAccent: '#7c3aed',
    glassBg: 'rgba(255,255,255,0.75)',
    glassBorder: 'rgba(124,58,237,0.15)',
  },
};

const THEME_STYLES: Record<string, React.CSSProperties> = {
  modern: {
    background: 'linear-gradient(135deg, var(--gradient-from) 0%, var(--gradient-via) 50%, var(--gradient-to) 100%)',
  },
  playful: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 30%, #dbeafe 60%, #fef3c7 100%)',
  },
  elegant: {
    background: '#fdfbf7',
    border: '12px solid #2c3e50',
  },
  geometric: {
    background: '#ffffff',
  },
};

export const FascicleCoverPage: React.FC<FascicleCoverPageProps> = ({ settings, student, fascicleTitle, watermarkSettings }) => {
  if (!settings.enabled) return null;

  const colors = COLOR_PALETTE[settings.primaryColor] || COLOR_PALETTE.indigo;

  const themeStyle: React.CSSProperties = {
    ...THEME_STYLES[settings.themeStyle] || THEME_STYLES.modern,
    '--gradient-from': colors.gradientFrom,
    '--gradient-via': colors.gradientVia,
    '--gradient-to': colors.gradientTo,
    '--primary-color': colors.primary,
    '--primary-light': colors.primaryLight,
    '--primary-dark': colors.primaryDark,
    '--accent-color': colors.accent,
    '--blob-color': colors.blobColor,
    '--border-color-primary': colors.borderColor,
    '--text-accent': colors.textAccent,
    '--glass-bg': colors.glassBg,
    '--glass-border': colors.glassBorder,
  } as React.CSSProperties;

  return (
    <div
      className="print-exact worksheet-page relative flex flex-col justify-between p-0 mx-auto overflow-hidden w-[210mm] h-[297mm] box-border"
      style={{
        ...themeStyle,
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

      {/* Decorative Background Elements */}
      {settings.themeStyle === 'modern' && (
        <>
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-20 -z-10" style={{ background: colors.blobColor }} />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20 -z-10" style={{ background: colors.blobColor }} />
          <div className="absolute top-1/3 -left-20 w-48 h-48 rounded-full blur-2xl opacity-10 -z-10" style={{ background: colors.accent }} />
        </>
      )}

      {settings.themeStyle === 'playful' && (
        <>
          <div className="absolute top-16 right-24 w-20 h-20 rounded-full mix-blend-multiply filter blur-sm opacity-60" style={{ background: '#f9a8d4' }} />
          <div className="absolute top-28 right-12 w-16 h-16 rounded-full mix-blend-multiply filter blur-sm opacity-60" style={{ background: '#fde68a' }} />
          <div className="absolute bottom-24 left-24 w-28 h-28 rounded-full mix-blend-multiply filter blur-sm opacity-60" style={{ background: '#c4b5fd' }} />
          <div className="absolute top-1/2 left-1/4 w-12 h-12 rounded-full mix-blend-multiply filter blur-sm opacity-40" style={{ background: '#a7f3d0' }} />
        </>
      )}

      {settings.themeStyle === 'geometric' && (
        <>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-8" style={{ border: `40px solid ${colors.borderColor}`, opacity: 0.08 }} />
          <div className="absolute top-44 -left-12 w-36 h-36 opacity-8" style={{ background: colors.primary, opacity: 0.08, transform: 'rotate(45deg)' }} />
          <div className="absolute -bottom-24 right-16 w-72 h-72 rounded-full opacity-8" style={{ border: `24px solid ${colors.borderColor}`, opacity: 0.08 }} />
          <div className="absolute bottom-1/3 right-1/4 w-16 h-16 opacity-6" style={{ background: colors.primary, opacity: 0.06, transform: 'rotate(15deg)' }} />
        </>
      )}

      {settings.themeStyle === 'elegant' && (
        <>
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)` }} />
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)` }} />
          <div className="absolute top-24 bottom-24 left-12 w-px" style={{ background: `linear-gradient(180deg, transparent, ${colors.primary}33, transparent)` }} />
          <div className="absolute top-24 bottom-24 right-12 w-px" style={{ background: `linear-gradient(180deg, transparent, ${colors.primary}33, transparent)` }} />
          <div className="absolute top-1/3 left-1/2 w-32 h-32 rounded-full border opacity-5" style={{ border: `2px solid ${colors.primary}`, transform: 'translateX(-50%)' }} />
        </>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full p-[8mm]">
        {/* TOP SECTION: Logo + School */}
        <div className="flex flex-col items-center pt-4">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-3 bg-white shadow-lg overflow-hidden p-2"
            style={{ border: `2px solid ${colors.borderColor}` }}
          >
            <DyslexiaLogo className="w-full h-full" />
          </div>
          {settings.schoolName && (
            <h2 className="text-xs font-bold tracking-[0.25em] text-center mb-2" style={{ color: colors.primary }}>
              {settings.schoolName}
            </h2>
          )}
          <div className="w-12 h-0.5 rounded-full" style={{ background: colors.primary }} />
        </div>

        {/* CENTER SECTION: Branding + Title */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          {/* Premium Badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] mb-6"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}15, ${colors.accent}20)`,
              border: `1px solid ${colors.borderColor}25`,
              color: colors.primary,
            }}
          >
            <span style={{ color: colors.primary }}>✦</span>
            Premium Eğitim Materyali
            <span style={{ color: colors.primary }}>✦</span>
          </div>

          {/* Main Title */}
          <h1
            className="text-[3.2rem] leading-[1.1] font-black tracking-[-0.03em] mb-2"
            style={{
              color: '#1e293b',
              fontFamily: 'Lexend, sans-serif',
            }}
          >
            {settings.title || 'Özel Eğitim Fasikülü'}
          </h1>

          {/* Decorative Divider */}
          <div className="flex items-center gap-3 my-3">
            <div className="w-12 h-px" style={{ background: `linear-gradient(90deg, transparent, ${colors.primary})` }} />
            <div className="w-2 h-2 rounded-full" style={{ background: colors.primary }} />
            <div className="w-12 h-px" style={{ background: `linear-gradient(90deg, ${colors.primary}, transparent)` }} />
          </div>

          {/* Subtitle */}
          {settings.subtitle && (
            <h3
              className="text-sm font-semibold tracking-[0.15em] uppercase mb-4"
              style={{ color: colors.textAccent, opacity: 0.7 }}
            >
              {settings.subtitle}
            </h3>
          )}

          {/* BDMIND Brand */}
          <div className="mt-2 mb-4">
            <span
              className="text-[2.8rem] font-black tracking-[-0.04em]"
              style={{
                background: `linear-gradient(135deg, ${colors.primaryDark}, ${colors.primary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'Lexend, sans-serif',
              }}
            >
              BDMIND
            </span>
            <div className="text-[9px] font-bold tracking-[0.4em] mt-1" style={{ color: colors.textAccent, opacity: 0.5 }}>
              EDU-TECH PLATFORM
            </div>
          </div>

          {/* Fascicle Title Badge */}
          {fascicleTitle && fascicleTitle !== 'İsimsiz Fasikül' && (
            <div
              className="mt-3 px-6 py-2 rounded-xl text-sm font-bold"
              style={{
                background: colors.glassBg,
                border: `1px solid ${colors.glassBorder}`,
                color: '#334155',
                backdropFilter: 'blur(8px)',
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
            background: colors.glassBg,
            borderColor: colors.glassBorder,
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="flex justify-between items-end">
            {settings.showStudentLine && (
              <div className="flex-1 min-w-0">
                <div className="mb-4">
                  <span className="block text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5" style={{ color: colors.textAccent, opacity: 0.6 }}>
                    Öğrenci Adı Soyadı
                  </span>
                  <div
                    className="text-xl font-black pb-1 min-h-[30px]"
                    style={{
                      color: '#1e293b',
                      borderBottom: `2px dashed ${colors.borderColor}40`,
                      fontFamily: 'Lexend, sans-serif',
                    }}
                  >
                    {student ? student.name : ''}
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5" style={{ color: colors.textAccent, opacity: 0.6 }}>
                    Sınıfı / Grubu
                  </span>
                  <div
                    className="text-base font-bold pb-1 min-h-[26px]"
                    style={{
                      color: '#475569',
                      borderBottom: `2px dashed ${colors.borderColor}40`,
                      fontFamily: 'Lexend, sans-serif',
                    }}
                  >
                    {student?.grade ? `${student.grade}. Sınıf` : ''}
                  </div>
                </div>
              </div>
            )}

            <div className="text-right flex flex-col items-end shrink-0" style={{ marginLeft: settings.showStudentLine ? '1rem' : '0' }}>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-3 bg-white shadow-md"
                style={{ border: `2px solid ${colors.borderColor}` }}
              >
                <i className="fa-solid fa-qrcode text-xl" style={{ color: colors.textAccent }} />
              </div>
              <div className="text-[9px] font-bold tracking-[0.15em]" style={{ color: colors.textAccent, opacity: 0.5 }}>
                Düzenlenme Tarihi
              </div>
              <div
                className="text-sm font-black mt-0.5"
                style={{
                  color: '#334155',
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
