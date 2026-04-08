import React, { useState, useEffect } from 'react';
import { CategoryTabs } from './CategoryTabs';
import { ActivityGrid } from './ActivityGrid';
import { ModeSwitcher } from './ModeSwitcher';
import { ParameterPanel, ParameterPanelState } from './ParameterPanel';
import {
    UltraActivityParamsPanel,
    ActivityParamsState,
    getDefaultActivityParams,
} from './UltraActivityParamsPanel';
import { InfographicCategoryId } from '../../constants/categoryConfig';
import { ActivityType } from '../../../../types/activity';
import { InfographicGenMode } from '../../hooks/useInfographicStudio';
import { Sparkles, Loader2, Plus, X, Zap } from 'lucide-react';
import { cn } from '../../../../utils/tailwindUtils';
import { AddedWidget } from '../../index';
import { INFOGRAPHIC_ACTIVITIES_META } from '../../constants/activityMeta';

interface LeftPanelProps {
    selectedCategory: InfographicCategoryId;
    selectedActivity: ActivityType | null;
    mode: InfographicGenMode;
    onCategoryChange: (cat: InfographicCategoryId) => void;
    onActivitySelect: (act: ActivityType) => void;
    onModeChange: (mode: InfographicGenMode) => void;

    params: ParameterPanelState;
    onParamsChange: (params: ParameterPanelState) => void;
    isClinicalMode?: boolean;

    onGenerate: () => void;
    onUltraGenerate?: (activityParams: ActivityParamsState) => void;
    isGenerating: boolean;

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
    onUltraGenerate,
    isGenerating,
    addedWidgets,
    onAddWidget,
    onRemoveWidget,
    onEnrichPrompt,
}) => {
    const canGenerate =
        addedWidgets.length > 0 && params.topic.trim().length > 0 && !isGenerating;
    const canUltraGenerate =
        !!selectedActivity && params.topic.trim().length > 0 && !isGenerating;

    const [activityParams, setActivityParams] = useState<ActivityParamsState>({});

    useEffect(() => {
        if (selectedActivity) {
            setActivityParams(getDefaultActivityParams(selectedActivity));
        } else {
            setActivityParams({});
        }
    }, [selectedActivity]);

    const selectedMeta = selectedActivity
        ? INFOGRAPHIC_ACTIVITIES_META.find((a) => a.id === selectedActivity)
        : null;

    return (
        <div className="w-80 h-full flex flex-col bg-slate-900/50 backdrop-blur-md border-r border-white/10 p-4">
            <div className="flex-1 overflow-y-auto scrollbar-thin pr-2">
                {/* Model Seçimi */}
                <ModeSwitcher mode={mode} onChange={onModeChange} disabled={isGenerating} />

                {/* Kategoriler */}
                <CategoryTabs selectedCategory={selectedCategory} onSelect={onCategoryChange} />

                {/* Aktiviteler (Grid) */}
                <ActivityGrid
                    selectedCategory={selectedCategory}
                    selectedActivity={selectedActivity}
                    onSelect={onActivitySelect}
                />

                {/* Seçili Aktivite: Ultra Özelleştirme + Aksiyonlar */}
                {selectedActivity && selectedMeta && (
                    <div className="mt-2 mb-4 p-3 bg-accent/5 border border-accent/20 rounded-xl">
                        <div className="text-xs font-semibold text-accent/70 mb-0.5 tracking-wide">
                            {selectedMeta.title}
                        </div>
                        <div className="text-[10px] text-white/40 mb-2">
                            {selectedMeta.description}
                        </div>

                        {/* Ultra Premium Özelleştirme Parametreleri */}
                        <UltraActivityParamsPanel
                            activityType={selectedActivity}
                            params={activityParams}
                            onChange={setActivityParams}
                        />

                        {/* Butonlar */}
                        <div className="flex gap-2 mt-3">
                            {onUltraGenerate && (
                                <button
                                    onClick={() => onUltraGenerate(activityParams)}
                                    disabled={!canUltraGenerate}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all',
                                        canUltraGenerate
                                            ? 'bg-fuchsia-600/80 hover:bg-fuchsia-600 text-white border border-fuchsia-400/40'
                                            : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                                    )}
                                >
                                    <Zap className="w-3.5 h-3.5" />
                                    <span>Tek Üret</span>
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    onAddWidget(selectedActivity);
                                    onActivitySelect(null as unknown as ActivityType);
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all bg-accent/20 text-accent/70 hover:bg-accent/30 border border-accent/50"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Bileşik Sayfaya Ekle</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Eklenen Bileşenler */}
                {addedWidgets.length > 0 && (
                    <div className="mb-4 mt-2">
                        <h3 className="text-sm font-semibold text-white/70 mb-2 px-2">
                            Eklenen Bileşenler ({addedWidgets.length})
                        </h3>
                        <div className="space-y-2">
                            {addedWidgets.map((w, idx) => {
                                const meta = INFOGRAPHIC_ACTIVITIES_META.find(
                                    (a) => a.id === w.activityId
                                );
                                return (
                                    <div
                                        key={w.id}
                                        className="flex items-center justify-between bg-white/5 border border-white/10 p-2 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-2 truncate">
                                            <span className="text-xs text-white/50 w-4">
                                                {idx + 1}.
                                            </span>
                                            <span className="text-xs font-medium text-white/80 truncate">
                                                {meta?.title || w.activityId}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => onRemoveWidget(w.id)}
                                            className="text-white/40 hover:text-red-400"
                                        >
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

            {/* Bileşik Üret Butonu */}
            {addedWidgets.length > 0 && (
                <div className="pt-4 mt-2">
                    <button
                        onClick={onGenerate}
                        disabled={!canGenerate}
                        className={cn(
                            'w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg',
                            canGenerate
                                ? 'bg-accent hover:bg-accent/90 text-white shadow-accent/20'
                                : 'bg-white/5 text-white/40 cursor-not-allowed'
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
                                <span>
                                    {mode === 'ai' ? 'Master Prompt ile Üret' : 'Hızlı Kağıt Üret'}
                                </span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};
