import React from 'react';
import { INFOGRAPHIC_ACTIVITIES_META, InfographicActivityMeta } from '../../constants/activityMeta';
import { InfographicCategoryId } from '../../constants/categoryConfig';
import { ActivityType } from '../../../../types/activity';
import { cn } from '../../../../utils/tailwindUtils';

interface ActivityGridProps {
    selectedCategory: InfographicCategoryId;
    selectedActivity: ActivityType | null;
    onSelect: (id: ActivityType) => void;
}

export const ActivityGrid: React.FC<ActivityGridProps> = ({ selectedCategory, selectedActivity, onSelect }) => {
    const activities = INFOGRAPHIC_ACTIVITIES_META.filter(a => a.categoryId === selectedCategory);

    return (
        <div className="mb-6 flex-1 flex flex-col min-h-0">
            <h3 className="text-sm font-semibold text-white/70 mb-2 px-2 flex-shrink-0">
                Şablonlar ({activities.length})
            </h3>
            <div className="grid grid-cols-2 gap-2 overflow-y-auto scrollbar-thin pr-1 pb-4">
                {activities.map((meta: InfographicActivityMeta) => {
                    const isSelected = selectedActivity === meta.id;
                    const Icon = meta.icon;

                    return (
                        <button
                            key={meta.id}
                            onClick={() => onSelect(meta.id)}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 text-center gap-2",
                                isSelected
                                    ? "bg-accent/20 border-accent/50 text-accent/70 shadow-[0_0_15px_hsl(var(--accent-h)_var(--accent-s)_var(--accent-l)/0.2)]"
                                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white/70 hover:border-white/20"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", isSelected ? "text-accent/70" : "text-white/50")} />
                            <span className="text-xs font-medium leading-tight">
                                {meta.title}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
