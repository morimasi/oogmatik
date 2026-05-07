import { db } from './firebaseClient';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { RBACSettings, DEFAULT_RBAC_SETTINGS, PermissionModule, PermissionAction } from '../types/rbac';
import { UserRole } from '../types/user';
import { logError } from '../utils/logger.js';

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
      logError('RBAC initialization error:', error);
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
      logError('RBAC save error:', error);
      throw error;
    }
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
}

export const rbacService = new RBACService();
