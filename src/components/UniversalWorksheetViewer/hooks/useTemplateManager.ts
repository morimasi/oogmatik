import { useState, useCallback } from 'react';
import type { WorksheetTemplate, TemplateCategory } from '../types/worksheet';
import { BUILT_IN_TEMPLATES } from '../constants/templates';

const STORAGE_KEY = 'uwv_custom_templates';

function loadCustomTemplates(): WorksheetTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WorksheetTemplate[];
  } catch {
    return [];
  }
}

function saveCustomTemplates(templates: WorksheetTemplate[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch {
    // Storage quota or access errors are silently ignored
  }
}

export interface UseTemplateManagerReturn {
  templates: WorksheetTemplate[];
  customTemplates: WorksheetTemplate[];
  selectedCategory: TemplateCategory | 'all';
  filteredTemplates: WorksheetTemplate[];
  setSelectedCategory: (category: TemplateCategory | 'all') => void;
  saveCustomTemplate: (template: Omit<WorksheetTemplate, 'id' | 'isBuiltIn' | 'createdAt'>) => WorksheetTemplate;
  deleteCustomTemplate: (id: string) => void;
  getTemplate: (id: string) => WorksheetTemplate | undefined;
}

export function useTemplateManager(): UseTemplateManagerReturn {
  const [customTemplates, setCustomTemplates] = useState<WorksheetTemplate[]>(loadCustomTemplates);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');

  const templates: WorksheetTemplate[] = [...BUILT_IN_TEMPLATES, ...customTemplates];

  const filteredTemplates =
    selectedCategory === 'all'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const saveCustomTemplate = useCallback(
    (tpl: Omit<WorksheetTemplate, 'id' | 'isBuiltIn' | 'createdAt'>): WorksheetTemplate => {
      const newTemplate: WorksheetTemplate = {
        ...tpl,
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        isBuiltIn: false,
        createdAt: new Date().toISOString(),
      };
      setCustomTemplates((prev) => {
        const updated = [...prev, newTemplate];
        saveCustomTemplates(updated);
        return updated;
      });
      return newTemplate;
    },
    [],
  );

  const deleteCustomTemplate = useCallback((id: string) => {
    setCustomTemplates((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveCustomTemplates(updated);
      return updated;
    });
  }, []);

  const getTemplate = useCallback(
    (id: string): WorksheetTemplate | undefined => templates.find((t) => t.id === id),
    [templates],
  );

  return {
    templates,
    customTemplates,
    selectedCategory,
    filteredTemplates,
    setSelectedCategory,
    saveCustomTemplate,
    deleteCustomTemplate,
    getTemplate,
  };
}
