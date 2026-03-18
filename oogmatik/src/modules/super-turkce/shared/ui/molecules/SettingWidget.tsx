import React from 'react';
import { SuperTypography, SuperBadge } from '../atoms';

interface SettingWidgetProps {
    label: string;
    description?: string;
    icon?: React.ReactNode;
    badge?: string;
    children: React.ReactNode;
    className?: string;
}

/**
 * SettingWidget - Kokpit (Studio) içindeki ayar grupları için kullanılan molekül.
 */
export const SettingWidget: React.FC<SettingWidgetProps> = ({
    label,
    description,
    icon,
    badge,
    children,
    className = ''
}) => {
    return (
        <div className={`group bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 hover:border-indigo-500/30 transition-all duration-300 ${className}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                            {icon}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <SuperTypography variant="caption" weight="semibold">
                                {label}
                            </SuperTypography>
                            {badge && <SuperBadge variant="primary">{badge}</SuperBadge>}
                        </div>
                        {description && (
                            <SuperTypography variant="caption" color="muted" className="mt-0.5">
                                {description}
                            </SuperTypography>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-2 text-zinc-300">
                {children}
            </div>
        </div>
    );
};

export default SettingWidget;
