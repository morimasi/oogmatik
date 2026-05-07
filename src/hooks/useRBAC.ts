import { useAuthStore } from '../store/useAuthStore';
import { rbacService } from '../services/rbacService';
import { PermissionModule, PermissionAction } from '../types/rbac';

export const useRBAC = () => {
  const { user } = useAuthStore();
  const role = user?.role || 'user';

  const canAccess = (module: PermissionModule) => {
    return rbacService.canAccessModule(role, module);
  };

  const hasPermission = (module: PermissionModule, action: PermissionAction) => {
    return rbacService.hasPermission(role, module, action);
  };

  const isSuperAdmin = role === 'superadmin';
  const isAdmin = role === 'admin' || role === 'superadmin';

  return {
    canAccess,
    hasPermission,
    isSuperAdmin,
    isAdmin,
    role
  };
};
