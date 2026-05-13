import { useMemo } from 'react';
import { useScreeningStore } from '../store/useScreeningStore';
import { screeningDataService } from '../services/screeningDataService';
import type { EvaluationCategory } from '../../../types/screening';
import { CATEGORY_LABELS } from '../../../data/screeningQuestions';

export function useScreeningAnalytics() {
  const { screeningData } = useScreeningStore();

  const analytics = useMemo(
    () => screeningDataService.computeAnalytics(screeningData),
    [screeningData]
  );

  const categoryChartData = useMemo(() => {
    if (!analytics) return [];
    return (Object.keys(analytics.categoryAverages) as EvaluationCategory[]).map(
      (cat) => ({
        label: CATEGORY_LABELS[cat] || cat,
        value: analytics.categoryAverages[cat],
        fullMark: 100,
      })
    );
  }, [analytics]);

  const riskDistributionData = useMemo(() => {
    if (!analytics) return [];
    const total = analytics.total || 1;
    return [
      {
        name: 'Düşük Risk',
        value: analytics.riskDistribution.low || 0,
        percentage: Math.round(((analytics.riskDistribution.low || 0) / total) * 100),
        color: 'emerald',
      },
      {
        name: 'Orta Risk',
        value: analytics.riskDistribution.medium || 0,
        percentage: Math.round(((analytics.riskDistribution.medium || 0) / total) * 100),
        color: 'amber',
      },
      {
        name: 'Yüksek Risk',
        value: analytics.riskDistribution.high || 0,
        percentage: Math.round(((analytics.riskDistribution.high || 0) / total) * 100),
        color: 'rose',
      },
    ];
  }, [analytics]);

  const monthlyTrendData = useMemo(() => {
    if (!analytics) return [];
    return analytics.monthly;
  }, [analytics]);

  return {
    analytics,
    categoryChartData,
    riskDistributionData,
    monthlyTrendData,
    hasData: screeningData.length > 0,
  };
}
