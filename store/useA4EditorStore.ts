import { create } from 'zustand';

interface A4EditorState {
  isEditorOpen: boolean;
  setEditorOpen: (isOpen: boolean) => void;
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
  editorTab: 'library' | 'content' | 'styling';
  setEditorTab: (tab: 'library' | 'content' | 'styling') => void;
}

export const useA4EditorStore = create<A4EditorState>((set) => ({
  isEditorOpen: false,
  setEditorOpen: (isOpen) => set({ isEditorOpen: isOpen }),
  selectedBlockId: null,
  setSelectedBlockId: (id) => set({ selectedBlockId: id, editorTab: id ? 'content' : 'library' }),
  editorTab: 'library',
  setEditorTab: (tab) => set({ editorTab: tab }),
}));
