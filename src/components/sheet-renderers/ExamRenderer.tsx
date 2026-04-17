import React from 'react';
import { SinavOnizleme } from '../SinavStudyosu/SinavOnizleme';
import { MatSinavOnizleme } from '../MatSinavStudyosu/MatSinavOnizleme';
import { Sinav, PrintConfig } from '../../types/sinav';
import type { MatSinav } from '../../types/matSinav';

export type ExamType = 'turkce' | 'matematik';

type TurkceExamProps = {
  examType: 'turkce';
  data: Sinav & { printConfig?: PrintConfig };
};

type MatExamProps = {
  examType: 'matematik';
  data: MatSinav & { printConfig?: PrintConfig };
};

type Props = TurkceExamProps | MatExamProps;

export const ExamRenderer: React.FC<Props> = ({ examType, data }) => {
  if (examType === 'turkce') {
    const sinav = data as Sinav & { printConfig?: PrintConfig };
    return (
      <SinavOnizleme sinav={sinav} showAnswers={false} config={sinav.printConfig} />
    );
  }

  const sinav = data as MatSinav & { printConfig?: PrintConfig };
  return (
    <MatSinavOnizleme
      sinav={sinav}
      onUpdateSoru={() => undefined}
      onRefreshSoru={() => undefined}
      refreshingIndex={null}
      config={sinav.printConfig}
    />
  );
};

export default ExamRenderer;
