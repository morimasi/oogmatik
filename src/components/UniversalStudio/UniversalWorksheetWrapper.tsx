// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useCreativeStore } from '../../store/useCreativeStore';
import { convertToLayoutItems } from './UniversalAdapter';
import { UniversalCanvas } from './UniversalCanvas';
import { UniversalPropertiesPanel } from './UniversalPropertiesPanel';
import { SingleWorksheetData, ActivityType } from '../../types';

interface UniversalWorksheetWrapperProps {
  worksheetData: SingleWorksheetData[];
  activityType: ActivityType | null;
  scale: number;
  styleSettings: any;
}

const DesignModeToolbar = () => {
  const {
    designMode,
    setDesignMode,
    selectedId,
    selectedIds,
    groupSelected,
    ungroupSelected,
    lockSelected,
    unlockSelected,
    deleteSelected,
    clearSelection,
    layout,
  } = useCreativeStore();

  const hasSelection = selectedId || selectedIds.length > 0;
  const hasMultipleSelection = selectedIds.length > 1 || (selectedId && selectedIds.length === 0);

  const selectedItem = selectedId ? layout.find((l) => l.instanceId === selectedId) : null;
  const isInGroup =
    selectedItem?.groupId ||
    selectedIds.some((id) => layout.find((l) => l.instanceId === id)?.groupId);

  if (!designMode) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white rounded-xl shadow-xl border border-zinc-200 p-2">
      <button
        onClick={() => setDesignMode(false)}
        className="px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors flex items-center gap-2"
      >
        <i className="fa-solid fa-eye"></i>
        Önizleme
      </button>

      <div className="w-px h-6 bg-zinc-200"></div>

      <button
        onClick={clearSelection}
        disabled={!hasSelection}
        className="px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-600 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Seçimi Temizle (Esc)"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>

      <button
        onClick={groupSelected}
        disabled={!hasMultipleSelection}
        className="px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-600 hover:bg-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        title="Grupla (Ctrl+G)"
      >
        <i className="fa-solid fa-object-group"></i>
        Grup
      </button>

      <button
        onClick={ungroupSelected}
        disabled={!isInGroup}
        className="px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-600 hover:bg-purple-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        title="Grubu Dağıt (Ctrl+Shift+G)"
      >
        <i className="fa-solid fa-object-ungroup"></i>
        Dağıt
      </button>

      <div className="w-px h-6 bg-zinc-200"></div>

      <button
        onClick={lockSelected}
        disabled={!hasSelection}
        className="px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-600 hover:bg-amber-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        title="Kilitle (Ctrl+L)"
      >
        <i className="fa-solid fa-lock"></i>
        Kilitle
      </button>

      <button
        onClick={unlockSelected}
        disabled={!hasSelection}
        className="px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-600 hover:bg-emerald-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        title="Kilidi Aç (Ctrl+Shift+L)"
      >
        <i className="fa-solid fa-lock-open"></i>
        Aç
      </button>

      <div className="w-px h-6 bg-zinc-200"></div>

      <button
        onClick={deleteSelected}
        disabled={!hasSelection}
        className="px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        title="Sil (Delete)"
      >
        <i className="fa-solid fa-trash"></i>
        Sil
      </button>
    </div>
  );
};

const UniversalWorksheetInner = ({
  worksheetData,
  activityType,
  scale,
  styleSettings,
}: UniversalWorksheetWrapperProps) => {
  const { setLayout, designMode, setDesignMode } = useCreativeStore();
  const [isAdapterRunning, setIsAdapterRunning] = useState(true);

  useEffect(() => {
    if (worksheetData && worksheetData.length > 0) {
      setIsAdapterRunning(true);
      const items = convertToLayoutItems(activityType, worksheetData, styleSettings);
      setLayout(items);
      setIsAdapterRunning(false);
    } else {
      setIsAdapterRunning(false);
    }
  }, [worksheetData, activityType, setLayout, styleSettings]);

  return (
    <div className="flex w-full h-full">
      <div className="flex-1 overflow-auto flex justify-center relative">
        {/* Design Mode Toolbar */}
        <DesignModeToolbar />

        {!isAdapterRunning && (
          <div
            className="transition-transform duration-100 ease-out will-change-transform mt-20 mb-20"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
            }}
          >
            <UniversalCanvas />
          </div>
        )}
      </div>

      {/* Right Panel - Only visible in Design Mode */}
      {designMode && (
        <div className="shrink-0 w-80 bg-white border-l border-zinc-200 z-40 h-full">
          <UniversalPropertiesPanel />
        </div>
      )}
    </div>
  );
};

export const UniversalWorksheetWrapper = (props: UniversalWorksheetWrapperProps) => {
  return <UniversalWorksheetInner {...props} />;
};
