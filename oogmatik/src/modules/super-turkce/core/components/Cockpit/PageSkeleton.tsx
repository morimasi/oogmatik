/**
 * 2.3 SAYFA İSKELETİ (Page Skeleton)
 * 
 * A4 sayfasının canlı önizleme barı ve blok yerleşim gösterimi.
 * Seçilen bileşenlerin sıralı listesi, drag-and-drop reorder.
 */

import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { useSuperTurkceStore } from '../../store';
import { getFormatById } from '../../../features/activity-formats/registry';

interface PageSkeletonProps {
  onReorder?: (newOrder: string[]) => void;
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ onReorder }: PageSkeletonProps) => {
  const { selectedActivityTypes, draftComponents } = useSuperTurkceStore();
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

  // Toplam doluluk oranı (her blok ~%15-20 alan kaplar)
  const fillPercentage = Math.min(selectedActivityTypes.length * 18, 100);
  const isOverflow = fillPercentage > 100;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-slate-50 to-brand-50/30 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-brand-500"></i>
            Sayfa Düzeni
          </h3>
          <span className={`text-xs font-black px-2 py-1 rounded-md ${
            isOverflow 
              ? 'bg-red-100 text-red-700' 
              : 'bg-brand-100 text-brand-700'
          }`}>
            {selectedActivityTypes.length} Bileşen
          </span>
        </div>
      </div>

      {/* Doluluk Bar */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase">
            Sayfa Doluluk Oranı
          </label>
          <span className={`text-xs font-black ${
            isOverflow ? 'text-red-600' : 'text-brand-600'
          }`}>
            %{Math.round(fillPercentage)}
          </span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ 
              width: `${fillPercentage}%`,
              backgroundColor: isOverflow ? '#ef4444' : '#059669'
            }}
            transition={{ duration: 0.3 }}
            className={`h-full ${
              isOverflow ? 'bg-red-500' : 'bg-emerald-500'
            }`}
          />
        </div>
        {isOverflow && (
          <p className="text-[10px] text-red-600 mt-1.5 font-semibold flex items-center gap-1">
            <i className="fa-solid fa-triangle-exclamation"></i>
            Çok fazla bileşen! Bazılarını kaldırın.
          </p>
        )}
      </div>

      {/* Bileşen Listesi */}
      <div className="max-h-64 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {selectedActivityTypes.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <i className="fa-solid fa-inbox text-3xl mb-2 opacity-50"></i>
            <p className="text-xs">Henüz bileşen seçilmedi</p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={selectedActivityTypes}
            onReorder={(newOrder: any) => {
              if (onReorder) onReorder(newOrder);
              // Store'u da güncelle
              newOrder.forEach((typeId: string, idx: number) => {
                if (idx !== selectedActivityTypes.indexOf(typeId)) {
                  useSuperTurkceStore.getState().toggleActivityType(typeId as any);
                }
              });
            }}
            className="space-y-2"
          >
            {selectedActivityTypes.map((typeId: string, index: number) => {
              const format = getFormatById(typeId);
              if (!format) return null;

              const isExpanded = expandedBlock === typeId;

              return (
                <Reorder.Item
                  key={typeId}
                  value={typeId}
                  className="relative"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-white border-2 rounded-xl p-3 cursor-pointer transition-all ${
                      isExpanded
                        ? 'border-brand-400 shadow-md'
                        : 'border-slate-200 hover:border-brand-300'
                    }`}
                    onClick={() => setExpandedBlock(isExpanded ? null : typeId)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Drag Handle */}
                      <div className="text-slate-400 cursor-grab active:cursor-grabbing">
                        <i className="fa-solid fa-grip-vertical"></i>
                      </div>

                      {/* Numara & İkon */}
                      <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>

                      {/* İçerik */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-700 truncate">
                          {format.label}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate">
                          {format.description}
                        </p>
                      </div>

                      {/* Expand Icon */}
                      <div className={`transform transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}>
                        <i className="fa-solid fa-chevron-down text-slate-400"></i>
                      </div>
                    </div>

                    {/* Genişletilmiş İçerik */}
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 pt-3 border-t border-slate-100"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">
                            <i className="fa-solid fa-clock mr-1"></i>
                            Tahmini: 5-7 dk
                          </span>
                          <button
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              useSuperTurkceStore.getState().toggleActivityType(typeId as any);
                            }}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold"
                          >
                            <i className="fa-solid fa-trash mr-1"></i>
                            Kaldır
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}
      </div>

      {/* Footer Info */}
      {selectedActivityTypes.length > 0 && !isOverflow && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
          <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
            <i className="fa-solid fa-circle-info text-brand-500"></i>
            Sürükle-bırak ile sırayı değiştirebilirsin
          </p>
        </div>
      )}
    </div>
  );
};

export default PageSkeleton;
