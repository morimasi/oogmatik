import React from 'react';
import { INFOGRAPHIC_CATEGORIES, InfographicCategoryId } from '../../constants/categoryConfig';
import { Lock } from 'lucide-react';
import { cn } from '../../../../utils/tailwindUtils'; // assuming this utility exists, else fallback

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
                    const Icon = cat.icon;
                    const isClinical = cat.id === 'clinical-bep';

                    return (
                        <button
                            key={cat.id}
                            onClick={() => onSelect(cat.id)}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 border",
                                isSelected
                                    ? `bg-${cat.color}-500/20 border-${cat.color}-500/50 text-${cat.color}-400`
                                    : "bg-transparent border-transparent hover:bg-white/5 text-white/70"
                            )}
                        >
                            <div className="flex items-center space-x-3">
                                <Icon className={cn("w-4 h-4", isSelected ? `text-${cat.color}-400` : "text-white/50")} />
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
