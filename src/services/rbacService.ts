import { db } from './firebaseClient';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { RBACSettings, buildDefaultRBAC, PermissionModule, PermissionAction, ALL_MODULES } from '../types/rbac-advanced';
import { UserRole } from '../types/user';
import { ActivityType } from '../types/activity';
import { logError, logInfo, logWarn } from '../utils/logger.js';

const DEFAULT_RBAC_SETTINGS = buildDefaultRBAC();

/**
 * Eski RBAC verisini yeni şemaya migrate eder.
 * - Tanımsız modülleri temizler
 * - Eksik modülleri varsayılan yetkilerle ekler
 * - Admin modülünü her role ekler
 */
const migrateRBACSettings = (settings: RBACSettings): RBACSettings => {
  const validModules = new Set(ALL_MODULES);
  const migrated: RBACSettings = JSON.parse(JSON.stringify(settings));

  for (const rolePerm of migrated.roles) {
    // Eski/tanımsız modülleri temizle
    rolePerm.modules = rolePerm.modules.filter(m => validModules.has(m.module));

    // Eksik modülleri varsayılan yetkilerle ekle
    const existingModules = new Set(rolePerm.modules.map(m => m.module));
    const defaults = DEFAULT_RBAC_SETTINGS.roles.find(r => r.role === rolePerm.role);

    if (defaults) {
      for (const defModule of defaults.modules) {
        if (!existingModules.has(defModule.module)) {
          rolePerm.modules.push(JSON.parse(JSON.stringify(defModule)));
        }
      }
    }

    // [Migration] Öğretmenler için Öğrenciler modülü yetkilerini güncelle/kontrol et
    if (rolePerm.role === 'teacher') {
      let studentModule = rolePerm.modules.find(m => m.module === 'students');
      if (!studentModule) {
        rolePerm.modules.push({
          module: 'students',
          enabled: true,
          actions: ['view', 'create', 'edit', 'export', 'assign']
        });
      } else {
        // Silme yetkisi hariç diğerlerini ekle/aç (Kullanıcı talebi)
        studentModule.enabled = true;
        const required = ['view', 'create', 'edit', 'export', 'assign'];
        required.forEach(act => {
          if (!studentModule!.actions.includes(act as PermissionAction)) {
            studentModule!.actions.push(act as PermissionAction);
          }
        });
        // Silme yetkisi varsa kaldır (Kullanıcı talebi: silme yetkisi verme)
        studentModule.actions = studentModule.actions.filter(a => a !== 'delete');
      }
    }

    // Admin modülü her rolde olmalı (Admin paneline giriş izni)
    if (!rolePerm.modules.some(m => m.module === 'admin')) {
      rolePerm.modules.push({
        module: 'admin' as PermissionModule,
        enabled: rolePerm.role === 'superadmin' || rolePerm.role === 'admin',
        actions: rolePerm.role === 'superadmin'
          ? ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export', 'assign']
          : rolePerm.role === 'admin'
            ? ['view', 'manage']
            : []
      });
    }
  }

  return migrated;
};

class RBACService {
  private settings: RBACSettings | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const docRef = doc(db, 'settings', 'rbac');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const loaded = docSnap.data() as RBACSettings;
        // Migration: eski şemayı yeni şemaya taşı
        this.settings = migrateRBACSettings(loaded);
        // Migration sonrası kaydet
        await setDoc(docRef, this.settings);
        logInfo('RBAC migration completed');
      } else {
        // İlk kurulumda varsayılan ayarları kaydet
        await setDoc(docRef, DEFAULT_RBAC_SETTINGS);
        this.settings = DEFAULT_RBAC_SETTINGS;
        logInfo('RBAC default settings seeded');
      }
      this.initialized = true;
    } catch (error) {
      logError('RBAC initialization error:', error as Record<string, unknown>);
      this.settings = DEFAULT_RBAC_SETTINGS;
      this.initialized = true;
    }
  }

  getSettings(): RBACSettings {
    return this.settings || DEFAULT_RBAC_SETTINGS;
  }

  async saveSettings(newSettings: RBACSettings): Promise<void> {
    try {
      const docRef = doc(db, 'settings', 'rbac');
      await setDoc(docRef, newSettings);
      this.settings = newSettings;
    } catch (error) {
      logError('RBAC save error:', error as Record<string, unknown>);
      throw error;
    }
  }

  async resetToDefaults(): Promise<void> {
    try {
      const docRef = doc(db, 'settings', 'rbac');
      await setDoc(docRef, DEFAULT_RBAC_SETTINGS);
      this.settings = DEFAULT_RBAC_SETTINGS;
      logInfo('RBAC reset to defaults');
    } catch (error) {
      logError('RBAC reset error:', error as Record<string, unknown>);
      throw error;
    }
  }

  getAllModules(): PermissionModule[] {
    return [...ALL_MODULES];
  }

  updateSettings(newSettings: RBACSettings): void {
    this.settings = newSettings;
  }

  canAccessModule(role: UserRole, module: PermissionModule): boolean {
    if (role === 'superadmin') return true;

    const rolePerms = this.getSettings().roles.find(r => r.role === role);
    if (!rolePerms) return false;

    const modulePerm = rolePerms.modules.find(m => m.module === module);
    return modulePerm ? modulePerm.enabled : false;
  }

  hasPermission(role: UserRole, module: PermissionModule, action: PermissionAction): boolean {
    if (role === 'superadmin') return true;

    const rolePerms = this.getSettings().roles.find(r => r.role === role);
    if (!rolePerms) return false;

    const modulePerm = rolePerms.modules.find(m => m.module === module);
    if (!modulePerm || !modulePerm.enabled) return false;

    return modulePerm.actions.includes(action) || modulePerm.actions.includes('manage');
  }

  canAccessCategory(role: UserRole, categoryId: string): boolean {
    if (role === 'superadmin') return true;
    const rolePerms = this.getSettings().roles.find(r => r.role === role);
    if (!rolePerms) return false;

    for (const module of rolePerms.modules) {
      if (module.categoryPermissions) {
        const catPerm = module.categoryPermissions.find(c => c.categoryId === categoryId);
        if (catPerm && catPerm.enabled && catPerm.allowedRoles.includes(role)) {
          return true;
        }
      }
    }
    return false;
  }

  canAccessActivity(role: UserRole, activityType: ActivityType): boolean {
    if (role === 'superadmin') return true;
    const rolePerms = this.getSettings().roles.find(r => r.role === role);
    if (!rolePerms) return false;

    for (const module of rolePerms.modules) {
      if (module.categoryPermissions) {
        for (const catPerm of module.categoryPermissions) {
          if (catPerm.activityOverrides) {
            const actPerm = catPerm.activityOverrides.find(a => a.activityType === activityType);
            if (actPerm && actPerm.enabled && actPerm.allowedRoles.includes(role)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }
}

export const rbacService = new RBACService();
