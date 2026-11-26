import { describe, expect, it } from 'vitest';
import { STUDIO_GROUPS } from '../src/constants/studios';
import { VIEWS } from '../src/constants/views';
import { MODULE_CATEGORIES, MODULE_LABELS, buildDefaultRBAC } from '../src/types/rbac-advanced';
import type { PermissionModule } from '../src/types/rbac-advanced';

const HYBRID_MODULE: PermissionModule = 'hybrid-studio';

const studios = STUDIO_GROUPS.flatMap((group) =>
  group.items.map((item) => ({ ...item, group: group.title }))
);

const roleModules = (role: 'teacher' | 'admin' | 'superadmin') => {
  const settings = buildDefaultRBAC();
  return settings.roles.find((entry) => entry.role === role)?.modules ?? [];
};

describe('Hibrit stüdyo — platform bağlantıları', () => {
  it('stüdyo kaydında tek kez yer alır ve etiketi/ikonu doludur', () => {
    const matches = studios.filter((item) => item.id === 'hybrid-studio');
    expect(matches).toHaveLength(1);
    expect(matches[0].label.length).toBeGreaterThan(0);
    expect(matches[0].icon.startsWith('fa-')).toBe(true);
    expect(matches[0].actionType).toBe('callback');
  });

  it('görünüm kaydı ve RBAC etiketi aynı kimliği kullanır', () => {
    expect(VIEWS.HYBRID_STUDIO).toBe('hybrid-studio');
    expect(MODULE_LABELS[HYBRID_MODULE]).toContain('Hibrit');
  });

  it('yaratıcı atölye modül kategorisinde listelenir', () => {
    const creative = MODULE_CATEGORIES.find((category) => category.id === 'creative-studios');
    expect(creative?.modules).toContain(HYBRID_MODULE);
  });

  it('öğretmen ve yönetici varsayılan olarak erişebilir', () => {
    for (const role of ['teacher', 'admin', 'superadmin'] as const) {
      const permission = roleModules(role).find((entry) => entry.module === HYBRID_MODULE);
      expect(permission?.enabled).toBe(true);
      expect(permission?.actions).toContain('view');
      expect(permission?.actions).toContain('edit');
    }
  });
});
