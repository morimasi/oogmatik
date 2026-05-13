import { motion } from 'framer-motion';
import { CATEGORY_LABELS } from '../../../../data/screeningQuestions';
import type { EvaluationCategory } from '../../../../types/screening';

interface CategoryScoreCardProps {
  category: EvaluationCategory;
  score: number;
  riskLabel: string;
  findings?: string[];
  index?: number;
}

export const CategoryScoreCard: React.FC<CategoryScoreCardProps> = ({
  category,
  score,
  riskLabel,
  findings = [],
  index = 0,
}) => {
  const isHighRisk = score >= 65;
  const isModerate = score >= 35 && score < 65;
  const borderColor = isHighRisk ? 'border-rose-500' : isModerate ? 'border-amber-500' : 'border-emerald-500';
  const textColor = isHighRisk ? 'text-rose-500' : isModerate ? 'text-amber-500' : 'text-emerald-500';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`p-5 rounded-2xl border-l-8 ${borderColor} bg-[var(--bg-paper)] border border-[var(--border-color)] shadow-sm transition-transform hover:scale-[1.01]`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-tight truncate">
            {CATEGORY_LABELS[category] || category}
          </h4>
          <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1 uppercase tracking-widest">
            {riskLabel}
          </p>
          {findings.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {findings.slice(0, 2).map((f, i) => (
                <p key={i} className="text-[10px] text-[var(--text-muted)] opacity-70 truncate">
                  • {f}
                </p>
              ))}
            </div>
          )}
        </div>
        <div className="text-right ml-4 shrink-0">
          <span className={`text-2xl font-black italic ${textColor}`}>
            %{score}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
