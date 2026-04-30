// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import { StudentBadge, ACHIEVEMENT_DEFINITIONS } from '../../types/gamification';
import { Award } from 'lucide-react';

interface BadgesSectionProps {
  earnedBadges: StudentBadge[];
}

export const BadgesSection = ({ earnedBadges }: BadgesSectionProps) => {
  const earnedIds = new Set(earnedBadges.map((b: StudentBadge) => b.badgeId));

  return (
    <div className="bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/20 dark:border-white/10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl mr-3">
            <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="font-lexend font-medium text-gray-800 dark:text-gray-100">Rozetlerim ve Başarımlarım</h3>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-full">
          {earnedBadges.length} / {ACHIEVEMENT_DEFINITIONS.length}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {ACHIEVEMENT_DEFINITIONS.map((achievement, index) => {
          const isEarned = earnedIds.has(achievement.id);
          const earnedInfo = earnedBadges.find((b: StudentBadge) => b.badgeId === achievement.id);

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <div className={`
                aspect-square rounded-2xl flex flex-col items-center justify-center p-4 transition-all duration-300
                ${isEarned 
                  ? 'bg-gradient-to-br from-white to-gray-50 dark:from-white/10 dark:to-white/5 shadow-md border-b-4 border-amber-400 group-hover:shadow-amber-400/20 group-hover:-translate-y-1' 
                  : 'bg-gray-100/50 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/10 grayscale opacity-40'
                }
              `}>
                <span className="text-4xl mb-3 filter drop-shadow-sm group-hover:scale-110 transition-transform">
                  {achievement.icon}
                </span>
                <p className={`text-[10px] font-lexend font-bold text-center leading-tight
                  ${isEarned ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500'}
                `}>
                  {achievement.title}
                </p>

                {isEarned && (
                  <div className="absolute -top-1 -right-1 bg-amber-400 text-white p-1 rounded-full shadow-sm">
                    <svg className="w-2 h-2 fill-current" viewBox="0 0 20 20">
                      <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Tooltip on Hover */}
              <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center shadow-xl">
                <p className="font-bold mb-1">{achievement.title}</p>
                <p className="opacity-80">{achievement.description}</p>
                {isEarned && earnedInfo && (
                  <p className="mt-1 text-amber-400 font-medium">
                    {new Date(earnedInfo.earnedAt).toLocaleDateString('tr-TR')}
                  </p>
                )}
                {!isEarned && (
                  <p className="mt-1 text-gray-400 italic">Kilitli</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
