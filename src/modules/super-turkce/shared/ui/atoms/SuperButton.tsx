import React from 'react';

interface SuperButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

/**
 * SuperButton - Platformun temel atom butonu.
 * Premium hisiyat ve mikro-etkileşimler için optimize edilmiştir.
 */
export const SuperButton: React.FC<SuperButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden';

    const variants = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20',
        secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700',
        outline: 'border-2 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white',
        ghost: 'text-zinc-400 hover:text-white hover:bg-zinc-800/50',
        glass: 'bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 shadow-xl'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
        md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
        lg: 'px-8 py-3.5 text-base rounded-2xl gap-2.5',
        xl: 'px-10 py-5 text-lg rounded-3xl gap-3'
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-inherit">
                    <i className="fa-solid fa-circle-notch fa-spin text-lg"></i>
                </div>
            )}

            <span className={`flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                {leftIcon && <span className="opacity-80">{leftIcon}</span>}
                {children}
                {rightIcon && <span className="opacity-80">{rightIcon}</span>}
            </span>

            {/* Shine effect for premium feel */}
            {!disabled && !isLoading && (
                <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden rounded-inherit">
                    <div className="absolute -inset-[100%] top-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] hover:animate-shine transition-none group-hover:translate-x-[100%] duration-1000"></div>
                </div>
            )}
        </button>
    );
};

export default SuperButton;
