import React from 'react';
import { ActivityCompletion } from '../../types/progress';
import { ActivityType } from '../../types';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface HistoryListProps {
  history: ActivityCompletion[];
}

const getActivityLabel = (type: ActivityType): string => {
  // Basit etiketleme, genişletilebilir
  const map: Record<string, string> = {
    [ActivityType.DYSLEXIA_SUPPORT]: 'Disleksi Desteği',
    [ActivityType.MATH_STUDIO]: 'Matematik Stüdyosu',
    // Diğerleri için formatlama
  };
  return map[type] || String(type).replace('_', ' ');
};

export const HistoryList: React.FC<HistoryListProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/20 dark:border-white/10 h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Geçmişte yapılmış bir aktivite bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/20 dark:border-white/10 overflow-hidden flex flex-col h-full max-h-[500px]">
      <h3 className="font-lexend font-medium text-gray-800 dark:text-gray-100 mb-6">Son Aktiviteler</h3>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
        {history.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-6"
          >
            {/* Timeline Line */}
            {index !== history.length - 1 && (
              <div className="absolute left-[11px] top-8 bottom-[-24px] w-[2px] bg-gray-200 dark:bg-gray-700" />
            )}
            
            {/* Timeline Dot */}
            <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border-2 border-indigo-500 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
            </div>
            
            <div className="bg-white dark:bg-gray-800/80 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-lexend font-medium text-gray-800 dark:text-gray-100 capitalize">
                    {getActivityLabel(item.activityType)}
                  </h4>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 space-x-3">
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {Math.round(item.duration / 60)} dk</span>
                    <span>{new Date(item.timestamp).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    item.score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    item.score >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {item.score} Puan
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">{item.difficulty} Seviye</span>
                </div>
              </div>
              
              {/* Errors if any */}
              {item.errors && item.errors.length > 0 && (
                <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                  <div className="flex items-center text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                    <AlertCircle className="w-3 h-3 mr-1" /> Geliştirilebilir Alanlar
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.errors.map(err => (
                      <span key={err.tag} className="text-[10px] px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-red-200 dark:border-red-800 text-gray-600 dark:text-gray-300">
                        {err.tag} ({err.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
