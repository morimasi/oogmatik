import React from 'react';
import { SuperTypography } from '../atoms';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
    className?: string;
}

/**
 * StatCard - İstatistik ve metrik gösterimi için premium molekül.
 */
export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    icon,
    trend,
    trendUp,
    className = ''
}) => {
    return (
        <div className={`p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-indigo-500/30 transition-all duration-300 group ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                {trend && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                        {trendUp ? <i className="fa-solid fa-arrow-trend-up mr-1 text-[9px]"></i> : null}
                        {trend}
                    </span>
                )}
            </div>

            <SuperTypography variant="caption" color="muted" weight="medium" className="uppercase tracking-wider">
                {label}
            </SuperTypography>

            <SuperTypography variant="h3" weight="bold" className="mt-1">
                {value}
            </SuperTypography>
        </div>
    );
};

export default StatCard;
