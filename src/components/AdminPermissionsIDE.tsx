import React, { useState, useEffect } from 'react';
import { rbacService } from '../services/rbacService';
import { PermissionModule, PermissionAction, RBACSettings, MODULE_LABELS } from '../types/rbac-advanced';
import { UserRole } from '../types/user';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { logError } from '../utils/logger.js';

/**
 * Gelişmiş Yetki Yönetim Terminali (RBAC IDE)
 * 
 * Görsel rol tabanlı erişim kontrolü yönetimi
 * - Rol izinlerini görüntüleme ve düzenleme
 * - Modül bazlı aktivasyon
 * - Aksiyon bazlı yetki atama (Görüntüle, Düzenle, Silebilir vb.)
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
      toast.error('Yetki ayarları yüklenirken bir hata oluştu');
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
      } else {
        // Modül yoksa ekle
        rolePerms.modules.push({
            module,
            enabled: true,
            actions: ['view']
        });
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
      toast.success('Yetki matrisi başarıyla güncellendi');
    } catch (error) {
      logError('RBAC save UI error', error as any);
      toast.error('Ayarlar kaydedilemedi');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
    return (
      <div className="text-center py-20 px-6">
        <div className="max-w-md mx-auto bg-red-500/10 border border-red-500/20 rounded-3xl p-8 backdrop-blur-xl">
          <i className="fa-solid fa-shield-halved text-4xl text-red-500 mb-4"></i>
          <h2 className="text-xl font-bold text-white mb-2">Erişim Reddedildi</h2>
          <p className="text-red-400/70 text-sm">Bu panele sadece Yönetici ve Üst Yönetici erişebilir.</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-500"></i>
            <span className="text-gray-400 font-medium tracking-widest text-[10px] uppercase">Sistem Modülleri Yükleniyor...</span>
        </div>
    );
  }

  const allModules: PermissionModule[] = Object.keys(MODULE_LABELS) as PermissionModule[];

  const actionLabels: Record<PermissionAction, string> = {
      view: 'Gör',
      create: 'Ekle',
      edit: 'Düz',
      delete: 'Sil',
      manage: 'Yön',
      approve: 'Ona',
      export: 'Yaz',
      assign: 'Ata'
  };

  const roleColors: Record<UserRole, string> = {
    superadmin: 'text-red-400 bg-red-500/10 border-red-500/20',
    admin: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    teacher: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  };

  const roleLabels: Record<UserRole, string> = {
      superadmin: 'Süper Admin',
      admin: 'Yönetici',
      teacher: 'Öğretmen'
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <i className="fa-solid fa-fingerprint text-white"></i>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Erişim <span className="text-blue-500">Mimarisi</span></h2>
          </div>
          <p className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.2em] ml-1">
            Sistem genelinde rol bazlı yetkilendirme ve modül yönetimi
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 hover:scale-105 active:scale-95"
        >
          {isSaving ? 'GÜNCELLENİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET'}
        </button>
      </div>

      {/* Role Selector */}
      <div className="flex gap-4 p-2 bg-white/5 rounded-2xl border border-white/10 w-fit">
        {settings.roles.map((rolePerm) => (
          <button
            key={rolePerm.role}
            onClick={() => setSelectedRole(rolePerm.role)}
            className={`px-6 py-3 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest ${selectedRole === rolePerm.role
              ? roleColors[rolePerm.role as UserRole] + ' border-current shadow-lg'
              : 'text-gray-400 bg-transparent border-transparent hover:bg-white/5'
              }`}
          >
            {roleLabels[rolePerm.role as UserRole] || rolePerm.role.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Permissions Matrix */}
      {selectedRole && (
        <div className="bg-black/20 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-table-cells"></i>
              {roleLabels[selectedRole] || selectedRole.toUpperCase()} İzin Matrisi
            </h3>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                {allModules.length} AKTİF MODÜL
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/2">
                  <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest w-64">Sistem Modülü</th>
                  <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-24">Durum</th>
                  {Object.entries(actionLabels).map(([key, label]) => (
                    <th key={key} className="py-4 px-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allModules.map((module) => {
                  const rolePerms = settings.roles.find(r => r.role === selectedRole);
                  const modulePerm = rolePerms?.modules.find(m => m.module === module);
                  const isEnabled = modulePerm?.enabled || false;

                  return (
                    <tr key={module} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-gray-200 group-hover:text-blue-400 transition-colors">
                                {MODULE_LABELS[module]}
                            </span>
                            <span className="text-[9px] text-gray-600 font-mono tracking-tighter uppercase">{module}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => toggleModule(selectedRole, module)}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${isEnabled ? 'bg-emerald-500/20' : 'bg-gray-800'
                            }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full transition-transform ${isEnabled ? 'translate-x-6 bg-emerald-500 shadow-lg shadow-emerald-500/40' : 'translate-x-1 bg-gray-600'
                              }`}
                          />
                        </button>
                      </td>
                      {Object.keys(actionLabels).map((action) => {
                        const hasAction = modulePerm?.actions.includes(action as PermissionAction) || false;
                        return (
                          <td key={action} className="py-4 px-3 text-center">
                            <button
                              onClick={() => toggleAction(selectedRole, module, action as PermissionAction)}
                              disabled={!isEnabled}
                              className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center font-bold text-[10px] ${hasAction
                                ? isEnabled
                                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                  : 'bg-gray-800 text-gray-500 opacity-50'
                                : 'bg-transparent text-gray-700 border border-transparent hover:border-gray-500/20'
                                } ${!isEnabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110 active:scale-95'}`}
                            >
                              {hasAction ? '✓' : ''}
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

      {/* Global Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/20 backdrop-blur-3xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <i className="fa-solid fa-globe"></i> Küresel Sistem Kontrolleri
            </h3>
            <div className="space-y-4">
              {[
                  { key: 'maintenanceMode', label: 'Bakım Modu (Servis Dışı)', icon: 'fa-wrench', danger: true },
                  { key: 'aiGenerationEnabled', label: 'AI Üretim Motoru Aktif', icon: 'fa-wand-magic-sparkles', success: true },
                  { key: 'registrationEnabled', label: 'Yeni Kullanıcı Kaydı', icon: 'fa-user-plus' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-white/2 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 ${item.danger ? 'text-red-400' : item.success ? 'text-emerald-400' : 'text-blue-400'}`}>
                          <i className={`fa-solid ${item.icon}`}></i>
                      </div>
                      <span className="text-[12px] font-bold text-gray-300">{item.label}</span>
                  </div>
                  <button
                    onClick={() => {
                        if (!settings) return;
                        const updated = { ...settings };
                        (updated.globalSettings as any)[item.key] = !(updated.globalSettings as any)[item.key];
                        setSettings(updated);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${ (settings.globalSettings as any)[item.key] ? (item.danger ? 'bg-red-500/20' : 'bg-emerald-500/20') : 'bg-gray-800' }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full transition-transform ${ (settings.globalSettings as any)[item.key] ? `translate-x-6 ${item.danger ? 'bg-red-500 shadow-red-500/40' : 'bg-emerald-500 shadow-emerald-500/40'} shadow-lg` : 'translate-x-1 bg-gray-600' }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-600/5 backdrop-blur-3xl border border-blue-500/10 rounded-2xl p-8 flex flex-col justify-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center">
                  <i className="fa-solid fa-circle-info text-2xl text-blue-400"></i>
              </div>
              <div>
                  <h4 className="text-lg font-black text-white italic tracking-tight uppercase mb-2">Kurumsal <span className="text-blue-400">Yetkilendirme</span></h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                      Sistemimizde hiyerarşik 3 ana rol bulunur. <strong>Süper Admin</strong> tam denetime sahiptir. <strong>Yönetici</strong> operasyonel süreçleri yönetir. <strong>Öğretmen</strong> ise akademik stüdyoların tamamına erişebilir ancak sistem ayarlarını değiştiremez.
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
};

AdminPermissionsIDE.displayName = 'AdminPermissionsIDE';
