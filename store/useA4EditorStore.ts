import { create } from 'zustand';

interface A4EditorState {
  isEditorOpen: boolean;
  setEditorOpen: (isOpen: boolean) => void;
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
  editorTab: 'library' | 'content' | 'styling';
  setEditorTab: (tab: 'library' | 'content' | 'styling') => void;
}

export const useA4EditorStore = create<A4EditorState>((set: any) => ({
  isEditorOpen: false,
  setEditorOpen: (isOpen: boolean) => set({ isEditorOpen: isOpen }),
  selectedBlockId: null,
  setSelectedBlockId: (id: string | null) => set({ selectedBlockId: id, editorTab: id ? 'content' : 'library' }),
  editorTab: 'library',
  setEditorTab: (tab: 'library' | 'content' | 'styling') => set({ editorTab: tab }),
}));
