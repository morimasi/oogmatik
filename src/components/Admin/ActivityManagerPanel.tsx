import React, { useState } from 'react';
import { activityVisibilityManager, ActivityStatus } from '../../services/activityVisibilityManager';
import { ActivityType } from '../../types/activity';
import { ACTIVITY_CATEGORIES } from '../../constants';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

/**
 * Activity & Category Visibility Management UI
 * Admin can toggle activities on/off per role
 */
export const ActivityManagerPanel: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToastStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleActivity = async (activityType: ActivityType, currentStatus: ActivityStatus) => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const allowedRoles = newStatus === 'active' 
        ? ['superadmin', 'admin', 'teacher', 'student', 'parent']
        : ['superadmin'];
      
      await activityVisibilityManager.setActivityVisibility(
        activityType,
        newStatus,
        allowedRoles,
        user.id
      );
      
      toast.success(`Etkinlik ${newStatus === 'active' ? 'aktif' : 'pasif'} yapıldı`);
    } catch (error) {
      toast.error('Güncelleme başarısız oldu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleCategory = async (categoryId: string) => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      // Simple toggle logic
      const newStatus = 'active'; // Default to active when toggling
      const allowedRoles = ['superadmin', 'admin', 'teacher', 'student', 'parent'];
      
      await activityVisibilityManager.setCategoryVisibility(
        categoryId,
        newStatus,
        allowedRoles,
        user.id
      );
      
      toast.success('Kategori durumu güncellendi');
    } catch (error) {
      toast.error('Kategori güncelleme başarısız oldu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkUpdate = async (status: ActivityStatus) => {
    if (!user || !selectedCategory) return;
    
    setIsUpdating(true);
    try {
      // Get all activities in selected category
      const category = ACTIVITY_CATEGORIES.find(c => c.id === selectedCategory);
      if (category) {
        const activityTypes = category.activities as ActivityType[];
        const allowedRoles = status === 'active' 
          ? ['superadmin', 'admin', 'teacher', 'student', 'parent']
          : ['superadmin'];
        
        await activityVisibilityManager.bulkUpdateCategoryActivities(
          selectedCategory,
          activityTypes,
          status,
          allowedRoles,
          user.id
        );
        
        toast.success(`${category.title} kategorisi ${status === 'active' ? 'aktif' : 'pasif'} yapıldı`);
      }
    } catch (error) {
      toast.error('Toplu güncelleme başarısız oldu');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Etkinlik & Kategori Yönetimi</h3>
        <p className="text-gray-400 text-sm">
          Etkinlikleri ve kategorileri kullanıcılara açma/kapama
        </p>
      </div>

      {/* Category List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACTIVITY_CATEGORIES.map((category) => (
          <div
            key={category.id}
            className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-white">{category.title}</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkUpdate('active')}
                  disabled={isUpdating}
                  className="px-3 py-1 text-xs bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 disabled:opacity-50"
                >
                  Tümünü Aktif Et
                </button>
                <button
                  onClick={() => handleBulkUpdate('inactive')}
                  disabled={isUpdating}
                  className="px-3 py-1 text-xs bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 disabled:opacity-50"
                >
                  Tümünü Pasif Et
                </button>
              </div>
            </div>

            {/* Activities */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {category.activities.slice(0, 10).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                >
                  <span className="text-sm text-gray-300">{activity.title}</span>
                  <button
                    onClick={() => handleToggleActivity(activity.id as ActivityType, 'active')}
                    disabled={isUpdating}
                    className="px-3 py-1 text-xs bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 disabled:opacity-50"
                  >
                    Değiştir
                  </button>
                </div>
              ))}
              {category.activities.length > 10 && (
                <p className="text-xs text-gray-500">
                  ... ve {category.activities.length - 10} aktivite daha
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-sm text-purple-300">
        <p>
          <strong>Bilgi:</strong> Pasif etkinlikler öğrenci ve veli tarafından görülmez. 
          Sadece superadmin pasif etkinliklere erişebilir.
        </p>
      </div>
    </div>
  );
};

ActivityManagerPanel.displayName = 'ActivityManagerPanel';
