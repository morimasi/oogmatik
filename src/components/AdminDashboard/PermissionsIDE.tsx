import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Save,
  Loader2,
  Check,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Layout,
  Users,
  Target,
  BookOpen,
  Activity,
  Calendar,
  Settings,
  FileText,
  Layers
} from 'lucide-react';
import { rbacService } from '../../services/rbacService';
import {
  RBACSettings,
  RolePermissions,
  PermissionModule,
  PermissionAction,
  MODULE_LABELS,
  MODULE_CATEGORIES,
  ALL_MODULES
} from '../../types/rbac-advanced';
import { UserRole } from '../../types/user';
import { useToastStore } from '../../store/useToastStore';
import { ACTIVITY_CATEGORIES } from '../../constants';
import { ActivityType } from '../../types/activity';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'central-studios': <Layout size={16} />,
  'assessment-studios': <Target size={16} />,
  'creative-studios': <Activity size={16} />,
  'tools-portals': <Settings size={16} />,
  'admin-platform': <Shield size={16} />
};

const MODULE_ICONS: Record<string, React.ReactNode> = {
  'activity-studio': <Layers size={16} />,
  'reading-studio': <BookOpen size={16} />,
  'math-studio': <Activity size={16} />,
  'sinav-studyosu': <Target size={16} />,
  'mat-sinav-studyosu': <Activity size={16} />,
  'super-turkce': <BookOpen size={16} />,
  'screening': <Target size={16} />,
  'curriculum': <Calendar size={16} />,
  'evaluation': <FileText size={16} />,
  'super-studio': <Activity size={16} />,
  'infographic-studio': <Layout size={16} />,
  'sari-kitap': <BookOpen size={16} />,
  'kelime-cumle': <BookOpen size={16} />,
  'students': <Users size={16} />,
  'messaging': <FileText size={16} />,
  'favorites': <Target size={16} />,
  'archive': <FileText size={16} />,
  'shared-materials': <Layers size={16} />,
  'activity-history': <Calendar size={16} />,
  'admin': <Shield size={16} />,
  'profile-management': <Users size={16} />,
  'appearance-settings': <Settings size={16} />,
  'platform-market': <Layers size={16} />,
  'premium-support': <Shield size={16} />,
  'about-us': <FileText size={16} />,
  'developer-tools': <Settings size={16} />
};

const VALID_ROLES: UserRole[] = ['superadmin', 'admin', 'teacher'];

/**
 * AdminPermissionsIDE — Gelişmiş RBAC Yönetim Paneli
 * Kategori gruplu, 27 modül, Türkçe etiketler, Firestore senkronize
 */
