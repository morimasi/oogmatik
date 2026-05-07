import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Save, RefreshCw, Lock, Unlock, Check, X, AlertTriangle, Eye, Edit3, Trash2, Plus } from 'lucide-react';
import { rbacService } from '../../services/rbacService';
import { RBACSettings, PermissionModule, PermissionAction, RolePermissions } from '../../types/rbac';
import { UserRole } from '../../types/user';
import { useToastStore } from '../../store/useToastStore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseClient';

export const AdminPermissionsIDE: React.FC = () => {
  const [settings, setSettings] = useState<RBACSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>('teacher');
  const toast = useToastStore();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    await rbacService.initialize();
    setSettings(JSON.parse(JSON.stringify(rbacService.getSettings())));
    setLoading(false);
  };

  const handleToggleModule = (module: PermissionModule) => {
    if (!settings) return;
    const newSettings = { ...settings };
    const rolePerms = newSettings.roles.find(r => r.role === activeRole);
    if (rolePerms) {
      const modulePerm = rolePerms.modules.find(m => m.module === module);
      if (modulePerm) {
        modulePerm.enabled = !modulePerm.enabled;
      } else {
        rolePerms.modules.push({ module, enabled: true, actions: ['view'] });
      }
      setSettings(newSettings);
    }
  };

  const handleToggleAction = (module: PermissionModule, action: PermissionAction) => {
    if (!settings) return;
    const newSettings = { ...settings };
    const rolePerms = newSettings.roles.find(r => r.role === activeRole);
    if (rolePerms) {
      const modulePerm = rolePerms.modules.find(m => m.module === module);
      if (modulePerm) {
        if (modulePerm.actions.includes(action)) {
          modulePerm.actions = modulePerm.actions.filter(a => a !== action);
        } else {
          modulePerm.actions.push(action);
        }
        setSettings(newSettings);
      }
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'rbac'), settings);
      toast.success('Yetkilendirme ayarları başarıyla kaydedildi.');
    } catch (error) {
      toast.error('Ayarlar kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Yetki Matrisi Yükleniyor</p>
      </div>
    );
  }

  const currentRolePerms = settings?.roles.find(r => r.role === activeRole);
  const modules: PermissionModule[] = [
    'activity-studio', 'reading-studio', 'math-studio', 'infographic-studio', 
    'screening', 'admin', 'curriculum', 'students', 'sinav-studyosu', 'ocr'
  ];
  const actions: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Shield className="text-indigo-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase italic">Yetki <span className="text-indigo-500">IDE</span></h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Dinamik RBAC & Modül Yönetimi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadSettings}
            className="p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Değişiklikleri Yayınla
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Role Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <p className="px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Rol Seçimi</p>
          {(['superadmin', 'admin', 'teacher', 'parent', 'user'] as UserRole[]).map(role => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeRole === role 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-2' 
                : 'bg-zinc-900/30 text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
              }`}
            >
              <span>{role}</span>
              {activeRole === role && <motion.div layoutId="activeRole" className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </button>
          ))}

          <div className="mt-8 p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase">Uyarı</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-bold">
              Superadmin rolü tüm yetkilere varsayılan olarak sahiptir ve kısıtlanamaz.
            </p>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-zinc-950/50 border border-white/5 rounded-[2.5rem] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/50">
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Modül</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Durum</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Eylemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {modules.map(module => {
                  const modulePerm = currentRolePerms?.modules.find(m => m.module === module);
                  const isEnabled = modulePerm?.enabled || false;
                  
                  return (
                    <tr key={module} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-white uppercase tracking-tight">{module.replace('-', ' ')}</span>
                          <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">ID: {module}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          disabled={activeRole === 'superadmin'}
                          onClick={() => handleToggleModule(module)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                            isEnabled 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                            : 'bg-zinc-800 text-zinc-600 border border-transparent'
                          }`}
                        >
                          {isEnabled ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {isEnabled ? 'Açık' : 'Kapalı'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {actions.map(action => {
                            const hasAct = modulePerm?.actions.includes(action) || false;
                            const isManage = action === 'manage';
                            
                            return (
                              <button
                                key={action}
                                disabled={!isEnabled || activeRole === 'superadmin'}
                                onClick={() => handleToggleAction(module, action)}
                                title={action}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                  hasAct 
                                  ? (isManage ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white') 
                                  : 'bg-transparent text-zinc-700 hover:text-zinc-500'
                                } ${!isEnabled ? 'opacity-20 cursor-not-allowed' : ''}`}
                              >
                                {action === 'view' && <Eye className="w-3.5 h-3.5" />}
                                {action === 'create' && <Plus className="w-3.5 h-3.5" />}
                                {action === 'edit' && <Edit3 className="w-3.5 h-3.5" />}
                                {action === 'delete' && <Trash2 className="w-3.5 h-3.5" />}
                                {action === 'manage' && <Shield className="w-3.5 h-3.5" />}
                                {action === 'approve' && <Check className="w-3.5 h-3.5" />}
                                {action === 'export' && <Save className="w-3.5 h-3.5" />}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
