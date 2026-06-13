import { useEffect, useCallback } from 'react';
import { useScreeningStore } from '../store/useScreeningStore';
import { screeningDataService } from '../services/screeningDataService';
import { assessmentService } from '../../../services/assessmentService';
import { useAuthStore } from '../../../store/useAuthStore';
import { useToastStore } from '../../../store/useToastStore';
import { printService } from '../../../utils/printService';
import type { ScreeningResult, EvaluationCategory } from '../../../types/screening';
import type { ClinicalObservation } from '../../../types';
import type { SharePermission } from '../../../services/profileShareService';

interface UseScreeningAssessmentOptions {
  onAddToWorkbook?: (data: ScreeningResult) => void;
}

const mapScreeningToSavedAssessment = (screening: ScreeningResult, authUserId: string) => {
  const observations: ClinicalObservation = {
    anxietyLevel: 'medium',
    attentionSpan: 'focused',
    motorSkills: 'typical',
    notes: `Tarama raporu: ${screening.studentName}`,
  };

  return {
    id: screening.id,
    userId: authUserId,
    studentId: screening.studentId,
    studentName: screening.studentName,
    gender: (screening as ScreeningResult & { gender?: 'Kız' | 'Erkek' }).gender || 'Kız' as const,
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
      observations,
    },
  };
};

export function useScreeningAssessment(options?: UseScreeningAssessmentOptions) {
  const store = useScreeningStore();
  const { user } = useAuthStore();
  const toast = useToastStore();

  useEffect(() => {
    screeningDataService.getUserScreeningsFromFirestore().then((data) => {
      const fallback = import.meta.env.DEV ? screeningDataService.getMockData() : [];
      store.setScreeningData(data.length > 0 ? data : fallback);
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
      toast.error('Lütfen öğrenci adı girin.');
      return;
    }
    if (store.selectedScreeningType === 'developmental') {
      toast.info('Gelişimsel tarama yakında eklenecek. Bilişsel tarama başlatılıyor.');
    }
    store.setActiveView('assessment');
  }, [store.selectedStudentName, store.selectedScreeningType, toast]);

  const handleStartCognitiveBattery = useCallback(() => {
    if (!store.selectedStudentName.trim()) {
      toast.error('Lütfen öğrenci adı girin.');
      return;
    }
    store.setActiveView('cognitive-battery');
  }, [store.selectedStudentName, toast]);

  const handleSaveScreening = useCallback(async () => {
    if (!store.currentScreening) return;
    store.setIsSaving(true);
    await screeningDataService.saveResultToFirestore(store.currentScreening);
    const updated = await screeningDataService.getUserScreeningsFromFirestore();
    store.setScreeningData(updated);
    store.setIsSaving(false);
  }, [store.currentScreening]);

  const handleArchiveScreening = useCallback(async (id: string) => {
    const ok = await screeningDataService.updateScreeningInFirestore(id, { status: 'archived' });
    if (ok) {
      store.archiveScreening(id);
      const updated = await screeningDataService.getUserScreeningsFromFirestore();
      store.setScreeningData(updated.length > 0 ? updated : (import.meta.env.DEV ? screeningDataService.getMockData() : []));
      toast.success('Tarama arşive taşındı.');
    } else {
      toast.error('Arşivleme başarısız.');
    }
  }, [toast]);

  const handleDeleteScreening = useCallback(async (id: string) => {
    const ok = await screeningDataService.deleteScreeningFromFirestore(id);
    if (ok) {
      store.deleteScreening(id);
      toast.success('Tarama silindi.');
    } else {
      toast.error('Silme başarısız.');
    }
  }, [toast]);

  const handleShareResults = useCallback((id: string) => {
    const url = `${window.location.origin}/screening/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Paylaşım bağlantısı panoya kopyalandı.');
    }).catch(() => {
      toast.error('Paylaşım bağlantısı kopyalanamadı.');
    });
  }, [toast]);

  const handleShareScreeningResult = useCallback(
    async (screeningId: string, receiverIds: string[], permission?: SharePermission, message?: string) => {
      const screening = store.screeningData.find((item) => item.id === screeningId) || store.currentScreening;
      if (!screening) {
        toast.error('Paylaşılacak tarama sonucu bulunamadı.');
        return;
      }
      if (!user) {
        toast.error('Paylaşmak için oturum açmanız gerekiyor.');
        return;
      }
      try {
        const assessment = mapScreeningToSavedAssessment(screening, user.id);
        await Promise.all(
          receiverIds.map((receiverId) =>
            assessmentService.shareAssessment(assessment, user.id, user.name, receiverId, permission, message)
          )
        );
        toast.success('Tarama raporu başarıyla paylaşıldı.');
      } catch (error) {
        toast.error('Tarama paylaşımı sırasında hata oluştu.');
      }
    },
    [store.screeningData, store.currentScreening, user, toast]
  );

  const handleDownloadReport = useCallback(async (data: ScreeningResult) => {
    try {
      toast.info('Rapor hazırlanıyor...');
      await printService.generatePdf('#printable-report', `Disleksi_Tarama_${data.studentName}`, { action: 'download' });
    } catch {
      window.print();
    }
  }, [toast]);

  const handlePrintReport = useCallback(() => {
    window.print();
  }, []);

  const handleAddToWorkbook = useCallback((data: ScreeningResult) => {
    if (options?.onAddToWorkbook) {
      options.onAddToWorkbook(data);
      toast.success(`${data.studentName} sonuçları çalışma kitabına eklendi.`);
      return;
    }

    toast.error('Çalışma kitabına ekleme yapılamadı.');
  }, [options, toast]);

  const getScoreColor = (score: number): string => {
    // Yüksek skor = yüksek risk (semptom sıklığı)
    if (score >= 70) return 'text-rose-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getRiskBadgeClasses = (level: string): string => {
    switch (level) {
      case 'low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'medium':
      case 'moderate': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
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
    toast.info('Eğitim planı oluşturuluyor...');
  }, [toast]);

  const handleOpenScreeningDetail = useCallback((screening: ScreeningResult) => {
    store.setCurrentScreening(screening);
    store.setActiveView('result-detail');
  }, []);

  return {
    ...store,
    filteredData,
    handleStartScreening,
    handleStartCognitiveBattery,
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
