import React, { useState, useCallback } from 'react';
import type { WorksheetTemplate, WorksheetCategory } from './types/worksheet';
import type { UseTemplateManagerReturn } from './types/worksheet';
import { TEMPLATE_CATEGORIES } from './constants/templates';
import styles from './UniversalWorksheetViewer.module.css';

interface TemplateSelectorProps {
  templateManager: UseTemplateManagerReturn;
  onClose: () => void;
}

export function TemplateSelector({ templateManager, onClose }: TemplateSelectorProps) {
  const { templates, customTemplates, loadTemplate, deleteTemplate, saveAsTemplate, searchTemplates, filterByCategory } = templateManager;
  const [activeCategory, setActiveCategory] = useState<WorksheetCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [saveMode, setSaveMode] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');
  const [saveCategory, setSaveCategory] = useState<WorksheetCategory>('custom');

  const displayedTemplates: WorksheetTemplate[] = searchQuery.trim()
    ? searchTemplates(searchQuery)
    : filterByCategory(activeCategory);

  const handleLoad = useCallback(
    (template: WorksheetTemplate) => {
      loadTemplate(template);
      onClose();
    },
    [loadTemplate, onClose],
  );

  const handleSave = useCallback(() => {
    if (!saveName.trim()) return;
    saveAsTemplate(saveName.trim(), saveDesc.trim(), saveCategory);
    setSaveMode(false);
    setSaveName('');
    setSaveDesc('');
  }, [saveName, saveDesc, saveCategory, saveAsTemplate]);

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      deleteTemplate(id);
    },
    [deleteTemplate],
  );

  return (
    <div className={styles.templateOverlay} role="dialog" aria-modal="true" aria-label="Şablon Seçici">
      <div className={styles.templatePanel}>
        <header className={styles.templateHeader}>
          <h2 className={styles.templateTitle}>Şablon Seç</h2>
          <button className={styles.templateCloseBtn} onClick={onClose} aria-label="Kapat">✕</button>
        </header>

        {/* Search */}
        <div className={styles.templateSearch}>
          <input
            type="search"
            className={styles.templateSearchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Şablon ara..."
            aria-label="Şablon ara"
          />
        </div>

        {/* Category tabs */}
        <nav className={styles.templateCategoryNav} aria-label="Şablon kategorileri">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`${styles.templateCategoryTab} ${activeCategory === cat.value ? styles.templateCategoryTabActive : ''}`}
              onClick={() => { setActiveCategory(cat.value); setSearchQuery(''); }}
              aria-pressed={activeCategory === cat.value}
              aria-label={cat.label}
            >
              {cat.label}
            </button>
          ))}
        </nav>

        {/* Template grid */}
        <div className={styles.templateGrid} role="list" aria-label="Şablonlar">
          {displayedTemplates.length === 0 ? (
            <p className={styles.templateEmpty} role="status">Şablon bulunamadı.</p>
          ) : (
            displayedTemplates.map((template) => (
              <div
                key={template.id}
                className={`${styles.templateCard} ${hoveredId === template.id ? styles.templateCardHovered : ''}`}
                role="listitem"
                onMouseEnter={() => setHoveredId(template.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className={styles.templateCardBody}>
                  <h3 className={styles.templateCardName}>{template.name}</h3>
                  <p className={styles.templateCardDesc}>{template.description}</p>
                  <span className={styles.templateCardCategory}>{template.category}</span>
                </div>
                <div className={styles.templateCardActions}>
                  <button
                    className={styles.templateLoadBtn}
                    onClick={() => handleLoad(template)}
                    aria-label={`${template.name} şablonunu yükle`}
                  >
                    Yükle
                  </button>
                  {template.isCustom && (
                    <button
                      className={styles.templateDeleteBtn}
                      onClick={(e) => handleDelete(e, template.id)}
                      aria-label={`${template.name} şablonunu sil`}
                    >
                      Sil
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Save as template */}
        <footer className={styles.templateFooter}>
          {!saveMode ? (
            <button className={styles.templateSaveBtn} onClick={() => setSaveMode(true)} aria-label="Mevcut sayfayı şablon olarak kaydet">
              + Şablon Olarak Kaydet
            </button>
          ) : (
            <div className={styles.templateSaveForm} role="form" aria-label="Şablon kaydetme formu">
              <input
                type="text"
                className={styles.templateSaveInput}
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Şablon adı *"
                aria-label="Şablon adı"
                required
              />
              <input
                type="text"
                className={styles.templateSaveInput}
                value={saveDesc}
                onChange={(e) => setSaveDesc(e.target.value)}
                placeholder="Açıklama (opsiyonel)"
                aria-label="Şablon açıklaması"
              />
              <select
                className={styles.templateSaveSelect}
                value={saveCategory}
                onChange={(e) => setSaveCategory(e.target.value as WorksheetCategory)}
                aria-label="Kategori"
              >
                {TEMPLATE_CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <div className={styles.templateSaveActions}>
                <button
                  className={styles.templateSaveConfirmBtn}
                  onClick={handleSave}
                  disabled={!saveName.trim()}
                  aria-label="Kaydet"
                >
                  Kaydet
                </button>
                <button
                  className={styles.templateSaveCancelBtn}
                  onClick={() => setSaveMode(false)}
                  aria-label="İptal"
                >
                  İptal
                </button>
              </div>
            </div>
          )}
          <p className={styles.templateCustomCount} aria-live="polite">
            {customTemplates.length} özel şablon kaydedildi
          </p>
        </footer>
      </div>
    </div>
  );
}
