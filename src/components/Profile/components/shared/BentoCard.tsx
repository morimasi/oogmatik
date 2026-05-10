import React from 'react';
import type { BentoCardProps } from '../../types';

export const BentoCard: React.FC<BentoCardProps> = ({
    children,
    className = '',
    title,
    icon,
    iconColor = 'bg-[var(--bg-secondary)] text-[var(--accent-color)]',
    action,
    compact = false,
}) => (
    <div
        className={`bg-[var(--bg-paper)] rounded-[2.5rem] border border-[var(--border-color)] shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition-all hover:shadow-[0_24px_64px_rgba(15,23,42,0.1)] ${compact ? 'p-4' : 'p-6'
            } ${className}`}
    >
        {(title || action) && (
            <div className={`flex items-center justify-between ${compact ? 'mb-3' : 'mb-5'}`}>
                {title && (
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${iconColor}`}>
                                <i className={`fa-solid ${icon} text-sm`} />
                            </div>
                        )}
                        <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.15em]">
                            {title}
                        </h3>
                    </div>
                )}
                {action && <div>{action}</div>}
            </div>
        )}
        {children}
    </div>
);
