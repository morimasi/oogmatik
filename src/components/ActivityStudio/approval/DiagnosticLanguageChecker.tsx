import React from 'react';
import { detectDiagnosticLanguage } from '@/components/ActivityStudio/validation/clinicalValidator';

interface DiagnosticLanguageCheckerProps {
  text: string;
}

export const DiagnosticLanguageChecker: React.FC<DiagnosticLanguageCheckerProps> = ({ text }) => {
  const violations = detectDiagnosticLanguage(text);

  return (
    <div className={`rounded-xl border p-4 backdrop-blur-sm transition-all ${violations.length === 0 ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Tanı Dili Denetimi</h4>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${violations.length === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {violations.length === 0 ? 'TEMİZ' : 'RİSKLİ'}
        </span>
      </div>
      <p className="mt-2 text-xs font-medium text-zinc-500 font-['Lexend']">
        {violations.length === 0 ? 'İçerikte yasal ve klinik olarak riskli ifadeye rastlanmadı.' : `${violations.length} adet riskli ifade bulundu. Lütfen içeriği BEP standartlarına göre revize edin.`}
      </p>
    </div>
  );
};
