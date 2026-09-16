import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { profileShareService, SharedContent } from '../../../services/profileShareService';
import { worksheetService } from '../../../services/worksheetService';
import { assessmentService } from '../../../services/assessmentService';
import { SavedWorksheet, SavedAssessment } from '../../../types';
import { useToastStore } from '../../../store/useToastStore';
import { logError } from '../../../utils/logger';

export interface UnifiedSharedItem {
  id: string;
  type: 'module' | 'worksheet' | 'assessment';
  title: string;
  subtitle: string;
  senderName: string;
  senderId?: string;
  createdAt: string;
  readAt?: string;
  permission: 'view' | 'edit';
  message?: string;
  originalItem: SharedContent | SavedWorksheet | SavedAssessment;
  moduleType?: SharedContent['moduleType'];
  contentId?: string;
}

export const useSharedContentHub = () => {
  const { user } = useAuthStore();
  const { info } = useToastStore();
  
  const [moduleItems, setModuleItems] = useState<SharedContent[]>([]);
  const [worksheets, setWorksheets] = useState<SavedWorksheet[]>([]);
  const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const prevUnreadCountRef = useRef<number | null>(null);

  // 1. Modül Paylaşımları (Realtime onSnapshot)
  useEffect(() => {
    if (!user?.id) {
      setModuleItems([]);
      setLoading(false);
      return;
    }

    const unsub = profileShareService.subscribeToSharedWithMe(user.id, (items) => {
      setModuleItems(items);
      
      const unreadCount = items.filter(i => !i.readAt).length;
      if (prevUnreadCountRef.current !== null && unreadCount > prevUnreadCountRef.current) {
        const newest = items.find(i => !i.readAt);
        if (newest) {
          info(`📩 ${newest.ownerName} sizinle yeni bir profil içerik paylaşımında bulundu.`);
        }
      }
      prevUnreadCountRef.current = unreadCount;
    });

    return () => unsub();
  }, [user?.id, info]);

  // 2. Materyal & Değerlendirme Paylaşımlarını Yükle
  const fetchSharedResources = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [wsRes, assRes] = await Promise.all([
        worksheetService.getSharedWithMe(user.id, 0, 100),
        assessmentService.getSharedAssessments(user.id)
      ]);
      setWorksheets(wsRes.items || []);
      setAssessments(assRes || []);
    } catch (e) {
      logError('Paylaşılan kaynaklar yüklenemedi', { error: e });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSharedResources();
  }, [fetchSharedResources]);

  // 3. Tüm Paylaşımları Bütünleşik / Birleşik Dizide Birleştir
  const unifiedItems: UnifiedSharedItem[] = [
    // Modül Paylaşımları
    ...moduleItems.map((m): UnifiedSharedItem => ({
      id: m.id || `mod_${Math.random()}`,
      type: 'module',
      title: m.moduleType === 'analysis' ? 'Bilişsel Analiz Raporu' :
             m.moduleType === 'reports' ? 'Özel Eğitim Raporu' :
             m.moduleType === 'plans' ? 'Eğitim Planı (BEP)' : 'Profil Özeti',
      subtitle: m.moduleType.toUpperCase() + ' Modülü',
      senderName: m.ownerName,
      senderId: m.ownerId,
      createdAt: m.createdAt,
      readAt: m.readAt,
      permission: m.permission,
      message: m.message,
      originalItem: m,
      moduleType: m.moduleType,
      contentId: m.contentId,
    })),

    // Materyal Paylaşımları (Worksheets)
    ...worksheets.map((w): UnifiedSharedItem => {
      const isFascicle = w.category?.id === 'fascicle' || w.name?.toLowerCase().includes('fasikül');
      return {
        id: w.id,
        type: 'worksheet',
        title: w.name || 'Adsız Eğitim Materyali',
        subtitle: isFascicle ? 'Özel Eğitim Fasikülü' : (w.category?.title || 'Çalışma Kâğıdı'),
        senderName: w.sharedByName || 'Öğretmen',
        senderId: w.sharedBy,
        createdAt: w.createdAt,
        readAt: new Date().toISOString(), // Materyaller varsayılan okundu
        permission: 'view',
        originalItem: w,
      };
    }),

    // Değerlendirme Raporu Paylaşımları (Assessments)
    ...assessments.map((a): UnifiedSharedItem => ({
      id: a.id,
      type: 'assessment',
      title: `${a.studentName} — Bilişsel Değerlendirme`,
      subtitle: `${a.grade} · ${a.age} Yaş`,
      senderName: a.sharedByName || 'Uzman',
      senderId: a.sharedBy,
      createdAt: a.createdAt,
      readAt: new Date().toISOString(),
      permission: 'view',
      originalItem: a,
      contentId: a.id,
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = unifiedItems.filter(i => !i.readAt).length;

  const markAsRead = useCallback(async (id: string, type: UnifiedSharedItem['type']) => {
    if (type === 'module') {
      await profileShareService.markAsRead(id);
      setModuleItems(prev => prev.map(m => m.id === id ? { ...m, readAt: new Date().toISOString() } : m));
    }
  }, []);

  const removeShare = useCallback(async (id: string, type: UnifiedSharedItem['type']): Promise<boolean> => {
    if (type === 'module') {
      const ok = await profileShareService.removeShare(id);
      if (ok) setModuleItems(prev => prev.filter(m => m.id !== id));
      return !!ok;
    } else if (type === 'worksheet' && user?.id) {
      await worksheetService.deleteWorksheet(id, user.id);
      setWorksheets(prev => prev.filter(w => w.id !== id));
      return true;
    }
    return false;
  }, [user?.id]);

  return {
    unifiedItems,
    moduleItems,
    worksheets,
    assessments,
    loading,
    unreadCount,
    markAsRead,
    removeShare,
    refresh: fetchSharedResources,
  };
};
