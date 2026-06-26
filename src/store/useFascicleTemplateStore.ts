import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FascicleItem, FascicleMetadata } from '../types/fascicle';

export interface SavedFascicleTemplate {
  id: string;
  title: string;
  description: string;
  metadata: FascicleMetadata;
  items: FascicleItem[];
  createdAt: number;
  pageCount: number;
  activityCount: number;
}

interface FascicleTemplateState {
  templates: SavedFascicleTemplate[];
  saveTemplate: (template: Omit<SavedFascicleTemplate, 'id' | 'createdAt'>) => string;
  deleteTemplate: (id: string) => void;
  getTemplate: (id: string) => SavedFascicleTemplate | undefined;
  clearAll: () => void;
}

export const useFascicleTemplateStore = create<FascicleTemplateState>()(
  persist(
    (set, get) => ({
      templates: [],

      saveTemplate: (data) => {
        const id = `template-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const template: SavedFascicleTemplate = {
          ...data,
          id,
          createdAt: Date.now(),
        };
        set((state) => ({
          templates: [template, ...state.templates],
        }));
        return id;
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      getTemplate: (id) => {
        return get().templates.find((t) => t.id === id);
      },

      clearAll: () => set({ templates: [] }),
    }),
    {
      name: 'bdmind-fascicle-templates',
    }
  )
);
