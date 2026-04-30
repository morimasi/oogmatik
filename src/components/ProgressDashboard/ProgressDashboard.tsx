// @ts-nocheck
import React, { useEffect } from 'react';
import { useProgressStore } from '../../store/useProgressStore';
import { SkillOverview } from './SkillOverview';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { BadgesSection } from './BadgesSection';
import { HistoryList } from './HistoryList';
import { Trophy, Clock, Target, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProgressDashboardProps {
  studentId: string;
}

export const ProgressDashboard = ({ studentId }: ProgressDashboardProps) => {
  const { snapshot, isLoading, error, fetchProgress } = useProgressStore();

  useEffect(() => {
    if (studentId) {
      fetchProgress(studentId);
    }
  }, [studentId, fetchProgress]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center">
          <AlertCircle className="w-6 h-6 mr-3" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-12 text-gray-500">
        <p>Henüz ilerleme verisi bulunmuyor. Aktiviteleri tamamladıkça burada görüntülenecektir.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/20 dark:border-white/10 flex items-center"
        >
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg text-white mr-5">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Genel Başarı</p>
            <h2 className="font-lexend text-3xl font-bold text-gray-900 dark:text-white">{snapshot.overallScore}%</h2>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/20 dark:border-white/10 flex items-center"
        >
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg text-white mr-5">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Toplam Çalışma</p>
            <h2 className="font-lexend text-3xl font-bold text-gray-900 dark:text-white">{Math.round(snapshot.totalTimeSpent)} Saat</h2>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/20 dark:border-white/10 flex items-center"
        >
          <div className="bg-gradient-to-br from-emerald-400 to-teal-500 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg text-white mr-5">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Tamamlanan</p>
            <h2 className="font-lexend text-3xl font-bold text-gray-900 dark:text-white">{snapshot.activitiesCompleted}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Aktivite</p>
          </div>
        </motion.div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Graphs */}
        <div className="lg:col-span-2 space-y-8">
          <WeeklyActivityChart data={snapshot.weeklyActivity} />
          
          <div className="bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/20 dark:border-white/10">
            <h3 className="font-lexend font-medium text-gray-800 dark:text-gray-100 mb-6">Bilişsel Beceri Gelişimi</h3>
            <SkillOverview skills={snapshot.skillDistribution} />
          </div>

          <BadgesSection earnedBadges={snapshot.achievements || []} />
        </div>

        {/* Right Column - Timeline */}
        <div className="lg:col-span-1 h-full min-h-[500px]">
          <HistoryList history={snapshot.recentActivities} />
        </div>
      </div>
    </div>
  );
};
