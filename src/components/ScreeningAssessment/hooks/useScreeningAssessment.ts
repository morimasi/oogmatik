import { useEffect, useCallback } from 'react';
import { useScreeningStore } from '../store/useScreeningStore';
import { screeningDataService } from '../services/screeningDataService';
import { assessmentService } from '../../../services/assessmentService';
import { useAuthStore } from '../../../store/useAuthStore';
import { useToastStore } from '../../../store/useToastStore';
import { printService } from '../../../utils/printService';
import type { ScreeningResult, EvaluationCategory } from '../../../types/screening';
import type { SharePermission } from '../../../services/profileShareService';

interface UseScreeningAssessmentOptions {
  onAddToWorkbook?: (data: ScreeningResult) => void;
}

const mapScreeningToSavedAssessment = (screening: ScreeningResult) => {
  return {
    id: screening.id,
    userId: screening.studentId || 'unknown',
    studentId: screening.studentId,
    studentName: screening.studentName,
    gender: 'Kız' as const,
    age: screening.age,
    grade: screening.grade,
    createdAt: new Date().toISOString(),
    report: {
      overallSummary: screening.aiAnalysis || 'Tarama sonuçları kaydedildi.',
      scores: Object.entries(screening.categoryScores).reduce(
        (acc, [key, value]) => ({ ...acc, [key]: value.score }),
        {} as Record<string, number>
      ),
      chartData: Object.entries(screening.categoryScores).map(([key, value]) => ({
        label: key,
        value: value.score,
        fullMark: 100,
      })),
      analysis: {
        strengths: screening.strengths || [],
        weaknesses: screening.weaknesses || [],
        errorAnalysis: Object.values(screening.categoryScores).flatMap((score) => score.findings),
      },
      roadmap: [],
      observations: {
        anxietyLevel: 'medium',
        attentionSpan: 'average',
        motorSkills: 'typical',
        notes: `Tarama raporu: ${screening.studentName}`,
      },
    },
  };
};

export function useScreeningAssessment(options?: UseScreeningAssessmentOptions) {
  const store = useScreeningStore();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    screeningDataService.getUserScreeningsFromFirestore().then((data) => {
      store.setScreeningData(data.length > 0 ? data : screeningDataService.getMockData());
    });
  }, []);

  const filteredData = store.screeningData.filter((item: ScreeningResult) => {
    const matchesSearch = item.studentName
      .toLowerCase()
      .includes(store.searchQuery.toLowerCase());
    const matchesFilter =
      store.filterStatus === 'all' || item.status === store.filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleStartScreening = useCallback(() => {
    if (!store.selectedStudentName.trim()) {
      addToast('Lütfen öğrenci adı girin.', 'error');
      return;
    }
    store.setActiveView('assessment');
  }, [store.selectedStudentName]);

  const handleSaveScreening = useCallback(async () => {
    if (!store.currentScreening) return;
    store.setIsSaving(true);
    await screeningDataService.saveResultToFirestore(store.currentScreening);
    const updated = await screeningDataService.getUserScreeningsFromFirestore();
    store.setScreeningData(updated);
    store.setIsSaving(false);
  }, [store.currentScreening]);

  const handleArchiveScreening = useCallback((id: string) => {
    store.archiveScreening(id);
    addToast('Tarama arşive taşındı.', 'success');
  }, []);

  const handleDeleteScreening = useCallback((id: string) => {
    store.deleteScreening(id);
    addToast('Tarama silindi.', 'success');
  }, []);

  const handleShareResults = useCallback((id: string) => {
    const url = `${window.location.origin}/screening/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      addToast('Paylaşım bağlantısı panoya kopyalandı.', 'success');
    }).catch(() => {
      addToast('Paylaşım bağlantısı kopyalanamadı.', 'error');
    });
  }, [addToast]);

  const handleShareScreeningResult = useCallback(
    async (screeningId: string, receiverIds: string[], permission?: SharePermission, message?: string) => {
      const screening = store.screeningData.find((item) => item.id === screeningId) || store.currentScreening;
      if (!screening) {
        addToast('Paylaşılacak tarama sonucu bulunamadı.', 'error');
        return;
      }
      if (!user) {
        addToast('Paylaşmak için oturum açmanız gerekiyor.', 'error');
        return;
      }
      try {
        const assessment = mapScreeningToSavedAssessment(screening);
        await Promise.all(
          receiverIds.map((receiverId) =>
            assessmentService.shareAssessment(assessment, user.id, user.name, receiverId, permission, message)
          )
        );
        addToast('Tarama raporu başarıyla paylaşıldı.', 'success');
      } catch (error) {
        addToast('Tarama paylaşımı sırasında hata oluştu.', 'error');
      }
    },
    [store.screeningData, store.currentScreening, user, addToast]
  );

  const handleDownloadReport = useCallback(async (data: ScreeningResult) => {
    try {
      addToast('Rapor hazırlanıyor...', 'info');
      await printService.generatePdf('#printable-report', `Disleksi_Tarama_${data.studentName}`, { action: 'download' });
    } catch {
      window.print();
    }
  }, [addToast]);

  const handlePrintReport = useCallback(() => {
    window.print();
  }, []);

  const handleAddToWorkbook = useCallback((data: ScreeningResult) => {
    if (options?.onAddToWorkbook) {
      options.onAddToWorkbook(data);
      addToast(`${data.studentName} sonuçları çalışma kitabına eklendi.`, 'success');
      return;
    }

    addToast('Çalışma kitabına ekleme yapılamadı.', 'error');
  }, [options, addToast]);

  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getRiskBadgeClasses = (level: string): string => {
    switch (level) {
      case 'low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'high': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getStatusBadgeClasses = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500';
      case 'pending': return 'bg-amber-500/10 text-amber-500';
      case 'archived': return 'bg-zinc-500/10 text-zinc-500';
      default: return 'bg-zinc-500/10 text-zinc-500';
    }
  };

  const handleGeneratePlan = useCallback((studentName: string, age: number, weaknesses: string[], diagnosisContext?: string) => {
    addToast('Eğitim planı oluşturuluyor...', 'info');
  }, []);

  const handleOpenScreeningDetail = useCallback((screening: ScreeningResult) => {
    store.setCurrentScreening(screening);
    store.setActiveView('result-detail');
  }, []);

  return {
    ...store,
    filteredData,
    handleStartScreening,
    handleSaveScreening,
    handleArchiveScreening,
    handleDeleteScreening,
    handleShareResults,
    handleShareScreeningResult,
    handleDownloadReport,
    handlePrintReport,
    handleAddToWorkbook,
    handleGeneratePlan,
    handleOpenScreeningDetail,
    getScoreColor,
    getRiskBadgeClasses,
    getStatusBadgeClasses,
  };
}
