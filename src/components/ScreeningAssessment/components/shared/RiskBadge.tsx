import { motion } from 'framer-motion';

interface RiskBadgeProps {
  level?: 'low' | 'medium' | 'moderate' | 'high' | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const config: Record<string, { bg: string; text: string; border: string; label: string }> = {
  low: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', label: 'Düşük Risk' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', label: 'Orta Risk' },
  moderate: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', label: 'Orta Risk' },
  high: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', label: 'Yüksek Risk' },
};

const defaultConfig = {
  bg: 'bg-zinc-500/10',
  text: 'text-zinc-500',
  border: 'border-zinc-500/20',
  label: 'Belirsiz',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[8px]',
  md: 'px-3 py-1 text-[10px]',
  lg: 'px-4 py-1.5 text-xs',
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level = 'low', size = 'md', showLabel = true }) => {
  const safeLevel = (level || 'low').toLowerCase();
  const c = config[safeLevel] || defaultConfig;
  const isHigh = safeLevel === 'high';
  const isMedium = safeLevel === 'medium' || safeLevel === 'moderate';

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 font-black uppercase tracking-widest rounded-full border ${c.bg} ${c.text} ${c.border} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-rose-500 animate-pulse' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      {showLabel && c.label}
    </motion.span>
  );
};
