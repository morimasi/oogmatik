import React from 'react';

interface SuperBadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'zinc' | 'glass';
    size?: 'sm' | 'md';
    pulse?: boolean;
    className?: string;
    icon?: React.ReactNode;
}

/**
 * SuperBadge - Küçük bilgi etiketleri için premium atom.
 */
export const SuperBadge: React.FC<SuperBadgeProps> = ({
    children,
    variant = 'zinc',
    size = 'md',
    pulse = false,
    className = '',
    icon
}) => {
    const sizeStyles = {
        sm: 'px-1.5 py-0.5 text-[9px]',
        md: 'px-2.5 py-0.5 text-[11px]'
    };

    const variants = {
        primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        danger: 'bg-red-500/10 text-red-400 border-red-500/20',
        zinc: 'bg-zinc-800 text-zinc-400 border-zinc-700',
        glass: 'bg-white/5 backdrop-blur-sm border border-white/10 text-zinc-300'
    };

    return (
        <div className={`
      inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider border
      ${sizeStyles[size]}
      ${variants[variant]}
      ${className}
      ${pulse ? 'animate-pulse' : ''}
    `}>
            {icon && <span className="text-[10px]">{icon}</span>}
            {children}
        </div>
    );
};

export default SuperBadge;
