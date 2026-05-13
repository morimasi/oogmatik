import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface ScreeningStatsCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  sublabel?: string;
  color?: string;
  iconBg?: string;
}

export const ScreeningStatsCard: React.FC<ScreeningStatsCardProps> = ({
  icon: Icon,
  value,
  label,
  sublabel,
  color = 'text-blue-500',
  iconBg = 'bg-blue-500/10',
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[var(--bg-paper)] p-4 rounded-xl border border-[var(--border-color)] shadow-sm"
  >
    <div className="flex items-center justify-between mb-2">
      <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      {sublabel && (
        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
          {sublabel}
        </span>
      )}
    </div>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5">
      {label}
    </p>
  </motion.div>
);
