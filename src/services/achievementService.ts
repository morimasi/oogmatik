import { 
  Achievement, 
  ACHIEVEMENT_DEFINITIONS, 
  StudentBadge 
} from '../types/gamification';
import { StudentProgressSnapshot } from '../types/progress';
import { logInfo } from '../utils/logger';

/**
 * OOGMATIK - Achievement Service
 * Başarım ve rozet mantığını yönetir
 */
export const achievementService = {
  /**
   * Öğrencinin ilerleme verisini analiz ederek yeni rozetleri belirler
   */
  checkAndAwardAchievements: (
    currentSnapshot: StudentProgressSnapshot,
    newEarnedBadges: StudentBadge[] = []
  ): StudentBadge[] => {
    const earnedBadgeIds = new Set(currentSnapshot.achievements?.map(a => a.badgeId) || []);
    const newlyAwarded: StudentBadge[] = [...newEarnedBadges];

    for (const definition of ACHIEVEMENT_DEFINITIONS) {
      if (earnedBadgeIds.has(definition.id)) continue;

      let isEligible = false;

      switch (definition.criteriaType) {
        case 'activity_count':
          if (currentSnapshot.activitiesCompleted >= definition.criteriaValue) {
            isEligible = true;
          }
          break;

        case 'perfect_score':
          // Son aktivite 100 puan mı?
          const latestActivity = currentSnapshot.recentActivities[0];
          if (latestActivity && latestActivity.score === definition.criteriaValue) {
            isEligible = true;
          }
          break;

        case 'subject_mastery':
          // İlgili kategorideki toplam aktivite sayısı
          const skill = currentSnapshot.skillDistribution.find(s => 
            s.category.toLowerCase().includes(definition.category.toLowerCase())
          );
          if (skill && skill.totalActivities >= definition.criteriaValue) {
            isEligible = true;
          }
          break;

        // Diğer kriterler (streak vb.) ileride eklenebilir
      }

      if (isEligible) {
        logInfo(`Başarım Kazanıldı: ${definition.title}`, { studentId: currentSnapshot.studentId, badgeId: definition.id });
        newlyAwarded.push({
          badgeId: definition.id,
          earnedAt: new Date().toISOString()
        });
      }
    }

    return newlyAwarded;
  }
};
