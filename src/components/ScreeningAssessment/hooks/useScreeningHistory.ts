import { useMemo, useCallback } from 'react';
import { useScreeningStore } from '../store/useScreeningStore';
import type { ScreeningResult } from '../../../types/screening';
import type { ScreeningFilterStatus } from '../types';

export function useScreeningHistory() {
  const { screeningData, searchQuery, filterStatus, setSearchQuery, setFilterStatus } =
    useScreeningStore();

  const filteredData = useMemo(
    () =>
      screeningData.filter((item: ScreeningResult) => {
        const matchesSearch = item.studentName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesFilter =
          filterStatus === 'all' || item.status === filterStatus;
        return matchesSearch && matchesFilter;
      }),
    [screeningData, searchQuery, filterStatus]
  );

  const statsByStatus = useMemo(() => {
    const total = screeningData.length;
    const completed = screeningData.filter((s: ScreeningResult) => s.status === 'completed').length;
    const pending = screeningData.filter((s: ScreeningResult) => s.status === 'pending').length;
    const archived = screeningData.filter((s: ScreeningResult) => s.status === 'archived').length;
    return { total, completed, pending, archived };
  }, [screeningData]);

  const highRiskCount = useMemo(
    () => screeningData.filter((s: ScreeningResult) => s.riskLevel === 'high').length,
    [screeningData]
  );

  const averageScore = useMemo(
    () =>
      screeningData.length > 0
        ? Math.round(
            screeningData.reduce((sum: number, s: ScreeningResult) => sum + s.overallScore, 0) /
              screeningData.length
          )
        : 0,
    [screeningData]
  );

  return {
    filteredData,
    statsByStatus,
    highRiskCount,
    averageScore,
    searchQuery,
    filterStatus,
    setSearchQuery,
    setFilterStatus,
  };
}
