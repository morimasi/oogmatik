import type { ScreeningResult, EvaluationCategory } from '../../../types/screening';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../../data/screeningQuestions';
import { useToastStore } from '../../../store/useToastStore';
import { AppError } from '../../../utils/AppError';

const API_BASE = '/api/screening';

export const screeningDataService = {
  async fetchStudentHistory(studentId: string): Promise<ScreeningResult[]> {
    try {
      const response = await fetch(`${API_BASE}/student/${studentId}`);
      if (!response.ok) throw new AppError('Geçmiş alınamadı', 'API_ERROR', response.status);
      return await response.json();
    } catch {
      return [];
    }
  },

  async fetchAll(filters?: {
    status?: string;
    riskLevel?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ScreeningResult[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.riskLevel) params.set('riskLevel', filters.riskLevel);
      if (filters?.startDate) params.set('startDate', filters.startDate);
      if (filters?.endDate) params.set('endDate', filters.endDate);

      const response = await fetch(`${API_BASE}/all?${params}`);
      if (!response.ok) throw new AppError('Sonuçlar alınamadı', 'API_ERROR', response.status);
      return await response.json();
    } catch {
      return [];
    }
  },

  async saveResult(result: ScreeningResult): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      if (!response.ok) throw new AppError('Kaydedilemedi', 'API_ERROR', response.status);
      const data = await response.json();
      useToastStore.getState().addToast('Tarama başarıyla kaydedildi.', 'success');
      return data.id;
    } catch (error) {
      useToastStore.getState().addToast('Tarama kaydedilemedi.', 'error');
      return null;
    }
  },

  async updateResult(id: string, updates: Partial<ScreeningResult>): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new AppError('Güncellenemedi', 'API_ERROR', response.status);
      useToastStore.getState().addToast('Tarama güncellendi.', 'success');
      return true;
    } catch {
      useToastStore.getState().addToast('Güncelleme başarısız.', 'error');
      return false;
    }
  },

  async deleteResult(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new AppError('Silinemedi', 'API_ERROR', response.status);
      useToastStore.getState().addToast('Tarama silindi.', 'success');
      return true;
    } catch {
      useToastStore.getState().addToast('Silme başarısız.', 'error');
      return false;
    }
  },

  async shareResult(id: string, recipientEmail: string, message?: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screeningId: id, recipientEmail, message }),
      });
      if (!response.ok) throw new AppError('Paylaşılamadı', 'API_ERROR', response.status);
      useToastStore.getState().addToast('Rapor paylaşıldı.', 'success');
      return true;
    } catch {
      useToastStore.getState().addToast('Paylaşım başarısız.', 'error');
      return false;
    }
  },

  async generatePdf(result: ScreeningResult): Promise<Blob | null> {
    try {
      const response = await fetch(`${API_BASE}/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      if (!response.ok) throw new AppError('PDF oluşturulamadı', 'API_ERROR', response.status);
      return await response.blob();
    } catch {
      useToastStore.getState().addToast('PDF oluşturulamadı.', 'error');
      return null;
    }
  },

  getMockData(): ScreeningResult[] {
    return [
      {
        id: 's1', studentId: 'st-1', studentName: 'Ali Yılmaz', age: 9, grade: '3',
        date: new Date('2024-01-15'), totalScore: 75, overallScore: 75,
        riskLevel: 'medium', status: 'completed',
        recommendations: ['Dikkat egzersizleri', 'Okuma pratiği'],
        strengths: ['Görsel algı', 'Mantıksal düşünme'],
        weaknesses: ['Fonolojik farkındalık', 'Hızlı okuma'],
        categoryScores: {
          reading: { score: 65, rawScore: 13, maxScore: 20, riskLevel: 'moderate', riskLabel: 'Orta Risk', findings: ['Okuma hızı düşük'], color: 'yellow' },
          writing: { score: 70, rawScore: 14, maxScore: 20, riskLevel: 'low', riskLabel: 'Düşük Risk', findings: ['Yazım ok'], color: 'green' },
          language: { score: 80, rawScore: 16, maxScore: 20, riskLevel: 'low', riskLabel: 'Düşük Risk', findings: [], color: 'green' },
          motor_spatial: { score: 75, rawScore: 15, maxScore: 20, riskLevel: 'low', riskLabel: 'Düşük Risk', findings: [], color: 'green' },
          attention: { score: 80, rawScore: 16, maxScore: 20, riskLevel: 'low', riskLabel: 'Düşük Risk', findings: [], color: 'green' },
          math: { score: 78, rawScore: 16, maxScore: 20, riskLevel: 'low', riskLabel: 'Düşük Risk', findings: [], color: 'green' },
        },
        detailedResults: { reading: 65, writing: 70, attention: 80, memory: 75, visual: 85, auditory: 70 },
        aiAnalysis: 'Öğrenci genel olarak ortalama performans gösteriyor. Okuma alanında hafif destek önerilir.',
        generatedAt: '2024-01-15T10:00:00Z', respondentRole: 'teacher',
      },
      {
        id: 's2', studentId: 'st-2', studentName: 'Ayşe Demir', age: 8, grade: '2',
        date: new Date('2024-01-20'), totalScore: 42, overallScore: 42,
        riskLevel: 'high', status: 'completed',
        recommendations: ['Yoğun destek', 'Bireysel eğitim planı'],
        strengths: ['Sosyal beceriler'],
        weaknesses: ['Okuma hızı', 'Yazım becerileri', 'Dikkat süresi'],
        categoryScores: {
          reading: { score: 35, rawScore: 7, maxScore: 20, riskLevel: 'high', riskLabel: 'Yüksek Risk', findings: ['Okuma çok yavaş'], color: 'red' },
          writing: { score: 30, rawScore: 6, maxScore: 20, riskLevel: 'high', riskLabel: 'Yüksek Risk', findings: ['Yazım zorluğu'], color: 'red' },
          language: { score: 45, rawScore: 9, maxScore: 20, riskLevel: 'moderate', riskLabel: 'Orta Risk', findings: ['Anlama sorunları'], color: 'yellow' },
          motor_spatial: { score: 50, rawScore: 10, maxScore: 20, riskLevel: 'moderate', riskLabel: 'Orta Risk', findings: ['Motor beceri zayıf'], color: 'yellow' },
          attention: { score: 40, rawScore: 8, maxScore: 20, riskLevel: 'high', riskLabel: 'Yüksek Risk', findings: ['Dikkat süresi kısa'], color: 'red' },
          math: { score: 38, rawScore: 8, maxScore: 20, riskLevel: 'high', riskLabel: 'Yüksek Risk', findings: ['Matematik zayıf'], color: 'red' },
        },
        detailedResults: { reading: 35, writing: 30, attention: 40, memory: 50, visual: 55, auditory: 45 },
        aiAnalysis: 'Öğrenci yoğun destek ihtiyacı duymaktadır. Özel eğitim planı önerilir.',
        generatedAt: '2024-01-20T14:30:00Z', respondentRole: 'teacher',
      },
      {
        id: 's3', studentId: 'st-3', studentName: 'Mehmet Can Kaya', age: 10, grade: '4',
        date: new Date('2024-02-01'), totalScore: 82, overallScore: 82,
        riskLevel: 'low', status: 'completed',
        recommendations: ['Mevcut başarıyı koruma', 'Zenginleştirme aktiviteleri'],
        strengths: ['Matematik', 'Okuduğunu anlama', 'Dikkat'],
        weaknesses: [],
        categoryScores: {
          reading: { score: 85, rawScore: 17, maxScore: 20, riskLevel: 'low', riskLabel: 'Düşük Risk', findings: [], color: 'green' },
          writing: { score: 80, rawScore: 16, maxScore: 20, riskLevel: 'low', riskLabel: 'Düşük Risk', findings: [], color: 'green' },
          language: { score: 82, rawScore: 16, maxScore: 20, riskLevel: 'low', riskLabel: 'Düşük Risk', findings: [], color: 'green' },
          motor_spatial: { score: 78, rawScore: 15, maxScore: 20, riskLevel: 'low', riskLabel: 'Düşük Risk', findings: [], color: 'green' },
          attention: { score: 88, rawScore: 18, maxScore: 20, riskLevel: 'low', riskLabel: 'Düşük Risk', findings: [], color: 'green' },
          math: { score: 90, rawScore: 18, maxScore: 20, riskLevel: 'low', riskLabel: 'Düşük Risk', findings: [], color: 'green' },
        },
        detailedResults: { reading: 85, writing: 80, attention: 88, memory: 82, visual: 78, auditory: 80 },
        aiAnalysis: 'Öğrenci yaşıtlarına göre iyi düzeyde performans gösteriyor.',
        generatedAt: '2024-02-01T09:00:00Z', respondentRole: 'teacher',
      },
    ];
  },

  computeAnalytics(results: ScreeningResult[]) {
    const total = results.length;
    if (total === 0) return null;

    const riskDistribution: Record<string, number> = {};
    const categoryTotals: Partial<Record<EvaluationCategory, { sum: number; count: number }>> = {};

    results.forEach((r) => {
      riskDistribution[r.riskLevel] = (riskDistribution[r.riskLevel] || 0) + 1;

      (Object.keys(r.categoryScores) as EvaluationCategory[]).forEach((cat) => {
        const data = r.categoryScores[cat];
        if (data) {
          if (!categoryTotals[cat]) categoryTotals[cat] = { sum: 0, count: 0 };
          categoryTotals[cat]!.sum += data.score;
          categoryTotals[cat]!.count += 1;
        }
      });
    });

    const categoryAverages = {} as Record<EvaluationCategory, number>;
    (Object.keys(categoryTotals) as EvaluationCategory[]).forEach((cat) => {
      const t = categoryTotals[cat]!;
      categoryAverages[cat] = Math.round(t.sum / t.count);
    });

    const monthlyMap: Record<string, { count: number; totalScore: number }> = {};
    results.forEach((r) => {
      const month = r.date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' });
      if (!monthlyMap[month]) monthlyMap[month] = { count: 0, totalScore: 0 };
      monthlyMap[month].count++;
      monthlyMap[month].totalScore += r.overallScore;
    });
    const monthly = Object.entries(monthlyMap).map(([month, d]) => ({
      month,
      count: d.count,
      avgScore: Math.round(d.totalScore / d.count),
    }));

    const overallAvg = results.reduce((s, r) => s + r.overallScore, 0) / total;

    return { total, riskDistribution, categoryAverages, monthly, overallAvg };
  },
};
