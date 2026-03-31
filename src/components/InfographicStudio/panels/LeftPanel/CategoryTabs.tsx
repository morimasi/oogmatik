import React from 'react';
import { INFOGRAPHIC_CATEGORIES, InfographicCategoryId } from '../../constants/categoryConfig';
import { Lock } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '../../../../utils/tailwindUtils';

interface CategoryTabsProps {
    selectedCategory: InfographicCategoryId;
    onSelect: (id: InfographicCategoryId) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ selectedCategory, onSelect }) => {
    return (
        <div className="flex flex-col space-y-1 mb-6">
            <h3 className="text-sm font-semibold text-white/70 mb-2 px-2">Kategoriler</h3>
            <div className="space-y-1 overflow-y-auto max-h-48 scrollbar-thin pr-1">
                {INFOGRAPHIC_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const IconComponent = (Icons as any)[cat.icon] || Icons.HelpCircle;
                    const isClinical = cat.id === 'clinical-bep';
                    const color = 'indigo';

                    return (
                        <button
                            key={cat.id}
                            onClick={() => onSelect(cat.id as any)}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 border",
                                isSelected
                                    ? `bg-${color}-500/20 border-${color}-500/50 text-${color}-400`
                                    : "bg-transparent border-transparent hover:bg-white/5 text-white/70"
                            )}
                        >
                            <div className="flex items-center space-x-3">
                                <IconComponent className={cn("w-4 h-4", isSelected ? `text-${color}-400` : "text-white/50")} />
                                <span className="font-medium">{cat.label}</span>
                            </div>
                            {isClinical && (
                                <Lock className="w-3 h-3 text-rose-400" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
