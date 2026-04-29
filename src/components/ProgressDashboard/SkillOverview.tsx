import React from 'react';
import { SkillScore } from '../../types/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface SkillOverviewProps {
  skills: SkillScore[];
}

export const SkillOverview: React.FC<SkillOverviewProps> = ({ skills }) => {
  if (!skills || skills.length === 0) {
    return (
      <div className="flex justify-center items-center h-48 bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10">
        <p className="text-gray-500 dark:text-gray-400">Henüz yetenek verisi bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {skills.map((skill, index) => (
        <motion.div 
          key={skill.category}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/20 dark:border-white/10"
        >
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-lexend font-medium text-gray-800 dark:text-gray-100">
              {skill.category}
            </h4>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">{skill.score}</span>
              {skill.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
              {skill.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
              {skill.trend === 'stable' && <Minus className="w-5 h-5 text-gray-400" />}
            </div>
          </div>
          
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${skill.score}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
            />
          </div>
          
          <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Toplam: {skill.totalActivities} aktivite</span>
            <span>Son test: {new Date(skill.lastTested).toLocaleDateString('tr-TR')}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
