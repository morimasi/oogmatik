/**
 * FAZ 2: Akıllı Kokpit (UI/UX) - Başlatıldı ✅
 * 
 * TAMAMLANAN ÖZELLİKLER:
 * ✅ 2.1 Bileşen Havuzu (ComponentPool)
 * ✅ 2.2 Şartlı Ayarlar Paneli (SettingsPanel)
 * ✅ 2.3 Sayfa İskeleti (PageSkeleton)
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSuperTurkceStore } from '../../store';
import { ActivityFormatDef } from '../../types/activity-formats';
import { getFormatsByCategory } from '../../../features/activity-formats/registry';

// ============================================
// 2.1 BİLEŞEN HAVUZU (Component Pool)
// ============================================

interface ComponentPoolProps {
  activeCategory: string | null;
}

export const ComponentPool: React.FC<ComponentPoolProps> = ({ activeCategory }: ComponentPoolProps) => {
  const { selectedActivityTypes, toggleActivityType } = useSuperTurkceStore();
  
  const formats = activeCategory ? getFormatsByCategory(activeCategory as any) : [];

  if (!activeCategory) {
    return (
      <div className="text-center py-8 text-slate-400">
        <i className="fa-solid fa-shapes text-4xl mb-3 opacity-50"></i>
        <p className="text-sm">Lütfen bir kategori seçin</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      <AnimatePresence mode="popLayout">
        {formats.map((format: ActivityFormatDef, index: number) => (
          <ComponentCard
            key={format.id}
            format={format}
            isSelected={selectedActivityTypes.includes(format.id as any)}
            onToggle={() => toggleActivityType(format.id as any)}
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// BILEŞEN KARTI (Component Card)
// ============================================

interface ComponentCardProps {
  format: ActivityFormatDef;
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ format, isSelected, onToggle, index }: ComponentCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={`rounded-xl border-2 transition-all overflow-hidden ${
        isSelected
          ? 'border-brand-500 bg-brand-50/30 shadow-lg shadow-brand-500/20'
          : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-md'
      }`}
    >
      {/* Kart Başlık */}
      <div
        onClick={onToggle}
        className="flex items-center gap-3 p-4 cursor-pointer select-none"
      >
        {/* İkon */}
        <div
          className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/40 scale-110'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          <i className={`fa-solid ${format.icon} text-xl`}></i>
        </div>

        {/* İçerik */}
        <div className="flex-1 min-w-0">
          <h4
            className={`text-base font-bold truncate transition-colors ${
              isSelected ? 'text-brand-800' : 'text-slate-700'
            }`}
          >
            {format.label}
          </h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {format.description}
          </p>
        </div>

        {/* Checkbox */}
        <div
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-brand-500 border-brand-500 text-white shadow-inner'
              : 'border-slate-300 bg-white hover:border-brand-400'
          }`}
        >
          {isSelected && <i className="fa-solid fa-check text-sm"></i>}
        </div>
      </div>

      {/* Zorluk Badge */}
      <div className="px-4 pb-3 flex gap-2">
        <DifficultyBadge difficulty={format.difficulty} />
        {format.settings.length > 0 && (
          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-semibold">
            🔧 {format.settings.length} Ayar
          </span>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// ZORLUK BADGE (Difficulty Badge)
// ============================================

interface DifficultyBadgeProps {
  difficulty: 'all' | 'easy' | 'medium' | 'hard' | 'lgs';
}

const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty }: DifficultyBadgeProps) => {
  const colors = {
    all: 'bg-slate-100 text-slate-600',
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-orange-100 text-orange-700',
    lgs: 'bg-red-100 text-red-700',
  };

  const labels = {
    all: 'Tüm Seviyeler',
    easy: 'Kolay',
    medium: 'Orta',
    hard: 'Zor',
    lgs: 'Yeni Nesil (LGS)',
  };

  return (
    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${colors[difficulty]}`}>
      {labels[difficulty]}
    </span>
  );
};

export default ComponentPool;
