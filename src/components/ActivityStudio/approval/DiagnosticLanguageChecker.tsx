import React from 'react';
import { detectDiagnosticLanguage } from '@/components/ActivityStudio/validation/clinicalValidator';

interface DiagnosticLanguageCheckerProps {
  text: string;
}

export const DiagnosticLanguageChecker: React.FC<DiagnosticLanguageCheckerProps> = ({ text }) => {
  const violations = detectDiagnosticLanguage(text);

  return (
    <div className="rounded-xl border border-[var(--border-color)] p-3">
      <h4 className="text-sm font-semibold">Tani Dili Kontrolu</h4>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">
        {violations.length === 0 ? 'Temiz' : `${violations.length} adet riskli ifade bulundu.`}
      </p>
    </div>
  );
};
