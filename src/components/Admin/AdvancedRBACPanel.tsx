/**
 * Advanced RBAC Management Panel
 * 
 * Ultra-customizable permission matrix UI
 * Category and activity-level access control
 * Visual role management interface
 */

import React, { useState, useEffect } from 'react';
import { rbacService, buildDefaultRBAC, RBACSettings, CategoryPermission, ActivityPermission } from '../../types/rbac-advanced';
import { UserRole } from '../../types/user';
import { ActivityType } from '../../types/activity';
import { ACTIVITY_CATEGORIES } from '../../constants';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

/**
 * Advanced RBAC Matrix Component
 */
export const AdvancedRBACPanel: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToastStore();
  
  const [settings, setSettings] = useState<RBACSettings>(rbacService.getSettings());
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');
  const [activeTab, setActiveTab] = useState<'modules' | 'categories' | 'activities'>('modules');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Available roles
  const availableRoles: UserRole[] = ['superadmin', 'admin', 'teacher', 'user', 'student', 'parent'];

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Update module permission
  const updateModulePermission = (module: string, enabled: boolean) => {
    const newSettings = { ...settings };
    const roleIndex = newSettings.roles.findIndex(r => r.role === selectedRole);
    
    if (roleIndex >= 0) {
      const moduleIndex = newSettings.roles[roleIndex].modules.findIndex(m => m.module === module);
      if (moduleIndex >= 0) {
        newSettings.roles[roleIndex].modules[moduleIndex].enabled = enabled;
        setSettings(newSettings);
      }
    }
  };

  // Update category permission
  const updateCategoryPermission = (categoryId: string, enabled: boolean) => {
    const newSettings = { ...settings };
    const roleIndex = newSettings.roles.findIndex(r => r.role === selectedRole);
    
    if (roleIndex >= 0) {
      for (const module of newSettings.roles[roleIndex].modules) {
        if (module.categoryPermissions) {
          const catIndex = module.categoryPermissions.findIndex(c => c.categoryId === categoryId);
          if (catIndex >= 0) {
            module.categoryPermissions[catIndex].enabled = enabled;
            if (!enabled) {
              module.categoryPermissions[catIndex].allowedRoles = module.categoryPermissions[catIndex].allowedRoles.filter(r => r !== selectedRole);
            } else {
              if (!module.categoryPermissions[catIndex].allowedRoles.includes(selectedRole)) {
                module.categoryPermissions[catIndex].allowedRoles.push(selectedRole);
              }
            }
            setSettings(newSettings);
            break;
          }
        }
      }
    }
  };

  // Update activity permission
  const updateActivityPermission = (activityType: ActivityType, enabled: boolean) => {
    const newSettings = { ...settings };
    const roleIndex = newSettings.roles.findIndex(r => r.role === selectedRole);
    
    if (roleIndex >= 0) {
      for (const module of newSettings.roles[roleIndex].modules) {
        if (module.categoryPermissions) {
          for (const catPerm of module.categoryPermissions) {
            if (catPerm.activityOverrides) {
              const actIndex = catPerm.activityOverrides.findIndex(a => a.activityType === activityType);
              if (actIndex >= 0) {
                catPerm.activityOverrides[actIndex].enabled = enabled;
                if (!enabled) {
                  catPerm.activityOverrides[actIndex].allowedRoles = catPerm.activityOverrides[actIndex].allowedRoles.filter(r => r !== selectedRole);
                } else {
                  if (!catPerm.activityOverrides[actIndex].allowedRoles.includes(selectedRole)) {
                    catPerm.activityOverrides[actIndex].allowedRoles.push(selectedRole);
                  }
                }
                setSettings(newSettings);
                return;
              }
            }
          }
        }
      }
    }
  };

  // Save settings
  const saveSettings = async () => {
    setIsSaving(true);
    try {
      rbacService.updateSettings(settings);
      
      // TODO: Save to Firestore
      // await rbacService.saveToFirestore(settings);
      
      toast.success('RBAC ayarları başarıyla kaydedildi!');
    } catch (error) {
      toast.error('Ayarlar kaydedilirken hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    if (window.confirm('Tüm ayarları varsayılana sıfırlamak istediğinize emin misiniz?')) {
      setSettings(buildDefaultRBAC());
      toast.info('Ayarlar varsayılana sıfırlandı');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gelişmiş Erişim Kontrolü (RBAC)</h2>
          <p className="text-gray-400 text-sm mt-1">
            Modül, kategori ve aktivite bazlı ultra özelleştirilebilir izin yönetimi
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Varsayılana Sıfırla
          </button>
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Role Selector */}
      <div className="flex gap-3 flex-wrap">
        {availableRoles.map(role => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-4 py-2 rounded-lg border transition-all capitalize ${
              selectedRole === role
                ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                : 'text-gray-400 bg-gray-500/5 border-gray-500/10 hover:border-gray-500/30'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-4 py-2 rounded-lg border transition-all ${
            activeTab === 'modules'
              ? 'bg-blue-600/20 border-blue-500 text-blue-400'
              : 'text-gray-400 bg-gray-500/5 border-gray-500/10 hover:border-gray-500/30'
          }`}
        >
          MODÜL İZİNLERİ
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg border transition-all ${
            activeTab === 'categories'
              ? 'bg-green-600/20 border-green-500 text-green-400'
              : 'text-gray-400 bg-gray-500/5 border-gray-500/10 hover:border-gray-500/30'
          }`}
        >
          KATEGORİ ERİŞİMİ
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`px-4 py-2 rounded-lg border transition-all ${
            activeTab === 'activities'
              ? 'bg-orange-600/20 border-orange-500 text-orange-400'
              : 'text-gray-400 bg-gray-500/5 border-gray-500/10 hover:border-gray-500/30'
          }`}
        >
          AKTİVİTE ERİŞİMİ
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'modules' && (
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Modül İzinleri - {selectedRole}</h3>
          <div className="space-y-3">
            {settings.roles.find(r => r.role === selectedRole)?.modules.map(module => (
              <div key={module.module} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <span className="text-gray-200 capitalize">{module.module}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${module.enabled ? 'text-green-400' : 'text-red-400'}`}>
                    {module.enabled ? 'Aktif' : 'Pasif'}
                  </span>
                  <button
                    onClick={() => updateModulePermission(module.module, !module.enabled)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      module.enabled ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                        module.enabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Kategori Erişimi - {selectedRole}</h3>
          <div className="space-y-4">
            {ACTIVITY_CATEGORIES.map(category => (
              <div key={category.id} className="bg-white/5 rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center gap-3">
                    <i className={`${category.icon} text-blue-400`} />
                    <span className="text-gray-200 font-semibold">{category.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const rolePerms = settings.roles.find(r => r.role === selectedRole);
                        const hasAccess = rolePerms?.modules.some(m => 
                          m.categoryPermissions?.some(c => 
                            c.categoryId === category.id && c.enabled && c.allowedRoles.includes(selectedRole)
                          )
                        );
                        updateCategoryPermission(category.id, !hasAccess);
                      }}
                      className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                        settings.roles.find(r => r.role === selectedRole)?.modules.some(m => 
                          m.categoryPermissions?.some(c => 
                            c.categoryId === category.id && c.enabled && c.allowedRoles.includes(selectedRole)
                          )
                        )
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-red-600/20 text-red-400'
                      }`}
                    >
                      {settings.roles.find(r => r.role === selectedRole)?.modules.some(m => 
                        m.categoryPermissions?.some(c => 
                          c.categoryId === category.id && c.enabled && c.allowedRoles.includes(selectedRole)
                        )
                      ) ? 'Erişim Var' : 'Erişim Yok'}
                    </button>
                    <i className={`fas fa-chevron-down transform transition-transform ${expandedCategories.has(category.id) ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                
                {expandedCategories.has(category.id) && (
                  <div className="p-4 border-t border-white/10">
                    <p className="text-sm text-gray-400 mb-2">{category.description}</p>
                    <p className="text-xs text-gray-500">{category.activities.length} aktivite içeriyor</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Aktivite Erişimi - {selectedRole}</h3>
          <div className="space-y-6">
            {ACTIVITY_CATEGORIES.map(category => (
              <div key={category.id}>
                <h4 className="text-md font-semibold text-blue-400 mb-3 flex items-center gap-2">
                  <i className={category.icon} />
                  {category.title}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.activities.map(activity => {
                    const rolePerms = settings.roles.find(r => r.role === selectedRole);
                    const hasAccess = rolePerms?.modules.some(m =>
                      m.categoryPermissions?.some(c =>
                        c.activityOverrides?.some(a =>
                          a.activityType === activity && a.enabled && a.allowedRoles.includes(selectedRole)
                        )
                      )
                    );

                    return (
                      <div key={activity} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <span className="text-sm text-gray-300">{activity}</span>
                        <button
                          onClick={() => updateActivityPermission(activity, !hasAccess)}
                          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                            hasAccess
                              ? 'bg-green-600/20 text-green-400'
                              : 'bg-red-600/20 text-red-400'
                          }`}
                        >
                          {hasAccess ? 'Açık' : 'Kapalı'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-sm text-purple-300">
        <p>
          <strong>💡 Premium Özellik:</strong> Her rol için modül, kategori ve aktivite bazlı detaylı izinler tanımlayabilirsiniz.
          Değişiklikler Firestore'a kaydedilecektir.
        </p>
      </div>
    </div>
  );
};

AdvancedRBACPanel.displayName = 'AdvancedRBACPanel';
