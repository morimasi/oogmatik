import React from 'react';

interface SuperTypographyProps {
    children: React.ReactNode;
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';
    color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'danger';
    weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
    className?: string;
    as?: keyof JSX.IntrinsicElements;
}

/**
 * SuperTypography - Platformun tipografi otoritesi.
 * Font-family, scale ve okunabilirlik standartlarını kontrol eder.
 */
export const SuperTypography: React.FC<SuperTypographyProps> = ({
    children,
    variant = 'body',
    color = 'primary',
    weight = 'normal',
    className = '',
    as
}) => {
    const Component = (as || (
        variant === 'h1' ? 'h1' :
            variant === 'h2' ? 'h2' :
                variant === 'h3' ? 'h3' :
                    variant === 'h4' ? 'h4' : 'p'
    )) as React.ElementType;

    const variants = {
        h1: 'text-4xl md:text-5xl font-heading tracking-tight',
        h2: 'text-3xl md:text-4xl font-heading tracking-tight',
        h3: 'text-2xl md:text-3xl font-heading',
        h4: 'text-xl md:text-2xl font-heading',
        body: 'text-base font-ui',
        caption: 'text-sm font-ui',
        label: 'text-xs font-ui uppercase tracking-widest'
    };

    const colors = {
        primary: 'text-zinc-100',
        secondary: 'text-zinc-400',
        muted: 'text-zinc-500',
        accent: 'text-indigo-400',
        danger: 'text-red-400'
    };

    const weights = {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
        extrabold: 'font-extrabold'
    };

    return (
        <Component className={`${variants[variant]} ${colors[color]} ${weights[weight]} ${className}`}>
            {children}
        </Component>
    );
};

export default SuperTypography;
