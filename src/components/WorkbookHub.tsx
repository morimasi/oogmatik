import React, { useState, useCallback } from 'react';
import { WorkbookLibrary } from './WorkbookLibrary';
import { WorkbookView } from './WorkbookView';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { getWorkbookById, createWorkbook } from '../services/workbook/workbookService';
import { workbookToCollectionItems } from '../utils/workbookBridge';
import type { CollectionItem, WorkbookSettings } from '../types';
import type { Workbook, WorkbookTemplate } from '../types/workbook';

interface WorkbookHubProps {
  items: CollectionItem[];
  setItems: React.Dispatch<React.SetStateAction<CollectionItem[]>>;
  settings: WorkbookSettings;
  setSettings: React.Dispatch<React.SetStateAction<WorkbookSettings>>;
  onBack: () => void;
}

export const WorkbookHub: React.FC<WorkbookHubProps> = ({
  items,
  setItems,
  settings,
  setSettings,
  onBack,
}) => {
  const { user } = useAuthStore();
  const toast = useToastStore();
  const [mode, setMode] = useState<'library' | 'editor'>(items.length > 0 ? 'editor' : 'library');
  const [activeWorkbookId, setActiveWorkbookId] = useState<string | null>(null);

  const handleSelectWorkbook = useCallback(async (workbook: Workbook) => {
    if (!user) return;
    try {
      const full = await getWorkbookById(workbook.id, user.id);
      setItems(workbookToCollectionItems(full));
      
      // Tüm ayarları merge et (varsayılan değerlerle beraber)
      setSettings((prev) => ({
        ...prev,
        ...full.settings,
        title: full.title,
        studentName: full.settings.studentName || prev.studentName,
      }));
      
      setActiveWorkbookId(full.id);
      setMode('editor');
    } catch {
      toast.error('Kitapçık yüklenemedi.');
    }
  }, [user, setItems, setSettings, toast]);

  const handleCreateNew = useCallback(async (template?: WorkbookTemplate) => {
    if (!user) {
      toast.error('Kitapçık oluşturmak için giriş yapın.');
      return;
    }
    try {
      const wb = await createWorkbook(user.id, {
        title: template?.name || settings.title || 'Yeni Çalışma Kitapçığı',
        templateType: template?.type || 'academic-standard',
        templateId: template?.id,
        settings: { studentName: settings.studentName },
      });
      setActiveWorkbookId(wb.id);
      if (items.length === 0) {
        setItems([]);
      }
      setMode('editor');
      toast.success('Yeni kitapçık oluşturuldu.');
    } catch {
      toast.error('Kitapçık oluşturulamadı.');
    }
  }, [user, settings, items.length, setItems, toast]);

  const handleEditorBack = useCallback(() => {
    setMode('library');
    setActiveWorkbookId(null);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-muted)] font-bold">
        Çalışma kitapçığı için oturum açmanız gerekiyor.
      </div>
    );
  }

  if (mode === 'library') {
    return (
      <WorkbookLibrary
        userId={user.id}
        onSelectWorkbook={handleSelectWorkbook}
        onCreateNew={handleCreateNew}
      />
    );
  }

  return (
    <WorkbookView
      items={items}
      setItems={setItems}
      settings={settings}
      setSettings={setSettings}
      onBack={items.length > 0 && activeWorkbookId ? handleEditorBack : onBack}
      workbookId={activeWorkbookId}
    />
  );
};
