import React from 'react';
import type { StatCardProps } from '../../types';

export const StatCard: React.FC<StatCardProps> = ({
    value,
    label,
    icon,
    trend,
    color = 'text-[var(--accent-color)]',
}) => (
    <div className="p-4 bg-[var(--bg-paper)] rounded-3xl border border-[var(--border-color)] transition-all hover:translate-y-[-2px] hover:shadow-lg group">
        <div className="flex items-start justify-between mb-2">
            {icon && (
                <div className="w-8 h-8 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent-color)] transition-colors">
                    <i className={`fa-solid ${icon} text-xs`} />
                </div>
            )}
            {trend && (
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${trend.direction === 'up' ? 'text-emerald-500' :
                        trend.direction === 'down' ? 'text-rose-500' : 'text-zinc-400'
                    }`}>
                    <i className={`fa-solid ${trend.direction === 'up' ? 'fa-arrow-trend-up' :
                            trend.direction === 'down' ? 'fa-arrow-trend-down' : 'fa-minus'
                        } text-[8px]`} />
                    <span>{trend.direction === 'stable' ? '—' : `${trend.value > 0 ? '+' : ''}${trend.value}`}</span>
                </div>
            )}
        </div>
        <p className={`text-2xl font-black ${color} tracking-tight`}>{value}</p>
        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-1">{label}</p>
    </div>
);