export const AdminPermissionsIDE: React.FC = () => {
  const [settings, setSettings] = useState<RBACSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>('teacher');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedModuleCategories, setExpandedModuleCategories] = useState<string[]>(['central-studios']);
  const toast = useToastStore();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      await rbacService.initialize();
      const current = rbacService.getSettings();
      setSettings(JSON.parse(JSON.stringify(current)));
    } catch {
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
    } catch {
      toast.error('Ayarlar kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const toggleAccordion = (id: string, type: 'module' | 'category' | 'module-category') => {
    if (type === 'module') {
      setExpandedModules(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else if (type === 'category') {
      setExpandedCategories(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
      setExpandedModuleCategories(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }
  };

  const updateRoleSettings = (updater: (perms: RolePermissions) => RolePermissions) => {
    if (!settings) return;
    const newRoles = settings.roles.map(r => r.role === activeRole ? updater(r) : r);
    setSettings({ ...settings, roles: newRoles });
  };

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
        if (cat.activityOverrides) {
          cat.activityOverrides.forEach(act => {
            act.enabled = cat!.enabled;
            if (act.enabled && !act.allowedRoles.includes(activeRole)) act.allowedRoles.push(activeRole);
          });
        }
      } else {
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
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">Yetki Mimarisi Yapılandırılıyor</p>
      </div>
    );
  }

  const rolePerms = settings.roles.find(r => r.role === activeRole);

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
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">Gelişmiş RBAC — 27 Modül & 5 Kategori</p>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={loadSettings}
            className="p-3.5 rounded-2xl bg-zinc-800/50 text-zinc-400 hover:text-white border border-white/5 transition-all hover:bg-zinc-800"
          >
            <Loader2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 transition-all active:scale-95 border border-white/10"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Global Değişiklikleri Uygula
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* ── Role Selector ────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-3">
          <p className="px-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Erişim Profili</p>
          {VALID_ROLES.map(role => (
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
                <span>{role === 'superadmin' ? 'Süper Admin' : role === 'admin' ? 'Admin' : 'Öğretmen'}</span>
              </div>
              {activeRole === role && <motion.div layoutId="activeRoleDot" className="w-1.5 h-1.5 rounded-full bg-white" />}
            </button>
          ))}

          <div className="mt-10 p-6 bg-amber-500/5 border border-amber-500/10 rounded-[2rem]">
            <div className="flex items-center gap-2 text-amber-500 mb-3">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Sistem Uyarısı</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-black uppercase tracking-tighter opacity-70">
              Superadmin rolü tüm modüllere varsayılan tam erişime sahiptir. Yapılan kısıtlamalar bu rolü etkilemez.
            </p>
          </div>
        </div>

        {/* ── Kategori Gruplu Modül Matrix ─────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">
          {MODULE_CATEGORIES.map(catGroup => {
            const isCatGroupExpanded = expandedModuleCategories.includes(catGroup.id);

            return (
              <div key={catGroup.id} className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] backdrop-blur-xl overflow-hidden">

                {/* Kategori Başlığı */}
                <button
                  onClick={() => toggleAccordion(catGroup.id, 'module-category')}
                  className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      {CATEGORY_ICONS[catGroup.id] || <Layout size={16} />}
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-black text-white uppercase tracking-tight">{catGroup.label}</h3>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{catGroup.modules.length} Modül</p>
                    </div>
                  </div>
                  <div className={`p-2 rounded-full transition-transform duration-300 ${isCatGroupExpanded ? 'rotate-180 bg-zinc-800 text-indigo-400' : 'text-zinc-600'}`}>
                    <ChevronDown size={14} />
                  </div>
                </button>

                {/* Modül Listesi */}
                <AnimatePresence>
                  {isCatGroupExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 space-y-3">
                        {catGroup.modules.map(moduleName => {
                          const modulePerm = rolePerms?.modules.find(m => m.module === moduleName);
                          const isExpanded = expandedModules.includes(moduleName);
                          const isEnabled = modulePerm?.enabled || false;
                          const label = MODULE_LABELS[moduleName] || moduleName;

                          return (
                            <div key={moduleName} className={`rounded-[2rem] border transition-all duration-500 ${isExpanded ? 'bg-zinc-900/80 border-indigo-500/30 shadow-xl' : 'bg-transparent border-white/5 hover:border-white/10'}`}>

                              {/* Modül Satırı */}
                              <div
                                className="flex items-center justify-between p-4 cursor-pointer group"
                                onClick={() => toggleAccordion(moduleName, 'module')}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-2.5 rounded-xl transition-all ${isEnabled ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-zinc-800 text-zinc-600 border border-transparent'}`}>
                                    {MODULE_ICONS[moduleName] || <Layout size={16} />}
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{label}</h4>
                                    <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">{moduleName}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleModuleEnable(moduleName); }}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                                      isEnabled
                                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                      : 'bg-zinc-800 text-zinc-600 border border-transparent'
                                    }`}
                                  >
                                    {isEnabled ? <Check size={10} /> : <X size={10} />}
                                    {isEnabled ? 'Açık' : 'Kapalı'}
                                  </button>
                                  <div className={`p-1.5 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-zinc-800 text-indigo-400' : 'text-zinc-600'}`}>
                                    <ChevronDown size={12} />
                                  </div>
                                </div>
                              </div>

                              {/* Modül Açılır İçerik */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-6 pb-6 space-y-5">

                                      {/* Aksiyon Matrisi */}
                                      <div className="p-4 bg-black/20 rounded-3xl border border-white/5">
                                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                          <Activity size={10} className="text-amber-500" /> Modül Eylemleri
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {(['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export', 'assign'] as PermissionAction[]).map(action => {
                                            const hasAct = modulePerm?.actions.includes(action);
                                            return (
                                              <button
                                                key={action}
                                                disabled={!isEnabled}
                                                onClick={() => handleToggleAction(moduleName, action)}
                                                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                                                  hasAct
                                                  ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                                                  : 'bg-zinc-800/30 text-zinc-700 border-transparent hover:border-white/10 hover:text-zinc-500'
                                                } ${!isEnabled ? 'opacity-20 cursor-not-allowed' : ''}`}
                                              >
                                                {action === 'view' && <Eye size={9} className="inline mr-1" />}
                                                {action === 'create' && <Plus size={9} className="inline mr-1" />}
                                                {action === 'edit' && <Edit3 size={9} className="inline mr-1" />}
                                                {action === 'delete' && <Trash2 size={9} className="inline mr-1" />}
                                                {action}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      {/* Activity Studio Kategori Drill-down */}
                                      {moduleName === 'activity-studio' && (
                                        <div className="space-y-2">
                                          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                                            <ChevronDown size={10} /> Kategori & Aktivite Hiyerarşisi
                                          </p>

                                          {ACTIVITY_CATEGORIES.map(cat => {
                                            const catPerm = modulePerm?.categoryPermissions?.find(c => c.categoryId === cat.id);
                                            const isCatExpanded = expandedCategories.includes(cat.id);
                                            const isCatEnabled = catPerm?.enabled || false;

                                            return (
                                              <div key={cat.id} className={`rounded-2xl border transition-all ${isCatEnabled ? 'bg-zinc-800/30 border-white/5' : 'bg-transparent border-white/5 opacity-60'}`}>
                                                <div
                                                  className="p-3 flex items-center justify-between cursor-pointer group/cat"
                                                  onClick={() => toggleAccordion(cat.id, 'category')}
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isCatEnabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-600'}`}>
                                                      {isCatExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                                    </div>
                                                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-tight group-hover/cat:text-white transition-colors">{cat.title}</span>
                                                  </div>
                                                  <button
                                                    onClick={(e) => { e.stopPropagation(); toggleCategoryEnable(moduleName, cat.id); }}
                                                    className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border transition-all ${isCatEnabled ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-600 border-transparent'}`}
                                                  >
                                                    {isCatEnabled ? 'Açık' : 'Kapalı'}
                                                  </button>
                                                </div>

                                                <AnimatePresence>
                                                  {isCatExpanded && (
                                                    <motion.div
                                                      initial={{ height: 0, opacity: 0 }}
                                                      animate={{ height: 'auto', opacity: 1 }}
                                                      exit={{ height: 0, opacity: 0 }}
                                                      className="overflow-hidden bg-black/20 rounded-b-2xl"
                                                    >
                                                      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                        {cat.activities.map(actType => {
                                                          const actPerm = catPerm?.activityOverrides?.find(a => a.activityType === actType);
                                                          const isActEnabled = actPerm ? actPerm.enabled : isCatEnabled;

                                                          return (
                                                            <button
                                                              key={actType}
                                                              onClick={() => toggleActivityEnable(moduleName, cat.id, actType as ActivityType)}
                                                              className={`p-2 rounded-lg text-left border transition-all flex items-center gap-2 group/act ${isActEnabled ? 'bg-white/5 border-white/10 text-zinc-300 hover:bg-indigo-500/10' : 'bg-transparent border-red-500/5 text-zinc-600 opacity-40 hover:opacity-100 hover:bg-white/5'}`}
                                                            >
                                                              <div className={`w-2.5 h-2.5 rounded-full flex items-center justify-center transition-all ${isActEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                                                                {isActEnabled && <Check size={6} className="text-white" />}
                                                              </div>
                                                              <span className="text-[8px] font-bold uppercase tracking-tighter truncate flex-1 group-hover/act:text-white transition-colors">{actType.replace(/_/g, ' ')}</span>
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

AdminPermissionsIDE.displayName = 'AdminPermissionsIDE';
