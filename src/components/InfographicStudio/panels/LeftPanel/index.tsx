import React from 'react';
import { CategoryTabs } from './CategoryTabs';
import { ActivityGrid } from './ActivityGrid';
import { ModeSwitcher } from './ModeSwitcher';
import { ParameterPanel, ParameterPanelState } from './ParameterPanel';
import { InfographicCategoryId } from '../../constants/categoryConfig';
import { ActivityType } from '../../../../types/activity';
import { InfographicGenMode } from '../../hooks/useInfographicStudio';
import { Sparkles, Loader2, Plus, X } from 'lucide-react';
import { cn } from '../../../../utils/tailwindUtils';
import { AddedWidget } from '../../index';
import { INFOGRAPHIC_ACTIVITIES_META } from '../../constants/activityMeta';

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

    // Widget builder
    addedWidgets: AddedWidget[];
    onAddWidget: (activityId: string) => void;
    onRemoveWidget: (id: string) => void;
    onEnrichPrompt?: () => Promise<void>;
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
    isGenerating,
    addedWidgets,
    onAddWidget,
    onRemoveWidget,
    onEnrichPrompt
}) => {
    const canGenerate = addedWidgets.length > 0 && params.topic.trim().length > 0 && !isGenerating;

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

                {/* Ekle Butonu */}
                {selectedActivity && (
                    <button
                        onClick={() => {
                            onAddWidget(selectedActivity);
                            onActivitySelect(null as any); // clear selection
                        }}
                        className="w-full mt-2 mb-4 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-semibold transition-all shadow-md bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/50"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Sayfaya Ekle</span>
                    </button>
                )}

                {/* Eklenen Bileşenler */}
                {addedWidgets.length > 0 && (
                    <div className="mb-4 mt-4">
                        <h3 className="text-sm font-semibold text-white/70 mb-2 px-2">Eklenen Bileşenler ({addedWidgets.length})</h3>
                        <div className="space-y-2">
                            {addedWidgets.map((w, idx) => {
                                const meta = INFOGRAPHIC_ACTIVITIES_META.find(a => a.id === w.activityId);
                                return (
                                    <div key={w.id} className="flex items-center justify-between bg-white/5 border border-white/10 p-2 rounded-lg">
                                        <div className="flex items-center space-x-2 truncate">
                                            <span className="text-xs text-white/50 w-4">{idx + 1}.</span>
                                            <span className="text-xs font-medium text-white/80 truncate">{meta?.title || w.activityId}</span>
                                        </div>
                                        <button onClick={() => onRemoveWidget(w.id)} className="text-white/40 hover:text-red-400">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Parametreler */}
                <div className="mt-2 pt-4 border-t border-white/10">
                    <ParameterPanel
                        params={params}
                        onChange={onParamsChange}
                        isClinicalMode={isClinicalMode}
                        onEnrichPrompt={onEnrichPrompt}
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
                            <span>Sayfa Üretiliyor...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            <span>{mode === 'ai' ? 'Master Prompt ile Üret' : 'Hızlı Kağıt Üret'}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};