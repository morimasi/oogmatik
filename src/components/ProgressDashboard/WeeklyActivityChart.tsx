import React from 'react';
import { motion } from 'framer-motion';

interface WeeklyActivity {
  day: string;
  count: number;
}

interface WeeklyActivityChartProps {
  data: WeeklyActivity[];
}

export const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ data }) => {
  // Demo verisi eğer boş ise
  const chartData = data && data.length > 0 ? data : [
    { day: 'Pzt', count: 0 },
    { day: 'Sal', count: 0 },
    { day: 'Çar', count: 0 },
    { day: 'Per', count: 0 },
    { day: 'Cum', count: 0 },
    { day: 'Cmt', count: 0 },
    { day: 'Paz', count: 0 },
  ];

  const maxCount = Math.max(...chartData.map(d => d.count), 10); // Minimum 10 baremi

  return (
    <div className="bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/20 dark:border-white/10 h-64 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-lexend font-medium text-gray-800 dark:text-gray-100">Haftalık Aktivite</h3>
      </div>
      
      <div className="flex-1 flex items-end justify-between space-x-2">
        {chartData.map((dayData, index) => {
          const heightPercent = Math.max((dayData.count / maxCount) * 100, 5); // min %5 yükseklik
          
          return (
            <div key={dayData.day} className="flex flex-col items-center flex-1 group">
              <div className="w-full relative flex justify-center items-end h-full mb-2">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs py-1 px-2 rounded-md whitespace-nowrap pointer-events-none z-10">
                  {dayData.count} Aktivite
                </div>
                
                {/* Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ duration: 0.8, delay: index * 0.05, ease: 'easeOut' }}
                  className="w-full max-w-[40px] bg-indigo-500/20 dark:bg-indigo-500/30 rounded-t-lg relative overflow-hidden"
                >
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-blue-400 opacity-80"
                  />
                </motion.div>
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {dayData.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
