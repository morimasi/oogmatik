import React from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { InfographicGenMode } from '../../hooks/useInfographicStudio';
import { cn } from '../../../../utils/tailwindUtils';

interface ModeSwitcherProps {
    mode: InfographicGenMode;
    onChange: (mode: InfographicGenMode) => void;
    disabled?: boolean;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onChange, disabled }) => {
    return (
        <div className="bg-black/20 p-1 rounded-xl flex items-center mb-6 border border-white/5">
            <button
                onClick={() => onChange('ai')}
                disabled={disabled}
                className={cn(
                    "flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all",
                    mode === 'ai'
                        ? "bg-indigo-500 text-white shadow-lg"
                        : "text-white/60 hover:text-white hover:bg-white/5",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <Sparkles className="w-4 h-4" />
                <span>Yapay Zeka</span>
            </button>

            <button
                onClick={() => onChange('fast')}
                disabled={disabled}
                className={cn(
                    "flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all",
                    mode === 'fast'
                        ? "bg-emerald-500 text-white shadow-lg"
                        : "text-white/60 hover:text-white hover:bg-white/5",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <Zap className="w-4 h-4" />
                <span>Hızlı Üretim</span>
            </button>
        </div>
    );
};
