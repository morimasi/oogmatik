import React, { useState, useEffect } from 'react';
import { rbacService } from '../services/rbacService';
import { PermissionModule, PermissionAction, RBACSettings, RolePermissions } from '../types/rbac';
import { UserRole } from '../types/user';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

/**
 * Admin Permissions IDE
 * 
 * Visual role-based access control management
 * - View/edit role permissions
 * - Enable/disable modules
 * - Grant/revoke actions
 * - Real-time preview
 */
export const AdminPermissionsIDE: React.FC = () => {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<RBACSettings | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToastStore();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const currentSettings = rbacService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      toast.error('RBAC ayarları yüklenirken hata oluştu');
    }
  };

  const toggleModule = (role: UserRole, module: PermissionModule) => {
    if (!settings) return;

    const updatedSettings = { ...settings };
    const rolePerms = updatedSettings.roles.find(r => r.role === role);
    
    if (rolePerms) {
      const modulePerm = rolePerms.modules.find(m => m.module === module);
      if (modulePerm) {
        modulePerm.enabled = !modulePerm.enabled;
      }
    }

    setSettings(updatedSettings);
  };

  const toggleAction = (
    role: UserRole,
    module: PermissionModule,
    action: PermissionAction
  ) => {
    if (!settings) return;

    const updatedSettings = { ...settings };
    const rolePerms = updatedSettings.roles.find(r => r.role === role);
    
    if (rolePerms) {
      const modulePerm = rolePerms.modules.find(m => m.module === module);
      if (modulePerm) {
        const actionIndex = modulePerm.actions.indexOf(action);
        if (actionIndex > -1) {
          modulePerm.actions.splice(actionIndex, 1);
        } else {
          modulePerm.actions.push(action);
        }
      }
    }

    setSettings(updatedSettings);
  };

  const saveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      await rbacService.saveSettings(settings);
      toast.success('RBAC ayarları başarıyla kaydedildi');
    } catch (error) {
      logError('RBAC save UI error', error as any);
      toast.error('Ayarlar kaydedilirken hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || user.role !== 'superadmin') {
    return (
      <div className="text-center py-12 text-red-400">
        <p>Bu sayfaya erişim yetkiniz yok. Sadece superadmin erişebilir.</p>
      </div>
    );
  }

  if (!settings) {
    return <div className="text-center py-12">Yükleniyor...</div>;
  }

  const modules: PermissionModule[] = [
    'activity-studio',
    'reading-studio',
    'math-studio',
    'infographic-studio',
    'screening',
    'admin',
    'curriculum',
    'students',
    'reports',
    'sinav-studyosu',
    'ocr',
  ];

  const actions: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export'];

  const roleColors: Record<UserRole, string> = {
    superadmin: 'text-red-400 bg-red-500/10 border-red-500/20',
    admin: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    teacher: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    user: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    parent: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    student: 'text-green-400 bg-green-500/10 border-green-500/20',
    editor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    guest: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">RBAC İzin Yönetimi</h2>
          <p className="text-gray-400 text-sm mt-1">
            Rol tabanlı erişim kontrolü yapılandırması
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {/* Role Selector */}
      <div className="flex gap-3">
        {settings.roles.map((rolePerm) => (
          <button
            key={rolePerm.role}
            onClick={() => setSelectedRole(rolePerm.role)}
            className={`px-4 py-2 rounded-lg border transition-all ${
              selectedRole === rolePerm.role
                ? roleColors[rolePerm.role] + ' border-current'
                : 'text-gray-400 bg-gray-500/5 border-gray-500/10 hover:border-gray-500/30'
            }`}
          >
            {rolePerm.role.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Permissions Matrix */}
      {selectedRole && (
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {selectedRole.toUpperCase()} - İzin Matrisi
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-300">Modül</th>
                  <th className="text-center py-3 px-4 text-gray-300">Aktif</th>
                  {actions.map((action) => (
                    <th key={action} className="text-center py-3 px-4 text-gray-300 capitalize">
                      {action}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map((module) => {
                  const rolePerms = settings.roles.find(r => r.role === selectedRole);
                  const modulePerm = rolePerms?.modules.find(m => m.module === module);
                  const isEnabled = modulePerm?.enabled || false;

                  return (
                    <tr key={module} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-gray-200 capitalize">
                        {module}
                      </td>
                      <td className="text-center py-3 px-4">
                        <button
                          onClick={() => toggleModule(selectedRole, module)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            isEnabled ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                              isEnabled ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      {actions.map((action) => {
                        const hasAction = modulePerm?.actions.includes(action) || false;
                        return (
                          <td key={action} className="text-center py-3 px-4">
                            <button
                              onClick={() => toggleAction(selectedRole, module, action)}
                              disabled={!isEnabled}
                              className={`w-6 h-6 rounded transition-colors ${
                                hasAction
                                  ? isEnabled
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-600 text-gray-400'
                                  : 'bg-gray-700 text-gray-500'
                              } ${!isEnabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                            >
                              {hasAction ? '✓' : '×'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Global Settings */}
      <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Global Ayarlar</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <span className="text-gray-300">Bakım Modu</span>
            <button
              className={`w-12 h-6 rounded-full ${
                settings.globalSettings.maintenanceMode ? 'bg-red-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                  settings.globalSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <span className="text-gray-300">AI Üretimi</span>
            <button
              className={`w-12 h-6 rounded-full ${
                settings.globalSettings.aiGenerationEnabled ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                  settings.globalSettings.aiGenerationEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <span className="text-gray-300">Kayıt</span>
            <button
              className={`w-12 h-6 rounded-full ${
                settings.globalSettings.registrationEnabled ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                  settings.globalSettings.registrationEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-300">
        <p>
          <strong>Bilgi:</strong> Superadmin tüm modüllere sınırsız erişime sahiptir. 
          Değişiklikler Firestore'a kaydedilecektir.
        </p>
      </div>
    </div>
  );
};

AdminPermissionsIDE.displayName = 'AdminPermissionsIDE';
