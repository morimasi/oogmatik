import React from 'react';

interface SuperInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
    error?: string;
    helperText?: string;
}

/**
 * SuperInput - Premium input deneyimi sunan atom bileşeni.
 */
export const SuperInput: React.FC<SuperInputProps> = ({
    label,
    icon,
    error,
    helperText,
    className = '',
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">
                    {label}
                </label>
            )}

            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors duration-300">
                        {icon}
                    </div>
                )}

                <input
                    className={`
            w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 
            placeholder:text-zinc-600 outline-none transition-all duration-300
            hover:border-zinc-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10
            ${icon ? 'pl-11' : ''}
            ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' : ''}
          `}
                    {...props}
                />
            </div>

            {(error || helperText) && (
                <span className={`text-[11px] ml-1 ${error ? 'text-red-400' : 'text-zinc-500'}`}>
                    {error || helperText}
                </span>
            )}
        </div>
    );
};

export default SuperInput;
