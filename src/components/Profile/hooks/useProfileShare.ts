import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { profileShareService, SharedContent, SharedModuleType, SharePermission } from '../../../services/profileShareService';

interface UseProfileShareReturn {
  sharedItems: SharedContent[];
  loading: boolean;
  shareModule: (recipientId: string, moduleType: SharedModuleType, permission: SharePermission, contentId?: string, message?: string) => Promise<boolean>;
  removeShare: (shareId: string) => Promise<boolean>;
  refreshSharedItems: () => Promise<void>;
  unreadCount: number;
}

export const useProfileShare = (): UseProfileShareReturn => {
  const { user } = useAuthStore();
  const [sharedItems, setSharedItems] = useState<SharedContent[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshSharedItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const items = await profileShareService.getSharedWithMe(user.id);
    setSharedItems(items);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refreshSharedItems();
  }, [refreshSharedItems]);

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

  const unreadCount = sharedItems.filter(s => !s.readAt).length;

  return { sharedItems, loading, shareModule, removeShare, refreshSharedItems, unreadCount };
};
