import React from 'react';
import { CoverPageSettings } from '../../types/fascicle';
import { Student } from '../../types';

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

  const getColorClass = (type: 'text' | 'bg' | 'border', opacity = '') => {
    const colorMap: Record<string, string> = {
      indigo: type === 'text' ? 'text-indigo-600' : type === 'bg' ? 'bg-indigo-600' : 'border-indigo-600',
      blue: type === 'text' ? 'text-blue-600' : type === 'bg' ? 'bg-blue-600' : 'border-blue-600',
      emerald: type === 'text' ? 'text-emerald-600' : type === 'bg' ? 'bg-emerald-600' : 'border-emerald-600',
      rose: type === 'text' ? 'text-rose-600' : type === 'bg' ? 'bg-rose-600' : 'border-rose-600',
      amber: type === 'text' ? 'text-amber-600' : type === 'bg' ? 'bg-amber-600' : 'border-amber-600',
      violet: type === 'text' ? 'text-violet-600' : type === 'bg' ? 'bg-violet-600' : 'border-violet-600',
    };
    return colorMap[settings.primaryColor] || colorMap['indigo'];
  };

  return (
    <div 
      className={`print-exact relative flex flex-col justify-between p-16 shadow-2xl rounded-tr-3xl rounded-br-3xl mx-auto overflow-hidden print:w-[210mm] print:h-[297mm] print:shadow-none print:m-0 w-full aspect-[210/297] box-border ${getThemeClasses()} page-break-after`}
      style={{
        boxSizing: 'border-box'
      }}
    >
      {/* Decorative Elements */}
      {settings.themeStyle === 'modern' && (
        <>
          <div className={`absolute top-0 right-0 w-64 h-64 bg-${settings.primaryColor}-200/40 rounded-bl-[100px] -mr-10 -mt-10`} />
          <div className={`absolute bottom-0 left-0 w-80 h-80 bg-${settings.primaryColor}-200/30 rounded-tr-[120px] -ml-20 -mb-20`} />
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

      {/* Header section (School Name & Logo space) */}
      <div className="relative z-10 flex flex-col items-center pt-8">
        <div className={`w-28 h-28 rounded-3xl flex items-center justify-center mb-6 shadow-xl bg-white border-4 ${getColorClass('border')} print:shadow-none`}>
          <i className={`fa-solid fa-graduation-cap text-5xl ${getColorClass('text')}`} />
        </div>
        {settings.schoolName && (
          <h2 className="text-xl font-bold text-gray-500 uppercase tracking-[0.2em] text-center mb-2">
            {settings.schoolName}
          </h2>
        )}
        <div className={`w-24 h-1 mt-4 rounded-full ${getColorClass('bg')}`} />
      </div>

      {/* Main Title Section */}
      <div className="relative z-10 flex-col items-center justify-center text-center my-auto pt-16 pb-12">
        <h3 className={`text-2xl font-bold mb-4 italic ${getColorClass('text')} opacity-80 uppercase tracking-widest`}>
          {settings.subtitle || 'Kişiselleştirilmiş Eğitim Materyali'}
        </h3>
        <h1 className="text-[3.5rem] leading-[1.1] font-black text-gray-800 drop-shadow-sm mb-8" style={{ fontFamily: 'Lexend, sans-serif' }}>
          {settings.title || fascicleTitle || 'Eğitim Fasikülü'}
        </h1>
        {fascicleTitle && settings.title && fascicleTitle !== settings.title && (
            <h2 className="text-3xl font-bold text-gray-600 mt-4 underline decoration-2 underline-offset-8 decoration-gray-300">
                {fascicleTitle}
            </h2>
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
