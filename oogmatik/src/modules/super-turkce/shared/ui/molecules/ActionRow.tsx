import React from 'react';
import { SuperTypography } from '../atoms';

interface ActionRowProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

/**
 * ActionRow - Yatay kontrol ve bilgi satırı.
 * Genellikle listelerde veya ayar panellerinde kullanılır.
 */
export const ActionRow: React.FC<ActionRowProps> = ({
    title,
    description,
    action,
    icon,
    className = '',
    onClick
}) => {
    return (
        <div
            onClick={onClick}
            className={`
        flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 
        hover:bg-zinc-800/60 hover:border-zinc-700 transition-all duration-300
        ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''}
        ${className}
      `}
        >
            <div className="flex items-center gap-4">
                {icon && (
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400">
                        {icon}
                    </div>
                )}
                <div className="flex flex-col">
                    <SuperTypography variant="body" weight="semibold">
                        {title}
                    </SuperTypography>
                    {description && (
                        <SuperTypography variant="caption" color="muted">
                            {description}
                        </SuperTypography>
                    )}
                </div>
            </div>

            {action && (
                <div className="flex-shrink-0 ml-4">
                    {action}
                </div>
            )}
        </div>
    );
};

export default ActionRow;
