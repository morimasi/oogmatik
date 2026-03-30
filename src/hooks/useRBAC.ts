import { useState, useCallback } from 'react';
import type { PermissionKey, UserRoleType, UserRoleDefinition } from '../types/admin';

const DEFAULT_ROLE_PERMISSIONS: Record<UserRoleType, PermissionKey[]> = {
  admin: [
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'worksheets.view', 'worksheets.create', 'worksheets.edit', 'worksheets.delete', 'worksheets.export',
    'analytics.view', 'analytics.export',
    'admin.access', 'admin.settings', 'admin.audit',
    'cloud.upload', 'cloud.sync', 'batch.export',
  ],
  teacher: [
    'users.view',
    'worksheets.view', 'worksheets.create', 'worksheets.edit', 'worksheets.export',
    'analytics.view',
    'cloud.upload', 'cloud.sync', 'batch.export',
  ],
  student: [
    'worksheets.view', 'worksheets.create',
    'cloud.upload',
  ],
  parent: [
    'worksheets.view',
    'analytics.view',
  ],
  guest: [
    'worksheets.view',
  ],
  editor: [
    'users.view',
    'worksheets.view', 'worksheets.create', 'worksheets.edit',
  ],
  superadmin: [
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'worksheets.view', 'worksheets.create', 'worksheets.edit', 'worksheets.delete', 'worksheets.export',
    'analytics.view', 'analytics.export',
    'admin.access', 'admin.settings', 'admin.audit',
    'cloud.upload', 'cloud.sync', 'batch.export',
  ],
};

const ROLE_LABELS: Record<UserRoleType, string> = {
  admin: 'Yönetici',
  teacher: 'Öğretmen',
  student: 'Öğrenci',
  parent: 'Veli',
  guest: 'Misafir',
  editor: 'Editör',
  superadmin: 'Süper Yönetici',
};

interface UseRBACReturn {
  roles: UserRoleDefinition[];
  hasPermission: (role: UserRoleType, permission: PermissionKey) => boolean;
  getRolePermissions: (role: UserRoleType) => PermissionKey[];
  grantPermission: (roleId: string, permission: PermissionKey) => void;
  revokePermission: (roleId: string, permission: PermissionKey) => void;
  createRole: (name: UserRoleType, label: string, description: string, permissions: PermissionKey[]) => UserRoleDefinition;
  deleteRole: (id: string) => void;
  updateRole: (id: string, patch: Partial<UserRoleDefinition>) => void;
  exportMatrix: () => void;
}

function buildDefaultRoles(): UserRoleDefinition[] {
  return (Object.keys(DEFAULT_ROLE_PERMISSIONS) as UserRoleType[]).map((name, i) => ({
    id: `role-${name}`,
    name: name as UserRoleType,
    label: ROLE_LABELS[name as UserRoleType],
    permissions: [...DEFAULT_ROLE_PERMISSIONS[name as UserRoleType]],
    createdAt: new Date(Date.now() - i * 86400000 * 10).toISOString(),
  }));
}

export function useRBAC(): UseRBACReturn {
  const [roles, setRoles] = useState<UserRoleDefinition[]>(() => buildDefaultRoles());

  const hasPermission = useCallback(
    (role: UserRoleType, permission: PermissionKey): boolean => {
      const roleDef = roles.find((r) => r.name === role);
      return roleDef?.permissions.includes(permission) ?? false;
    },
    [roles],
  );

  const getRolePermissions = useCallback(
    (role: UserRoleType): PermissionKey[] => {
      const roleDef = roles.find((r) => r.name === role);
      return roleDef?.permissions ?? [];
    },
    [roles],
  );

  const grantPermission = useCallback((roleId: string, permission: PermissionKey) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId && !r.permissions.includes(permission)
          ? { ...r, permissions: [...r.permissions, permission] }
          : r,
      ),
    );
  }, []);

  const revokePermission = useCallback((roleId: string, permission: PermissionKey) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId ? { ...r, permissions: r.permissions.filter((p) => p !== permission) } : r,
      ),
    );
  }, []);

  const createRole = useCallback(
    (name: UserRoleType, label: string, description: string, permissions: PermissionKey[]): UserRoleDefinition => {
      const newRole: UserRoleDefinition = {
        id: `role-custom-${Date.now()}`,
        name,
        label,
        permissions,
        createdAt: new Date().toISOString(),
      };
      setRoles((prev) => [...prev, newRole]);
      return newRole;
    },
    [],
  );

  const deleteRole = useCallback((id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateRole = useCallback((id: string, patch: Partial<UserRoleDefinition>) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const exportMatrix = useCallback(() => {
    const allPermissions: PermissionKey[] = [
      'users.view', 'users.create', 'users.edit', 'users.delete',
      'worksheets.view', 'worksheets.create', 'worksheets.edit', 'worksheets.delete', 'worksheets.export',
      'analytics.view', 'analytics.export',
      'admin.access', 'admin.settings', 'admin.audit',
      'cloud.upload', 'cloud.sync', 'batch.export',
    ];

    const headers = ['Rol', ...allPermissions];
    const rows = roles.map((role) => [
      role.label,
      ...allPermissions.map((p) => (role.permissions.includes(p) ? '✓' : '—')),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `permissions-matrix-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [roles]);

  return {
    roles,
    hasPermission,
    getRolePermissions,
    grantPermission,
    revokePermission,
    createRole,
    deleteRole,
    updateRole,
    exportMatrix,
  };
}
