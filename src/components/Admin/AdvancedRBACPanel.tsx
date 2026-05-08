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
import { motion } from 'framer-motion';

/**
 * Advanced RBAC Matrix Component
 */
export const AdvancedRBACPanel: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToastStore();
  
  const [settings, setSettings] = useState<RBACSettings>(rbacService.getSettings());
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');
  const [activeTab, setActiveTab] = useState<'modules' | 'access'>('access');
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

  // Update category permission (Recursive - Toggles all activities within)
  const updateCategoryPermission = (categoryId: string, enabled: boolean) => {
    const newSettings = { ...settings };
    const roleIndex = newSettings.roles.findIndex(r => r.role === selectedRole);
    
    if (roleIndex >= 0) {
      for (const module of newSettings.roles[roleIndex].modules) {
        if (module.categoryPermissions) {
          const catIndex = module.categoryPermissions.findIndex(c => c.categoryId === categoryId);
          if (catIndex >= 0) {
            const catPerm = module.categoryPermissions[catIndex];
            catPerm.enabled = enabled;
            
            // Role sync
            if (!enabled) {
              catPerm.allowedRoles = catPerm.allowedRoles.filter(r => r !== selectedRole);
            } else if (!catPerm.allowedRoles.includes(selectedRole)) {
              catPerm.allowedRoles.push(selectedRole);
            }

            // Sync all activities in this category
            if (catPerm.activityOverrides) {
              catPerm.activityOverrides.forEach(act => {
                act.enabled = enabled;
                if (!enabled) {
                  act.allowedRoles = act.allowedRoles.filter(r => r !== selectedRole);
                } else if (!act.allowedRoles.includes(selectedRole)) {
                  act.allowedRoles.push(selectedRole);
                }
              });
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
          onClick={() => setActiveTab('access')}
          className={`px-6 py-2.5 rounded-xl border font-bold uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'access'
              ? 'bg-blue-600 shadow-lg shadow-blue-500/20 border-blue-400 text-white translate-y-[-2px]'
              : 'text-gray-400 bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          ERİŞİM YÖNETİMİ
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-6 py-2.5 rounded-xl border font-bold uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'modules'
              ? 'bg-purple-600 shadow-lg shadow-purple-500/20 border-purple-400 text-white translate-y-[-2px]'
              : 'text-gray-400 bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          MODÜL İZİNLERİ
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

      {activeTab === 'access' && (
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Kategori & Aktivite Matrisi — {selectedRole}</h3>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-blue-500/30">
              {ACTIVITY_CATEGORIES.length} KATEGORİ AKTİF
            </span>
          </div>

          <div className="divide-y divide-white/5">
            {ACTIVITY_CATEGORIES.map(category => {
              const rolePerms = settings.roles.find(r => r.role === selectedRole);
              const isCatEnabled = rolePerms?.modules.some(m => 
                m.categoryPermissions?.some(c => 
                  c.categoryId === category.id && c.enabled && c.allowedRoles.includes(selectedRole)
                )
              );

              // Partially enabled check
              const catPerm = rolePerms?.modules
                .flatMap(m => m.categoryPermissions || [])
                .find(c => c.categoryId === category.id);
              
              const totalActs = category.activities.length;
              const enabledActs = catPerm?.activityOverrides?.filter(a => a.enabled && a.allowedRoles.includes(selectedRole)).length || 0;
              const isPartial = enabledActs > 0 && enabledActs < totalActs;

              return (
                <div key={category.id} className="group transition-colors duration-500 hover:bg-white/[0.02]">
                  {/* Category Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleCategory(category.id)}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-500 border border-white/10 ${isCatEnabled ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-gray-500'}`}>
                        <i className={category.icon} />
                      </div>
                      <div>
                        <h4 className="text-white font-black text-base uppercase tracking-tight">{category.title}</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{enabledActs} / {totalActs} Aktivite Erişilebilir</p>
                      </div>
                      <i className={`fas fa-chevron-down ml-4 text-xs text-gray-600 transition-transform duration-300 ${expandedCategories.has(category.id) ? 'rotate-180 text-blue-400' : ''}`} />
                    </div>

                    <div className="flex items-center gap-4">
                      {isPartial && <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 anim-pulse">KISMİ ERİŞİM</span>}
                      
                      <button
                        onClick={() => updateCategoryPermission(category.id, !isCatEnabled)}
                        className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all duration-300 uppercase tracking-widest border ${
                          isCatEnabled 
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-inner' 
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        {isCatEnabled ? 'TÜMÜNÜ KAPAT' : 'TÜMÜNE İZİN VER'}
                      </button>
                    </div>
                  </div>

                  {/* Sub-activities (Drill-down) */}
                  {expandedCategories.has(category.id) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-6 pb-6 pt-2 bg-black/20"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {category.activities.map(actType => {
                          const actPerm = catPerm?.activityOverrides?.find(a => a.activityType === actType);
                          const isActEnabled = actPerm?.enabled && actPerm.allowedRoles.includes(selectedRole);

                          return (
                            <div 
                              key={actType} 
                              className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-between group/act ${
                                isActEnabled 
                                  ? 'bg-white/5 border-white/10 shadow-sm' 
                                  : 'bg-black/20 border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100'
                              }`}
                            >
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[11px] font-bold text-gray-200 tracking-tight leading-none truncate max-w-[140px]">{actType.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}</span>
                                <span className="text-[8px] text-gray-500 font-medium tracking-widest uppercase">{actType}</span>
                              </div>

                              <button
                                onClick={() => updateActivityPermission(actType, !isActEnabled)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                  isActEnabled 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                                }`}
                              >
                                <i className={`fas ${isActEnabled ? 'fa-check' : 'fa-times'} text-[10px]`} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
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
