import { db } from './firebaseClient';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { RBACSettings, buildDefaultRBAC, PermissionModule, PermissionAction } from '../types/rbac-advanced';
import { UserRole } from '../types/user';
import { ActivityType } from '../types/activity';
import { logError } from '../utils/logger.js';

const DEFAULT_RBAC_SETTINGS = buildDefaultRBAC();

class RBACService {
  private settings: RBACSettings | null = null;

  async initialize(): Promise<void> {
    try {
      const docRef = doc(db, 'settings', 'rbac');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.settings = docSnap.data() as RBACSettings;
      } else {
        // İlk kurulumda varsayılan ayarları kaydet
        await setDoc(docRef, DEFAULT_RBAC_SETTINGS);
        this.settings = DEFAULT_RBAC_SETTINGS;
      }
    } catch (error) {
      logError('RBAC initialization error:', error as any);
      this.settings = DEFAULT_RBAC_SETTINGS;
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
      logError('RBAC save error:', error as any);
      throw error;
    }
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
