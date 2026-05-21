import { ScreeningResult, ScreeningProfile } from '../types/screening';

/**
 * Tarama ve analiz hizmetleri
 * Veritabanı işlemleri ve veri yönetimi
 */
export class ScreeningService {
  /**
   * Tarama sonucunu kaydet
   */
  static async saveScreeningResult(result: ScreeningResult): Promise<string> {
    try {
      // Firebase veya diğer veritabanı implementation
      const response = await fetch('/api/screening/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      });
      
      if (!response.ok) {
        throw new Error('Tarama kaydedilemedi');
      }
      
      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Tarama kaydetme hatası:', error);
      throw error;
    }
  }

  /**
   * Öğrencinin tarama geçmişini getir
   */
  static async getStudentScreeningHistory(studentId: string): Promise<ScreeningResult[]> {
    try {
      const response = await fetch(`/api/screening/student/${studentId}`);
      if (!response.ok) {
        throw new Error('Tarama geçmişi alınamadı');
      }
      return await response.json();
    } catch (error) {
      console.error('Tarama geçmişi hatası:', error);
      return [];
    }
  }

  /**
   * Tüm tarama sonuçlarını getir (admin/teacher için)
   */
  static async getAllScreeningResults(filters?: {
    status?: string;
    riskLevel?: string;
    dateRange?: { start: Date; end: Date };
  }): Promise<ScreeningResult[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.riskLevel) queryParams.append('riskLevel', filters.riskLevel);
      if (filters?.dateRange) {
        queryParams.append('startDate', filters.dateRange.start.toISOString());
        queryParams.append('endDate', filters.dateRange.end.toISOString());
      }

      const response = await fetch(`/api/screening/all?${queryParams}`);
      if (!response.ok) {
        throw new Error('Tarama sonuçları alınamadı');
      }
      return await response.json();
    } catch (error) {
      console.error('Tarama sonuçları hatası:', error);
      return [];
    }
  }

  /**
   * Tarama sonucunu güncelle
   */
  static async updateScreeningResult(id: string, updates: Partial<ScreeningResult>): Promise<void> {
    try {
      const response = await fetch(`/api/screening/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Tarama güncellenemedi');
      }
    } catch (error) {
      console.error('Tarama güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Tarama sonucunu arşivle
   */
  static async archiveScreeningResult(id: string): Promise<void> {
    return this.updateScreeningResult(id, { status: 'archived' });
  }

  /**
   * Tarama sonucunu sil
   */
  static async deleteScreeningResult(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/screening/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Tarama silinemedi');
      }
    } catch (error) {
      console.error('Tarama silme hatası:', error);
      throw error;
    }
  }

  /**
   * Tarama sonuçlarını analiz et
   */
  static generateAnalytics(results: ScreeningResult[]): {
    totalScreenings: number;
    riskDistribution: Record<string, number>;
    averageScores: Record<string, number>;
    trends: {
      monthly: Array<{ month: string; count: number; avgScore: number }>;
      riskLevels: Array<{ date: string; levels: Record<string, number> }>;
    };
  } {
    const totalScreenings = results.length;
    const riskDistribution = results.reduce((acc, result) => {
      acc[result.riskLevel] = (acc[result.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageScores = {
      overall: results.reduce((sum, r) => sum + r.overallScore, 0) / totalScreenings,
      reading: results.reduce((sum, r) => sum + r.detailedResults.reading, 0) / totalScreenings,
      writing: results.reduce((sum, r) => sum + r.detailedResults.writing, 0) / totalScreenings,
      attention: results.reduce((sum, r) => sum + r.detailedResults.attention, 0) / totalScreenings,
      memory: results.reduce((sum, r) => sum + r.detailedResults.memory, 0) / totalScreenings,
      visual: results.reduce((sum, r) => sum + r.detailedResults.visual, 0) / totalScreenings,
      auditory: results.reduce((sum, r) => sum + r.detailedResults.auditory, 0) / totalScreenings,
    };

    // Monthly trends
    const monthlyData = results.reduce((acc, result) => {
      const month = result.date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' });
      if (!acc[month]) {
        acc[month] = { count: 0, totalScore: 0 };
      }
      acc[month].count++;
      acc[month].totalScore += result.overallScore;
      return acc;
    }, {} as Record<string, { count: number; totalScore: number }>);

    const monthly = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      count: data.count,
      avgScore: data.totalScore / data.count,
    }));

    return {
      totalScreenings,
      riskDistribution,
      averageScores,
      trends: {
        monthly,
        riskLevels: [], // Implement as needed
      },
    };
  }

  /**
   * PDF raporu oluştur
   */
  static async generatePDFReport(result: ScreeningResult): Promise<Blob> {
    try {
      const response = await fetch('/api/screening/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      });
      
      if (!response.ok) {
        throw new Error('PDF oluşturulamadı');
      }
      
      return await response.blob();
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      throw error;
    }
  }

  /**
   * Tarama sonuçlarını paylaş
   */
  static async shareScreeningResult(id: string, recipientEmail: string, message?: string): Promise<void> {
    try {
      const response = await fetch('/api/screening/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          screeningId: id,
          recipientEmail,
          message,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Tarama paylaşılamadı');
      }
    } catch (error) {
      console.error('Tarama paylaşma hatası:', error);
      throw error;
    }
  }
}
