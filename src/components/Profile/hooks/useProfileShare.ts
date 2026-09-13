import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { profileShareService, SharedContent, SharedModuleType, SharePermission } from '../../../services/profileShareService';
import { useToastStore } from '../../../store/useToastStore';

interface UseProfileShareReturn {
  sharedItems: SharedContent[];
  loading: boolean;
  shareModule: (recipientId: string, moduleType: SharedModuleType, permission: SharePermission, contentId?: string, message?: string) => Promise<boolean>;
  removeShare: (shareId: string) => Promise<boolean>;
  markAsRead: (shareId: string) => Promise<boolean>;
  refreshSharedItems: () => void;
  unreadCount: number;
}

export const useProfileShare = (): UseProfileShareReturn => {
  const { user } = useAuthStore();
  const { info } = useToastStore();
  const [sharedItems, setSharedItems] = useState<SharedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const prevCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);

    const unsub = profileShareService.subscribeToSharedWithMe(user.id, (items) => {
      setSharedItems(items);
      setLoading(false);

      // İlk yüklemede referans sayısını kaydet
      if (prevCountRef.current === null) {
        prevCountRef.current = items.filter(s => !s.readAt).length;
        return;
      }

      // Yeni okunmamış paylaşım gelirse toast bildir
      const newUnread = items.filter(s => !s.readAt).length;
      if (newUnread > (prevCountRef.current ?? 0)) {
        const newest = items.find(s => !s.readAt);
        if (newest) {
          info(`📩 ${newest.ownerName} yeni bir içerik paylaştı.`);
        }
      }
      prevCountRef.current = newUnread;
    });

    return () => { unsub(); };
  }, [user?.id, info]);

  // refreshSharedItems: onSnapshot zaten canlı — geriye dönük compat için no-op
  const refreshSharedItems = useCallback(() => { /* onSnapshot aktif, yenileme gerekmiyor */ }, []);

  const shareModule = useCallback(async (
    recipientId: string,
    moduleType: SharedModuleType,
    permission: SharePermission,
    contentId?: string,
    message?: string,
  ): Promise<boolean> => {
    if (!user) return false;
    const id = await profileShareService.shareModule({
      ownerId: user.id,
      ownerName: user.name || 'Bilinmiyor',
      recipientId,
      moduleType,
      permission,
      contentId,
      message,
    });
    return id !== null;
  }, [user]);

  const removeShare = useCallback(async (shareId: string): Promise<boolean> => {
    const ok = await profileShareService.removeShare(shareId);
    if (ok) setSharedItems(prev => prev.filter(s => s.id !== shareId));
    return ok;
  }, []);

  const markAsRead = useCallback(async (shareId: string): Promise<boolean> => {
    const ok = await profileShareService.markAsRead(shareId);
    if (ok) {
      setSharedItems(prev => prev.map(s => s.id === shareId ? { ...s, readAt: new Date().toISOString() } : s));
    }
    return ok;
  }, []);

  const unreadCount = sharedItems.filter(s => !s.readAt).length;

  return { sharedItems, loading, shareModule, removeShare, markAsRead, refreshSharedItems, unreadCount };
};
