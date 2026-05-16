import React from 'react';
import { DrillCanvas } from '../MathStudio/components/DrillCanvas';
import { ProblemCanvas } from '../MathStudio/components/ProblemCanvas';
import { MathDrillConfig, MathProblemConfig, MathPageConfig, MathMode } from '../../types/math';
import { ThemeConfig, DEFAULT_THEME_CONFIG } from '../MathStudio/constants';

interface MathStudioRendererProps {
  data: any;
  settings?: any;
}

export const MathStudioRenderer: React.FC<MathStudioRendererProps> = ({ data, settings }) => {
  if (!data) return null;

  const mode = data.mode as MathMode;
  const config = data.config;
  const pageConfig = data.pageConfig as MathPageConfig;
  const items = data.items || [];

  const themeConfig: ThemeConfig = DEFAULT_THEME_CONFIG;

  if (mode === 'drill') {
    return (
      <DrillCanvas
        drillConfig={config as MathDrillConfig}
        pageConfig={pageConfig}
        themeConfig={themeConfig}
        generatedDrills={items}
        studentName={settings?.studentName}
      />
    );
  }

  return (
    <ProblemCanvas
      problemConfig={config as MathProblemConfig}
      pageConfig={pageConfig}
      themeConfig={themeConfig}
      generatedProblems={items}
      instruction={data.instruction}
      studentName={settings?.studentName}
    />
  );
};
