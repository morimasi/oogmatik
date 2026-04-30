import { ActivityType, CognitiveErrorTag } from './activity';
import { Difficulty } from './common';
import { StudentBadge } from './gamification';

/**
 * Aktivite tamamlama detayı
 * Öğrencinin bir aktiviteyi bitirdiğinde kaydedilen ham veri
 */
export interface ActivityCompletion {
  id: string;
  studentId: string;
  activityType: ActivityType;
  timestamp: string; // ISO 8601
  duration: number; // saniye cinsinden
  score: number; // 0-100 arası başarı puanı
  difficulty: Difficulty;
  
  // Hata analizi (Dr. Ahmet Kaya klinik onayı için)
  errors: {
    tag: CognitiveErrorTag;
    count: number;
    description?: string;
  }[];
  
  // Hedef beceriler (Analiz için)
  targetSkills: string[];
  
  // Pedagojik gözlem (Elif Yıldız)
  pedagogicalObservation?: string;
  
  // Otomatik üretilen AI analizi (Selin Arslan)
  aiAnalysis?: string;
}

/**
 * Beceri bazlı puanlama
 * Radar grafik için veri yapısı
 */
export interface SkillScore {
  category: string; // e.g., "Görsel Algı", "Okuma Hızı", "Mantık"
  score: number; // 0-100 ortalama
  trend: 'up' | 'down' | 'stable';
  totalActivities: number;
  lastTested: string;
}

/**
 * Haftalık ilerleme özeti
 */
export interface WeeklyProgress {
  weekStarting: string; // ISO 8601 (Pazartesi)
  totalDuration: number; // Toplam çalışma süresi (dakika)
  completedActivities: number;
  averageScore: number;
  topSkill: string;
  strugglingSkill?: string;
}

/**
 * Dashboard için ana ilerleme snapshot'ı
 */
export interface StudentProgressSnapshot {
  studentId: string;
  overallScore: number;
  totalTimeSpent: number; // Saat cinsinden
  activitiesCompleted: number;
  
  // Grafik verileri
  skillDistribution: SkillScore[];
  weeklyActivity: {
    day: string; // e.g., "Pzt", "Sal"
    count: number;
  }[];
  
  // Geçmiş listesi
  recentActivities: ActivityCompletion[];
  
  // Kazanımlar ve Rozetler (Faz 4.2)
  achievements: StudentBadge[];
  
  lastUpdated: string;
}

/**
 * Firestore Koleksiyon Yapısı:
 * /students/{studentId}/progress_history/{completionId} -> ActivityCompletion
 * /students/{studentId}/progress_summary/current -> StudentProgressSnapshot
 */
