import { create } from 'zustand';
import { ContentBlock } from '../types/activityStudio';

interface A4EditorState {
  isEditorOpen: boolean;
  setEditorOpen: (isOpen: boolean) => void;
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
  editorTab: 'library' | 'content' | 'styling';
  setEditorTab: (tab: 'library' | 'content' | 'styling') => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  blocks: ContentBlock[];
  addBlock: (block: ContentBlock) => void;
}

export const useA4EditorStore = create<A4EditorState>()((set, get) => ({
  isEditorOpen: false,
  setEditorOpen: (isOpen: boolean) => set({ isEditorOpen: isOpen }),
  selectedBlockId: null,
  setSelectedBlockId: (id: string | null) =>
    set({ selectedBlockId: id, editorTab: id ? 'content' : 'library' }),
  editorTab: 'library',
  setEditorTab: (tab: 'library' | 'content' | 'styling') => set({ editorTab: tab }),
  snapToGrid: false,
  setSnapToGrid: (snap: boolean) => set({ snapToGrid: snap }),
  gridSize: 10,
  setGridSize: (size: number) => set({ gridSize: size }),
  blocks: [],
  addBlock: (block: ContentBlock) =>
    set((state: A4EditorState) => ({
      blocks: [...state.blocks, { ...block, id: block.id || crypto.randomUUID() }],
    })),
}));
