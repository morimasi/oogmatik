import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VFSFile {
  name: string;
  language: string;
  content: string;
  lastModified?: Date;
  size?: number;
}

interface VFSStore {
  files: Record<string, VFSFile>;
  activeFile: string | null;
  isDirty: boolean;
  
  // File operations
  setFile: (path: string, file: VFSFile) => void;
  updateFile: (path: string, content: string) => void;
  updateFilePartial: (path: string, updater: (content: string) => string) => void;
  deleteFile: (path: string) => void;
  
  // Active file management
  setActiveFile: (path: string) => void;
  
  // Batch operations
  setFiles: (files: Record<string, VFSFile>) => void;
  clearFiles: () => void;
  
  // Persistence
  exportVFS: () => string;
  importVFS: (data: string) => void;
  
  // UI state
  markClean: () => void;
}

export const useVFSStore = create<VFSStore>()(
  persist(
    (set, get) => ({
      // Initial state
      files: {
        'ActivityEngine.tsx': {
          name: 'ActivityEngine.tsx',
          language: 'typescript',
          content: `import React from 'react';
import { motion } from 'framer-motion';

// AUTONOM_CONFIG_START
export const Config = () => {
  return (
    // AI agents generating configuration panel...
  )
}
// AUTONOM_CONFIG_END

export const Activity = () => {
  return (
    <div className="immersive-layout-v4">
      {/* AI is writing here... */}
    </div>
  )
}`,
          lastModified: new Date(),
          size: 0
        },
        'registry.ts': {
          name: 'registry.ts',
          language: 'typescript',
          content: `export const ACTIVITY_REGISTRY = {
  // New modules are registered here otonomously
};`,
          lastModified: new Date(),
          size: 0
        }
      },
      activeFile: 'ActivityEngine.tsx',
      isDirty: false,

      // File operations
      setFile: (path: string, file: VFSFile) => set((state: VFSStore) => ({
        files: { ...state.files, [path]: { ...file, lastModified: new Date() } },
        isDirty: true
      })),

      updateFile: (path: string, content: string) => set((state: VFSStore) => ({
        files: {
          ...state.files,
          [path]: { ...state.files[path], content, lastModified: new Date() }
        },
        isDirty: true
      })),

      updateFilePartial: (path: string, updater: (content: string) => string) => set((state: VFSStore) => {
        const file = state.files[path];
        if (!file) return state;
        
        return {
          files: {
            ...state.files,
            [path]: { ...file, content: updater(file.content), lastModified: new Date() }
          },
          isDirty: true
        };
      }),

      deleteFile: (path: string) => set((state: VFSStore) => {
        const newFiles = { ...state.files };
        delete newFiles[path];
        
        return {
          files: newFiles,
          activeFile: state.activeFile === path ? null : state.activeFile,
          isDirty: true
        };
      }),

      // Active file management
      setActiveFile: (path) => set({ activeFile: path }),

      // Batch operations
      setFiles: (files: Record<string, VFSFile>) => set({ files, isDirty: true }),
      clearFiles: () => set({ files: {}, activeFile: null, isDirty: true }),

      // Persistence
      exportVFS: () => JSON.stringify(get().files, null, 2),
      importVFS: (data: string) => set({ files: JSON.parse(data), isDirty: true }),

      // UI state
      markClean: () => set({ isDirty: false })
    }),
    {
      name: 'oogmatik-vfs-storage',
      partialize: (state: VFSStore) => ({
        files: state.files,
        activeFile: state.activeFile
      }),
      version: 1
    }
  )
);

// Helper hook for convenience
export const useVFSFile = (path: string) => {
  const file = useVFSStore((state: VFSStore) => state.files[path]);
  const updateFile = useVFSStore((state: VFSStore) => state.updateFile);
  const updateFilePartial = useVFSStore((state: VFSStore) => state.updateFilePartial);

  return {
    file,
    update: (content: string) => updateFile(path, content),
    updatePartial: (updater: (content: string) => string) => updateFilePartial(path, updater)
  };
};
