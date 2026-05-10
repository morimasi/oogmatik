import React from 'react';
import type { ToggleSwitchProps } from '../../types';

const SIZES = {
    sm: { track: 'w-8 h-4', thumb: 'w-2.5 h-2.5', translate: 'left-[1.125rem]', off: 'left-[0.1875rem]', top: 'top-[0.1875rem]' },
    md: { track: 'w-12 h-6', thumb: 'w-4 h-4', translate: 'left-7', off: 'left-1', top: 'top-1' },
    lg: { track: 'w-16 h-8', thumb: 'w-6 h-6', translate: 'left-9', off: 'left-1', top: 'top-1' },
};

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    enabled,
    onChange,
    size = 'md',
    color = 'bg-indigo-600',
    disabled = false,
}) => {
    const s = SIZES[size];

    return (
        <button
            type="button"
            role="switch"
            aria-checked={enabled}
            disabled={disabled}
            onClick={() => !disabled && onChange(!enabled)}
            className={`${s.track} rounded-full relative transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-500/10 ${enabled ? color : 'bg-zinc-300 dark:bg-zinc-700'
                } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
            <div
                className={`${s.thumb} bg-white rounded-full absolute ${s.top} transition-all duration-300 shadow-sm ${enabled ? s.translate : s.off
                    }`}
            />
        </button>
    );
};
