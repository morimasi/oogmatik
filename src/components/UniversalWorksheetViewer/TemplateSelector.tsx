import React from 'react';
import styles from './UniversalWorksheetViewer.module.css';
import type { WorksheetTemplate, TemplateCategory } from './types/worksheet';
import { TEMPLATE_CATEGORY_LABELS } from './constants/templates';

interface TemplateSelectorProps {
  templates: WorksheetTemplate[];
  selectedCategory: TemplateCategory | 'all';
  onSelectCategory: (category: TemplateCategory | 'all') => void;
  onApplyTemplate: (template: WorksheetTemplate) => void;
  onDeleteTemplate?: (id: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = React.memo(
  ({ templates, selectedCategory, onSelectCategory, onApplyTemplate, onDeleteTemplate }) => {
    const categories: Array<TemplateCategory | 'all'> = [
      'all',
      'math',
      'language',
      'science',
      'social',
      'art',
      'custom',
    ];

    return (
      <div
        className={styles.templateSelector}
        role="region"
        aria-label="Şablon seçici"
      >
        <h3 className={styles.panelTitle}>Şablonlar</h3>

        {/* Category tabs */}
        <div className={styles.categoryTabs} role="tablist" aria-label="Şablon kategorileri">
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={selectedCategory === cat}
              className={`${styles.categoryTab} ${selectedCategory === cat ? styles.categoryTabActive : ''}`}
              onClick={() => onSelectCategory?.(cat)}
            >
              {cat === 'all' ? 'Tümü' : TEMPLATE_CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div
          className={styles.templateGrid}
          role="tabpanel"
          aria-label={`${selectedCategory === 'all' ? 'Tüm' : TEMPLATE_CATEGORY_LABELS[selectedCategory as TemplateCategory]} şablonları`}
        >
          {templates.length === 0 ? (
            <p className={styles.emptyState}>Bu kategoride şablon bulunamadı.</p>
          ) : (
            templates.map((tpl) => (
              <div key={tpl.id} className={styles.templateCard}>
                {tpl.thumbnail ? (
                  <img
                    src={tpl.thumbnail}
                    alt={tpl.name}
                    className={styles.templateThumbnail}
                  />
                ) : (
                  <div
                    className={styles.templateThumbnailPlaceholder}
                    aria-hidden="true"
                  >
                    📄
                  </div>
                )}
                <div className={styles.templateCardBody}>
                  <span className={styles.templateName}>{tpl.name}</span>
                  <span className={styles.templateDesc}>{tpl.description}</span>
                  <span className={styles.templateCategory}>
                    {TEMPLATE_CATEGORY_LABELS[tpl.category] ?? tpl.category}
                  </span>
                </div>
                <div className={styles.templateCardActions}>
                  <button
                    className={styles.applyTemplateBtn}
                    onClick={() => onApplyTemplate?.(tpl)}
                    aria-label={`${tpl.name} şablonunu uygula`}
                  >
                    Uygula
                  </button>
                  {!tpl.isBuiltIn && onDeleteTemplate && (
                    <button
                      className={styles.deleteTemplateBtn}
                      onClick={() => onDeleteTemplate?.(tpl.id)}
                      aria-label={`${tpl.name} şablonunu sil`}
                    >
                      Sil
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  },
);

TemplateSelector.displayName = 'TemplateSelector';
