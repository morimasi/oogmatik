import React, { useEffect } from 'react';
import { useProgressStore } from '../../store/useProgressStore';
import { useAuthStore } from '../../store/useAuthStore';
import { SkillOverview } from './SkillOverview';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { BadgesSection } from './BadgesSection';
import { HistoryList } from './HistoryList';
import { Trophy, Clock, Target, AlertCircle, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { logError } from '../../utils/errorHandler';

interface ProgressDashboardProps {
  studentId: string;
}

export const ProgressDashboard = ({ studentId }: ProgressDashboardProps) => {
  const { user, isLoading: authLoading, loginWithGoogle } = useAuthStore();
  const { snapshot, isLoading: progressLoading, error, fetchProgress } = useProgressStore();

  useEffect(() => {
    if (studentId && user) {
      fetchProgress(studentId).catch((err: unknown) => {
        logError(err instanceof Error ? err : new Error(String(err)), { context: 'ProgressDashboard.fetchProgress', studentId });
      });
    }
  }, [studentId, user, fetchProgress]);

  if (authLoading || (progressLoading && !snapshot)) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center space-y-6">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600">
          <LogIn className="w-8 h-8" />
        </div>
        <div className="max-w-xs">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Oturum Gerekli</h3>
          <p className="text-sm text-gray-500 mt-2">Bu verilere erişmek için lütfen giriş yapınız.</p>
        </div>
        <button 
          onClick={() => loginWithGoogle()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg text-[10px] uppercase tracking-widest"
        >
          Google ile Giriş Yap
        </button>
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
    <div className="p-4 md:p-5 max-w-7xl mx-auto space-y-6">
      {/* Header & Stats Summary - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/20 dark:border-white/10 flex items-center shadow-sm"
        >
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-11 h-11 rounded-xl flex items-center justify-center shadow-lg text-white mr-4 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">Genel Başarı</p>
            <h2 className="font-lexend text-2xl font-black text-gray-900 dark:text-white leading-tight">{snapshot.overallScore}%</h2>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/20 dark:border-white/10 flex items-center shadow-sm"
        >
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-11 h-11 rounded-xl flex items-center justify-center shadow-lg text-white mr-4 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">Toplam Çalışma</p>
            <h2 className="font-lexend text-2xl font-black text-gray-900 dark:text-white leading-tight">{Math.round(snapshot.totalTimeSpent)} Saat</h2>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/20 dark:border-white/10 flex items-center shadow-sm"
        >
          <div className="bg-gradient-to-br from-emerald-400 to-teal-500 w-11 h-11 rounded-xl flex items-center justify-center shadow-lg text-white mr-4 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">Tamamlanan</p>
            <h2 className="font-lexend text-2xl font-black text-gray-900 dark:text-white leading-tight">{snapshot.activitiesCompleted} <span className="text-xs opacity-40">AKTİVİTE</span></h2>
          </div>
        </motion.div>
      </div>

      {/* Main Grid - Tighter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Graphs */}
        <div className="lg:col-span-2 space-y-6">
          <WeeklyActivityChart data={snapshot.weeklyActivity} />
          
          <div className="bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-white/20 dark:border-white/10 shadow-sm">
            <h3 className="font-lexend text-[11px] font-black uppercase tracking-widest text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
              Bilişsel Beceri Gelişimi
            </h3>
            <SkillOverview skills={snapshot.skillDistribution} />
          </div>

          <BadgesSection earnedBadges={snapshot.achievements || []} />
        </div>

        {/* Right Column - Timeline */}
        <div className="lg:col-span-1 h-full min-h-[400px]">
          <HistoryList history={snapshot.recentActivities} />
        </div>
      </div>
    </div>
  );
};
