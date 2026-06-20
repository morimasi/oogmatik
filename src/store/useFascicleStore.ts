import { create } from 'zustand';
import { FascicleItem, FascicleMetadata, FascicleDocument } from '../types/fascicle';
import { persist } from 'zustand/middleware';

interface FascicleState {
  currentFascicleId: string | null;
  metadata: FascicleMetadata;
  items: FascicleItem[];
  
  // History for Undo/Redo
  past: { items: FascicleItem[]; metadata: FascicleMetadata }[];
  future: { items: FascicleItem[]; metadata: FascicleMetadata }[];
  
  // Actions
  setFascicle: (fascicle: FascicleDocument) => void;
  updateMetadata: (metadata: Partial<FascicleMetadata>) => void;
  addItem: (item: FascicleItem) => void;
  removeItem: (itemId: string) => void;
  reorderItems: (startIndex: number, endIndex: number) => void;
  updateItem: (itemId: string, updates: Partial<FascicleItem>) => void;
  setItems: (items: FascicleItem[]) => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  
  // Initialization & Reset
  reset: () => void;
}

const initialMetadata: FascicleMetadata = {
  title: 'İsimsiz Fasikül',
  targetProfile: 'all',
  targetAgeGroup: '8-10',
  theme: 'default',
  estimatedDurationMin: 40,
  qrEnabled: true,
};

export const useFascicleStore = create<FascicleState>()(
  persist(
    (set, get) => ({
      currentFascicleId: null,
      metadata: initialMetadata,
      items: [],
      past: [],
      future: [],

      setFascicle: (fascicle) => {
        set({
          currentFascicleId: fascicle.id,
          metadata: fascicle.metadata,
          items: fascicle.items,
          past: [],
          future: []
        });
      },

      updateMetadata: (newMeta) => {
        const { metadata, items, past } = get();
        set({
          past: [...past, { metadata, items }],
          future: [],
          metadata: { ...metadata, ...newMeta }
        });
      },

      addItem: (item) => {
        const { metadata, items, past } = get();
        set({
          past: [...past, { metadata, items }],
          future: [],
          items: [...items, { ...item, order: items.length }]
        });
      },

      removeItem: (itemId) => {
        const { metadata, items, past } = get();
        const newItems = items
          .filter((i) => i.id !== itemId)
          .map((i, idx) => ({ ...i, order: idx }));
        
        set({
          past: [...past, { metadata, items }],
          future: [],
          items: newItems
        });
      },

      reorderItems: (startIndex, endIndex) => {
        const { metadata, items, past } = get();
        const newItems = Array.from(items);
        const [reorderedItem] = newItems.splice(startIndex, 1);
        newItems.splice(endIndex, 0, reorderedItem);

        // Update orders
        const orderedItems = newItems.map((item, index) => ({
          ...item,
          order: index,
        }));

        set({
          past: [...past, { metadata, items }],
          future: [],
          items: orderedItems
        });
      },

      updateItem: (itemId, updates) => {
        const { items, metadata, past } = get();
        set({
          past: [...past, { items, metadata }],
          future: [],
          items: items.map(item => item.id === itemId ? { ...item, ...updates } : item)
        });
      },

      setItems: (newItems) => {
        const { items, metadata, past } = get();
        set({
          past: [...past, { items, metadata }],
          future: [],
          items: newItems
        });
      },

      undo: () => {
        const { past, future, metadata, items } = get();
        if (past.length === 0) return;
        
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        
        set({
          past: newPast,
          future: [{ metadata, items }, ...future],
          metadata: previous.metadata,
          items: previous.items
        });
      },

      redo: () => {
        const { past, future, metadata, items } = get();
        if (future.length === 0) return;
        
        const next = future[0];
        const newFuture = future.slice(1);
        
        set({
          past: [...past, { metadata, items }],
          future: newFuture,
          metadata: next.metadata,
          items: next.items
        });
      },

      reset: () => {
        set({
          currentFascicleId: null,
          metadata: initialMetadata,
          items: [],
          past: [],
          future: []
        });
      }
    }),
    {
      name: 'bdmind-fascicle-draft-storage',
      partialize: (state) => ({ 
        currentFascicleId: state.currentFascicleId,
        metadata: state.metadata,
        items: state.items
      }),
    }
  )
);
