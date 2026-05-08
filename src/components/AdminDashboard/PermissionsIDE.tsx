import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Save, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Check, 
  X, 
  AlertTriangle, 
  ChevronDown, 
  ChevronRight,
  Eye, 
  Edit3, 
  Trash2, 
  Plus,
  Zap,
  Globe,
  Layout,
  Users,
  Target
} from 'lucide-react';
import { rbacService } from '../../services/rbacService';
import { RBACSettings, RolePermissions, PermissionModule, PermissionAction, CategoryPermission, ActivityPermission } from '../../types/rbac-advanced';
import { UserRole } from '../../types/user';
import { useToastStore } from '../../store/useToastStore';
import { ACTIVITY_CATEGORIES } from '../../constants';
import { ActivityType } from '../../types/activity';

/**
 * AdminPermissionsIDE — Ultra-Stable Hierarchical RBAC Management
 * Accordion drill-down & Smart Recursive toggle support
 */
export const AdminPermissionsIDE: React.FC = () => {
  const [settings, setSettings] = useState<RBACSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>('teacher');
  const [expandedModules, setExpandedModules] = useState<string[]>(['activity-studio']);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const toast = useToastStore();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      await rbacService.initialize();
      const current = rbacService.getSettings();
      // Veri tutarlılığı için derin kopyalama
      setSettings(JSON.parse(JSON.stringify(current)));
    } catch (e) {
      toast.error('Yetki ayarları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await rbacService.saveSettings(settings);
      toast.success('Dinamik RBAC ayarları başarıyla yayınlandı. Sistem %100 senkronize edildi.');
    } catch (error) {
      toast.error('Ayarlar kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  // ── Helper Actions ────────────────────────────────────────────────
  
  const toggleAccordion = (id: string, type: 'module' | 'category') => {
    const setter = type === 'module' ? setExpandedModules : setExpandedCategories;
    setter(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const updateRoleSettings = (updater: (perms: RolePermissions) => RolePermissions) => {
    if (!settings) return;
    const newRoles = settings.roles.map(r => r.role === activeRole ? updater(r) : r);
    setSettings({ ...settings, roles: newRoles });
  };

  // ── Smart Recursive Toggles ───────────────────────────────────────

  const toggleModuleEnable = (moduleName: PermissionModule) => {
    updateRoleSettings(perms => {
      let module = perms.modules.find(m => m.module === moduleName);
      if (!module) {
        module = { module: moduleName, enabled: true, actions: ['view'] };
        perms.modules.push(module);
      } else {
        module.enabled = !module.enabled;
        if (module.enabled && module.actions.length === 0) module.actions = ['view'];
      }
      return perms;
    });
  };

  const toggleCategoryEnable = (moduleName: PermissionModule, catId: string) => {
    updateRoleSettings(perms => {
      const module = perms.modules.find(m => m.module === moduleName);
      if (!module) return perms;
      if (!module.categoryPermissions) module.categoryPermissions = [];
      
      let cat = module.categoryPermissions.find(c => c.categoryId === catId);
      const catInfo = ACTIVITY_CATEGORIES.find(c => c.id === catId);

      if (cat) {
        cat.enabled = !cat.enabled;
        // Recursive: Alt aktiviteleri senkronize et
        if (cat.activityOverrides) {
          cat.activityOverrides.forEach(act => {
            act.enabled = cat!.enabled;
            if (act.enabled && !act.allowedRoles.includes(activeRole)) act.allowedRoles.push(activeRole);
          });
        }
      } else {
        // Yeni kategori yetki objesi oluştur
        module.categoryPermissions.push({
          categoryId: catId,
          categoryTitle: catInfo?.title || catId,
          enabled: true,
          allowedRoles: [activeRole],
          activityOverrides: catInfo?.activities.map(actId => ({
            activityType: actId as ActivityType,
            enabled: true,
            allowedRoles: [activeRole]
          })) || []
        });
      }
      return perms;
    });
  };

  const toggleActivityEnable = (moduleName: PermissionModule, catId: string, actType: ActivityType) => {
    updateRoleSettings(perms => {
      const module = perms.modules.find(m => m.module === moduleName);
      if (!module) return perms;
      if (!module.categoryPermissions) module.categoryPermissions = [];

      let cat = module.categoryPermissions.find(c => c.categoryId === catId);
      if (!cat) {
        // Kategori yoksa önce kategoriyi oluştur (Pasif olarak)
        const catInfo = ACTIVITY_CATEGORIES.find(c => c.id === catId);
        cat = {
          categoryId: catId,
          categoryTitle: catInfo?.title || catId,
          enabled: true,
          allowedRoles: [activeRole],
          activityOverrides: catInfo?.activities.map(a => ({
             activityType: a as ActivityType,
             enabled: a === actType,
             allowedRoles: a === actType ? [activeRole] : []
          })) || []
        };
        module.categoryPermissions.push(cat);
      } else {
        if (!cat.activityOverrides) cat.activityOverrides = [];
        let act = cat.activityOverrides.find(a => a.activityType === actType);
        if (act) {
          act.enabled = !act.enabled;
          if (act.enabled && !act.allowedRoles.includes(activeRole)) act.allowedRoles.push(activeRole);
        } else {
          cat.activityOverrides.push({
            activityType: actType,
            enabled: true,
            allowedRoles: [activeRole]
          });
        }
      }
      return perms;
    });
  };

  const handleToggleAction = (moduleName: PermissionModule, action: PermissionAction) => {
    updateRoleSettings(perms => {
      const module = perms.modules.find(m => m.module === moduleName);
      if (module) {
        module.actions = module.actions.includes(action) 
          ? module.actions.filter(a => a !== action) 
          : [...module.actions, action];
      }
      return perms;
    });
  };

  if (loading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/10 rounded-[3rem] border border-white/5">
        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic soul-text">Yetki Mimarisi Yapılandırılıyor</p>
      </div>
    );
  }

  const rolePerms = settings.roles.find(r => r.role === activeRole);
  const modules: PermissionModule[] = [
    'activity-studio', 'reading-studio', 'math-studio', 'infographic-studio', 
    'sinav-studyosu', 'ocr', 'screening', 'students', 'reports', 'admin',
    'curriculum', 'creative-studio', 'super-studio', 'sari-kitap'
  ];

  return (
    <div className="space-y-8 pb-40 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── IDE Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/80 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-white/20 shadow-xl shadow-indigo-500/20">
            <Shield className="text-white w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Yetki <span className="text-indigo-400">IDE</span></h2>
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">Hiyerarşik RBAC & Modül Yönetimi</p>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button 
            onClick={loadSettings}
            className="p-3.5 rounded-2xl bg-zinc-800/50 text-zinc-400 hover:text-white border border-white/5 transition-all hover:bg-zinc-800"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 transition-all active:scale-95 border border-white/10"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Global Değişiklikleri Uygula
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* ── Role Selector ────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-3">
          <p className="px-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Erişim Profili</p>
          {(['superadmin', 'admin', 'teacher', 'parent', 'user', 'student'] as UserRole[]).map(role => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`w-full flex items-center justify-between px-6 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-300 border ${
                activeRole === role 
                ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 translate-x-2 border-white/20' 
                : 'bg-zinc-900/40 text-zinc-500 border-white/5 hover:bg-zinc-800/60 hover:text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users size={16} className={activeRole === role ? 'text-white' : 'text-zinc-700'} />
                <span>{role}</span>
              </div>
              {activeRole === role && <motion.div layoutId="activeRoleDot" className="w-1.5 h-1.5 rounded-full bg-white shadow-glow" />}
            </button>
          ))}

          <div className="mt-10 p-6 bg-amber-500/5 border border-amber-500/10 rounded-[2rem]">
            <div className="flex items-center gap-2 text-amber-500 mb-3">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Sistem Uyarısı</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-black uppercase tracking-tighter opacity-70">
              Superadmin rolü tüm alt modüllere default override yetkisine sahiptir. Yapılan kısıtlamalar bu rolü etkilemez.
            </p>
          </div>
        </div>

        {/* ── Hiyerarşik Matrix ─────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-4 backdrop-blur-xl">
            <div className="space-y-3">
              {modules.map(moduleName => {
                const modulePerm = rolePerms?.modules.find(m => m.module === moduleName);
                const isExpanded = expandedModules.includes(moduleName);
                const isEnabled = modulePerm?.enabled || false;

                return (
                  <div key={moduleName} className={`rounded-[2rem] border transition-all duration-500 ${isExpanded ? 'bg-zinc-900/80 border-indigo-500/30 shadow-xl' : 'bg-transparent border-white/5'}`}>
                    
                    {/* Module Row */}
                    <div 
                      className={`flex items-center justify-between p-5 cursor-pointer group`}
                      onClick={() => toggleAccordion(moduleName, 'module')}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl transition-all ${isEnabled ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-zinc-800 text-zinc-600 border border-transparent'}`}>
                          {moduleName === 'admin' ? <Shield size={18} /> : (moduleName === 'students' ? <Users size={18} /> : <Layout size={18} />)}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{moduleName.replace('-', ' ')}</h4>
                          <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Merkezi Modül</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleModuleEnable(moduleName); }}
                          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                            isEnabled 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/10' 
                            : 'bg-zinc-800 text-zinc-600 border border-transparent'
                          }`}
                        >
                          {isEnabled ? <Unlock size={12} /> : <Lock size={12} />}
                          {isEnabled ? 'ERİŞİM AÇIK' : 'ERİŞİM YOK'}
                        </button>
                        <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-zinc-800 text-indigo-400' : 'text-zinc-600'}`}>
                          <ChevronDown size={14} />
                        </div>
                      </div>
                    </div>

                    {/* Module Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-8 pb-8 pt-2 space-y-6">
                            
                            {/* Action Matrix (Global Level) */}
                            <div className="p-4 bg-black/20 rounded-3xl border border-white/5">
                              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Zap size={10} className="text-amber-500" /> Modül Eylemleri Yetkilendirmesi
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {(['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export'] as PermissionAction[]).map(action => {
                                  const hasAct = modulePerm?.actions.includes(action);
                                  return (
                                    <button
                                      key={action}
                                      disabled={!isEnabled}
                                      onClick={() => handleToggleAction(moduleName, action)}
                                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                        hasAct 
                                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-sm' 
                                        : 'bg-zinc-800/30 text-zinc-700 border-transparent hover:border-white/10 hover:text-zinc-500'
                                      } ${!isEnabled ? 'opacity-20 cursor-not-allowed' : ''}`}
                                    >
                                      {action === 'view' && <Eye size={10} className="inline mr-1.5" />}
                                      {action === 'create' && <Plus size={10} className="inline mr-1.5" />}
                                      {action === 'edit' && <Edit3 size={10} className="inline mr-1.5" />}
                                      {action === 'delete' && <Trash2 size={10} className="inline mr-1.5" />}
                                      {action}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Activity Studio Deep Drill-down */}
                            {moduleName === 'activity-studio' && (
                              <div className="space-y-3">
                                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                                  <ChevronDown size={10} /> Kategori & Aktivite Hiyerarşik Yapı
                                </p>
                                
                                {ACTIVITY_CATEGORIES.map(cat => {
                                  const catPerm = modulePerm?.categoryPermissions?.find(c => c.categoryId === cat.id);
                                  const isCatExpanded = expandedCategories.includes(cat.id);
                                  const isCatEnabled = catPerm?.enabled || false;

                                  return (
                                    <div key={cat.id} className={`rounded-3xl border transition-all ${isCatEnabled ? 'bg-zinc-800/30 border-white/5' : 'bg-transparent border-white/5 opacity-60'}`}>
                                      <div 
                                        className="p-4 flex items-center justify-between cursor-pointer group/cat"
                                        onClick={() => toggleAccordion(cat.id, 'category')}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isCatEnabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-600'}`}>
                                            {isCatExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                          </div>
                                          <span className="text-[11px] font-black text-zinc-300 uppercase tracking-tight group-hover/cat:text-white transition-colors">{cat.title}</span>
                                        </div>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); toggleCategoryEnable(moduleName, cat.id); }}
                                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${isCatEnabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-800 text-zinc-600 border-transparent hover:border-white/10'}`}
                                        >
                                          {isCatEnabled ? 'ERİŞİM VAR' : 'Kilitli'}
                                        </button>
                                      </div>

                                      {/* Activities Drill-down */}
                                      <AnimatePresence>
                                        {isCatExpanded && (
                                          <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-black/20 rounded-b-3xl"
                                          >
                                            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                              {cat.activities.map(actType => {
                                                const actPerm = catPerm?.activityOverrides?.find(a => a.activityType === actType);
                                                const isActEnabled = actPerm ? actPerm.enabled : isCatEnabled;
                                                
                                                return (
                                                  <button
                                                    key={actType}
                                                    onClick={() => toggleActivityEnable(moduleName, cat.id, actType as ActivityType)}
                                                    className={`p-3 rounded-xl text-left border transition-all flex items-center gap-3 group/actItem ${isActEnabled ? 'bg-white/5 border-white/10 text-zinc-300 hover:bg-indigo-500/10' : 'bg-transparent border-red-500/5 text-zinc-600 opacity-40 hover:opacity-100 hover:bg-white/5'}`}
                                                  >
                                                    <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-all ${isActEnabled ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40' : 'bg-zinc-700'}`}>
                                                      {isActEnabled && <Check size={8} className="text-white" />}
                                                    </div>
                                                    <span className="text-[9px] font-bold uppercase tracking-tighter truncate flex-1 group-hover/actItem:text-white transition-colors">{actType.replace(/_/g, ' ')}</span>
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

AdminPermissionsIDE.displayName = 'AdminPermissionsIDE';
