import { useState, useCallback } from 'react';
import type {
  WorksheetTemplate,
  WorksheetDocument,
  WorksheetCategory,
  UseTemplateManagerReturn,
} from '../types/worksheet';
import { BUILT_IN_TEMPLATES, STORAGE_KEY_CUSTOM_TEMPLATES } from '../constants/templates';

// ── Persistence helpers ───────────────────────────────────────────────────────

function loadCustomTemplates(): WorksheetTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_TEMPLATES);
    if (!raw) return [];
    return JSON.parse(raw) as WorksheetTemplate[];
  } catch {
    return [];
  }
}

function saveCustomTemplates(templates: WorksheetTemplate[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_TEMPLATES, JSON.stringify(templates));
  } catch {
    // Storage might be full or unavailable; fail silently
  }
}

function makeId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseTemplateManagerOptions {
  currentDocument: WorksheetDocument;
  onLoadTemplate: (document: WorksheetDocument) => void;
}

export function useTemplateManager(options: UseTemplateManagerOptions): UseTemplateManagerReturn {
  const { currentDocument, onLoadTemplate } = options;
  const [customTemplates, setCustomTemplates] = useState<WorksheetTemplate[]>(loadCustomTemplates);

  const templates = [...BUILT_IN_TEMPLATES, ...customTemplates];

  const loadTemplate = useCallback(
    (template: WorksheetTemplate) => {
      onLoadTemplate(template.document);
    },
    [onLoadTemplate],
  );

  const saveAsTemplate = useCallback(
    (name: string, description: string, category: WorksheetCategory): WorksheetTemplate => {
      const newTemplate: WorksheetTemplate = {
        id: makeId(),
        name,
        description,
        category,
        isBuiltIn: false,
        isCustom: true,
        document: {
          ...currentDocument,
          meta: {
            ...currentDocument.meta,
            title: name,
            category,
            updatedAt: new Date().toISOString(),
          },
        },
      };
      setCustomTemplates((prev) => {
        const updated = [...prev, newTemplate];
        saveCustomTemplates(updated);
        return updated;
      });
      return newTemplate;
    },
    [currentDocument],
  );

  const deleteTemplate = useCallback((id: string) => {
    setCustomTemplates((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveCustomTemplates(updated);
      return updated;
    });
  }, []);

  const searchTemplates = useCallback(
    (query: string): WorksheetTemplate[] => {
      if (!query.trim()) return templates;
      const q = query.toLowerCase();
      return templates.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      );
    },
    [templates],
  );

  const filterByCategory = useCallback(
    (category: WorksheetCategory | 'all'): WorksheetTemplate[] => {
      if (category === 'all') return templates;
      return templates.filter((t) => t.category === category);
    },
    [templates],
  );

  return {
    templates,
    customTemplates,
    loadTemplate,
    saveAsTemplate,
    deleteTemplate,
    searchTemplates,
    filterByCategory,
  };
}
