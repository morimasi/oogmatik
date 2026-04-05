/**
 * OOGMATIK - OCR Variation Results View
 *
 * Varyasyon sonuçlarını grid layout'ta gösterir ve WorksheetStore'a eklemeyi sağlar.
 */

import React, { useState } from 'react';
import type { WorksheetData } from '../types';
import { useWorksheetStore } from '../store/useWorksheetStore';
import DOMPurify from 'isomorphic-dompurify';
import { GraphicRenderer } from '../../components/MatSinavStudyosu/components/GraphicRenderer';
import type { GrafikVerisi } from '../types/matSinav';

interface VariationResultsViewProps {
  variations: WorksheetData;
  metadata?: {
    requestedCount: number;
    successfulCount: number;
    quality: 'high' | 'medium' | 'low';
    warnings?: string[];
    processingTimeMs: number;
  };
  onBack: () => void;
  onAddToWorksheet: (variation: WorksheetData[0]) => void;
}

export const VariationResultsView: React.FC<VariationResultsViewProps> = ({
  variations,
  metadata,
  onBack,
  onAddToWorksheet,
}) => {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { _addWorksheet } = useWorksheetStore();

  const toggleSelect = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleAddSelected = () => {
    const selectedVariations = variations.filter((_, i) => selectedIndices.has(i));
    selectedVariations.forEach(variation => {
      onAddToWorksheet(variation);
    });
    setSelectedIndices(new Set());
  };

  const handleAddAll = () => {
    variations.forEach(variation => {
      onAddToWorksheet(variation);
    });
  };

  const qualityColors = {
    high: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    low: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  const qualityIcons = {
    high: 'fa-star',
    medium: 'fa-star-half-stroke',
    low: 'fa-triangle-exclamation',
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 bg-slate-900/80 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
              className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-3"
            >
              <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
              <span className="text-sm font-medium">Geri Dön</span>
            </button>
            <h2 className="text-2xl font-black text-white">
              <i className="fa-solid fa-wand-magic-sparkles text-indigo-400 mr-2"></i>
              Varyasyon Sonuçları
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {metadata?.successfulCount} / {metadata?.requestedCount} varyant başarıyla üretildi
            </p>
          </div>

          {/* Quality Badge */}
          {metadata?.quality && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${qualityColors[metadata.quality]}`}>
              <i className={`fa-solid ${qualityIcons[metadata.quality]}`}></i>
              <span className="text-sm font-bold capitalize">{metadata.quality} Kalite</span>
            </div>
          )}
        </div>

        {/* Warnings */}
        {metadata?.warnings && metadata.warnings.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-start gap-2">
              <i className="fa-solid fa-triangle-exclamation text-amber-400 mt-0.5"></i>
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-400 mb-1">Uyarılar:</p>
                <ul className="text-xs text-amber-300/80 space-y-1">
                  {metadata.warnings.map((warning, i) => (
                    <li key={i}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleAddAll}
            disabled={variations.length === 0}
            className="flex-1 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-layer-group"></i>
            Tümünü Ekle ({variations.length})
          </button>
          <button
            onClick={handleAddSelected}
            disabled={selectedIndices.size === 0}
            className="flex-1 px-5 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-check-double"></i>
            Seçilenleri Ekle ({selectedIndices.size})
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {variations.map((variation, index) => {
            const isSelected = selectedIndices.has(index);
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={index}
                className={`group relative bg-slate-800/50 backdrop-blur-sm rounded-2xl border transition-all ${isSelected
                    ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/20'
                    : 'border-white/5 hover:border-white/10'
                  }`}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={() => toggleSelect(index)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                      }`}
                  >
                    {isSelected && <i className="fa-solid fa-check text-white text-xs"></i>}
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  {/* Header */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 text-xs font-bold bg-indigo-500/20 text-indigo-300 rounded-lg">
                        Varyant {index + 1}
                      </span>
                      {variation.difficultyLevel && (
                        <span className="px-2 py-1 text-xs font-medium bg-slate-700/50 text-slate-300 rounded-lg">
                          {variation.difficultyLevel}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white line-clamp-2 pr-8">
                      {variation.title}
                    </h3>
                  </div>

                  {/* Preview */}
                  <div
                    className={`mb-3 overflow-hidden transition-all ${isExpanded ? 'max-h-96' : 'max-h-32'
                      }`}
                  >
                    <div
                      className="prose prose-sm prose-invert max-w-none text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(String(variation.content || ''), {
                          ALLOWED_TAGS: ['div', 'p', 'span', 'strong', 'em', 'u', 'br', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'svg', 'path', 'rect', 'circle', 'line', 'text', 'g', 'defs', 'filter', 'feDropShadow'],
                          ALLOWED_ATTR: ['class', 'style'],
                        }),
                      }}
                    />
                  </div>

                  {/* Görsel veri varsa GraphicRenderer ile göster */}
                  {variation.grafikVeri && (
                    <div className="mt-2 flex justify-center rounded-xl overflow-hidden bg-slate-700/30 p-2">
                      <GraphicRenderer
                        grafik={variation.grafikVeri as GrafikVerisi}
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* Expand Button */}
                  <button
                    onClick={() => toggleExpand(index)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 mb-3"
                  >
                    {isExpanded ? (
                      <>
                        <i className="fa-solid fa-chevron-up"></i>
                        Daha Az Göster
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-chevron-down"></i>
                        Daha Fazla Göster
                      </>
                    )}
                  </button>

                  {/* Target Skills */}
                  {variation.targetSkills && variation.targetSkills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-400 font-medium mb-1">Hedef Beceriler:</p>
                      <div className="flex flex-wrap gap-1">
                        {variation.targetSkills.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-xs bg-slate-700/30 text-slate-300 rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                        {variation.targetSkills.length > 3 && (
                          <span className="px-2 py-0.5 text-xs bg-slate-700/30 text-slate-400 rounded-md">
                            +{variation.targetSkills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pedagogical Note (Collapsed) */}
                  {variation.pedagogicalNote && (
                    <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                      <p className="text-xs text-indigo-300/80 line-clamp-2">
                        <i className="fa-solid fa-lightbulb mr-1"></i>
                        {variation.pedagogicalNote}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => onAddToWorksheet(variation)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-plus"></i>
                      Ekle
                    </button>
                    <button
                      onClick={() => toggleSelect(index)}
                      className={`px-3 py-2 text-sm font-bold rounded-lg transition-all border ${isSelected
                          ? 'bg-indigo-500 text-white border-indigo-500'
                          : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                        }`}
                    >
                      <i className={`fa-solid ${isSelected ? 'fa-check' : 'fa-circle'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Metadata Badge */}
                {variation.metadata && (
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-md">
                    <p className="text-[10px] text-slate-400">
                      {Number(variation.metadata.variationIndex)} / {Number(variation.metadata.totalVariations)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {variations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <i className="fa-solid fa-inbox text-6xl text-slate-600 mb-4"></i>
            <h3 className="text-xl font-bold text-slate-400 mb-2">Varyasyon Bulunamadı</h3>
            <p className="text-sm text-slate-500">
              Hiç varyasyon üretilemedi. Lütfen tekrar deneyin.
            </p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {metadata && (
        <div className="px-6 py-4 border-t border-white/5 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span>
                <i className="fa-solid fa-clock mr-1"></i>
                İşlem Süresi: {(metadata.processingTimeMs / 1000).toFixed(1)}s
              </span>
              <span>
                <i className="fa-solid fa-layer-group mr-1"></i>
                Toplam: {variations.length} varyant
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Powered by</span>
              <span className="font-bold text-indigo-400">Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
