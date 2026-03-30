import React from 'react';
import { CategoryTabs } from './CategoryTabs';
import { ActivityGrid } from './ActivityGrid';
import { ModeSwitcher } from './ModeSwitcher';
import { ParameterPanel, ParameterPanelState } from './ParameterPanel';
import { InfographicCategoryId } from '../../constants/categoryConfig';
import { ActivityType } from '../../../../types/activity';
import { InfographicGenMode } from '../../hooks/useInfographicStudio';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../../../../utils/tailwindUtils';

interface LeftPanelProps {
    // Mode/Category/Activity state
    selectedCategory: InfographicCategoryId;
    selectedActivity: ActivityType | null;
    mode: InfographicGenMode;
    onCategoryChange: (cat: InfographicCategoryId) => void;
    onActivitySelect: (act: ActivityType) => void;
    onModeChange: (mode: InfographicGenMode) => void;

    // Params
    params: ParameterPanelState;
    onParamsChange: (params: ParameterPanelState) => void;
    isClinicalMode?: boolean;

    // Actions
    onGenerate: () => void;
    isGenerating: boolean;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
    selectedCategory,
    selectedActivity,
    mode,
    onCategoryChange,
    onActivitySelect,
    onModeChange,
    params,
    onParamsChange,
    isClinicalMode,
    onGenerate,
    isGenerating
}) => {
    const canGenerate = selectedActivity && params.topic.trim().length > 0 && !isGenerating;

    return (
        <div className="w-80 h-full flex flex-col bg-slate-900/50 backdrop-blur-md border-r border-white/10 p-4">
            <div className="flex-1 overflow-y-auto scrollbar-thin pr-2">
                {/* Model Seçimi */}
                <ModeSwitcher
                    mode={mode}
                    onChange={onModeChange}
                    disabled={isGenerating}
                />

                {/* Kategoriler */}
                <CategoryTabs
                    selectedCategory={selectedCategory}
                    onSelect={onCategoryChange}
                />

                {/* Aktiviteler (Grid) */}
                <ActivityGrid
                    selectedCategory={selectedCategory}
                    selectedActivity={selectedActivity}
                    onSelect={onActivitySelect}
                />

                {/* Parametreler */}
                <div className="mt-2 pt-4 border-t border-white/10">
                    <ParameterPanel
                        params={params}
                        onChange={onParamsChange}
                        isClinicalMode={isClinicalMode}
                    />
                </div>
            </div>

            {/* Üret Butonu (Sabit Alt Kısım) */}
            <div className="pt-4 mt-2">
                <button
                    onClick={onGenerate}
                    disabled={!canGenerate}
                    className={cn(
                        "w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg",
                        canGenerate
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-indigo-500/25"
                            : "bg-white/5 text-white/40 cursor-not-allowed"
                    )}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>İnfografik Üretiliyor...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            <span>{mode === 'ai' ? 'Yapay Zeka ile Üret' : 'Hızlı Üret'}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
