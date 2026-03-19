import React from 'react';
import { SuperTypography, SuperBadge } from '../atoms';

interface SuperCardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    badge?: string;
    footer?: React.ReactNode;
    variant?: 'glass' | 'elevated' | 'outline' | 'ghost';
    className?: string;
    onClick?: () => void;
    hoverEffect?: boolean;
}

/**
 * SuperCard - Platformun temel içerik organizması.
 * Glassmorphism ve premium tasarım detaylarını birleştirir.
 */
export const SuperCard: React.FC<SuperCardProps> = ({
    children,
    title,
    subtitle,
    icon,
    badge,
    footer,
    variant = 'glass',
    className = '',
    onClick,
    hoverEffect = true
}) => {
    const variants = {
        glass: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20',
        elevated: 'bg-zinc-900 border border-zinc-800 shadow-xl',
        outline: 'border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-transparent',
        ghost: 'bg-transparent border-transparent'
    };

    return (
        <div
            onClick={onClick}
            className={`
        relative overflow-hidden rounded-[24px] p-6 transition-all duration-500
        ${variants[variant]}
        ${hoverEffect ? 'hover:-translate-y-2 hover:shadow-indigo-500/10' : ''}
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${className}
      `}
        >
            {/* Background Decorator */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/5 blur-[80px] pointer-events-none rounded-full"></div>

            {/* Header */}
            {(title || icon || badge) && (
                <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                        {icon && (
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                                {icon}
                            </div>
                        )}
                        <div>
                            {title && (
                                <SuperTypography variant="h4" weight="extrabold" className="tracking-tight">
                                    {title}
                                </SuperTypography>
                            )}
                            {subtitle && (
                                <SuperTypography variant="caption" color="muted" className="mt-0.5">
                                    {subtitle}
                                </SuperTypography>
                            )}
                        </div>
                    </div>
                    {badge && <SuperBadge variant="primary" pulse>{badge}</SuperBadge>}
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 w-full">
                {children}
            </div>

            {/* Footer */}
            {footer && (
                <div className="mt-8 pt-5 border-t border-white/5 relative z-10">
                    {footer}
                </div>
            )}

            {/* Hover Shine Effect */}
            {hoverEffect && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-br from-indigo-500/[0.03] to-transparent"></div>
            )}
        </div>
    );
};

export default SuperCard;
