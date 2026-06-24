import React from 'react';
import { CoverPageSettings } from '../../types/fascicle';
import { Student } from '../../types';
import DyslexiaLogo from '../DyslexiaLogo';

interface FascicleCoverPageProps {
  settings: CoverPageSettings;
  student: Student | null;
  fascicleTitle?: string;
}

export const FascicleCoverPage: React.FC<FascicleCoverPageProps> = ({ settings, student, fascicleTitle }) => {
  if (!settings.enabled) return null;

  const getThemeClasses = () => {
    switch (settings.themeStyle) {
      case 'playful':
        return 'bg-gradient-to-br from-yellow-100 via-green-100 to-blue-100';
      case 'elegant':
        return 'bg-[#fdfbf7] border-[12px] border-[#2c3e50]';
      case 'geometric':
        return 'bg-white relative overflow-hidden';
      case 'modern':
      default:
        return `bg-gradient-to-br from-${settings.primaryColor}-50 to-white`;
    }
  };

  const COLOR_LIGHT_BG: Record<string, string> = {
    indigo: 'bg-indigo-200/40',
    blue: 'bg-blue-200/40',
    emerald: 'bg-emerald-200/40',
    rose: 'bg-rose-200/40',
    amber: 'bg-amber-200/40',
    violet: 'bg-violet-200/40',
  };

  const getColorClass = (type: 'text' | 'bg' | 'border') => {
    const colorMap: Record<string, Record<string, string>> = {
      indigo: { text: 'text-indigo-600', bg: 'bg-indigo-600', border: 'border-indigo-600' },
      blue: { text: 'text-blue-600', bg: 'bg-blue-600', border: 'border-blue-600' },
      emerald: { text: 'text-emerald-600', bg: 'bg-emerald-600', border: 'border-emerald-600' },
      rose: { text: 'text-rose-600', bg: 'bg-rose-600', border: 'border-rose-600' },
      amber: { text: 'text-amber-600', bg: 'bg-amber-600', border: 'border-amber-600' },
      violet: { text: 'text-violet-600', bg: 'bg-violet-600', border: 'border-violet-600' },
    };
    return colorMap[settings.primaryColor]?.[type] || colorMap.indigo[type];
  };

  return (
    <div 
      className={`print-exact relative flex flex-col justify-between p-16 shadow-2xl rounded-tr-3xl rounded-br-3xl mx-auto overflow-hidden print:w-[210mm] print:h-[297mm] print:shadow-none print:m-0 w-full aspect-[210/297] box-border ${getThemeClasses()} page-break-after`}
      style={{
        boxSizing: 'border-box'
      }}
    >
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden p-12">
        <img src="/assets/logo.png" alt="" className="w-full h-full object-contain opacity-[0.04]" />
      </div>

      {/* Decorative Elements */}
      {settings.themeStyle === 'modern' && (
        <>
          <div className={`absolute top-0 right-0 w-64 h-64 ${COLOR_LIGHT_BG[settings.primaryColor] || 'bg-indigo-200/40'} rounded-full blur-3xl opacity-30 -z-10`} />
          <div className={`absolute bottom-0 left-0 w-80 h-80 ${COLOR_LIGHT_BG[settings.primaryColor] || 'bg-indigo-200/30'} rounded-full blur-3xl opacity-30 -z-10`} />
        </>
      )}

      {settings.themeStyle === 'geometric' && (
        <>
          <div className={`absolute -top-20 -right-20 w-96 h-96 border-[40px] ${getColorClass('border')} opacity-10 rounded-full`} />
          <div className={`absolute top-40 -left-10 w-32 h-32 ${getColorClass('bg')} opacity-10 rotate-45`} />
          <div className={`absolute -bottom-20 right-20 w-64 h-64 border-[24px] ${getColorClass('border')} opacity-10 rounded-full`} />
        </>
      )}

      {settings.themeStyle === 'playful' && (
        <>
          <div className="absolute top-10 right-20 w-16 h-16 bg-pink-300 rounded-full mix-blend-multiply filter blur-sm opacity-70 animate-blob" />
          <div className="absolute top-20 right-10 w-16 h-16 bg-yellow-300 rounded-full mix-blend-multiply filter blur-sm opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-300 rounded-full mix-blend-multiply filter blur-sm opacity-70 animate-blob" />
        </>
      )}

      {/* Header section */}
      <div className="relative z-10 flex flex-col items-center pt-4">
        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-4 bg-white border-2 ${getColorClass('border')} print:shadow-none shadow-lg overflow-hidden p-2`}>
          <DyslexiaLogo className="w-full h-full" />
        </div>
        {settings.schoolName && (
          <h2 className="text-lg font-bold text-gray-500 uppercase tracking-[0.2em] text-center mb-1">
            {settings.schoolName}
          </h2>
        )}
        <div className={`w-16 h-0.5 mt-3 rounded-full ${getColorClass('bg')}`} />
      </div>

      {/* BDMIND Branding */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto pt-8 pb-8">
        <h1 className="text-[4rem] leading-[1] font-black text-gray-800 drop-shadow-sm" style={{ fontFamily: 'Lexend, sans-serif', letterSpacing: '-0.02em' }}>
          BDMIND
        </h1>
        <div className={`w-20 h-1 my-4 rounded-full ${getColorClass('bg')}`} />
        <h2 className="text-lg font-black text-gray-500 uppercase tracking-[0.35em]">
          EDU-TECH PLATFORM
        </h2>
        <h3 className={`text-sm font-bold mt-6 italic ${getColorClass('text')} opacity-70 uppercase tracking-widest`}>
          {settings.subtitle || 'Kişiselleştirilmiş Eğitim Materyali'}
        </h3>
        {fascicleTitle && fascicleTitle !== 'İsimsiz Fasikül' && (
          <div className="mt-6 px-8 py-3 rounded-2xl" style={{ backgroundColor: 'var(--accent-muted, rgba(99,102,241,0.08))', border: '1px solid var(--accent-muted, rgba(99,102,241,0.15))' }}>
            <span className="text-base font-bold text-gray-700">{fascicleTitle}</span>
          </div>
        )}
      </div>

      {/* Student & Footer Section */}
      <div className="relative z-10 mt-auto bg-white/70 backdrop-blur-sm p-8 rounded-3xl border border-white/50 shadow-lg print:shadow-none print:border-gray-300">
        <div className="flex justify-between items-end">
          {settings.showStudentLine && (
            <div className="flex-1">
              <div className="mb-6">
                <span className="block text-sm font-bold tracking-widest text-gray-400 uppercase mb-2">Öğrenci Adı Soyadı</span>
                <div className="text-2xl font-black text-gray-800 border-b-2 border-dashed border-gray-400 pb-1 mr-12 min-h-[36px]">
                  {student ? student.name : ''}
                </div>
              </div>
              <div>
                <span className="block text-sm font-bold tracking-widest text-gray-400 uppercase mb-2">Sınıfı / Grubu</span>
                <div className="text-xl text-gray-700 font-bold border-b-2 border-dashed border-gray-400 pb-1 mr-24 min-h-[32px]">
                  {student?.grade ? `${student.grade}. Sınıf` : ''}
                </div>
              </div>
            </div>
          )}
          
          <div className="text-right flex flex-col items-end">
             <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-white shadow-md border-2 ${getColorClass('border')} print:shadow-none`}>
                <i className={`fa-solid fa-qrcode text-2xl ${getColorClass('text')}`} />
             </div>
             <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
               Düzenlenme Tarihi
             </div>
             <div className="text-lg font-black text-gray-700">
               {settings.date || new Date().toLocaleDateString('tr-TR')}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
