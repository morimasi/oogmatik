import React from 'react';
import { SinavOnizleme } from '../SinavStudyosu/SinavOnizleme';
import { MatSinavOnizleme } from '../MatSinavStudyosu/MatSinavOnizleme';
import { Sinav, PrintConfig } from '../../types/sinav';
import type { MatSinav } from '../../types/matSinav';
import { StyleSettings } from '../../types';

export type ExamType = 'turkce' | 'matematik';

type TurkceExamProps = {
  examType: 'turkce';
  data: Sinav & { printConfig?: PrintConfig };
  settings?: StyleSettings;
};

type MatExamProps = {
  examType: 'matematik';
  data: MatSinav & { printConfig?: PrintConfig };
  settings?: StyleSettings;
};

type Props = TurkceExamProps | MatExamProps;

export const ExamRenderer: React.FC<Props> = ({ examType, data, settings }) => {
  // settings üzerinden gelen showAnswers kontrolü, yoksa false
  const showAnswers = settings?.showAnswers ?? false;
  const isPrinting = true; // ExamRenderer genellikle yazdırma/önizleme odağında çağrılır

  // Soru gap / margin ayarlarını StyleSettings'ten sync et
  const config: PrintConfig = {
    ...(data as any).printConfig,
    columns: settings?.columns || (data as any).printConfig?.columns || 1,
    fontSize: settings?.fontSize === 'büyük' ? 14 : (settings?.fontSize === 'küçük' ? 10 : 12),
    questionSpacingMm: Number(settings?.margin || 10),
  };

  if (examType === 'turkce') {
    const sinav = data as Sinav;
    return (
      <SinavOnizleme 
        sinav={sinav} 
        showAnswers={showAnswers} 
        config={config} 
        isPrinting={isPrinting}
      />
    );
  }

  const sinav = data as MatSinav;
  return (
    <MatSinavOnizleme
      sinav={sinav}
      onUpdateSoru={() => undefined}
      onRefreshSoru={() => undefined}
      refreshingIndex={null}
      config={config}
      isPrinting={isPrinting}
      showAnswers={showAnswers}
    />
  );
};
