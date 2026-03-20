import React, { useState, useCallback } from 'react';
import type { UserRoleDefinition, PermissionKey } from '../../types/admin';
import { PERMISSION_LABELS } from '../../types/admin';
import { useRBAC } from '../../hooks/useRBAC';

const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS) as PermissionKey[];

const PERMISSION_GROUPS: Record<string, PermissionKey[]> = {
  'Kullanıcılar': ['users.view', 'users.create', 'users.edit', 'users.delete'],
  'Çalışmalar': ['worksheets.view', 'worksheets.create', 'worksheets.edit', 'worksheets.delete', 'worksheets.export'],
  'Analitikler': ['analytics.view', 'analytics.export'],
  'Admin': ['admin.access', 'admin.settings', 'admin.audit'],
  'Bulut & Toplu': ['cloud.upload', 'cloud.sync', 'batch.export'],
};

export const PermissionManager: React.FC = () => {
  const { roles, grantPermission, revokePermission, exportMatrix, deleteRole } = useRBAC();
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id ?? '');
  const [showMatrix, setShowMatrix] = useState(false);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  const handleToggle = useCallback(
    (permission: PermissionKey) => {
      if (!selectedRole) return;
      if (selectedRole.permissions.includes(permission)) {
        revokePermission(selectedRoleId, permission);
      } else {
        grantPermission(selectedRoleId, permission);
      }
    },
    [selectedRole, selectedRoleId, grantPermission, revokePermission],
  );

  return (
    <section aria-label="İzin Yöneticisi" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>🔐 İzin Yöneticisi (RBAC)</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowMatrix((p) => !p)} style={btnStyle}>
            {showMatrix ? 'İzin Düzenle' : '📋 Matris Göster'}
          </button>
          <button onClick={exportMatrix} style={btnStyle}>📥 CSV İndir</button>
        </div>
      </div>

      {showMatrix ? (
        // Permission matrix view
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.78rem', minWidth: 600 }} role="grid" aria-label="İzin matrisi">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ ...thStyle, position: 'sticky', left: 0, background: '#f8fafc', zIndex: 1 }}>İzin</th>
                {roles.map((r) => <th key={r.id} style={thStyle}>{r.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {ALL_PERMISSIONS.map((perm) => (
                <tr key={perm} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ ...tdStyle, position: 'sticky', left: 0, background: '#fff', fontWeight: 500 }}>
                    {PERMISSION_LABELS[perm]}
                  </td>
                  {roles.map((r) => (
                    <td key={r.id} style={{ ...tdStyle, textAlign: 'center' }}>
                      {r.permissions.includes(perm) ? (
                        <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
                      ) : (
                        <span style={{ color: '#e2e8f0' }}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Role editor view
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16 }}>
          {/* Role list */}
          <div>
            <h3 style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 8, fontWeight: 600 }}>ROLLER</h3>
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  marginBottom: 4,
                  border: '1px solid',
                  borderColor: selectedRoleId === role.id ? '#3b82f6' : '#e2e8f0',
                  borderRadius: 8,
                  background: selectedRoleId === role.id ? '#eff6ff' : '#fff',
                  color: selectedRoleId === role.id ? '#1d4ed8' : '#374151',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: selectedRoleId === role.id ? 600 : 400,
                }}
                aria-current={selectedRoleId === role.id ? 'true' : undefined}
              >
                <div>{role.label}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{role.permissions.length} izin</div>
              </button>
            ))}
          </div>

          {/* Permission editor */}
          {selectedRole && (
            <div>
              <h3 style={{ fontSize: '0.85rem', marginBottom: 12, fontWeight: 700 }}>
                {selectedRole.label} — İzinler
              </h3>
              {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => (
                <div key={group} style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, fontWeight: 600 }}>
                    {group}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {perms.map((perm) => (
                      <label
                        key={perm}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 6, background: '#f8fafc', cursor: 'pointer', fontSize: '0.83rem' }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRole.permissions.includes(perm)}
                          onChange={() => handleToggle(perm)}
                          aria-label={PERMISSION_LABELS[perm]}
                        />
                        {PERMISSION_LABELS[perm]}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

const btnStyle: React.CSSProperties = {
  padding: '5px 10px',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  background: '#3b82f6',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '0.8rem',
};

const thStyle: React.CSSProperties = {
  padding: '8px 10px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.78rem',
  color: '#64748b',
};

const tdStyle: React.CSSProperties = {
  padding: '6px 10px',
};

PermissionManager.displayName = 'PermissionManager';
