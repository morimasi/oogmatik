import React from 'react';
import type { SectionHeaderProps } from '../../types';

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    icon,
    description,
    action,
}) => (
    <div className="flex items-center justify-between mb-5">
        <div>
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                {icon && <i className={`fa-solid ${icon} text-[var(--accent-color)]`} />}
                {title}
            </h3>
            {description && (
                <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider">{description}</p>
            )}
        </div>
        {action && <div>{action}</div>}
    </div>
);
