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
  // Robust data unwrapping
  // Priority: if it's an array, take first. 
  // If it's an object with mode/config, it's the ENVELOPE (Studio data), use it as is.
  // DO NOT take items[0] if it's a Studio envelope!
  const item = Array.isArray(data) ? data[0] : data;
  if (!item) return null;

  const mode = item.mode as MathMode || (item.content?.mode as MathMode);
  const config = item.config || item.content?.config;
  const pageConfig = (item.pageConfig || item.content?.pageConfig) as MathPageConfig;
  const items = item.items || item.content?.items || [];

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
