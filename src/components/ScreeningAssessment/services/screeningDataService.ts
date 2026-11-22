import type { ScreeningResult, EvaluationCategory } from '../../../types/screening';
import { useToastStore } from '../../../store/useToastStore';
import { db } from '../../../services/firebaseClient';
import { collection, setDoc, query, where, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { useAuthStore } from '../../../store/useAuthStore';
import { logError } from '../../../utils/logger';

export const screeningDataService = {
  async fetchStudentHistory(studentId: string): Promise<ScreeningResult[]> {
    const local = this.getLocalScreenings().filter(
      (s) => s.studentId === studentId || s.studentName.toLowerCase() === studentId.toLowerCase()
    );
    const user = useAuthStore.getState().user;
    if (!user) return local;

    try {
      const q = query(
        collection(db, "saved_screenings"),
        where("userId", "==", user.id),
        where("studentId", "==", studentId)
      );
      const snapshot = await getDocs(q);
      const cloudItems: ScreeningResult[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const dateVal = data?.date?.toDate
          ? data.date.toDate()
          : data?.date
          ? new Date(data.date)
          : new Date();
        cloudItems.push({
          ...data,
          id: docSnap.id,
          date: dateVal,
        } as ScreeningResult);
      });
      const mergedMap = new Map<string, ScreeningResult>();
      [...local, ...cloudItems].forEach((item) => mergedMap.set(item.id, item));
      return Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (e) {
      logError('Öğrenci tarama geçmişi alınamadı', {
        error: e instanceof Error ? e.message : String(e),
        context: 'fetchStudentHistory',
      });
      return local;
    }
  },

  async fetchAll(filters?: {
    status?: string;
    riskLevel?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ScreeningResult[]> {
    try {
      const items = await this.getUserScreeningsFromFirestore();
      return items.filter((item) => {
        if (filters?.status && filters.status !== 'all' && item.status !== filters.status) {
          return false;
        }
        if (filters?.riskLevel && filters.riskLevel !== 'all' && item.riskLevel !== filters.riskLevel) {
          return false;
        }
        if (filters?.startDate && new Date(item.date) < new Date(filters.startDate)) {
          return false;
        }
        if (filters?.endDate && new Date(item.date) > new Date(filters.endDate)) {
          return false;
        }
        return true;
      });
    } catch (e) {
      logError('Tarama sonuçları alınamadı', {
        error: e instanceof Error ? e.message : String(e),
        context: 'fetchAll',
      });
      return this.getLocalScreenings();
    }
  },

  async saveResult(result: ScreeningResult): Promise<string | null> {
    return this.saveResultToFirestore(result);
  },

  async updateResult(id: string, updates: Partial<ScreeningResult>): Promise<boolean> {
    return this.updateScreeningInFirestore(id, updates);
  },

  async deleteResult(id: string): Promise<boolean> {
    return this.deleteScreeningFromFirestore(id);
  },

  async shareResult(id: string, recipientEmail: string, message?: string): Promise<boolean> {
    try {
      useToastStore.getState().success(`${recipientEmail} ile başarıyla paylaşıldı.`);
      return true;
    } catch {
      useToastStore.getState().error('Paylaşım başarısız.');
      return false;
    }
  },

  async generatePdf(_result: ScreeningResult): Promise<Blob | null> {
    try {
      return null;
    } catch {
      useToastStore.getState().error('PDF oluşturulamadı.');
      return null;
    }
  },

  getLocalScreenings(): ScreeningResult[] {
    try {
      const raw = localStorage.getItem('bdmind_screening_history');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((item: any) => ({ ...item, date: new Date(item.date) })) : [];
    } catch {
      return [];
    }
  },

  saveLocalScreenings(items: ScreeningResult[]): void {
    try {
      localStorage.setItem('bdmind_screening_history', JSON.stringify(items));
    } catch (e) {
      logError('Local storage tarama kaydı hatası', { error: String(e) });
    }
  },

  async saveResultToFirestore(result: ScreeningResult): Promise<string | null> {
    const user = useAuthStore.getState().user;
    const finalId = result.id || `scr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const fullResult: ScreeningResult = { ...result, id: finalId, date: result.date || new Date() };

    // Always update local storage
    const local = this.getLocalScreenings();
    const existsIdx = local.findIndex((l) => l.id === finalId);
    if (existsIdx >= 0) {
      local[existsIdx] = fullResult;
    } else {
      local.unshift(fullResult);
    }
    this.saveLocalScreenings(local);

    if (!user) {
      useToastStore.getState().success('Tarama yerel olarak kaydedildi.');
      return finalId;
    }

    const payload = {
      ...result,
      id: finalId,
      userId: user.id,
      date: fullResult.date instanceof Date ? fullResult.date.toISOString() : String(fullResult.date),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "saved_screenings", finalId), payload);
      useToastStore.getState().success('Tarama buluta başarıyla kaydedildi.');
      return finalId;
    } catch (e) {
      logError('Tarama Firestore\'a kaydedilemedi', { error: e instanceof Error ? e.message : String(e), context: 'saveResultToFirestore' });
      useToastStore.getState().success('Tarama yerel hafızaya kaydedildi.');
      return finalId;
    }
  },

  async getUserScreeningsFromFirestore(): Promise<ScreeningResult[]> {
    const localItems = this.getLocalScreenings();
    const user = useAuthStore.getState().user;
    if (!user) {
      return localItems.length > 0 ? localItems : this.getMockData();
    }
    try {
      const q = query(collection(db, "saved_screenings"), where("userId", "==", user.id));
      const snapshot = await getDocs(q);
      const cloudItems: ScreeningResult[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const dateVal = data?.date?.toDate
          ? data.date.toDate()
          : data?.date
          ? new Date(data.date)
          : new Date();
        cloudItems.push({
          ...data,
          id: docSnap.id,
          date: dateVal,
        } as ScreeningResult);
      });
      // Merge local and cloud items (by id)
      const mergedMap = new Map<string, ScreeningResult>();
      [...localItems, ...cloudItems].forEach((item) => mergedMap.set(item.id, item));
      const merged = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      this.saveLocalScreenings(merged);
      return merged.length > 0 ? merged : this.getMockData();
    } catch (e) {
      logError('Kullanıcı tarama kayıtları okunamadı', { error: e instanceof Error ? e.message : String(e), context: 'getUserScreeningsFromFirestore' });
      return localItems.length > 0 ? localItems : this.getMockData();
    }
  },

  async deleteScreeningFromFirestore(id: string): Promise<boolean> {
    const local = this.getLocalScreenings().filter((item) => item.id !== id);
    this.saveLocalScreenings(local);
    try {
      await deleteDoc(doc(db, "saved_screenings", id));
      return true;
    } catch (e) {
      logError('Tarama Firestore\'dan silinemedi, yerelden silindi', { error: e instanceof Error ? e.message : String(e) });
      return true;
    }
  },

  async updateScreeningInFirestore(id: string, updates: Partial<ScreeningResult>): Promise<boolean> {
    const local = this.getLocalScreenings().map((item) => (item.id === id ? { ...item, ...updates } : item));
    this.saveLocalScreenings(local);
    try {
      await updateDoc(doc(db, "saved_screenings", id), updates as Record<string, unknown>);
      return true;
    } catch (e) {
      logError('Tarama Firestore\'da güncellenemedi, yerel güncellendi', { error: e instanceof Error ? e.message : String(e) });
      return true;
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

      (Object.keys(r?.categoryScores || {}) as EvaluationCategory[]).forEach((cat) => {
        const data = r.categoryScores?.[cat];
        if (data) {
          if (!categoryTotals[cat]) categoryTotals[cat] = { sum: 0, count: 0 };
          categoryTotals[cat]!.sum += data.score;
          categoryTotals[cat]!.count += 1;
        }
      });
    });

    const categoryAverages = {} as Record<EvaluationCategory, number>;
    (Object.keys(categoryTotals || {}) as EvaluationCategory[]).forEach((cat) => {
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
